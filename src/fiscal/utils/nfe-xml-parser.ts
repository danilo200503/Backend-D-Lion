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
  tipoDocumento: 'NFE' | 'CTE';
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

export function extrairDadosNfe(xmlContent: string): DadosNfeExtraidos {
  const alertas: string[] = [];
  const json = parser.parse(xmlContent);

  
  const nfeProc = json?.nfeProc ?? json;
  const infNFe = nfeProc?.NFe?.infNFe ?? nfeProc?.infNFe;

  if (infNFe) {
    const dados = extrairDadosDeNfe(infNFe, nfeProc?.protNFe, alertas);
    if (dados.impostos.length === 0) {
      alertas.push('Nenhum imposto foi identificado automaticamente neste documento.');
    }
    return { tipoDocumento: 'NFE', ...dados, alertas };
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

  throw new Error(
    'Formato de XML não reconhecido. O D-LION atualmente processa NFe (Nota Fiscal Eletrônica) e CTe (Conhecimento de Transporte Eletrônico).'
  );
}
