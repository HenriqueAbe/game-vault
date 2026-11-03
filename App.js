import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritosProvider } from './contexts/FavoritosContext';
import { JogadosProvider } from './contexts/JogadosContext';
import { ConfirmProvider, useConfirmar } from './components/ConfirmContext';
import { Carregando } from './components/Feedback';
import LoginScreen from './screens/LoginScreen';
import CatalogoScreen from './screens/CatalogoScreen';
import BuscaScreen from './screens/BuscaScreen';
import DetalhesScreen from './screens/DetalhesScreen';
import FavoritosScreen from './screens/FavoritosScreen';
import JogadosScreen from './screens/JogadosScreen';
import { configurado } from './config/env';
import { cores } from './theme';

const Stack = createNativeStackNavigator();

function BotaoSair() {
  const { sair } = useAuth();
  const confirmar = useConfirmar();

  const aoPressionar = async () => {
    const ok = await confirmar({
      titulo: 'Sair da conta?',
      mensagem: 'Você precisará entrar novamente para acessar seu catálogo.',
      confirmarTexto: 'Sair',
      destrutivo: true,
    });
    if (ok) sair();
  };

  return (
    <TouchableOpacity
      onPress={aoPressionar}
      hitSlop={8}
      style={styles.botaoSair}
      accessibilityRole="button"
      accessibilityLabel="Sair da conta"
    >
      <Ionicons name="log-out-outline" size={24} color={cores.texto} />
    </TouchableOpacity>
  );
}

function Rotas() {
  const { sessao, iniciando } = useAuth();

  if (iniciando) {
    return (
      <View style={styles.tela}>
        <Carregando mensagem="Abrindo…" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: cores.fundo },
          headerTintColor: cores.texto,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        {sessao ? (
          <>
            <Stack.Screen
              name="Catalogo"
              component={CatalogoScreen}
              options={{ title: 'Game Vault', headerRight: () => <BotaoSair /> }}
            />
            <Stack.Screen name="Busca" component={BuscaScreen} options={{ title: 'Buscar' }} />
            <Stack.Screen
              name="Detalhes"
              component={DetalhesScreen}
              options={({ route }) => ({ title: route.params?.nome ?? 'Detalhes' })}
            />
            <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Favoritos' }} />
            <Stack.Screen name="Jogados" component={JogadosScreen} options={{ title: 'Jogados' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  if (!configurado) {
    return (
      <View style={styles.config}>
        <StatusBar style="light" />
        <Text style={styles.configTitulo}>Configuração pendente</Text>
        <Text style={styles.configTexto}>
          Crie o arquivo .env a partir do .env.example e preencha EXPO_PUBLIC_IGDB_CLIENT_ID,
          EXPO_PUBLIC_IGDB_CLIENT_SECRET, EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY. Depois reinicie com
          "npx expo start -c".
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <FavoritosProvider>
        <JogadosProvider>
          <ConfirmProvider>
            <View style={styles.tela}>
              <StatusBar style="light" />
              <Rotas />
            </View>
          </ConfirmProvider>
        </JogadosProvider>
      </FavoritosProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  botaoSair: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  config: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: cores.fundo },
  configTitulo: { fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: 12 },
  configTexto: { fontSize: 16, lineHeight: 24, color: cores.textoSuave },
});
