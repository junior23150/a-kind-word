import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subWeeks,
  subMonths,
  format,
} from "date-fns";
import { pt } from "date-fns/locale";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateFilterModalProps {
  onApply: (range: DateRange, label: string) => void;
  onCancel: () => void;
  initialRange: DateRange;
  initialLabel: string;
}

type FilterType =
  | "today"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "selectMonth"
  | "customPeriod";

export function DateFilterModal({
  onApply,
  onCancel,
  initialRange,
  initialLabel,
}: DateFilterModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("thisMonth");
  const [tempRange, setTempRange] = useState<DateRange>(initialRange);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const filterOptions = [
    { key: "today", label: "Hoje" },
    { key: "thisWeek", label: "Esta semana" },
    { key: "lastWeek", label: "Semana passada" },
    { key: "thisMonth", label: "Este mês" },
    { key: "lastMonth", label: "Mês passado" },
    { key: "selectMonth", label: "Selecionar mês" },
    { key: "customPeriod", label: "Período customizado" },
  ];

  const handleFilterSelect = (filterType: FilterType) => {
    setSelectedFilter(filterType);
    const today = new Date();
    let from: Date, to: Date;

    switch (filterType) {
      case "today":
        from = to = today;
        break;
      case "thisWeek":
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "lastWeek":
        const lastWeekStart = subWeeks(today, 1);
        from = startOfWeek(lastWeekStart, { weekStartsOn: 1 });
        to = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case "selectMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "customPeriod":
        // Para período customizado, não definimos range aqui
        return;
    }

    if (filterType !== "customPeriod") {
      setTempRange({ from, to });
    }
  };

  const handleApply = () => {
    if (selectedFilter === "customPeriod") {
      if (customStartDate && customEndDate) {
        const label = `${format(customStartDate, "dd/MM/yyyy", {
          locale: pt,
        })} - ${format(customEndDate, "dd/MM/yyyy", { locale: pt })}`;
        onApply({ from: customStartDate, to: customEndDate }, label);
      }
    } else {
      const selectedOption = filterOptions.find(
        (opt) => opt.key === selectedFilter
      );
      const label = selectedOption?.label || "Período selecionado";
      onApply(tempRange, label);
    }
  };

  const isCustomPeriod = selectedFilter === "customPeriod";

  return (
    <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Seção dos Calendários */}
      <div className="flex-1">
        {isCustomPeriod ? (
          // Dois calendários para período customizado
          <div className="flex">
            {/* Calendário Início */}
            <div className="p-4 border-r border-gray-200">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Início do período
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
                  <input
                    type="text"
                    placeholder="01/08/2025"
                    value={
                      customStartDate
                        ? format(customStartDate, "dd/MM/yyyy", { locale: pt })
                        : ""
                    }
                    readOnly
                    className="w-full text-center bg-transparent border-none outline-none text-sm text-gray-700"
                  />
                </div>
              </div>
              <CalendarComponent
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                className="border-0 p-0"
                locale={pt}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                  day_selected:
                    "bg-green-600 text-white hover:bg-green-700 focus:bg-green-600 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>

            {/* Calendário Fim */}
            <div className="p-4">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Fim do período
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
                  <input
                    type="text"
                    placeholder="31/08/2025"
                    value={
                      customEndDate
                        ? format(customEndDate, "dd/MM/yyyy", { locale: pt })
                        : ""
                    }
                    readOnly
                    className="w-full text-center bg-transparent border-none outline-none text-sm text-gray-700"
                  />
                </div>
              </div>
              <CalendarComponent
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
                className="border-0 p-0"
                locale={pt}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                  day_selected:
                    "bg-green-600 text-white hover:bg-green-700 focus:bg-green-600 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        ) : (
          // Um calendário para outros filtros
          <div className="p-4">
            {selectedFilter === "selectMonth" && (
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Início do período
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
                  <input
                    type="text"
                    value={format(tempRange.from, "dd/MM/yyyy", { locale: pt })}
                    readOnly
                    className="w-full text-center bg-transparent border-none outline-none text-sm text-gray-700"
                  />
                </div>
              </div>
            )}
            <CalendarComponent
              mode="range"
              selected={tempRange}
              onSelect={(range) => {
                if (range?.from) {
                  setTempRange({
                    from: range.from,
                    to: range.to || range.from,
                  });
                }
              }}
              className="border-0 p-0"
              locale={pt}
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                day_selected:
                  "bg-green-600 text-white hover:bg-green-700 focus:bg-green-600 focus:text-white",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-green-100 aria-selected:text-green-900",
                day_range_start: "day-range-start bg-green-600 text-white",
                day_range_end: "day-range-end bg-green-600 text-white",
                day_hidden: "invisible",
              }}
            />
          </div>
        )}
      </div>

      {/* Menu Lateral */}
      <div className="w-48 bg-gray-50 border-l border-gray-200 flex flex-col">
        {/* Opções de Filtro */}
        <div className="flex-1 p-3 space-y-1">
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm h-9 px-3 rounded-md ${
                selectedFilter === option.key
                  ? "bg-green-100 text-green-700 font-medium hover:bg-green-100"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => handleFilterSelect(option.key as FilterType)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={
                selectedFilter === "customPeriod" &&
                (!customStartDate || !customEndDate)
              }
            >
              Filtrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
