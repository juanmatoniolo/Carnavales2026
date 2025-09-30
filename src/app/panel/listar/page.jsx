'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, get, remove } from 'firebase/database';

export default function ListarPage() {
    const [usuario, setUsuario] = useState('');
    const [bailarines, setBailarines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!usuario || usuario === 'root') return;
            try {
                const snapshot = await get(ref(db, `bailarines/${usuario}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const arr = Object.entries(data).map(([id, b]) => ({
                        id,
                        nombre: b.nombre || '',
                        dni: b.dni || '',
                        fechaNacimiento: b.fechaNacimiento || '',
                        createdAt: b.createdAt?.iso || '',
                    }));
                    setBailarines(arr);
                } else {
                    setBailarines([]);
                }
            } catch (err) {
                console.error('Error cargando bailarines:', err);
            } finally {
                setLoading(false);
            }
        };

        if (usuario && usuario !== 'root') {
            fetchData();
        }
    }, [usuario]);

    const handleDelete = async (id) => {
        if (!usuario) return;
        const ok = confirm('¿Seguro que deseas eliminar este bailarín?');
        if (!ok) return;

        try {
            await remove(ref(db, `bailarines/${usuario}/${id}`));
            setBailarines(bailarines.filter((b) => b.id !== id));
        } catch (err) {
            console.error('Error eliminando bailarín:', err);
        }
    };

    // 👉 Función para formatear fechas a dd/mm/yyyy
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d)) return dateStr; // fallback si no es válido
            return `${String(d.getDate()).padStart(2, '0')}/${String(
                d.getMonth() + 1
            ).padStart(2, '0')}/${d.getFullYear()}`;
        } catch {
            return dateStr;
        }
    };

    if (!usuario) return <p className="container py-4">Cargando usuario...</p>;

    if (usuario === 'root') {
        return (
            <div className="container py-4">
                <p>
                    El usuario <b>root</b> no carga bailarines. Ingresá con un club.
                </p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h3 className="mb-3">Bailarines de {usuario}</h3>

            {loading ? (
                <p>Cargando...</p>
            ) : bailarines.length === 0 ? (
                <p>No hay bailarines cargados.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre</th>
                                <th>DNI</th>
                                <th>Fecha de Nacimiento</th>
                                <th>Fecha de Carga</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {bailarines.map((b) => (
                                <tr key={b.id}>
                                    <td>{b.nombre}</td>
                                    <td>{b.dni}</td>
                                    <td>{formatDate(b.fechaNacimiento)}</td>
                                    <td>
                                        {b.createdAt
                                            ? new Date(b.createdAt).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Eliminar
                                        </button>
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
