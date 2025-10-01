'use client';

import Image from 'next/image';
import styles from '@/app/page.module.css';

export default function Participar() {
    const comparsas = [
        {
            nombre: 'Fénix (Ferro)',
            emoji: '🐦',
            logo: '/Ferro.webp',
            link: 'https://wa.me/5493456000001',
            className: styles.ferro,
        },
        {
            nombre: 'Sirirí (Vélez)',
            logo: '/Velez.webp',
            link: 'https://wa.me/5493456000002',
            className: styles.velez,
        },
        {
            nombre: 'Aluminé (Primero de Mayo)',
            logo: '/Primero.webp',
            link: 'https://wa.me/5493456000003',
            className: styles.primero,
        },
        {
            nombre: 'Amarú (San Clemente)',
            logo: '/Sanclemente.webp',
            link: 'https://wa.me/5493456000004',
            className: styles.sanclemente,
        },
    ];

    return (
        <section id="participar" className={styles.participar}>
            <h2>¿Querés participar en una comparsa?</h2>
            <div className={styles.cards}>
                {comparsas.map((c, i) => (
                    <a
                        key={i}
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.cardBtn} ${c.className}`}
                    >
                        <div className={styles.cardContent}>
                            <Image
                                src={c.logo}
                                alt={c.nombre}
                                width={50}
                                height={50}
                                className={styles.logo}
                            />
                            <span>Unirme a {c.nombre}</span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
