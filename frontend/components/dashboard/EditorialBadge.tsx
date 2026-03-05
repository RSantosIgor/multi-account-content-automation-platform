import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function EditorialBadge() {
  return (
    <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold gap-1 text-xs">
      <Sparkles className="h-3 w-3" />
      Editorial
    </Badge>
  );
}
