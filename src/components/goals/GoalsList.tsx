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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gradient-knumbers p-6 rounded-full mb-6">
          <Target className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Nenhum objetivo criado</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Comece criando seu primeiro objetivo e comece a poupar para realizar seus sonhos!
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
