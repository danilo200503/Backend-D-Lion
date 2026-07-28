export declare class UploadRecenteDto {
    id: string;
    nomeArquivo: string;
    usuario: string;
    criadoEm: Date;
}
export declare class LoginRecenteDto {
    usuario: string;
    email: string;
    ultimoLogin: Date;
}
export declare class DashboardResumoDto {
    totalUsuarios: number;
    totalEmpresas: number;
    totalXmlEnviados: number;
    totalAnalises: number;
    totalPendencias: number;
    empresas: string[];
    ultimosUploads: UploadRecenteDto[];
    ultimosLogins: LoginRecenteDto[];
}
