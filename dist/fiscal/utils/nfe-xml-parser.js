"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrairDadosNfe = extrairDadosNfe;
const fast_xml_parser_1 = require("fast-xml-parser");
const parser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    parseAttributeValue: false,
});
function toNumber(valor) {
    if (valor === undefined || valor === null || valor === '')
        return undefined;
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
}
function toArray(valor) {
    if (valor === undefined || valor === null)
        return [];
    return Array.isArray(valor) ? valor : [valor];
}
function primeiroGrupo(objeto) {
    if (!objeto)
        return undefined;
    const chave = Object.keys(objeto)[0];
    return chave ? objeto[chave] : undefined;
}
function extrairDadosDeNfe(infNFe, protNFe, alertas) {
    const emit = infNFe.emit;
    const dest = infNFe.dest;
    const ide = infNFe.ide;
    const total = infNFe.total?.ICMSTot;
    const enderEmit = emit?.enderEmit;
    const empresa = emit?.xNome;
    const cnpj = (emit?.CNPJ ?? emit?.CPF);
    const numeroNota = ide?.nNF !== undefined ? String(ide.nNF) : undefined;
    const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
    const dataEmissao = (ide?.dhEmi ?? ide?.dEmi);
    const destinatario = dest?.xNome;
    const destinatarioCnpj = (dest?.CNPJ ?? dest?.CPF);
    const enderDest = dest?.enderDest;
    const destinatarioUf = enderDest?.UF;
    const indicadorIE = dest?.indIEDest !== undefined ? String(dest.indIEDest) : undefined;
    const municipio = enderEmit?.xMun;
    const uf = enderEmit?.UF;
    const valorTotal = toNumber(total?.vNF);
    const infProt = protNFe?.infProt;
    const idAttr = infNFe['@_Id'];
    const chaveAcesso = infProt?.chNFe ?? idAttr?.replace(/^NFe/i, '');
    if (!empresa)
        alertas.push('Não foi possível identificar o nome da empresa emitente.');
    if (!cnpj)
        alertas.push('Não foi possível identificar o CNPJ da empresa emitente.');
    if (!numeroNota)
        alertas.push('Não foi possível identificar o número da nota fiscal.');
    if (valorTotal === undefined)
        alertas.push('Não foi possível identificar o valor total da nota.');
    const impostos = [];
    const mapaImpostos = [
        ['ICMS', total?.vICMS],
        ['IPI', total?.vIPI],
        ['PIS', total?.vPIS],
        ['COFINS', total?.vCOFINS],
        ['ISS', total?.vISS],
    ];
    for (const [tipo, valorBruto] of mapaImpostos) {
        const valor = toNumber(valorBruto);
        if (valor !== undefined && valor > 0)
            impostos.push({ tipo, valor });
    }
    const detalhes = toArray(infNFe.det);
    const itens = detalhes.map((det) => {
        const prod = det.prod;
        const imposto = det.imposto;
        const icmsGrupo = primeiroGrupo(imposto?.ICMS);
        const pisGrupo = primeiroGrupo(imposto?.PIS);
        const cofinsGrupo = primeiroGrupo(imposto?.COFINS);
        const ipiGrupo = imposto?.IPI?.IPITrib;
        return {
            cProd: prod?.cProd,
            xProd: prod?.xProd,
            ncm: prod?.NCM,
            cfop: prod?.CFOP,
            cstIcms: icmsGrupo?.CST,
            cstPis: pisGrupo?.CST,
            cstCofins: cofinsGrupo?.CST,
            vProd: toNumber(prod?.vProd),
            vICMS: toNumber(icmsGrupo?.vICMS),
            vIPI: toNumber(ipiGrupo?.vIPI),
            vPIS: toNumber(pisGrupo?.vPIS),
            vCOFINS: toNumber(cofinsGrupo?.vCOFINS),
        };
    });
    return {
        empresa,
        cnpj,
        numeroNota,
        serie,
        chaveAcesso,
        dataEmissao,
        destinatario,
        destinatarioCnpj,
        destinatarioUf,
        indicadorIE,
        municipio,
        uf,
        valorTotal,
        impostos,
        itens,
    };
}
function extrairIcmsCte(icms) {
    if (!icms)
        return {};
    const chave = Object.keys(icms)[0];
    const grupo = chave ? icms[chave] : undefined;
    return { valor: toNumber(grupo?.vICMS), cst: grupo?.CST };
}
function extrairDadosDeCte(infCte, alertas) {
    const emit = infCte.emit;
    const dest = infCte.dest;
    const ide = infCte.ide;
    const vPrest = infCte.vPrest;
    const imp = infCte.imp;
    const enderEmit = emit?.enderEmit;
    const empresa = emit?.xNome;
    const cnpj = (emit?.CNPJ ?? emit?.CPF);
    const numeroNota = ide?.nCT !== undefined ? String(ide.nCT) : undefined;
    const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
    const dataEmissao = ide?.dhEmi;
    const destinatario = dest?.xNome;
    const destinatarioCnpj = (dest?.CNPJ ?? dest?.CPF);
    const enderDest = dest?.enderDest;
    const destinatarioUf = enderDest?.UF;
    const municipio = enderEmit?.xMun;
    const uf = enderEmit?.UF;
    const valorTotal = toNumber(vPrest?.vTPrest ?? vPrest?.vRec);
    const idAttr = infCte['@_Id'];
    const chaveAcesso = idAttr?.replace(/^CTe/i, '');
    if (!empresa)
        alertas.push('Não foi possível identificar o nome da empresa emitente.');
    if (!cnpj)
        alertas.push('Não foi possível identificar o CNPJ da empresa emitente.');
    if (!numeroNota)
        alertas.push('Não foi possível identificar o número do CT-e.');
    if (valorTotal === undefined)
        alertas.push('Não foi possível identificar o valor total do frete.');
    const { valor: valorIcms, cst: cstIcms } = extrairIcmsCte(imp?.ICMS);
    const impostos = [];
    if (valorIcms !== undefined && valorIcms > 0)
        impostos.push({ tipo: 'ICMS', valor: valorIcms });
    const itens = [
        {
            xProd: ide?.natOp,
            cfop: ide?.CFOP,
            cstIcms,
            vICMS: valorIcms,
        },
    ];
    return {
        empresa,
        cnpj,
        numeroNota,
        serie,
        chaveAcesso,
        dataEmissao,
        destinatario,
        destinatarioCnpj,
        destinatarioUf,
        municipio,
        uf,
        valorTotal,
        impostos,
        itens,
    };
}
function extrairDadosDeMdfe(infMDFe, protMDFe, alertas) {
    const ide = infMDFe.ide;
    const emit = infMDFe.emit;
    const tot = infMDFe.tot;
    const enderEmit = emit?.enderEmit;
    const infMunCarrega = ide?.infMunCarrega;
    const empresa = emit?.xNome;
    const cnpj = emit?.CNPJ;
    const numeroNota = ide?.nMDF !== undefined ? String(ide.nMDF) : undefined;
    const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
    const dataEmissao = ide?.dhEmi;
    const municipio = (infMunCarrega?.xMunCarrega ?? enderEmit?.xMun);
    const uf = (ide?.UFIni ?? enderEmit?.UF);
    const destinatarioUf = ide?.UFFim;
    const valorTotal = toNumber(tot?.vCarga);
    const infProt = protMDFe?.infProt;
    const idAttr = infMDFe['@_Id'];
    const chaveAcesso = infProt?.chMDFe ?? idAttr?.replace(/^MDFe/i, '');
    if (!empresa)
        alertas.push('Não foi possível identificar o nome da transportadora emitente.');
    if (!cnpj)
        alertas.push('Não foi possível identificar o CNPJ da transportadora emitente.');
    if (!numeroNota)
        alertas.push('Não foi possível identificar o número do MDF-e.');
    if (valorTotal === undefined)
        alertas.push('Não foi possível identificar o valor total da carga.');
    const qNFe = toNumber(tot?.qNFe) ?? 0;
    const qCTe = toNumber(tot?.qCTe) ?? 0;
    const itens = [
        {
            xProd: `Manifesto com ${qNFe} NF-e e ${qCTe} CT-e vinculados`,
            vProd: valorTotal,
        },
    ];
    return {
        empresa,
        cnpj,
        numeroNota,
        serie,
        chaveAcesso,
        dataEmissao,
        destinatarioUf,
        municipio,
        uf,
        valorTotal,
        impostos: [],
        itens,
    };
}
function extrairDadosDeNfseNacional(infNFSe, alertas) {
    const dps = infNFSe.DPS;
    const infDPS = (dps?.infDPS ?? dps);
    const prest = infDPS?.prest;
    const toma = infDPS?.toma;
    const valoresDps = infDPS?.valores;
    const valoresNfse = infNFSe.valores;
    const serv = infDPS?.serv;
    const vServPrest = valoresDps?.vServPrest;
    const trib = valoresDps?.trib;
    const tribFed = trib?.tribFed;
    const empresa = (prest?.xNome ?? prest?.xFant);
    const cnpj = (prest?.CNPJ ?? prest?.CPF);
    const numeroNota = (infNFSe.nNFSe ?? infDPS?.nDPS);
    const serie = infDPS?.serie;
    const dataEmissao = (infNFSe.dhProc ?? infDPS?.dhEmi);
    const destinatario = toma?.xNome;
    const destinatarioCnpj = (toma?.CNPJ ?? toma?.CPF);
    const valorTotal = toNumber(vServPrest?.vServ);
    const chaveAcesso = (infNFSe.chNFSe ?? infNFSe['@_Id']);
    if (!empresa)
        alertas.push('Não foi possível identificar o nome do prestador de serviço.');
    if (!cnpj)
        alertas.push('Não foi possível identificar o CNPJ/CPF do prestador de serviço.');
    if (!numeroNota)
        alertas.push('Não foi possível identificar o número da NFS-e.');
    if (valorTotal === undefined)
        alertas.push('Não foi possível identificar o valor do serviço prestado.');
    const impostos = [];
    const vISSQN = toNumber(valoresNfse?.vISSQN);
    if (vISSQN !== undefined && vISSQN > 0)
        impostos.push({ tipo: 'ISSQN', valor: vISSQN });
    const vRetCP = toNumber(tribFed?.vRetCP);
    if (vRetCP !== undefined && vRetCP > 0)
        impostos.push({ tipo: 'CP (retido)', valor: vRetCP });
    const vRetIRRF = toNumber(tribFed?.vRetIRRF);
    if (vRetIRRF !== undefined && vRetIRRF > 0)
        impostos.push({ tipo: 'IRRF (retido)', valor: vRetIRRF });
    const vRetCSLL = toNumber(tribFed?.vRetCSLL);
    if (vRetCSLL !== undefined && vRetCSLL > 0)
        impostos.push({ tipo: 'CSLL (retido)', valor: vRetCSLL });
    const itens = [
        {
            xProd: (serv?.xDiscriminacao ?? serv?.cTribNac),
            vProd: valorTotal,
        },
    ];
    return {
        empresa,
        cnpj,
        numeroNota,
        serie,
        chaveAcesso,
        dataEmissao,
        destinatario,
        destinatarioCnpj,
        valorTotal,
        impostos,
        itens,
    };
}
function extrairDadosDeNfseLegado(raiz, alertas) {
    const compNfse = (raiz.CompNfse ?? raiz.ConsultarNfseResposta ?? raiz);
    const nfse = (compNfse.Nfse ?? compNfse.NotaFiscal ?? compNfse);
    const infNfse = (nfse?.InfNfse ?? nfse);
    if (!infNfse)
        return null;
    const declaracao = infNfse.DeclaracaoPrestacaoServico
        ?.InfDeclaracaoPrestacaoServico;
    const prestadorServico = (declaracao?.Prestador ?? infNfse.PrestadorServico ?? infNfse.Prestador);
    const tomadorServico = (declaracao?.Tomador ?? infNfse.TomadorServico ?? infNfse.Tomador);
    const servico = (declaracao?.Servico ?? infNfse.Servico);
    const valores = (servico?.Valores ?? infNfse.ValoresNfse ?? infNfse.Valores);
    const identificacaoPrestador = prestadorServico?.IdentificacaoPrestador;
    const identificacaoTomador = tomadorServico?.IdentificacaoTomador;
    const empresa = (prestadorServico?.RazaoSocial ?? prestadorServico?.NomeFantasia);
    const cnpj = (identificacaoPrestador?.Cnpj ?? prestadorServico?.Cnpj);
    const numeroNota = (infNfse.Numero ?? nfse?.Numero);
    const dataEmissao = (infNfse.DataEmissao ?? declaracao?.Competencia);
    const destinatario = (tomadorServico?.RazaoSocial ?? identificacaoTomador?.RazaoSocial);
    const destinatarioCnpj = identificacaoTomador?.CpfCnpj;
    const valorTotal = toNumber(valores?.ValorServicos ?? valores?.ValorLiquidoNfse);
    const chaveAcesso = (infNfse.CodigoVerificacao ?? infNfse['@_Id']);
    if (!empresa)
        alertas.push('Não foi possível identificar o nome do prestador de serviço.');
    if (!cnpj)
        alertas.push('Não foi possível identificar o CNPJ do prestador de serviço.');
    if (!numeroNota)
        alertas.push('Não foi possível identificar o número da NFS-e.');
    if (valorTotal === undefined)
        alertas.push('Não foi possível identificar o valor do serviço prestado.');
    alertas.push('Este documento parece usar um layout municipal de NFS-e anterior ao padrão nacional; alguns campos podem não ter sido reconhecidos.');
    const impostos = [];
    const vIss = toNumber(valores?.ValorIss ?? valores?.Iss);
    if (vIss !== undefined && vIss > 0)
        impostos.push({ tipo: 'ISSQN', valor: vIss });
    const itens = [
        {
            xProd: (servico?.Discriminacao ?? servico?.ItemListaServico),
            vProd: valorTotal,
        },
    ];
    return {
        empresa,
        cnpj,
        numeroNota,
        chaveAcesso,
        dataEmissao,
        destinatario,
        destinatarioCnpj,
        valorTotal,
        impostos,
        itens,
    };
}
function extrairDadosNfe(xmlContent) {
    const alertas = [];
    const json = parser.parse(xmlContent);
    const nfeProc = json?.nfeProc ?? json;
    const infNFe = nfeProc?.NFe?.infNFe ?? nfeProc?.infNFe;
    if (infNFe) {
        const dados = extrairDadosDeNfe(infNFe, nfeProc?.protNFe, alertas);
        if (dados.impostos.length === 0) {
            alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
        }
        const ide = infNFe.ide;
        const modelo = ide?.mod !== undefined ? String(ide.mod) : undefined;
        const tipoDocumento = modelo === '65' ? 'NFCE' : 'NFE';
        return { tipoDocumento, ...dados, alertas };
    }
    const cteProc = json?.cteProc ?? json;
    const infCte = cteProc?.CTe?.infCte ?? cteProc?.infCte;
    if (infCte) {
        const dados = extrairDadosDeCte(infCte, alertas);
        if (dados.impostos.length === 0) {
            alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
        }
        return { tipoDocumento: 'CTE', ...dados, alertas };
    }
    const mdfeProc = json?.mdfeProc ?? json;
    const infMDFe = mdfeProc?.MDFe?.infMDFe ?? mdfeProc?.infMDFe;
    if (infMDFe) {
        const dados = extrairDadosDeMdfe(infMDFe, mdfeProc?.protMDFe, alertas);
        return { tipoDocumento: 'MDFE', ...dados, alertas };
    }
    const nfSeNacional = json?.NFSe ?? json?.nfse;
    const infNFSe = nfSeNacional?.infNFSe ?? nfSeNacional?.InfNFSe;
    if (infNFSe) {
        const dados = extrairDadosDeNfseNacional(infNFSe, alertas);
        if (dados.impostos.length === 0) {
            alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
        }
        return { tipoDocumento: 'NFSE', ...dados, alertas };
    }
    const dadosLegado = extrairDadosDeNfseLegado(json ?? {}, alertas);
    if (dadosLegado) {
        return { tipoDocumento: 'NFSE', ...dadosLegado, alertas };
    }
    throw new Error('Formato de XML não reconhecido. O D-LION atualmente processa NFe, NFC-e, CT-e, MDF-e e NFS-e (padrão nacional e os layouts municipais mais comuns).');
}
//# sourceMappingURL=nfe-xml-parser.js.map