import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewMode } from "@/pages/Organizador";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { useProfile } from "@/hooks/useProfile";

interface CalendarControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onToday: () => void;
  dateRangeText: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CalendarControls({
  viewMode,
  onViewModeChange,
  currentDate,
  onDateChange,
  onToday,
  dateRangeText,
  searchQuery,
  onSearchChange,
}: CalendarControlsProps) {
  const { profile } = useProfile();

  const handlePrevious = () => {
    if (viewMode === "day") {
      onDateChange(subDays(currentDate, 1));
    } else if (viewMode === "week") {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      onDateChange(addDays(currentDate, 1));
    } else if (viewMode === "week") {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
      <p className="text-foreground font-medium">
        Olá {profile?.full_name || "usuário"}, aqui estão suas atividades
      </p>

      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="buscar eventos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 bg-muted p-1 rounded-full">
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("day")}
            className="rounded-full"
          >
            DIA
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            className="rounded-full"
          >
            SEMANA
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            className="rounded-full"
          >
            MÊS
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevious} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className="font-medium text-foreground min-w-[120px] text-center">{dateRangeText}</span>

          <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="outline" onClick={onToday} className="rounded-full">
          Hoje
        </Button>
      </div>
    </div>
  );
}
