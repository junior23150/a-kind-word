import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Target,
  PiggyBank,
  Heart,
  Home,
  Plus,
  Briefcase,
  Laptop,
  Gift,
  Sun,
  Award,
  Coins,
  Tag,
  RotateCcw,
  Circle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
}

interface EntryFormProps {
  entryForm: {
    description: string;
    value: string;
    date: string;
    category: string;
    notes: string;
    isRecurring: boolean;
    recurrenceType: string;
    installments: string;
  };
  setEntryForm: React.Dispatch<React.SetStateAction<any>>;
  incomeCategories: any[];
  customIncomeCategories: any[];
  editingEntry: any;
  formStep: number;
  setFormStep: (step: number) => void;
  onSave: () => void;
  onCancel: () => void;
  setCustomIncomeCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

const availableIcons = [
  { id: "briefcase", icon: Briefcase, name: "Trabalho" },
  { id: "laptop", icon: Laptop, name: "Freelance" },
  { id: "gift", icon: Gift, name: "Presente" },
  { id: "sun", icon: Sun, name: "Férias" },
  { id: "award", icon: Award, name: "Prêmio" },
  { id: "trending-up", icon: TrendingUp, name: "Crescimento" },
  { id: "coins", icon: Coins, name: "Juros" },
  { id: "home", icon: Home, name: "Aluguel" },
  { id: "tag", icon: Tag, name: "Vendas" },
  { id: "rotate-ccw", icon: RotateCcw, name: "Reembolso" },
  { id: "dollar", icon: DollarSign, name: "Dinheiro" },
  { id: "target", icon: Target, name: "Meta" },
  { id: "piggy-bank", icon: PiggyBank, name: "Poupança" },
  { id: "heart", icon: Heart, name: "Coração" },
  { id: "circle", icon: Circle, name: "Outros" },
];

export function EntryForm({
  entryForm,
  setEntryForm,
  incomeCategories,
  customIncomeCategories,
  editingEntry,
  formStep,
  setFormStep,
  onSave,
  onCancel,
  setCustomIncomeCategories,
}: EntryFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    color: "#22c55e",
    icon: "briefcase",
  });

  // Fetch categories from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .eq("type", "income")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      // Cast the data to match our Category interface
      const typedCategories: Category[] = (data || []).map((item: any) => ({
        ...item,
        type: item.type as "income" | "expense"
      }));
      
      setCategories(typedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryForm.name.trim() || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: newCategoryForm.name,
          type: "income",
          color: newCategoryForm.color,
          icon: newCategoryForm.icon,
          is_default: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data as Category]);
      setNewCategoryForm({ name: "", color: "#22c55e", icon: "briefcase" });
      setShowNewCategoryDialog(false);
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        title: "Erro",
        description: error.code === "23505" ? "Já existe uma categoria com este nome" : "Erro ao criar categoria",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.id === iconName);
    return iconData ? iconData.icon : Circle;
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <ArrowRight className="h-8 w-8 text-white transform rotate-90" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {editingEntry ? "Editar Entrada" : "Nova Entrada"}
            </h2>
            <p className="text-gray-600 mt-1">
              {editingEntry ? "Altere os dados da entrada" : "Vamos cadastrar uma nova fonte de renda"}
            </p>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 flex gap-12">
          {/* Left Column - Basic Information */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="entry-description" className="text-lg font-medium text-gray-800">
                Como você quer chamar essa entrada?
              </Label>
              <Input
                id="entry-description"
                placeholder="Ex: Salário, Freelance, Consultoria..."
                className="h-14 text-base bg-white border-2 rounded-xl"
                value={entryForm.description}
                onChange={(e) => setEntryForm((prev: any) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-value" className="text-lg font-medium text-gray-800">
                Valor esperado (Em R$)
              </Label>
              <Input
                id="entry-value"
                placeholder="R$ 0,00"
                type="number"
                className="h-14 text-base bg-white border-2 rounded-xl"
                value={entryForm.value}
                onChange={(e) => setEntryForm((prev: any) => ({ ...prev, value: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-date" className="text-lg font-medium text-gray-800">
                Data prevista
              </Label>
              <Input
                id="entry-date"
                type="date"
                className="h-14 bg-white border-2 rounded-xl"
                value={entryForm.date}
                onChange={(e) => setEntryForm((prev: any) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Recorrência */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={entryForm.isRecurring}
                  onCheckedChange={(checked) => setEntryForm((prev: any) => ({ ...prev, isRecurring: checked }))}
                  className="rounded-lg"
                />
                <Label htmlFor="recurring" className="text-lg font-medium text-gray-800">
                  Conta Recorrente
                </Label>
              </div>

              {entryForm.isRecurring && (
                <div className="space-y-3 pl-6 border-l-2 border-green-200">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-type" className="text-base font-medium text-gray-700">
                      Tipo de Recorrência
                    </Label>
                    <Select 
                      value={entryForm.recurrenceType} 
                      onValueChange={(value) => setEntryForm((prev: any) => ({ ...prev, recurrenceType: value }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="installment">Parcelada</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="biannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {entryForm.recurrenceType === "installment" && (
                    <div className="space-y-2">
                      <Label htmlFor="installments" className="text-base font-medium text-gray-700">
                        Número de Parcelas
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        placeholder="Ex: 12"
                        value={entryForm.installments}
                        onChange={(e) => setEntryForm((prev: any) => ({ ...prev, installments: e.target.value }))}
                        className="h-12 rounded-xl border-2"
                        min="1"
                        max="60"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Category Details */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-medium text-gray-800">Escolha uma categoria</Label>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando categorias...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    const isSelected = entryForm.category === category.name;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-16 flex items-center gap-3 text-left justify-start px-4 rounded-xl ${
                          isSelected
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                            : "hover:border-emerald-500 hover:bg-emerald-50 bg-white border-2"
                        }`}
                        onClick={() => setEntryForm((prev: any) => ({ ...prev, category: category.name }))}
                      >
                        <div 
                          className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : ""}`}
                          style={!isSelected ? { backgroundColor: category.color } : {}}
                        >
                          <IconComponent className={`h-5 w-5 ${isSelected ? "text-white" : "text-white"}`} />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    className="h-16 flex items-center gap-3 hover:border-emerald-500 hover:bg-emerald-50 bg-white border-2 border-dashed rounded-xl"
                    onClick={() => setShowNewCategoryDialog(true)}
                  >
                    <div className="p-2 rounded-lg bg-gray-200">
                      <Plus className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">Nova Categoria</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-notes" className="text-lg font-medium text-gray-800">
                Observações
              </Label>
              <Textarea
                id="entry-notes"
                placeholder="Detalhes sobre esta entrada..."
                className="min-h-[120px] text-base resize-none bg-white border-2 rounded-xl"
                value={entryForm.notes}
                onChange={(e) => setEntryForm((prev: any) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 pt-8">
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="px-8 py-3 text-base border-2 rounded-xl"
          >
            Voltar
          </Button>
          <Button
            className="px-8 py-3 text-base bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            disabled={!entryForm.category}
            onClick={onSave}
          >
            {editingEntry ? "Salvar Alterações" : "Criar Entrada"}
          </Button>
        </div>
      </div>

      {/* Dialog para Nova Categoria */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria de Entrada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-category-name">Nome da Categoria</Label>
              <Input
                id="new-category-name"
                placeholder="Ex: Consultoria, Vendas Online..."
                value={newCategoryForm.name}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                className="mt-1 rounded-xl border-2"
              />
            </div>

            <div>
              <Label htmlFor="new-category-color">Cor</Label>
              <div className="flex gap-2 mt-2">
                {["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryForm({ ...newCategoryForm, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newCategoryForm.color === color ? "border-gray-800 scale-110" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="new-category-icon">Ícone</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {availableIcons.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => setNewCategoryForm({ ...newCategoryForm, icon: iconOption.id })}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        newCategoryForm.icon === iconOption.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      title={iconOption.name}
                    >
                      <IconComponent className="h-4 w-4 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewCategoryDialog(false);
                  setNewCategoryForm({ name: "", color: "#22c55e", icon: "briefcase" });
                }}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddNewCategory}
                disabled={!newCategoryForm.name.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl"
              >
                Criar Categoria
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}