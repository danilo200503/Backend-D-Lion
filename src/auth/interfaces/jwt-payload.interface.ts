
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}


export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
