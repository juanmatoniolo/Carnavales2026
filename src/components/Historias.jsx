'use client';

import styles from './Historias.module.css';

export default function Historias() {
    return (
        <section className={styles.historias} id="historia">
            <h2>📜 La historia del Carnaval</h2>
            <p>
                El <strong>Carnaval</strong> es una de las fiestas más antiguas del mundo.
                Sus raíces se remontan a las celebraciones de la Antigua Roma y Grecia,
                donde la gente se disfrazaba, bailaba y agradecía a los dioses por las cosechas.
            </p>

            <p>
                Con la llegada del <strong>cristianismo</strong>, se transformó en la gran fiesta previa a la Cuaresma:
                un tiempo para comer, reír, cantar y bailar antes del período de recogimiento.
            </p>

            <p>
                En el Carnaval moderno, los <strong>colores</strong> representan alegría y energía vital:
                el rojo es pasión, el verde esperanza, el amarillo la abundancia, y el azul la libertad.
                Cada comparsa adopta los suyos para mostrar su identidad.
            </p>

            <p>
                El <strong>baile</strong> es el alma del carnaval. Desde antiguas danzas de fertilidad hasta la samba,
                la batucada y la murga, el ritmo une a todos en un mismo pulso colectivo.
            </p>

            <p>
                Y claro, no puede faltar la <strong>espuma</strong>. Antes se lanzaban agua, harina o pétalos,
                símbolos de purificación y juego. Hoy, la espuma mantiene esa esencia de diversión y descontrol alegre.
            </p>

            <p>
                En resumen, el Carnaval es <strong>libertad, unión y celebración</strong>.
                Una tradición que mezcla historia, religión y cultura popular en un mismo festejo lleno de música, baile y color.
            </p>
        </section>
    );
}
