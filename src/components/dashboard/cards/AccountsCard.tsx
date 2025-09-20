import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BankAccount {
  id: string;
  bank_name: string;
  balance: number;
  color: string;
}

export function AccountsCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('id, bank_name, balance, color')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching accounts:', error);
      } else {
        setAccounts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Contas</CardTitle>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Total Balance */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-knumbers-green/10 to-knumbers-purple/10 rounded-lg border border-knumbers-green/20">
          <p className="text-sm text-muted-foreground">Saldo Total</p>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-knumbers-green to-knumbers-purple bg-clip-text text-transparent">
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Accounts List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando contas...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhuma conta cadastrada</div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="font-medium truncate">{account.bank_name}</span>
                </div>
                <span className="font-semibold bg-gradient-to-r from-knumbers-green to-knumbers-purple bg-clip-text text-transparent text-sm sm:text-base flex-shrink-0">
                  R$ {Number(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90 text-white shadow-md text-xs sm:text-sm"
            onClick={() => navigate('/contas?new=true')}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Adicionar Conta</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-knumbers-green/30 hover:bg-knumbers-green/5 text-xs sm:text-sm"
            onClick={() => navigate('/contas')}
          >
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ver Todas</span>
            <span className="sm:hidden">Ver</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}