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
    <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
      <p className="text-foreground font-medium">
        Olá {profile?.full_name || "usuário"}, aqui estão suas atividades
      </p>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="buscar eventos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex justify-center">
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("day")}
          >
            DIA
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
          >
            SEMANA
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
          >
            MÊS
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <span className="font-medium text-foreground">{dateRangeText}</span>

        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button variant="outline" onClick={onToday}>
          Hoje
        </Button>
      </div>
    </div>
  );
}
