import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  created_at: string;
  updated_at: string;
}

// Dados mockados removidos - usando apenas dados reais do Supabase

export function TransactionsPage() {
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
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

  useEffect(() => {
    fetchTransactions();
  }, [toast]);

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

    return matchesSearch && matchesDateRange && matchesFilter;
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
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Clear selected transactions
  const clearSelectedTransactions = () => {
    setSelectedTransactions([]);
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

  // Handle category update
  const handleCategoryUpdate = async (
    transactionId: string,
    newCategory: string
  ) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ category: newCategory })
        .eq("id", transactionId);

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
    if (selectedTransactions.length === 0) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", selectedTransactions);

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
        <div className="bg-white border-b border-border p-4 lg:p-6 flex-shrink-0">
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
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {/* TODO: Carregar contas reais do Supabase */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search and Date Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisa por nome ou histórico"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
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
                onClick={handleDeleteTransactions}
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
          <div className="flex items-center gap-0 mb-4">
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
            <div className="flex items-center gap-2 mb-4">
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
        </div>

        {/* Main Content Area */}
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
                        Data
                      </th>
                      <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                        Categoria
                      </th>
                      <th className="text-left p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                        Descrição
                      </th>
                      <th className="text-right p-2 lg:p-4 font-medium text-muted-foreground text-sm">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-border hover:bg-muted/30"
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
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                onClick={() =>
                                  setEditingCategory(transaction.id)
                                }
                              >
                                <span>
                                  {transaction.category || "Sem categoria"}
                                </span>
                                <Edit className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="p-2 lg:p-4 text-sm max-w-xs truncate">
                            {transaction.description}
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
                <Plus className={`w-4 h-4 ${sidebarCollapsed ? "" : "mr-2"}`} />
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
                  <div>
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
                    <Separator className="my-3" />
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

        {/* Transfer Modal */}
        {showTransferModal && (
          <TransferSlideIn onClose={() => setShowTransferModal(false)} />
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <TransactionSlideIn 
            onClose={() => setShowTransactionModal(false)}
            onTransactionAdded={fetchTransactions}
          />
        )}
      </div>
    );
  }
