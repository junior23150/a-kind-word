import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Calendar,
  Download,
  Printer,
  Trash2,
  Plus,
  ArrowLeftRight,
  ChevronDown,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical,
  Check,
  DollarSign,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { pt } from "date-fns/locale";
import { TransferSlideIn } from "@/components/transactions/TransferSlideIn";
import { TransactionSlideIn } from "@/components/transactions/TransactionSlideIn";
import { DateFilterModal } from "@/components/transactions/DateFilterModal";
import { PaymentConfirmationSlideIn } from "@/components/transactions/PaymentConfirmationSlideIn";
import { BankLogo } from "@/components/ui/BankLogo";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string | null;
  transaction_type: "income" | "expense";
  date: string;
  source: string;
  original_message: string;
  user_id: string;
  bank_account_id: string | null;
  payment_method?: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
  bank_account?: {
    id: string;
    bank_name: string;
    account_type: string;
  };
}

// Dados mockados removidos - usando apenas dados reais do Supabase

export function TransactionsPage() {
  const { user } = useAuth();
  const { triggerTransactionSync } = useDataSync();
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [dateLabel, setDateLabel] = useState("Este mês");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [transactionsForPayment, setTransactionsForPayment] = useState<Transaction[]>([]);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("Em aberto");
  const [filterCategory, setFilterCategory] = useState("Todas categorias");
  const [filterPaymentType, setFilterPaymentType] = useState("Todas");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("Todas");
  const [filterValue, setFilterValue] = useState("");
  const [filterDocumentNumber, setFilterDocumentNumber] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "income" | "expense"
  >("all");
  const { toast } = useToast();

  // Categories list
  const categories = [
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Salário",
    "Freelance",
    "Investimentos",
    "Outros",
  ];

  // Carregar transações do Supabase
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          bank_account:bank_accounts (
            id,
            bank_name,
            account_type
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar contas bancárias do Supabase
  const fetchBankAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("bank_name", { ascending: true });

      if (error) throw error;

      setBankAccounts(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas bancárias:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchBankAccounts();
    }
  }, [user, toast]);

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (transaction.category &&
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDateRange =
      transactionDate >= dateRange.from && transactionDate <= dateRange.to;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "income" &&
        transaction.transaction_type === "income") ||
      (activeFilter === "expense" &&
        transaction.transaction_type === "expense");

    const matchesAccount =
      selectedAccount === "all" ||
      transaction.bank_account_id === selectedAccount;

    return matchesSearch && matchesDateRange && matchesFilter && matchesAccount;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentAccountBalance = 0; // TODO: Calcular saldo real das contas do Supabase

  // Calcular valor das transações selecionadas corretamente (receitas - despesas)
  const selectedTransactionsValue = selectedTransactions.reduce((sum, id) => {
    const transaction = filteredTransactions.find((t) => t.id === id);
    if (!transaction) return sum;

    if (transaction.transaction_type === "income") {
      return sum + Math.abs(transaction.amount);
    } else {
      return sum - Math.abs(transaction.amount);
    }
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    // Parse the date as local time to avoid timezone issues
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("pt-BR");
  };

  // Função para calcular o status da transação
  const getTransactionStatus = (transaction: Transaction) => {
    // Sempre usar o status do banco (calculado pelo trigger e edge function)
    if (transaction.status) {
      return transaction.status;
    }

    // Fallback caso status seja null (não deveria acontecer com trigger)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactionDate = new Date(transaction.date);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate < today) {
      return "Em Atraso";
    } else if (transactionDate.getTime() === today.getTime()) {
      return "Vence hoje";
    } else {
      return "Em Aberto";
    }
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paga":
        return "bg-green-50 text-green-800 border-green-300";
      case "Recebido":
        return "bg-green-50 text-green-800 border-green-300";
      case "Em Aberto":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Vence hoje":
        return "bg-yellow-50 text-yellow-800 border-yellow-300";
      case "Em Atraso":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Clear selected transactions
  const clearSelectedTransactions = () => {
    setSelectedTransactions([]);
  };

  // Handle payment actions
  const handleFullPayment = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      setEditingTransaction(transaction);
      setShowTransactionModal(true);
    }
  };

  const handlePartialPayment = async (transactionId: string) => {
    try {
      // Aqui você pode implementar a lógica para pagamento parcial
      // Por exemplo, abrir um modal para informar o valor parcial
      console.log("Baixa parcial do pagamento para:", transactionId);

      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "Baixa parcial será implementada em breve",
      });
    } catch (error) {
      console.error("Erro ao processar pagamento parcial:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento parcial",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;

    try {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction) return;

      // Deletar a transação
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (transactionError) throw transactionError;

      // Se houver categoria e descrição, tentar deletar budget_item relacionado
      if (transaction.category && transaction.description) {
        const transactionDate = new Date(transaction.date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();

        // Buscar e deletar budget_item relacionado
        const { error: budgetError } = await supabase
          .from("budget_items")
          .delete()
          .eq("user_id", user.id)
          .eq("category", transaction.category)
          .eq("description", transaction.description)
          .eq("month", month)
          .eq("year", year);

        if (budgetError) {
          console.warn("Erro ao deletar budget_item relacionado:", budgetError);
        }
      }

      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));

      // Disparar sincronização para atualizar tela de planejamento
      triggerTransactionSync();

      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive",
      });
    }
  };

  // Handle transaction selection
  const handleTransactionSelect = (transactionId: string, checked: boolean) => {
    setSelectedTransactions((prev) =>
      checked
        ? [...prev, transactionId]
        : prev.filter((id) => id !== transactionId)
    );
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedTransactions(
      checked ? filteredTransactions.map((t) => t.id) : []
    );
  };

  // Handle transaction click for editing
  const handleTransactionClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  // Handle category update
  const handleCategoryUpdate = async (
    transactionId: string,
    newCategory: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ category: newCategory })
        .eq("id", transactionId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, category: newCategory } : t
        )
      );

      setEditingCategory(null);

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
    }
  };

  // Handle delete transactions
  const handleDeleteTransactions = async () => {
    if (selectedTransactions.length === 0 || !user) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", selectedTransactions)
        .eq("user_id", user.id);

      if (error) throw error;

      setTransactions((prev) =>
        prev.filter((t) => !selectedTransactions.includes(t.id))
      );
      setSelectedTransactions([]);

      toast({
        title: "Sucesso",
        description: `${selectedTransactions.length} transação(ões) excluída(s) com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir transações",
        variant: "destructive",
      });
    }
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white p-1 lg:p-2 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Transações
                </h1>
                <div className="text-muted-foreground text-xl">|</div>
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger className="border-0 shadow-none p-0 h-auto font-normal text-sm text-muted-foreground hover:text-foreground">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Filter Sidebar */}
          {showFilterSidebar && (
            <div className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col ml-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Filtrar
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilterSidebar(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Opção */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Opção
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em aberto">Em aberto</SelectItem>
                      <SelectItem value="Vence hoje">Vence hoje</SelectItem>
                      <SelectItem value="Em Atraso">Em Atraso</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Recebido">Recebido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoria */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Categoria
                  </Label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas categorias">
                        Todas categorias
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de pagamento */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tipo de pagamento
                  </Label>
                  <Select
                    value={filterPaymentType}
                    onValueChange={setFilterPaymentType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Forma de pagamento */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Forma de pagamento
                  </Label>
                  <Select
                    value={filterPaymentMethod}
                    onValueChange={setFilterPaymentMethod}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de Crédito">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="Cartão de Débito">
                        Cartão de Débito
                      </SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Transferência">
                        Transferência
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Valor
                  </Label>
                  <Input
                    placeholder=""
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="p-4 border-t border-border space-y-3 rounded-b-lg">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  onClick={() => {
                    // Apply filters logic here
                    console.log("Applying filters...");
                  }}
                >
                  Filtrar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => {
                    // Clear filters logic here
                    setFilterStatus("Em aberto");
                    setFilterCategory("Todas categorias");
                    setFilterPaymentType("Todas");
                    setFilterPaymentMethod("Todas");
                    setFilterValue("");
                    setFilterDocumentNumber("");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Search and Date Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 lg:p-4 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3 relative">
                  {!showFilterSidebar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilterSidebar(true)}
                      className="h-10 w-12 px-0 rounded-xl border-gray-300 hover:bg-gray-50"
                    >
                      <Filter className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Pesquisa por nome ou histórico"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 min-w-fit rounded-xl"
                    >
                      <Calendar className="w-4 h-4" />
                      {dateLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateFilterModal
                      onApply={(range, label) => {
                        setDateRange(range);
                        setDateLabel(label);
                        setShowCalendar(false);
                      }}
                      onCancel={() => setShowCalendar(false)}
                      initialRange={dateRange}
                      initialLabel={dateLabel}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Buttons - Moved to right */}
              <div
                className={`flex items-center gap-2 ${
                  sidebarCollapsed ? "mr-16" : "mr-60"
                }`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  className="rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar extrato
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={selectedTransactions.length === 0}
                  className={`rounded-xl ${
                    selectedTransactions.length === 0
                      ? "text-gray-400"
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-0 mb-4 px-4 lg:px-6 bg-white">
              <Button
                variant="ghost"
                onClick={() => setActiveFilter("all")}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === "all"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Movimentações
                {activeFilter === "all" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-knumbers-green" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveFilter("income")}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === "income"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entradas
                {activeFilter === "income" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-knumbers-green" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveFilter("expense")}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === "expense"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Saídas
                {activeFilter === "expense" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-knumbers-green" />
                )}
              </Button>
            </div>

            {/* Selected transactions indicator */}
            {selectedTransactions.length > 0 && (
              <div className="flex items-center gap-2 mb-4 px-4 lg:px-6 bg-white">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 bg-knumbers-purple/20 text-knumbers-purple border-knumbers-purple/30"
                >
                  Selecionados: {selectedTransactions.length} cadastros
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={clearSelectedTransactions}
                  />
                </Badge>
              </div>
            )}

           {/* Table Content Area */}
           <div className="flex flex-1 overflow-hidden relative">
            {/* Left Content - Table */}
            <div
              className={`flex-1 p-4 lg:p-6 overflow-hidden transition-all duration-300 ${
                sidebarCollapsed ? "mr-16" : "mr-60"
              }`}
            >
              <div className="bg-white rounded-lg border border-border h-full flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide">
                  <table className="w-full">
                    <thead className="bg-background sticky top-0 border-b">
                      <tr>
                        <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm w-8">
                          <Checkbox
                            checked={
                              selectedTransactions.length ===
                                filteredTransactions.length &&
                              filteredTransactions.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Vencimento
                        </th>
                        <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Categoria
                        </th>
                        <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Descrição
                        </th>
                        <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Conta
                        </th>
                        <th className="text-right p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Valor
                        </th>
                        <th className="text-center p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-8 text-center text-muted-foreground"
                          >
                            Nenhuma transação encontrada
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-border hover:bg-muted/30 cursor-pointer"
                            onClick={() => handleTransactionClick(transaction)}
                          >
                             <td className="p-2 lg:p-4">
                               <Checkbox
                                 checked={selectedTransactions.includes(
                                   transaction.id
                                 )}
                                 onCheckedChange={(checked) =>
                                   handleTransactionSelect(
                                     transaction.id,
                                     checked as boolean
                                   )
                                 }
                                 onClick={(e) => e.stopPropagation()}
                               />
                             </td>
                            <td className="p-2 lg:p-4 text-sm">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="p-2 lg:p-4 text-sm">
                              {editingCategory === transaction.id ? (
                                <Select
                                  value={transaction.category || ""}
                                  onValueChange={(value) =>
                                    handleCategoryUpdate(transaction.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-full h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                      >
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                 <span>
                                   {transaction.category || "Sem categoria"}
                                 </span>
                              )}
                            </td>
                             <td className="p-2 lg:p-4 text-sm max-w-xs">
                               <div className="flex items-center gap-2">
                                 <span className="truncate">{transaction.description}</span>
                                 {((transaction.original_message && transaction.original_message.includes("Recorrente:")) || 
                                   (transaction.description.includes("(") && 
                                   transaction.description.includes("/") && 
                                   transaction.description.includes(")") &&
                                   /\(\d+\/\d+\)/.test(transaction.description))) && (
                                   <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-0.5 rounded-full">
                                     Recorrente
                                   </Badge>
                                 )}
                               </div>
                             </td>
                             <td className="p-2 lg:p-4 text-sm">
                               <div className="flex items-center gap-2">
                                 {transaction.bank_account ? (
                                   <>
                                     <BankLogo
                                       bankName={transaction.bank_account.bank_name}
                                       size="sm"
                                     />
                                     <span className="text-xs">
                                       {transaction.bank_account.bank_name}
                                     </span>
                                   </>
                                 ) : (
                                   <span className="text-muted-foreground text-xs">
                                     Sem conta
                                   </span>
                                 )}
                               </div>
                             </td>
                            <td
                              className={`p-2 lg:p-4 text-sm text-right font-medium ${
                                transaction.transaction_type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.transaction_type === "expense"
                                ? "-"
                                : "+"}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </td>
                            <td className="p-2 lg:p-4">
                              <div className="flex items-center justify-center gap-2">
                                {(() => {
                                  const status =
                                    getTransactionStatus(transaction);
                                  return (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                        status
                                      )}`}
                                    >
                                      {status}
                                    </span>
                                  );
                                })()}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-gray-100 rounded-sm"
                                    >
                                      <MoreVertical className="h-3 w-3 text-gray-600" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-56 py-1"
                                    sideOffset={5}
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleFullPayment(transaction.id)
                                      }
                                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                      Baixa total do pagamento
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePartialPayment(transaction.id)
                                      }
                                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                      Baixa parcial do pagamento
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteTransaction(transaction.id)
                                      }
                                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side Area - Fixed Position */}
            <div className="fixed top-20 right-4 bottom-0 flex flex-col z-10">
              {/* Add Transaction Button */}
              <div className="mb-2">
                <Button
                  onClick={() => setShowTransactionModal(true)}
                  className={`bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white hover:opacity-90 rounded-xl shadow-lg transition-all duration-300 ${
                    sidebarCollapsed ? "w-12 h-12 p-0" : "w-56 px-4 py-2"
                  }`}
                >
                  <Plus
                    className={`w-4 h-4 ${sidebarCollapsed ? "" : "mr-2"}`}
                  />
                  {!sidebarCollapsed && "Incluir lançamento"}
                </Button>
              </div>

              {/* Sidebar */}
              <div
                className={`${
                  sidebarCollapsed ? "w-12" : "w-56"
                } bg-white border border-border transition-all duration-300 rounded-lg flex flex-col overflow-hidden shadow-lg flex-1`}
              >
                {sidebarCollapsed ? (
                  /* Collapsed Sidebar */
                  <div className="p-2 space-y-2 flex flex-col items-center flex-1">
                    <Button
                      variant="ghost"
                      onClick={() => setShowTransferModal(true)}
                      className="p-2 w-8 h-8"
                      title="Transferência entre contas"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  /* Expanded Sidebar */
                  <div className="p-3 space-y-4 flex-1 overflow-auto scrollbar-hide">
                    {/* Transfer Section */}
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        onClick={() => setShowTransferModal(true)}
                        className="w-full justify-start p-2 h-auto text-left text-xs"
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        <span className="leading-tight">
                          Transferência entre
                          <br />
                          Contas
                        </span>
                      </Button>
                      <Separator className="mt-4 mb-3" />
                    </div>

                    {/* Register Count */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Registros
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {filteredTransactions.length}
                      </div>
                    </div>

                    {/* Selected transactions info */}
                    {selectedTransactions.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Selecionados:
                        </div>
                        <div className="text-sm font-bold text-foreground mb-1">
                          {selectedTransactions.length}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Valor:
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            selectedTransactionsValue >= 0
                              ? "text-knumbers-green"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(selectedTransactionsValue)}
                        </div>
                      </div>
                    )}

                    {/* Current Balance */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {selectedAccount === "all" ? "Saldo total" : "Saldo"}
                      </div>
                      <div className="text-sm font-bold text-knumbers-green">
                        {formatCurrency(currentAccountBalance)}
                      </div>
                    </div>

                    {/* Information Section */}
                    <div>
                      <div className="text-xs font-medium text-foreground mb-2">
                        Informações
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Entradas
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              {formatCurrency(totalIncome)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Saídas
                            </span>
                            <span className="text-xs font-medium text-red-600">
                              {formatCurrency(totalExpense)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Saldo final
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                totalIncome - totalExpense >= 0
                                  ? "text-knumbers-green"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(totalIncome - totalExpense)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sidebar Toggle - Bottom */}
                <div className="p-2 border-t flex justify-center flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-6 w-6 p-0"
                  >
                    {sidebarCollapsed ? (
                      <ChevronLeft className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
           </div>
          </div>
        </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferSlideIn onClose={() => setShowTransferModal(false)} />
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionSlideIn
          onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
          onTransactionAdded={fetchTransactions}
          onOpenPaymentConfirmation={(transaction) => {
            setTransactionsForPayment([transaction]);
            setShowPaymentConfirmation(true);
          }}
          existingTransaction={editingTransaction}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedTransactions.length} transação(ões) selecionada(s)? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteTransactions();
                setShowDeleteConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && (
        <PaymentConfirmationSlideIn
          onClose={() => {
            setShowPaymentConfirmation(false);
            setTransactionsForPayment([]);
          }}
          onPaymentConfirmed={fetchTransactions}
          transactions={transactionsForPayment}
        />
      )}
    </div>
  );
}
