import AsyncStorage from '@react-native-async-storage/async-storage';

export async function lerJSON(chave, padrao) {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? JSON.parse(texto) : padrao;
  } catch (err) {
    return padrao;
  }
}

export async function salvarJSON(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch (err) {
  }
}
