import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, addMonths } from "date-fns";

export interface Activity {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string | null;
  type: "income" | "expense";
  payment_method?: string | null;
  bank_account_name?: string | null;
  source: "transaction" | "recurring_bill";
  status?: string | null;
}

export function useActivities(startDate: Date, endDate: Date) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      console.log("🔍 [useActivities] Buscando atividades:", {
        startDate: startStr,
        endDate: endStr,
        user_id: user.id,
      });

      // Fetch transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select(`
          id,
          description,
          amount,
          date,
          category,
          transaction_type,
          payment_method,
          status,
          bank_accounts (
            bank_name
          )
        `)
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr)
        .order("date", { ascending: true });

      // Fetch recurring bills
      const { data: bills } = await supabase
        .from("recurring_bills")
        .select("id, name, amount, category, start_date, end_date, total_installments, recurrence_type")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const activities: Activity[] = [];

      // Add transactions
      if (transactions) {
        transactions.forEach((t) => {
          activities.push({
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            date: t.date,
            category: t.category,
            type: t.transaction_type === "income" ? "income" : "expense",
            payment_method: t.payment_method,
            bank_account_name: t.bank_accounts?.bank_name,
            source: "transaction",
            status: t.status,
          });
        });
      }

      // Add recurring bills as individual installments within the date range
      if (bills) {
        bills.forEach((bill) => {
          if (!bill.start_date) return; // Skip bills without start date
          
          const billStartDate = parseISO(bill.start_date);
          const billEndDate = bill.end_date ? parseISO(bill.end_date) : null;
          const queryStartDate = startDate;
          const queryEndDate = endDate;
          
          let installmentDate = billStartDate;
          let installmentNumber = 1;
          
          // Generate installments based on recurrence type
          while (
            installmentDate <= queryEndDate &&
            (!billEndDate || installmentDate <= billEndDate) &&
            (!bill.total_installments || installmentNumber <= bill.total_installments)
          ) {
            // Only add if within query range
            if (installmentDate >= queryStartDate) {
              const totalInstallmentsText = bill.total_installments ? `/${bill.total_installments}` : '';
              activities.push({
                id: `${bill.id}-${format(installmentDate, "yyyy-MM-dd")}`,
                description: `${bill.name} (${installmentNumber}${totalInstallmentsText})`,
                amount: Number(bill.amount || 0),
                date: format(installmentDate, "yyyy-MM-dd"),
                category: bill.category,
                type: "expense",
                source: "recurring_bill",
              });
            }
            
            // Move to next installment based on recurrence type
            if (bill.recurrence_type === 'weekly') {
              installmentDate = new Date(installmentDate);
              installmentDate.setDate(installmentDate.getDate() + 7);
            } else if (bill.recurrence_type === 'yearly') {
              installmentDate = new Date(installmentDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + 1);
            } else {
              // Default to monthly
              installmentDate = addMonths(installmentDate, 1);
            }
            
            installmentNumber++;
          }
        });
      }

      // Sort by date
      activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log("✅ [useActivities] Atividades encontradas:", {
        total: activities.length,
        transactions: transactions?.length || 0,
        bills: bills?.length || 0,
        dateRange: `${startStr} a ${endStr}`,
      });

      return activities;
    },
  });

  return { activities, isLoading };
}
