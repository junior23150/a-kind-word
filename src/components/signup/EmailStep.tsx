import { Input } from "@/components/ui/input";

interface FormData {
  name: string;
  phone: string;
  email: string;
  confirmEmail: string;
  password: string;
  goal: string;
}

interface EmailStepProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  emailError: string;
  onEmailErrorChange: (error: string) => void;
}

export const EmailStep = ({
  formData,
  onFormDataChange,
  emailError,
  onEmailErrorChange
}: EmailStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Email e Senha</h2>
        <p className="text-muted-foreground">Crie suas credenciais de acesso</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">E-mail</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => {
              onFormDataChange({ email: e.target.value });
              onEmailErrorChange("");
            }}
            className={`h-12 ${emailError ? 'border-red-500' : ''}`}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Senha</label>
          <Input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => {
              onFormDataChange({ password: e.target.value });
              onEmailErrorChange("");
            }}
            className={`h-12 ${emailError ? 'border-red-500' : ''}`}
          />
        </div>
        
        {emailError && (
          <p className="text-red-500 text-sm mt-2">{emailError}</p>
        )}
      </div>
    </div>
  );
};