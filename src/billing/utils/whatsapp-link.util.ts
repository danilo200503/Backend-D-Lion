export function normalizarTelefoneBrasil(telefone: string): string {
  const somenteDigitos = telefone.replace(/\D/g, '');
  if (somenteDigitos.startsWith('55')) return somenteDigitos;
  return `55${somenteDigitos}`;
}

export function montarMensagemCobranca(params: {
  descricao: string;
  valor?: number | null;
  vencimento: Date;
}): string {
  const valorFormatado =
    params.valor != null
      ? `R$ ${params.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'A combinar';
  const vencimentoFormatado = params.vencimento.toLocaleDateString('pt-BR');

  return [
    `Olá, segue sua cobrança referente a ${params.descricao}.`,
    `Valor: ${valorFormatado}`,
    `Vencimento: ${vencimentoFormatado}`,
    '',
    'D-Lion',
  ].join('\n');
}

export function montarLinkWhatsapp(telefone: string, mensagem: string): string {
  const numero = normalizarTelefoneBrasil(telefone);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
