import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function isValidAvatar(avatarUrl: string): boolean {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(avatarUrl);
  if (!match) return false;

  const [, mimeType, encodedImage] = match;
  const image = Buffer.from(encodedImage, 'base64');
  if (image.length === 0 || image.length > MAX_AVATAR_BYTES) return false;

  if (mimeType === 'jpeg') {
    return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }
  if (mimeType === 'png') {
    return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return image.length >= 12
    && image.toString('ascii', 0, 4) === 'RIFF'
    && image.toString('ascii', 8, 12) === 'WEBP';
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { 
        email: dto.email, 
        passwordHash: hash, 
        fullName: dto.fullName,
        isActive: true
      },
    });
    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: string, email: string) {
    const token = await this.jwt.signAsync({ sub: userId, email });
    const user = await this.getProfile(userId);
    return { accessToken: token, user };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, avatarUrl: true, isActive: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const hasCurrentPassword = Boolean(dto.currentPassword);
    const hasNewPassword = Boolean(dto.newPassword);
    if (hasCurrentPassword !== hasNewPassword) {
      throw new BadRequestException('Debes proporcionar la contraseña actual y la nueva contraseña.');
    }
    if (dto.fullName === undefined && dto.avatarUrl === undefined && !hasCurrentPassword) {
      throw new BadRequestException('No hay cambios para guardar.');
    }
    if (dto.fullName && dto.fullName.trim().length < 2) {
      throw new BadRequestException('El nombre debe tener al menos 2 caracteres.');
    }
    if (typeof dto.avatarUrl === 'string' && !isValidAvatar(dto.avatarUrl)) {
      throw new BadRequestException('La foto debe ser JPEG, PNG o WebP y no superar 2 MB.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const data: { fullName?: string; avatarUrl?: string | null; passwordHash?: string } = {};
    if (dto.fullName) data.fullName = dto.fullName.trim();
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.currentPassword && dto.newPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('La contraseña actual no es correcta.');
      }
      data.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, fullName: true, avatarUrl: true, isActive: true, createdAt: true },
    });
    return updated;
  }
}