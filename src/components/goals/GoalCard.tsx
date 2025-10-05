import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Plus, Minus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContributeDialog } from "./ContributeDialog";
import { GoalAIInsights } from "./GoalAIInsights";

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    target_date: string | null;
    color: string;
    icon: string;
    cover_image: string | null;
  };
  onEdit: () => void;
  onUpdate: () => void;
}

export const GoalCard = ({ goal, onEdit, onUpdate }: GoalCardProps) => {
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [contributeType, setContributeType] = useState<"add" | "remove">("add");
  
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const IconComponent = (LucideIcons as any)[goal.icon] || LucideIcons.Target;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("savings_goals")
        .update({ is_active: false })
        .eq("id", goal.id);

      if (error) throw error;

      toast.success("Objetivo excluído com sucesso!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao excluir objetivo:", error);
      toast.error("Erro ao excluir objetivo");
    }
  };

  const openContributeDialog = (type: "add" | "remove") => {
    setContributeType(type);
    setContributeDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Card
        className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 rounded-3xl"
        style={{ borderColor: `${goal.color}20` }}
      >
        {/* Header with gradient or image */}
        <div className="h-40 p-6 relative">
          {goal.cover_image ? (
            <>
              <img
                src={goal.cover_image}
                alt={goal.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${goal.color} 0%, ${goal.color}dd 100%)`,
              }}
            />
          )}
          <div className="relative flex justify-between items-start h-full">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xl mb-1">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold" style={{ color: goal.color }}>
                {progress.toFixed(0)}%
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
              </span>
            </div>
          </div>

          {/* Date and Actions */}
          <div className="flex justify-between items-center pt-2">
            <div>
              {goal.target_date && (
                <p className="text-xs text-muted-foreground">
                  Meta: {formatDate(goal.target_date)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openContributeDialog("remove")}
                className="gap-1"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => openContributeDialog("add")}
                style={{ backgroundColor: goal.color }}
                className="gap-1 text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* AI Insights */}
          <GoalAIInsights goal={goal} />
        </div>
      </Card>

      <ContributeDialog
        open={contributeDialogOpen}
        onOpenChange={setContributeDialogOpen}
        goal={goal}
        type={contributeType}
        onSuccess={onUpdate}
      />
    </>
  );
};
