import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const { data } = await supabase.auth.getSession();
        setSessao(data.session);
      } catch (err) {
        setSessao(null);
      } finally {
        setIniciando(false);
      }
    }
    restaurarSessao();

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });

    const appState = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      data.subscription.unsubscribe();
      appState.remove();
    };
  }, []);

  const entrar = async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  };

  const cadastrar = async (email, senha) => {
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) throw error;
    return { precisaConfirmar: !data.session };
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  const value = { sessao, usuario: sessao?.user ?? null, iniciando, entrar, cadastrar, sair };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
