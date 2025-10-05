import { User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabMode } from "@/pages/Organizador";

interface OrganizerHeaderProps {
  tabMode: TabMode;
  onTabChange: (mode: TabMode) => void;
}

export function OrganizerHeader({ tabMode, onTabChange }: OrganizerHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Meu Espaço</h1>
      </div>
      
      <p className="text-muted-foreground">
        Seu espaço pessoal para anotações e organização
      </p>

      <div className="flex justify-center">
        <Tabs value={tabMode} onValueChange={(v) => onTabChange(v as TabMode)}>
          <TabsList>
            <TabsTrigger value="calendar">Meu Calendário</TabsTrigger>
            <TabsTrigger value="tasks">Minhas Anotações</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
