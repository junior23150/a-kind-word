import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard, Building2, Calendar } from "lucide-react"
import { BankLogo } from "@/components/ui/BankLogo"
import { BankAccountFlow } from "@/components/accounts/BankAccountFlow"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface BankAccount {
  id: string
  bank_name: string
  account_type: string
  balance: number
  due_day: number | null
  closing_day: number | null
  color: string
}

export default function AccountsPage() {
  const [searchParams] = useSearchParams();
  const [showFlow, setShowFlow] = useState(searchParams.get('new') === 'true')
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowFlow(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching accounts:', error);
      } else {
        setAccounts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (newAccount: Omit<BankAccount, "id">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          bank_name: newAccount.bank_name,
          account_type: newAccount.account_type,
          balance: newAccount.balance,
          due_day: newAccount.due_day,
          closing_day: newAccount.closing_day,
          color: newAccount.color
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding account:', error);
      } else {
        setAccounts([...accounts, data]);
        setShowFlow(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <DashboardLayout>
      <AccountsContent 
        showFlow={showFlow}
        setShowFlow={setShowFlow}
        accounts={accounts}
        handleAddAccount={handleAddAccount}
      />
    </DashboardLayout>
  )
}

function AccountsContent({ 
  showFlow, 
  setShowFlow, 
  accounts, 
  handleAddAccount 
}: {
  showFlow: boolean
  setShowFlow: (show: boolean) => void
  accounts: BankAccount[]
  handleAddAccount: (account: Omit<BankAccount, "id">) => void
}) {
  if (showFlow) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <BankAccountFlow onClose={() => setShowFlow(false)} onSubmit={handleAddAccount} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-knumbers-green/10 via-background to-knumbers-purple/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões de crédito</p>
        </div>

        {/* Add New Account Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowFlow(true)}
            className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:from-knumbers-green/90 hover:to-knumbers-purple/90 text-white shadow-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Nova Conta
          </Button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BankLogo bankName={account.bank_name} size="md" />
                    <div>
                      <CardTitle className="text-lg">{account.bank_name}</CardTitle>
                      <CardDescription>{account.account_type}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Saldo Atual</span>
                    <span className={`font-semibold ${account.balance >= 0 ? "text-knumbers-green" : "text-destructive"}`}>
                      {account.balance >= 0 ? "+" : ""}R${" "}
                      {account.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vencimento</p>
                        <p className="text-sm font-medium">{account.due_day ? `Dia ${account.due_day}` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fechamento</p>
                        <p className="text-sm font-medium">{account.closing_day ? `Dia ${account.closing_day}` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {accounts.length === 0 && (
            <Card className="col-span-full border-2 border-dashed border-border bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma conta cadastrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione sua primeira conta bancária para começar a gerenciar suas finanças
                </p>
                <Button
                  onClick={() => setShowFlow(true)}
                  className="bg-gradient-to-r from-knumbers-green to-knumbers-purple hover:from-knumbers-green/90 hover:to-knumbers-purple/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Conta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}