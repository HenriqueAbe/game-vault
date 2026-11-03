import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { mensagemErroLogin } from '../utils/erros';
import { cores } from '../theme';

export default function LoginScreen() {
  const { entrar, cadastrar } = useAuth();

  const [modo, setModo] = useState('login'); // 'login' ou 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Os três estados da requisição (tutorial): carregando, erro e sucesso
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const ehLogin = modo === 'login';

  const enviar = async () => {
    setErro(null);
    setAviso(null);
    const emailLimpo = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(emailLimpo)) return setErro('Informe um e-mail válido.');
    if (senha.length < 6) return setErro('A senha precisa ter ao menos 6 caracteres.');
    if (!ehLogin && senha !== confirmarSenha) return setErro('As senhas não coincidem.');

    setCarregando(true);
    try {
      if (ehLogin) {
        await entrar(emailLimpo, senha);
      } else {
        const { precisaConfirmar } = await cadastrar(emailLimpo, senha);
        if (precisaConfirmar) {
          setAviso('Conta criada! Confirme seu e-mail para entrar.');
          setModo('login');
          setSenha('');
          setConfirmarSenha('');
        }
      }
    } catch (err) {
      setErro(mensagemErroLogin(err));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Ionicons name="game-controller" size={44} color="#fff" />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Game Vault
        </Text>
        <Text style={styles.subtitle}>{ehLogin ? 'Entre para acessar seu catálogo' : 'Crie sua conta'}</Text>

        <View style={styles.cartao}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.campo}>
            <Ionicons name="mail-outline" size={20} color={cores.textoSuave} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              placeholderTextColor={cores.textoSuave}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="E-mail"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.campo}>
            <Ionicons name="lock-closed-outline" size={20} color={cores.textoSuave} />
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={cores.textoSuave}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoComplete={ehLogin ? 'current-password' : 'new-password'}
              accessibilityLabel="Senha"
              returnKeyType={ehLogin ? 'done' : 'next'}
              onSubmitEditing={ehLogin ? enviar : undefined}
            />
            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              style={styles.olho}
              accessibilityRole="button"
              accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              accessibilityState={{ selected: mostrarSenha }}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={cores.textoSuave}
              />
            </TouchableOpacity>
          </View>

          {!ehLogin ? (
            <>
              <Text style={styles.label}>Confirmar senha</Text>
              <View style={styles.campo}>
                <Ionicons name="lock-closed-outline" size={20} color={cores.textoSuave} />
                <TextInput
                  style={styles.input}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  placeholder="Repita a senha"
                  placeholderTextColor={cores.textoSuave}
                  secureTextEntry={!mostrarSenha}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                  accessibilityLabel="Confirmar senha"
                  onSubmitEditing={enviar}
                />
              </View>
            </>
          ) : null}

          {erro ? (
            <View style={[styles.mensagem, styles.mensagemErro]}>
              <Ionicons name="alert-circle" size={18} color={cores.perigo} />
              <Text style={[styles.mensagemTexto, { color: cores.perigo }]} accessibilityRole="alert">
                {erro}
              </Text>
            </View>
          ) : null}
          {aviso ? (
            <View style={[styles.mensagem, styles.mensagemAviso]}>
              <Ionicons name="checkmark-circle" size={18} color={cores.sucesso} />
              <Text style={[styles.mensagemTexto, { color: cores.sucesso }]} accessibilityRole="alert">
                {aviso}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={enviar}
            disabled={carregando}
            activeOpacity={0.85}
            style={styles.botao}
            accessibilityRole="button"
            accessibilityLabel={ehLogin ? 'Entrar' : 'Criar conta'}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>{ehLogin ? 'Entrar' : 'Criar conta'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setModo(ehLogin ? 'cadastro' : 'login');
            setConfirmarSenha('');
            setErro(null);
            setAviso(null);
          }}
          style={styles.link}
          accessibilityRole="button"
        >
          <Text style={styles.linkTexto}>
            {ehLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <Text style={styles.linkDestaque}>{ehLogin ? 'Cadastre-se' : 'Entrar'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', color: cores.texto, marginTop: 16 },
  subtitle: { fontSize: 15, textAlign: 'center', color: cores.textoSuave, marginTop: 4, marginBottom: 24 },
  cartao: {
    backgroundColor: cores.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 20,
  },
  label: { fontSize: 14, fontWeight: '600', color: cores.texto, marginTop: 8, marginBottom: 6 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  input: { flex: 1, fontSize: 16, color: cores.texto, marginLeft: 10, paddingVertical: 10 },
  olho: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  mensagem: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginTop: 14 },
  mensagemErro: { backgroundColor: '#3A1F1D' },
  mensagemAviso: { backgroundColor: '#17301F' },
  mensagemTexto: { flex: 1, fontSize: 14, marginLeft: 8 },
  botao: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  linkTexto: { color: cores.textoSuave, fontSize: 15 },
  linkDestaque: { color: cores.primaria, fontWeight: '700' },
});
