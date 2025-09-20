import { Check } from "lucide-react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  confirmEmail: string;
  goal: string;
}

interface GoalsStepProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  goals: string[];
}

export const GoalsStep = ({
  formData,
  onFormDataChange,
  goals
}: GoalsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4">O que você está buscando?</h2>
        <p className="text-muted-foreground">Isso nos ajuda a personalizar sua experiência</p>
      </div>
      
      <div className="max-h-60 overflow-y-auto pr-2">
        <div className="grid gap-3">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => onFormDataChange({ goal })}
              className={`p-4 text-left border rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                formData.goal === goal
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{goal}</span>
                {formData.goal === goal && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};