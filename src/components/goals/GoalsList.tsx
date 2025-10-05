import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GoalCard } from "./GoalCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  cover_image: string | null;
}

interface GoalsListProps {
  onEditGoal: (goalId: string) => void;
}

export const GoalsList = ({ onEditGoal }: GoalsListProps) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Erro ao carregar objetivos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-knumbers rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-muted p-8 rounded-full">
            <Target className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 max-w-2xl">
          Transforme seus sonhos em realidade
        </h2>
        <p className="text-muted-foreground text-center max-w-xl text-lg mb-2">
          Organize seus objetivos, acompanhe seu progresso
        </p>
        <p className="text-muted-foreground text-center max-w-xl text-lg mb-8">
          e conquiste suas metas, um passo de cada vez.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEditGoal(goal.id)}
          onUpdate={fetchGoals}
        />
      ))}
    </div>
  );
};
