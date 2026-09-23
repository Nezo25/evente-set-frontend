"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const IconHome = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

interface Estatisticas {
  totalConvidados: number;
  totalConfirmados: number;
  totalPresentes: number;
  totalPendentes: number;
  mesasOcupadas: number;
  mesasLivres: number;
  restricoesAlimentares: Record<string, number>;
}

export default function DashboardPage() {
  const { eventoSelecionadoId, loadingEventos } = useEventContext();
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!eventoSelecionadoId) return;
    setErrorMsg(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos/${eventoSelecionadoId}/estatisticas`)
      .then(res => {
        if (!res.ok) throw new Error("Backend retornou erro " + res.status);
        return res.json();
      })
      .then(data => setEstatisticas(data))
      .catch(err => {
        console.error(err);
        setErrorMsg("Erro ao conectar na API de Estatísticas. O Spring Boot foi reiniciado?");
      });
  }, [eventoSelecionadoId]);

  const exportPDF = () => {
    const input = pdfRef.current;
    if (!input) return;
    
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-evento-${eventoSelecionadoId}.pdf`);
    });
  };

  const dataPresenca = estatisticas ? [
    { name: 'Presentes', value: estatisticas.totalPresentes, color: '#10B981' },
    { name: 'Ausentes', value: estatisticas.totalConvidados - estatisticas.totalPresentes, color: '#EF4444' }
  ] : [];

  const dataConfirmacao = estatisticas ? [
    { name: 'Confirmados', value: estatisticas.totalConfirmados, color: '#3B82F6' },
    { name: 'Pendentes', value: estatisticas.totalPendentes, color: '#F59E0B' }
  ] : [];

  const dataRestricoes = estatisticas ? Object.entries(estatisticas.restricoesAlimentares).map(([key, val]) => ({
    name: key,
    Quantidade: val
  })) : [];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-xs text-gray-500 mb-6">
        <IconHome /> <span className="mx-2">/</span> 
        <span>Dashboard</span> <span className="mx-2">/</span>
        <span className="text-blue-600 font-semibold">Visão Geral</span>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 text-sm font-bold text-red-700 bg-red-100 rounded-lg shadow-sm">
          {errorMsg}
        </div>
      )}

      {!loadingEventos && !eventoSelecionadoId ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-semibold mb-4 text-lg">Nenhum evento cadastrado no sistema.</p>
          <a href="/cadastrar" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-medium">
            Cadastrar Novo Evento
          </a>
        </div>
      ) : (!estatisticas && !errorMsg ? (
        <div className="flex items-center justify-center h-64 text-gray-500 font-semibold">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando Dados do Evento...
        </div>
      ) : estatisticas && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Estatísticas do Evento</h2>
            <button onClick={exportPDF} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-4 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-colors">
              📄 Exportar Relatório
            </button>
          </div>

          <div ref={pdfRef} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Total Convidados</p>
                <p className="text-4xl font-black text-blue-900">{estatisticas.totalConvidados}</p>
              </div>
              
              <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2">Confirmados</p>
                <p className="text-4xl font-black text-green-900">{estatisticas.totalConfirmados}</p>
              </div>
              
              <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">Presentes (Check-in)</p>
                <p className="text-4xl font-black text-amber-900">{estatisticas.totalPresentes}</p>
              </div>
              
              <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">Mesas Ocupadas</p>
                <p className="text-4xl font-black text-purple-900">
                  {estatisticas.mesasOcupadas} <span className="text-xl text-purple-400 font-medium">/ {estatisticas.mesasLivres + estatisticas.mesasOcupadas}</span>
                </p>
              </div>

            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-80 pt-4">
              
              <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider mb-4">Status de Confirmação (RSVP)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataConfirmacao} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                      {dataConfirmacao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider mb-4">Presença no Evento (Check-in)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataPresenca} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                      {dataPresenca.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-8 mt-4 border-t border-gray-100">
              <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider mb-6 text-center">Restrições Alimentares Identificadas</h3>
              {dataRestricoes.length === 0 ? (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Nenhuma restrição alimentar cadastrada.</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataRestricoes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="Quantidade" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
          </div>
        </div>
      ))}
    </main>
  );
}
