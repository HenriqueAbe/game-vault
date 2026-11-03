import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { lerJSON, salvarJSON } from '../services/armazenamento';
import {
  buscarFavoritosNuvem,
  salvarFavoritoNuvem,
  removerFavoritoNuvem,
} from '../services/nuvem';
import { normalizarJogo } from '../services/api';
import { mesclarPorId } from '../utils/listas';

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const { usuario } = useAuth();
  const userId = usuario?.id;
  const chave = userId ? `@gamevault:favoritos:${userId}` : null;

  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroSync, setErroSync] = useState(null);
  const favoritosRef = useRef([]); // sempre a lista mais recente (evita valor "velho")

  const atualizar = (lista) => {
    favoritosRef.current = lista;
    setFavoritos(lista);
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
        const nuvem = await buscarFavoritosNuvem(userId);
        if (cancelado) return;
        const { mesclada, paraEnviar } = mesclarPorId(favoritosRef.current, nuvem);
        atualizar(mesclada);
        await salvarJSON(chave, mesclada);
        await Promise.all(paraEnviar.map((jogo) => salvarFavoritoNuvem(userId, jogo)));
      } catch (err) {
        if (!cancelado) setErroSync('Sem sincronização com a nuvem. Mostrando dados salvos no aparelho.');
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  const ehFavorito = (id) => favoritos.some((jogo) => jogo.id === id);

  const alternarFavorito = async (jogoOriginal) => {
    const jogo = normalizarJogo(jogoOriginal);
    const atuais = favoritosRef.current;
    const jaEra = atuais.some((j) => j.id === jogo.id);
    const novos = jaEra ? atuais.filter((j) => j.id !== jogo.id) : [jogo, ...atuais];

    atualizar(novos);
    await salvarJSON(chave, novos);
    try {
      if (jaEra) await removerFavoritoNuvem(userId, jogo.id);
      else await salvarFavoritoNuvem(userId, jogo);
      setErroSync(null);
    } catch (err) {
      setErroSync('Não foi possível sincronizar com a nuvem agora.');
    }
  };

  const value = { favoritos, carregando, erroSync, ehFavorito, alternarFavorito };

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  return useContext(FavoritosContext);
}
