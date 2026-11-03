export function removerDuplicados(lista) {
  const vistos = new Set();
  return lista.filter((item) => (vistos.has(item.id) ? false : vistos.add(item.id)));
}

export function mesclarPorId(local, nuvem, localMaisNovo = () => false) {
  const nuvemPorId = new Map(nuvem.map((n) => [n.id, n]));
  const idsLocais = new Set(local.map((l) => l.id));
  const paraEnviar = [];

  const mesclada = local.map((l) => {
    const n = nuvemPorId.get(l.id);
    if (!n || localMaisNovo(l, n)) {
      paraEnviar.push(l);
      return l;
    }
    return n;
  });
  nuvem.forEach((n) => {
    if (!idsLocais.has(n.id)) mesclada.push(n);
  });

  return { mesclada, paraEnviar };
}
