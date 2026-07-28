import { XMLParser } from 'fast-xml-parser';

export interface ImpostoExtraido {
  tipo: string;
  valor: number;
}

export interface ItemFiscalExtraido {
  cProd?: string;
  xProd?: string;
  ncm?: string;
  cfop?: string;
  cstIcms?: string;
  cstPis?: string;
  cstCofins?: string;
  vProd?: number;
  vICMS?: number;
  vIPI?: number;
  vPIS?: number;
  vCOFINS?: number;
}

export interface DadosNfeExtraidos {
  tipoDocumento: 'NFE' | 'NFCE' | 'CTE' | 'MDFE' | 'NFSE';
  empresa?: string;
  cnpj?: string;
  numeroNota?: string;
  serie?: string;
  chaveAcesso?: string;
  dataEmissao?: string;
  destinatario?: string;
  destinatarioCnpj?: string;
  destinatarioUf?: string;
  municipio?: string;
  uf?: string;
  indicadorIE?: string;
  valorTotal?: number;
  impostos: ImpostoExtraido[];
  itens: ItemFiscalExtraido[];
  alertas: string[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  
  
  
  
  
  parseTagValue: false,
  parseAttributeValue: false,
});

function toNumber(valor: unknown): number | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

/** Normaliza um campo que pode vir como objeto único ou array (comportamento padrão de XML com tags repetidas). */
function toArray<T>(valor: T | T[] | undefined): T[] {
  if (valor === undefined || valor === null) return [];
  return Array.isArray(valor) ? valor : [valor];
}

/** Retorna o primeiro grupo (qualquer que seja a chave, ex.: ICMS00, ICMS20...) de um objeto de imposto. */
function primeiroGrupo(objeto: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!objeto) return undefined;
  const chave = Object.keys(objeto)[0];
  return chave ? (objeto[chave] as Record<string, unknown>) : undefined;
}

