import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Country {
  code: string;
  flag: string;
  name: string;
}

interface CountryPhoneInputProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  countries: Country[];
  formatBrazilianPhone: (value: string) => string;
  formatInternationalPhone: (value: string) => string;
}

export const CountryPhoneInput = ({
  selectedCountry,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  countries,
  formatBrazilianPhone,
  formatInternationalPhone
}: CountryPhoneInputProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">WhatsApp</label>
      <div className="flex space-x-2">
        <Select 
          value={selectedCountry.code} 
          onValueChange={(value) => {
            const country = countries.find(c => c.code === value);
            if (country) onCountryChange(country);
          }}
        >
          <SelectTrigger className="w-32 h-12">
            <SelectValue>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.code}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.code}</span>
                  <span className="text-sm text-muted-foreground">{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder={selectedCountry.code === '+55' ? "(11) 99999-9999" : "999-999-9999"}
          value={phoneValue}
          onChange={(e) => {
            const formatted = selectedCountry.code === '+55' 
              ? formatBrazilianPhone(e.target.value) 
              : formatInternationalPhone(e.target.value);
            onPhoneChange(formatted);
          }}
          className="flex-1 h-12"
          maxLength={selectedCountry.code === '+55' ? 15 : 14}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        É por aqui que você vai conversar com nossa IA
      </p>
    </div>
  );
};