import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";

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
      isSameDay(new Date(activity.date), day)
    );
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
                      className="text-xs p-1 rounded bg-muted/50"
                    >
                      <p className="truncate font-medium">{activity.description}</p>
                      {activity.status && (
                        <p className="text-[10px] text-muted-foreground truncate">{activity.status}</p>
                      )}
                    </div>
                  ))}
                  {dayActivities.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{dayActivities.length - 2}
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
