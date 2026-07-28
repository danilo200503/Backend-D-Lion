"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TODAS_AS_REGRAS = void 0;
const CFOP_INTERNO = new Set(['1', '5']);
const CFOP_INTERESTADUAL = new Set(['2', '6']);
const CST_ICMS_VALIDOS = new Set([
    '00', '10', '20', '30', '40', '41', '50', '51', '60', '70', '90',
]);
const CST_PIS_COFINS_VALIDOS = new Set([
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '49', '50', '51', '52', '53', '54', '55',
    '56', '60', '61', '62', '63', '64', '65', '66', '67', '70', '71', '72', '73', '74', '75', '98', '99',
]);
const TIPOS_SEM_ITENS_PADRAO_NFE = new Set(['CTE', 'MDFE', 'NFSE']);
function regraCfopIncompativel(documento) {
    const erros = [];
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return erros;
    if (!documento.uf || !documento.destinatarioUf)
        return erros;
    const operacaoInterna = documento.uf === documento.destinatarioUf;
    documento.itens.forEach((item) => {
        if (!item.cfop)
            return;
        const primeiroDigito = item.cfop.charAt(0);
        if (operacaoInterna && CFOP_INTERESTADUAL.has(primeiroDigito)) {
            erros.push({
                tipo: 'CFOP',
                descricao: `CFOP ${item.cfop} incompatível com o tipo da operação${item.xProd ? ` (${item.xProd})` : ''}.`,
                explicacao: 'Foi identificado que o CFOP utilizado normalmente representa operações interestaduais. Entretanto, o emitente e o destinatário estão no mesmo estado, ou seja, a operação parece ser interna. Verifique o enquadramento fiscal da nota.',
                correcao: 'Utilize um CFOP compatível com operações internas (grupo 1xxx ou 5xxx).',
                severidade: 'ALTA',
                pontosPerdidos: 8,
            });
        }
        if (!operacaoInterna && CFOP_INTERNO.has(primeiroDigito)) {
            erros.push({
                tipo: 'CFOP',
                descricao: `CFOP ${item.cfop} incompatível com o tipo da operação${item.xProd ? ` (${item.xProd})` : ''}.`,
                explicacao: 'Foi identificado que o CFOP utilizado normalmente representa operações internas (dentro do mesmo estado). Entretanto, o emitente e o destinatário estão em estados diferentes, ou seja, a operação parece ser interestadual. Verifique o enquadramento fiscal da nota.',
                correcao: 'Utilize um CFOP compatível com operações interestaduais (grupo 2xxx ou 6xxx).',
                severidade: 'ALTA',
                pontosPerdidos: 8,
            });
        }
    });
    return erros;
}
function regraCstInvalido(documento) {
    const erros = [];
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return erros;
    documento.itens.forEach((item) => {
        if (item.cstIcms && !CST_ICMS_VALIDOS.has(item.cstIcms)) {
            erros.push({
                tipo: 'CST',
                descricao: `CST de ICMS "${item.cstIcms}" não pertence ao grupo de códigos válidos${item.xProd ? ` (${item.xProd})` : ''}.`,
                explicacao: 'O Código de Situação Tributária informado para o ICMS não corresponde a nenhum dos códigos oficiais previstos na tabela do Convênio ICMS 61/07 (00, 10, 20, 30, 40, 41, 50, 51, 60, 70, 90).',
                correcao: 'Revise o CST de ICMS lançado no item e ajuste para um código válido de acordo com a tributação do produto.',
                severidade: 'ALTA',
                pontosPerdidos: 6,
            });
        }
        if (item.cstPis && !CST_PIS_COFINS_VALIDOS.has(item.cstPis)) {
            erros.push({
                tipo: 'CST',
                descricao: `CST de PIS "${item.cstPis}" não pertence ao grupo de códigos válidos${item.xProd ? ` (${item.xProd})` : ''}.`,
                explicacao: 'O código informado para o PIS está fora da tabela oficial de CSTs de PIS/COFINS.',
                correcao: 'Ajuste o CST de PIS para um código válido, compatível com o regime tributário do emitente.',
                severidade: 'MEDIA',
                pontosPerdidos: 4,
            });
        }
        if (item.cstCofins && !CST_PIS_COFINS_VALIDOS.has(item.cstCofins)) {
            erros.push({
                tipo: 'CST',
                descricao: `CST de COFINS "${item.cstCofins}" não pertence ao grupo de códigos válidos${item.xProd ? ` (${item.xProd})` : ''}.`,
                explicacao: 'O código informado para a COFINS está fora da tabela oficial de CSTs de PIS/COFINS.',
                correcao: 'Ajuste o CST de COFINS para um código válido, compatível com o regime tributário do emitente.',
                severidade: 'MEDIA',
                pontosPerdidos: 4,
            });
        }
    });
    return erros;
}
function regraNcmVazio(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => !item.ncm)
        .map((item) => ({
        tipo: 'NCM',
        descricao: `Produto${item.xProd ? ` "${item.xProd}"` : ''} sem NCM informado.`,
        explicacao: 'O NCM (Nomenclatura Comum do Mercosul) é obrigatório em toda NFe e é usado para classificar fiscalmente a mercadoria, definindo alíquotas de tributos federais.',
        correcao: 'Informe o código NCM correspondente ao produto antes de transmitir a nota.',
        severidade: 'ALTA',
        pontosPerdidos: 6,
    }));
}
function regraProdutoSemTributacao(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => !item.cstIcms && !item.cstPis && !item.cstCofins)
        .map((item) => ({
        tipo: 'ICMS',
        descricao: `Produto${item.xProd ? ` "${item.xProd}"` : ''} sem nenhuma tributação (ICMS/PIS/COFINS) identificada.`,
        explicacao: 'Todo item de uma nota fiscal deve possuir ao menos a tributação de ICMS informada, mesmo quando isento ou não tributado (usando o CST correspondente).',
        correcao: 'Verifique o grupo de tributação do item e informe o CST correto, mesmo que a operação seja isenta.',
        severidade: 'ALTA',
        pontosPerdidos: 7,
    }));
}
function regraIcmsZerado(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    const cstsComIcmsEsperado = new Set(['00', '10', '20', '70', '90']);
    return documento.itens
        .filter((item) => item.cstIcms && cstsComIcmsEsperado.has(item.cstIcms) && !item.vICMS)
        .map((item) => ({
        tipo: 'ICMS',
        descricao: `ICMS zerado ou ausente para item${item.xProd ? ` "${item.xProd}"` : ''} com CST ${item.cstIcms}.`,
        explicacao: `O CST ${item.cstIcms} indica que deveria haver cálculo de ICMS sobre este item, mas o valor de ICMS lançado é zero ou não foi informado.`,
        correcao: 'Recalcule a base e a alíquota de ICMS aplicável ao item e ajuste o valor lançado.',
        severidade: 'ALTA',
        pontosPerdidos: 7,
    }));
}
function regraIpiInconsistente(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => item.vIPI !== undefined && item.vIPI < 0)
        .map((item) => ({
        tipo: 'IPI',
        descricao: `Valor de IPI negativo em item${item.xProd ? ` "${item.xProd}"` : ''}.`,
        explicacao: 'O valor do IPI não pode ser negativo. Isso normalmente indica erro no cálculo da base ou da alíquota aplicada.',
        correcao: 'Revise a base de cálculo e a alíquota de IPI do item e corrija o valor lançado.',
        severidade: 'MEDIA',
        pontosPerdidos: 5,
    }));
}
function regraPisInconsistente(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => item.cstPis === '01' && item.vProd && item.vProd > 0 && !item.vPIS)
        .map((item) => ({
        tipo: 'PIS',
        descricao: `PIS não calculado para item tributável${item.xProd ? ` "${item.xProd}"` : ''}.`,
        explicacao: 'O CST de PIS informado (01 - Operação Tributável) indica incidência normal, mas nenhum valor de PIS foi calculado sobre o item.',
        correcao: 'Recalcule o PIS aplicando a alíquota vigente sobre a base de cálculo do produto.',
        severidade: 'MEDIA',
        pontosPerdidos: 4,
    }));
}
function regraCofinsInconsistente(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => item.cstCofins === '01' && item.vProd && item.vProd > 0 && !item.vCOFINS)
        .map((item) => ({
        tipo: 'COFINS',
        descricao: `COFINS não calculada para item tributável${item.xProd ? ` "${item.xProd}"` : ''}.`,
        explicacao: 'O CST de COFINS informado (01 - Operação Tributável) indica incidência normal, mas nenhum valor de COFINS foi calculado sobre o item.',
        correcao: 'Recalcule a COFINS aplicando a alíquota vigente sobre a base de cálculo do produto.',
        severidade: 'MEDIA',
        pontosPerdidos: 4,
    }));
}
function regraProdutoSemCfop(documento) {
    if (TIPOS_SEM_ITENS_PADRAO_NFE.has(documento.tipoDocumento))
        return [];
    return documento.itens
        .filter((item) => !item.cfop)
        .map((item) => ({
        tipo: 'CFOP',
        descricao: `Produto${item.xProd ? ` "${item.xProd}"` : ''} sem CFOP informado.`,
        explicacao: 'Todo item de um documento fiscal precisa de um CFOP para identificar a natureza da operação (venda, devolução, transferência, etc).',
        correcao: 'Informe o CFOP correspondente à natureza da operação para este item.',
        severidade: 'ALTA',
        pontosPerdidos: 6,
    }));
}
function regraCamposObrigatoriosAusentes(documento) {
    const erros = [];
    const camposObrigatorios = [
        { valor: documento.cnpj, nome: 'CNPJ do emitente', explicacao: 'O CNPJ do emitente é obrigatório para identificar a empresa responsável pela emissão do documento.' },
        { valor: documento.uf, nome: 'Estado (UF) do emitente', explicacao: 'A UF do emitente é necessária para determinar corretamente a tributação interestadual.' },
        { valor: documento.municipio, nome: 'Município do emitente', explicacao: 'O município do emitente compõe a identificação fiscal obrigatória do documento.' },
        { valor: documento.dataEmissao, nome: 'Data de emissão', explicacao: 'A data de emissão é obrigatória e utilizada para apuração de prazos fiscais.' },
        { valor: documento.numeroNota, nome: 'Número do documento', explicacao: 'O número do documento fiscal é obrigatório para sua identificação única.' },
        { valor: documento.serie, nome: 'Série do documento', explicacao: 'A série do documento fiscal é obrigatória e compõe sua identificação única junto ao número.' },
        { valor: documento.chaveAcesso, nome: 'Chave de acesso', explicacao: 'A chave de acesso de 44 dígitos é obrigatória para consulta e validação do documento junto à SEFAZ.' },
    ];
    for (const campo of camposObrigatorios) {
        if (!campo.valor) {
            erros.push({
                tipo: 'CADASTRAL',
                descricao: `Campo obrigatório ausente: ${campo.nome}.`,
                explicacao: campo.explicacao,
                correcao: `Verifique o XML de origem e garanta que o campo "${campo.nome}" esteja preenchido antes da transmissão.`,
                severidade: 'MEDIA',
                pontosPerdidos: 3,
            });
        }
    }
    return erros;
}
exports.TODAS_AS_REGRAS = [
    regraCfopIncompativel,
    regraCstInvalido,
    regraNcmVazio,
    regraProdutoSemTributacao,
    regraIcmsZerado,
    regraIpiInconsistente,
    regraPisInconsistente,
    regraCofinsInconsistente,
    regraProdutoSemCfop,
    regraCamposObrigatoriosAusentes,
];
//# sourceMappingURL=fiscal-rules.js.map