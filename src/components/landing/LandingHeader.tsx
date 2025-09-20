import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b backdrop-blur-md bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Knumbers
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Recursos
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Como Funciona
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Planos
          </a>
          <Button variant="outline" size="sm" className="border-2 text-sm" asChild>
            <Link to="/dashboard">Fazer Login</Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg text-sm" asChild>
            <Link to="/dashboard">Começar Teste</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b md:hidden">
            <nav className="container mx-auto px-4 py-6 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Recursos
              </a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Como Funciona
              </a>
              <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Planos
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <Button variant="outline" size="sm" className="border-2" asChild>
                  <Link to="/dashboard">Fazer Login</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg" asChild>
                  <Link to="/dashboard">Começar Teste</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};