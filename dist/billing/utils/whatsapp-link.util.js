"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarTelefoneBrasil = normalizarTelefoneBrasil;
exports.montarMensagemCobranca = montarMensagemCobranca;
exports.montarLinkWhatsapp = montarLinkWhatsapp;
function normalizarTelefoneBrasil(telefone) {
    const somenteDigitos = telefone.replace(/\D/g, '');
    if (somenteDigitos.startsWith('55'))
        return somenteDigitos;
    return `55${somenteDigitos}`;
}
function montarMensagemCobranca(params) {
    const valorFormatado = params.valor != null
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
function montarLinkWhatsapp(telefone, mensagem) {
    const numero = normalizarTelefoneBrasil(telefone);
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
//# sourceMappingURL=whatsapp-link.util.js.map