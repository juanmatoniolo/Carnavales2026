'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './panel.module.css';
import logo from '/public/logo.png';

export default function PanelLayout({ children }) {
    const [usuario, setUsuario] = useState('');
    const [ready, setReady] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);
        setReady(true);
    }, []);

    const isRoot = useMemo(() => usuario === 'root', [usuario]);
    const isActive = (href) => pathname === href;

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        window.location.href = '/login'; // evita estados viejos en hidratación
    };

    if (!ready) return null;

    // 🎨 Estilos dinámicos por comparsa
    const comparsaStyles = {
        Ferro: { color: '#1c6a1f' },
        Velez: { color: '#03a9f4' },
        Primero: { color: '#9c27b0' },
        Sanclemente: { color: '#d9cc3a' },
        root: { color: '#000' }, // admin
    };

    return (
        <ProtectedRoute>
            {/* Header del panel */}
            <header className={styles.header}>
                <div className={styles.left}>
                    <Link href="/panel" className={styles.brand}>
                        <Image
                            src={logo}
                            alt="Logo Carnaval"
                            width={44}
                            height={44}
                        />
                        {/* Comparsa con su escudo */}
                        {usuario && usuario !== 'root' && (
                            <div
                                className="d-flex align-items-center gap-2 ms-3"
                                style={comparsaStyles[usuario] || {}}
                            >
                                <Image
                                    src={`/${usuario}.webp`}
                                    alt={usuario}
                                    width={32}
                                    height={32}
                                />
                                <span className="fw-bold">
                                    {usuario}
                                </span>
                            </div>
                        )}
                        {usuario === 'root' && (
                            <span className="ms-3 fw-bold">
                                Administrador
                            </span>
                        )}
                    </Link>
                </div>

                <nav className={styles.nav}>
                    <Link
                        href="/panel/listar"
                        className={`${styles.navLink} ${
                            isActive('/panel/listar') ? styles.active : ''
                        }`}
                    >
                        Listar
                    </Link>
                    <Link
                        href="/panel/agregar"
                        className={`${styles.navLink} ${
                            isActive('/panel/agregar') ? styles.active : ''
                        }`}
                    >
                        Agregar
                    </Link>
                </nav>

                <div className={styles.right}>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        type="button"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            {/* Contenido del panel */}
            <div className={styles.container}>
                <section>{children}</section>
            </div>
        </ProtectedRoute>
    );
}
