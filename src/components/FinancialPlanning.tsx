
import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  TrendingUp,
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
  HelpCircle,
  Edit3,
  Trash2,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EntryForm } from "@/components/forms/EntryForm";
import { ExpenseForm } from "@/components/forms/ExpenseForm";

const categories = [
  { id: "moradia", name: "Moradia", icon: Home, color: "bg-blue-500" },
  { id: "alimentacao", name: "Alimentação", icon: Utensils, color: "bg-green-500" },
  { id: "mobilidade", name: "Mobilidade", icon: Car, color: "bg-purple-500" },
  { id: "saude", name: "Saúde", icon: Heart, color: "bg-red-500" },
  { id: "compras", name: "Compras", icon: ShoppingBag, color: "bg-yellow-500" },
  { id: "lazer", name: "Lazer", icon: Gamepad2, color: "bg-pink-500" },
];

const incomeCategories = [
  { id: "salario", name: "Salário", icon: DollarSign, color: "bg-green-500" },
  { id: "freelance", name: "Freelance", icon: TrendingUp, color: "bg-blue-500" },
  { id: "comissao", name: "Comissão", icon: Target, color: "bg-purple-500" },
  { id: "investimentos", name: "Investimentos", icon: PiggyBank, color: "bg-yellow-500" },
  { id: "bonus", name: "Bônus", icon: Heart, color: "bg-red-500" },
];

