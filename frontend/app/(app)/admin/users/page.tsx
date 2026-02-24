'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string | null;
    newRole: 'admin' | 'member' | null;
  }>({ open: false, userId: null, newRole: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient<{ data: User[] }>('/api/v1/admin/users');
      setUsers(response.data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao carregar usuários';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    setConfirmDialog({ open: true, userId, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmDialog.userId || !confirmDialog.newRole) return;

    try {
      await apiClient(`/api/v1/admin/users/${confirmDialog.userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: confirmDialog.newRole }),
      });

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === confirmDialog.userId ? { ...user, role: confirmDialog.newRole! } : user,
        ),
      );

      toast.success('Função do usuário atualizada com sucesso');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar função';
      toast.error(msg);
    } finally {
      setConfirmDialog({ open: false, userId: null, newRole: null });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.display_name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Membro'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as 'admin' | 'member')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, userId: null, newRole: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de função</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar a função deste usuário para{' '}
              <strong>{confirmDialog.newRole === 'admin' ? 'Admin' : 'Membro'}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
