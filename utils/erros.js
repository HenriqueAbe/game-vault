export function mensagemErroApi(err) {
  if (err?.isAxiosError) {
    if (!err.response) return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
    const status = err.response.status;
    if (status === 400) return 'A API recusou a requisição. Confira o Client ID e o Secret da IGDB no .env.';
    if (status === 401 || status === 403) return 'Credenciais da IGDB inválidas ou sem permissão.';
    if (status === 404) return 'Conteúdo não encontrado.';
    if (status === 429) return 'Muitas requisições. Aguarde um instante e tente de novo.';
    if (status >= 500) return 'O servidor está instável no momento. Tente novamente.';
  }
  if (err?.message === 'Jogo não encontrado.') return err.message;
  return 'Algo deu errado. Tente novamente.';
}

export function mensagemErroLogin(err) {
  const msg = String(err?.message || '');
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(msg)) return 'Este e-mail já está cadastrado.';
  if (/password should be at least/i.test(msg)) return 'A senha precisa ter ao menos 6 caracteres.';
  if (/valid email|invalid email/i.test(msg)) return 'Informe um e-mail válido.';
  if (/network|fetch/i.test(msg)) return 'Sem conexão com a internet.';
  if (/rate limit/i.test(msg)) return 'Muitas tentativas. Aguarde um pouco.';
  return msg || 'Não foi possível concluir. Tente novamente.';
}
