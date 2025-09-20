import React from "react";

const LandingSimple = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Knumbers Funcionando!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema carregado com sucesso no Lovable
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ React funcionando
          </div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Tailwind CSS funcionando
          </div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Roteamento funcionando
          </div>
        </div>
        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir para Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingSimple;
