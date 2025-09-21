import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
  ShoppingBag,
  Search,
  Filter,
  Grid3X3,
  List,
  Users,
  Percent,
  Clock,
  Gift,
  Sun,
  Award,
  PiggyBank,
  BarChart,
  Coins,
  Wrench,
  Crown,
  Tag,
  HeartHandshake,
  ShieldCheck,
  RotateCcw,
  Trophy,
  Building,
  Hammer,
  Sofa,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Phone,
  Truck,
  Fuel,
  Bus,
  Shield,
  ClipboardCheck,
  Pill,
  Stethoscope,
  Activity,
  Dumbbell,
  BookOpen,
  Book,
  Film,
  PlayCircle,
  Plane,
  Palette,
  Shirt,
  Scissors,
  Receipt,
  CreditCard,
  Banknote,
  Calculator,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const iconMap = {
  circle: Circle,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "shopping-bag": ShoppingBag,
  home: Home,
  "plus-circle": Plus,
  utensils: Utensils,
  car: Car,
  heart: Heart,
  "graduation-cap": GraduationCap,
  smile: Smile,
  "shopping-cart": ShoppingCart,
  "file-text": FileText,
  "more-horizontal": MoreHorizontal,
  users: Users,
  percent: Percent,
  clock: Clock,
  gift: Gift,
  sun: Sun,
  award: Award,
  "piggy-bank": PiggyBank,
  "bar-chart": BarChart,
  coins: Coins,
  wrench: Wrench,
  crown: Crown,
  tag: Tag,
  "heart-handshake": HeartHandshake,
  "shield-check": ShieldCheck,
  "rotate-ccw": RotateCcw,
  trophy: Trophy,
  building: Building,
  hammer: Hammer,
  sofa: Sofa,
  zap: Zap,
  droplets: Droplets,
  flame: Flame,
  wifi: Wifi,
  phone: Phone,
  truck: Truck,
  fuel: Fuel,
  bus: Bus,
  shield: Shield,
  "clipboard-check": ClipboardCheck,
  pill: Pill,
  stethoscope: Stethoscope,
  activity: Activity,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  book: Book,
  film: Film,
  "play-circle": PlayCircle,
  plane: Plane,
  palette: Palette,
  shirt: Shirt,
  scissors: Scissors,
  receipt: Receipt,
  "credit-card": CreditCard,
  banknote: Banknote,
  calculator: Calculator,
  "alert-triangle": AlertTriangle,
};

