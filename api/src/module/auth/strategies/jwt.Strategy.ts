// A nestjs authentication file that tells my app how read, verify  and trust jwt tokens sent by the client
// It's job is to protect our api routes

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'



@Injectable()

export class JWTStrategy extends PassportStrategy(Strategy){


    constructor( 
        private prisma: PrismaService,
        private configService: ConfigService    
    ){

        // Super is used here to extend the JWTStrategy class, then run the methods in the super 
        // Without calling super jwt auth won't work
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrkey: configService.get<string>('JWT_SECRET')
        });    
    }

    // Validate JWT payload
    async validate(payload: {sub: string; email:string}) {
        
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub},
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updateAt: true,
                password: false,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}







// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" to generate a random hash for password