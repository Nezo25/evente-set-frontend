"use client";
import React, { useState, useEffect } from 'react';
import { useEventContext } from '@/context/EventContext';

type Convidado = {
  id: number;
  nome: string;
  telefone?: string;
  confirmado: boolean;
  restricoesAlimentares: string;
  mesaId: number | null;
  eventoId: number;
  tag?: string;
  tokenRsvp?: string;
};

export default function RsvpPainelPage() {
  const { eventoSelecionadoId } = useEventContext();
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [busca, setBusca] = useState("");
  const [telefoneEdit, setTelefoneEdit] = useState<{ id: number, telefone: string } | null>(null);

  const carregarConvidados = () => {
    if (!eventoSelecionadoId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados`)
      .then(res => res.json())
      .then(data => setConvidados(data));
  };

  useEffect(() => {
    carregarConvidados();
  }, [eventoSelecionadoId]);

  const handleSalvarTelefone = async (id: number) => {
    if (!telefoneEdit || telefoneEdit.id !== id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: telefoneEdit.telefone })
      });
      if (res.ok) {
        setTelefoneEdit(null);
        carregarConvidados();
      } else {
        alert("Erro ao salvar telefone.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar telefone");
    }
  };

  const enviarWhatsApp = (convidado: Convidado) => {
    if (!convidado.telefone) {
      alert("Adicione um número de telefone primeiro.");
      return;
    }
    
    const numeroFormatado = convidado.telefone.replace(/\D/g, '');
    const urlConvite = `http://${window.location.host}/rsvp/${convidado.tokenRsvp}`;
    const mensagem = `Olá ${convidado.nome}! Aqui está o link do seu convite para o evento. Por favor, confirme sua presença: ${urlConvite}`;
    
    const wpUrl = `https://wa.me/55${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;
    window.open(wpUrl, '_blank');
  };

  const filtrados = convidados.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent p-4 md:p-8 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Confirmações e Convites (RSVP)</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie convites, números de WhatsApp e status de confirmação.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
              <th className="p-4 font-bold">Convidado</th>
              <th className="p-4 font-bold">WhatsApp</th>
              <th className="p-4 font-bold text-center">Status</th>
              <th className="p-4 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{c.nome}</p>
                  {c.tag && <span className="text-[10px] mt-1 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-bold">{c.tag}</span>}
                </td>
                <td className="p-4">
                  {telefoneEdit?.id === c.id ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={telefoneEdit.telefone} 
                        onChange={(e) => setTelefoneEdit({ ...telefoneEdit, telefone: e.target.value })}
                        placeholder="Ex: 11999999999"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-32 outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button onClick={() => handleSalvarTelefone(c.id)} className="text-blue-600 hover:text-blue-800 font-bold text-sm">Salvar</button>
                      <button onClick={() => setTelefoneEdit(null)} className="text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-600 font-medium">{c.telefone || <span className="text-gray-400 italic">Sem número</span>}</span>
                      <button onClick={() => setTelefoneEdit({ id: c.id, telefone: c.telefone || '' })} className="text-blue-500 hover:text-blue-700 p-1" title="Editar Telefone">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  {c.confirmado ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-green-200">
                      Confirmado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-yellow-200">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => enviarWhatsApp(c)}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                    title={!c.tokenRsvp ? "Convidado sem token de RSVP gerado" : "Enviar convite via WhatsApp"}
                    disabled={!c.tokenRsvp}
                  >
                    Enviar Convite
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">Nenhum convidado encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
