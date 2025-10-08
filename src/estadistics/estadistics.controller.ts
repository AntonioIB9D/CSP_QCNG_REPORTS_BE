import { Controller, Get } from '@nestjs/common';
import { EstadisticsService } from './estadistics.service';

@Controller('estadistics')
export class EstadisticsController {
  constructor(private readonly estadisticsService: EstadisticsService) {}

  //Endpoint to get charts
  @Get('/data/stationInfo')
  findData() {
    return this.estadisticsService.findData();
  }
}
