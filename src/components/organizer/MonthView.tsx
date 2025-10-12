import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";
import { Badge } from "@/components/ui/badge";

interface MonthViewProps {
  currentDate: Date;
  searchQuery: string;
  onDateClick: (date: Date) => void;
}

export function MonthView({ currentDate, searchQuery, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { activities, isLoading } = useActivities(calendarStart, calendarEnd);

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

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const dayActivities = getActivitiesForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`border rounded-lg p-2 min-h-[100px] cursor-pointer transition-colors hover:bg-accent/50 ${
                isToday ? "border-primary bg-primary/5" : "bg-card"
              } ${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-semibold ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayActivities.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                    {dayActivities.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <p className="text-xs text-muted-foreground">...</p>
              ) : (
                <div className="space-y-1">
                  {dayActivities.slice(0, 2).map((activity) => (
                    <div
                      key={activity.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick(day);
                      }}
                      className="text-xs p-1.5 rounded bg-muted/50 border border-border/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${
                            activity.type === "income" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <p className="truncate font-medium flex-1">{activity.description}</p>
                      </div>
                      {activity.status && (
                        <Badge variant={getStatusVariant(activity.status)} className="text-[9px] px-1 py-0 h-3">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {dayActivities.length > 2 && (
                    <p className="text-xs text-muted-foreground font-medium">
                      +{dayActivities.length - 2} mais
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
