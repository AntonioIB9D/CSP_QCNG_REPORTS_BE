import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Estadistic } from './entities/estadistic.entity';
import { Between, Like, Repository } from 'typeorm';
import { ProductKey, ViewName, ViewZones } from 'src/zonesData/zonesData';

@Injectable()
export class EstadisticsService {
  constructor(
    @InjectRepository(Estadistic, 'dataConnection')
    private readonly dataRepository: Repository<Estadistic>,
  ) {}

  // Get charts data by stations
  async findData() {
    const lineProcess = [
      'DRILL',
      'INSP. PINTURA',
      'ENSAMBLE FINAL',
      'INSP.FINAL',
    ];
    const initialDate = new Date();
    initialDate.setHours(0, 0, 0, 0); // Normalización de horas iniciales

    //Retorno de la DATA de la BD CQNG
    const data = await this.getData(initialDate);

    // Data agrupara por procesos
    const groupedData = data.reduce<Record<string, Record<string, number>>>(
      (acc, item) => {
        const { proceso, defecto } = item;
        if (lineProcess.includes(proceso)) {
          if (!acc[proceso]) acc[proceso] = {};
          acc[proceso][defecto] = (acc[proceso][defecto] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    // Top 5 defectos
    const topFiveByProcess = Object.entries(groupedData).reduce<
      Record<string, { defecto: string; cantidad: number }[]>
    >((acc, [proceso, defectos]) => {
      const top5 = Object.entries(defectos)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([defecto, cantidad]) => ({ defecto, cantidad }));

      acc[proceso] = top5;
      return acc;
    }, {});

    return topFiveByProcess;
  }

  // Get all data to charts by station
  private async getData(initialDate: Date) {
    return await this.dataRepository.find({
      where: {
        fecha_rechazo: initialDate,
      },
      select: {
        producto: true,
        defecto: true,
        zona: true,
        folio: true,
        proceso: true,
        fecha_rechazo: true,
      },
    });
  }

  // Get data by view and box model
  async findDataByView(term: string, view: string) {
    // Variable producto para identificar que modelo de caja recibimos del Front
    const producto = term === 'LD' ? 'LD%' : 'SD%';
    console.log('Producto: ', producto);
    //Fecha Actual
    const fechaInicio = new Date();

    //Retorno de la DATA de la BD CQNG
    const data = await this.getDataByZone(producto, fechaInicio);

    const zonas: string[] =
      ViewZones[producto as ProductKey]?.[view as ViewName] ?? [];

    const filteredData = data?.filter((item) => zonas.includes(item.zona));

    return filteredData;
  }

  // Get data by view,box model and start and end date
  async findDataByDate(term: string, view: string, start: string, end: string) {
    const producto = term === 'LD' ? 'LD%' : 'SD%';
    const fechaInicio = new Date(start);
    const fechaFin = new Date(end);
    fechaFin.setHours(23, 59, 59, 999); // Ajustar la fecha de finalización al final del día
    const data = await this.getDataByZone(producto, fechaInicio, fechaFin);
    const zonas: string[] =
      ViewZones[producto as ProductKey]?.[view as ViewName] ?? [];
    if (zonas) {
      const filteredData = data.filter((item) => zonas.includes(item.zona));
      return filteredData;
    }
    return [];
  }

  // Get data by product, start and end date
  private async getDataByZone(
    producto: string,
    fechaInicio: Date,
    fechaFin?: Date,
  ) {
    if (fechaFin) {
      return await this.dataRepository.find({
        where: {
          producto: Like(producto),
          fecha_rechazo: Between(fechaInicio, fechaFin),
        },
        select: {
          producto: true,
          defecto: true,
          zona: true,
          folio: true,
          fecha_rechazo: true,
        },
      });
    }
    return await this.dataRepository.find({
      where: {
        producto: Like(producto),
        fecha_rechazo: fechaInicio,
      },
      select: {
        producto: true,
        defecto: true,
        zona: true,
        folio: true,
        fecha_rechazo: true,
      },
    });
  }
}