/** Extrai dados de uma NFe (Nota Fiscal Eletrônica) — modelo 55. */
function extrairDadosDeNfe(
  infNFe: Record<string, unknown>,
  protNFe: Record<string, unknown> | undefined,
  alertas: string[]
): Omit<DadosNfeExtraidos, 'alertas' | 'tipoDocumento'> {
  const emit = infNFe.emit as Record<string, unknown> | undefined;
  const dest = infNFe.dest as Record<string, unknown> | undefined;
  const ide = infNFe.ide as Record<string, unknown> | undefined;
  const total = (infNFe.total as Record<string, unknown> | undefined)?.ICMSTot as
    | Record<string, unknown>
    | undefined;
  const enderEmit = emit?.enderEmit as Record<string, unknown> | undefined;

  const empresa = emit?.xNome as string | undefined;
  const cnpj = (emit?.CNPJ ?? emit?.CPF) as string | undefined;
  const numeroNota = ide?.nNF !== undefined ? String(ide.nNF) : undefined;
  const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
  const dataEmissao = (ide?.dhEmi ?? ide?.dEmi) as string | undefined;
  const destinatario = dest?.xNome as string | undefined;
  const destinatarioCnpj = (dest?.CNPJ ?? dest?.CPF) as string | undefined;
  const enderDest = dest?.enderDest as Record<string, unknown> | undefined;
  const destinatarioUf = enderDest?.UF as string | undefined;
  const indicadorIE = dest?.indIEDest !== undefined ? String(dest.indIEDest) : undefined;
  const municipio = enderEmit?.xMun as string | undefined;
  const uf = enderEmit?.UF as string | undefined;
  const valorTotal = toNumber(total?.vNF);

  const infProt = protNFe?.infProt as Record<string, unknown> | undefined;
  const idAttr = infNFe['@_Id'] as string | undefined;
  const chaveAcesso = (infProt?.chNFe as string | undefined) ?? idAttr?.replace(/^NFe/i, '');

  if (!empresa) alertas.push('Não foi possível identificar o nome da empresa emitente.');
  if (!cnpj) alertas.push('Não foi possível identificar o CNPJ da empresa emitente.');
  if (!numeroNota) alertas.push('Não foi possível identificar o número da nota fiscal.');
  if (valorTotal === undefined) alertas.push('Não foi possível identificar o valor total da nota.');

  const impostos: ImpostoExtraido[] = [];
  const mapaImpostos: Array<[string, unknown]> = [
    ['ICMS', total?.vICMS],
    ['IPI', total?.vIPI],
    ['PIS', total?.vPIS],
    ['COFINS', total?.vCOFINS],
    ['ISS', total?.vISS],
  ];
  for (const [tipo, valorBruto] of mapaImpostos) {
    const valor = toNumber(valorBruto);
    if (valor !== undefined && valor > 0) impostos.push({ tipo, valor });
  }

  const detalhes = toArray(infNFe.det as Record<string, unknown> | Record<string, unknown>[]);
  const itens: ItemFiscalExtraido[] = detalhes.map((det) => {
    const prod = det.prod as Record<string, unknown> | undefined;
    const imposto = det.imposto as Record<string, unknown> | undefined;
    const icmsGrupo = primeiroGrupo(imposto?.ICMS as Record<string, unknown> | undefined);
    const pisGrupo = primeiroGrupo(imposto?.PIS as Record<string, unknown> | undefined);
    const cofinsGrupo = primeiroGrupo(imposto?.COFINS as Record<string, unknown> | undefined);
    const ipiGrupo = (imposto?.IPI as Record<string, unknown> | undefined)?.IPITrib as
      | Record<string, unknown>
      | undefined;

    return {
      cProd: prod?.cProd as string | undefined,
      xProd: prod?.xProd as string | undefined,
      ncm: prod?.NCM as string | undefined,
      cfop: prod?.CFOP as string | undefined,
      cstIcms: icmsGrupo?.CST as string | undefined,
      cstPis: pisGrupo?.CST as string | undefined,
      cstCofins: cofinsGrupo?.CST as string | undefined,
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

function extrairIcmsCte(icms: Record<string, unknown> | undefined): { valor?: number; cst?: string } {
  if (!icms) return {};
  const chave = Object.keys(icms)[0];
  const grupo = chave ? (icms[chave] as Record<string, unknown>) : undefined;
  return { valor: toNumber(grupo?.vICMS), cst: grupo?.CST as string | undefined };
}

function extrairDadosDeCte(
  infCte: Record<string, unknown>,
  alertas: string[]
): Omit<DadosNfeExtraidos, 'alertas' | 'tipoDocumento'> {
  const emit = infCte.emit as Record<string, unknown> | undefined;
  const dest = infCte.dest as Record<string, unknown> | undefined;
  const ide = infCte.ide as Record<string, unknown> | undefined;
  const vPrest = infCte.vPrest as Record<string, unknown> | undefined;
  const imp = infCte.imp as Record<string, unknown> | undefined;
  const enderEmit = emit?.enderEmit as Record<string, unknown> | undefined;

  const empresa = emit?.xNome as string | undefined;
  const cnpj = (emit?.CNPJ ?? emit?.CPF) as string | undefined;
  const numeroNota = ide?.nCT !== undefined ? String(ide.nCT) : undefined;
  const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
  const dataEmissao = ide?.dhEmi as string | undefined;
  const destinatario = dest?.xNome as string | undefined;
  const destinatarioCnpj = (dest?.CNPJ ?? dest?.CPF) as string | undefined;
  const enderDest = dest?.enderDest as Record<string, unknown> | undefined;
  const destinatarioUf = enderDest?.UF as string | undefined;
  const municipio = enderEmit?.xMun as string | undefined;
  const uf = enderEmit?.UF as string | undefined;
  const valorTotal = toNumber(vPrest?.vTPrest ?? vPrest?.vRec);
  const idAttr = infCte['@_Id'] as string | undefined;
  const chaveAcesso = idAttr?.replace(/^CTe/i, '');

  if (!empresa) alertas.push('Não foi possível identificar o nome da empresa emitente.');
  if (!cnpj) alertas.push('Não foi possível identificar o CNPJ da empresa emitente.');
  if (!numeroNota) alertas.push('Não foi possível identificar o número do CT-e.');
  if (valorTotal === undefined) alertas.push('Não foi possível identificar o valor total do frete.');

  const { valor: valorIcms, cst: cstIcms } = extrairIcmsCte(imp?.ICMS as Record<string, unknown> | undefined);
  const impostos: ImpostoExtraido[] = [];
  if (valorIcms !== undefined && valorIcms > 0) impostos.push({ tipo: 'ICMS', valor: valorIcms });

  
  
  const itens: ItemFiscalExtraido[] = [
    {
      xProd: ide?.natOp as string | undefined,
      cfop: ide?.CFOP as string | undefined,
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

function extrairDadosDeMdfe(
  infMDFe: Record<string, unknown>,
  protMDFe: Record<string, unknown> | undefined,
  alertas: string[]
): Omit<DadosNfeExtraidos, 'alertas' | 'tipoDocumento'> {
  const ide = infMDFe.ide as Record<string, unknown> | undefined;
  const emit = infMDFe.emit as Record<string, unknown> | undefined;
  const tot = infMDFe.tot as Record<string, unknown> | undefined;
  const enderEmit = emit?.enderEmit as Record<string, unknown> | undefined;
  const infMunCarrega = ide?.infMunCarrega as Record<string, unknown> | undefined;

  const empresa = emit?.xNome as string | undefined;
  const cnpj = emit?.CNPJ as string | undefined;
  const numeroNota = ide?.nMDF !== undefined ? String(ide.nMDF) : undefined;
  const serie = ide?.serie !== undefined ? String(ide.serie) : undefined;
  const dataEmissao = ide?.dhEmi as string | undefined;
  const municipio = (infMunCarrega?.xMunCarrega ?? enderEmit?.xMun) as string | undefined;
  const uf = (ide?.UFIni ?? enderEmit?.UF) as string | undefined;
  const destinatarioUf = ide?.UFFim as string | undefined;
  const valorTotal = toNumber(tot?.vCarga);

  const infProt = protMDFe?.infProt as Record<string, unknown> | undefined;
  const idAttr = infMDFe['@_Id'] as string | undefined;
  const chaveAcesso = (infProt?.chMDFe as string | undefined) ?? idAttr?.replace(/^MDFe/i, '');

  if (!empresa) alertas.push('Não foi possível identificar o nome da transportadora emitente.');
  if (!cnpj) alertas.push('Não foi possível identificar o CNPJ da transportadora emitente.');
  if (!numeroNota) alertas.push('Não foi possível identificar o número do MDF-e.');
  if (valorTotal === undefined) alertas.push('Não foi possível identificar o valor total da carga.');

  const qNFe = toNumber(tot?.qNFe) ?? 0;
  const qCTe = toNumber(tot?.qCTe) ?? 0;

  const itens: ItemFiscalExtraido[] = [
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

function extrairDadosDeNfseNacional(
  infNFSe: Record<string, unknown>,
  alertas: string[]
): Omit<DadosNfeExtraidos, 'alertas' | 'tipoDocumento'> {
  const dps = infNFSe.DPS as Record<string, unknown> | undefined;
  const infDPS = (dps?.infDPS ?? dps) as Record<string, unknown> | undefined;

  const prest = infDPS?.prest as Record<string, unknown> | undefined;
  const toma = infDPS?.toma as Record<string, unknown> | undefined;
  const valoresDps = infDPS?.valores as Record<string, unknown> | undefined;
  const valoresNfse = infNFSe.valores as Record<string, unknown> | undefined;
  const serv = infDPS?.serv as Record<string, unknown> | undefined;

  const vServPrest = valoresDps?.vServPrest as Record<string, unknown> | undefined;
  const trib = valoresDps?.trib as Record<string, unknown> | undefined;
  const tribFed = trib?.tribFed as Record<string, unknown> | undefined;

  const empresa = (prest?.xNome ?? prest?.xFant) as string | undefined;
  const cnpj = (prest?.CNPJ ?? prest?.CPF) as string | undefined;
  const numeroNota = (infNFSe.nNFSe ?? infDPS?.nDPS) as string | undefined;
  const serie = infDPS?.serie as string | undefined;
  const dataEmissao = (infNFSe.dhProc ?? infDPS?.dhEmi) as string | undefined;
  const destinatario = toma?.xNome as string | undefined;
  const destinatarioCnpj = (toma?.CNPJ ?? toma?.CPF) as string | undefined;
  const valorTotal = toNumber(vServPrest?.vServ);
  const chaveAcesso = (infNFSe.chNFSe ?? infNFSe['@_Id']) as string | undefined;

  if (!empresa) alertas.push('Não foi possível identificar o nome do prestador de serviço.');
  if (!cnpj) alertas.push('Não foi possível identificar o CNPJ/CPF do prestador de serviço.');
  if (!numeroNota) alertas.push('Não foi possível identificar o número da NFS-e.');
  if (valorTotal === undefined) alertas.push('Não foi possível identificar o valor do serviço prestado.');

  const impostos: ImpostoExtraido[] = [];
  const vISSQN = toNumber(valoresNfse?.vISSQN);
  if (vISSQN !== undefined && vISSQN > 0) impostos.push({ tipo: 'ISSQN', valor: vISSQN });

  const vRetCP = toNumber(tribFed?.vRetCP);
  if (vRetCP !== undefined && vRetCP > 0) impostos.push({ tipo: 'CP (retido)', valor: vRetCP });

  const vRetIRRF = toNumber(tribFed?.vRetIRRF);
  if (vRetIRRF !== undefined && vRetIRRF > 0) impostos.push({ tipo: 'IRRF (retido)', valor: vRetIRRF });

  const vRetCSLL = toNumber(tribFed?.vRetCSLL);
  if (vRetCSLL !== undefined && vRetCSLL > 0) impostos.push({ tipo: 'CSLL (retido)', valor: vRetCSLL });

  const itens: ItemFiscalExtraido[] = [
    {
      xProd: (serv?.xDiscriminacao ?? serv?.cTribNac) as string | undefined,
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

function extrairDadosDeNfseLegado(
  raiz: Record<string, unknown>,
  alertas: string[]
): Omit<DadosNfeExtraidos, 'alertas' | 'tipoDocumento'> | null {
  const compNfse = (raiz.CompNfse ?? raiz.ConsultarNfseResposta ?? raiz) as Record<string, unknown>;
  const nfse = (compNfse.Nfse ?? compNfse.NotaFiscal ?? compNfse) as Record<string, unknown> | undefined;
  const infNfse = (nfse?.InfNfse ?? nfse) as Record<string, unknown> | undefined;

  if (!infNfse) return null;

  const declaracao = (infNfse.DeclaracaoPrestacaoServico as Record<string, unknown> | undefined)
    ?.InfDeclaracaoPrestacaoServico as Record<string, unknown> | undefined;

  const prestadorServico = (declaracao?.Prestador ?? infNfse.PrestadorServico ?? infNfse.Prestador) as
    | Record<string, unknown>
    | undefined;
  const tomadorServico = (declaracao?.Tomador ?? infNfse.TomadorServico ?? infNfse.Tomador) as
    | Record<string, unknown>
    | undefined;
  const servico = (declaracao?.Servico ?? infNfse.Servico) as Record<string, unknown> | undefined;
  const valores = (servico?.Valores ?? infNfse.ValoresNfse ?? infNfse.Valores) as
    | Record<string, unknown>
    | undefined;
  const identificacaoPrestador = prestadorServico?.IdentificacaoPrestador as
    | Record<string, unknown>
    | undefined;
  const identificacaoTomador = tomadorServico?.IdentificacaoTomador as
    | Record<string, unknown>
    | undefined;

  const empresa = (prestadorServico?.RazaoSocial ?? prestadorServico?.NomeFantasia) as
    | string
    | undefined;
  const cnpj = (identificacaoPrestador?.Cnpj ?? prestadorServico?.Cnpj) as string | undefined;
  const numeroNota = (infNfse.Numero ?? nfse?.Numero) as string | undefined;
  const dataEmissao = (infNfse.DataEmissao ?? declaracao?.Competencia) as string | undefined;
  const destinatario = (tomadorServico?.RazaoSocial ?? identificacaoTomador?.RazaoSocial) as
    | string
    | undefined;
  const destinatarioCnpj = identificacaoTomador?.CpfCnpj as string | undefined;
  const valorTotal = toNumber(valores?.ValorServicos ?? valores?.ValorLiquidoNfse);
  const chaveAcesso = (infNfse.CodigoVerificacao ?? infNfse['@_Id']) as string | undefined;

  if (!empresa) alertas.push('Não foi possível identificar o nome do prestador de serviço.');
  if (!cnpj) alertas.push('Não foi possível identificar o CNPJ do prestador de serviço.');
  if (!numeroNota) alertas.push('Não foi possível identificar o número da NFS-e.');
  if (valorTotal === undefined) alertas.push('Não foi possível identificar o valor do serviço prestado.');
  alertas.push(
    'Este documento parece usar um layout municipal de NFS-e anterior ao padrão nacional; alguns campos podem não ter sido reconhecidos.'
  );

  const impostos: ImpostoExtraido[] = [];
  const vIss = toNumber(valores?.ValorIss ?? valores?.Iss);
  if (vIss !== undefined && vIss > 0) impostos.push({ tipo: 'ISSQN', valor: vIss });

  const itens: ItemFiscalExtraido[] = [
    {
      xProd: (servico?.Discriminacao ?? servico?.ItemListaServico) as string | undefined,
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

function extrairDeUmaRaiz(raiz: Record<string, unknown>): DadosNfeExtraidos | null {
  const alertas: string[] = [];

  const nfeProc = (raiz.nfeProc ?? raiz) as Record<string, unknown>;
  const nfeWrapper = nfeProc.NFe as Record<string, unknown> | undefined;
  const infNFe = (nfeWrapper?.infNFe ?? nfeProc.infNFe) as Record<string, unknown> | undefined;

  if (infNFe) {
    const dados = extrairDadosDeNfe(infNFe, nfeProc.protNFe as Record<string, unknown> | undefined, alertas);
    if (dados.impostos.length === 0) {
      alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
    }
    const ide = infNFe.ide as Record<string, unknown> | undefined;
    const modelo = ide?.mod !== undefined ? String(ide.mod) : undefined;
    const tipoDocumento = modelo === '65' ? 'NFCE' : 'NFE';
    return { tipoDocumento, ...dados, alertas };
  }

  const cteProc = (raiz.cteProc ?? raiz) as Record<string, unknown>;
  const cteWrapper = cteProc.CTe as Record<string, unknown> | undefined;
  const infCte = (cteWrapper?.infCte ?? cteProc.infCte) as Record<string, unknown> | undefined;

  if (infCte) {
    const dados = extrairDadosDeCte(infCte, alertas);
    if (dados.impostos.length === 0) {
      alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
    }
    return { tipoDocumento: 'CTE', ...dados, alertas };
  }

  const mdfeProc = (raiz.mdfeProc ?? raiz) as Record<string, unknown>;
  const mdfeWrapper = mdfeProc.MDFe as Record<string, unknown> | undefined;
  const infMDFe = (mdfeWrapper?.infMDFe ?? mdfeProc.infMDFe) as Record<string, unknown> | undefined;

  if (infMDFe) {
    const dados = extrairDadosDeMdfe(infMDFe, mdfeProc.protMDFe as Record<string, unknown> | undefined, alertas);
    return { tipoDocumento: 'MDFE', ...dados, alertas };
  }

  const nfSeNacional = (raiz.NFSe ?? raiz.nfse) as Record<string, unknown> | undefined;
  const infNFSe = (nfSeNacional?.infNFSe ?? nfSeNacional?.InfNFSe) as Record<string, unknown> | undefined;

  if (infNFSe) {
    const dados = extrairDadosDeNfseNacional(infNFSe, alertas);
    if (dados.impostos.length === 0) {
      alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
    }
    return { tipoDocumento: 'NFSE', ...dados, alertas };
  }

  const dadosLegado = extrairDadosDeNfseLegado(raiz, alertas);
  if (dadosLegado) {
    return { tipoDocumento: 'NFSE', ...dadosLegado, alertas };
  }

  return null;
}

export function extrairDadosNfe(xmlContent: string): DadosNfeExtraidos[] {
  const json = parser.parse(xmlContent);

  const loteNFe = json?.enviNFe?.NFe;
  const loteCTe = json?.enviCTe?.CTe;
  const loteMDFe = json?.enviMDFe?.MDFe;

  if (loteNFe) {
    return toArray(loteNFe)
      .map((item) => extrairDeUmaRaiz({ NFe: item }))
      .filter((dados): dados is DadosNfeExtraidos => dados !== null);
  }

  if (loteCTe) {
    return toArray(loteCTe)
      .map((item) => extrairDeUmaRaiz({ CTe: item }))
      .filter((dados): dados is DadosNfeExtraidos => dados !== null);
  }

  if (loteMDFe) {
    return toArray(loteMDFe)
      .map((item) => extrairDeUmaRaiz({ MDFe: item }))
      .filter((dados): dados is DadosNfeExtraidos => dados !== null);
  }

  const nfeProcArray = json?.nfeProc;
  if (Array.isArray(nfeProcArray)) {
    return nfeProcArray
      .map((item) => extrairDeUmaRaiz({ nfeProc: item }))
      .filter((dados): dados is DadosNfeExtraidos => dados !== null);
  }

  const dados = extrairDeUmaRaiz(json ?? {});

  if (dados) {
    return [dados];
  }

  throw new Error(
    'Formato de XML não reconhecido. O D-LION atualmente processa NFe, NFC-e, CT-e, MDF-e e NFS-e (padrão nacional e os layouts municipais mais comuns).'
  );
}
