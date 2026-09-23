"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 h-full flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Personalize sua experiência e gerencie preferências do sistema.</p>

        <div className="space-y-6">
          
          {/* Sessão de Aparência */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              Aparência e Tema
            </h2>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Modo Escuro (Dark Mode)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Altera o esquema de cores do sistema para reduzir o cansaço visual.</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button 
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  Claro ☀️
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${theme === 'dark' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  Escuro 🌙
                </button>
              </div>
            </div>
          </section>

          {/* Sessão de Notificações (Mock) */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notificações</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Em Breve</span>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Alertas de RSVP</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações quando convidados confirmarem presença.</p>
                </div>
                <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-not-allowed"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Fila de Espera Automática</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avisar automaticamente promovidos da fila (WhatsApp/Email).</p>
                </div>
                <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-not-allowed"></div>
              </div>
            </div>
          </section>

          {/* Sessão de Integrações (Mock) */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Módulo Financeiro & Integrações</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Em Breve</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Em breve, você poderá configurar gateways de pagamento, vincular comandas digitais e emitir contratos diretamente por este painel.
              </p>
              <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                Conectar Gateway (Stripe/MercadoPago)
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
