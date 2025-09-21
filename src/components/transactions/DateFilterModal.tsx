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
  addMonths,
  format 
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

type FilterType = 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'selectMonth' | 'customPeriod';

export function DateFilterModal({ onApply, onCancel, initialRange, initialLabel }: DateFilterModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('thisMonth');
  const [tempRange, setTempRange] = useState<DateRange>(initialRange);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const filterOptions = [
    { key: 'today', label: 'Hoje' },
    { key: 'thisWeek', label: 'Esta semana' },
    { key: 'lastWeek', label: 'Semana passada' },
    { key: 'thisMonth', label: 'Este mês' },
    { key: 'lastMonth', label: 'Mês passado' },
    { key: 'selectMonth', label: 'Selecionar mês' },
    { key: 'customPeriod', label: 'Período customizado' },
  ];

  const handleFilterSelect = (filterType: FilterType) => {
    setSelectedFilter(filterType);
    const today = new Date();
    let from: Date, to: Date;

    switch (filterType) {
      case 'today':
        from = to = today;
        break;
      case 'thisWeek':
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        const lastWeekStart = subWeeks(today, 1);
        from = startOfWeek(lastWeekStart, { weekStartsOn: 1 });
        to = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case 'selectMonth':
        from = startOfMonth(selectedMonth);
        to = endOfMonth(selectedMonth);
        break;
      case 'customPeriod':
        // Para período customizado, não definimos range aqui
        return;
    }

    if (filterType !== 'customPeriod') {
      setTempRange({ from, to });
    }
  };

  const handleMonthSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(date);
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      setTempRange({ from, to });
    }
  };

  const handleApply = () => {
    if (selectedFilter === 'customPeriod') {
      if (customStartDate && customEndDate) {
        const label = `${format(customStartDate, "dd/MM/yyyy", { locale: pt })} - ${format(customEndDate, "dd/MM/yyyy", { locale: pt })}`;
        onApply({ from: customStartDate, to: customEndDate }, label);
      }
    } else {
      const selectedOption = filterOptions.find(opt => opt.key === selectedFilter);
      const label = selectedOption?.label || 'Período selecionado';
      onApply(tempRange, label);
    }
  };

  const isCustomPeriod = selectedFilter === 'customPeriod';
  const isSelectMonth = selectedFilter === 'selectMonth';

  return (
    <div className="flex bg-white rounded-lg shadow-lg border">
      {/* Calendários */}
      <div className="flex">
        {isCustomPeriod ? (
          // Dois calendários para período customizado
          <div className="flex">
            <div className="p-4 border-r">
              <div className="text-sm font-medium text-center mb-2 text-gray-600">
                Início do período
              </div>
              <div className="bg-gray-50 rounded-lg p-2 mb-2">
                <input
                  type="text"
                  placeholder="01/09/2025"
                  value={customStartDate ? format(customStartDate, "dd/MM/yyyy", { locale: pt }) : ""}
                  readOnly
                  className="w-full text-center bg-transparent border-none outline-none text-sm"
                />
              </div>
              <CalendarComponent
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                className="border-0"
                locale={pt}
              />
            </div>
            <div className="p-4">
              <div className="text-sm font-medium text-center mb-2 text-gray-600">
                Fim do período
              </div>
              <div className="bg-gray-50 rounded-lg p-2 mb-2">
                <input
                  type="text"
                  placeholder="31/08/2025"
                  value={customEndDate ? format(customEndDate, "dd/MM/yyyy", { locale: pt }) : ""}
                  readOnly
                  className="w-full text-center bg-transparent border-none outline-none text-sm"
                />
              </div>
              <CalendarComponent
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
                className="border-0"
                locale={pt}
              />
            </div>
          </div>
        ) : (
          // Um calendário para outros filtros
          <div className="p-4">
            {isSelectMonth && (
              <>
                <div className="text-sm font-medium text-center mb-2 text-gray-600">
                  Início do período
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                  <input
                    type="text"
                    value={format(tempRange.from, "dd/MM/yyyy", { locale: pt })}
                    readOnly
                    className="w-full text-center bg-transparent border-none outline-none text-sm"
                  />
                </div>
              </>
            )}
            <CalendarComponent
              mode={isSelectMonth ? "single" : "range"}
              selected={isSelectMonth ? selectedMonth : tempRange}
              onSelect={isSelectMonth ? handleMonthSelect : (range) => {
                if (range?.from) {
                  setTempRange({
                    from: range.from,
                    to: range.to || range.from,
                  });
                }
              }}
              className="border-0"
              locale={pt}
            />
          </div>
        )}
      </div>

      {/* Menu lateral */}
      <div className="w-48 border-l bg-gray-50 p-4">
        <div className="space-y-1">
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm h-9 px-3 ${
                selectedFilter === option.key
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => handleFilterSelect(option.key as FilterType)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
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
            disabled={selectedFilter === 'customPeriod' && (!customStartDate || !customEndDate)}
          >
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  );
}
