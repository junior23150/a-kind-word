import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, Building2 } from "lucide-react"
import { BankLogo } from "@/components/ui/BankLogo"

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (account: {
    bankName: string
    accountType: string
    balance: number
    dueDate: string
    closingDate: string
    color: string
  }) => void
}

const banks = [
  { name: "Nubank", color: "#8A05BE", logo: "💜" },
  { name: "Santander", color: "#EC1C24", logo: "🔴" },
  { name: "Itaú", color: "#EC7000", logo: "🟠" },
  { name: "Banco do Brasil", color: "#FFF100", logo: "🟡" },
  { name: "Caixa", color: "#0066CC", logo: "🔵" },
  { name: "Sicredi", color: "#00A859", logo: "🟢" },
  { name: "Sicoob", color: "#00A859", logo: "🟢" },
  { name: "Bradesco", color: "#CC092F", logo: "🔴" },
  { name: "Inter", color: "#FF7A00", logo: "🟠" },
  { name: "Outros", color: "#6B7280", logo: "🏦" },
]

export function BankAccountModal({ isOpen, onClose, onSubmit }: BankAccountModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    bankName: "",
    customBankName: "",
    accountType: "",
    balance: "",
    dueDate: "",
    closingDate: "",
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const selectedBank = banks.find((bank) => bank.name === formData.bankName)

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    const bankName = formData.bankName === "Outros" ? formData.customBankName : formData.bankName
    const selectedBankData = banks.find((bank) => bank.name === formData.bankName)

    onSubmit({
      bankName,
      accountType: formData.accountType,
      balance: Number.parseFloat(formData.balance) || 0,
      dueDate: formData.dueDate,
      closingDate: formData.closingDate,
      color: selectedBankData?.color || "#6B7280",
    })

    // Reset form
    setStep(1)
    setFormData({
      bankName: "",
      customBankName: "",
      accountType: "",
      balance: "",
      dueDate: "",
      closingDate: "",
    })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.bankName !== ""
      case 2:
        return formData.bankName !== "Outros" || formData.customBankName !== ""
      case 3:
        return formData.accountType !== ""
      case 4:
        return formData.dueDate !== "" && formData.closingDate !== ""
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Escolha seu banco</h3>
              <p className="text-muted-foreground">Selecione a instituição financeira da sua conta</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {banks.map((bank) => (
                <Card
                  key={bank.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.bankName === bank.name ? "ring-2 ring-primary bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setFormData({ ...formData, bankName: bank.name })}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <BankLogo bankName={bank.name} size="md" />
                    <span className="font-medium">{bank.name}</span>
                    {formData.bankName === bank.name && <Check className="h-5 w-5 text-primary ml-auto" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {formData.bankName === "Outros" ? "Nome da instituição" : `Configurando ${formData.bankName}`}
              </h3>
              <p className="text-muted-foreground">
                {formData.bankName === "Outros"
                  ? "Digite o nome da sua instituição financeira"
                  : "Vamos personalizar sua experiência"}
              </p>
            </div>

            {formData.bankName === "Outros" ? (
              <div className="space-y-4">
                <Label htmlFor="customBank">Nome da Instituição</Label>
                <Input
                  id="customBank"
                  placeholder="Ex: Banco Original, C6 Bank, etc."
                  value={formData.customBankName}
                  onChange={(e) => setFormData({ ...formData, customBankName: e.target.value })}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: selectedBank?.color }}
                >
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">Ótima escolha! 🎉</h4>
                <p className="text-muted-foreground">Vamos configurar sua conta do {formData.bankName}</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Tipo de conta</h3>
              <p className="text-muted-foreground">Qual tipo de conta você está adicionando?</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                  <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Conta Salário">Conta Salário</SelectItem>
                  <SelectItem value="Conta Digital">Conta Digital</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Atual (Opcional)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Para cartões de crédito, use valores negativos para representar dívidas
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Datas importantes</h3>
              <p className="text-muted-foreground">Configure as datas de vencimento e fechamento</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closingDate">Dia do Fechamento</Label>
                <Select
                  value={formData.closingDate}
                  onValueChange={(value) => setFormData({ ...formData, closingDate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Dia do Vencimento</Label>
                <Select
                  value={formData.dueDate}
                  onValueChange={(value) => setFormData({ ...formData, dueDate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> O fechamento é quando o banco calcula sua fatura, e o vencimento é quando você
                deve pagar. Essas datas ajudam no controle financeiro.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Nova Conta Bancária</span>
            <span className="text-sm font-normal text-muted-foreground">
              {step} de {totalSteps}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Banco</span>
              <span>Detalhes</span>
              <span>Tipo</span>
              <span>Datas</span>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {step === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:from-knumbers-green/90 hover:to-knumbers-purple/90"
              >
                <Check className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:from-knumbers-green/90 hover:to-knumbers-purple/90"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}