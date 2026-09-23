"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEventContext } from '../context/EventContext';

// --- Icons (Inline SVGs) ---
const IconHome = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconCalendar = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconGrid = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconCheck = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const IconUserCheck = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconReport = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconBell = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const IconSettings = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconHelp = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconLogout = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const IconMenu = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconSearch = ({ className }: { className?: string }) => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconCube = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { eventos, eventoSelecionadoId, setEventoSelecionadoId, loadingEventos } = useEventContext();
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center px-6 py-2.5 transition-colors ${
      isActive
        ? 'bg-gray-800 border-l-4 border-blue-500 text-white font-medium'
        : 'border-l-4 border-transparent hover:bg-gray-800 hover:text-white'
    }`;
  };

  if (pathname.startsWith('/rsvp/') && pathname !== '/rsvp-painel') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-sm font-sans text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b2030] text-gray-400 flex flex-col h-full shrink-0 shadow-lg z-20 hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <div className="text-blue-500 mr-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white text-lg font-bold tracking-widest">EVENT SET</span>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Acesso Rápido</div>
          <nav className="mb-8 space-y-1">
            <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
              <IconHome /> <span className="ml-3">Dashboard</span>
            </Link>
            <Link href="/cadastrar" className={getLinkClasses('/cadastrar')}>
              <IconCalendar /> <span className="ml-3">Gestão (Cadastros)</span>
            </Link>
            <Link href="/" className={getLinkClasses('/')}>
              <IconGrid /> <span className="ml-3">Gestão de Salão</span>
            </Link>
          </nav>

          <div className="px-6 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Serviços</div>
          <nav className="mb-8 space-y-1">
            <Link href="/rsvp-painel" className={getLinkClasses('/rsvp-painel')}>
              <IconCheck /> <span className="ml-3">Confirmações (RSVP)</span>
            </Link>
            <Link href="/recepcao" className={getLinkClasses('/recepcao')}>
              <IconUserCheck /> <span className="ml-3">Check-in / Recepção</span>
            </Link>
            <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
              <IconReport /> <span className="ml-3">Relatórios</span>
            </Link>
          </nav>

          <div className="px-6 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Conta</div>
          <nav className="space-y-1">
            <Link href="#" className="flex items-center px-6 py-2.5 border-l-4 border-transparent hover:bg-gray-800 hover:text-white transition-colors">
              <IconBell /> <span className="ml-3">Notificações</span>
            </Link>
            <Link href="/configuracoes" className={getLinkClasses('/configuracoes')}>
              <IconSettings /> <span className="ml-3">Configurações</span>
            </Link>
            <Link href="#" className="flex items-center px-6 py-2.5 border-l-4 border-transparent hover:bg-gray-800 hover:text-white transition-colors">
              <IconHelp /> <span className="ml-3">FAQ</span>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800">
           <button className="flex items-center px-2 hover:text-white transition-colors w-full">
             <IconLogout /> <span className="ml-3">Sair</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7FE]">
        
        {/* Header */}
        <header className="h-16 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-10 border-b border-gray-100 shadow-sm">
          {/* Left side header */}
          <div className="flex items-center">
            <button className="text-gray-400 hover:text-gray-600 mr-4 md:hidden">
               <IconMenu />
            </button>
            <div className="text-gray-400 hover:text-gray-600 mr-4 hidden md:block">
               <IconCube />
            </div>
            <div className="relative hidden md:block">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar eventos, convidados..." 
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 transition-all text-gray-700" 
              />
            </div>
          </div>
          
          {/* Right side header & Event Selector */}
          <div className="flex items-center space-x-3 md:space-x-6">
            
            {/* SELETOR DE EVENTO GLOBAL */}
            <div className="flex items-center bg-blue-50 text-blue-900 rounded-full px-4 py-1.5 border border-blue-100 shadow-sm">
               <span className="text-xs font-semibold mr-2 uppercase tracking-wide hidden sm:block">Evento:</span>
               <select 
                 className="bg-transparent border-none text-sm font-bold focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-4"
                 value={eventoSelecionadoId} 
                 onChange={(e) => setEventoSelecionadoId(e.target.value)}
                 style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="%231E3A8A" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1em' }}
               >
                 {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nomeCliente}</option>)}
                 {loadingEventos && <option value="">Carregando...</option>}
                 {!loadingEventos && eventos.length === 0 && <option value="">Nenhum evento</option>}
               </select>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4 border-l pl-3 md:pl-6 border-gray-200">
               {/* User Info Placeholder */}
               <div className="hidden sm:flex flex-col items-end mr-1">
                 <span className="text-sm font-bold text-gray-800 leading-tight">Admin</span>
                 <span className="text-[10px] text-gray-500">Gestor</span>
               </div>
               <div className="relative">
                 <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" />
               </div>
               
               <button className="text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
                  <IconSettings />
               </button>
               
               <div className="relative cursor-pointer text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
                 <IconBell />
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content goes here */}
        {children}

      </div>
    </div>
  );
}
