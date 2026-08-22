


// Refresh token strategy

import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from 'passport-jwt'
import { PrismaService } from "src/prisma/prisma.service";
import { ExtractJwt} from 'passport-jwt'
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt' 





@Injectable()

export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService, 
        private prisma: PrismaService
    ){
        /**
         * Here super is used to temm passprt-jwt to extract the bearer token from request header 
         * To also reject expired tokens
         * And to verify the token using a secret
         * The passRequestToCallback: true ensures the full http is passed
         */
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passRequestToCallback: true,
        })
    }

    // validate refresh token
    // This is the core verification step of the refresh token strategy in nestjs passport 
    // it runs after the refresh jwt has been verified, its job is to make sure its refresh token is still valid
    // upholding to the database
    async validate(req: Request, payload: { sub: string; email: string}) {
        console.log('RefreshTokenStrategy.validate called')
        console.log('Payload', { sub: payload.sub, email: payload.email});


        /// Extract Auth header
        const authHeader = req.headers.authorization;

        if(!authHeader){
            console.log('No authorization header found');
            throw new UnauthorizedException('Refresh token not provided');
        }

        const refreshToken = authHeader.replace('Bearer', '').trim();

        if(!refreshToken) {
            throw new UnauthorizedException(
                'Refresh token is empty after extraction', 
            );
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub},
            select: {
                id: true,
                email: true,
                role: true,
                refreshToken: true,
            }
        });

        if(!user || !user.refreshToken){
            throw new UnauthorizedException('Invalid refresh token')
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken)

        if(!refreshTokenMatches) {
            throw new UnauthorizedException('Refresh token does not match');
        }

        return { id: user.id, email: user.email, role: user.role}
        
    }
}