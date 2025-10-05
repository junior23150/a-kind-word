import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoalAI, AICreationSuggestion } from "@/hooks/useGoalAI";
import { Loader2 } from "lucide-react";

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
  const [aiSuggestion, setAiSuggestion] = useState<AICreationSuggestion | null>(null);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const { getCreationAdvice, loading: aiLoading } = useGoalAI();

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
    setAiSuggestion(null);
    setShowAISuggestion(false);
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

  const handleGetAIAdvice = async () => {
    if (!name || !targetAmount) {
      toast.error('Preencha o nome e valor do objetivo para receber sugestões');
      return;
    }

    const suggestion = await getCreationAdvice({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: currentAmount ? parseFloat(currentAmount) : 0,
      target_date: targetDate || undefined,
    });

    if (suggestion) {
      setAiSuggestion(suggestion);
      setShowAISuggestion(true);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;

    const suggestedDate = new Date();
    suggestedDate.setMonth(suggestedDate.getMonth() + aiSuggestion.prazo_estimado_meses);
    setTargetDate(suggestedDate.toISOString().split('T')[0]);
    
    setShowAISuggestion(false);
    toast.success(`Sugestão aplicada! Prazo: ${aiSuggestion.prazo_estimado_meses} meses`);
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

          {/* AI Assistant */}
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetAIAdvice}
              disabled={aiLoading || !name || !targetAmount}
              className="w-full gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <LucideIcons.Sparkles className="w-4 h-4" />
                  💡 Me ajude a planejar
                </>
              )}
            </Button>
          </div>

          {/* AI Suggestion Card */}
          {showAISuggestion && aiSuggestion && (
            <Card className="p-4 space-y-3 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <LucideIcons.Sparkles className="w-4 h-4 text-primary" />
                  Sugestão da IA
                </h4>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  aiSuggestion.viabilidade === 'alta' && 'bg-green-500/20 text-green-700',
                  aiSuggestion.viabilidade === 'média' && 'bg-yellow-500/20 text-yellow-700',
                  aiSuggestion.viabilidade === 'baixa' && 'bg-red-500/20 text-red-700'
                )}>
                  Viabilidade {aiSuggestion.viabilidade}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Guardar por mês</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {aiSuggestion.valor_mensal_sugerido.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Prazo estimado</p>
                  <p className="text-lg font-bold">
                    {aiSuggestion.prazo_estimado_meses} meses
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Conselhos:</p>
                <ul className="space-y-1">
                  {aiSuggestion.conselhos.map((conselho, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{conselho}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {aiSuggestion.alternativas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium">Alternativas:</p>
                  {aiSuggestion.alternativas.slice(0, 2).map((alt, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      <span className="font-medium">Opção {index + 1}:</span> R$ {alt.valor_mensal}/mês em {alt.prazo_meses} meses
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                size="sm"
                onClick={applyAISuggestion}
                className="w-full mt-2"
              >
                Aplicar sugestão ao prazo
              </Button>
            </Card>
          )}

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
