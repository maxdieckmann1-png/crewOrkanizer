export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: TokenResponseDto;
}
