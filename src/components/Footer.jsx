'use client';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="text-center py-3 bg-dark text-white">
            © {year} Carnaval Chajarí. Todos los derechos reservados.
        </footer>
    );
}
