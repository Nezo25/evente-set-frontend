import CadastroGeral from "@/components/CadastroGeral";

export default function CadastrarPage() {
  return (
    <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
      <div className="px-4 py-4 md:px-8 md:py-6 text-left shrink-0 border-b border-gray-200 bg-white">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Módulo de Cadastros</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Alimente o sistema com os dados do evento antes de montar o salão.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <CadastroGeral />
      </div>
    </main>
  );
}
