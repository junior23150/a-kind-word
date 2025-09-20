import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const availableIcons = [
  { id: "dollar", icon: DollarSign, name: "Dinheiro" },
  { id: "trending-up", icon: TrendingUp, name: "Crescimento" },
  { id: "target", icon: Target, name: "Meta" },
];

interface EntryFormProps {
  entryForm: {
    description: string;
    value: string;
    date: string;
    category: string;
    notes: string;
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
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("dollar");

  const allIncomeCategories = [...incomeCategories, ...customIncomeCategories];

  const handleAddCustomCategory = () => {
    if (newCategoryName.trim()) {
      const selectedIcon = availableIcons.find((icon) => icon.id === newCategoryIcon);
      const newCategory = {
        id: `custom_${Date.now()}`,
        name: newCategoryName.trim(),
        icon: selectedIcon?.icon || DollarSign,
        color: "bg-indigo-500",
      };
      setCustomIncomeCategories((prev) => [...prev, newCategory]);
      setEntryForm((prev: any) => ({ ...prev, category: newCategory.id }));
      setNewCategoryName("");
      setNewCategoryIcon("dollar");
      setShowNewCategoryInput(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto">
          <ArrowRight className="h-8 w-8 text-white transform rotate-90" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nova Entrada</h2>
          <p className="text-gray-600 mt-1">Vamos cadastrar uma nova fonte de renda</p>
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
              className="h-14 text-base bg-white border-2"
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
              className="h-14 text-base bg-white border-2"
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
              className="h-14 bg-white border-2"
              value={entryForm.date}
              onChange={(e) => setEntryForm((prev: any) => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Right Column - Category Details */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-800">Escolha uma categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              {allIncomeCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = entryForm.category === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-16 flex items-center gap-3 text-left justify-start px-4 ${
                      isSelected
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                        : "hover:border-emerald-500 hover:bg-emerald-50 bg-white border-2"
                    }`}
                    onClick={() => setEntryForm((prev: any) => ({ ...prev, category: category.id }))}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : category.color}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-white"}`} />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Button>
                );
              })}

              <Button
                variant="outline"
                className="h-16 flex items-center gap-3 hover:border-emerald-500 hover:bg-emerald-50 bg-white border-2 border-dashed"
                onClick={() => setShowNewCategoryInput(true)}
              >
                <div className="p-2 rounded-lg bg-gray-200">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium">Nova Categoria</span>
              </Button>
            </div>

            {showNewCategoryInput && (
              <div className="space-y-4 p-4 border-2 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome da categoria</Label>
                  <Input
                    placeholder="Ex: Consultoria, Aluguel..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Escolha um ícone</Label>
                  <div className="flex gap-2">
                    {availableIcons.map((iconOption) => {
                      const IconComponent = iconOption.icon;
                      const isSelected = newCategoryIcon === iconOption.id;
                      return (
                        <Button
                          key={iconOption.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-10 w-10 p-0 ${
                            isSelected
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "hover:border-emerald-500 hover:bg-emerald-50"
                          }`}
                          onClick={() => setNewCategoryIcon(iconOption.id)}
                        >
                          <IconComponent className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddCustomCategory}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 flex-1"
                    disabled={!newCategoryName.trim()}
                  >
                    <CheckCircle className="mr-2 h-3 w-3" />
                    Criar Categoria
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName("");
                      setNewCategoryIcon("dollar");
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
            <Label htmlFor="entry-notes" className="text-lg font-medium text-gray-800">
              Observações
            </Label>
            <Textarea
              id="entry-notes"
              placeholder="Detalhes sobre esta entrada..."
              className="min-h-[120px] text-base resize-none bg-white border-2"
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
          className="px-8 py-3 text-base border-2"
        >
          Voltar
        </Button>
        <Button
          className="px-8 py-3 text-base bg-emerald-500 hover:bg-emerald-600"
          disabled={!entryForm.category}
          onClick={onSave}
        >
          Criar Entrada
        </Button>
      </div>
    </div>
  );
}