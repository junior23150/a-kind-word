import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Circle,
  Briefcase,
  Laptop,
  Home,
  Car,
  Heart,
  GraduationCap,
  Smile,
  ShoppingCart,
  FileText,
  MoreHorizontal,
  Utensils,
  ShoppingBag
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
}

const iconMap = {
  'circle': Circle,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'shopping-bag': ShoppingBag,
  'home': Home,
  'plus-circle': Plus,
  'utensils': Utensils,
  'car': Car,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'smile': Smile,
  'shopping-cart': ShoppingCart,
  'file-text': FileText,
  'more-horizontal': MoreHorizontal,
};

const availableIcons = [
  { value: 'briefcase', label: 'Trabalho', icon: Briefcase },
  { value: 'laptop', label: 'Freelance', icon: Laptop },
  { value: 'trending-up', label: 'Investimentos', icon: TrendingUp },
  { value: 'shopping-bag', label: 'Vendas', icon: ShoppingBag },
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'plus-circle', label: 'Outros', icon: Plus },
  { value: 'utensils', label: 'Alimentação', icon: Utensils },
  { value: 'car', label: 'Transporte', icon: Car },
  { value: 'heart', label: 'Saúde', icon: Heart },
  { value: 'graduation-cap', label: 'Educação', icon: GraduationCap },
  { value: 'smile', label: 'Lazer', icon: Smile },
  { value: 'shopping-cart', label: 'Compras', icon: ShoppingCart },
  { value: 'file-text', label: 'Contas', icon: FileText },
  { value: 'more-horizontal', label: 'Outros', icon: MoreHorizontal },
];

const availableColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#6366f1',
    icon: 'circle'
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            type: formData.type,
            color: formData.color,
            icon: formData.icon,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Create new category
        const { error } = await supabase
          .from("categories")
          .insert({
            user_id: user?.id,
            name: formData.name,
            type: formData.type,
            color: formData.color,
            icon: formData.icon,
            is_default: false,
          });

        if (error) throw error;
        toast.success("Categoria criada com sucesso!");
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'expense', color: '#6366f1', icon: 'circle' });
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.code === '23505') {
        toast.error("Já existe uma categoria com este nome");
      } else {
        toast.error("Erro ao salvar categoria");
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (category.is_default) {
      toast.error("Não é possível excluir categorias padrão");
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", category.id);

      if (error) throw error;
      toast.success("Categoria excluída com sucesso!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', color: '#6366f1', icon: 'circle' });
    setEditingCategory(null);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-knumbers-green/10 via-background to-knumbers-purple/10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas categorias de receitas e despesas
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? 'Atualize as informações da categoria'
                      : 'Crie uma nova categoria para suas transações'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        placeholder="Nome da categoria"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Tipo
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'income' | 'expense') => 
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                              Receita
                            </div>
                          </SelectItem>
                          <SelectItem value="expense">
                            <div className="flex items-center">
                              <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                              Despesa
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="icon" className="text-right">
                        Ícone
                      </Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) => setFormData({ ...formData, icon: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((iconOption) => {
                            const IconComponent = iconOption.icon;
                            return (
                              <SelectItem key={iconOption.value} value={iconOption.value}>
                                <div className="flex items-center">
                                  <IconComponent className="w-4 h-4 mr-2" />
                                  {iconOption.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Cor</Label>
                      <div className="col-span-3 flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              formData.color === color ? 'border-foreground' : 'border-border'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData({ ...formData, color })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-knumbers-green"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Income Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Receitas ({incomeCategories.length})
                  </CardTitle>
                  <CardDescription>
                    Categorias para suas entradas de dinheiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incomeCategories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma categoria de receita encontrada
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {incomeCategories.map((category) => {
                        const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Circle;
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: category.color + '20' }}
                              >
                                <IconComponent 
                                  className="w-5 h-5" 
                                  style={{ color: category.color }} 
                                />
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                {category.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {!category.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(category)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <TrendingDown className="w-5 h-5 mr-2" />
                    Despesas ({expenseCategories.length})
                  </CardTitle>
                  <CardDescription>
                    Categorias para suas saídas de dinheiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseCategories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma categoria de despesa encontrada
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {expenseCategories.map((category) => {
                        const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Circle;
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: category.color + '20' }}
                              >
                                <IconComponent 
                                  className="w-5 h-5" 
                                  style={{ color: category.color }} 
                                />
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                {category.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {!category.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(category)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
