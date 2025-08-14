import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
//import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const { nodeEnv, port } = envs;
  const logger = new Logger('Auth-Service');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      transport:Transport.TCP,
      options:{
        host:'0.0.0.0',
        port:port
      }
    });

  // app.setGlobalPrefix('api');
  //   app.useGlobalPipes(new ValidationPipe(
  //   {
  //     whitelist: true, //elimina campos no permitidos
  //     forbidNonWhitelisted: true, //lanza error si hay campos extras
  //     transform: true //transforma automaticamente los tipos
  //   }
  // ));

  // const documentConfig = new DocumentBuilder()
  //   .setTitle('Auth')
  //   .setDescription('The auth API description')
  //   .setVersion('1.0')
  //   .addBearerAuth() //Habilita el uso de JWT
  //   .build();

  // const document = SwaggerModule.createDocument(app, documentConfig);
  // SwaggerModule.setup('docs', app, document);
  await app.listen();
  logger.log(`Auth-Service is running on port ${port} in ${nodeEnv} mode`);
}
bootstrap();
