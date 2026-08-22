import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTStrategy } from './strategies/jwt.Strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    /*
    Here we are importing the PassportModule using the register function, this function, it sets as the default strategy
    'jwt' this strategy is used by nestjs to protect routes. for example if a user wants to update his profile, the jwt 
    ensures the user is connected to the app
    */
    PassportModule.register({defaultStrategy: 'jwt'}),
    /**
     We also import another module the JWTModule used to generate tokens using the registerAsync function
     This function helps to create tokens from environment variables 
     */
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        secret: ConfigService.get<string>('JWT_SECRET') ?? 'defaultsecret2026',
        signOptions: { expiresIn: Number(ConfigService.get<number>('JWT_EXPIRES_IN', 900))},

      })
    })
  ],
  providers: [AuthService, JWTStrategy, RefreshTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
