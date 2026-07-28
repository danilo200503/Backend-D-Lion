export declare class EmpresaAutenticadaDto {
    id: string;
    name: string;
    cnpj: string;
}
export declare class UsuarioAutenticadoDto {
    id: string;
    nome: string;
    email: string;
    company: EmpresaAutenticadaDto;
    permissoes: string[];
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    usuario: UsuarioAutenticadoDto;
}
