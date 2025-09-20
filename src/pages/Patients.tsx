import { useState } from "react";
import { Search, Plus, Users, Download, X, ChevronRight, Calendar, Printer, Trash2, ChevronDown, FileSpreadsheet } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: string;
  code: string;
  name: string;
  clienteSince: string;
  fantasia: string;
  cpfCnpj: string;
  email: string;
  city: string;
  cep: string;
  phone: string;
  proximaVisita: string;
  observacoes: string;
  dateOfBirth?: string; // Adicionado para aniversariantes
  age?: number; // Adicionado para aniversariantes
}

// Dados mockados removidos - usando apenas dados reais do Supabase

const Patients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [birthdayDialogOpen, setBirthdayDialogOpen] = useState(false);
  const [groupBy, setGroupBy] = useState("estados");
  const [birthdayPeriod, setBirthdayPeriod] = useState("mes");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), "dd/MM"));
  const [periodFrom, setPeriodFrom] = useState("01/07");
  const [periodTo, setPeriodTo] = useState("31/07");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'selected'>('all');
  const [fileFormat, setFileFormat] = useState<'csv' | 'xlsx'>('xlsx');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowSearchDropdown(value.trim() !== "");
    if (value.trim() === "") {
      setFilteredPatients(patients);
    }
  };

  const searchResults = searchTerm.trim() !== "" ? patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpfCnpj.includes(searchTerm)
  ) : [];

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId]);
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(filteredPatients.map(p => p.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const clearSelection = () => {
    setSelectedPatients([]);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearchDropdown(false);
    setFilteredPatients(patients);
  };

  const handleDeletePatients = () => {
    const updatedPatients = patients.filter(patient => !selectedPatients.includes(patient.id));
    setPatients(updatedPatients);
    setFilteredPatients(updatedPatients);
    setSelectedPatients([]);
  };

  const generatePDF = (patientsData = patients, title = 'Relatório de Pacientes') => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Título do documento
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Data de geração
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dateStr}`, 20, 30);
    
    // Preparar dados para a tabela
    const tableData = patientsData.map(patient => [
      patient.name,
      patient.clienteSince,
      patient.fantasia,
      patient.cpfCnpj,
      patient.email,
      patient.city,
      patient.cep,
      patient.phone,
      patient.proximaVisita,
      patient.observacoes
    ]);
    
    // Criar tabela
    autoTable(doc, {
      head: [['Nome', 'Cliente desde', 'Fantasia', 'CPF/CNPJ', 'E-mail', 'Cidade', 'CEP', 'Telefone', 'Próxima visita', 'Observações']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [147, 51, 234], // Purple color
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Nome
        1: { cellWidth: 20 }, // Cliente desde
        2: { cellWidth: 35 }, // Fantasia
        3: { cellWidth: 25 }, // CPF/CNPJ
        4: { cellWidth: 30 }, // E-mail
        5: { cellWidth: 20 }, // Cidade
        6: { cellWidth: 18 }, // CEP
        7: { cellWidth: 22 }, // Telefone
        8: { cellWidth: 20 }, // Próxima visita
        9: { cellWidth: 50 }  // Observações
      },
      margin: { top: 40, left: 20, right: 20 }
    });
    
    // Salvar o PDF
    doc.save('relatorio-pacientes.pdf');
  };

  const generateSelectedPatientsPDF = () => {
    const selectedPatientsData = patients.filter(patient => selectedPatients.includes(patient.id));
    generatePDF(selectedPatientsData, 'Relatório de Pacientes Selecionados');
  };

  const generateGroupedPatientsPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    let title = 'Relatório de Pacientes Agrupados';
    
    // Título do documento
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Data de geração
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dateStr}`, 20, 30);
    
    let currentY = 50;
    
    // Agrupar pacientes por critério selecionado
    const groupedPatients: { [key: string]: Patient[] } = {};
    
    patients.forEach(patient => {
      let groupKey = '';
      if (groupBy === 'estados') {
        groupKey = patient.city;
        title += ' por Estados';
      } else if (groupBy === 'estados-municipios') {
        groupKey = patient.city;
        title += ' por Estados - Municípios';
      } else if (groupBy === 'estados-municipios-bairros') {
        groupKey = patient.city;
        title += ' por Estados - Municípios - Bairros';
      } else if (groupBy === 'estados-municipios-bairros-ruas') {
        groupKey = patient.city;
        title += ' por Estados - Municípios - Bairros - Ruas';
      }
      
      if (!groupedPatients[groupKey]) {
        groupedPatients[groupKey] = [];
      }
      groupedPatients[groupKey].push(patient);
    });
    
    // Ordenar as chaves dos grupos
    const sortedGroups = Object.keys(groupedPatients).sort();
    
    // Gerar uma seção para cada grupo
    sortedGroups.forEach((groupName, groupIndex) => {
      // Verificar se precisa de nova página
      if (currentY > 250 && groupIndex > 0) {
        doc.addPage();
        currentY = 20;
      }
      
      // Título do grupo
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${groupName}`, 20, currentY);
      currentY += 10;
      
      // Preparar dados para a tabela do grupo
      const tableData = groupedPatients[groupName].map(patient => [
        patient.name,
        patient.clienteSince,
        patient.fantasia,
        patient.cpfCnpj,
        patient.email,
        patient.city,
        patient.cep,
        patient.phone,
        patient.proximaVisita,
        patient.observacoes
      ]);
      
      // Criar tabela para o grupo
      autoTable(doc, {
        head: [['Nome', 'Cliente desde', 'Fantasia', 'CPF/CNPJ', 'E-mail', 'Cidade', 'CEP', 'Telefone', 'Próxima visita', 'Observações']],
        body: tableData,
        startY: currentY,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [147, 51, 234], // Purple color
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Nome
          1: { cellWidth: 20 }, // Cliente desde
          2: { cellWidth: 35 }, // Fantasia
          3: { cellWidth: 25 }, // CPF/CNPJ
          4: { cellWidth: 30 }, // E-mail
          5: { cellWidth: 20 }, // Cidade
          6: { cellWidth: 18 }, // CEP
          7: { cellWidth: 22 }, // Telefone
          8: { cellWidth: 20 }, // Próxima visita
          9: { cellWidth: 50 }  // Observações
        },
        margin: { top: 40, left: 20, right: 20 },
        didDrawPage: (data) => {
          currentY = data.cursor?.y || currentY;
        }
      });
      
      // Atualizar posição Y após a tabela
      currentY += 20;
    });
    
    // Salvar o PDF
    doc.save('relatorio-pacientes-agrupados.pdf');
    setGroupDialogOpen(false);
  };

  // Handlers para controles de data
  const handlePreviousMonth = () => {
    setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const generateBirthdayPatientsPDF = () => {
    let birthdayPatients = [...patients];
    let title = 'Relatório de Aniversariantes';
    
    // Filtrar pacientes com base no período selecionado
    if (birthdayPeriod === 'mes') {
      // Simular filtro por mês - em produção, usar dateOfBirth
      title += ` - ${monthNames[selectedMonth - 1]}`;
      birthdayPatients = patients.filter(p => {
        if (p.dateOfBirth) {
          const birthMonth = parseInt(p.dateOfBirth.split('/')[1]);
          return birthMonth === selectedMonth;
        }
        return false;
      });
    } else if (birthdayPeriod === 'dia') {
      title += ` - ${selectedDay}`;
      birthdayPatients = patients.filter(p => {
        if (p.dateOfBirth) {
          const birthDay = p.dateOfBirth.substring(0, 5); // DD/MM
          return birthDay === selectedDay;
        }
        return false;
      });
    } else if (birthdayPeriod === 'periodo') {
      title += ` - Período: ${periodFrom} a ${periodTo}`;
      // Simular filtro por período
      birthdayPatients = patients.filter(p => {
        if (p.dateOfBirth) {
          const birthDay = p.dateOfBirth.substring(0, 5); // DD/MM
          return birthDay >= periodFrom && birthDay <= periodTo;
        }
        return false;
      });
    }
    
    // Gerar PDF específico para aniversariantes
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Título do documento
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Data de geração
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dateStr}`, 20, 30);
    
    // Preparar dados para a tabela de aniversariantes
    const tableData = birthdayPatients.map(patient => [
      patient.name,
      patient.dateOfBirth || 'N/A',
      patient.age?.toString() || 'N/A',
      patient.email,
      patient.phone
    ]);
    
    // Criar tabela
    autoTable(doc, {
      head: [['Nome Completo', 'Data de Nascimento', 'Idade Atual', 'E-mail', 'Telefone']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [147, 51, 234], // Purple color
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Nome Completo
        1: { cellWidth: 40 }, // Data de Nascimento
        2: { cellWidth: 30 }, // Idade Atual
        3: { cellWidth: 60 }, // E-mail
        4: { cellWidth: 40 }  // Telefone
      },
      margin: { top: 40, left: 20, right: 20 }
    });
    
    // Salvar o PDF
    doc.save(`aniversariantes-${birthdayPeriod}.pdf`);
    setBirthdayDialogOpen(false);
  };

  const exportToExcel = (data: Patient[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(patient => ({
      'Código': patient.code,
      'Nome': patient.name,
      'Cliente desde': patient.clienteSince,
      'Fantasia': patient.fantasia,
      'CPF/CNPJ': patient.cpfCnpj,
      'E-mail': patient.email,
      'Cidade': patient.city,
      'CEP': patient.cep,
      'Telefone': patient.phone,
      'Próxima visita': patient.proximaVisita,
      'Observações': patient.observacoes
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');
    
    if (fileFormat === 'csv') {
      XLSX.writeFile(workbook, `${filename}.csv`);
    } else {
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }
  };

  const handleExport = () => {
    let dataToExport: Patient[] = [];
    let filename = '';
    
    if (exportType === 'all') {
      dataToExport = patients;
      filename = 'todos-pacientes';
    } else {
      dataToExport = patients.filter(patient => selectedPatients.includes(patient.id));
      filename = 'pacientes-selecionados';
    }
    
    exportToExcel(dataToExport, filename);
    setExportDialogOpen(false);
  };

  const openExportDialog = (type: 'all' | 'selected') => {
    setExportType(type);
    setExportDialogOpen(true);
  };

  const allSelected = filteredPatients.length > 0 && selectedPatients.length === filteredPatients.length;
  const someSelected = selectedPatients.length > 0 && selectedPatients.length < filteredPatients.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-1">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <h1 className="text-xl font-semibold">Pacientes</h1>
          </div>
          
          <Button 
            onClick={() => navigate("/cadastro-paciente")}
            className={cn(
              "bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-medium",
              sidebarOpen ? "w-[280px]" : "w-12"
            )}
          >
            <Plus className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Incluir cadastro</span>}
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome, e-mail, CPF ou CNPJ"
              className={cn("pl-10 rounded-xl", searchTerm && "pr-10")}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchDropdown(searchTerm.trim() !== "")}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSearchTerm(patient.name);
                      setShowSearchDropdown(false);
                      setFilteredPatients([patient]);
                    }}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">{patient.cpfCnpj}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className={cn("flex gap-2", sidebarOpen ? "mr-80" : "mr-16")}>
            <Button variant="outline" size="sm" className="p-2" onClick={() => generatePDF()}>
              <Printer className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn("p-2", selectedPatients.length === 0 && "opacity-50 cursor-not-allowed")}
                  disabled={selectedPatients.length === 0}
                >
                  <Trash2 className={cn("h-4 w-4", selectedPatients.length > 0 && "text-red-600")} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-orange-50 border-orange-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold text-foreground">
                    Atenção
                  </AlertDialogTitle>
                  <AlertDialogDescription className="flex items-center gap-3 text-orange-700">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">!</span>
                    </div>
                    <span>
                      Confirma a exclusão de {selectedPatients.length} contato(s) selecionado(s)?
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
                    Não
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeletePatients}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Sim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Right Sidebar */}
          <div className={cn(
            "bg-card transition-all duration-300 rounded-lg border border-border ml-4 fixed right-4 top-20 h-[calc(100vh-5rem)]",
            sidebarOpen ? "w-[280px]" : "w-12"
          )}>
            <div className="p-4 h-full flex flex-col">
              {sidebarOpen ? (
                <>
                  {/* New Consultation Button */}
                  <Button className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <Calendar className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Nova consulta</span>}
                  </Button>

                  <hr className="border-border mb-4" />

                  {/* Information Section */}
                  <div className="space-y-4 flex-1">
                    <h3 className="font-medium text-sm">Informações</h3>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        Quantidade de contatos
                      </div>
                      <div className="text-2xl font-bold">{patients.length}</div>
                    </div>

                    {selectedPatients.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Contatos selecionados</div>
                        <div className="text-2xl font-bold">{selectedPatients.length}</div>
                      </div>
                    )}

                    <hr className="border-border" />

                    {/* More Actions */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-2"
                        onClick={() => setMoreActionsOpen(!moreActionsOpen)}
                      >
                        {moreActionsOpen ? (
                          <span className="text-purple-600">- Mais ações</span>
                        ) : (
                          <span className="text-purple-600">+ Mais ações</span>
                        )}
                      </Button>
                      
                      {moreActionsOpen && (
                        <div className="ml-4 mt-2 space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Imprimir</div>
                            <div className="ml-4 space-y-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn("w-full justify-start text-xs", selectedPatients.length === 0 && "opacity-50 cursor-not-allowed")}
                                disabled={selectedPatients.length === 0}
                                onClick={generateSelectedPatientsPDF}
                              >
                                Contatos selecionados
                              </Button>
                              
                              <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                    Contatos agrupados
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-background border border-border">
                                  <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold">Agrupar impressão por:</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <RadioGroup value={groupBy} onValueChange={setGroupBy}>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="estados" id="estados" />
                                        <Label htmlFor="estados">Estados</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="estados-municipios" id="estados-municipios" />
                                        <Label htmlFor="estados-municipios">Estados - Municípios</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="estados-municipios-bairros" id="estados-municipios-bairros" />
                                        <Label htmlFor="estados-municipios-bairros">Estados - Municípios - Bairros</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="estados-municipios-bairros-ruas" id="estados-municipios-bairros-ruas" />
                                        <Label htmlFor="estados-municipios-bairros-ruas">Estados - Municípios - Bairros - Ruas</Label>
                                      </div>
                                    </RadioGroup>
                                    
                                    
                                    <div className="flex justify-end mt-6">
                                      <Button 
                                        onClick={generateGroupedPatientsPDF}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        Imprimir
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog open={birthdayDialogOpen} onOpenChange={setBirthdayDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                    Aniversariantes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-background border border-border">
                                  <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold">Selecione o período:</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <Label className="text-sm font-medium">Período</Label>
                                        <RadioGroup value={birthdayPeriod} onValueChange={setBirthdayPeriod} className="mt-2">
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="mes" id="mes" />
                                            <Label htmlFor="mes">Do mês</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="dia" id="dia" />
                                            <Label htmlFor="dia">Do dia</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="periodo" id="periodo" />
                                            <Label htmlFor="periodo">De um período</Label>
                                          </div>
                                        </RadioGroup>
                                      </div>
                                      
                                      <div>
                                         {birthdayPeriod === "mes" && (
                                           <div>
                                             <Label className="text-sm font-medium">Mês</Label>
                                             <div className="flex items-center space-x-2 mt-2">
                                               <Button 
                                                 variant="outline" 
                                                 size="sm" 
                                                 className="p-2"
                                                 onClick={handlePreviousMonth}
                                               >
                                                 <ChevronRight className="h-4 w-4 rotate-180" />
                                               </Button>
                                               <Input 
                                                 value={monthNames[selectedMonth - 1]}
                                                 className="text-center flex-1"
                                                 readOnly
                                               />
                                               <Button 
                                                 variant="outline" 
                                                 size="sm" 
                                                 className="p-2"
                                                 onClick={handleNextMonth}
                                               >
                                                 <ChevronRight className="h-4 w-4" />
                                               </Button>
                                             </div>
                                           </div>
                                         )}
                                         
                                         {birthdayPeriod === "dia" && (
                                           <div>
                                             <Label className="text-sm font-medium">Dia</Label>
                                             <div className="flex items-center space-x-2 mt-2 relative">
                                               <Input 
                                                 value={selectedDay}
                                                 onChange={(e) => setSelectedDay(e.target.value)}
                                                 className="flex-1 pr-10"
                                                 placeholder="dd/mm"
                                               />
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                                    >
                                                      <Calendar className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                      mode="single"
                                                      selected={new Date()}
                                                      onSelect={(date) => {
                                                        if (date) {
                                                          setSelectedDay(format(date, "dd/MM"));
                                                        }
                                                      }}
                                                      initialFocus
                                                      className={cn("p-3 pointer-events-auto")}
                                                    />
                                                  </PopoverContent>
                                                </Popover>
                                             </div>
                                           </div>
                                         )}
                                         
                                         {birthdayPeriod === "periodo" && (
                                           <div>
                                             <Label className="text-sm font-medium">Datas</Label>
                                             <div className="mt-2 space-y-2">
                                               <div className="flex items-center space-x-2 relative">
                                                 <Label htmlFor="date-from" className="text-xs w-8">De:</Label>
                                                 <Input 
                                                   id="date-from"
                                                   value={periodFrom}
                                                   onChange={(e) => setPeriodFrom(e.target.value)}
                                                   className="flex-1 h-8 pr-8"
                                                   placeholder="dd/mm"
                                                 />
                                                 <Popover>
                                                   <PopoverTrigger asChild>
                                                     <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                     >
                                                       <Calendar className="h-3 w-3 text-green-600" />
                                                     </Button>
                                                   </PopoverTrigger>
                                                   <PopoverContent className="w-auto p-0" align="start">
                                                      <CalendarComponent
                                                        mode="single"
                                                        selected={new Date()}
                                                        onSelect={(date) => {
                                                          if (date) {
                                                            setPeriodFrom(format(date, "dd/MM"));
                                                          }
                                                        }}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                      />
                                                   </PopoverContent>
                                                 </Popover>
                                               </div>
                                               <div className="flex items-center space-x-2 relative">
                                                 <Label htmlFor="date-to" className="text-xs w-8">Até:</Label>
                                                 <Input 
                                                   id="date-to"
                                                   value={periodTo}
                                                   onChange={(e) => setPeriodTo(e.target.value)}
                                                   className="flex-1 h-8 pr-8"
                                                   placeholder="dd/mm"
                                                 />
                                                 <Popover>
                                                   <PopoverTrigger asChild>
                                                     <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                     >
                                                       <Calendar className="h-3 w-3 text-green-600" />
                                                     </Button>
                                                   </PopoverTrigger>
                                                   <PopoverContent className="w-auto p-0" align="start">
                                                      <CalendarComponent
                                                        mode="single"
                                                        selected={new Date()}
                                                        onSelect={(date) => {
                                                          if (date) {
                                                            setPeriodTo(format(date, "dd/MM"));
                                                          }
                                                        }}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                      />
                                                   </PopoverContent>
                                                 </Popover>
                                               </div>
                                             </div>
                                           </div>
                                         )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end mt-6">
                                      <Button 
                                        onClick={generateBirthdayPatientsPDF}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        Imprimir
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          
                          <hr className="border-border" />
                          
                          {/* Export Section */}
                          <div>
                            <div className="text-sm font-medium mb-2">Exportar para planilha</div>
                            <div className="ml-4 space-y-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn("w-full justify-start text-xs", selectedPatients.length > 0 && "opacity-50 cursor-not-allowed")}
                                disabled={selectedPatients.length > 0}
                                onClick={() => openExportDialog('all')}
                              >
                                <FileSpreadsheet className="h-3 w-3 mr-2" />
                                Exportar todos
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn("w-full justify-start text-xs", selectedPatients.length === 0 && "opacity-50 cursor-not-allowed")}
                                disabled={selectedPatients.length === 0}
                                onClick={() => openExportDialog('selected')}
                              >
                                <FileSpreadsheet className="h-3 w-3 mr-2" />
                                Exportar selecionados
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Toggle Button at Bottom */}
                  <div className="mt-auto pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="justify-start p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Collapsed state - only show arrow */}
                  <div className="flex flex-col h-full">
                    <div className="mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={cn("p-2", sidebarOpen ? "justify-start" : "justify-center")}
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Table directly below search */}
      <div className={cn("px-4 pb-4", sidebarOpen ? "mr-[296px]" : "mr-[60px]")}>
        {/* Filters and Selection Info */}
        <div className="mb-4">
          {selectedPatients.length > 0 && (
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <span className="text-sm">Selecionados: {selectedPatients.length} cadastros</span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-2">
            Nenhum filtro aplicado
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow 
                  key={patient.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/paciente/${patient.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={(checked) => handleSelectPatient(patient.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{patient.code}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.cpfCnpj}</TableCell>
                  <TableCell>{patient.city}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            1 - {Math.min(filteredPatients.length, 100)} de 100
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Primeira</Button>
            <Button variant="outline" size="sm">Anterior</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">Próxima</Button>
            <Button variant="outline" size="sm">Última</Button>
          </div>
        </div>
      </div>

      {/* Export Format Selection Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar formato do arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Escolha o formato do arquivo para exportação:
            </div>
            <RadioGroup value={fileFormat} onValueChange={(value: 'csv' | 'xlsx') => setFileFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                  CSV (.csv)
                </Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
                Confirmar Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;