'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import Hero from '@/components/Hero';
import Historia from '@/components/Historia';
export default function Home() {
  const comparsas = [
    {
      nombre: 'Ferro',
      descripcion: 'Fénix es energía pura...',
      color: '#1c6a1f',
    },
    {
      nombre: 'Vélez',
      descripcion: 'Sirirí representa alegría...',
      color: '#03a9f4',
    },
    {
      nombre: 'Primero de Mayo',
      descripcion: 'Aluminé destaca por su técnica...',
      color: '#9c27b0',
    },
    {
      nombre: 'San Clemente',
      descripcion: 'Amaru honra la tradición...',
      color: '#d9cc3a',
    },
  ];

  const imagenes = [
    '/logo.jpg',
    '/logo.jpg',

    '/logo.jpg',

    '/logo.jpg',

    '/logo.jpg',

    '/logo.jpg',

    '/logo.jpg',
    '/logo.jpg',


  ];

  return (
    <main className={styles.main}>
      <Header />
      <Hero />

      <section className={styles.historias}>
        {comparsas.map((c, i) => (
          <Historia
            key={i}
            titulo={c.nombre}
            descripcion={c.descripcion}
            color={c.color}
            imagenes={imagenes}
          />
        ))}
      </section>

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


      <Footer />
    </main>
  );
}
