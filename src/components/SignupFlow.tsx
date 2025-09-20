import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignupHeader } from "./signup/SignupHeader";
import { PersonalDataStep } from "./signup/PersonalDataStep";
import { EmailStep } from "./signup/EmailStep";
import { PlanSelectionStep } from "./signup/PlanSelectionStep";
import { GoalsStep } from "./signup/GoalsStep";
import { FinalStep } from "./signup/FinalStep";
import { NavigationButtons } from "./signup/NavigationButtons";

interface SignupFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignupFlow = ({ open, onOpenChange }: SignupFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    countryCode: "+55",
    email: "",
    password: "",
    selectedPlan: "personal",
    goals: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState({
    code: '+55',
    flag: '🇧🇷',
    name: 'Brasil'
  });

  const countries = [
    { code: '+55', flag: '🇧🇷', name: 'Brasil' },
    { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
    { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
    { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
    { code: '+33', flag: '🇫🇷', name: 'França' },
    { code: '+34', flag: '🇪🇸', name: 'Espanha' },
    { code: '+39', flag: '🇮🇹', name: 'Itália' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+52', flag: '🇲🇽', name: 'México' }
  ];

  const steps = [
    { number: 1, title: "Dados Pessoais" },
    { number: 2, title: "Email e Senha" },
    { number: 3, title: "Escolha do Plano" },
    { number: 4, title: "Objetivos" },
    { number: 5, title: "Finalização" }
  ];

  const goals = [
    "Controlar meus gastos pessoais",
    "Organizar finanças familiares",
    "Monitorar despesas empresariais",
    "Criar um planejamento financeiro",
    "Economizar para objetivos específicos",
    "Apenas curiosidade sobre IA financeira"
  ];

  // Função para formatar telefone brasileiro
  const formatBrazilianPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Função para formatar telefone internacional
  const formatInternationalPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  // Função para gerar número final para salvar no banco
  const generateFinalPhoneNumber = (phone: string, countryCode: string) => {
    const numbers = phone.replace(/\D/g, "");
    
    if (countryCode === '+55') {
      // Para Brasil, remover o 9 extra se existir
      if (numbers.length === 11 && numbers[2] === '9') {
        // Remove o 9 extra: (41) 99699-0362 -> +554196990362
        return `${countryCode}${numbers.slice(0, 2)}${numbers.slice(3)}`;
      }
      return `${countryCode}${numbers}`;
    }
    
    return `${countryCode}${numbers}`;
  };

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!validateEmail(formData.email)) {
        toast.error("Por favor, insira um email válido");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    
    try {
      const finalPhoneNumber = generateFinalPhoneNumber(formData.phone, formData.countryCode);
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            phone_number: finalPhoneNumber,
            plan_type: formData.selectedPlan,
            role: 'personal'
          }
        }
      });

      if (authError) throw authError;

      // Criar usuário no WhatsApp (para integração com bot)
      const { data: whatsappUser, error: whatsappError } = await supabase
        .from('whatsapp_users')
        .insert({
          phone_number: finalPhoneNumber,
          name: formData.fullName,
          is_registered: true,
          client_id: "ae50af2d-412f-496a-9dac-781744cc78da"
        })
        .select()
        .single();

      if (whatsappError) {
        console.error("Erro ao criar usuário WhatsApp:", whatsappError);
      }

      // Criar perfil legacy (para compatibilidade com WhatsApp)
      if (whatsappUser) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            whatsapp_user_id: whatsappUser.id,
            client_id: "ae50af2d-412f-496a-9dac-781744cc78da",
            full_name: formData.fullName,
            email: formData.email,
            subscription_plan: formData.selectedPlan
          });

        if (profileError) {
          console.error("Erro ao criar perfil legacy:", profileError);
        }
      }

      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDataStep
            formData={{ 
              name: formData.fullName, 
              phone: formData.phone,
              email: formData.email,
              confirmEmail: formData.email,
              goal: formData.goals.join(', ')
            }}
            onFormDataChange={(data) => handleFormDataChange({ 
              fullName: data.name || formData.fullName,
              phone: data.phone || formData.phone 
            })}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            countries={countries}
            formatBrazilianPhone={formatBrazilianPhone}
            formatInternationalPhone={formatInternationalPhone}
          />
        );
      case 2:
        return (
          <EmailStep
            formData={{
              name: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              confirmEmail: formData.email,
              password: formData.password,
              goal: formData.goals.join(', ')
            }}
            onFormDataChange={(data) => handleFormDataChange({
              email: data.email || formData.email,
              password: data.password || formData.password
            })}
            emailError=""
            onEmailErrorChange={() => {}}
          />
        );
      case 3:
        return (
          <PlanSelectionStep 
            selectedPlan={formData.selectedPlan}
            onPlanSelect={(plan) => handleFormDataChange({ selectedPlan: plan })}
          />
        );
      case 4:
        return (
          <GoalsStep
            formData={{
              name: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              confirmEmail: formData.email,
              goal: formData.goals.join(', ')
            }}
            onFormDataChange={(data) => handleFormDataChange({ 
              goals: data.goal ? [data.goal] : [] 
            })}
            goals={goals}
          />
        );
      case 5:
        return (
          <FinalStep
            onSignup={handleSignup}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent max-h-[95vh] overflow-y-auto">
        <Card className="bg-background border-primary/20 shadow-2xl">
          <CardContent className="p-4 sm:p-8">
            <SignupHeader
              currentStep={currentStep}
              steps={steps}
              onStepClick={setCurrentStep}
            />

            {renderStepContent()}

            {currentStep < 5 && (
              <NavigationButtons
                currentStep={currentStep}
                onBack={handleBack}
                onNext={handleNext}
                formData={{
                  name: formData.fullName,
                  phone: formData.phone,
                  email: formData.email,
                  confirmEmail: formData.email,
                  goal: formData.goals.join(', ')
                }}
              />
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};