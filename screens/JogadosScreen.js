import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ItemLista from '../components/ItemLista';
import { NotaFixa } from '../components/Estrelas';
import { AvisoSync, Carregando, Vazio } from '../components/Feedback';
import { useJogados } from '../contexts/JogadosContext';
import { cores } from '../theme';

export default function JogadosScreen({ navigation }) {
  const { jogados, carregando, erroSync } = useJogados();

  if (carregando) return <Carregando mensagem="Carregando seus jogos…" />;

  return (
    <View style={styles.container}>
      <AvisoSync mensagem={erroSync} />
      <FlatList
        data={jogados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          jogados.length > 0 ? (
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Jogados</Text>
              <View style={styles.contador}>
                <Text style={styles.contadorTexto}>{jogados.length}</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ItemLista
            jogo={item}
            aoPressionar={(j) => navigation.navigate('Detalhes', { id: j.id, nome: j.nome })}
            extra={<NotaFixa nota={item.minhaNota} />}
          />
        )}
        ListEmptyComponent={
          <Vazio
            icone="checkmark-done-outline"
            titulo="Nada por aqui ainda"
            mensagem="Marque jogos como jogados e dê uma nota para vê-los aqui."
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
