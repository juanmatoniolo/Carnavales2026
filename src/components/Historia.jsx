'use client';

import styles from './Historia.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

export default function Historia({ titulo, descripcion, color = '#000', imagenes = [] }) {
    return (
        <div className={styles.historia}>
            <h3 style={{ color }}>{titulo}</h3>
            <p>{descripcion}</p>

            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                }}
                className={styles.carousel}
            >
                {imagenes.map((src, i) => (
                    <SwiperSlide key={i}>
                        <img src={src} alt={`Imagen ${i + 1}`} className={styles.slideImg} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
