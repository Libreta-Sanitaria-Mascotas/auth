import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Auth-Service');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin123@rabbitmq:5672'],
        queue: 'auth_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

  await app.listen();
  logger.log('Auth microservice is listening on RabbitMQ (auth_queue)');
}
bootstrap();
