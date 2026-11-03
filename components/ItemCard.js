import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Capa from './Capa';
import BotaoFavorito from './BotaoFavorito';
import { cores } from '../theme';

export default function ItemCard({ jogo, largura, favorito, aoPressionar, aoFavoritar }) {
  return (
    <View style={[styles.wrapper, { width: largura }]}>
      <TouchableOpacity
        onPress={() => aoPressionar(jogo)}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${jogo.nome}. Toque para ver detalhes`}
      >
        <Capa uri={jogo.imagem} nome={jogo.nome} style={styles.capa} />
        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={2}>
            {jogo.nome}
          </Text>
          {jogo.nota ? <Text style={styles.meta}>★ {Number(jogo.nota).toFixed(1)}</Text> : null}
        </View>
      </TouchableOpacity>
      <BotaoFavorito
        ativo={favorito}
        nomeJogo={jogo.nome}
        aoPressionar={() => aoFavoritar(jogo)}
        style={styles.coracao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  card: {
    backgroundColor: cores.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  capa: { width: '100%', aspectRatio: 3 / 4 },
  info: { padding: 10 },
  nome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  meta: { fontSize: 13, color: cores.textoSuave, marginTop: 4 },
  coracao: { position: 'absolute', top: 8, right: 8 },
});
