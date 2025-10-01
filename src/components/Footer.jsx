'use client';

import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import styles from './Footer.module.css';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <div className={styles.copy}>
                © {year} Carnaval Chajarí. Todos los derechos reservados.
            </div>

            <div className={styles.socials}>
                <a
                    href="https://www.instagram.com/carnavadechajari.oficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link2}
                >
                    <FaInstagram size={20} /> Instagram Oficial
                </a>
            </div>

            <div className={styles.creator}>
                Página creada por{" "}
                <a
                    href="https://wa.me/5493412275598"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                >
                    JuanmaToniolo <FaWhatsapp size={18} />
                </a>
            </div>
        </footer>
    );
}
