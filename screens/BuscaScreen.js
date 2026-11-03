import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemLista from '../components/ItemLista';
import { Carregando, Erro, Vazio } from '../components/Feedback';
import { buscarJogosPorNome } from '../services/api';
import { mensagemErroApi } from '../utils/erros';
import { useFavoritos } from '../contexts/FavoritosContext';
import { useDebounce } from '../hooks/useDebounce';
import { cores } from '../theme';

export default function BuscaScreen({ navigation }) {
  const [texto, setTexto] = useState('');
  const [termoBuscado, setTermoBuscado] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const { ehFavorito, alternarFavorito } = useFavoritos();

  const requisicaoRef = useRef(0);
  const buscar = async (termo) => {
    const numero = ++requisicaoRef.current;
    setCarregando(true);
    setErro(null);
    setTermoBuscado(termo);
    try {
      const { jogos } = await buscarJogosPorNome(termo);
      if (numero !== requisicaoRef.current) return; 
      setResultados(jogos);
    } catch (err) {
      if (numero !== requisicaoRef.current) return;
      setResultados([]);
      setErro(mensagemErroApi(err));
    } finally {
      if (numero === requisicaoRef.current) setCarregando(false);
    }
  };

  const termoAtrasado = useDebounce(texto.trim(), 500);

  useEffect(() => {
    if (termoAtrasado.length < 2) {
      requisicaoRef.current++; 
      setTermoBuscado('');
      setResultados([]);
      setErro(null);
      setCarregando(false);
      return;
    }
    buscar(termoAtrasado);
  }, [termoAtrasado]);

  const aoApertarBuscar = () => {
    const termo = texto.trim();
    if (termo.length < 2) return;
    Keyboard.dismiss();
    buscar(termo);
  };

  const abrirDetalhes = (jogo) => navigation.navigate('Detalhes', { id: jogo.id, nome: jogo.nome });

  const renderContent = () => {
    if (!termoBuscado) {
      return (
        <Vazio
          icone="search-outline"
          titulo="Procure um jogo"
          mensagem="Digite ao menos 2 letras. A busca acontece enquanto você digita."
        />
      );
    }
    if (carregando && resultados.length === 0) {
      return <Carregando mensagem={`Buscando “${termoBuscado}”…`} />;
    }
    if (erro) return <Erro mensagem={erro} aoTentarNovamente={() => buscar(termoBuscado)} />;

    return (
      <FlatList
        data={resultados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          resultados.length > 0 ? (
            <Text style={styles.contagem}>
              {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para “{termoBuscado}”
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <ItemLista
            jogo={item}
            aoPressionar={abrirDetalhes}
            favorito={ehFavorito(item.id)}
            aoFavoritar={alternarFavorito}
          />
        )}
        ListEmptyComponent={
          <Vazio
            icone="sad-outline"
            titulo="Nenhum resultado"
            mensagem={`Não encontramos jogos para “${termoBuscado}”. Tente outro nome.`}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.campo}>
          <Ionicons name="search" size={20} color={cores.textoSuave} />
          <TextInput
            style={styles.input}
            placeholder="Nome do jogo"
            placeholderTextColor={cores.textoSuave}
            value={texto}
            onChangeText={setTexto}
            returnKeyType="search"
            onSubmitEditing={aoApertarBuscar}
            autoCorrect={false}
            accessibilityLabel="Campo de busca de jogos"
          />
          {texto.length > 0 ? (
            <TouchableOpacity
              onPress={() => setTexto('')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
            >
              <Ionicons name="close-circle" size={20} color={cores.textoSuave} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={aoApertarBuscar}
          style={styles.botao}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Buscar"
        >
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  campo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
  },
  input: { flex: 1, fontSize: 16, color: cores.texto, marginLeft: 10, paddingVertical: 10 },
  botao: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contagem: { fontSize: 13, color: cores.textoSuave, marginBottom: 12, marginLeft: 2 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
});
