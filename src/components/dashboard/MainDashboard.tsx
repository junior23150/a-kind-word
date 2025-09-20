import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Eye,
  BarChart3
} from "lucide-react";
import { AccountsCard } from "./cards/AccountsCard";
import { CategoryPieCard } from "./cards/CategoryPieCard";
import { CategoryGoalsCard } from "./cards/CategoryGoalsCard";
import { InsightsCard } from "./cards/InsightsCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function MainDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  
  const userName = profile?.full_name || user?.email?.split('@')[0] || "Usuário";

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial summary
  const calculateSummary = () => {
    const entradas = transactions
      .filter(t => t.transaction_type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const saidas = transactions
      .filter(t => t.transaction_type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const saldo = entradas - saidas;
    
    return { entradas, saidas, saldo };
  };

  const { entradas, saidas, saldo } = calculateSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-knumbers-green/5 via-white to-knumbers-purple/5">
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="space-y-2 px-0 sm:px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bem-vindo, <span className="font-semibold bg-gradient-to-r from-knumbers-green to-knumbers-purple bg-clip-text text-transparent">{userName}</span>!
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-0 sm:px-2">
        {/* Entradas */}
        <Card className="border-l-4 border-l-knumbers-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Entradas</CardTitle>
            <TrendingUp className="h-5 w-5 text-knumbers-success" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-knumbers-success">
              R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de receitas este mês
            </p>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="border-l-4 border-l-knumbers-danger">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Saídas</CardTitle>
            <TrendingDown className="h-5 w-5 text-knumbers-danger" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-knumbers-danger">
              R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de gastos este mês
            </p>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className={`border-l-4 ${saldo >= 0 ? 'border-l-knumbers-success' : 'border-l-knumbers-danger'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Saldo</CardTitle>
            <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-knumbers-success' : 'text-knumbers-danger'}`} />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className={`text-xl sm:text-2xl font-bold ${saldo >= 0 ? 'text-knumbers-success' : 'text-knumbers-danger'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-4 sm:space-y-6 px-0 sm:px-2">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* First Row */}
          <AccountsCard />
          <CategoryPieCard transactions={transactions} />
          
          {/* Second Row */}
          <CategoryGoalsCard transactions={transactions} />
          <InsightsCard 
            entradas={entradas} 
            saidas={saidas} 
            saldo={saldo}
            transactions={transactions}
          />
        </div>
      </div>
      </div>
    </div>
  );
}