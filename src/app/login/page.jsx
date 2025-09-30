'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebase';
import { get, ref, query, orderByChild, equalTo } from 'firebase/database';
import Header from '@/components/Header';
import styles from './login.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const input = username.trim();

        try {

            let snapshot = await get(ref(db, `usuarios/${input}`));
            let userKey = input;
            let userData = snapshot.exists() ? snapshot.val() : null;


            if (!userData) {
                const q = query(ref(db, 'usuarios'), orderByChild('username'), equalTo(input));
                const byFieldSnap = await get(q);
                if (!byFieldSnap.exists()) {
                    setError('Usuario no encontrado');
                    return;
                }

                const entry = Object.entries(byFieldSnap.val())[0];
                userKey = entry[0];
                userData = entry[1];
            }


            if (userData.password !== password) {
                setError('Contraseña incorrecta');
                return;
            }

            localStorage.setItem('usuario', userKey);
            router.push('/panel');
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión');
        }
    };

    return (
        <>
            <Header />
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <h2 className="mb-4 text-center">Iniciar sesión</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Usuario (ej: Ferro o Fenix)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="text-danger mb-3">{error}</div>}
                        <button type="submit" className="btn btn-success w-100">Ingresar</button>
                    </form>
                </div>
            </div>
        </>
    );
}
