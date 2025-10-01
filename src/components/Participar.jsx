'use client';

import styles from '@/app/page.module.css';

export default function Participar() {
    return (
        <section id="participar" className={styles.participar}>
            <h2>¿Querés participar en una comparsa?</h2>
            <div className={styles.cards}>
                <a
                    href="https://wa.me/5493456000001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.cardBtn} ${styles.ferro}`}
                >
                    🐦 Unirme a Fénix (Ferro)
                </a>
                <a
                    href="https://wa.me/5493456000002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.cardBtn} ${styles.velez}`}
                >
                    🕊️ Unirme a Sirirí (Vélez)
                </a>
                <a
                    href="https://wa.me/5493456000003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.cardBtn} ${styles.primero}`}
                >
                    ⚡ Unirme a Aluminé (Primero de Mayo)
                </a>
                <a
                    href="https://wa.me/5493456000004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.cardBtn} ${styles.sanclemente}`}
                >
                    🐍 Unirme a Amaru (San Clemente)
                </a>
            </div>
        </section>
    );
}
