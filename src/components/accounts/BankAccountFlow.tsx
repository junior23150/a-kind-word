import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  CreditCard,
  Calendar,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { BankLogo } from "@/components/ui/BankLogo";

interface BankAccountFlowProps {
  onClose: () => void;
  onSubmit: (account: {
    bank_name: string;
    account_type: string;
    balance: number;
    due_day: number | null;
    closing_day: number | null;
    color: string;
  }) => void;
}

const banks = [
  {
    name: "Nubank",
    color: "#8A05BE",
    logo: "💜",
    description: "Banco digital roxinho",
  },
  {
    name: "Santander",
    color: "#EC1C24",
    logo: "🔴",
    description: "Banco Santander",
  },
  {
    name: "Itaú",
    color: "#EC7000",
    logo: "🟠",
    description: "Banco Itaú Unibanco",
  },
  {
    name: "Banco do Brasil",
    color: "#FFF100",
    logo: "🟡",
    description: "Banco do Brasil",
  },
  {
    name: "Caixa",
    color: "#0066CC",
    logo: "🔵",
    description: "Caixa Econômica Federal",
  },
  {
    name: "Sicredi",
    color: "#00A859",
    logo: "🟢",
    description: "Sistema de Crédito Cooperativo",
  },
  {
    name: "Sicoob",
    color: "#00A859",
    logo: "🌿",
    description: "Sistema de Cooperativas de Crédito",
  },
  {
    name: "Bradesco",
    color: "#CC092F",
    logo: "❤️",
    description: "Banco Bradesco",
  },
  { name: "Inter", color: "#FF7A00", logo: "🚀", description: "Banco Inter" },
  {
    name: "Outros",
    color: "#6B7280",
    logo: "🏦",
    description: "Outras instituições",
  },
];

