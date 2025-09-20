import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3 } from "lucide-react";

interface CategoryPieCardProps {
  transactions: any[];
}

// Define colors for categories
const categoryColors: { [key: string]: string } = {
  'alimentação': '#ef4444',
  'transporte': '#f97316', 
  'moradia': '#eab308',
  'educação': '#22c55e',
  'saúde': '#3b82f6',
  'lazer': '#8b5cf6',
  'vestuário': '#ec4899',
  'tecnologia': '#06b6d4',
  'serviços': '#84cc16',
  'outros': '#6b7280'
};

export function CategoryPieCard({ transactions }: CategoryPieCardProps) {
  // Process transactions to get category data
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    // Check if we have real transactions
    const hasRealData = transactions && transactions.length > 0;
    
    if (hasRealData) {
      transactions
        .filter(t => t.transaction_type === 'despesa' && t.category)
        .forEach(transaction => {
          const category = transaction.category.toLowerCase();
          categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
        });
    }

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        color: categoryColors[name] || '#6b7280'
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryData = getCategoryData();
  const hasData = categoryData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="bg-gradient-to-r from-knumbers-green to-knumbers-purple bg-clip-text text-transparent font-semibold">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">{data.percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Share de Categorias</CardTitle>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {hasData ? (
          <>
            {/* Pie Chart */}
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryData.slice(0, 6).map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {category.name} ({category.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Ranking Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90 text-white shadow-md text-xs sm:text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ranking de Categorias</span>
                  <span className="sm:hidden">Ranking</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ranking de Categorias</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-knumbers-danger">
                          R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum gasto categorizado encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comece a registrar seus gastos para ver o gráfico
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}