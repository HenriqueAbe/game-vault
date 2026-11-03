import axios from 'axios';
import { Platform } from 'react-native';
import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from '../config/env';

export const TAMANHO_PAGINA = 20;

const URL_TOKEN = 'https://id.twitch.tv/oauth2/token';
const URL_API = Platform.OS === 'web' ? '/igdb' : 'https://api.igdb.com/v4';
const URL_IMAGENS = 'https://images.igdb.com/igdb/image/upload';
const TIMEOUT = 15000;

const CAMPOS_LISTA = 'name,cover.image_id,total_rating,first_release_date';

let tokenEmMemoria = null;

async function obterToken(forcarNovo = false) {
  if (tokenEmMemoria && !forcarNovo) return tokenEmMemoria;
  let data;
  try {
    ({ data } = await axios.post(URL_TOKEN, null, {
      params: {
        client_id: IGDB_CLIENT_ID,
        client_secret: IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
      timeout: TIMEOUT,
    }));
  } catch (err) {
    console.log('TOKEN ERRO:', err.code, err.message, err.response?.status, err.response?.data);
    throw err;
  }
  tokenEmMemoria = data.access_token;
  return tokenEmMemoria;
}

async function consultar(endpoint, corpo) {
  const chamar = async (forcarNovoToken) => {
    const token = await obterToken(forcarNovoToken);
    return axios.post(`${URL_API}/${endpoint}`, corpo, {
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
        Accept: 'application/json',
      },
      timeout: TIMEOUT,
    });
  };

  try {
    return (await chamar(false)).data;
  } catch (err) {
    console.log('IGDB ERRO:', err.code, err.message, err.response?.status, err.response?.data);
    if (err.response?.status === 401) return (await chamar(true)).data;
    throw err;
  }
}

const urlImagem = (imageId, tamanho) =>
  imageId ? `${URL_IMAGENS}/${tamanho}/${imageId}.jpg` : null;

export function normalizarJogo(jogo) {
  if (!jogo) return jogo;
  if (jogo.nome !== undefined) {
    const { id, nome, imagem, nota, lancamento } = jogo;
    return { id, nome, imagem, nota, lancamento };
  }
  const data = jogo.first_release_date
    ? new Date(jogo.first_release_date * 1000).toISOString().slice(0, 10)
    : null;
  return {
    id: jogo.id,
    nome: jogo.name,
    imagem: urlImagem(jogo.cover?.image_id, 't_cover_big'),
    nota: jogo.total_rating ? Math.round(jogo.total_rating) / 20 : null, // 0–100 vira 0–5
    lancamento: data,
  };
}

const limparTermo = (termo) => termo.replace(/["\\]/g, ' ').trim();

export async function listarJogos(pagina = 1) {
  const offset = (pagina - 1) * TAMANHO_PAGINA;
  const corpo =
    `fields ${CAMPOS_LISTA}; ` +
    `where cover != null & total_rating_count > 30 & version_parent = null; ` +
    `sort total_rating_count desc; limit ${TAMANHO_PAGINA}; offset ${offset};`;
  const dados = await consultar('games', corpo);
  return { jogos: dados.map(normalizarJogo), temMais: dados.length === TAMANHO_PAGINA };
}

export async function buscarJogosPorNome(termo) {
  const corpo =
    `search "${limparTermo(termo)}"; ` +
    `fields ${CAMPOS_LISTA}; where cover != null; limit ${TAMANHO_PAGINA};`;
  const dados = await consultar('games', corpo);
  return { jogos: dados.map(normalizarJogo) };
}

export async function obterJogo(id) {
  const corpo =
    `fields ${CAMPOS_LISTA},screenshots.image_id,aggregated_rating,summary,genres.name,platforms.name,` +
    `involved_companies.developer,involved_companies.company.name; where id = ${Number(id)};`;
  const dados = await consultar('games', corpo);
  const bruto = dados[0];
  if (!bruto) throw new Error('Jogo não encontrado.');

  return {
    ...normalizarJogo(bruto),
    imagemGrande: urlImagem(bruto.screenshots?.[0]?.image_id, 't_screenshot_big'),
    descricao: bruto.summary ?? '',
    generos: (bruto.genres ?? []).map((g) => g.name),
    plataformas: (bruto.platforms ?? []).map((p) => p.name),
    desenvolvedoras: (bruto.involved_companies ?? [])
      .filter((c) => c.developer)
      .map((c) => c.company?.name)
      .filter(Boolean),
    metacritic: bruto.aggregated_rating ? Math.round(bruto.aggregated_rating) : null,
  };
}