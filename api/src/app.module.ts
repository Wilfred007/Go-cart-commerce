import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    /*
    To make the config module golbal we import it here (app.module.ts) using the .forRoot function to initialize
    and configure a module once at application load
    */
    ConfigModule.forRoot({
      isGlobal: true,  // by setting this to true we have exposed it to all parts of our app
      envFilePath: '.env' // this simply tells nestjs wjere to read env variabbles from
    }),
    PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


/// Note that ConfigModule helps read environment variables without it been set to gloab: true 
/// We will have to keep importing them in every file we need




