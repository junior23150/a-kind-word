import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";
import { Badge } from "@/components/ui/badge";

interface WeekViewProps {
  currentDate: Date;
  searchQuery: string;
  onDateClick: (date: Date) => void;
}

export function WeekView({ currentDate, searchQuery, onDateClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { activities, isLoading } = useActivities(weekStart, weekEnd);

  const filteredActivities = activities.filter((activity) => {
    if (!searchQuery) return true;
    return (
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getActivitiesForDay = (day: Date) => {
    return filteredActivities.filter((activity) =>
      isSameDay(parseISO(activity.date), day)
    );
  };

  const getStatusVariant = (status: string | null | undefined): "open" | "paid" | "overdue" | "received" | "due-today" | "secondary" => {
    if (!status) return "secondary";
    const statusLower = status.toLowerCase();
    if (statusLower === "em aberto") return "open";
    if (statusLower === "paga") return "paid";
    if (statusLower === "em atraso") return "overdue";
    if (statusLower === "recebido") return "received";
    if (statusLower === "vence hoje") return "due-today";
    return "secondary";
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dayActivities = getActivitiesForDay(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            onClick={() => onDateClick(day)}
            className={`border rounded-lg p-3 min-h-[200px] cursor-pointer transition-colors hover:bg-accent/50 ${
              isToday ? "border-primary bg-primary/5" : "bg-card"
            }`}
          >
            <div className="text-center mb-3">
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, "EEE", { locale: ptBR })}
              </p>
              <p
                className={`text-2xl font-bold ${
                  isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dayActivities.length} {dayActivities.length === 1 ? "item" : "itens"}
              </p>
            </div>

            {isLoading ? (
              <p className="text-xs text-center text-muted-foreground">Carregando...</p>
            ) : dayActivities.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground">Sem atividades</p>
            ) : (
              <div className="space-y-2">
                {dayActivities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(day);
                    }}
                    className="text-xs p-2 rounded bg-muted/50 border border-border/50 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <p className="font-medium truncate mb-1">{activity.description}</p>
                    {activity.status && (
                      <Badge variant={getStatusVariant(activity.status)} className="text-[10px] px-1.5 py-0 h-4 mb-1">
                        {activity.status}
                      </Badge>
                    )}
                    <p
                      className={`font-semibold ${
                        activity.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.type === "income" ? "+" : "-"} R$ {activity.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
                {dayActivities.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{dayActivities.length - 3} mais
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
