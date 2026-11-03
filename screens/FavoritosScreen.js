import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ItemLista from '../components/ItemLista';
import { AvisoSync, Carregando, Vazio } from '../components/Feedback';
import { useFavoritos } from '../contexts/FavoritosContext';
import { cores } from '../theme';

export default function FavoritosScreen({ navigation }) {
  const { favoritos, carregando, erroSync, alternarFavorito } = useFavoritos();

  if (carregando) return <Carregando mensagem="Carregando favoritos…" />;

  return (
    <View style={styles.container}>
      <AvisoSync mensagem={erroSync} />
      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          favoritos.length > 0 ? (
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Seus favoritos</Text>
              <View style={styles.contador}>
                <Text style={styles.contadorTexto}>{favoritos.length}</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ItemLista
            jogo={item}
            aoPressionar={(j) => navigation.navigate('Detalhes', { id: j.id, nome: j.nome })}
            favorito
            aoFavoritar={alternarFavorito}
          />
        )}
        ListEmptyComponent={
          <Vazio
            icone="heart-outline"
            titulo="Nenhum favorito ainda"
            mensagem="Toque no coração de um jogo para guardá-lo aqui."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 4 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto },
  contador: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
