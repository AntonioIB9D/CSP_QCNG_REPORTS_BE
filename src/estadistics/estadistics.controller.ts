import { Controller, Get, Param } from '@nestjs/common';
import { EstadisticsService } from './estadistics.service';

@Controller('estadistics')
export class EstadisticsController {
  constructor(private readonly estadisticsService: EstadisticsService) {}

  //Endpoint to get charts by station
  @Get('/data/stationInfo')
  findData() {
    return this.estadisticsService.findData();
  }

  @Get(':model/:selectedView')
  findDataByView(
    @Param('model') term: string,
    @Param('selectedView') view: string,
  ) {
    return this.estadisticsService.findDataByView(term, view);
  }
}
