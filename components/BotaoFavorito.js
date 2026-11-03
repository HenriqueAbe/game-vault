import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

export default function BotaoFavorito({ ativo, aoPressionar, nomeJogo, style }) {
  return (
    <TouchableOpacity
      onPress={aoPressionar}
      hitSlop={6}
      style={[styles.botao, style]}
      accessibilityRole="checkbox"
      accessibilityLabel={`Favorito: ${nomeJogo}`}
      accessibilityHint={ativo ? 'Toque para remover dos favoritos' : 'Toque para adicionar aos favoritos'}
      accessibilityState={{ checked: ativo }}
    >
      <Ionicons
        name={ativo ? 'heart' : 'heart-outline'}
        size={22}
        color={ativo ? cores.perigo : cores.texto}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,22,25,0.72)',
  },
});