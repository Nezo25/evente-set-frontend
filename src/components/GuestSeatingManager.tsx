"use client";
import React, { useState, useEffect } from 'react';
import { useEventContext } from '@/context/EventContext';

// Tipagens iniciais baseadas no schema
type Convidado = {
  id: number;
  nome: string;
  confirmado: boolean;
  restricoesAlimentares: string;
  mesaId: number | null;
  eventoId: number;
  tag?: string;
  presente?: boolean;
  grupoFamilia?: string;
};

type Mesa = {
  id: number;
  identificador: string;
  capacidadeMaxima: number;
  eventoId: number;
  positionX?: number;
  positionY?: number;
  ocupacaoAtual?: number;
  convidados?: Convidado[];
};

export default function GuestSeatingManager() {
  const { eventoSelecionadoId } = useEventContext();
  
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Convidado | null>(null);

  // Busca Mesas e Convidados quando o evento selecionado muda
  useEffect(() => {
    if (!eventoSelecionadoId) return;
    
    // Limpa estado anterior antes de buscar novos dados
    setMesas([]);
    setConvidados([]);
    setSelectedGuest(null);
    
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/mesas`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados`).then(r => r.json())
    ]).then(([mesasData, convidadosData]) => {
      setMesas(mesasData);
      setConvidados(convidadosData);
    }).catch(err => console.error(err));
  }, [eventoSelecionadoId]);

  const acomodarConvidado = async (mesaId: number, convidadoIdToSeat?: number) => {
    const targetId = convidadoIdToSeat || selectedGuest?.id;
    if (!targetId || !eventoSelecionadoId) return;

    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa) return;

    const ocupacaoAtual = convidados.filter(c => c.mesaId === mesaId).length;
    if (ocupacaoAtual >= mesa.capacidadeMaxima) {
      alert(`A ${mesa.identificador} já está na capacidade máxima!`);
      return false;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/${targetId}/acomodar?mesaId=${mesaId}`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        const convidadoAtualizado = await res.json();
        setConvidados(prev => prev.map(c => c.id === convidadoAtualizado.id ? convidadoAtualizado : c));
        if (selectedGuest?.id === targetId) {
          setSelectedGuest(null);
        }
        return true;
      } else {
        alert("Erro ao acomodar convidado na mesa.");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao acomodar convidado.");
      return false;
    }
  };

  const acomodarFamilia = async (mesaId: number, convidadosIds: number[]) => {
    let successCount = 0;
    for (const id of convidadosIds) {
      // Refresh occupancy check inside the loop by checking updated state wouldn't work easily here,
      // but acomodarConvidado does the check based on the initial array length which is a bug if done in loop.
      // So let's re-calculate:
      const ocupacaoAtual = convidados.filter(c => c.mesaId === mesaId).length + successCount;
      const mesa = mesas.find(m => m.id === mesaId);
      if (mesa && ocupacaoAtual >= mesa.capacidadeMaxima) {
        alert(`A ${mesa.identificador} atingiu a capacidade máxima durante a alocação do grupo!`);
        break;
      }
      
      const success = await acomodarConvidado(mesaId, id);
      if (success) successCount++;
    }
  };

  const desacomodarConvidado = async (e: React.MouseEvent, convidadoId: number) => {
    e.stopPropagation(); // Prevents triggering table click if we have one
    if (!eventoSelecionadoId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/${convidadoId}/desacomodar`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        const convidadoAtualizado = await res.json();
        setConvidados(prev => prev.map(c => c.id === convidadoAtualizado.id ? convidadoAtualizado : c));
      } else {
        alert("Erro ao remover convidado da mesa.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao remover convidado.");
    }
  };

  const convidadosSemMesa = convidados.filter(c => !c.mesaId && c.presente === true);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header removido pois agora usamos o layout global (MainLayout) */}
      <div className="px-8 pt-5 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Salão</h1>
        <p className="text-sm text-gray-500 mt-1">Organize o layout do evento e acomode convidados pré-registrados.</p>
      </div>

      <div className="p-4 md:p-8 flex-1 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden bg-transparent">
        
        {/* Coluna 1: Convidados Aguardando Acomodação */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full z-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Aguardando Mesa ({convidadosSemMesa.length})
          </h2>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {Object.entries(
              convidadosSemMesa.reduce((acc, c) => {
                const familia = c.grupoFamilia || 'Convidados Individuais';
                if (!acc[familia]) acc[familia] = [];
                acc[familia].push(c);
                return acc;
              }, {} as Record<string, Convidado[]>)
            ).map(([familia, membros]) => (
              <div key={familia} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div 
                  className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center cursor-grab active:cursor-grabbing hover:bg-gray-100"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('type', 'familia');
                    e.dataTransfer.setData('ids', JSON.stringify(membros.map(m => m.id)));
                  }}
                  title="Arraste o grupo inteiro para uma mesa"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                    <span>{familia}</span>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{membros.length}</span>
                </div>
                <div className="p-2 space-y-2">
                  {membros.map(convidado => (
                    <div 
                      key={convidado.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('type', 'guest');
                        e.dataTransfer.setData('id', convidado.id.toString());
                      }}
                      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
                        selectedGuest?.id === convidado.id 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400' 
                          : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedGuest(convidado)}
                    >
                      <p className="font-bold text-gray-800 text-sm">{convidado.nome}</p>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {convidado.tag && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded font-semibold border border-yellow-200">
                            {convidado.tag}
                          </span>
                        )}
                        {convidado.restricoesAlimentares && convidado.restricoesAlimentares.toLowerCase() !== 'nenhuma' && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-semibold border border-red-200">
                            Alergia
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {convidadosSemMesa.length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center mt-4">
                <p className="text-green-700 font-semibold text-sm">Todos os convidados presentes estão acomodados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Layout das Mesas */}
        <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-800">Layout do Salão</h2>
            {selectedGuest && (
              <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm animate-pulse">
                Clique numa mesa para acomodar: {selectedGuest.nome}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pr-2 flex-1">
            {mesas.map(mesa => {
              const convidadosNaMesa = convidados.filter(c => c.mesaId === mesa.id);
              const ocupacao = convidadosNaMesa.length;
              
              const hasRestricoesCriticas = convidadosNaMesa.some(
                c => c.restricoesAlimentares && c.restricoesAlimentares.toLowerCase() !== 'nenhuma'
              );

              return (
                <div 
                  key={mesa.id} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = e.dataTransfer.getData('type');
                    if (type === 'guest') {
                      const guestId = parseInt(e.dataTransfer.getData('id'));
                      await acomodarConvidado(mesa.id, guestId);
                    } else if (type === 'familia') {
                      const ids = JSON.parse(e.dataTransfer.getData('ids') || '[]');
                      await acomodarFamilia(mesa.id, ids);
                    }
                  }}
                  className={`border rounded-xl p-4 shadow-sm transition-all ${
                    selectedGuest ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : 'border-gray-200 bg-white'
                  } ${
                    hasRestricoesCriticas ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                  onClick={() => selectedGuest && acomodarConvidado(mesa.id)}
                >
                  <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {mesa.identificador}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
                      ocupacao >= mesa.capacidadeMaxima 
                        ? 'bg-red-100 text-red-800 border-red-300' 
                        : 'bg-green-100 text-green-800 border-green-300'
                    }`}>
                      {ocupacao} / {mesa.capacidadeMaxima}
                    </span>
                  </div>
                  
                  {hasRestricoesCriticas && (
                    <div className="mb-3 text-xs bg-red-100 text-red-800 p-2 rounded border border-red-200 flex items-center gap-2 font-semibold shadow-sm">
                      <span className="text-base">⚠️</span> 
                      Há convidados com alergias.
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {convidadosNaMesa.map(c => (
                      <div key={c.id} className="text-xs bg-white p-2 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm font-semibold text-gray-700">
                        <span className="truncate pr-2">{c.nome}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.tag && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded font-bold uppercase tracking-wider" title="Tag do Convidado">
                              {c.tag}
                            </span>
                          )}
                          <button 
                            onClick={(e) => desacomodarConvidado(e, c.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                            title="Remover da mesa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {convidadosNaMesa.length === 0 && (
                      <p className="text-gray-400 text-xs font-medium text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        Mesa vazia
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
