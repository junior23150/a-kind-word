import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";

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
      isSameDay(new Date(activity.date), day)
    );
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
                    className="text-xs p-2 rounded bg-muted/50 truncate"
                  >
                    <p className="font-medium truncate">{activity.description}</p>
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
