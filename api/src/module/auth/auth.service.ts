import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import * as brypt from 'bcrypt'
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;
    constructor( 
        private prisma: PrismaService, 
        private jwtService: JwtService,
    ){}


    // Register new user
    async register(registerDto: RegisterDto): Promise<AuthResponseDTO> {

        // First thing we will do is to destructure the registerDTO to get all the values in the obect
        const { email, password, firstName, lastName} = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if(existingUser){
            throw new ConflictException("User with this email already exist")
        }

        try {
            const hashedPassword = await brypt.hash(password, this.SALT_ROUNDS)
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName
                },

                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    password: false
                }
            });


            const tokens = await this.generateTokens(user.id, user.email);

            await this.updateRefreshToken(user.id, tokens.refreshToken);

            return {
                ...tokens,
                user,
            }
        } catch (error) {
            // throw error;
            console.log('Error during user registration:', error);
            throw new InternalServerErrorException('Registration failed')
        }
    }


    // Generate access and refresh tokens

    private async generateTokens(
        userId: string,
        email: string,
    ): Promise<{accessToken: string; refreshToken: string}> {
        const payload = { sub: userId, email};

        const refreshId = randomBytes(16).toString('hex');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m'}),
            this .jwtService.signAsync({...payload, refreshId}, {expiresIn: '7d'}),

       ]);

       return { accessToken, refreshToken}

    }


    /// Update refresh token in the database
    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.prisma.user.update({
            where: {id: userId},
            data: {refreshToken}
        });
    }




    // Refresh tokens for an already verified user
    /**
     STORY
     First retireve the user from the database using the provided userId (UserId: string) it returns a promise
     then check if the user exist in the database -> const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
     });

     if user does not exist, throw error, but if user exists generate a new access token and a new refresh using the generateTokens
     then update the new token via updateRefreshToken
     */

     async refreshTokens(userId: string): Promise<AuthResponseDTO> {

        const user = await this.prisma.user.findUnique({
            where: { id: userId},
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            },
        });

        if(!user) {
            throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user, 
        }
     }

     // Logout
       async logout(userId: string): Promise<void> {
            await this.prisma.user.update({
                where: { id: userId},
                data: { refreshToken: null}
            })
        }


        // Login
        async login(loginDto: LoginDto): Promise<AuthResponseDTO> {
            const { email, password } = loginDto;

            const user = await this.prisma.user.findUnique({
                where: { email},
            });


            if(!user || !(await brypt.compare(password, user.password))){
                throw new UnauthorizedException('Invalid email or password')
            }

            const tokens = await this.generateTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);


            return {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        }


    


}
