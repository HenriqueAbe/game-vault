import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Capa from './Capa';
import BotaoFavorito from './BotaoFavorito';
import { cores } from '../theme';

export default function ItemLista({ jogo, aoPressionar, favorito, aoFavoritar, extra }) {
  const ano = jogo.lancamento ? jogo.lancamento.slice(0, 4) : null;
  return (
    <View style={styles.linha}>
      <TouchableOpacity
        onPress={() => aoPressionar(jogo)}
        style={styles.principal}
        accessibilityRole="button"
        accessibilityLabel={`${jogo.nome}${ano ? `, lançado em ${ano}` : ''}. Toque para ver detalhes`}
      >
        <Capa uri={jogo.imagem} nome={jogo.nome} style={styles.miniatura} />
        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={2}>
            {jogo.nome}
          </Text>
          {ano ? <Text style={styles.meta}>{ano}</Text> : null}
          {extra}
        </View>
      </TouchableOpacity>
      {aoFavoritar ? (
        <BotaoFavorito
          ativo={favorito}
          nomeJogo={jogo.nome}
          aoPressionar={() => aoFavoritar(jogo)}
          style={styles.coracao}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 10,
    paddingRight: 8,
  },
  principal: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 8 },
  miniatura: { width: 56, height: 76, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  meta: { fontSize: 13, color: cores.textoSuave, marginTop: 2 },
  coracao: { backgroundColor: 'transparent' },
});
