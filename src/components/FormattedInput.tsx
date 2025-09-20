import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormattedInputProps {
  label: string;
  type: 'phone' | 'cpf-cnpj';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormattedInput = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false
}: FormattedInputProps) => {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF format
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ format
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formattedValue = e.target.value;
    
    if (type === 'phone') {
      formattedValue = formatPhone(formattedValue);
    } else if (type === 'cpf-cnpj') {
      formattedValue = formatCpfCnpj(formattedValue);
    }
    
    onChange(formattedValue);
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12"
      />
    </div>
  );
};