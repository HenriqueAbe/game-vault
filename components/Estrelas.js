import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

export function Estrelas({ nota = 0, aoMudar }) {
  return (
    <View style={styles.linha}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => aoMudar(n)}
          style={styles.estrela}
          accessibilityRole="button"
          accessibilityLabel={`Dar nota ${n} de 5`}
          accessibilityState={{ selected: n === nota }}
        >
          <Ionicons name={n <= (nota ?? 0) ? 'star' : 'star-outline'} size={30} color={cores.estrela} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

/** Versão só para leitura (tela de jogados). */
export function NotaFixa({ nota }) {
  if (!nota) return <Text style={styles.semNota}>Sem nota</Text>;
  return (
    <View style={styles.linha} accessible accessibilityLabel={`Sua nota: ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= nota ? 'star' : 'star-outline'} size={16} color={cores.estrela} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  estrela: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  semNota: { color: cores.textoSuave, fontSize: 13 },
});
