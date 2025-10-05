import { Calendar } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";
import { Badge } from "@/components/ui/badge";

interface DayViewProps {
  currentDate: Date;
  searchQuery: string;
  onDateClick: (date: Date) => void;
}

export function DayView({ currentDate, searchQuery, onDateClick }: DayViewProps) {
  const { activities, isLoading } = useActivities(currentDate, currentDate);

  const filteredActivities = activities.filter((activity) => {
    if (!searchQuery) return true;
    return (
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const dayActivities = filteredActivities.filter((activity) =>
    isSameDay(new Date(activity.date), currentDate)
  );

  const dayName = format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });

  const getStatusVariant = (status: string | null | undefined): "success" | "warning" | "destructive" | "secondary" => {
    if (!status) return "secondary";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pago") || statusLower.includes("concluído")) return "success";
    if (statusLower.includes("aberto") || statusLower.includes("pendente")) return "warning";
    if (statusLower.includes("atrasado") || statusLower.includes("vencido")) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-4 border-b">
        <h3 className="font-semibold text-lg text-foreground capitalize">{dayName}</h3>
        <p className="text-sm text-muted-foreground">
          {dayActivities.length} atividade{dayActivities.length !== 1 ? "s" : ""} para hoje
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : dayActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h4 className="font-semibold text-foreground mb-2">Nenhuma atividade agendada</h4>
          <p className="text-muted-foreground">
            Você não tem atividades programadas para hoje.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => onDateClick(currentDate)}
              className="p-5 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-foreground mb-2">{activity.description}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activity.status && (
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    )}
                    {activity.category && (
                      <Badge variant="outline">{activity.category}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xl font-bold ${
                      activity.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {activity.type === "income" ? "+" : "-"} R$ {activity.amount.toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.type === "income" ? "Receita" : "Despesa"}
                  </p>
                </div>
              </div>
              {(activity.payment_method || activity.bank_account_name) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                  {activity.payment_method && (
                    <span>Método: {activity.payment_method}</span>
                  )}
                  {activity.bank_account_name && (
                    <span>Conta: {activity.bank_account_name}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
