import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function getUserRole(userId: string): Promise<'admin' | 'member' | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as 'admin' | 'member';
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = await getUserRole(user.id);

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-muted-foreground">Gerencie usuários e configurações do sistema</p>
      </div>
      {children}
    </div>
  );
}
