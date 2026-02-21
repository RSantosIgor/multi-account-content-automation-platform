import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Newspaper, FileText, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

async function getAccount(accountId: string) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/${accountId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/dashboard');
  }

  const result = await response.json();
  return result.data;
}

export default async function AccountPage({ params }: PageProps) {
  const { accountId } = await params;
  const account = await getAccount(accountId);

  const sections = [
    {
      title: 'News Sites',
      description: 'Manage news sources for article collection',
      icon: Newspaper,
      href: `/accounts/${accountId}/sites`,
      count: account.sitesCount,
      countLabel: 'sites',
    },
    {
      title: 'Timeline',
      description: 'Review AI suggestions and post history',
      icon: Clock,
      href: `/accounts/${accountId}/timeline`,
      count: account.postsCount,
      countLabel: 'posts',
    },
  ];

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Account header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={account.profileImageUrl ?? undefined} alt={account.username} />
          <AvatarFallback className="bg-primary/20 text-gold text-xl">
            {account.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">@{account.username}</h1>
            <Badge variant={account.isActive ? 'default' : 'secondary'}>
              {account.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {account.displayName && (
            <p className="text-muted-foreground mt-1">{account.displayName}</p>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/90 border-white/10">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 rounded-lg p-3">
              <Newspaper className="text-gold h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{account.sitesCount}</p>
              <p className="text-muted-foreground text-sm">News Sites</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/90 border-white/10">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 rounded-lg p-3">
              <FileText className="text-gold h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{account.postsCount}</p>
              <p className="text-muted-foreground text-sm">Posts Published</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="bg-card/90 hover:border-primary/40 h-full cursor-pointer border-white/10 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <section.icon className="text-gold h-5 w-5" />
                  </div>
                  <ArrowRight className="text-muted-foreground h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
