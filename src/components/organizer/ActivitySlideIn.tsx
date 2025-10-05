import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivities } from "@/hooks/useActivities";

interface ActivitySlideInProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

export function ActivitySlideIn({ isOpen, onClose, selectedDate }: ActivitySlideInProps) {
  const { activities } = useActivities(
    selectedDate || new Date(),
    selectedDate || new Date()
  );

  if (!selectedDate) return null;

  const dayActivities = activities.filter((activity) =>
    isSameDay(new Date(activity.date), selectedDate)
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="capitalize">
            {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {dayActivities.length} atividade{dayActivities.length !== 1 ? "s" : ""} neste dia
          </p>

          {dayActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma atividade programada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{activity.description}</h4>
                      {activity.category && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.category}</p>
                      )}
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        activity.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.type === "income" ? "+" : "-"} R$ {activity.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">
                      {activity.type === "income" ? "Receita" : "Despesa"}
                    </span>
                    {activity.payment_method && (
                      <span>• {activity.payment_method}</span>
                    )}
                    {activity.bank_account_name && (
                      <span>• {activity.bank_account_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
