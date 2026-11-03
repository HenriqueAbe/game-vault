import { supabase } from './supabase';

export async function buscarFavoritosNuvem(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('game_id, game')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((linha) => ({ ...linha.game, id: linha.game_id }));
}

export async function salvarFavoritoNuvem(userId, jogo) {
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, game_id: jogo.id, game: jogo }, { onConflict: 'user_id,game_id' });
  if (error) throw error;
}

export async function removerFavoritoNuvem(userId, jogoId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('game_id', jogoId);
  if (error) throw error;
}

export async function buscarJogadosNuvem(userId) {
  const { data, error } = await supabase
    .from('consumed')
    .select('game_id, game, rating, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map((linha) => ({
    ...linha.game,
    id: linha.game_id,
    minhaNota: linha.rating,
    atualizadoEm: linha.updated_at,
  }));
}

export async function salvarJogadoNuvem(userId, entrada) {
  const { minhaNota, atualizadoEm, ...jogo } = entrada;
  const { error } = await supabase.from('consumed').upsert(
    {
      user_id: userId,
      game_id: entrada.id,
      game: jogo,
      rating: minhaNota ?? null,
      updated_at: atualizadoEm ?? new Date().toISOString(),
    },
    { onConflict: 'user_id,game_id' }
  );
  if (error) throw error;
}

export async function removerJogadoNuvem(userId, jogoId) {
  const { error } = await supabase
    .from('consumed')
    .delete()
    .eq('user_id', userId)
    .eq('game_id', jogoId);
  if (error) throw error;
}
