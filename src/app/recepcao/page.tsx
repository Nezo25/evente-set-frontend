"use client";
import React, { useState, useEffect } from 'react';
import { useEventContext } from '@/context/EventContext';

type Convidado = {
  id: number;
  nome: string;
  confirmado: boolean;
  restricoesAlimentares: string;
  mesaId: number | null;
  eventoId: number;
  tag?: string;
  presente?: boolean;
};

export default function RecepcaoPage() {
  const { eventoSelecionadoId } = useEventContext();
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!eventoSelecionadoId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados`)
      .then(res => res.json())
      .then(data => setConvidados(data));
  }, [eventoSelecionadoId]);

  const handleCheckin = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/${id}/checkin`, {
        method: 'POST'
      });
      if (res.ok) {
        const atualizado = await res.json();
        setConvidados(prev => prev.map(c => c.id === id ? atualizado : c));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer check-in");
    }
  };

  const filtrados = convidados.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent p-4 md:p-8 overflow-y-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Check-in e Recepção</h1>
          <p className="text-sm text-gray-500 mt-1">Registre a entrada dos convidados no evento.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
        <input 
          type="text" 
          placeholder="🔍 Buscar convidado por nome..." 
          className="w-full border-none p-2 text-lg outline-none focus:ring-0"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-3 pb-8">
        {filtrados.map(c => (
          <div key={c.id} className={`p-4 rounded-xl border flex justify-between items-center shadow-sm transition-colors ${c.presente ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
            <div>
              <p className={`font-bold text-lg ${c.presente ? 'text-green-800' : 'text-gray-900'}`}>{c.nome}</p>
              <div className="flex gap-2 mt-1">
                {c.tag && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{c.tag}</span>}
                {c.mesaId ? (
                  <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-gray-200">Mesa {c.mesaId}</span>
                ) : (
                  <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-red-200">Sem Mesa</span>
                )}
              </div>
            </div>
            
            {!c.presente ? (
              <button 
                onClick={() => handleCheckin(c.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors text-sm"
              >
                Fazer Check-in
              </button>
            ) : (
              <span className="text-green-600 font-bold px-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Presente
              </span>
            )}
          </div>
        ))}
        {filtrados.length === 0 && <p className="text-center text-gray-500 mt-8 font-medium">Nenhum convidado encontrado.</p>}
      </div>
    </div>
  );
}
