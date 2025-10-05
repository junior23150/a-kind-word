import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalsList } from "@/components/goals/GoalsList";
import { GoalDialog } from "@/components/goals/GoalDialog";

const Objetivos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  const handleEditGoal = (goalId: string) => {
    setEditingGoal(goalId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-knumbers bg-clip-text text-transparent mb-2">
                Meus Objetivos
              </h1>
              <p className="text-muted-foreground">
                Crie e acompanhe seus sonhos e metas financeiras
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Novo Objetivo
            </Button>
          </div>

          {/* Goals List */}
          <GoalsList onEditGoal={handleEditGoal} />

          {/* Goal Dialog */}
          <GoalDialog
            open={isDialogOpen}
            onOpenChange={handleCloseDialog}
            goalId={editingGoal}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Objetivos;
