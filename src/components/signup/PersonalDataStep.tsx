import { Input } from "@/components/ui/input";
import { CountryPhoneInput } from "./CountryPhoneInput";

interface Country {
  code: string;
  flag: string;
  name: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  confirmEmail: string;
  goal: string;
}

interface PersonalDataStepProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  countries: Country[];
  formatBrazilianPhone: (value: string) => string;
  formatInternationalPhone: (value: string) => string;
}

export const PersonalDataStep = ({
  formData,
  onFormDataChange,
  selectedCountry,
  onCountryChange,
  countries,
  formatBrazilianPhone,
  formatInternationalPhone
}: PersonalDataStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Como podemos te chamar?</h2>
        <p className="text-muted-foreground">Vamos personalizar sua experiência</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nome</label>
          <Input
            placeholder="Digite seu nome ou apelido"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
            className="h-12"
          />
        </div>
        
        <CountryPhoneInput
          selectedCountry={selectedCountry}
          onCountryChange={onCountryChange}
          phoneValue={formData.phone}
          onPhoneChange={(phone) => onFormDataChange({ phone })}
          countries={countries}
          formatBrazilianPhone={formatBrazilianPhone}
          formatInternationalPhone={formatInternationalPhone}
        />
      </div>
    </div>
  );
};