"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useEventContext } from '@/context/EventContext';

interface Evento { id: number; nomeCliente: string; tipoEvento: string; dataEvento: string; totalConvidadosEstimado: number; status: string; }
interface Mesa { id: number; identificador: string; capacidadeMaxima: number; ocupacaoAtual?: number; }
interface Convidado { id: number; nome: string; confirmado: boolean; restricoesAlimentares: string; cardapioId?: number; tag?: string; tokenRsvp?: string; grupoFamilia?: string; }
interface ItemCardapio { id: number; nome: string; descricao: string; categoria: string; alergenos: string; }
interface Cardapio { id: number; nome: string; preDefinido: boolean; tipoEvento?: string; eventoId?: number; itens: ItemCardapio[]; }

export default function CadastroGeral() {
  const { eventoSelecionadoId, setEventoSelecionadoId, refreshEventos } = useEventContext();
  const [activeSection, setActiveSection] = useState<'eventos' | 'acomodacoes' | 'convidados' | 'cardapios' | 'itens'>('eventos');
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  
  // States for editing
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editingCardapio, setEditingCardapio] = useState<Cardapio | null>(null);
  const [editingItem, setEditingItem] = useState<ItemCardapio | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoEventoSelecionado, setTipoEventoSelecionado] = useState<string>("Casamento");
  const [cardapiosPreDefinidosFiltrados, setCardapiosPreDefinidosFiltrados] = useState<Cardapio[]>([]);

  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [itensCardapioBase, setItensCardapioBase] = useState<ItemCardapio[]>([]);
  const [modoCadastroConvidado, setModoCadastroConvidado] = useState<'unitario' | 'lote'>('unitario');
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Busca Eventos e itens base
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos`)
      .then(res => res.json())
      .then(data => {
        setEventos(data);
      }).catch(err => console.error(err));

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/itens`)
      .then(res => res.json())
      .then(data => setItensCardapioBase(data))
      .catch(err => console.error(err));
  }, []);

  // Busca entidades associadas quando evento selecionado muda
  useEffect(() => {
    if (!eventoSelecionadoId) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/mesas`)
      .then(res => res.json()).then(data => setMesas(data)).catch(err => console.error(err));

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados`)
      .then(res => res.json()).then(data => setConvidados(data)).catch(err => console.error(err));

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/pre-definidos`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/evento/${eventoSelecionadoId}`).then(r => r.json())
    ]).then(([preDefs, custom]) => {
      setCardapios([...preDefs, ...custom]);
    }).catch(err => console.error(err));

  }, [eventoSelecionadoId, activeSection]);


  useEffect(() => {
    if (viewMode === 'form' && activeSection === 'eventos') {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/pre-definidos?tipoEvento=${tipoEventoSelecionado}`)
        .then(res => res.json())
        .then(data => setCardapiosPreDefinidosFiltrados(data))
        .catch(err => console.error(err));
    }
  }, [tipoEventoSelecionado, viewMode, activeSection]);

  const showSuccess = (msg: string) => { setErrorMessage(null); setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 3000); };

  const showError = (msg: string) => { setSuccessMessage(null); setErrorMessage(msg); setTimeout(() => setErrorMessage(null), 3000); };

  const handleNavClick = (section: 'eventos' | 'acomodacoes' | 'convidados' | 'cardapios' | 'itens') => {
    setActiveSection(section);
    setViewMode('list');
  };

  // ================= SAVE HANDLERS =================
  const handleSaveEvento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      nomeCliente: formData.get('nomeCliente'),
      tipoEvento: formData.get('tipoEvento'),
      dataEvento: formData.get('dataEvento'),
      totalConvidadosEstimado: Number(formData.get('totalConvidadosEstimado')),
      status: "AGENDADO"
    };

    const cardapioId = formData.get('cardapioModelo');

    try {
      const url = editingEvento 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${editingEvento.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos`;
      const method = editingEvento ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (res.ok) {
        const novoEvento = await res.json();
        
        // Se escolheu cardápio modelo ao criar novo evento, associa-o (clonando ou associando no backend, no momento o backend apenas tem POST /api/cardapio/evento/...)
        if (!editingEvento && cardapioId) {
            // Buscar o cardapio selecionado para clonar os itens
            const cardapioModelo = cardapiosPreDefinidosFiltrados.find(c => c.id === Number(cardapioId));
            if (cardapioModelo) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/evento/${novoEvento.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: `Cardápio de ${novoEvento.nomeCliente}`, preDefinido: false, itens: cardapioModelo.itens })
                });
            }
        }

        if (editingEvento) {
            setEventos(prev => prev.map(ev => ev.id === novoEvento.id ? novoEvento : ev));
            showSuccess('Evento atualizado com sucesso!');
        } else {
            setEventos(prev => [...prev, novoEvento]);
            setEventoSelecionadoId(String(novoEvento.id));
            refreshEventos();
            showSuccess('Evento criado com sucesso!');
        }
        setEditingEvento(null);
        setViewMode('list');
      } else throw new Error(await res.text());
    } catch (err: unknown) { 
      const error = err as Error;
      showError(error.message || 'Erro ao conectar'); 
    }
  };

  const handleDeleteEvento = async (id: number) => {
    if (!confirm('Deseja excluir este evento e todos os dados associados?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${id}`, { method: 'DELETE' });
      if (res.ok) { setEventos(prev => prev.filter(e => e.id !== id)); if(eventoSelecionadoId === String(id)) setEventoSelecionadoId(""); refreshEventos(); showSuccess('Excluído'); }
      else throw new Error('Erro');
    } catch (e) { showError('Erro ao excluir evento'); }
  };

  const handleDeleteCardapio = async (id: number) => {
    if (!confirm('Deseja excluir este cardápio?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/${id}`, { method: 'DELETE' });
      if (res.ok) { setCardapios(prev => prev.filter(c => c.id !== id)); showSuccess('Excluído'); }
      else throw new Error('Erro');
    } catch (e) { showError('Erro ao excluir cardápio'); }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Deseja excluir este item base?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/itens/${id}`, { method: 'DELETE' });
      if (res.ok) { setItensCardapioBase(prev => prev.filter(i => i.id !== id)); showSuccess('Excluído'); }
      else throw new Error('Erro');
    } catch (e) { showError('Erro ao excluir item'); }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventoSelecionadoId) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/importar`, {
        method: 'POST', body: formData
      });
      if (res.ok) {
        const novosConvidados = await res.json();
        setConvidados(prev => [...prev, ...novosConvidados]);
        showSuccess(`${novosConvidados.length} convidados importados!`);
      } else throw new Error();
    } catch (e) { showError('Erro ao importar CSV'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      categoria: formData.get('categoria'),
      alergenos: formData.get('alergenos') || "Nenhum"
    };

    try {
      const url = editingItem ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/itens/${editingItem.id}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/itens`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const novoItem = await res.json();
        if (editingItem) setItensCardapioBase(prev => prev.map(i => i.id === novoItem.id ? novoItem : i));
        else setItensCardapioBase(prev => [...prev, novoItem]);
        setEditingItem(null);
        showSuccess('Item salvo!');
        setViewMode('list');
      } else throw new Error(await res.text());
    } catch (err: unknown) { showError('Erro ao salvar item'); }
  };

  const handleSaveCardapio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventoSelecionadoId) return;
    
    const formData = new FormData(e.currentTarget);
    const itemIds = Array.from(formData.getAll('itens')).map(id => ({ id: Number(id) }));
    const preDefinido = formData.get('preDefinido') === 'on';
    
    const body = {
      nome: formData.get('nome'),
      preDefinido,
      tipoEvento: preDefinido ? formData.get('tipoEventoCardapio') : null,
      itens: itemIds
    };

    try {
      const url = editingCardapio ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio/${editingCardapio.id}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/cardapio${preDefinido ? '' : `/evento/${eventoSelecionadoId}`}`;
      const method = editingCardapio ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      
      if (res.ok) {
        const novoCardapio = await res.json();
        if (editingCardapio) setCardapios(prev => prev.map(c => c.id === novoCardapio.id ? novoCardapio : c));
        else setCardapios(prev => [...prev, novoCardapio]);
        setEditingCardapio(null);
        showSuccess('Cardápio salvo!');
        setViewMode('list');
      } else throw new Error(await res.text());
    } catch (err: unknown) { showError('Erro ao salvar cardápio'); }
  };

  const handleSaveMesa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventoSelecionadoId) return showError("Selecione um evento!");
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/mesas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador: formData.get('identificador'), capacidadeMaxima: Number(formData.get('capacidadeMaxima')) })
      });
      if (res.ok) {
        const novaMesa = await res.json();
        setMesas(prev => [...prev, novaMesa]);
        showSuccess('Acomodação salva com sucesso!');
        setViewMode('list');
      } else throw new Error(await res.text());
    } catch (err: unknown) { 
      const error = err as Error;
      showError(error.message || 'Erro'); 
    }
  };

  const handleSaveConvidado = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventoSelecionadoId) return showError("Selecione um evento!");
    const formData = new FormData(e.currentTarget);
    const cardapioId = formData.get('cardapioId');
    const tag = formData.get('tag') as string;
    const grupoFamilia = formData.get('grupoFamilia') as string;
    const restricoesAlimentares = formData.get('restricoesAlimentares') as string;
    
    // Suporte para múltiplos nomes separados por linha ou vírgula
    const nomesRaw = formData.get('nomes') as string;
    const nomes = nomesRaw.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);

    if (nomes.length === 0) return showError("Insira pelo menos um nome!");

    try {
      const novosConvidados: Convidado[] = [];
      for (const nome of nomes) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome, 
            tag, 
            confirmado: true, 
            restricoesAlimentares,
            grupoFamilia
          })
        });
        
        if (res.ok) {
          let novoConv = await res.json();
          if (cardapioId) {
            const resVinculo = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/convidados/${novoConv.id}/cardapio?cardapioId=${cardapioId}`, { method: 'PUT' });
            if (resVinculo.ok) novoConv = await resVinculo.json();
          }
          novosConvidados.push(novoConv);
        } else {
          throw new Error(await res.text());
        }
      }
      
      setConvidados(prev => [...prev, ...novosConvidados]);
      showSuccess(`${novosConvidados.length} convidado(s) salvo(s) com sucesso!`);
      setViewMode('list');
    } catch (err: unknown) { 
      const error = err as Error;
      showError(error.message || 'Erro ao cadastrar convidados'); 
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      
      {/* HEADER TABS (SUB-MENU) */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4 shrink-0 shadow-sm z-10 flex gap-6 overflow-x-auto">
        <button onClick={() => handleNavClick('eventos')} className={`pb-3 font-semibold whitespace-nowrap transition-colors ${activeSection === 'eventos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
          📅 Eventos
        </button>
        <button onClick={() => handleNavClick('acomodacoes')} className={`pb-3 font-semibold whitespace-nowrap transition-colors ${activeSection === 'acomodacoes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
          🪑 Acomodações
        </button>
        <button onClick={() => handleNavClick('convidados')} className={`pb-3 font-semibold whitespace-nowrap transition-colors ${activeSection === 'convidados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
          👥 Convidados
        </button>
        <button onClick={() => handleNavClick('cardapios')} className={`pb-3 font-semibold whitespace-nowrap transition-colors ${activeSection === 'cardapios' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
          🍽️ Cardápios
        </button>
        <button onClick={() => handleNavClick('itens')} className={`pb-3 font-semibold whitespace-nowrap transition-colors ${activeSection === 'itens' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
          🍲 Pratos / Itens
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent p-4 md:p-8">
        
        {/* TOASTS */}
        {successMessage && (
          <div className="absolute top-4 right-4 md:right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2 animate-bounce text-sm md:text-base">
            <span className="font-bold">✓ {successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="absolute top-4 right-4 md:right-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2 text-sm md:text-base">
            <span className="font-bold">⚠ {errorMessage}</span>
          </div>
        )}

        {/* HEADER AREA */}
        <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm z-10 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">
              {activeSection === 'acomodacoes' ? 'Gestão de Acomodações' : `Gestão de ${activeSection}`}
            </h1>
            {(activeSection !== 'eventos' && activeSection !== 'itens') && (
              <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2 w-full">
                <span className="text-sm text-gray-500 hidden md:inline">Filtrando Evento:</span>
                <select 
                  className="w-full md:w-auto text-sm border-gray-300 rounded border py-1.5 px-3 focus:ring-blue-500 font-semibold text-gray-700 bg-gray-50"
                  value={eventoSelecionadoId} 
                  onChange={(e) => { setEventoSelecionadoId(e.target.value); setViewMode('list'); }}
                >
                  {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nomeCliente}</option>)}
                  {eventos.length === 0 && <option value="">Nenhum evento criado</option>}
                </select>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto flex justify-end">
            {viewMode === 'list' ? (
              (activeSection === 'eventos' || activeSection === 'itens' || (eventos.length > 0 && eventoSelecionadoId)) && (
                <button onClick={() => setViewMode('form')} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex justify-center items-center gap-2">
                  <span>
                    {activeSection === 'eventos' && '+ Novo Evento'}
                    {activeSection === 'acomodacoes' && '+ Nova Acomodação'}
                    {activeSection === 'convidados' && '+ Novo Convidado'}
                    {activeSection === 'cardapios' && '+ Novo Cardápio'}
                    {activeSection === 'itens' && '+ Novo Prato / Item'}
                  </span>
                </button>
              )
            ) : (
              <button onClick={() => setViewMode('list')} className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-lg transition-all">
                Voltar para Lista
              </button>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          
          {/* ========== LIST VIEWS ========== */}
          {viewMode === 'list' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              
              {activeSection === 'eventos' && (
                <>
                  {eventos.length === 0 ? <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Nenhum evento encontrado.</div> : null}
                  {eventos.map(ev => (
                    <div key={ev.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between hover:shadow-md transition-all gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">#{ev.id}</span>
                          <h3 className="font-bold text-lg md:text-xl text-gray-800">{ev.nomeCliente}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">🏷 {ev.tipoEvento}</span>
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">👥 {ev.totalConvidadosEstimado} esperados</span>
                          {ev.dataEvento && <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">📅 {new Date(ev.dataEvento).toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full lg:w-auto">
                        <button onClick={() => { setEditingEvento(ev); setViewMode('form'); }} className="flex-1 lg:flex-none justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200 shadow-sm flex items-center gap-2">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDeleteEvento(ev.id)} className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg transition-colors border border-gray-200 shadow-sm flex items-center justify-center gap-2">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeSection === 'acomodacoes' && (
                <>
                  {mesas.length === 0 ? <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Nenhuma acomodação cadastrada neste evento.</div> : null}
                  {mesas.map(m => (
                    <div key={m.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg md:text-xl text-gray-800">{m.identificador}</h3>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Livre</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border">🪑 {m.capacidadeMaxima} lugares</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeSection === 'convidados' && (
                <>
                  {convidados.length === 0 ? <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Nenhum convidado cadastrado.</div> : null}
                  {convidados.map(c => {
                    const cardapioAssociado = cardapios.find(card => card.id === c.cardapioId);
                    return (
                      <div key={c.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between hover:shadow-md transition-all gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg md:text-xl text-gray-800">{c.nome}</h3>
                            {c.confirmado ? <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">✓ Confirmado</span> : <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold">⚠ Pendente</span>}
                            {cardapioAssociado && <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold">🍽️ {cardapioAssociado.nome}</span>}
                            {c.tokenRsvp && (
                              <button onClick={() => { navigator.clipboard.writeText(`http://${window.location.hostname}:3000/rsvp/${c.tokenRsvp}`); showSuccess('Link copiado!'); }} className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded font-bold transition-colors">🔗 Copiar Link</button>
                            )}
                          </div>
                          {c.restricoesAlimentares && (
                            <div className="flex items-center gap-4 text-xs md:text-sm text-red-500 font-medium mt-1">
                              <span className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded border border-red-100">⚠️ {c.restricoesAlimentares}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {activeSection === 'cardapios' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardapios.length === 0 ? <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Nenhum cardápio disponível.</div> : null}
                  {cardapios.map(card => (
                    <div key={card.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingCardapio(card); setViewMode('form'); }} className="text-gray-500 hover:text-blue-600">✏️</button>
                            <button onClick={() => handleDeleteCardapio(card.id)} className="text-gray-500 hover:text-red-600">🗑️</button>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          🍽️ {card.nome}
                        </h3>
                        {card.preDefinido ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Modelo Padrão</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Personalizado</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 mt-2">
                        {card.itens.map(item => (
                          <div key={item.id} className="text-sm flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{item.nome} <span className="text-xs text-gray-400 font-normal ml-1">({item.categoria})</span></span>
                            <span className="text-xs text-gray-500">{item.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'itens' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itensCardapioBase.length === 0 ? <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">Nenhum item cadastrado no sistema.</div> : null}
                  {itensCardapioBase.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(item); setViewMode('form'); }} className="text-gray-500 hover:text-blue-600">✏️</button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-gray-500 hover:text-red-600">🗑️</button>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          {item.nome}
                        </h3>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{item.categoria}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.descricao}</p>
                      {item.alergenos && item.alergenos !== 'Nenhum' && (
                        <div className="mt-auto">
                          <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-100 font-medium flex items-center gap-1 w-fit">
                            ⚠️ Alérgenos: {item.alergenos}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========== FORM VIEWS ========== */}
          {viewMode === 'form' && (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow border border-gray-100 max-w-4xl mx-auto">
              
              {activeSection === 'eventos' && (
                <form className="space-y-6" onSubmit={handleSaveEvento}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente / Casal</label>
                      <input name="nomeCliente" defaultValue={editingEvento?.nomeCliente} required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                      <select name="tipoEvento" className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold">
                        <option value="CASAMENTO">Casamento</option>
                        <option value="CORPORATIVO">Corporativo</option>
                        <option value="ANIVERSARIO">Aniversário</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                      <input name="dataEvento" required type="datetime-local" className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Convidados Estimados</label>
                      <input name="totalConvidadosEstimado" required type="number" className="w-full border border-gray-300 rounded-lg p-2.5 md:p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">Salvar Evento</button>
                  </div>
                </form>
              )}

              {activeSection === 'acomodacoes' && (
                <form className="space-y-6" onSubmit={handleSaveMesa}>
                  {eventos.length === 0 ? (
                    <p className="text-red-500 font-bold p-4 bg-red-50 rounded">Você precisa cadastrar um Evento primeiro!</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Identificador</label>
                          <input name="identificador" required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: Mesa 05 ou Área VIP" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade de Assentos</label>
                          <input name="capacidadeMaxima" required type="number" min="1" max="50" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: 8" />
                        </div>
                      </div>
                      <div className="pt-6 border-t border-gray-100 flex gap-4">
                        <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">Salvar Acomodação</button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {activeSection === 'convidados' && (
                <form className="space-y-6" onSubmit={handleSaveConvidado}>
                  {eventos.length === 0 ? (
                    <p className="text-red-500 font-bold p-4 bg-red-50 rounded">Você precisa cadastrar um Evento primeiro!</p>
                  ) : (
                    <>
                      <div className="mb-6 flex gap-2">
                        <button type="button" onClick={() => setModoCadastroConvidado('unitario')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${modoCadastroConvidado === 'unitario' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}>Cadastro Unitário</button>
                        <button type="button" onClick={() => setModoCadastroConvidado('lote')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${modoCadastroConvidado === 'lote' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}>Cadastro em Lote (Família)</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modoCadastroConvidado === 'unitario' ? (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input name="nomes" required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: João da Silva" />
                          </div>
                        ) : (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomes dos Convidados (Cadastro em Lote)</label>
                            <p className="text-xs text-gray-500 mb-2">Digite um nome por linha, ou separe por vírgula para adicionar várias pessoas da mesma família de uma vez.</p>
                            <textarea name="nomes" required rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: João da Silva&#10;Maria da Silva&#10;Enzo Corcetti"></textarea>
                          </div>
                        )}
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Família/Grupo (Opcional)</label>
                          <input name="grupoFamilia" type="text" placeholder="Ex: Família Silva" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tag Especial (Opcional)</label>
                          <input name="tag" type="text" placeholder="Ex: VIP, Criança, Padrinho" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cardápio Selecionado</label>
                          <select name="cardapioId" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold">
                            <option value="">Não definido</option>
                            {cardapios.map(c => <option key={c.id} value={c.id}>{c.nome} {c.preDefinido ? '(Padrão)' : ''}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Restrições Alimentares / Alergias</label>
                          <textarea name="restricoesAlimentares" rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none text-black font-semibold"></textarea>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-gray-100 flex gap-4">
                        <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">Salvar Convidado</button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {activeSection === 'cardapios' && (
                <form className="space-y-6" onSubmit={handleSaveCardapio}>
                  {eventos.length === 0 ? (
                    <p className="text-red-500 font-bold p-4 bg-red-50 rounded">Você precisa cadastrar um Evento primeiro!</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cardápio Personalizado</label>
                        <input name="nome" defaultValue={editingCardapio?.nome} required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: Menu Vegano Casamento" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Selecione os Pratos (Itens)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                          {itensCardapioBase.length === 0 && <p className="text-sm text-gray-500 col-span-full">Nenhum item base cadastrado no sistema.</p>}
                          {itensCardapioBase.map(item => (
                            <label key={item.id} className="flex items-start gap-3 p-3 bg-white border rounded cursor-pointer hover:bg-blue-50 transition-colors">
                              <input type="checkbox" name="itens" value={item.id} defaultChecked={editingCardapio?.itens?.some(i => i.id === item.id)} className="mt-1 w-4 h-4 text-blue-600 rounded" />
                              <div>
                                <span className="block font-semibold text-gray-800 text-sm">{item.nome} <span className="font-normal text-xs text-gray-400">({item.categoria})</span></span>
                                <span className="block text-xs text-gray-500 mt-0.5">{item.descricao}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex gap-4">
                        <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">Criar Cardápio</button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {activeSection === 'itens' && (
                <form className="space-y-6" onSubmit={handleSaveItem}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato/Item</label>
                      <input name="nome" defaultValue={editingItem?.nome} required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: Salada Caprese" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select name="categoria" defaultValue={editingItem?.categoria} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold">
                        <option value="ENTRADA">Entrada</option>
                        <option value="VOLANTE">Volante</option>
                        <option value="PRINCIPAL">Prato Principal</option>
                        <option value="SOBREMESA">Sobremesa</option>
                        <option value="BEBIDA">Bebida</option>
                        <option value="ESTACAO_OUTROS">Estação / Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alérgenos (Opcional)</label>
                      <input name="alergenos" defaultValue={editingItem?.alergenos} type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none text-black font-semibold" placeholder="Ex: Lactose, Glúten" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea name="descricao" defaultValue={editingItem?.descricao} rows={3} required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold" placeholder="Ex: Tomate, mozzarella e manjericão fresco"></textarea>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex gap-4">
                    <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">Adicionar Item Base</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
