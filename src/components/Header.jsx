'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import logo from '/public/logo.png';
import { useState } from 'react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

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
                <a href="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Home</a>
                <a href="#comparsas" className={styles.navLink} onClick={() => setMenuOpen(false)}>Carnaval</a>
                <a href="#participar" className={styles.navLink} onClick={() => setMenuOpen(false)}>Participar</a>
                <Link href="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>Ingresar</Link>
            </nav>
        </header>
    );
}
