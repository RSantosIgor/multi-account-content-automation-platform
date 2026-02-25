import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { createClient } from '@/lib/supabase/server';

async function getUserRole(userId: string): Promise<'admin' | 'member'> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return 'member';
  }

  return data.role as 'admin' | 'member';
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userRole = user ? await getUserRole(user.id) : 'member';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only, sticky */}
      <aside className="bg-card sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r md:flex">
        <AppSidebar userRole={userRole} />
      </aside>

      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
