import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  //Project description
  app.setGlobalPrefix("api/v1")


  // Set Global validation 
  /*
  This globally sets the validation pipe on all the routes so we dont have to set validation
  on all the routes
  */
 app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,    //this automatically removes any property not set in the Dto preventing extra data from being processed
    forbidNonWhitelisted: true, // ensures strict dto validation
    transform: true,  // transforms plain data into dto class instances
    transformOptions: {
      enableImplicitConversion: true, // aloows automatic conversions of dto types
    }



  })
 )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(
  (error) => {
    Logger.error("Error starting server", error)
    process.exit(1)
  }
);
