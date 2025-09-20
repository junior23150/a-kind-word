import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  confirmEmail: string;
  goal: string;
}

interface NavigationButtonsProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  formData: FormData;
}

export const NavigationButtons = ({
  currentStep,
  onBack,
  onNext,
  formData
}: NavigationButtonsProps) => {
  const isNextDisabled = 
    (currentStep === 1 && (!formData.name || !formData.phone)) ||
    (currentStep === 2 && (!formData.email || !formData.confirmEmail)) ||
    (currentStep === 3 && !formData.goal);

  return (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Button>
      
      {currentStep < 4 && (
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};