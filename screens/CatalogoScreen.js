import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../components/ItemCard';
import { AvisoSync, Carregando, Erro, RodapeLista, Vazio } from '../components/Feedback';
import { listarJogos } from '../services/api';
import { mensagemErroApi } from '../utils/erros';
import { removerDuplicados } from '../utils/listas';
import { useFavoritos } from '../contexts/FavoritosContext';
import { cores } from '../theme';

const ESPACO = 12;
const MARGEM = 16;
const DISTANCIA_DO_FIM = 300;

const ATALHOS = [
  { rota: 'Busca', titulo: 'Buscar', icone: 'search' },
  { rota: 'Favoritos', titulo: 'Favoritos', icone: 'heart' },
  { rota: 'Jogados', titulo: 'Jogados', icone: 'checkmark-done' },
];

export default function CatalogoScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const colunas = width >= 600 ? 3 : 2;
  const larguraCard = (width - MARGEM * 2 - ESPACO * (colunas - 1)) / colunas;

  const [jogos, setJogos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false); 
  const [atualizando, setAtualizando] = useState(false);

  const ocupadoRef = useRef(false);
  const repetirRef = useRef(null);
  const paginaRef = useRef(1);
  const temMaisRef = useRef(true); 

  const { ehFavorito, alternarFavorito, erroSync } = useFavoritos();

  const buscarJogos = async (paginaAlvo, modo) => {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setErro(null);
    if (modo === 'inicial') setCarregando(true);
    else if (modo === 'atualizar') setAtualizando(true);
    else setCarregandoMais(true);

    try {
      const { jogos: novos, temMais: haMais } = await listarJogos(paginaAlvo);
      setJogos((anteriores) =>
        modo === 'mais' ? removerDuplicados([...anteriores, ...novos]) : novos
      );
      paginaRef.current = paginaAlvo;
      temMaisRef.current = haMais;
    } catch (err) {
      setErro(mensagemErroApi(err));
      repetirRef.current = () => buscarJogos(paginaAlvo, modo);
    } finally {
      ocupadoRef.current = false;
      setCarregando(false);
      setAtualizando(false);
      setCarregandoMais(false);
    }
  };

  useEffect(() => {
    buscarJogos(1, 'inicial');
  }, []);

  const aoRolar = (evento) => {
    const { layoutMeasurement, contentOffset, contentSize } = evento.nativeEvent;
    const pertoDoFim =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - DISTANCIA_DO_FIM;
    if (!pertoDoFim) return;
    if (!temMaisRef.current || ocupadoRef.current || erro || jogos.length === 0) return;
    buscarJogos(paginaRef.current + 1, 'mais');
  };

  const abrirDetalhes = (jogo) => navigation.navigate('Detalhes', { id: jogo.id, nome: jogo.nome });

  const renderContent = () => {
    if (carregando) {
      return <Carregando mensagem="Carregando jogos…" />;
    }
    if (erro && jogos.length === 0) {
      return <Erro mensagem={erro} aoTentarNovamente={() => repetirRef.current?.()} />;
    }
    return (
      <FlatList
        key={colunas}
        data={jogos}
        numColumns={colunas}
        columnWrapperStyle={{ gap: ESPACO }}
        contentContainerStyle={styles.lista}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.secao}>Em alta</Text>}
        renderItem={({ item }) => (
          <ItemCard
            jogo={item}
            largura={larguraCard}
            favorito={ehFavorito(item.id)}
            aoPressionar={abrirDetalhes}
            aoFavoritar={alternarFavorito}
          />
        )}
        onScroll={aoRolar}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              temMaisRef.current = true;
              buscarJogos(1, 'atualizar');
            }}
            tintColor={cores.primaria}
            colors={[cores.primaria]}
          />
        }
        ListFooterComponent={
          <RodapeLista
            carregandoMais={carregandoMais}
            erro={erro}
            aoTentarNovamente={() => repetirRef.current?.()}
          />
        }
        ListEmptyComponent={<Vazio titulo="Nenhum jogo encontrado" mensagem="Puxe para baixo para recarregar." />}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        {ATALHOS.map((a) => (
          <TouchableOpacity
            key={a.rota}
            style={styles.atalho}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(a.rota)}
            accessibilityRole="button"
            accessibilityLabel={a.titulo}
          >
            <Ionicons name={a.icone} size={18} color={cores.primaria} />
            <Text style={styles.atalhoTexto}>{a.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <AvisoSync mensagem={erroSync} />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  barra: { flexDirection: 'row', paddingHorizontal: MARGEM, paddingTop: 12, paddingBottom: 8, gap: 8 },
  atalho: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
  },
  atalhoTexto: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: cores.primaria },
  secao: { fontSize: 22, fontWeight: '700', color: cores.texto, marginTop: 8, marginBottom: 12 },
  lista: { paddingHorizontal: MARGEM, paddingBottom: 24 },
});