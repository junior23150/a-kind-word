import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    color: string;
  };
  type: "add" | "remove";
  onSuccess: () => void;
}

export const ContributeDialog = ({
  open,
  onOpenChange,
  goal,
  type,
  onSuccess,
}: ContributeDialogProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const value = parseFloat(amount);
      if (isNaN(value) || value <= 0) {
        toast.error("Digite um valor válido");
        return;
      }

      const newAmount =
        type === "add"
          ? goal.current_amount + value
          : Math.max(0, goal.current_amount - value);

      if (newAmount > goal.target_amount) {
        toast.error("O valor não pode ultrapassar a meta");
        return;
      }

      const { error } = await supabase
        .from("savings_goals")
        .update({ current_amount: newAmount })
        .eq("id", goal.id);

      if (error) throw error;

      toast.success(
        type === "add"
          ? "Valor adicionado com sucesso!"
          : "Valor removido com sucesso!"
      );
      onOpenChange(false);
      setAmount("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar objetivo:", error);
      toast.error("Erro ao atualizar objetivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "add" ? "Adicionar Valor" : "Remover Valor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: `${goal.color}10` }}>
            <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
            <p className="text-2xl font-bold" style={{ color: goal.color }}>
              R$ {goal.current_amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              de R$ {goal.target_amount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="R$ 0,00"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              style={{ backgroundColor: goal.color }}
            >
              {loading ? "Salvando..." : type === "add" ? "Adicionar" : "Remover"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
