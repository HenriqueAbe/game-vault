import React from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

export function Carregando({ mensagem = 'Carregando…' }) {
  return (
    <View style={styles.centro} accessible accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={styles.suave}>{mensagem}</Text>
    </View>
  );
}

export function Erro({ mensagem, aoTentarNovamente }) {
  return (
    <View style={styles.centro} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={48} color={cores.perigo} />
      <Text style={styles.titulo}>Ops! Algo deu errado</Text>
      <Text style={styles.erro}>{mensagem}</Text>
      <Button title="Tentar novamente" color={cores.primaria} onPress={aoTentarNovamente} />
    </View>
  );
}

export function Vazio({ icone = 'game-controller-outline', titulo, mensagem }) {
  return (
    <View style={styles.centro}>
      <Ionicons name={icone} size={56} color={cores.textoSuave} />
      <Text style={styles.titulo}>{titulo}</Text>
      {mensagem ? <Text style={styles.suave}>{mensagem}</Text> : null}
    </View>
  );
}

/** ListFooterComponent: spinner da próxima página, ou erro com retry. */
export function RodapeLista({ carregandoMais, erro, aoTentarNovamente }) {
  if (carregandoMais) {
    return (
      <View style={styles.rodape} accessibilityLabel="Carregando mais jogos">
        <ActivityIndicator color={cores.primaria} />
      </View>
    );
  }
  if (erro) {
    return (
      <View style={styles.rodape}>
        <Text style={styles.erro}>{erro}</Text>
        <Button title="Tentar novamente" color={cores.primaria} onPress={aoTentarNovamente} />
      </View>
    );
  }
  return null;
}

/** Aviso discreto quando a nuvem não sincronizou (dados do aparelho em uso). */
export function AvisoSync({ mensagem }) {
  if (!mensagem) return null;
  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={16} color={cores.estrela} />
      <Text style={styles.avisoTexto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, textAlign: 'center', marginVertical: 8 },
  suave: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: 8 },
  erro: { fontSize: 16, color: cores.perigo, textAlign: 'center', marginBottom: 12 },
  rodape: { padding: 16, alignItems: 'center' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2515',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avisoTexto: { flex: 1, marginLeft: 8, fontSize: 13, color: cores.texto },
});
