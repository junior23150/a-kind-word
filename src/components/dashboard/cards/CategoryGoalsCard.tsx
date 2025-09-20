import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryGoalsCardProps {
  transactions: any[];
}

interface CategoryGoal {
  id: string;
  category: string;
  goal_amount: number;
  color: string;
}

export function CategoryGoalsCard({ transactions }: CategoryGoalsCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categoryGoals, setCategoryGoals] = useState<CategoryGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCategoryGoals();
    }
  }, [user]);

  const fetchCategoryGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('category_goals')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching category goals:', error);
      } else {
        setCategoryGoals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate spent amount per category
  const getSpentByCategory = (category: string) => {
    return transactions
      .filter(t => 
        t.transaction_type === 'despesa' && 
        t.category?.toLowerCase() === category.toLowerCase()
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const handleDetailsClick = () => {
    // For now, just show a placeholder - will be implemented later
    alert('Tela de categorias em construção');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Metas por Categoria</CardTitle>
        <Target className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Table Header - Hidden on mobile */}
        <div className="hidden sm:grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
          <span>Categoria</span>
          <span>Meta</span>
          <span>Gasto</span>
          <span>Disponível</span>
        </div>

        {/* Category Rows */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando metas...</div>
          ) : categoryGoals.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhuma meta cadastrada</div>
          ) : (
            categoryGoals.map((goal) => {
              const spent = getSpentByCategory(goal.category);
              const available = Math.max(0, Number(goal.goal_amount) - spent);
              const percentage = Number(goal.goal_amount) > 0 ? (spent / Number(goal.goal_amount)) * 100 : 0;
              const isOverGoal = spent > Number(goal.goal_amount);

              return (
                <div key={goal.id} className="space-y-2">
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <span className="font-medium">{goal.category}</span>
                      </div>
                      <span className={`text-xs font-medium ${isOverGoal ? 'text-knumbers-danger' : 'text-knumbers-success'}`}>
                        {isOverGoal ? 'Excedeu' : `R$ ${available.toLocaleString('pt-BR')}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Meta: R$ {Number(goal.goal_amount).toLocaleString('pt-BR')}</span>
                      <span className={isOverGoal ? 'text-knumbers-danger' : 'text-foreground'}>
                        Gasto: R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <span className="font-medium">{goal.category}</span>
                    </div>
                    <span className="text-muted-foreground">
                      R$ {Number(goal.goal_amount).toLocaleString('pt-BR')}
                    </span>
                    <span className={`font-medium ${isOverGoal ? 'text-knumbers-danger' : 'text-foreground'}`}>
                      R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`font-medium ${isOverGoal ? 'text-knumbers-danger' : 'text-knumbers-success'}`}>
                      {isOverGoal ? 'Excedeu' : `R$ ${available.toLocaleString('pt-BR')}`}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOverGoal ? 'bg-red-100' : 'bg-muted'}`}
                    />
                    {isOverGoal && (
                      <div 
                        className="absolute top-0 left-0 h-2 bg-knumbers-danger rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Details Button */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90 text-white shadow-md text-xs sm:text-sm"
            onClick={handleDetailsClick}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Detalhes de Categorias</span>
            <span className="sm:hidden">Detalhes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}