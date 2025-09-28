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
  TrendingDown,
  Target,
  PiggyBank,
  Heart,
  Home,
  Plus,
  Car,
  Utensils,
  ShoppingBag,
  Gamepad2,
  ArrowRight,
  Circle,
  HelpCircle,
  ShoppingCart,
  Fuel,
  Zap,
  Droplets,
  Wifi,
  Phone,
  Pill,
  Dumbbell,
  GraduationCap,
  Smile,
  Shirt,
  Scissors,
  CreditCard,
  Receipt,
  Shield,
  MoreHorizontal,
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

const availableIcons = [
  { id: "home", icon: Home, name: "Casa" },
  { id: "shopping-cart", icon: ShoppingCart, name: "Supermercado" },
  { id: "utensils", icon: Utensils, name: "Restaurantes" },
  { id: "car", icon: Car, name: "Transporte" },
  { id: "fuel", icon: Fuel, name: "Combustível" },
  { id: "zap", icon: Zap, name: "Energia" },
  { id: "droplets", icon: Droplets, name: "Água" },
  { id: "wifi", icon: Wifi, name: "Internet" },
  { id: "phone", icon: Phone, name: "Telefone" },
  { id: "heart", icon: Heart, name: "Saúde" },
  { id: "pill", icon: Pill, name: "Medicamentos" },
  { id: "dumbbell", icon: Dumbbell, name: "Academia" },
  { id: "graduation-cap", icon: GraduationCap, name: "Educação" },
  { id: "smile", icon: Smile, name: "Lazer" },
  { id: "shirt", icon: Shirt, name: "Roupas" },
  { id: "scissors", icon: Scissors, name: "Cabeleireiro" },
  { id: "credit-card", icon: CreditCard, name: "Cartão" },
  { id: "receipt", icon: Receipt, name: "Impostos" },
  { id: "shield", icon: Shield, name: "Seguros" },
  { id: "circle", icon: Circle, name: "Outros" },
];

