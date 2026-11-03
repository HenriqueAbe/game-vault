# Game Vault

Catálogo de jogos em React Native (Expo) que consome a API da [IGDB](https://api-docs.igdb.com).
Projeto somativo de Desenvolvimento Mobile Híbrido (BSI).

## Como rodar

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
# preencha as três variáveis no .env
npx expo start -c
```

Abra no Expo Go (QR code) ou pressione `w` para rodar na web.

## Variáveis de ambiente

| Variável | Onde obter |
|---|---|
| `EXPO_PUBLIC_IGDB_CLIENT_ID` | dev.twitch.tv/console > Register Your Application > Client ID |
| `EXPO_PUBLIC_IGDB_CLIENT_SECRET` | mesma tela, botão New Secret |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |

Para criar as tabelas no Supabase, execute `supabase/schema.sql` no SQL Editor.

## Tecnologias

- React Native + Expo, React Navigation (native-stack)
- Context API (Auth, Favoritos, Jogados)
- Axios para a IGDB (token via Twitch)
- AsyncStorage (cache local) e Supabase (autenticação e nuvem)

## Estrutura

```
components/   componentes reutilizáveis (ItemCard, ItemLista, Feedback...)
config/       leitura das variáveis de ambiente
contexts/     AuthContext, FavoritosContext, JogadosContext
hooks/        useDebounce
screens/      telas do app
services/     api (IGDB), armazenamento local, nuvem, supabase
utils/        funções auxiliares
```
