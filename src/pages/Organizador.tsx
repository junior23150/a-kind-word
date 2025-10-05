import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { CalendarControls } from "@/components/organizer/CalendarControls";
import { DayView } from "@/components/organizer/DayView";
import { WeekView } from "@/components/organizer/WeekView";
import { MonthView } from "@/components/organizer/MonthView";
import { ActivitySlideIn } from "@/components/organizer/ActivitySlideIn";
import { startOfWeek, endOfWeek } from "date-fns";

export type ViewMode = "day" | "week" | "month";
export type TabMode = "calendar" | "tasks";

const Organizador = () => {
  const [tabMode, setTabMode] = useState<TabMode>("calendar");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSlideInOpen, setIsSlideInOpen] = useState(false);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsSlideInOpen(true);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("pt-BR");
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} a ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
    } else {
      return currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrganizerHeader tabMode={tabMode} onTabChange={setTabMode} />

          {tabMode === "calendar" && (
            <>
              <CalendarControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onToday={handleToday}
                dateRangeText={getDateRangeText()}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <div className="bg-card rounded-lg border shadow-sm p-6">
                {viewMode === "day" && (
                  <DayView
                    currentDate={currentDate}
                    searchQuery={searchQuery}
                    onDateClick={handleDateClick}
                  />
                )}
                {viewMode === "week" && (
                  <WeekView
                    currentDate={currentDate}
                    searchQuery={searchQuery}
                    onDateClick={handleDateClick}
                  />
                )}
                {viewMode === "month" && (
                  <MonthView
                    currentDate={currentDate}
                    searchQuery={searchQuery}
                    onDateClick={handleDateClick}
                  />
                )}
              </div>
            </>
          )}

          {tabMode === "tasks" && (
            <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
              <p className="text-muted-foreground">
                Funcionalidade de Tarefas em desenvolvimento
              </p>
            </div>
          )}
        </div>
      </div>

      <ActivitySlideIn
        isOpen={isSlideInOpen}
        onClose={() => setIsSlideInOpen(false)}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  );
};

export default Organizador;
