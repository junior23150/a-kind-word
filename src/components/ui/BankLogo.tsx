import React from "react";
import { Building2 } from "lucide-react";

interface BankLogoProps {
  bankName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Mapeamento dos nomes dos bancos para URLs diretas das imagens
const bankLogos: Record<string, string> = {
  Nubank: "/bank-logos/nubank.png",
  Santander: "/bank-logos/santander.png",
  Itaú: "/bank-logos/itau.png",
  "Banco do Brasil": "/bank-logos/banco-do-brasil.png",
  Caixa: "/bank-logos/caixa.png",
  Sicredi: "/bank-logos/sicredi.png",
  Sicoob: "/bank-logos/sicoob.png",
  Bradesco: "/bank-logos/bradesco.jpg",
  Inter: "/bank-logos/inter.png",
  // "Outros": não há arquivo, usará fallback
};

// Cores de fallback para cada banco (caso a imagem não carregue)
const bankFallbackColors: Record<string, string> = {
  Nubank: "#8A05BE",
  Santander: "#EC1C24",
  Itaú: "#EC7000",
  "Banco do Brasil": "#FFF100",
  Caixa: "#0066CC",
  Sicredi: "#00A859",
  Sicoob: "#00A859",
  Bradesco: "#CC092F",
  Inter: "#FF7A00",
  Outros: "#6B7280",
};

// Iniciais para fallback
const bankInitials: Record<string, string> = {
  Nubank: "Nu",
  Santander: "S",
  Itaú: "I",
  "Banco do Brasil": "BB",
  Caixa: "C",
  Sicredi: "SC",
  Sicoob: "SB",
  Bradesco: "B",
  Inter: "IN",
  Outros: "🏦",
};

const sizeClasses = {
  sm: "w-8 h-6",
  md: "w-12 h-9",
  lg: "w-20 h-12",
};

export function BankLogo({
  bankName,
  size = "md",
  className = "",
}: BankLogoProps) {
  const [imageError, setImageError] = React.useState(false);
  const logoSrc = bankLogos[bankName];
  const fallbackColor = bankFallbackColors[bankName] || "#6B7280";
  const initials = bankInitials[bankName] || "?";

  // Se não há logo importado ou houve erro, mostra fallback
  if (!logoSrc || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center ${className}`}
        style={{ backgroundColor: fallbackColor }}
      >
        {bankName === "Outros" ? (
          <Building2 className="w-3/5 h-3/5 text-white" />
        ) : (
          <span
            className={`font-bold text-white ${
              size === "sm"
                ? "text-xs"
                : size === "md"
                ? "text-sm"
                : "text-base"
            }`}
          >
            {initials}
          </span>
        )}
      </div>
    );
  }

  // Mostra a imagem importada
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}
    >
      <img
        src={logoSrc}
        alt={`Logo ${bankName}`}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
}
