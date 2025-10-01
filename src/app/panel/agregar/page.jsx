'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, push, update } from 'firebase/database';

const CLUBS = ['Ferro', 'Velez', 'Primero', 'Sanclemente'];

/* ==========
   Helpers fecha
   ========== */

// YYYY-MM-DD
const YMD_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
// dd/mm/yyyy
const DMY_RE = /^(0?[1-9]|[12]\d|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](\d{4})$/;
// mm/dd/yyyy
const MDY_RE = /^(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](\d{4})$/;

const pad2 = (n) => String(n).padStart(2, '0');

// Convierte Date a YYYY-MM-DD usando **hora local** (no ISO/UTC)
const dateToYMD_Local = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// Convierte serial de Excel a YYYY-MM-DD (con UTC para consistencia del serial)
const excelSerialToYMD = (serial) => {
    const base = Date.UTC(1899, 11, 30); // Excel base
    const ms = base + serial * 86400000;
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

// Preferimos DMY por contexto es-AR
const looksLikeDMY = (s) => {
    const m = s.match(DMY_RE);
    if (!m) return false;
    const day = parseInt(m[1], 10);
    if (day > 12) return true; // inequívoco DMY
    return true; // preferencia local
};

const normalizeDate = (raw) => {
    if (raw == null) return '';

    if (raw instanceof Date && !isNaN(raw.getTime())) {
        return dateToYMD_Local(raw);
    }

    if (typeof raw === 'number' && isFinite(raw)) {
        return excelSerialToYMD(raw);
    }

    const s = String(raw).trim();
    if (!s) return '';

    if (YMD_RE.test(s)) return s;

    const dmy = s.match(DMY_RE);
    if (dmy && looksLikeDMY(s)) {
        const d = pad2(dmy[1]);
        const m = pad2(dmy[2]);
        const y = dmy[3];
        return `${y}-${m}-${d}`;
    }

    const mdy = s.match(MDY_RE);
    if (mdy && parseInt(mdy[1], 10) <= 12 && parseInt(mdy[2], 10) <= 31) {
        const m = pad2(mdy[1]);
        const d = pad2(mdy[2]);
        const y = mdy[3];
        return `${y}-${m}-${d}`;
    }

    // Último recurso: parse local, formateado local (no ISO)
    const tryDate = new Date(s);
    if (!isNaN(tryDate.getTime())) {
        return dateToYMD_Local(tryDate);
    }

    return '';
};

const isValidYMD = (s) => YMD_RE.test(s);

/* ==========
   Componente
   ========== */

export default function AgregarPage() {
    const [usuario, setUsuario] = useState('');
    const [tab, setTab] = useState('individual'); // 'individual' | 'masivo'
    const [club, setClub] = useState('');
    const [nombre, setNombre] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState(''); // input date (YYYY-MM-DD de HTML)
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const [pasted, setPasted] = useState('');
    const [previewBulk, setPreviewBulk] = useState([]);   // pegado
    const [previewExcel, setPreviewExcel] = useState([]); // excel
    const [excelFileName, setExcelFileName] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);
        setClub(u === 'root' ? '' : u);
    }, []);

    const isRoot = useMemo(() => usuario === 'root', [usuario]);
    const availableClubs = isRoot ? CLUBS : [usuario].filter(Boolean);

    const stamp = () => ({
        epoch: Date.now(),
        iso: new Date().toISOString(),
    });

    const resetFeedback = () => {
        setMsg('');
        setError('');
    };

    /* ==========
       Plantilla Excel
       ========== */
    const handleDownloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const data = [
            { nombre: 'Pérez Juan', dni: '12345678', fechaNacimiento: '21/05/1990' },
            { nombre: 'García Ana', dni: '34566789', fechaNacimiento: '01/12/1992' },
        ];
        const ws = XLSX.utils.json_to_sheet(data, { header: ['nombre', 'dni', 'fechaNacimiento'] });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bailarines');
        // Fechas como texto dd/mm/aaaa para que el usuario complete sin seriales
        XLSX.writeFile(wb, 'plantilla_bailarines.xlsx');
    };

    /* ==========
       GUARDAR INDIVIDUAL (sin previsualización)
       ========== */
    const handleAddOne = async (e) => {
        e.preventDefault();
        resetFeedback();

        if (!club) return setError('Seleccioná un club.');
        if (!nombre.trim() || !dni.trim() || !fechaNacimiento.trim()) {
            return setError('Completá todos los campos.');
        }

        // El input type="date" ya es YYYY-MM-DD; igual normalizamos por seguridad
        const ymd = normalizeDate(fechaNacimiento);
        if (!isValidYMD(ymd)) {
            return setError('Fecha inválida. Usá el selector de fecha.');
        }

        try {
            const payload = {
                nombre: nombre.trim(),
                dni: dni.trim(),
                fechaNacimiento: ymd, // se guarda texto YYYY-MM-DD (sin Date/ISO)
                createdAt: stamp(),
            };
            const listRef = ref(db, `bailarines/${club}`);
            await push(listRef, payload);

            setMsg('Bailarín agregado con éxito.');
            setNombre('');
            setDni('');
            setFechaNacimiento('');
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar. Revisá conexión y reglas de DB.');
        }
    };

    /* ==========
       PEGADO -> PREVIEW MASIVO (sin mostrar YYYY-MM-DD)
       ========== */
    const parsePastedWithDiagnostics = (text) => {
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        if (lines.length === 0) return [];

        // Detectar separador: tab, ; o ,
        const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';

        const headersRaw = lines[0].split(sep).map((s) => s.trim());
        const headers = headersRaw.map((h) => h.replace(/\s|_/g, '').toLowerCase());
        const idxNombre = headers.findIndex((h) => ['nombre', 'apellidoynombre', 'apellidonombre'].includes(h));
        const idxDni = headers.findIndex((h) => ['dni', 'documento'].includes(h));
        const idxFecha = headers.findIndex((h) => ['fechanacimiento', 'fecha', 'nacimiento', 'fechanac'].includes(h));

        const hasHeader = idxNombre !== -1 && idxDni !== -1 && idxFecha !== -1;
        const body = hasHeader ? lines.slice(1) : lines;

        return body.map((line, i) => {
            const cols = line.split(sep).map((s) => s.trim());
            const cNombre = hasHeader ? cols[idxNombre] : cols[0];
            const cDni = hasHeader ? cols[idxDni] : cols[1];
            const cFecha = hasHeader ? cols[idxFecha] : cols[2];

            const cleanNombre = String(cNombre || '').trim();
            const cleanDni = String(cDni || '').replace(/\D/g, '');
            const normalized = normalizeDate(cFecha);

            const valido = !!(cleanNombre && cleanDni && isValidYMD(normalized));
            let motivo = '';
            if (!cleanNombre) motivo = 'Falta nombre';
            else if (!cleanDni) motivo = 'Falta DNI';
            else if (!isValidYMD(normalized)) motivo = 'Fecha inválida';

            return {
                row: i + 1,
                nombre: cleanNombre,
                dni: cleanDni,
                fechaRaw: cFecha || '',
                // mantenemos la normalizada para guardar, pero NO se muestra en la tabla
                _fechaNormalizada: normalized,
                valido,
                motivo,
            };
        });
    };

    const onPastePreview = () => {
        resetFeedback();
        if (!club) return setError('Seleccioná un club antes de previsualizar.');
        const rows = parsePastedWithDiagnostics(pasted);
        setPreviewBulk(rows);
        if (rows.length === 0) setError('No se detectaron filas.');
    };

    const confirmBulk = async () => {
        resetFeedback();
        if (!club) return setError('Seleccioná un club.');
        if (!previewBulk || previewBulk.length === 0) {
            return setError('No hay filas para importar.');
        }
        const validRows = previewBulk.filter((r) => r.valido);
        if (validRows.length === 0) {
            return setError('No hay filas válidas para importar.');
        }

        try {
            const updates = {};
            validRows.forEach((r) => {
                const newRef = push(ref(db, `bailarines/${club}`));
                updates[`bailarines/${club}/${newRef.key}`] = {
                    nombre: r.nombre,
                    dni: r.dni,
                    fechaNacimiento: r._fechaNormalizada, // guardamos la normalizada (oculta en UI)
                    createdAt: stamp(),
                };
            });
            await update(ref(db), updates);

            setMsg(`Importación (pegado) exitosa: ${validRows.length} de ${previewBulk.length} filas.`);
            setPasted('');
            setPreviewBulk([]);
        } catch (err) {
            console.error(err);
            setError('No se pudo importar. Revisá el formato, la conexión y las reglas.');
        }
    };

    /* ==========
       EXCEL -> PREVIEW MASIVO (sin mostrar YYYY-MM-DD)
       ========== */
    const mapExcelRow = (row, idx) => {
        const normKeys = {};
        Object.keys(row).forEach((k) => {
            const nk = String(k).replace(/\s|_/g, '').toLowerCase();
            normKeys[nk] = row[k];
        });

        const rawNombre = normKeys['nombre'] ?? normKeys['apellidoynombre'] ?? normKeys['apellidonombre'] ?? '';
        const rawDni = normKeys['dni'] ?? normKeys['documento'] ?? '';
        const rawFecha =
            normKeys['fechanacimiento'] ?? normKeys['fecha'] ?? normKeys['nacimiento'] ?? normKeys['fechanac'] ?? '';

        const cleanNombre = String(rawNombre || '').trim();
        const cleanDni = String(rawDni || '').replace(/\D/g, '');
        const normalized = normalizeDate(rawFecha);

        const valido = !!(cleanNombre && cleanDni && isValidYMD(normalized));
        let motivo = '';
        if (!cleanNombre) motivo = 'Falta nombre';
        else if (!cleanDni) motivo = 'Falta DNI';
        else if (!isValidYMD(normalized)) motivo = 'Fecha inválida';

        return {
            row: idx + 1,
            nombre: cleanNombre,
            dni: cleanDni,
            fechaRaw: rawFecha ?? '',
            _fechaNormalizada: normalized, // se usa solo para guardar
            valido,
            motivo,
        };
    };

    const onExcelChange = async (e) => {
        resetFeedback();
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setExcelFileName(file.name);

        try {
            const XLSX = await import('xlsx');
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, { cellDates: true });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

            const rows = json.map(mapExcelRow);
            setPreviewExcel(rows);
            if (rows.length === 0) setError('El Excel no tiene filas detectables.');
        } catch (err) {
            console.error(err);
            setError('No se pudo leer el Excel. Verificá que sea .xlsx y columnas válidas.');
        }
    };

    const clearExcelPreview = () => {
        setPreviewExcel([]);
        setExcelFileName('');
    };

    const confirmExcel = async () => {
        resetFeedback();
        if (!club) return setError('Seleccioná un club.');
        if (!previewExcel || previewExcel.length === 0) {
            return setError('No hay filas para importar desde Excel.');
        }
        const validRows = previewExcel.filter((r) => r.valido);
        if (validRows.length === 0) {
            return setError('No hay filas válidas para importar.');
        }

        try {
            const updates = {};
            validRows.forEach((r) => {
                const newRef = push(ref(db, `bailarines/${club}`));
                updates[`bailarines/${club}/${newRef.key}`] = {
                    nombre: r.nombre,
                    dni: r.dni,
                    fechaNacimiento: r._fechaNormalizada, // guardamos la normalizada (oculta en UI)
                    createdAt: stamp(),
                };
            });
            await update(ref(db), updates);

            setMsg(`Importación (Excel) exitosa: ${validRows.length} de ${previewExcel.length} filas.`);
            clearExcelPreview();
        } catch (err) {
            console.error(err);
            setError('No se pudo importar. Revisá el formato, la conexión y las reglas.');
        }
    };

    /* ==========
       UI
       ========== */
    return (
        <div className="container">
            <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
                <h3 className="m-0">Agregar bailarines</h3>
                <div className="ms-auto d-flex gap-2">
                    <button
                        className={`btn btn-sm ${tab === 'individual' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTab('individual')}
                        type="button"
                    >
                        Individual
                    </button>
                    <button
                        className={`btn btn-sm ${tab === 'masivo' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTab('masivo')}
                        type="button"
                    >
                        Masivo (Excel / Pegar)
                    </button>
                </div>
            </div>

            {/* Selección de club */}
            <div className="mb-3">
                <label className="form-label fw-semibold">Club / Comparsa</label>
                <select
                    className="form-select"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    disabled={!isRoot}
                >
                    <option value="">Seleccioná...</option>
                    {availableClubs.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {tab === 'individual' ? (
                <form onSubmit={handleAddOne} className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Apellido y Nombre</label>
                        <input
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Pérez Juan"
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">DNI</label>
                        <input
                            className="form-control"
                            value={dni}
                            onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                            placeholder="12345678"
                            required
                            inputMode="numeric"
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Fecha de nacimiento</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            required
                        />
                        <small className="text-muted">
                            Se guardará como fecha sin zona horaria.
                        </small>
                    </div>

                    {error && <div className="col-12 text-danger">{error}</div>}
                    {msg && <div className="col-12 text-success">{msg}</div>}

                    <div className="col-12">
                        <button type="submit" className="btn btn-success">
                            Guardar
                        </button>
                    </div>
                </form>
            ) : (
                <div className="row g-4">
                    {/* Excel */}
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="mb-3">Subir Excel (.xlsx)</h6>
                                <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
                                    <input type="file" accept=".xlsx" className="form-control" onChange={onExcelChange} />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleDownloadTemplate}
                                    >
                                        Descargar plantilla
                                    </button>
                                </div>
                                <small className="text-muted d-block mt-2">
                                    Encabezados esperados: <code>nombre</code>, <code>dni</code>, <code>fechaNacimiento</code>.
                                    La fecha puede venir como <b>dd/mm/aaaa</b>, <b>yyyy-mm-dd</b>, fecha nativa o serial de Excel.
                                </small>

                                {excelFileName && (
                                    <div className="mt-3 small">
                                        Archivo: <b>{excelFileName}</b>
                                    </div>
                                )}

                                {previewExcel.length > 0 && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="small">
                                                Filas: <b>{previewExcel.length}</b> — Válidas:{' '}
                                                <b>{previewExcel.filter((r) => r.valido).length}</b> — Inválidas:{' '}
                                                <b className="text-danger">{previewExcel.filter((r) => !r.valido).length}</b>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={confirmExcel}
                                                    disabled={previewExcel.filter((r) => r.valido).length === 0}
                                                >
                                                    Confirmar e importar válidas
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={clearExcelPreview}>
                                                    Limpiar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-sm align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nombre</th>
                                                        <th>DNI</th>
                                                        <th>Fecha</th>{/* SOLO raw visible */}
                                                        <th>Estado</th>
                                                        <th>Motivo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewExcel.map((r) => (
                                                        <tr key={`xl-${r.row}`}>
                                                            <td>{r.row}</td>
                                                            <td>{r.nombre}</td>
                                                            <td>{r.dni}</td>
                                                            <td>{String(r.fechaRaw ?? '')}</td>
                                                            <td>
                                                                {r.valido ? (
                                                                    <span className="badge text-bg-success">Válido</span>
                                                                ) : (
                                                                    <span className="badge text-bg-danger">Inválido</span>
                                                                )}
                                                            </td>
                                                            <td className="text-muted">{r.motivo || ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pegado CSV/TSV */}
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="mb-3">Pegar datos (CSV/TSV)</h6>
                                <textarea
                                    className="form-control"
                                    rows={6}
                                    value={pasted}
                                    onChange={(e) => setPasted(e.target.value)}
                                    placeholder={`nombre,dni,fechaNacimiento
Pérez Juan,12345678,21/05/1990
García Ana,34566789,01/12/1992`}
                                />
                                <div className="mt-2 d-flex gap-2">
                                    <button onClick={onPastePreview} type="button" className="btn btn-warning">
                                        Previsualizar pegado
                                    </button>
                                    <button
                                        onClick={() => { setPasted(''); setPreviewBulk([]); }}
                                        type="button"
                                        className="btn btn-outline-secondary"
                                    >
                                        Limpiar
                                    </button>
                                </div>

                                {previewBulk.length > 0 && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="small">
                                                Filas: <b>{previewBulk.length}</b> — Válidas:{' '}
                                                <b>{previewBulk.filter((r) => r.valido).length}</b> — Inválidas:{' '}
                                                <b className="text-danger">{previewBulk.filter((r) => !r.valido).length}</b>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={confirmBulk}
                                                    disabled={previewBulk.filter((r) => r.valido).length === 0}
                                                >
                                                    Confirmar e importar válidas
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewBulk([])}>
                                                    Cancelar previsualización
                                                </button>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-sm align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nombre</th>
                                                        <th>DNI</th>
                                                        <th>Fecha</th>{/* SOLO raw visible */}
                                                        <th>Estado</th>
                                                        <th>Motivo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewBulk.map((r) => (
                                                        <tr key={`pg-${r.row}`}>
                                                            <td>{r.row}</td>
                                                            <td>{r.nombre}</td>
                                                            <td>{r.dni}</td>
                                                            <td>{r.fechaRaw || '-'}</td>
                                                            <td>
                                                                {r.valido ? (
                                                                    <span className="badge text-bg-success">Válido</span>
                                                                ) : (
                                                                    <span className="badge text-bg-danger">Inválido</span>
                                                                )}
                                                            </td>
                                                            <td className="text-muted">{r.motivo || ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="col-12 text-danger">{error}</div>}
                    {msg && <div className="col-12 text-success">{msg}</div>}
                </div>
            )}
        </div>
    );
}
