export interface JwtPayload {
  sub: number;
  login: string;
  role: string;
  iat?: number;
  exp?: number;
}
