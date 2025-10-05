import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId?: string | null;
}

const GOAL_ICONS = [
  { name: "Target", icon: LucideIcons.Target },
  { name: "Home", icon: LucideIcons.Home },
  { name: "Car", icon: LucideIcons.Car },
  { name: "Plane", icon: LucideIcons.Plane },
  { name: "GraduationCap", icon: LucideIcons.GraduationCap },
  { name: "Heart", icon: LucideIcons.Heart },
  { name: "Gift", icon: LucideIcons.Gift },
  { name: "Wallet", icon: LucideIcons.Wallet },
];

const GOAL_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f43f5e",
];

export const GoalDialog = ({ open, onOpenChange, goalId }: GoalDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0].name);
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (goalId && open) {
      loadGoal();
    } else if (!open) {
      resetForm();
    }
  }, [goalId, open]);

  const loadGoal = async () => {
    try {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (error) throw error;

      setName(data.name);
      setDescription(data.description || "");
      setTargetAmount(data.target_amount.toString());
      setCurrentAmount(data.current_amount.toString());
      setTargetDate(data.target_date || "");
      setSelectedColor(data.color);
      setSelectedIcon(data.icon);
      setCoverImage(data.cover_image || "");
    } catch (error) {
      console.error("Erro ao carregar objetivo:", error);
      toast.error("Erro ao carregar objetivo");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate("");
    setSelectedColor(GOAL_COLORS[0]);
    setSelectedIcon(GOAL_ICONS[0].name);
    setCoverImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const goalData = {
        user_id: user?.id,
        name,
        description: description || null,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || "0"),
        target_date: targetDate || null,
        color: selectedColor,
        icon: selectedIcon,
        cover_image: coverImage || null,
      };

      let error;
      if (goalId) {
        ({ error } = await supabase
          .from("savings_goals")
          .update(goalData)
          .eq("id", goalId));
      } else {
        ({ error } = await supabase.from("savings_goals").insert(goalData));
      }

      if (error) throw error;

      toast.success(goalId ? "Objetivo atualizado!" : "Objetivo criado!");
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar objetivo:", error);
      toast.error("Erro ao salvar objetivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {goalId ? "Editar Objetivo" : "Novo Objetivo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Objetivo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem para Europa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu objetivo..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor Meta *</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Valor Atual</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Data Meta</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {coverImage && (
              <div className="mt-2 rounded-2xl overflow-hidden border-2 border-border">
                <img
                  src={coverImage}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform hover:scale-110",
                    selectedColor === color && "ring-4 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-8 gap-2">
              {GOAL_ICONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all hover:scale-105",
                    selectedIcon === name
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : goalId ? "Atualizar" : "Criar Objetivo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
