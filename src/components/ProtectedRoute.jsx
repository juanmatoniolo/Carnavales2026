'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const user = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
        if (!user) {
            router.replace('/login');
        } else {
            setReady(true);
        }
    }, [router]);

    if (!ready) return null;

    return <>{children}</>;
}
