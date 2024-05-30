import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async login(username: string, password: string): Promise<AuthEntity> {
        // step 1: fetch user with email
        const user = await this.prisma.user.findUnique({ where: { email: username } });

        // If no user, throw error
        if (!user) {
            throw new NotFoundException(`No user found for email: ${username}`);
        }

        // step 2: Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If password does not match, throw error
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        // step 3: Generate a JWT containging the user's ID and return it
        return {
            accessToken: this.jwtService.sign({ userId: user.id, username: user.email })
        }
    }
}
