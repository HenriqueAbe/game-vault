const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

/**
 * Proxy da IGDB para a versão web.
 * O navegador bloqueia chamadas diretas a api.igdb.com (CORS), então no web o app chama
 * /igdb/<endpoint> no próprio servidor do Expo, e este repassa a consulta para a IGDB.
 * No celular o app chama a IGDB direto; este proxy só é usado pelo navegador.
 */
const PREFIXO = '/igdb/';

const comProxyIgdb = (middleware) => (req, res, next) => {
  if (!req.url.startsWith(PREFIXO)) return middleware(req, res, next);

  const endpoint = req.url.slice(PREFIXO.length);
  const partes = [];
  req.on('data', (pedaco) => partes.push(pedaco));
  req.on('end', async () => {
    try {
      const resposta = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
        method: 'POST',
        headers: {
          'Client-ID': req.headers['client-id'],
          Authorization: req.headers.authorization,
          'Content-Type': 'text/plain',
          Accept: 'application/json',
        },
        body: Buffer.concat(partes).toString('utf8'),
      });
      res.statusCode = resposta.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(await resposta.text());
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: String(err) }));
    }
  });
  return undefined;
};

const enhanceAnterior = config.server?.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, servidor) =>
    comProxyIgdb(enhanceAnterior ? enhanceAnterior(middleware, servidor) : middleware),
};

module.exports = config;