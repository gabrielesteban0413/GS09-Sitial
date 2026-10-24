import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: any) {
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

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: string, email: string) {
    const token = await this.jwt.signAsync({ sub: userId, email });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return { 
      accessToken: token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        isActive: user.isActive
      } 
    };
  }
}