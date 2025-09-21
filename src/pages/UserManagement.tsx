import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, UserCheck, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProtectedByRole } from '@/components/ProtectedByRole';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InactiveUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  inactive_since: string;
  days_until_deletion: number;
}

export default function UserManagement() {
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  const fetchInactiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number, inactive_since')
        .not('inactive_since', 'is', null)
        .order('inactive_since', { ascending: true });

      if (error) throw error;

      const usersWithDeletion = data?.map(user => {
        const inactiveDate = new Date(user.inactive_since);
        const deletionDate = new Date(inactiveDate);
        deletionDate.setDate(deletionDate.getDate() + 60);
        const now = new Date();
        const daysUntilDeletion = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...user,
          days_until_deletion: daysUntilDeletion
        };
      }) || [];

      setInactiveUsers(usersWithDeletion);
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar usuários inativos'
      });
    } finally {
      setLoading(false);
    }
  };

  const reactivateUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('reactivate_user', { user_uuid: userId });
      
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Usuário reativado com sucesso'
      });
      
      await fetchInactiveUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao reativar usuário'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const runCleanup = async () => {
    setActionLoading('cleanup');
    try {
      const { data, error } = await supabase.rpc('cleanup_inactive_users');
      
      if (error) throw error;

      toast({
        title: 'Limpeza Executada',
        description: `${(data as any)?.deleted_users || 0} usuários foram excluídos`
      });
      
      await fetchInactiveUsers();
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao executar limpeza'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getDaysUntilDeletionBadge = (days: number) => {
    if (days <= 0) {
      return <Badge variant="destructive">Pronto para exclusão</Badge>;
    } else if (days <= 7) {
      return <Badge variant="destructive">{days} dias restantes</Badge>;
    } else if (days <= 30) {
      return <Badge variant="secondary">{days} dias restantes</Badge>;
    } else {
      return <Badge variant="outline">{days} dias restantes</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedByRole requiredRole="admin">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários inativos e execute limpezas automáticas
            </p>
          </div>
          <Button
            onClick={runCleanup}
            disabled={actionLoading === 'cleanup'}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {actionLoading === 'cleanup' ? 'Executando...' : 'Executar Limpeza'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos à Exclusão</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inactiveUsers.filter(u => u.days_until_deletion <= 7).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontos p/ Exclusão</CardTitle>
              <Trash2 className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inactiveUsers.filter(u => u.days_until_deletion <= 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {inactiveUsers.filter(u => u.days_until_deletion <= 0).length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Existem usuários prontos para exclusão automática. Execute a limpeza para removê-los permanentemente.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Usuários Inativos</CardTitle>
            <CardDescription>
              Usuários que foram inativados e serão excluídos automaticamente após 60 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inactiveUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum usuário inativo encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inactiveUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{user.full_name || 'Nome não informado'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                      <p className="text-xs text-muted-foreground">
                        Inativo desde: {new Date(user.inactive_since).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDaysUntilDeletionBadge(user.days_until_deletion)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reactivateUser(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {actionLoading === user.id ? 'Reativando...' : 'Reativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedByRole>
  );
}