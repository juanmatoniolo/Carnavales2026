'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, get, update } from 'firebase/database';

export default function MisDatosPage() {
    const [usuario, setUsuario] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);

        if (u) {
            // 📥 Leer datos guardados
            const fetchData = async () => {
                try {
                    const snap = await get(ref(db, `usuarios/${u}/contacto`));
                    if (snap.exists()) {
                        const data = snap.val();
                        setNombre(data.nombre || '');
                        setTelefono(data.telefono || '');
                    }
                } catch (err) {
                    console.error('Error cargando datos:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        if (!nombre.trim() || !telefono.trim()) {
            return setError('Completá todos los campos.');
        }

        try {
            await update(ref(db, `usuarios/${usuario}/contacto`), {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
            });

            setMsg('✅ Datos guardados con éxito. Estos datos serán usados para recuperar la contraseña.');
        } catch (err) {
            console.error(err);
            setError('❌ No se pudieron guardar los datos. Revisá la conexión.');
        }
    };

    if (loading) return <p className="text-center mt-4">Cargando...</p>;

    return (
        <div className="container py-4">
            <h3>Mis Datos de Contacto</h3>
            <p className="text-muted">
                Estos datos servirán para la <strong>recuperación de tu contraseña</strong> en caso de olvido.
            </p>

            <form onSubmit={handleSave} className="row g-3">
                <div className="col-12">
                    <label className="form-label">Nombre y Apellido</label>
                    <input
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        required
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Teléfono de WhatsApp</label>
                    <input
                        type="tel"
                        className="form-control"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej: 3412345678"
                        required
                    />
                </div>

                {error && <div className="col-12 text-danger">{error}</div>}
                {msg && <div className="col-12 text-success">{msg}</div>}

                <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                        Guardar datos
                    </button>
                </div>
            </form>
        </div>
    );
}