interface ExpenseFormProps {
  expenseForm: {
    description: string;
    planned: string;
    date: string;
    category: string;
    notes: string;
    isRecurring: boolean;
    recurrenceType: string;
    installments: string;
  };
  setExpenseForm: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  customExpenseCategories: any[];
  editingExpense: any;
  formStep: number;
  setFormStep: (step: number) => void;
  onSave: () => void;
  onCancel: () => void;
  setCustomExpenseCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ExpenseForm({
  expenseForm,
  setExpenseForm,
  categories,
  customExpenseCategories,
  editingExpense,
  formStep,
  setFormStep,
  onSave,
  onCancel,
  setCustomExpenseCategories,
}: ExpenseFormProps) {
  const { user } = useAuth();
  const [systemCategories, setSystemCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    color: "#ef4444",
    icon: "home",
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
        .eq("type", "expense")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      // Cast the data to match our Category interface
      const typedCategories: Category[] = (data || []).map((item: any) => ({
        ...item,
        type: item.type as "income" | "expense"
      }));
      
      setSystemCategories(typedCategories);
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
          type: "expense",
          color: newCategoryForm.color,
          icon: newCategoryForm.icon,
          is_default: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSystemCategories([...systemCategories, data as Category]);
      setNewCategoryForm({ name: "", color: "#ef4444", icon: "home" });
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
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
            <ArrowRight className="h-8 w-8 text-white transform rotate-90" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {editingExpense ? "Editar Saída" : "Nova Saída"}
            </h2>
            <p className="text-gray-600 mt-1">
              {editingExpense ? "Altere os dados da saída" : "Vamos planejar um novo gasto"}
            </p>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 flex gap-12">
          {/* Left Column - Basic Information */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expense-description" className="text-lg font-medium text-gray-800">
                Qual é essa despesa?
              </Label>
              <Input
                id="expense-description"
                placeholder="Ex: Aluguel, Supermercado, Academia..."
                className="h-14 text-base bg-white border-2 rounded-2xl focus:border-purple-500 focus:ring-purple-500"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-planned" className="text-lg font-medium text-gray-800">
                Valor planejado (Em R$)
              </Label>
              <Input
                id="expense-planned"
                placeholder="R$ 0,00"
                type="number"
                className="h-14 text-base bg-white border-2 rounded-2xl focus:border-purple-500 focus:ring-purple-500"
                value={expenseForm.planned}
                onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, planned: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-date" className="text-lg font-medium text-gray-800">
                Data prevista
              </Label>
              <Input
                id="expense-date"
                type="date"
                className="h-14 bg-white border-2 rounded-2xl focus:border-purple-500 focus:ring-purple-500"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Recorrência */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={expenseForm.isRecurring}
                  onCheckedChange={(checked) => setExpenseForm((prev: any) => ({ ...prev, isRecurring: checked }))}
                  className="rounded-lg data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <Label htmlFor="recurring" className="text-lg font-medium text-gray-800">
                  Conta Recorrente
                </Label>
              </div>

              {expenseForm.isRecurring && (
                <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-type" className="text-base font-medium text-gray-700">
                      Tipo de Recorrência
                    </Label>
                    <Select 
                      value={expenseForm.recurrenceType} 
                      onValueChange={(value) => setExpenseForm((prev: any) => ({ ...prev, recurrenceType: value }))}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-2 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parcelada">Parcelada</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {expenseForm.recurrenceType === "parcelada" && (
                    <div className="space-y-2">
                      <Label htmlFor="installments" className="text-base font-medium text-gray-700">
                        Número de Parcelas
                      </Label>
                        <Input
                          id="installments"
                          type="number"
                          placeholder="Ex: 12"
                          value={expenseForm.installments}
                          onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, installments: e.target.value }))}
                          className="h-12 rounded-2xl border-2 focus:border-purple-500 focus:ring-purple-500"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando categorias...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Select 
                    value={expenseForm.category} 
                    onValueChange={(value) => setExpenseForm((prev: any) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-16 rounded-2xl border-2 bg-white">
                      <SelectValue placeholder="Selecione uma categoria">
                        {expenseForm.category && (
                          <div className="flex items-center gap-3">
                            {(() => {
                              const selectedCategory = systemCategories.find(cat => cat.name === expenseForm.category);
                              if (selectedCategory) {
                                const IconComponent = getIconComponent(selectedCategory.icon);
                                return (
                                  <>
                                    <div 
                                      className="p-2 rounded-lg"
                                      style={{ backgroundColor: selectedCategory.color }}
                                    >
                                      <IconComponent className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium">{selectedCategory.name}</span>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-80 rounded-2xl">
                      {systemCategories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.name}
                            className="h-16 rounded-xl cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="w-full h-16 flex items-center gap-3 hover:border-purple-500 hover:bg-purple-50 bg-white border-2 border-dashed rounded-2xl"
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
              <Label htmlFor="expense-description" className="text-lg font-medium text-gray-800">
                Descrição
              </Label>
              <Textarea
                id="expense-description"
                placeholder="Adicione detalhes sobre esta despesa..."
                className="min-h-[80px] text-base bg-white border-2 rounded-2xl resize-none focus:border-purple-500 focus:ring-purple-500"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="px-8 py-3 text-base border-2 rounded-2xl"
          >
            Voltar
          </Button>
          <Button
            className="px-8 py-3 text-base bg-purple-500 hover:bg-purple-600 rounded-2xl"
            disabled={!expenseForm.category}
            onClick={onSave}
          >
            {editingExpense ? "Salvar Alterações" : "Criar Saída"}
          </Button>
        </div>
      </div>

      {/* Dialog para Nova Categoria */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria de Saída</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-category-name">Nome da Categoria</Label>
              <Input
                id="new-category-name"
                placeholder="Ex: Academia, Transporte..."
                value={newCategoryForm.name}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                className="mt-1 rounded-2xl border-2"
              />
            </div>

            <div>
              <Label htmlFor="new-category-color">Cor</Label>
              <div className="flex gap-2 mt-2">
                {["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6"].map((color) => (
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
                      className={`p-2 rounded-2xl border-2 transition-all ${
                        newCategoryForm.icon === iconOption.id
                          ? "border-purple-500 bg-purple-50"
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
                  setNewCategoryForm({ name: "", color: "#ef4444", icon: "home" });
                }}
                className="flex-1 rounded-2xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddNewCategory}
                disabled={!newCategoryForm.name.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-2xl"
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