const availableIcons = [
  // Trabalho e Negócios
  { value: "briefcase", label: "Trabalho", icon: Briefcase, category: "Trabalho" },
  { value: "laptop", label: "Freelance", icon: Laptop, category: "Trabalho" },
  { value: "users", label: "Consultoria", icon: Users, category: "Trabalho" },
  { value: "percent", label: "Comissões", icon: Percent, category: "Trabalho" },
  { value: "clock", label: "Horas", icon: Clock, category: "Trabalho" },
  { value: "award", label: "Prêmios", icon: Award, category: "Trabalho" },
  { value: "wrench", label: "Serviços", icon: Wrench, category: "Trabalho" },
  { value: "crown", label: "Royalties", icon: Crown, category: "Trabalho" },

  // Financeiro
  { value: "trending-up", label: "Investimentos", icon: TrendingUp, category: "Financeiro" },
  { value: "piggy-bank", label: "Poupança", icon: PiggyBank, category: "Financeiro" },
  { value: "bar-chart", label: "Rendimentos", icon: BarChart, category: "Financeiro" },
  { value: "coins", label: "Criptomoedas", icon: Coins, category: "Financeiro" },
  { value: "credit-card", label: "Cartão", icon: CreditCard, category: "Financeiro" },
  { value: "banknote", label: "Dinheiro", icon: Banknote, category: "Financeiro" },
  { value: "calculator", label: "Cálculos", icon: Calculator, category: "Financeiro" },

  // Casa e Moradia
  { value: "home", label: "Casa", icon: Home, category: "Casa" },
  { value: "building", label: "Prédio", icon: Building, category: "Casa" },
  { value: "hammer", label: "Reforma", icon: Hammer, category: "Casa" },
  { value: "sofa", label: "Móveis", icon: Sofa, category: "Casa" },
  { value: "zap", label: "Energia", icon: Zap, category: "Casa" },
  { value: "droplets", label: "Água", icon: Droplets, category: "Casa" },
  { value: "flame", label: "Gás", icon: Flame, category: "Casa" },
  { value: "wifi", label: "Internet", icon: Wifi, category: "Casa" },
  { value: "phone", label: "Telefone", icon: Phone, category: "Casa" },

  // Alimentação
  { value: "utensils", label: "Restaurante", icon: Utensils, category: "Alimentação" },
  { value: "shopping-cart", label: "Supermercado", icon: ShoppingCart, category: "Alimentação" },
  { value: "truck", label: "Delivery", icon: Truck, category: "Alimentação" },

  // Transporte
  { value: "car", label: "Carro", icon: Car, category: "Transporte" },
  { value: "fuel", label: "Combustível", icon: Fuel, category: "Transporte" },
  { value: "bus", label: "Transporte Público", icon: Bus, category: "Transporte" },
  { value: "shield", label: "Seguro", icon: Shield, category: "Transporte" },
  { value: "clipboard-check", label: "Documentos", icon: ClipboardCheck, category: "Transporte" },

  // Saúde
  { value: "heart", label: "Saúde", icon: Heart, category: "Saúde" },
  { value: "pill", label: "Medicamentos", icon: Pill, category: "Saúde" },
  { value: "stethoscope", label: "Médico", icon: Stethoscope, category: "Saúde" },
  { value: "activity", label: "Exames", icon: Activity, category: "Saúde" },
  { value: "dumbbell", label: "Academia", icon: Dumbbell, category: "Saúde" },

  // Educação
  { value: "graduation-cap", label: "Educação", icon: GraduationCap, category: "Educação" },
  { value: "book-open", label: "Cursos", icon: BookOpen, category: "Educação" },
  { value: "book", label: "Livros", icon: Book, category: "Educação" },

  // Lazer
  { value: "smile", label: "Lazer", icon: Smile, category: "Lazer" },
  { value: "film", label: "Cinema", icon: Film, category: "Lazer" },
  { value: "play-circle", label: "Streaming", icon: PlayCircle, category: "Lazer" },
  { value: "plane", label: "Viagens", icon: Plane, category: "Lazer" },
  { value: "palette", label: "Hobbies", icon: Palette, category: "Lazer" },
  // Vestuário
  { value: "shirt", label: "Roupas", icon: Shirt, category: "Vestuário" },
  { value: "scissors", label: "Cabeleireiro", icon: Scissors, category: "Vestuário" },

  // Compras
  { value: "shopping-bag", label: "Compras", icon: ShoppingBag, category: "Compras" },
  { value: "tag", label: "Vendas", icon: Tag, category: "Compras" },
  { value: "gift", label: "Presentes", icon: Gift, category: "Compras" },

  // Documentos
  { value: "file-text", label: "Documentos", icon: FileText, category: "Documentos" },
  { value: "receipt", label: "Impostos", icon: Receipt, category: "Documentos" },

  // Benefícios
  { value: "shield-check", label: "Benefícios", icon: ShieldCheck, category: "Benefícios" },
  { value: "heart-handshake", label: "Doações", icon: HeartHandshake, category: "Benefícios" },
  { value: "rotate-ccw", label: "Reembolsos", icon: RotateCcw, category: "Benefícios" },
  { value: "trophy", label: "Prêmios", icon: Trophy, category: "Benefícios" },
  { value: "sun", label: "Férias", icon: Sun, category: "Benefícios" },

  // Outros
  { value: "alert-triangle", label: "Multas", icon: AlertTriangle, category: "Outros" },
  { value: "more-horizontal", label: "Outros", icon: MoreHorizontal, category: "Outros" },
  { value: "plus-circle", label: "Adicionar", icon: Plus, category: "Outros" },
  { value: "circle", label: "Padrão", icon: Circle, category: "Outros" },
];

const availableColors = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#6b7280", "#64748b", "#475569"
];