const availableIcons = [
  { id: "dollar", icon: DollarSign, name: "Dinheiro" },
  { id: "trending-up", icon: TrendingUp, name: "Crescimento" },
  { id: "target", icon: Target, name: "Meta" },
  { id: "piggy-bank", icon: PiggyBank, name: "Poupança" },
  { id: "heart", icon: Heart, name: "Coração" },
  { id: "home", icon: Home, name: "Casa" },
  { id: "car", icon: Car, name: "Carro" },
  { id: "utensils", icon: Utensils, name: "Comida" },
  { id: "shopping-bag", icon: ShoppingBag, name: "Compras" },
  { id: "gamepad", icon: Gamepad2, name: "Jogos" },
];

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function FinancialPlanning() {
  const { user } = useAuth();
  const { transactionSyncKey, triggerTransactionSync } = useDataSync();
  const [selectedMonth, setSelectedMonth] = useState("Outubro");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formStep, setFormStep] = useState(1);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [entryForm, setEntryForm] = useState({
    description: "",
    value: "",
    date: "",
    category: "",
    notes: "",
    isRecurring: false,
    recurrenceType: "",
    installments: "",
  });

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customIncomeCategories, setCustomIncomeCategories] = useState<any[]>([]);
  const [newCategoryIcon, setNewCategoryIcon] = useState("dollar");

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    planned: "",
    date: "",
    category: "",
    notes: "",
    isRecurring: false,
    recurrenceType: "",
    installments: "",
  });

  const [showNewExpenseCategoryInput, setShowNewExpenseCategoryInput] = useState(false);
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState("");
  const [customExpenseCategories, setCustomExpenseCategories] = useState<any[]>([]);
  const [newExpenseCategoryIcon, setNewExpenseCategoryIcon] = useState("dollar");

  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState("");

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>({});

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);

  // Função para carregar dados existentes do banco
  const loadExistingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar items de planejamento do usuário (permanente)
      const { data: budgetItems, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Error loading budget items:', error);
        toast.error('Erro ao carregar dados de planejamento');
        return;
      }

      // Separar entradas e despesas
      const incomeBudgets = budgetItems?.filter(b => b.type === 'income') || [];
      const expenseBudgets = budgetItems?.filter(b => b.type === 'expense') || [];

      // Buscar transações para calcular gastos reais
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Pago', 'Recebido']);

      // Converter para formato do componente
      const loadedEntries = incomeBudgets.map(budget => {
        // Calcular quanto já foi recebido desta categoria no mês/ano
        const received = transactions?.filter(t => {
          const tDate = new Date(t.date);
          return t.transaction_type === 'income' && 
                 t.category === budget.category &&
                 tDate.getMonth() + 1 === budget.month &&
                 tDate.getFullYear() === budget.year;
        }).reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        return {
          id: budget.id,
          date: `${budget.year}-${String(budget.month).padStart(2, '0')}-01`,
          description: budget.description || budget.category,
          category: budget.category,
          value: Number(budget.planned_amount),
          spent: received,
          available: Number(budget.planned_amount) - received,
          type: "Entrada",
          notes: '',
          isRecurring: budget.is_recurring,
          recurrenceType: budget.recurrence_type || '',
          installments: '',
        };
      });

      const loadedExpenses = expenseBudgets.map(budget => {
        // Calcular quanto já foi gasto desta categoria no mês/ano
        const spent = transactions?.filter(t => {
          const tDate = new Date(t.date);
          return t.transaction_type === 'expense' && 
                 t.category === budget.category &&
                 tDate.getMonth() + 1 === budget.month &&
                 tDate.getFullYear() === budget.year;
        }).reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        return {
          id: budget.id,
          date: `${budget.year}-${String(budget.month).padStart(2, '0')}-01`,
          description: budget.description || budget.category,
          category: budget.category,
          planned: Number(budget.planned_amount),
          spent: spent,
          available: Number(budget.planned_amount) - spent,
          type: "Despesa",
          notes: '',
          isRecurring: budget.is_recurring,
          recurrenceType: budget.recurrence_type || '',
          installments: '',
        };
      });

      setEntries(loadedEntries);
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error in loadExistingData:', error);
      toast.error('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente monta, quando o usuário muda ou quando transações são atualizadas
  useEffect(() => {
    if (user) {
      loadExistingData();
    } else {
      setLoading(false);
    }
  }, [user, transactionSyncKey]);

  // Configurar Supabase Realtime para escutar mudanças na tabela transactions
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for transactions...');
    
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Transaction changed:', payload);
          
          // Se uma transação foi atualizada para status "Pago" ou "Recebido"
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const transaction = payload.new;
            if (transaction.status === 'Pago' || transaction.status === 'Recebido') {
              console.log('Transaction marked as paid/received, reloading data...');
              setSyncing(true);
              await loadExistingData();
              setSyncing(false);
              toast.success('Dados sincronizados automaticamente!');
            }
          }
          
          // Se uma transação foi deletada
          if (payload.eventType === 'DELETE') {
            console.log('Transaction deleted, reloading data...');
            setSyncing(true);
            await loadExistingData();
            setSyncing(false);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Função para atualização manual
  const manualRefresh = async () => {
    setSyncing(true);
    await loadExistingData();
    setSyncing(false);
    toast.success('Dados atualizados!');
  };

  // Helper function to get month index from name
  const getMonthIndex = (monthName: string) => {
    return months.indexOf(monthName);
  };

  // Filter entries and expenses by selected month and year
  const filteredEntries = entries.filter((entry) => {
    if (!entry.date) return false;
    // Se a data está em formato ISO (YYYY-MM-DD), usar diretamente
    // Se está em formato brasileiro (DD/MM/YYYY), converter
    let entryDate;
    if (entry.date.includes('-')) {
      // Formato ISO (YYYY-MM-DD)
      entryDate = new Date(entry.date + 'T00:00:00');
    } else {
      // Formato brasileiro (DD/MM/YYYY)
      const [day, month, year] = entry.date.split('/');
      entryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const entryMonth = entryDate.getMonth();
    const entryYear = entryDate.getFullYear();
    const selectedMonthIndex = getMonthIndex(selectedMonth);
    return entryMonth === selectedMonthIndex && entryYear === selectedYear;
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (!expense.date) return false;
    // Se a data está em formato ISO (YYYY-MM-DD), usar diretamente
    // Se está em formato brasileiro (DD/MM/YYYY), converter
    let expenseDate;
    if (expense.date.includes('-')) {
      // Formato ISO (YYYY-MM-DD)
      expenseDate = new Date(expense.date + 'T00:00:00');
    } else {
      // Formato brasileiro (DD/MM/YYYY)
      const [day, month, year] = expense.date.split('/');
      expenseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    const selectedMonthIndex = getMonthIndex(selectedMonth);
    return expenseMonth === selectedMonthIndex && expenseYear === selectedYear;
  });

  const totalIncome = filteredEntries.reduce((sum, entry) => sum + entry.value, 0);
  const totalPlanned = filteredExpenses.reduce((sum, expense) => sum + expense.planned, 0);
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const totalAvailable = totalIncome - totalSpent;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está em formato brasileiro (DD/MM/YYYY), retornar como está
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Se está em formato ISO (YYYY-MM-DD), converter para brasileiro
    if (dateString.includes('-')) {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString("pt-BR");
    }
    
    return dateString;
  };

  const getAvailableColor = (available: number) => {
    if (available > 0) return "text-green-600";
    if (available === 0) return "text-blue-600";
    return "text-red-600";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = [...categories, ...incomeCategories, ...customIncomeCategories, ...customExpenseCategories].find(cat => cat.id === categoryId);
    return category ? category.icon : DollarSign;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = [...categories, ...incomeCategories, ...customIncomeCategories, ...customExpenseCategories].find(cat => cat.id === categoryId);
    return category ? category.color : "bg-gray-500";
  };

  const getCategoryExpenses = (categoryId: string) => {
    return expenses.filter((expense) => expense.category === categoryId);
  };

  const getCategoryTotals = (categoryId: string) => {
    const categoryExpenses = getCategoryExpenses(categoryId);
    const planned = categoryExpenses.reduce((sum, expense) => sum + expense.planned, 0);
    const spent = categoryExpenses.reduce((sum, expense) => sum + expense.spent, 0);
    const available = planned - spent;
    const percentage = planned > 0 ? (spent / planned) * 100 : 0;
    return { planned, spent, available, percentage };
  };

  const handleDeleteConfirm = (item: any, type: string) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!user) return;

    try {
      if (deleteType === "entry") {
        // Remover do banco de dados (budget_items)
        const { error: budgetError } = await supabase
          .from('budget_items')
          .delete()
          .eq('id', itemToDelete.id);

        if (budgetError) {
          console.error('Error deleting budget item:', budgetError);
          toast.error('Erro ao excluir entrada do banco de dados');
          return;
        }

        // Para entradas (income), também remover transações relacionadas
        const monthIndex = getMonthIndex(selectedMonth);
        
        const { error: transactionError } = await supabase
          .from("transactions")
          .delete()
          .eq("user_id", user.id)
          .eq("category", itemToDelete.category)
          .eq("description", itemToDelete.description)
          .gte("date", `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01`)
          .lte("date", `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-31`);

        if (transactionError) {
          console.warn("Erro ao deletar transações relacionadas:", transactionError);
        }

        setEntries((prev) => prev.filter((entry) => entry.id !== itemToDelete.id));
        
        // Disparar sincronização para atualizar tela de transações
        triggerTransactionSync();
        
        toast.success('Entrada excluída com sucesso!');
      } else {
        // Remover despesa do banco de dados (budget_items)
        const { error: budgetError } = await supabase
          .from('budget_items')
          .delete()
          .eq('id', itemToDelete.id);

        if (budgetError) {
          console.error('Error deleting budget item:', budgetError);
          toast.error('Erro ao excluir despesa do banco de dados');
          return;
        }

        // Para saídas recorrentes, também remover transações relacionadas
        if (itemToDelete.isRecurring) {
          const monthIndex = getMonthIndex(selectedMonth);
          
          const { error: transactionError } = await supabase
            .from("transactions")
            .delete()
            .eq("user_id", user.id)
            .eq("category", itemToDelete.category)
            .eq("description", itemToDelete.description)
            .gte("date", `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01`)
            .lte("date", `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-31`);

          if (transactionError) {
            console.warn("Erro ao deletar transações relacionadas:", transactionError);
          }
        }

        setExpenses((prev) => prev.filter((expense) => expense.id !== itemToDelete.id));
        
        // Disparar sincronização para atualizar tela de transações
        triggerTransactionSync();
        
        toast.success('Despesa excluída com sucesso!');
      }
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      toast.error('Erro inesperado ao excluir item');
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    setDeleteType("");
  };

  const handleSaveEntry = async () => {
    if (entryForm.category && user) {
      try {
        if (editingEntry) {
          // Atualizar budget_item existente
          const amount = Number.parseFloat(entryForm.value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          
          const { error } = await supabase
            .from('budget_items')
            .update({
              description: entryForm.description || "Nova Entrada",
              planned_amount: amount,
              category: entryForm.category,
            })
            .eq('id', editingEntry.id);

          if (error) {
            console.error('Error updating budget item:', error);
            toast.error('Erro ao atualizar entrada');
            return;
          }

          toast.success('Entrada atualizada com sucesso!');
          await loadExistingData();
        } else {
          const baseDate = new Date(entryForm.date || new Date());
          const baseAmount = Number.parseFloat(entryForm.value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          
          const budgetItemsToCreate = [];
          const transactionsToCreate = [];

          if (entryForm.isRecurring && entryForm.recurrenceType) {
            let monthsToCreate = 1;
            
            switch (entryForm.recurrenceType) {
              case 'parcelada':
                monthsToCreate = parseInt(entryForm.installments) || 1;
                break;
              case 'mensal':
                monthsToCreate = 12;
                break;
              case 'trimestral':
                monthsToCreate = 3;
                break;
              case 'semestral':
                monthsToCreate = 6;
                break;
              case 'anual':
                monthsToCreate = 1;
                break;
              default:
                monthsToCreate = 1;
            }

            for (let i = 0; i < monthsToCreate; i++) {
              const itemDate = new Date(baseDate);
              itemDate.setMonth(itemDate.getMonth() + i);
              
              const description = entryForm.recurrenceType === 'parcelada' ? 
                `${entryForm.description || "Nova Entrada"} (${i + 1}/${monthsToCreate})` : 
                (entryForm.description || "Nova Entrada");

              // Criar budget_item (planejamento permanente)
              budgetItemsToCreate.push({
                user_id: user.id,
                planned_amount: baseAmount,
                description: description,
                category: entryForm.category,
                type: 'income',
                month: itemDate.getMonth() + 1,
                year: itemDate.getFullYear(),
                is_recurring: entryForm.isRecurring,
                recurrence_type: entryForm.recurrenceType,
              });

              // Criar transaction (lançamento de caixa)
              transactionsToCreate.push({
                user_id: user.id,
                amount: baseAmount,
                description: description,
                category: entryForm.category,
                transaction_type: 'income',
                date: itemDate.toISOString().split('T')[0],
                source: 'planning',
                status: 'Em Aberto',
                original_message: `Planejamento${entryForm.isRecurring ? ` - Recorrente: ${entryForm.recurrenceType}` : ''} - ${description}`,
              });
            }
          } else {
            // Criar budget_item único
            budgetItemsToCreate.push({
              user_id: user.id,
              planned_amount: baseAmount,
              description: entryForm.description || "Nova Entrada",
              category: entryForm.category,
              type: 'income',
              month: baseDate.getMonth() + 1,
              year: baseDate.getFullYear(),
              is_recurring: false,
            });

            // Criar transaction única
            transactionsToCreate.push({
              user_id: user.id,
              amount: baseAmount,
              description: entryForm.description || "Nova Entrada",
              category: entryForm.category,
              transaction_type: 'income',
              date: baseDate.toISOString().split('T')[0],
              source: 'planning',
              status: 'Em Aberto',
              original_message: `Planejamento - ${entryForm.description || "Nova Entrada"}`,
            });
          }

          // Salvar budget_items (planejamento)
          const { error: budgetError } = await supabase
            .from('budget_items')
            .insert(budgetItemsToCreate);

          if (budgetError) {
            console.error('Error saving budget items:', budgetError);
            toast.error('Erro ao salvar planejamento');
            return;
          }

          // Salvar transactions (lançamentos)
          const { error: transError } = await supabase
            .from('transactions')
            .insert(transactionsToCreate);

          if (transError) {
            console.error('Error saving transactions:', transError);
            toast.error('Erro ao criar lançamentos');
            return;
          }

          toast.success(`${budgetItemsToCreate.length > 1 ? budgetItemsToCreate.length + ' entradas' : 'Entrada'} criada${budgetItemsToCreate.length > 1 ? 's' : ''} com sucesso!`);
          
          // Recarregar dados
          await loadExistingData();
        }

        setEntryForm({
          description: "",
          value: "",
          date: "",
          category: "",
          notes: "",
          isRecurring: false,
          recurrenceType: "",
          installments: "",
        });
        setEditingEntry(null);
        setFormStep(1);
        setIsSheetOpen(false);
      } catch (error) {
        console.error('Error in handleSaveEntry:', error);
        toast.error('Erro inesperado ao salvar entrada');
      }
    } else {
      toast.error('Por favor, selecione uma categoria');
    }
  };

  const handleSaveExpense = async () => {
    if (expenseForm.category && user) {
      try {
        if (editingExpense) {
          // Atualizar budget_item existente
          const amount = Number.parseFloat(expenseForm.planned.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          
          const { error } = await supabase
            .from('budget_items')
            .update({
              description: expenseForm.description || "Nova Despesa",
              planned_amount: amount,
              category: expenseForm.category,
            })
            .eq('id', editingExpense.id);

          if (error) {
            console.error('Error updating budget item:', error);
            toast.error('Erro ao atualizar despesa');
            return;
          }

          toast.success('Despesa atualizada com sucesso!');
          await loadExistingData();
        } else {
          const baseDate = new Date(expenseForm.date || new Date());
          const baseAmount = Number.parseFloat(expenseForm.planned.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          
          const budgetItemsToCreate = [];
          const transactionsToCreate = [];

          if (expenseForm.isRecurring && expenseForm.recurrenceType) {
            let monthsToCreate = 1;
            
            switch (expenseForm.recurrenceType) {
              case 'parcelada':
                monthsToCreate = parseInt(expenseForm.installments) || 1;
                break;
              case 'mensal':
                monthsToCreate = 12;
                break;
              case 'trimestral':
                monthsToCreate = 3;
                break;
              case 'semestral':
                monthsToCreate = 6;
                break;
              case 'anual':
                monthsToCreate = 1;
                break;
              default:
                monthsToCreate = 1;
            }

            for (let i = 0; i < monthsToCreate; i++) {
              const itemDate = new Date(baseDate);
              itemDate.setMonth(itemDate.getMonth() + i);
              
              const description = expenseForm.recurrenceType === 'parcelada' ? 
                `${expenseForm.description || "Nova Despesa"} (${i + 1}/${monthsToCreate})` : 
                (expenseForm.description || "Nova Despesa");

              // Criar budget_item (planejamento permanente)
              budgetItemsToCreate.push({
                user_id: user.id,
                planned_amount: baseAmount,
                description: description,
                category: expenseForm.category,
                type: 'expense',
                month: itemDate.getMonth() + 1,
                year: itemDate.getFullYear(),
                is_recurring: expenseForm.isRecurring,
                recurrence_type: expenseForm.recurrenceType,
              });

              // Criar transaction (lançamento de caixa)
              transactionsToCreate.push({
                user_id: user.id,
                amount: baseAmount,
                description: description,
                category: expenseForm.category,
                transaction_type: 'expense',
                date: itemDate.toISOString().split('T')[0],
                source: 'planning',
                status: 'Em Aberto',
                original_message: `Planejamento${expenseForm.isRecurring ? ` - Recorrente: ${expenseForm.recurrenceType}` : ''} - ${description}`,
              });
            }
          } else {
            // Criar budget_item único (apenas planejamento, sem criar transação)
            budgetItemsToCreate.push({
              user_id: user.id,
              planned_amount: baseAmount,
              description: expenseForm.description || "Nova Despesa",
              category: expenseForm.category,
              type: 'expense',
              month: baseDate.getMonth() + 1,
              year: baseDate.getFullYear(),
              is_recurring: false,
            });
            
            // NÃO criar transaction para saídas não recorrentes
            // Estas são apenas planejamentos de categoria, não gastos reais
          }

          // Salvar budget_items (planejamento)
          const { error: budgetError } = await supabase
            .from('budget_items')
            .insert(budgetItemsToCreate);

          if (budgetError) {
            console.error('Error saving budget items:', budgetError);
            toast.error('Erro ao salvar planejamento');
            return;
          }

          // Salvar transactions (lançamentos) - apenas para recorrentes
          if (transactionsToCreate.length > 0) {
            const { error: transError } = await supabase
              .from('transactions')
              .insert(transactionsToCreate);

            if (transError) {
              console.error('Error saving transactions:', transError);
              toast.error('Erro ao criar lançamentos');
              return;
            }
          }

          toast.success(`${budgetItemsToCreate.length > 1 ? budgetItemsToCreate.length + ' despesas' : 'Despesa'} criada${budgetItemsToCreate.length > 1 ? 's' : ''} com sucesso!`);
          
          // Recarregar dados
          await loadExistingData();
        }

        setExpenseForm({
          description: "",
          planned: "",
          date: "",
          category: "",
          notes: "",
          isRecurring: false,
          recurrenceType: "",
          installments: "",
        });
        setEditingExpense(null);
        setFormStep(1);
        setIsExpenseSheetOpen(false);
      } catch (error) {
        console.error('Error in handleSaveExpense:', error);
        toast.error('Erro inesperado ao salvar despesa');
      }
    } else {
      toast.error('Por favor, selecione uma categoria');
    }
  };


  const CardDetailModal = ({ type, title, value, icon: Icon, color }: any) => (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`border-${color.split("-")[1]}-200 bg-gradient-to-br from-${color.split("-")[1]}-50 to-${color.split("-")[1]}-100 hover:shadow-md transition-shadow cursor-pointer`}
        >
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium text-${color.split("-")[1]}-700 flex items-center gap-2`}>
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${color.split("-")[1]}-800`}>R$ {formatCurrency(value)}</div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-2xl font-bold text-gray-800">R$ {formatCurrency(value)}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {type === "income" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Entradas</span>
                <span className="font-semibold">R$ {formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Já Utilizado</span>
                <span className="font-semibold text-red-600">R$ {formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Disponível</span>
                <span className="font-semibold text-green-600">R$ {formatCurrency(totalAvailable)}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Suas Entradas</h4>
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center py-2">
                    <span className="text-sm">{entry.description}</span>
                    <span className="font-medium">R$ {formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === "planned" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Planejado</span>
                <span className="font-semibold">R$ {formatCurrency(totalPlanned)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Já Gasto</span>
                <span className="font-semibold text-red-600">R$ {formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Restante</span>
                <span className="font-semibold text-purple-600">R$ {formatCurrency(totalPlanned - totalSpent)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Planejamento</span>
                  <span>{totalPlanned > 0 ? ((totalSpent / totalPlanned) * 100).toFixed(0) : 0}%</span>
                </div>
                <Progress value={totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0} className="h-2" />
              </div>

              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Por Categoria</h4>
                {categories.map((category) => {
                  const totals = getCategoryTotals(category.id);
                  if (totals.planned === 0) return null;
                  return (
                    <div key={category.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${category.color}`}>
                          <category.icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="font-medium">R$ {formatCurrency(totals.planned)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === "spent" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Orçamento Total</span>
                <span className="font-semibold">R$ {formatCurrency(totalPlanned)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Gasto</span>
                <span className="font-semibold text-red-600">R$ {formatCurrency(totalSpent)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Orçamento</span>
                  <span>{totalPlanned > 0 ? ((totalSpent / totalPlanned) * 100).toFixed(0) : 0}%</span>
                </div>
                <Progress value={totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0} className="h-2" />
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Gastos Recentes</h4>
                {expenses
                  .filter((expense) => expense.spent > 0)
                  .map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center py-2">
                      <span className="text-sm">{expense.description}</span>
                      <span className="font-medium">R$ {formatCurrency(expense.spent)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {type === "available" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Entradas</span>
                <span className="font-semibold text-green-600">R$ {formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Gasto</span>
                <span className="font-semibold text-red-600">R$ {formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Disponível</span>
                <span className="font-semibold text-blue-600">R$ {formatCurrency(totalAvailable)}</span>
              </div>
              <Separator />
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Dica</h4>
                <p className="text-sm text-blue-700">
                  {totalAvailable > 0
                    ? "Você tem dinheiro disponível! Considere investir ou guardar para emergências."
                    : "Cuidado! Você está gastando mais do que ganha. Revise seu planejamento."}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 p-4">
        {loading ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                Hora de Planejar
              </h1>
              <p className="text-gray-600 text-lg">Carregando seus dados financeiros...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                Hora de Planejar
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={manualRefresh}
                disabled={syncing}
                className="rounded-full hover:bg-purple-100"
              >
                {syncing ? (
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                )}
              </Button>
            </div>
            <p className="text-gray-600 text-lg">
              Organize suas finanças de forma simples e eficiente
              {syncing && <span className="text-purple-600 ml-2 font-medium">• Sincronizando...</span>}
            </p>

            <div className="flex items-center justify-center gap-4">
              <Calendar className="h-5 w-5 text-purple-600" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48 border-purple-200 focus:border-purple-500 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32 border-purple-200 focus:border-purple-500 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardDetailModal
              type="income"
              title="Total de Entradas"
              value={totalIncome}
              icon={TrendingUp}
              color="bg-green-500"
            />

            <CardDetailModal
              type="planned"
              title="Total Planejado"
              value={totalPlanned}
              icon={Target}
              color="bg-purple-500"
            />

            <CardDetailModal
              type="spent"
              title="Total Gasto"
              value={totalSpent}
              icon={TrendingDown}
              color="bg-red-500"
            />

            <CardDetailModal
              type="available"
              title="Disponível"
              value={totalAvailable}
              icon={PiggyBank}
              color="bg-blue-500"
            />
          </div>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-700">ENTRADAS</CardTitle>
              </div>
              <Sheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                  setIsSheetOpen(open);
                  if (!open) {
                    setFormStep(1);
                    setEditingEntry(null);
                      setEntryForm({
                        description: "",
                        value: "",
                        date: "",
                        category: "",
                        notes: "",
                        isRecurring: false,
                        recurrenceType: "",
                        installments: "",
                      });
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Entrada
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Nova Entrada</SheetTitle>
                    <SheetDescription>Cadastre uma nova fonte de renda</SheetDescription>
                  </SheetHeader>
                  <div className="px-8 py-4 h-full">
                    <EntryForm 
                      entryForm={entryForm}
                      setEntryForm={setEntryForm}
                      incomeCategories={incomeCategories}
                      customIncomeCategories={customIncomeCategories}
                      editingEntry={editingEntry}
                      formStep={formStep}
                      setFormStep={setFormStep}
                      onSave={handleSaveEntry}
                      onCancel={() => setIsSheetOpen(false)}
                      setCustomIncomeCategories={setCustomIncomeCategories}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-green-300 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-bold text-gray-800">Data</TableHead>
                      <TableHead className="font-bold text-gray-800">Descrição</TableHead>
                      <TableHead className="font-bold text-gray-800">Categoria</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">
                        <div className="flex items-center justify-center gap-1">
                          Entrada
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-purple-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Valor total da entrada prevista</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Recebido</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Disponível</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => {
                      const Icon = getCategoryIcon(entry.category);
                      const colorClass = getCategoryColor(entry.category);
                      const isEditing = editingRowId === entry.id;

                      return (
                        <TableRow key={entry.id} className="hover:bg-gray-50">
                           <TableCell>
                             {isEditing ? (
                               <Input
                                 type="date"
                                 value={editingRowData.date || entry.date}
                                 onChange={(e) => setEditingRowData((prev) => ({ ...prev, date: e.target.value }))}
                                 className="h-8 text-sm rounded-3xl"
                               />
                             ) : (
                               formatDateForDisplay(entry.date)
                             )}
                           </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingRowData.description || entry.description}
                                onChange={(e) =>
                                  setEditingRowData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                className="h-8 text-sm rounded-3xl"
                                placeholder="Descrição"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${colorClass}`}>
                                  <Icon className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-medium">{entry.notes || entry.description}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={editingRowData.category || entry.category}
                                onValueChange={(value) => setEditingRowData((prev) => ({ ...prev, category: value }))}
                              >
                <SelectTrigger className="h-8 text-sm rounded-3xl">
                  <SelectValue />
                </SelectTrigger>
                                <SelectContent>
                                  {[...incomeCategories, ...customIncomeCategories].map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded ${category.color}`}>
                                          <category.icon className="h-3 w-3 text-white" />
                                        </div>
                                        {category.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                             ) : (
                               <div className="flex items-center gap-2 flex-wrap">
                                 <Badge variant="outline" className="capitalize">
                                   {
                                     [...incomeCategories, ...customIncomeCategories].find(
                                       (cat) => cat.id === entry.category,
                                     )?.name || entry.category
                                   }
                                 </Badge>
                                 {entry.isRecurring && (
                                   <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                     Recorrente
                                   </Badge>
                                 )}
                               </div>
                             )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isEditing ? (
                              <Input
                                value={editingRowData.value || entry.value.toString()}
                                onChange={(e) => setEditingRowData((prev) => ({ ...prev, value: e.target.value }))}
                                className="h-8 text-sm text-center rounded-3xl"
                                placeholder="0,00"
                              />
                            ) : (
                              <span className="font-bold">{formatCurrency(entry.value)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{formatCurrency(entry.spent)}</TableCell>
                          <TableCell className={`text-center font-bold ${getAvailableColor(entry.available)}`}>
                            {formatCurrency(entry.available)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600"
                                    onClick={() => {
                                      setEntries((prev) =>
                                        prev.map((e) =>
                                          e.id === entry.id
                                            ? {
                                                ...e,
                                                date: editingRowData.date || e.date,
                                                description: editingRowData.description || e.description,
                                                category: editingRowData.category || e.category,
                                                value:
                                                  Number.parseFloat(
                                                    editingRowData.value?.replace(/[^\d,]/g, "").replace(",", "."),
                                                  ) || e.value,
                                                available:
                                                  Number.parseFloat(
                                                    editingRowData.value?.replace(/[^\d,]/g, "").replace(",", "."),
                                                  ) || e.value,
                                              }
                                            : e,
                                        ),
                                      );
                                      setEditingRowId(null);
                                      setEditingRowData({});
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500"
                                    onClick={() => {
                                      setEditingRowId(null);
                                      setEditingRowData({});
                                    }}
                                  >
                                    <ArrowRight className="h-4 w-4 rotate-45" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingRowId(entry.id);
                                      setEditingRowData({
                                        date: entry.date,
                                        description: entry.description,
                                        category: entry.category,
                                        value: entry.value.toString(),
                                      });
                                    }}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500"
                                    onClick={() => handleDeleteConfirm(entry, "entry")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-purple-700">SAÍDAS</CardTitle>
              </div>
              <Sheet
                open={isExpenseSheetOpen}
                onOpenChange={(open) => {
                  setIsExpenseSheetOpen(open);
                  if (!open) {
                    setFormStep(1);
                    setEditingExpense(null);
                    setExpenseForm({
                      description: "",
                      planned: "",
                      date: "",
                      category: "",
                      notes: "",
                      isRecurring: false,
                      recurrenceType: "",
                      installments: "",
                    });
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Saída
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Nova Saída</SheetTitle>
                    <SheetDescription>Cadastre um novo gasto planejado</SheetDescription>
                  </SheetHeader>
                  <div className="px-8 py-4 h-full">
                    <ExpenseForm 
                      expenseForm={expenseForm}
                      setExpenseForm={setExpenseForm}
                      categories={categories}
                      customExpenseCategories={customExpenseCategories}
                      editingExpense={editingExpense}
                      formStep={formStep}
                      setFormStep={setFormStep}
                      onSave={handleSaveExpense}
                      onCancel={() => setIsExpenseSheetOpen(false)}
                      setCustomExpenseCategories={setCustomExpenseCategories}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-purple-300 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-bold text-gray-800">Data</TableHead>
                      <TableHead className="font-bold text-gray-800">Descrição</TableHead>
                      <TableHead className="font-bold text-gray-800">Categoria</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">
                        <div className="flex items-center justify-center gap-1">
                          Planejado
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-purple-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Valor planejado para esta despesa</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Gasto</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Disponível</TableHead>
                      <TableHead className="font-bold text-gray-800 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => {
                      const Icon = getCategoryIcon(expense.category);
                      const colorClass = getCategoryColor(expense.category);
                      const isEditing = editingRowId === expense.id;

                      return (
                        <TableRow key={expense.id} className="hover:bg-gray-50">
                           <TableCell>
                             {isEditing ? (
                               <Input
                                 type="date"
                                 value={editingRowData.date || expense.date}
                                 onChange={(e) => setEditingRowData((prev) => ({ ...prev, date: e.target.value }))}
                                 className="h-8 text-sm rounded-3xl"
                               />
                             ) : (
                               formatDateForDisplay(expense.date)
                             )}
                           </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingRowData.description || expense.description}
                                onChange={(e) =>
                                  setEditingRowData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                className="h-8 text-sm rounded-3xl"
                                placeholder="Descrição"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${colorClass}`}>
                                  <Icon className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-medium">{expense.description}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={editingRowData.category || expense.category}
                                onValueChange={(value) => setEditingRowData((prev) => ({ ...prev, category: value }))}
                              >
                <SelectTrigger className="h-8 text-sm rounded-3xl">
                  <SelectValue />
                </SelectTrigger>
                                <SelectContent>
                                  {[...categories, ...customExpenseCategories].map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded ${category.color}`}>
                                          <category.icon className="h-3 w-3 text-white" />
                                        </div>
                                        {category.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="capitalize">
                                  {
                                    [...categories, ...customExpenseCategories].find((cat) => cat.id === expense.category)
                                      ?.name || expense.category
                                  }
                                </Badge>
                                {expense.isRecurring && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                    Recorrente
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isEditing ? (
                              <Input
                                value={editingRowData.planned || expense.planned.toString()}
                                onChange={(e) => setEditingRowData((prev) => ({ ...prev, planned: e.target.value }))}
                                className="h-8 text-sm text-center rounded-3xl"
                                placeholder="0,00"
                              />
                            ) : (
                              <span className="font-bold">{formatCurrency(expense.planned)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{formatCurrency(expense.spent)}</TableCell>
                          <TableCell className={`text-center font-bold ${getAvailableColor(expense.available)}`}>
                            {formatCurrency(expense.available)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600"
                                    onClick={() => {
                                      setExpenses((prev) =>
                                        prev.map((e) =>
                                          e.id === expense.id
                                            ? {
                                                ...e,
                                                date: editingRowData.date || e.date,
                                                description: editingRowData.description || e.description,
                                                category: editingRowData.category || e.category,
                                                planned:
                                                  Number.parseFloat(
                                                    editingRowData.planned?.replace(/[^\d,]/g, "").replace(",", "."),
                                                  ) || e.planned,
                                                available:
                                                  (Number.parseFloat(
                                                    editingRowData.planned?.replace(/[^\d,]/g, "").replace(",", "."),
                                                  ) || e.planned) - e.spent,
                                              }
                                            : e,
                                        ),
                                      );
                                      setEditingRowId(null);
                                      setEditingRowData({});
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500"
                                    onClick={() => {
                                      setEditingRowId(null);
                                      setEditingRowData({});
                                    }}
                                  >
                                    <ArrowRight className="h-4 w-4 rotate-45" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingRowId(expense.id);
                                      setEditingRowData({
                                        date: expense.date,
                                        description: expense.description,
                                        category: expense.category,
                                        planned: expense.planned.toString(),
                                      });
                                    }}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500"
                                    onClick={() => handleDeleteConfirm(expense, "expense")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Tem certeza que deseja excluir "{itemToDelete?.description}"?</p>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