export function BankAccountFlow({ onClose, onSubmit }: BankAccountFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bank_name: "",
    customBankName: "",
    account_type: "",
    balance: "",
    due_day: null as number | null,
    closing_day: null as number | null,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const selectedBank = banks.find((bank) => bank.name === formData.bank_name);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const bankName =
      formData.bank_name === "Outros"
        ? formData.customBankName
        : formData.bank_name;
    const selectedBankData = banks.find(
      (bank) => bank.name === formData.bank_name
    );

    onSubmit({
      bank_name: bankName,
      account_type: formData.account_type,
      balance: Number.parseFloat(formData.balance) || 0,
      due_day: formData.due_day,
      closing_day: formData.closing_day,
      color: selectedBankData?.color || "#6B7280",
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.bank_name !== "";
      case 2:
        return (
          formData.bank_name !== "Outros" || formData.customBankName !== ""
        );
      case 3:
        return formData.account_type !== "";
      case 4:
        return formData.due_day !== null && formData.closing_day !== null;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Escolha seu banco";
      case 2:
        return formData.bank_name === "Outros"
          ? "Nome da instituição"
          : `Configurando ${formData.bank_name}`;
      case 3:
        return "Tipo de conta";
      case 4:
        return "Datas importantes";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Selecione a instituição financeira da sua conta";
      case 2:
        return formData.bank_name === "Outros"
          ? "Digite o nome da sua instituição financeira"
          : "Vamos personalizar sua experiência";
      case 3:
        return "Qual tipo de conta você está adicionando?";
      case 4:
        return "Configure as datas de vencimento e fechamento";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-knumbers-green/10 via-background to-knumbers-purple/10 flex flex-col">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Nova Conta Bancária
                </h1>
                <p className="text-sm text-muted-foreground">
                  Etapa {step} de {totalSteps}
                </p>
              </div>
            </div>

            {selectedBank && (
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: selectedBank.color }}
                >
                  {selectedBank.logo}
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {selectedBank.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBank.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background/60 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Progress value={progress} className="h-2 mb-3" />
          <div className="flex justify-between text-sm font-medium">
            <span
              className={step >= 1 ? "text-primary" : "text-muted-foreground"}
            >
              Banco
            </span>
            <span
              className={step >= 2 ? "text-primary" : "text-muted-foreground"}
            >
              Detalhes
            </span>
            <span
              className={step >= 3 ? "text-primary" : "text-muted-foreground"}
            >
              Tipo
            </span>
            <span
              className={step >= 4 ? "text-primary" : "text-muted-foreground"}
            >
              Datas
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-4">
        <div className="max-w-7xl mx-auto px-6">
          {/* Step Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {getStepDescription()}
            </p>
          </div>

          {/* Step Content */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            {step === 1 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 w-full">
                  {banks.map((bank) => (
                    <Card
                      key={bank.name}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                        formData.bank_name === bank.name
                          ? "ring-2 shadow-xl scale-105"
                          : ""
                      }`}
                      style={{
                        borderColor:
                          formData.bank_name === bank.name
                            ? bank.color
                            : undefined,
                      }}
                      onClick={() =>
                        setFormData({ ...formData, bank_name: bank.name })
                      }
                    >
                      <CardContent className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                        <div className="flex justify-center mb-4">
                          <BankLogo bankName={bank.name} size="lg" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 text-sm">
                          {bank.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {bank.description}
                        </p>
                        {formData.bank_name === bank.name && (
                          <div className="flex items-center justify-center space-x-1 text-knumbers-green animate-fade-in">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Selecionado
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md mx-auto">
                {formData.bank_name === "Outros" ? (
                  <Card className="p-4">
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-2xl mx-auto mb-4">
                          🏦
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label
                          htmlFor="customBank"
                          className="text-base font-medium"
                        >
                          Nome da Instituição
                        </Label>
                        <Input
                          id="customBank"
                          placeholder="Ex: Banco Original, C6 Bank, etc."
                          value={formData.customBankName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customBankName: e.target.value,
                            })
                          }
                          className="text-base p-3 h-12"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="p-4 text-center">
                    <CardContent>
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                        style={{ backgroundColor: selectedBank?.color }}
                      >
                        <span className="text-3xl text-white">
                          {selectedBank?.logo}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-knumbers-green mb-4">
                          <Sparkles className="h-5 w-5" />
                          <span className="text-lg font-bold">
                            Ótima escolha!
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">
                          {selectedBank?.name}
                        </h3>
                        <p className="text-base text-muted-foreground">
                          {selectedBank?.description}
                        </p>
                        <p className="text-muted-foreground">
                          Vamos configurar sua conta com a melhor experiência
                          possível
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="max-w-lg mx-auto">
                <Card className="p-4">
                  <CardContent className="space-y-4">
                    <div className="text-center mb-6">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="accountType"
                        className="text-base font-medium"
                      >
                        Tipo de Conta
                      </Label>
                      <Select
                        value={formData.account_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, account_type: value })
                        }
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Selecione o tipo de conta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conta Corrente">
                            💳 Conta Corrente
                          </SelectItem>
                          <SelectItem value="Conta Poupança">
                            🐷 Conta Poupança
                          </SelectItem>
                          <SelectItem value="Cartão de Crédito">
                            💎 Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="Conta Salário">
                            💰 Conta Salário
                          </SelectItem>
                          <SelectItem value="Conta Digital">
                            📱 Conta Digital
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="balance"
                        className="text-base font-medium flex items-center space-x-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Saldo Atual (Opcional)</span>
                      </Label>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.balance}
                        onChange={(e) =>
                          setFormData({ ...formData, balance: e.target.value })
                        }
                        className="text-base p-3 h-12"
                      />
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Dica:</strong> Para cartões de crédito, use
                          valores negativos para representar dívidas (ex:
                          -500.00)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="max-w-lg mx-auto">
                <Card className="p-4">
                  <CardContent className="space-y-4">
                    <div className="text-center mb-6">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label
                          htmlFor="closingDate"
                          className="text-base font-medium"
                        >
                          Dia do Fechamento
                        </Label>
                        <Select
                          value={formData.closing_day?.toString() || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              closing_day: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  Dia {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label
                          htmlFor="dueDate"
                          className="text-base font-medium"
                        >
                          Dia do Vencimento
                        </Label>
                        <Select
                          value={formData.due_day?.toString() || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              due_day: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  Dia {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">💡</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Como funciona?
                          </h4>
                          <p className="text-sm text-blue-800">
                            O <strong>fechamento</strong> é quando o banco
                            calcula sua fatura, e o <strong>vencimento</strong>{" "}
                            é quando você deve pagar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-background/90 backdrop-blur-sm border-t mt-4">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90"
              >
                <span>Próximo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                <span>Finalizar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
