import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { GoalsList } from "@/components/goals/GoalsList";
import { GoalDialog } from "@/components/goals/GoalDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Objetivos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "active" | "completed">("all");

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-knumbers bg-clip-text text-transparent mb-2">
                Meus Objetivos
              </h1>
              <p className="text-muted-foreground">
                Crie e acompanhe seus sonhos e metas financeiras
              </p>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="w-5 h-5" />
                    Filtrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setFilterType("all")}>
                    Todos os objetivos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("active")}>
                    Em andamento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("completed")}>
                    Concluídos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-5 h-5" />
                Novo Objetivo
              </Button>
            </div>
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
