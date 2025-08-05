
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';

export function SignInButton() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <Button variant="ghost" disabled>Loading...</Button>;
    }
    
    if (user) {
        return (
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        )
    }

    return <Button onClick={() => router.push('/')}>Sign in with Google</Button>;
}
