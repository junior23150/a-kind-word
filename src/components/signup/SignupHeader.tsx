import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
}

interface SignupHeaderProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (stepNumber: number) => void;
}

export const SignupHeader = ({ currentStep, steps, onStepClick }: SignupHeaderProps) => {
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Knumbers
          </span>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          Etapa {currentStep} de 4
        </Badge>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div 
          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <button
              onClick={() => {
                if (step.number < currentStep) {
                  onStepClick(step.number);
                }
              }}
              disabled={step.number > currentStep}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= step.number 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white cursor-pointer hover:scale-110' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              } ${step.number < currentStep ? 'hover:opacity-80' : ''}`}
            >
              {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
            </button>
            <span className={`text-xs mt-1 transition-colors ${
              currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};