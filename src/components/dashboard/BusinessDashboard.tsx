import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp,
  DollarSign
} from "lucide-react";
import { BusinessFeatures } from "./BusinessFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function BusinessDashboard() {
  const [businessData, setBusinessData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  
  const userName = profile?.full_name || user?.email?.split('@')[0] || "Usuário";

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business-specific data here when tables are available
      setBusinessData([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/10">
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-full">
        {/* Header */}
        <div className="space-y-2 px-0 sm:px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Dashboard - Meu Negócio
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bem-vindo ao dashboard empresarial, <span className="font-semibold text-blue-600">{userName}</span>!
          </p>
        </div>

        {/* Business Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-0 sm:px-2">
          {/* Total Revenue */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Receita Total</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                R$ 0,00
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receita empresarial este mês
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Usuários Ativos</CardTitle>
              <Users className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                0
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Membros da equipe ativos
              </p>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Performance</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                +0%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Crescimento este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 px-0 sm:px-2">
          {/* Business Features */}
          <BusinessFeatures />
          
          {/* Coming Soon Notice */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <BarChart3 className="h-12 w-12 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Funcionalidades Empresariais
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Este dashboard estará disponível em breve com funcionalidades específicas para empresas, 
                  incluindo gestão de equipe, relatórios avançados e integração com sistemas ERP.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Solicitar Acesso Beta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}