'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, get } from 'firebase/database';
import * as XLSX from 'xlsx';
import Image from 'next/image';

export default function PanelPage() {
    const [bailarines, setBailarines] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(ref(db, 'bailarines'));
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    const arr = [];
                    Object.entries(data).forEach(([comparsa, registros]) => {
                        Object.entries(registros).forEach(([id, b]) => {
                            arr.push({
                                id,
                                comparsa,
                                nombre: b.nombre || '',
                                dni: b.dni || '',
                                fechaNacimiento: b.fechaNacimiento || '', // <-- YYYY-MM-DD (string)
                                createdAt: b.createdAt?.epoch || null,    // <-- epoch (number)
                            });
                        });
                    });

                    setBailarines(arr);
                }
            } catch (err) {
                console.error('Error cargando bailarines:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 🎨 Colores por comparsa
    const comparsaStyles = {
        Ferro: { fontWeight: 'bold', color: '#1c6a1f' },
        Velez: { fontWeight: 'bold', color: '#03a9f4' },
        Primero: { fontWeight: 'bold', color: '#9c27b0' },
        Sanclemente: { fontWeight: 'bold', color: '#d9cc3a' },
    };

    // 📅 FECHA DE NACIMIENTO (string YYYY-MM-DD -> DD/MM/YYYY) SIN Date()
    const formatYMD = (ymd) => {
        if (!ymd || typeof ymd !== 'string') return '-';
        const [y, m, d] = ymd.split('-');
        if (!y || !m || !d) return '-';
        // chequeo básico de longitud/números
        if (y.length !== 4) return '-';
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    };

    // 📅 Para epoch (createdAt) sí usamos Date local
    const formatDate = (epoch) => {
        if (!epoch) return '-';
        const d = new Date(epoch);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // ⏰ Formatear hora HH:mm
    const formatTime = (epoch) => {
        if (!epoch) return '';
        const d = new Date(epoch);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // 🔍 Filtro dinámico (busca por bruto y formateado)
    const bailarinesFiltrados = bailarines.filter((b) => {
        const q = filtro.toLowerCase();
        const fechaFormateada = formatYMD(b.fechaNacimiento);
        return (
            b.nombre.toLowerCase().includes(q) ||
            b.dni.includes(q) ||
            (b.fechaNacimiento && b.fechaNacimiento.includes(q)) || // YYYY-MM-DD
            (fechaFormateada !== '-' && fechaFormateada.includes(q)) // DD/MM/YYYY
        );
    });

    // 📤 Exportar a Excel (usa formatYMD para nacimiento)
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            bailarines.map((b) => ({
                Nombre: b.nombre,
                DNI: b.dni,
                'Fecha Nacimiento': formatYMD(b.fechaNacimiento), // ✅ sin Date()
                Comparsa: b.comparsa,
                'Fecha de Carga': b.createdAt
                    ? `${formatDate(b.createdAt)} ${formatTime(b.createdAt)}`
                    : '-',
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bailarines');
        XLSX.writeFile(wb, 'bailarines.xlsx');
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h3 className="m-0">Listado de Bailarines</h3>
                <button className="btn btn-success btn-sm" onClick={exportToExcel}>
                    Descargar Excel
                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, DNI o fecha de nacimiento"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : bailarinesFiltrados.length === 0 ? (
                <p>No se encontraron bailarines.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre</th>
                                <th>DNI</th>
                                <th>Fecha de Nacimiento</th>
                                <th>Comparsa</th>
                                <th>Fecha de Carga</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bailarinesFiltrados.map((b) => (
                                <tr key={b.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{b.nombre}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{b.dni}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {formatYMD(b.fechaNacimiento) /* ✅ NADA de Date() acá */}
                                    </td>
                                    <td
                                        style={{
                                            ...comparsaStyles[b.comparsa],
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <Image
                                                src={`/${b.comparsa}.webp`}
                                                alt={b.comparsa}
                                                width={24}
                                                height={24}
                                            />
                                            {b.comparsa}
                                        </div>
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {b.createdAt
                                            ? `${formatDate(b.createdAt)} ${formatTime(b.createdAt)}`
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
