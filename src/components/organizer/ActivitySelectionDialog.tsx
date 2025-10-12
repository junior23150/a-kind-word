import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string | null;
  status?: string | null;
  payment_method?: string | null;
  bank_account_name?: string | null;
  date: string;
}

interface ActivitySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  selectedDate: Date;
  onSelectActivity: (activity: Activity) => void;
}

export function ActivitySelectionDialog({
  isOpen,
  onClose,
  activities,
  selectedDate,
  onSelectActivity,
}: ActivitySelectionDialogProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecione a conta que deseja visualizar:
          </p>

          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => {
                onSelectActivity(activity);
                onClose();
              }}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.description}</p>
                  {activity.category && (
                    <p className="text-xs text-muted-foreground mt-1">{activity.category}</p>
                  )}
                </div>
                <span
                  className={`text-sm font-bold ${
                    activity.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {activity.type === "income" ? "+" : "-"} R$ {activity.amount.toFixed(2)}
                </span>
              </div>
              {activity.status && (
                <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                  {activity.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
