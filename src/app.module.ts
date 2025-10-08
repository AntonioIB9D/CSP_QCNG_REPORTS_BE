import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticsModule } from './estadistics/estadistics.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    //Conexión a SQL para data de QCNG
    TypeOrmModule.forRootAsync({
      name: 'dataConnection',
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mssql',
        host: process.env.DB_HOST_QC,
        port: +(process.env.DB_PORT ?? 3307),
        username: process.env.DB_USERNAME_QC,
        password: process.env.DB_PASSWORD_QC,
        database: process.env.DB_NAME_QC,
        autoLoadEntities: true,
        /* synchronize: true, desactivar en producción!*/
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }),
    }),

    AuthModule,

    EstadisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
