import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1"
            onClick={() => navigate("/pacientes")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Detalhes do Paciente</h1>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Paciente ID: {id}</h2>
        <p className="text-muted-foreground">Esta página será implementada em breve.</p>
      </div>
    </div>
  );
};

export default PatientDetails;