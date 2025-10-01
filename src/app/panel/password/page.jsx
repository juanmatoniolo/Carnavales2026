'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, get, update } from 'firebase/database';
import Link from 'next/link';

export default function PasswordPage() {
    const [usuario, setUsuario] = useState('');
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [hasContact, setHasContact] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);

        if (u) {
            const checkContact = async () => {
                try {
                    const snap = await get(ref(db, `usuarios/${u}/contacto`));
                    if (snap.exists()) {
                        setHasContact(true);
                    }
                } catch (err) {
                    console.error('Error verificando contacto:', err);
                } finally {
                    setLoading(false);
                }
            };
            checkContact();
        } else {
            setLoading(false);
        }
    }, []);

    const resetFeedback = () => {
        setMsg('');
        setError('');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        resetFeedback();

        if (!usuario) {
            return setError('No hay sesión activa.');
        }
        if (!currentPass.trim() || !newPass.trim() || !confirmPass.trim()) {
            return setError('Completá todos los campos.');
        }
        if (newPass !== confirmPass) {
            return setError('Las contraseñas nuevas no coinciden.');
        }

        try {
            // Traer pass actual desde Firebase
            const snap = await get(ref(db, `usuarios/${usuario}`));
            if (!snap.exists()) {
                return setError('Usuario no encontrado en la base de datos.');
            }
            const data = snap.val();

            if (data.password !== currentPass.trim()) {
                return setError('La contraseña actual es incorrecta.');
            }

            // Actualizar con la nueva (PATCH)
            await update(ref(db, `usuarios/${usuario}`), {
                password: newPass.trim(),
            });

            setMsg('Contraseña actualizada con éxito ✅');
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
        } catch (err) {
            console.error(err);
            setError('No se pudo actualizar la contraseña. Revisá conexión y permisos.');
        }
    };

    if (loading) return <p className="mt-4 text-center">Cargando...</p>;

    return (
        <div className="container py-4">
            <h3>Cambiar contraseña</h3>

            {!hasContact ? (
                <div className="alert alert-warning mt-3">
                    ⚠️ Antes de cambiar tu contraseña, primero debés completar tus datos de
                    contacto. <br />
                    <Link href="/panel/datos" className="btn btn-link p-0">
                        👉 Ir a Mis Datos
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleChangePassword} className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Contraseña actual</label>
                        <input
                            type="password"
                            className="form-control"
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Nueva contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Repetir nueva contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="col-12 text-danger">{error}</div>}
                    {msg && <div className="col-12 text-success">{msg}</div>}

                    <div className="col-12">
                        <button type="submit" className="btn btn-primary">
                            Actualizar contraseña
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
