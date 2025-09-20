import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target } from "lucide-react";

const expenseData = [
  { name: 'Alimentação', value: 850, color: '#ef4444' },
  { name: 'Transporte', value: 420, color: '#f97316' },
  { name: 'Moradia', value: 1200, color: '#eab308' },
  { name: 'Lazer', value: 300, color: '#22c55e' },
  { name: 'Saúde', value: 180, color: '#3b82f6' },
  { name: 'Outros', value: 250, color: '#8b5cf6' }
];

const monthlyData = [
  { month: 'Set', receitas: 3500, gastos: 2800 },
  { month: 'Out', receitas: 3500, gastos: 3100 },
  { month: 'Nov', receitas: 3700, gastos: 2900 },
  { month: 'Dez', receitas: 4200, gastos: 3400 },
  { month: 'Jan', receitas: 3500, gastos: 2200 }
];

const dailySpending = [
  { day: '15/01', value: 45 },
  { day: '16/01', value: 120 },
  { day: '17/01', value: 80 },
  { day: '18/01', value: 200 },
  { day: '19/01', value: 65 },
  { day: '20/01', value: 95 },
  { day: '21/01', value: 150 }
];

export function FinancialDashboard() {
  const totalReceitas = 3500;
  const totalGastos = 2200;
  const saldoAtual = totalReceitas - totalGastos;
  const economiaPercentual = ((saldoAtual / totalReceitas) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-financial-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <PiggyBank className="h-4 w-4 text-financial-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-success">
              R$ {saldoAtual.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              +{economiaPercentual}% de economia
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-financial-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-financial-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-primary">
              R$ {totalReceitas.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-financial-danger">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-financial-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-danger">
              R$ {totalGastos.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              -29% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-financial-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
            <Target className="h-4 w-4 text-financial-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-accent">
              R$ 2.500
            </div>
            <p className="text-xs text-muted-foreground">
              ✅ Meta atingida!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gastos</CardTitle>
            <CardDescription>Por categoria este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`R$ ${value}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparativo Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Gastos</CardTitle>
            <CardDescription>Últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`R$ ${value}`, '']} />
                <Bar dataKey="receitas" fill="hsl(var(--financial-primary))" name="Receitas" />
                <Bar dataKey="gastos" fill="hsl(var(--financial-danger))" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gastos Diários */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Diários</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`R$ ${value}`, 'Gasto']} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--financial-secondary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--financial-secondary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights da IA */}
      <Card className="bg-gradient-to-r from-financial-primary/5 to-financial-secondary/5 border-financial-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Insights da IA Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-financial-success rounded-full mt-2"></div>
              <p className="text-sm">
                <strong>Parabéns!</strong> Você está economizando 37% da sua renda este mês, superando a meta de 30%.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-financial-warning rounded-full mt-2"></div>
              <p className="text-sm">
                <strong>Dica:</strong> Seus gastos com alimentação aumentaram 15%. Considere cozinhar mais em casa.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-financial-primary rounded-full mt-2"></div>
              <p className="text-sm">
                <strong>Oportunidade:</strong> Com sua economia atual, você pode investir R$ 500 por mês.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}