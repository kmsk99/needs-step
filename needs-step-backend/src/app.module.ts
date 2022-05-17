import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { JwtModule } from './jwt/jwt.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { NeedsModule } from './needs/needs.module';
import { Need } from './needs/entities/need.entity';
import { NeedQuestion } from './needs/entities/need-question.entity';
import { MeasureNeed } from './needs/entities/measure-need.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      synchronize: process.env.NODE_ENV !== 'production',
      logging:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
      entities: [User, Verification, Need, NeedQuestion, MeasureNeed],
    }),
    GraphQLModule.forRoot({
      playground: process.env.NODE_ENV !== 'production',
      driver: ApolloDriver,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => ({
            token: connectionParams['x-jwt'],
          }),
        },
      },
      autoSchemaFile: true,
      context: ({ req }) => ({ token: req.headers['x-jwt'] }), //http와 ws 따로 설정한다.
    }),
    UsersModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    NeedsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
