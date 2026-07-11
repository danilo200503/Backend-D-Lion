
export interface DashboardAgregado {
  totalUsuarios: number;
  totalEmpresas: number;
  empresas: string[];
  ultimosUploads: { id: string; nomeArquivo: string; usuario: string; criadoEm: Date }[];
  ultimosLogins: { usuario: string; email: string; ultimoLogin: Date }[];
}
