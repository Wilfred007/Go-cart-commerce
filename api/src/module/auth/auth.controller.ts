import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetUser } from 'src/commons/decorators/get-user.decorators';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guards';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {



    constructor( private readonly authService: AuthService ){}

        // Register endpoint
        @Post('register')
        @HttpCode(201)
        async register(@Body() registerDto: RegisterDto):Promise<AuthResponseDTO>{
            return await this.authService.register(registerDto)
        }

        
        // refresh access token
        @Post('refresh')
        @HttpCode(HttpStatus.OK)
        @UseGuards(RefreshTokenGuard)
        async refresh(@GetUser('id') userId: string): Promise<AuthResponseDTO>{
            return await this.authService.refreshTokens(userId);

        }


        // Log out
        @Post('logout')
        @HttpCode(HttpStatus.OK)
        @UseGuards(JwtAuthGuard)
        async logout(@GetUser('id') userId: string): Promise<{message: string}> {
            await this.authService.logout(userId);
            return { message: 'Successfully Logged out'};
        }


        // Login
        @Post('login')
        @HttpCode(HttpStatus.OK)
        async login(@Body() loginDto: LoginDto): Promise<AuthResponseDTO>{
            return await this.authService.login(loginDto)
        }
        

    }

