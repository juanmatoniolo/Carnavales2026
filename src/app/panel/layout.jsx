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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const u = localStorage.getItem('usuario') || '';
        setUsuario(u);
        setReady(true);
    }, []);

    // 🔄 cerrar menú al cambiar ruta
    useEffect(() => {
        setDropdownOpen(false);
    }, [pathname]);

    const isRoot = useMemo(() => usuario === 'root', [usuario]);
    const isActive = (href) => pathname === href;

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    if (!ready) return null;

    return (
        <ProtectedRoute>
            <header className={styles.header}>
                <div className={styles.left}>
                    <Link href="/panel" className={styles.brand}>
                        <Image
                            src={logo}
                            alt="Logo Carnaval"
                            width={44}
                            height={44}
                        />
                        <span className="ms-2 fw-bold">Carnaval Panel</span>
                    </Link>
                </div>

                <div className={styles.right}>
                    <div
                        className={styles.profile}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <Image
                            src={`/${usuario !== 'root' ? usuario : 'admin'}.webp`}
                            alt={usuario}
                            width={36}
                            height={36}
                            className={styles.avatar}
                        />
                        <span className={styles.username}>
                            {usuario === 'root' ? 'Administrador' : usuario}
                        </span>
                    </div>

                    {dropdownOpen && (
                        <div className={styles.dropdown}>
                            <Link
                                href="/panel"
                                className={`${styles.dropdownItem} ${isActive('/panel') ? styles.active : ''}`}
                            >
                                Home
                            </Link>
                            <Link
                                href="/panel/listar"
                                className={`${styles.dropdownItem} ${isActive('/panel/listar') ? styles.active : ''}`}
                            >
                                Mi lista
                            </Link>
                            <Link
                                href="/panel/agregar"
                                className={`${styles.dropdownItem} ${isActive('/panel/agregar') ? styles.active : ''}`}
                            >
                                Agregar
                            </Link>

                            <div className={styles.dropdownDivider}></div>
                            <div className={styles.dropdownGroup}>
                                <span className={styles.dropdownLabel}>⚙️ Settings</span>
                                <Link
                                    href="/panel/datos"
                                    className={`${styles.dropdownItem} ${isActive('/panel/datos') ? styles.active : ''}`}
                                >
                                    Mis datos
                                </Link>
                                <Link
                                    href="/panel/password"
                                    className={`${styles.dropdownItem} ${isActive('/panel/password') ? styles.active : ''}`}
                                >
                                    Cambiar contraseña
                                </Link>
                            </div>

                            {/* Solo para root */}
                            {usuario === 'root' && (
                                <>
                                    <div className={styles.dropdownDivider}></div>
                                    <Link
                                        href="/panel/comparsas"
                                        className={`${styles.dropdownItem} ${isActive('/panel/comparsas') ? styles.active : ''}`}
                                    >
                                        🏆 Comparsas
                                    </Link>
                                </>
                            )}

                            <div className={styles.dropdownDivider}></div>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutBtn}
                                type="button"
                            >
                                🚪 Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className={styles.container}>
                <section>{children}</section>
            </div>
        </ProtectedRoute>
    );
}
