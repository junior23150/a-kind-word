import { useState } from "react";
import {
  Plus,
  TrendingDown,
  Target,
  DollarSign,
  PiggyBank,
  Car,
  Utensils,
  Heart,
  Home,
  ShoppingBag,
  Gamepad2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const availableIcons = [
  { id: "dollar", icon: DollarSign, name: "Dinheiro" },
  { id: "trending-up", icon: TrendingDown, name: "Crescimento" },
  { id: "target", icon: Target, name: "Meta" },
  { id: "piggy-bank", icon: PiggyBank, name: "Poupança" },
  { id: "heart", icon: Heart, name: "Coração" },
  { id: "home", icon: Home, name: "Casa" },
  { id: "car", icon: Car, name: "Carro" },
  { id: "utensils", icon: Utensils, name: "Comida" },
  { id: "shopping-bag", icon: ShoppingBag, name: "Compras" },
  { id: "gamepad", icon: Gamepad2, name: "Jogos" },
];

interface ExpenseFormProps {
  expenseForm: {
    description: string;
    planned: string;
    date: string;
    category: string;
    notes: string;
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
  const [showNewExpenseCategoryInput, setShowNewExpenseCategoryInput] = useState(false);
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState("");
  const [newExpenseCategoryIcon, setNewExpenseCategoryIcon] = useState("dollar");

  const allExpenseCategories = [...categories, ...customExpenseCategories];

  const handleAddCustomExpenseCategory = () => {
    if (newExpenseCategoryName.trim()) {
      const selectedIcon = availableIcons.find((icon) => icon.id === newExpenseCategoryIcon);
      const newCategory = {
        id: `custom_expense_${Date.now()}`,
        name: newExpenseCategoryName.trim(),
        icon: selectedIcon?.icon || DollarSign,
        color: "bg-indigo-500",
      };
      setCustomExpenseCategories((prev) => [...prev, newCategory]);
      setExpenseForm((prev: any) => ({ ...prev, category: newCategory.id }));
      setNewExpenseCategoryName("");
      setNewExpenseCategoryIcon("dollar");
      setShowNewExpenseCategoryInput(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
          <ArrowRight className="h-8 w-8 text-white transform rotate-90" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nova Saída</h2>
          <p className="text-gray-600 mt-1">Vamos planejar um novo gasto</p>
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
              className="h-14 text-base bg-white border-2"
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
              className="h-14 text-base bg-white border-2"
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
              className="h-14 bg-white border-2"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Right Column - Category Details */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-800">Escolha uma categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              {allExpenseCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = expenseForm.category === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-16 flex items-center gap-3 text-left justify-start px-4 ${
                      isSelected
                        ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                        : "hover:border-purple-500 hover:bg-purple-50 bg-white border-2"
                    }`}
                    onClick={() => setExpenseForm((prev: any) => ({ ...prev, category: category.id }))}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : category.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Button>
                );
              })}

              <Button
                variant="outline"
                className="h-16 flex items-center gap-3 hover:border-purple-500 hover:bg-purple-50 bg-white border-2 border-dashed"
                onClick={() => setShowNewExpenseCategoryInput(true)}
              >
                <div className="p-2 rounded-lg bg-gray-200">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium">Nova Categoria</span>
              </Button>
            </div>

            {showNewExpenseCategoryInput && (
              <div className="space-y-4 p-4 border-2 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome da categoria</Label>
                  <Input
                    placeholder="Ex: Academia, Transporte..."
                    value={newExpenseCategoryName}
                    onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Escolha um ícone</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map((iconOption) => {
                      const IconComponent = iconOption.icon;
                      const isSelected = newExpenseCategoryIcon === iconOption.id;
                      return (
                        <Button
                          key={iconOption.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-10 w-10 p-0 ${
                            isSelected
                              ? "bg-purple-500 hover:bg-purple-600 text-white"
                              : "hover:border-purple-500 hover:bg-purple-50"
                          }`}
                          onClick={() => setNewExpenseCategoryIcon(iconOption.id)}
                        >
                          <IconComponent className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddCustomExpenseCategory}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 flex-1"
                    disabled={!newExpenseCategoryName.trim()}
                  >
                    <CheckCircle className="mr-2 h-3 w-3" />
                    Criar Categoria
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewExpenseCategoryInput(false);
                      setNewExpenseCategoryName("");
                      setNewExpenseCategoryIcon("dollar");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-notes" className="text-lg font-medium text-gray-800">
              Observações
            </Label>
            <Textarea
              id="expense-notes"
              placeholder="Detalhes sobre esta despesa..."
              className="min-h-[120px] text-base resize-none bg-white border-2"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm((prev: any) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-4 pt-8">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="px-8 py-3 text-base border-2"
        >
          Voltar
        </Button>
        <Button
          className="px-8 py-3 text-base bg-purple-500 hover:bg-purple-600"
          disabled={!expenseForm.category}
          onClick={onSave}
        >
          Criar Saída
        </Button>
      </div>
    </div>
  );
}