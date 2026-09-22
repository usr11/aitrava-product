'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth';
import { shareLink } from '@/lib/share';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}

function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  if (!user) return null;
  const link = `${window.location.origin}/registro?ref=${user.referralCode}`;

  return (
    <div className="container-app max-w-2xl py-6 md:py-12">
      <p className="eyebrow text-secondary">Tu cuenta</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">{user.name}</h1>
      <p className="text-muted">{user.email}</p>

      <div className="mt-8 rounded-3xl bg-primary p-6 text-ink">
        <p className="eyebrow">Invita y viajen juntos</p>
        <h2 className="display mt-2 text-4xl">Tu código: {user.referralCode}</h2>
        <p className="mt-2 text-ink/80">Comparte tu link. Cuando tus amigos armen su primer viaje, suman al tuyo.</p>
        <button
          className="btn mt-5 w-full bg-ink text-text hover:bg-surface"
          onClick={async () => {
            if (await shareLink(link, 'Te invito a AiTrava: viajes sorpresa donde no sabes a dónde vas hasta el final ✈️', 'profile')) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }
          }}
        >
          <Icon name="share" size={18} /> {copied ? '¡Link copiado!' : 'Compartir mi link'}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <Link href="/mis-viajes" className="card flex items-center justify-between p-4">
          <span className="flex items-center gap-3"><Icon name="ticket" className="text-secondary" /> Mis viajes</span>
          <Icon name="arrow" size={18} />
        </Link>
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="card flex items-center justify-between p-4">
            <span className="flex items-center gap-3"><Icon name="chart" className="text-secondary" /> Panel de métricas</span>
            <Icon name="arrow" size={18} />
          </Link>
        )}
        <button
          onClick={() => {
            signOut();
            router.push('/');
          }}
          className="card flex w-full items-center gap-3 p-4 text-left text-muted"
        >
          <Icon name="logout" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
