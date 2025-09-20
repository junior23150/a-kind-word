import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  required = false
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Convert string date to Date object for calendar
  const stringToDate = (dateString: string) => {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split('/');
    if (day && month && year) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return undefined;
  };

  // Convert Date object to string format
  const dateToString = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length > 0) {
      formattedValue = value.substring(0, 2);
    }
    if (value.length > 2) {
      formattedValue += '/' + value.substring(2, 4);
    }
    if (value.length > 4) {
      formattedValue += '/' + value.substring(4, 8);
    }
    
    onChange(formattedValue);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(dateToString(date));
      setIsOpen(false);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={10}
          className="h-12 pr-10"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={stringToDate(value)}
              onSelect={handleDateSelect}
              initialFocus
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};