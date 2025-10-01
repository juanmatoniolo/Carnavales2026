'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import Hero from '@/components/Hero';
import Historias from '@/components/Historias'; // Historia general del Carnaval
import Participar from '@/components/Participar'; 
import Historia from '@/components/Historia'; // Para cada comparsa

export default function Home() {
  const comparsas = [
    {
      nombre: 'Ferro',
      descripcion: 'Fénix es energía pura...',
      color: 'var(--color-ferro)',
      imagenes: ['/logo.jpg', '/logo.jpg'],
    },
    {
      nombre: 'Vélez',
      descripcion: 'Sirirí representa alegría...',
      color: 'var(--color-velez)',
      imagenes: ['/logo.jpg', '/logo.jpg'],
    },
    {
      nombre: 'Primero de Mayo',
      descripcion: 'Aluminé destaca por su técnica...',
      color: 'var(--color-primero)',
      imagenes: ['/logo.jpg', '/logo.jpg'],
    },
    {
      nombre: 'San Clemente',
      descripcion: 'Amaru honra la tradición...',
      color: 'var(--color-sanclemente)',
      imagenes: ['/logo.jpg', '/logo.jpg'],
    },
  ];

  return (
    <main className={styles.main}>
      <Header />
      <Hero />

      {/* Historia general del Carnaval */}
      <Historias />

      {/* Historias de cada comparsa */}
      <section className={styles.historias}>
        <h2>🎭 Historias de nuestras comparsas</h2>
        {comparsas.map((c, i) => (
          <Historia
            key={i}
            titulo={c.nombre}
            descripcion={c.descripcion}
            color={c.color}
            imagenes={c.imagenes}
          />
        ))}
      </section>

      {/* Participar */}
      <Participar comparsas={comparsas} />

      <Footer />
    </main>
  );
}
