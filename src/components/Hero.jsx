import Link from "next/link";
import styles from '../app/page.module.css';

export default function Hero() {
    return (
        <>
            <section className={styles.hero}>
                <h1 className={styles.title}>Carnavales de Chajarí</h1>
                <p className={styles.subtitle}>Una tradición llena de música, color y pasión.</p>
            </section>

            <section className={styles.fechas} id="comparsas" >
                <h2>Fechas del Carnaval 2026</h2>
                <p className={styles.subtitle}>Las siguientes fechas serán jornadas competitivas:</p>
                <ul className={styles.fechasLista}>
                    <li>🎭 Sábado 24 de enero de 2026</li>
                    <li>🎭 Sábado 31 de enero de 2026</li>
                    <li>🎭 Sábado 7 de febrero de 2026</li>
                    <li>🎭 Sábado 14 de febrero de 2026</li>
                </ul>
            </section>

            <section id="comparsas" className={styles.comparsas}>
                <h2>Comparsas participantes</h2>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <h3>Ferro</h3>
                        <p>La comparsa Fénix nace con el espíritu de renacer y brillar en cada edición del carnaval. Fundada en 2008, ha ganado múltiples premios por su energía y vestuarios impactantes.</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Vélez</h3>
                        <p>Sirirí es la comparsa con más ritmo, fundada en 2005. Destaca por sus coreografías alegres y su compromiso con la comunidad.</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Primero de Mayo</h3>
                        <p>Aluminé combina la fuerza de sus bailarines con un gran despliegue técnico. Ganadora del Carnaval 2023.</p>
                    </div>
                    <div className={styles.card}>
                        <h3>San Clemente</h3>
                        <p>Amaru es sinónimo de tradición. Fundada en 2001, mantiene viva la esencia del carnaval chajariense con cada presentación.</p>
                    </div>
                </div>
            </section>

        </>
    );
}
