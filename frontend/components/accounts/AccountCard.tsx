import Link from 'next/link';
import { ExternalLink, FileText, Newspaper } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type AccountCardData = {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  sitesCount: number;
  postsCount: number;
  isActive: boolean;
};

type AccountCardProps = {
  account: AccountCardData;
};

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function AccountCard({ account }: AccountCardProps) {
  const href = `/accounts/${account.id}`;

  return (
    <Card className="bg-card/90 hover:border-primary/40 border-white/10 transition-all hover:shadow-[0_0_0_1px_rgba(198,167,94,0.25)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={account.profileImageUrl ?? undefined} alt={account.username} />
            <AvatarFallback className="bg-primary/20 text-gold">
              {getInitials(account.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">@{account.username}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {account.displayName ?? 'Conta conectada'}
            </p>
          </div>
        </div>
        <Badge variant={account.isActive ? 'default' : 'secondary'}>
          {account.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pt-0">
        <div className="bg-muted/40 rounded-md border border-white/5 p-3">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
            <Newspaper className="h-3.5 w-3.5" />
            Sites
          </div>
          <p className="text-xl font-semibold">{account.sitesCount}</p>
        </div>
        <div className="bg-muted/40 rounded-md border border-white/5 p-3">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
            <FileText className="h-3.5 w-3.5" />
            Posts
          </div>
          <p className="text-xl font-semibold">{account.postsCount}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={href}
          className="text-gold inline-flex items-center gap-1 text-sm hover:underline"
        >
          Abrir conta
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
