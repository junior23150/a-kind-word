import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedByRole } from "@/components/ProtectedByRole";
import { Building2, Users, BarChart3, FileSpreadsheet, Settings, Crown } from "lucide-react";

export function BusinessFeatures() {
  return (
    <ProtectedByRole requiredRole={['business', 'admin']}>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Building2 className="h-5 w-5" />
                Recursos Empresariais
              </CardTitle>
              <CardDescription>
                Funcionalidades exclusivas para planos Business e Admin
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <Building2 className="w-3 h-3 mr-1" />
              Business
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Users className="h-4 w-4" />
                Gestão de Equipe
              </h4>
              <p className="text-sm text-muted-foreground">
                Controle gastos de múltiplos usuários e departamentos
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BarChart3 className="h-4 w-4" />
                Relatórios Avançados
              </h4>
              <p className="text-sm text-muted-foreground">
                Analytics empresariais e dashboards personalizados
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <FileSpreadsheet className="h-4 w-4" />
                Exportação Empresarial
              </h4>
              <p className="text-sm text-muted-foreground">
                Relatórios contábeis e integração com sistemas ERP
              </p>
            </div>
            
            <ProtectedByRole requiredRole="admin">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Crown className="h-4 w-4" />
                  Painel Admin
                </h4>
                <p className="text-sm text-muted-foreground">
                  Controle total do sistema e usuários
                </p>
              </div>
            </ProtectedByRole>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
            <ProtectedByRole requiredRole="admin">
              <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                <Crown className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </ProtectedByRole>
          </div>
        </CardContent>
      </Card>
    </ProtectedByRole>
  );
}