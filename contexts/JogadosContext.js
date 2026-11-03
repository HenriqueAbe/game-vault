import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { lerJSON, salvarJSON } from '../services/armazenamento';
import { buscarJogadosNuvem, salvarJogadoNuvem, removerJogadoNuvem } from '../services/nuvem';
import { normalizarJogo } from '../services/api';
import { mesclarPorId } from '../utils/listas';

const JogadosContext = createContext();

const localMaisNovo = (l, n) => new Date(l.atualizadoEm || 0) > new Date(n.atualizadoEm || 0);

export function JogadosProvider({ children }) {
  const { usuario } = useAuth();
  const userId = usuario?.id;
  const chave = userId ? `@gamevault:jogados:${userId}` : null;

  const [jogados, setJogados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroSync, setErroSync] = useState(null);
  const jogadosRef = useRef([]);

  const atualizar = (lista) => {
    jogadosRef.current = lista;
    setJogados(lista);
  };

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      atualizar([]);
      setErroSync(null);
      if (!userId) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      const local = await lerJSON(chave, []);
      if (cancelado) return;
      atualizar(local);
      setCarregando(false);

      try {
        const nuvem = await buscarJogadosNuvem(userId);
        if (cancelado) return;
        const { mesclada, paraEnviar } = mesclarPorId(jogadosRef.current, nuvem, localMaisNovo);
        atualizar(mesclada);
        await salvarJSON(chave, mesclada);
        await Promise.all(paraEnviar.map((e) => salvarJogadoNuvem(userId, e)));
      } catch (err) {
        if (!cancelado) setErroSync('Sem sincronização com a nuvem. Mostrando dados salvos no aparelho.');
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  const salvar = async (novos, chamadaNuvem) => {
    atualizar(novos);
    await salvarJSON(chave, novos);
    try {
      await chamadaNuvem();
      setErroSync(null);
    } catch (err) {
      setErroSync('Não foi possível sincronizar com a nuvem agora.');
    }
  };

  const buscarJogado = (id) => jogados.find((j) => j.id === id) ?? null;

  
  const alternarJogado = async (jogoOriginal) => {
    const jogo = normalizarJogo(jogoOriginal);
    const atuais = jogadosRef.current;
    if (atuais.some((j) => j.id === jogo.id)) {
      await salvar(
        atuais.filter((j) => j.id !== jogo.id),
        () => removerJogadoNuvem(userId, jogo.id)
      );
    } else {
      const entrada = { ...jogo, minhaNota: null, atualizadoEm: new Date().toISOString() };
      await salvar([entrada, ...atuais], () => salvarJogadoNuvem(userId, entrada));
    }
  };

  const darNota = async (jogoOriginal, nota) => {
    if (nota < 1 || nota > 5) return;
    const jogo = normalizarJogo(jogoOriginal);
    const entrada = { ...jogo, minhaNota: nota, atualizadoEm: new Date().toISOString() };
    const restantes = jogadosRef.current.filter((j) => j.id !== jogo.id);
    await salvar([entrada, ...restantes], () => salvarJogadoNuvem(userId, entrada));
  };

  const value = { jogados, carregando, erroSync, buscarJogado, alternarJogado, darNota };

  return <JogadosContext.Provider value={value}>{children}</JogadosContext.Provider>;
}

export function useJogados() {
  return useContext(JogadosContext);
}
