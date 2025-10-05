import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { CalendarControls } from "@/components/organizer/CalendarControls";
import { DayView } from "@/components/organizer/DayView";
import { WeekView } from "@/components/organizer/WeekView";
import { MonthView } from "@/components/organizer/MonthView";
import { TransactionSlideIn } from "@/components/transactions/TransactionSlideIn";
import { ActivitySelectionDialog } from "@/components/organizer/ActivitySelectionDialog";
import { startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns";
import { useActivities } from "@/hooks/useActivities";

export type ViewMode = "day" | "week" | "month";
export type TabMode = "calendar" | "tasks";

const Organizador = () => {
  const [tabMode, setTabMode] = useState<TabMode>("calendar");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTransactionSlideInOpen, setIsTransactionSlideInOpen] = useState(false);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Buscar atividades para o período visível
  const { activities } = useActivities(
    viewMode === "month" ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) : currentDate,
    viewMode === "month" ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0) : currentDate
  );

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    // Filtrar atividades do dia
    const dayActivities = activities.filter((activity) =>
      isSameDay(parseISO(activity.date), date)
    );

    // Se houver apenas 1 atividade, abrir diretamente
    if (dayActivities.length === 1) {
      const activity = dayActivities[0];
      setSelectedTransaction({
        id: activity.id,
        amount: activity.amount,
        description: activity.description,
        category: activity.category,
        transaction_type: activity.type,
        date: activity.date,
        bank_account_id: null,
        payment_method: activity.payment_method,
      });
      setIsTransactionSlideInOpen(true);
    } 
    // Se houver múltiplas, mostrar diálogo de seleção
    else if (dayActivities.length > 1) {
      setIsSelectionDialogOpen(true);
    }
  };

  const handleActivitySelected = (activity: any) => {
    setSelectedTransaction({
      id: activity.id,
      amount: activity.amount,
      description: activity.description,
      category: activity.category,
      transaction_type: activity.type,
      date: activity.date,
      bank_account_id: null,
      payment_method: activity.payment_method,
    });
    setIsTransactionSlideInOpen(true);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setViewMode("day");
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

      {isTransactionSlideInOpen && (
        <TransactionSlideIn
          onClose={() => {
            setIsTransactionSlideInOpen(false);
            setSelectedTransaction(null);
          }}
          existingTransaction={selectedTransaction}
        />
      )}

      {selectedDate && (
        <ActivitySelectionDialog
          isOpen={isSelectionDialogOpen}
          onClose={() => setIsSelectionDialogOpen(false)}
          activities={activities.filter((activity) =>
            isSameDay(parseISO(activity.date), selectedDate)
          )}
          selectedDate={selectedDate}
          onSelectActivity={handleActivitySelected}
        />
      )}
    </DashboardLayout>
  );
};

export default Organizador;