// Grupos de categorias para melhor organização
const categoryGroups = {
  income: {
    "Trabalho e Renda": ["Salário", "Freelance", "Consultoria", "Comissões", "Horas Extras", "13º Salário", "Férias", "PLR/Bônus"],
    "Investimentos": ["Dividendos", "Juros/Rendimentos", "Venda de Investimentos", "Criptomoedas"],
    "Negócios": ["Vendas de Produtos", "Prestação de Serviços", "Royalties"],
    "Patrimônio": ["Aluguel Recebido", "Venda de Bens"],
    "Benefícios": ["Pensão/Aposentadoria", "Auxílio/Benefício", "Reembolsos", "Prêmios/Sorteios", "Outros Rendimentos"]
  },
  expense: {
    "Moradia": ["Aluguel/Financiamento", "Condomínio", "IPTU", "Manutenção Casa", "Móveis/Decoração"],
    "Utilidades": ["Energia Elétrica", "Água/Esgoto", "Gás", "Internet/TV", "Telefone"],
    "Alimentação": ["Supermercado", "Restaurantes", "Delivery/Lanches", "Padaria/Açougue"],
    "Transporte": ["Combustível", "Transporte Público", "Uber/Taxi", "Manutenção Veículo", "Seguro Veículo", "IPVA/Licenciamento", "Estacionamento"],
    "Saúde": ["Plano de Saúde", "Medicamentos", "Consultas Médicas", "Exames", "Dentista", "Academia/Esportes"],
    "Educação": ["Mensalidade Escolar", "Cursos/Capacitação", "Livros/Material"],
    "Lazer": ["Cinema/Teatro", "Streaming/Assinaturas", "Viagens", "Hobbies", "Festas/Eventos"],
    "Vestuário": ["Roupas/Calçados", "Cabeleireiro/Estética", "Produtos de Higiene"],
    "Financeiro": ["Poupança", "Investimentos", "Previdência Privada", "Cartão de Crédito", "Empréstimos", "Financiamentos"],
    "Impostos": ["Imposto de Renda", "Taxas Bancárias", "Cartório/Documentos"],
    "Família": ["Cuidados com Pets", "Presentes", "Pensão Alimentícia"],
    "Outros": ["Doações", "Multas", "Outros Gastos"]
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6366f1",
    icon: "circle",
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
        .eq("is_active", showInactive ? false : true)
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
        const { error } = await supabase.from("categories").insert({
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
      setFormData({
        name: "",
        type: "expense",
        color: "#6366f1",
        icon: "circle",
      });
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.code === "23505") {
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

    if (
      !confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)
    ) {
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
    setFormData({
      name: "",
      type: "expense",
      color: "#6366f1",
      icon: "circle",
    });
    setEditingCategory(null);
  };

  // Filtros e agrupamentos
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (activeTab !== "all") {
      filtered = filtered.filter(cat => cat.type === activeTab);
    }

    // Filtro por grupo
    if (selectedGroup !== "all") {
      const groupCategories = categoryGroups[activeTab as keyof typeof categoryGroups]?.[selectedGroup] || [];
      filtered = filtered.filter(cat => groupCategories.includes(cat.name));
    }

    return filtered;
  }, [categories, searchTerm, activeTab, selectedGroup]);

  const incomeCategories = filteredCategories.filter((cat) => cat.type === "income");
  const expenseCategories = filteredCategories.filter((cat) => cat.type === "expense");
  const allCategories = activeTab === "all" ? filteredCategories : activeTab === "income" ? incomeCategories : expenseCategories;

  // Estatísticas
  const stats = useMemo(() => {
    const total = categories.length;
    const income = categories.filter(cat => cat.type === "income").length;
    const expense = categories.filter(cat => cat.type === "expense").length;
    const custom = categories.filter(cat => !cat.is_default).length;
    const defaultCount = categories.filter(cat => cat.is_default).length;

    return { total, income, expense, custom, default: defaultCount };
  }, [categories]);

  const CategoryCard = ({ category }: { category: Category }) => {
    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Circle;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-knumbers-green/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: category.color + "20" }}
            >
              <IconComponent
                className="w-6 h-6"
                style={{ color: category.color }}
              />
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(category)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              {!category.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{category.name}</h3>
            <div className="flex items-center justify-between">
              <Badge 
                variant={category.type === "income" ? "default" : "destructive"} 
                className="text-xs"
              >
                {category.type === "income" ? "Receita" : "Despesa"}
              </Badge>
              {category.is_default && (
                <Badge variant="secondary" className="text-xs">
                  Padrão
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategoryListItem = ({ category }: { category: Category }) => {
    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Circle;
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center space-x-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: category.color + "20" }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: category.color }}
            />
          </div>
          <div>
            <h3 className="font-medium">{category.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={category.type === "income" ? "default" : "destructive"} 
                className="text-xs"
              >
                {category.type === "income" ? "Receita" : "Despesa"}
              </Badge>
              {category.is_default && (
                <Badge variant="secondary" className="text-xs">
                  Padrão
                </Badge>
              )}
            </div>
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
  };

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-knumbers-green/10 via-background to-knumbers-purple/10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorias Financeiras</h1>
              <p className="text-muted-foreground mt-1">
                Organize suas receitas e despesas com categorias personalizadas
              </p>
            </div>
            
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Atualize as informações da categoria"
                      : "Crie uma nova categoria personalizada para suas transações"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Ex: Alimentação, Salário..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Tipo
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "income" | "expense") =>
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
                        onValueChange={(value) =>
                          setFormData({ ...formData, icon: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Object.entries(
                            availableIcons.reduce((acc, icon) => {
                              if (!acc[icon.category]) acc[icon.category] = [];
                              acc[icon.category].push(icon);
                              return acc;
                            }, {} as Record<string, typeof availableIcons>)
                          ).map(([category, icons]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                                {category}
                              </div>
                              {icons.map((iconOption) => {
                                const IconComponent = iconOption.icon;
                                return (
                                  <SelectItem
                                    key={iconOption.value}
                                    value={iconOption.value}
                                  >
                                    <div className="flex items-center">
                                      <IconComponent className="w-4 h-4 mr-2" />
                                      {iconOption.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Cor</Label>
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                                formData.color === color
                                  ? "border-foreground ring-2 ring-offset-2 ring-knumbers-green"
                                  : "border-border hover:border-foreground"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setFormData({ ...formData, color })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingCategory ? "Atualizar" : "Criar Categoria"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-knumbers-green">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.income}</div>
                <div className="text-sm text-muted-foreground">Receitas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.expense}</div>
                <div className="text-sm text-muted-foreground">Despesas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.custom}</div>
                <div className="text-sm text-muted-foreground">Personalizadas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.default}</div>
                <div className="text-sm text-muted-foreground">Padrão</div>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedGroup === "all" ? "Todos os Grupos" : selectedGroup}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setSelectedGroup("all")}>
                    Todos os Grupos
                  </DropdownMenuItem>
                  <Separator />
                  {activeTab !== "all" && categoryGroups[activeTab as keyof typeof categoryGroups] && 
                    Object.keys(categoryGroups[activeTab as keyof typeof categoryGroups]).map(group => (
                      <DropdownMenuItem key={group} onClick={() => setSelectedGroup(group)}>
                        {group}
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                onClick={() => setShowInactive(!showInactive)}
                className="justify-start"
              >
                {showInactive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showInactive ? "Inativas" : "Ativas"}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Todas ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="income" className="text-green-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Receitas ({stats.income})
              </TabsTrigger>
              <TabsTrigger value="expense" className="text-red-600">
                <TrendingDown className="w-4 h-4 mr-2" />
                Despesas ({stats.expense})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-knumbers-green"></div>
                </div>
              ) : allCategories.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Circle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Tente ajustar os filtros de busca" : "Comece criando sua primeira categoria"}
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Categoria
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === "cards" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-2"
                }>
                  {allCategories.map((category) => 
                    viewMode === "cards" ? (
                      <CategoryCard key={category.id} category={category} />
                    ) : (
                      <CategoryListItem key={category.id} category={category} />
                    )
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="income" className="space-y-6 mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-knumbers-green"></div>
                </div>
              ) : incomeCategories.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma categoria de receita encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie categorias para organizar suas entradas de dinheiro
                    </p>
                    <Button onClick={() => {
                      setFormData({...formData, type: "income"});
                      setDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Categoria de Receita
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === "cards" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-2"
                }>
                  {incomeCategories.map((category) => 
                    viewMode === "cards" ? (
                      <CategoryCard key={category.id} category={category} />
                    ) : (
                      <CategoryListItem key={category.id} category={category} />
                    )
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expense" className="space-y-6 mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-knumbers-green"></div>
                </div>
              ) : expenseCategories.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingDown className="w-12 h-12 mx-auto text-red-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma categoria de despesa encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie categorias para organizar seus gastos
                    </p>
                    <Button onClick={() => {
                      setFormData({...formData, type: "expense"});
                      setDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Categoria de Despesa
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === "cards" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-2"
                }>
                  {expenseCategories.map((category) => 
                    viewMode === "cards" ? (
                      <CategoryCard key={category.id} category={category} />
                    ) : (
                      <CategoryListItem key={category.id} category={category} />
                    )
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}