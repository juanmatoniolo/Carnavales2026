'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { ref, get } from 'firebase/database';
import Image from 'next/image';

export default function ComparsasPage() {
    const [comparsas, setComparsas] = useState([]);
    const [loading, setLoading] = useState(true);

    const CLUBS = [
        { id: 'Ferro', name: 'Ferro (Fénix)', logo: '/Ferro.webp', color: '#1c6a1f' },
        { id: 'Velez', name: 'Vélez (Sirirí)', logo: '/Velez.webp', color: '#03a9f4' },
        { id: 'Primero', name: 'Primero de Mayo (Aluminé)', logo: '/Primero.webp', color: '#9c27b0' },
        { id: 'Sanclemente', name: 'San Clemente (Amarú)', logo: '/Sanclemente.webp', color: '#d9cc3a' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snap = await get(ref(db, 'usuarios'));
                if (snap.exists()) {
                    const data = snap.val();

                    const arr = CLUBS.map((club) => {
                        const u = data[club.id] || {};
                        return {
                            ...club,
                            contacto: u.contacto || null,
                        };
                    });

                    setComparsas(arr);
                }
            } catch (err) {
                console.error('Error cargando datos de comparsas:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container py-4">
            <h3 className="mb-4">🏆 Datos de contacto de cada comparsa</h3>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="row g-4">
                    {comparsas.map((c) => (
                        <div key={c.id} className="col-md-6 col-lg-4">
                            <div
                                className="card shadow-sm h-100"
                                style={{ borderLeft: `6px solid ${c.color}` }}
                            >
                                <div className="card-body text-center">
                                    <Image
                                        src={c.logo}
                                        alt={c.name}
                                        width={64}
                                        height={64}
                                        className="mb-3"
                                    />
                                    <h5 className="card-title">{c.name}</h5>

                                    {c.contacto ? (
                                        <>
                                            <p className="mb-1">
                                                <strong>Nombre:</strong> {c.contacto.nombre}
                                            </p>
                                            <p className="mb-2">
                                                <strong>WhatsApp:</strong> {c.contacto.telefono}
                                            </p>
                                            <a
                                                href={`https://wa.me/${c.contacto.telefono.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-success"
                                            >
                                                📲 Contactar por WhatsApp
                                            </a>
                                        </>
                                    ) : (
                                        <p className="text-muted">
                                            ⚠️ Sin datos de contacto guardados.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
