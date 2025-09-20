import { useState } from "react";
import { ChevronLeft, Save, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedInput } from "@/components/FormattedInput";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "@/hooks/use-toast";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Data
    name: "",
    surname: "",
    birthDate: "",
    gender: "",
    pronouns: "",
    customPronouns: "",
    height: "",
    weight: "",
    civilStatus: "",
    patientSince: "",
    
    // Contact Information
    mainPhone: "",
    cellPhone: "",
    email: "",
    commercialPhone: "",
    profession: "",
    cpfCnpj: "",
    
    // Address
    address: "",
    number: "",
    complement: "",
    state: "",
    city: "",
    neighborhood: "",
    cep: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencySurname: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    
    // Medications
    takingMedication: "",
    medicationDetails: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const searchCep = async () => {
    if (!formData.cep) {
      toast({
        title: "CEP não informado",
        description: "Por favor, informe o CEP para realizar a busca.",
        variant: "destructive",
      });
      return;
    }

    const cleanCep = formData.cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "O CEP deve ter 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || "",
        city: data.localidade || "",
        state: data.uf || "",
        neighborhood: data.bairro || "",
      }));

      toast({
        title: "CEP encontrado",
        description: "Endereço preenchido automaticamente!",
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o CEP. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Paciente cadastrado",
      description: "O cadastro foi realizado com sucesso!",
    });
    navigate("/pacientes");
  };

  const genderOptions = [
    "Masculino",
    "Feminino", 
    "Não-binário",
    "Prefiro não informar",
    "Outro"
  ];

  const pronounOptions = [
    "Ele/dele",
    "Ela/dela",
    "Outro"
  ];

  const civilStatusOptions = [
    "Solteiro(a)",
    "Casado(a)",
    "Divorciado(a)",
    "Viúvo(a)",
    "União estável",
    "Separado(a)"
  ];

  const relationshipOptions = [
    "Pai",
    "Mãe",
    "Filho(a)",
    "Cônjuge",
    "Irmão(ã)",
    "Amigo(a)",
    "Outro"
  ];

  const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <h1 className="text-xl font-semibold">Cadastro de Paciente</h1>
        </div>
      </div>

      {/* Page Title and Action Buttons */}
      <div className="p-6 pb-2 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Novo Paciente</h2>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/pacientes")}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="patient-form"
            className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="p-6 mx-auto max-w-full">
        <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="dados-pessoais" className="w-full">
            <TabsList className="bg-transparent border-b border-border p-0 h-auto justify-start">
              <TabsTrigger 
                value="dados-pessoais" 
                className="border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent bg-transparent px-4 py-3 mx-2 rounded-none"
              >
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger 
                value="contato" 
                className="border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent bg-transparent px-4 py-3 mx-2 rounded-none"
              >
                Contato
              </TabsTrigger>
              <TabsTrigger 
                value="endereco" 
                className="border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent bg-transparent px-4 py-3 mx-2 rounded-none"
              >
                Endereço
              </TabsTrigger>
              <TabsTrigger 
                value="emergencia" 
                className="border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent bg-transparent px-4 py-3 mx-2 rounded-none"
              >
                Emergência
              </TabsTrigger>
              <TabsTrigger 
                value="medicamentos" 
                className="border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent bg-transparent px-4 py-3 mx-2 rounded-none"
              >
                Medicamentos
              </TabsTrigger>
            </TabsList>

            {/* Dados Pessoais Tab */}
            <TabsContent value="dados-pessoais">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Sobrenome *</Label>
                    <Input
                      value={formData.surname}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                      required
                    />
                  </div>

                  <DatePicker
                    label="Data de Nascimento"
                    value={formData.birthDate}
                    onChange={(value) => handleInputChange("birthDate", value)}
                    required
                  />

                  <div className="mt-1">
                    <Label className="mb-1">Sexo</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Pronomes (como gostaria de ser chamado)</Label>
                    <Select value={formData.pronouns} onValueChange={(value) => handleInputChange("pronouns", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {pronounOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.pronouns === "Outro" && (
                    <div>
                      <Label>Especifique seus pronomes</Label>
                      <Input
                        value={formData.customPronouns}
                        onChange={(e) => handleInputChange("customPronouns", e.target.value)}
                        placeholder="Especifique seus pronomes"
                      />
                    </div>
                  )}

                  <FormattedInput
                    label="CPF/CNPJ"
                    type="cpf-cnpj"
                    value={formData.cpfCnpj}
                    onChange={(value) => handleInputChange("cpfCnpj", value)}
                    placeholder="000.000.000-00"
                  />

                  <div>
                    <Label>Estado Civil</Label>
                    <Select value={formData.civilStatus} onValueChange={(value) => handleInputChange("civilStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {civilStatusOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="-mt-1">
                    <DatePicker
                      label="Paciente desde"
                      value={formData.patientSince}
                      onChange={(value) => handleInputChange("patientSince", value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Informações de Contato Tab */}
            <TabsContent value="contato">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormattedInput
                    label="Telefone Principal"
                    type="phone"
                    value={formData.mainPhone}
                    onChange={(value) => handleInputChange("mainPhone", value)}
                    placeholder="(00) 0000-0000"
                  />

                  <FormattedInput
                    label="Celular"
                    type="phone"
                    value={formData.cellPhone}
                    onChange={(value) => handleInputChange("cellPhone", value)}
                    placeholder="(00) 0 0000-0000"
                  />

                  <div>
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  <FormattedInput
                    label="Telefone Comercial"
                    type="phone"
                    value={formData.commercialPhone}
                    onChange={(value) => handleInputChange("commercialPhone", value)}
                    placeholder="(00) 0000-0000"
                  />

                  <div>
                    <Label>Profissão</Label>
                    <Input
                      value={formData.profession}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                      placeholder="Ex: Engenheiro, Médico, etc."
                    />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* Endereço Tab */}
            <TabsContent value="endereco">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primeira linha: CEP, UF, Cidade, Bairro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>CEP</Label>
                      <div className="relative">
                        <Input
                          value={formData.cep}
                          onChange={(e) => {
                            // Aplicar máscara de CEP
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 5) {
                              value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
                            }
                            handleInputChange("cep", value);
                          }}
                          placeholder="00000-000"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={searchCep}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>UF</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cidade</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Segunda linha: Endereço, Número, Complemento */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <Label>Endereço</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Número</Label>
                      <Input
                        value={formData.number}
                        onChange={(e) => handleInputChange("number", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <Label>Complemento</Label>
                      <Input
                        value={formData.complement}
                        onChange={(e) => handleInputChange("complement", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contato de Emergência Tab */}
            <TabsContent value="emergencia">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Contato de Emergência</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={formData.emergencyName}
                      onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Sobrenome</Label>
                    <Input
                      value={formData.emergencySurname}
                      onChange={(e) => handleInputChange("emergencySurname", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Parentesco</Label>
                    <Select value={formData.emergencyRelationship} onValueChange={(value) => handleInputChange("emergencyRelationship", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormattedInput
                    label="Telefone"
                    type="phone"
                    value={formData.emergencyPhone}
                    onChange={(value) => handleInputChange("emergencyPhone", value)}
                    placeholder="(00) 0 0000-0000"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medicamentos Tab */}
            <TabsContent value="medicamentos">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Medicamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label>Está tomando algum medicamento atualmente?</Label>
                    <RadioGroup 
                      value={formData.takingMedication} 
                      onValueChange={(value) => handleInputChange("takingMedication", value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="sim" />
                        <Label htmlFor="sim">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="nao" />
                        <Label htmlFor="nao">Não</Label>
                      </div>
                    </RadioGroup>

                    {formData.takingMedication === "sim" && (
                      <div>
                        <Label>Detalhe quais medicamentos</Label>
                        <Textarea
                          value={formData.medicationDetails}
                          onChange={(e) => handleInputChange("medicationDetails", e.target.value)}
                          placeholder="Informe os medicamentos e dosagens..."
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;