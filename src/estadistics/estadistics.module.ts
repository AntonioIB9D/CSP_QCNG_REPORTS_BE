import { Module } from '@nestjs/common';
import { EstadisticsService } from './estadistics.service';
import { EstadisticsController } from './estadistics.controller';
import { Estadistic } from './entities/estadistic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [EstadisticsController],
  providers: [EstadisticsService],
  imports: [TypeOrmModule.forFeature([Estadistic], 'dataConnection')],
})
export class EstadisticsModule {}
