import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Capa from '../components/Capa';
import BotaoFavorito from '../components/BotaoFavorito';
import { Estrelas } from '../components/Estrelas';
import { AvisoSync, Carregando, Erro } from '../components/Feedback';
import { obterJogo } from '../services/api';
import { limparHtml } from '../utils/html';
import { mensagemErroApi } from '../utils/erros';
import { useFavoritos } from '../contexts/FavoritosContext';
import { useJogados } from '../contexts/JogadosContext';
import { cores } from '../theme';

export default function DetalhesScreen({ route, navigation }) {
  const { id } = route.params;

  const [jogo, setJogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const { ehFavorito, alternarFavorito, carregando: carregandoFav, erroSync } = useFavoritos();
  const { buscarJogado, alternarJogado, darNota, carregando: carregandoJog } = useJogados();

  const buscarDetalhes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await obterJogo(id);
      setJogo({ ...dados, descricao: limparHtml(dados.descricao) });
    } catch (err) {
      setErro(mensagemErroApi(err));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDetalhes();
  }, [id]);

  useEffect(() => {
    if (jogo) navigation.setOptions({ title: jogo.nome });
  }, [jogo]);

  const renderContent = () => {
    if (carregando || carregandoFav || carregandoJog) {
      return <Carregando mensagem="Carregando detalhes…" />;
    }
    if (erro || !jogo) return <Erro mensagem={erro} aoTentarNovamente={buscarDetalhes} />;

    const favorito = ehFavorito(jogo.id);
    const entrada = buscarJogado(jogo.id);
    const jogado = Boolean(entrada);

    const infos = [
      { icone: 'calendar-outline', rotulo: 'Lançamento', valor: jogo.lancamento },
      {
        icone: 'game-controller-outline',
        rotulo: 'Plataformas',
        valor: jogo.plataformas.length > 0 ? jogo.plataformas.join(', ') : null,
      },
      {
        icone: 'code-slash-outline',
        rotulo: 'Desenvolvedora',
        valor: jogo.desenvolvedoras.length > 0 ? jogo.desenvolvedoras.join(', ') : null,
      },
    ].filter((i) => i.valor);

    return (
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <AvisoSync mensagem={erroSync} />
        <View>
          <Capa uri={jogo.imagemGrande ?? jogo.imagem} nome={jogo.nome} style={styles.imagem} />
          <BotaoFavorito
            ativo={favorito}
            nomeJogo={jogo.nome}
            aoPressionar={() => alternarFavorito(jogo)}
            style={styles.coracao}
          />
        </View>

        <View style={styles.corpo}>
          <Text style={styles.title} accessibilityRole="header">
            {jogo.nome}
          </Text>

          <View style={styles.chips}>
            {jogo.nota ? (
              <View style={[styles.chip, styles.chipDestaque]}>
                <Ionicons name="star" size={13} color={cores.estrela} />
                <Text style={[styles.chipTexto, { color: cores.estrela }]}>{Number(jogo.nota).toFixed(1)}</Text>
              </View>
            ) : null}
            {jogo.metacritic ? (
              <View style={[styles.chip, styles.chipDestaque]}>
                <Text style={[styles.chipTexto, { color: cores.sucesso }]}>Crítica {jogo.metacritic}</Text>
              </View>
            ) : null}
            {jogo.generos.map((g) => (
              <View key={g} style={styles.chip}>
                <Text style={styles.chipTexto}>{g}</Text>
              </View>
            ))}
          </View>

          {/* RF07 — jogado + nota pessoal */}
          <TouchableOpacity
            onPress={() => alternarJogado(jogo)}
            activeOpacity={0.85}
            style={[styles.botaoJogado, jogado && styles.botaoJogadoAtivo]}
            accessibilityRole="button"
            accessibilityLabel={jogado ? 'Desmarcar como jogado' : 'Marcar como jogado'}
            accessibilityState={{ selected: jogado }}
          >
            <Ionicons
              name={jogado ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={jogado ? '#fff' : cores.texto}
            />
            <Text style={[styles.botaoJogadoTexto, jogado && { color: '#fff' }]}>
              {jogado ? 'Jogado' : 'Marcar como jogado'}
            </Text>
          </TouchableOpacity>

          {jogado ? (
            <View style={styles.cartaoNota}>
              <Text style={styles.rotulo}>Sua nota</Text>
              <Estrelas nota={entrada.minhaNota ?? 0} aoMudar={(n) => darNota(jogo, n)} />
            </View>
          ) : null}

          <Text style={styles.secao}>Sobre</Text>
          <Text style={styles.descricao}>{jogo.descricao || 'Sem descrição disponível.'}</Text>

          {infos.length > 0 ? (
            <View style={styles.cartaoInfo}>
              {infos.map((i, idx) => (
                <View key={i.rotulo} style={[styles.linhaInfo, idx > 0 && styles.linhaInfoBorda]}>
                  <Ionicons name={i.icone} size={20} color={cores.primaria} />
                  <View style={styles.infoTextos}>
                    <Text style={styles.infoRotulo}>{i.rotulo}</Text>
                    <Text style={styles.infoValor}>{i.valor}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.igdb.com')}
            style={styles.atribuicao}
            accessibilityRole="link"
            accessibilityLabel="Dados fornecidos por IGDB. Abrir site"
          >
            <Text style={styles.atribuicaoTexto}>Dados fornecidos por IGDB.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingBottom: 40 },
  imagem: { width: '100%', aspectRatio: 16 / 10 },
  coracao: { position: 'absolute', top: 16, right: 16 },
  corpo: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: cores.fundo,
  },
  title: { fontSize: 26, fontWeight: '700', color: cores.texto, marginBottom: 12, lineHeight: 32 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipDestaque: { backgroundColor: '#2B2515', borderColor: '#4A3E1D' },
  chipTexto: { fontSize: 13, fontWeight: '600', color: cores.texto, marginLeft: 2 },
  botaoJogado: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  botaoJogadoAtivo: { backgroundColor: cores.primaria },
  botaoJogadoTexto: { fontSize: 16, fontWeight: '600', color: cores.texto, marginLeft: 8 },
  cartaoNota: {
    backgroundColor: cores.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    marginBottom: 4,
  },
  secao: { fontSize: 19, fontWeight: '700', color: cores.texto, marginTop: 20, marginBottom: 8 },
  descricao: { fontSize: 15, lineHeight: 24, color: cores.textoSuave },
  cartaoInfo: {
    backgroundColor: cores.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  linhaInfoBorda: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cores.borda },
  infoTextos: { flex: 1, marginLeft: 14 },
  infoRotulo: { fontSize: 12, fontWeight: '600', color: cores.textoSuave },
  infoValor: { fontSize: 15, color: cores.texto, marginTop: 2 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  atribuicao: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  atribuicaoTexto: { fontSize: 13, color: cores.textoSuave, textDecorationLine: 'underline' },
});
