'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import logo from '/public/logo.png';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const handleScroll = (e, targetId) => {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setMenuOpen(false);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Link href="/">
                    <Image src={logo} alt="Logo Carnaval" width={60} height={60} />
                </Link>
            </div>

            <button
                className={styles.toggleBtn}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
            >
                ☰
            </button>

            <nav className={`${styles.nav} ${menuOpen ? styles.showMenu : ''}`}>
                <Link href="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    Home
                </Link>

                {/* Carnaval → siempre home con hash */}
                <Link href="/#comparsas" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    Carnaval
                </Link>

                {/* Participar → si estoy en home, scroll suave, si no, Link normal */}
                {pathname === '/' ? (
                    <a
                        href="#participar"
                        className={styles.navLink}
                        onClick={(e) => handleScroll(e, 'participar')}
                    >
                        Participar
                    </a>
                ) : (
                    <Link
                        href="/#participar"
                        className={styles.navLink}
                        onClick={() => setMenuOpen(false)}
                    >
                        Participar
                    </Link>
                )}

                <Link href="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    Ingresar
                </Link>
            </nav>
        </header>
    );
}
