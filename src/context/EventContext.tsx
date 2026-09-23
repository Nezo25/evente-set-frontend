"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Evento {
  id: number;
  nomeCliente: string;
  [key: string]: unknown;
}

interface EventContextType {
  eventos: Evento[];
  eventoSelecionadoId: string;
  setEventoSelecionadoId: (id: string) => void;
  loadingEventos: boolean;
  refreshEventos: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string>("");
  const [loadingEventos, setLoadingEventos] = useState<boolean>(true);

  const fetchEventos = () => {
    setLoadingEventos(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/eventos`)
      .then(res => res.json())
      .then(data => {
        setEventos(data);
        setEventoSelecionadoId(prev => {
          if (!prev && data.length > 0) {
            return String(data[data.length - 1].id);
          }
          return prev;
        });
        setLoadingEventos(false);
      })
      .catch(err => {
        console.error("Erro ao buscar eventos do contexto global:", err);
        setLoadingEventos(false);
      });
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return (
    <EventContext.Provider value={{ eventos, eventoSelecionadoId, setEventoSelecionadoId, loadingEventos, refreshEventos: fetchEventos }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
