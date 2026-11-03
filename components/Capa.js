import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

export default function Capa({ uri, nome, style }) {
  const [falhou, setFalhou] = useState(false);
  const temImagem = Boolean(uri) && !falhou;

  return (
    <View
      style={[styles.caixa, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={temImagem ? `Capa de ${nome}` : `${nome}, sem imagem disponível`}
    >
      {temImagem ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFalhou(true)}
        />
      ) : (
        <Ionicons name="game-controller-outline" size={40} color={cores.textoSuave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
