import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
}

interface TransactionSlideInProps {
  onClose: () => void;
  onTransactionAdded?: () => void;
}

export function TransactionSlideIn({
  onClose,
  onTransactionAdded,
}: TransactionSlideInProps) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [value, setValue] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [competenceDate, setCompetenceDate] = useState<Date>(new Date());
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showCompetenceCalendar, setShowCompetenceCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar categorias e contas do Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoadingData(true);
        
        // Carregar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name");

        if (categoriesError) throw categoriesError;

        // Carregar contas bancárias
        const { data: accountsData, error: accountsError } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("bank_name");

        if (accountsError) throw accountsError;

        setCategories((categoriesData || []) as Category[]);
        setBankAccounts(accountsData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias e contas",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setShowDateCalendar(false);
    }
  };

  const handleCompetenceDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setCompetenceDate(selectedDate);
      setShowCompetenceCalendar(false);
    }
  };

  const handleSubmit = async () => {
    if (!category || !value || !description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: parseFloat(value.replace(",", ".")),
        description,
        category,
        transaction_type: type,
        date: format(date, "yyyy-MM-dd"),
        source: "manual",
        original_message: `Lançamento manual - ${description}`,
        bank_account_id: account || null,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso!",
      });

      // Reset form
      setCategory("");
      setValue("");
      setDescription("");
      setAccount("");
      setDate(new Date());
      setCompetenceDate(new Date());
      setType("expense");

      onTransactionAdded?.();
      onClose();
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar lançamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide In Panel */}
      <div className="fixed top-0 right-0 h-full w-[40%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Lançamento caixa
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          {/* Required Fields Notice */}
          <div className="px-6 py-3 bg-red-50 border-b">
            <p className="text-sm text-red-600">
              <span className="text-red-500">(*)</span> Campos obrigatórios
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Categoria */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <SelectItem value="" disabled>
                      Carregando...
                    </SelectItem>
                  ) : filteredCategories.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhuma categoria encontrada
                    </SelectItem>
                  ) : (
                    filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Row: Data, Valor, Tipo */}
            <div className="grid grid-cols-3 gap-4">
              {/* Data */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Data <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={format(date, "dd/MM/yyyy", { locale: pt })}
                    readOnly
                    className="pr-10 cursor-pointer"
                    onClick={() => setShowDateCalendar(true)}
                  />
                  <Popover
                    open={showDateCalendar}
                    onOpenChange={setShowDateCalendar}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Calendar className="h-4 w-4 text-green-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="p-3"
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label
                  htmlFor="value"
                  className="text-sm font-medium text-gray-700"
                >
                  Valor (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="text"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Tipo
                </Label>
                <Select
                  value={type}
                  onValueChange={(value: "income" | "expense") => {
                    setType(value);
                    setCategory(""); // Reset category when type changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Saída</SelectItem>
                    <SelectItem value="income">Entrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Competência, Conta Financeira */}
            <div className="grid grid-cols-2 gap-4">
              {/* Competência */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Competência <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={format(competenceDate, "dd/MM/yyyy", { locale: pt })}
                    readOnly
                    className="pr-10 cursor-pointer"
                    onClick={() => setShowCompetenceCalendar(true)}
                  />
                  <Popover
                    open={showCompetenceCalendar}
                    onOpenChange={setShowCompetenceCalendar}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Calendar className="h-4 w-4 text-green-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={competenceDate}
                        onSelect={handleCompetenceDateSelect}
                        initialFocus
                        className="p-3"
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Conta Financeira */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Conta financeira
                </Label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingData ? (
                      <SelectItem value="" disabled>
                        Carregando...
                      </SelectItem>
                    ) : bankAccounts.length === 0 ? (
                      <SelectItem value="" disabled>
                        Nenhuma conta encontrada
                      </SelectItem>
                    ) : (
                      bankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.bank_name} - {acc.account_type}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Histórico */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Histórico <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o lançamento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
