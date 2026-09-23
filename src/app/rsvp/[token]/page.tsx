"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RsvpPage() {
  const { token } = useParams();
  const [convidado, setConvidado] = useState<{nome: string, restricoesAlimentares?: string, confirmado?: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [restricoes, setRestricoes] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rsvp/${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Convite não encontrado");
        return res.json();
      })
      .then(data => {
        setConvidado(data);
        setConfirmado(data.confirmado || false);
        setRestricoes(data.restricoesAlimentares || "");
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rsvp/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...convidado, confirmado, restricoesAlimentares: restricoes })
      });
      if (res.ok) {
        setSucesso(true);
      } else {
        alert("Erro ao salvar sua resposta. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!convidado) return <div className="p-8 text-center bg-gray-50 h-screen"><h1 className="text-2xl font-bold text-red-600">Convite inválido ou expirado.</h1></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">RSVP</h1>
          <p className="text-gray-500 mt-2">Confirme sua presença no evento</p>
        </div>
        
        {sucesso ? (
          <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-green-800 font-bold text-xl mb-2">Presença Confirmada!</h2>
            <p className="text-green-700 text-sm">Obrigado por responder. Suas informações foram salvas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nome do Convidado</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{convidado.nome}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                />
                <span className="text-gray-800 font-medium">Eu vou comparecer ao evento</span>
              </label>
            </div>

            <div className={`transition-opacity duration-300 ${confirmado ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Possui restrições alimentares?</label>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="Ex: Vegetariano, alergia a amendoim..."
                rows={3}
                value={restricoes}
                onChange={(e) => setRestricoes(e.target.value)}
                disabled={!confirmado}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5"
            >
              Confirmar Resposta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
