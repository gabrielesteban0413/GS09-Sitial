export class UserDto {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}
