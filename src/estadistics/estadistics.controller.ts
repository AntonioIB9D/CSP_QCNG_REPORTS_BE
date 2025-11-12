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

  //Endpoint to get total defects quantity by station
  @Get('/data/stationTotalDefects')
  findTotalDefects() {
    return this.estadisticsService.findTotalDefects();
  }

  //Endpoint to get data by model and selected view
  @Get(':model/:selectedView')
  findDataByView(
    @Param('model') term: string,
    @Param('selectedView') view: string,
  ) {
    return this.estadisticsService.findDataByView(term, view);
  }

  //Endpoint to get data by model and selected view and start and end date
  @Get(':model/:selectedView/:start/:end')
  findDataByDate(
    @Param('model') term: string,
    @Param('selectedView') view: string,
    @Param('start') start: string,
    @Param('end') end: string,
  ) {
    return this.estadisticsService.findDataByDate(term, view, start, end);
  }
}
