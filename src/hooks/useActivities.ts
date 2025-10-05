import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
}

export function useActivities(startDate: Date, endDate: Date) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

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
        .select("id, name, amount, due_day, category")
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
          });
        });
      }

      // Add recurring bills for the date range
      if (bills) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        bills.forEach((bill) => {
          const currentDate = new Date(start);
          while (currentDate <= end) {
            if (currentDate.getDate() === bill.due_day) {
              activities.push({
                id: `${bill.id}-${format(currentDate, "yyyy-MM-dd")}`,
                description: bill.name,
                amount: Number(bill.amount || 0),
                date: format(currentDate, "yyyy-MM-dd"),
                category: bill.category,
                type: "expense",
                source: "recurring_bill",
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
      }

      // Sort by date
      activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return activities;
    },
  });

  return { activities, isLoading };
}
