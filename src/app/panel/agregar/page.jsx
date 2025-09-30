'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, push, update } from 'firebase/database';

const CLUBS = ['Ferro', 'Velez', 'Primero', 'Sanclemente'];

export default function AgregarPage() {
    const [usuario, setUsuario] = useState('');
    const [tab, setTab] = useState('individual'); // 'individual' | 'masivo'
    const [club, setClub] = useState('');
    const [nombre, setNombre] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const [excelFile, setExcelFile] = useState(null);
    const [pasted, setPasted] = useState('');

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

    const normalizeDate = (s) => {
        const t = s.trim();
        if (!t) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
        const m1 = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m1) {
            const [_, d, m, y] = m1;
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return t;
    };

    // ================
    // Descargar plantilla Excel
    // ================
    const handleDownloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const data = [
            { nombre: 'Pérez Juan', dni: '12345678', fechaNacimiento: '21/05/1990' },
            { nombre: 'García Ana', dni: '34566789', fechaNacimiento: '01/12/1992' },
        ];
        const ws = XLSX.utils.json_to_sheet(data, {
            header: ['nombre', 'dni', 'fechaNacimiento'],
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bailarines');
        XLSX.writeFile(wb, 'plantilla_bailarines.xlsx');
    };

    // ================
    // Guardar individual
    // ================
    const handleAddOne = async (e) => {
        e.preventDefault();
        resetFeedback();

        if (!club) return setError('Seleccioná un club.');
        if (!nombre.trim() || !dni.trim() || !fechaNacimiento.trim()) {
            return setError('Completá todos los campos.');
        }

        try {
            const payload = {
                nombre: nombre.trim(),
                dni: dni.trim(),
                fechaNacimiento: normalizeDate(fechaNacimiento.trim()),
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

    // ================
    // Parsear texto pegado
    // ================
    const parsePasted = (text) => {
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        if (lines.length === 0) return [];

        const sep = lines[0].includes('\t') ? '\t' : ',';
        const first = lines[0].split(sep).map((s) => s.trim().toLowerCase());

        const hasHeader =
            first.includes('nombre') &&
            first.includes('dni') &&
            (first.includes('fecha') || first.includes('fecha_nacimiento'));

        const body = hasHeader ? lines.slice(1) : lines;

        return body
            .map((line) => {
                const cols = line.split(sep).map((s) => s.trim());
                return {
                    nombre: cols[0] || '',
                    dni: (cols[1] || '').replace(/\D/g, ''),
                    fechaNacimiento: normalizeDate(cols[2] || ''),
                };
            })
            .filter((r) => r.nombre && r.dni && r.fechaNacimiento);
    };

    // ================
    // Leer Excel
    // ================
    const readExcel = async (file) => {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

        return json
            .map((row) => ({
                nombre: String(row.nombre || '').trim(),
                dni: String(row.dni || '').replace(/\D/g, ''),
                fechaNacimiento: normalizeDate(String(row.fechaNacimiento || '').trim()),
            }))
            .filter((r) => r.nombre && r.dni && r.fechaNacimiento);
    };

    const handleBulkUpload = async (records) => {
        resetFeedback();
        if (!club) return setError('Seleccioná un club.');
        if (!records || records.length === 0) {
            return setError('No hay filas válidas para importar.');
        }

        try {
            const updates = {};
            records.forEach((r) => {
                const newRef = push(ref(db, `bailarines/${club}`));
                updates[`bailarines/${club}/${newRef.key}`] = {
                    nombre: r.nombre.trim(),
                    dni: String(r.dni).trim(),
                    fechaNacimiento: r.fechaNacimiento.trim(),
                    createdAt: stamp(),
                };
            });
            await update(ref(db), updates);

            setMsg(`Importación exitosa: ${records.length} bailarines.`);
            setExcelFile(null);
            setPasted('');
        } catch (err) {
            console.error(err);
            setError('No se pudo importar. Revisá el formato, la conexión y las reglas.');
        }
    };

    const onExcelChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setExcelFile(file);
        try {
            const rows = await readExcel(file);
            await handleBulkUpload(rows);
        } catch (err) {
            console.error(err);
            setError('No se pudo leer el Excel. Verificá que sea .xlsx y columnas válidas.');
        }
    };

    const onPasteImport = async () => {
        const rows = parsePasted(pasted);
        await handleBulkUpload(rows);
    };

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
                <div className="row g-3">
                    {/* Excel */}
                    <div className="col-12">
                        <label className="form-label">Subir Excel (.xlsx)</label>
                        <input type="file" accept=".xlsx" className="form-control" onChange={onExcelChange} />
                        <small className="text-muted">
                            Encabezados requeridos: <code>nombre</code>, <code>dni</code>,{' '}
                            <code>fechaNacimiento</code> (formato <b>dd/mm/aaaa</b>)
                        </small>
                        <div className="mt-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleDownloadTemplate}
                            >
                                Descargar plantilla Excel
                            </button>
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="col-12">
                        <label className="form-label">O pegar datos (CSV/TSV)</label>
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
                            <button onClick={onPasteImport} type="button" className="btn btn-primary">
                                Importar pegado
                            </button>
                            <button onClick={() => setPasted('')} type="button" className="btn btn-outline-secondary">
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {error && <div className="col-12 text-danger">{error}</div>}
                    {msg && <div className="col-12 text-success">{msg}</div>}
                </div>
            )}
        </div>
    );
}
