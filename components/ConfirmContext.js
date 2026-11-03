import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../theme';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [opcoes, setOpcoes] = useState(null);
  const resolverRef = useRef(null);

  const confirmar = useCallback(
    (config) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setOpcoes(config);
      }),
    []
  );

  const fechar = (resultado) => {
    resolverRef.current?.(resultado);
    resolverRef.current = null;
    setOpcoes(null);
  };

  const destrutivo = Boolean(opcoes?.destrutivo);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <Modal
        visible={Boolean(opcoes)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => fechar(false)}
      >
        <Pressable style={styles.fundo} onPress={() => fechar(false)}>
          <Pressable style={styles.caixa} onPress={() => {}}>
            <Text style={styles.titulo} accessibilityRole="header">
              {opcoes?.titulo}
            </Text>
            {opcoes?.mensagem ? <Text style={styles.mensagem}>{opcoes.mensagem}</Text> : null}
            <View style={styles.acoes}>
              <TouchableOpacity
                onPress={() => fechar(false)}
                style={[styles.botao, styles.botaoCancelar]}
                accessibilityRole="button"
              >
                <Text style={styles.cancelarTexto}>{opcoes?.cancelarTexto ?? 'Cancelar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => fechar(true)}
                style={[styles.botao, { backgroundColor: destrutivo ? cores.perigo : cores.primaria }]}
                accessibilityRole="button"
              >
                <Text style={[styles.confirmarTexto, destrutivo && { color: '#2A0E0C' }]}>
                  {opcoes?.confirmarTexto ?? 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirmar = () => useContext(ConfirmContext);

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 28 },
  caixa: {
    backgroundColor: cores.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 22,
  },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  mensagem: { fontSize: 15, lineHeight: 22, color: cores.textoSuave, marginTop: 8 },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22, gap: 10 },
  botao: { minHeight: 44, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  botaoCancelar: { borderWidth: 1, borderColor: cores.borda },
  cancelarTexto: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  confirmarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
