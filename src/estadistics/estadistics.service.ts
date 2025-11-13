import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Estadistic } from './entities/estadistic.entity';
import { Between, In, Like, Repository } from 'typeorm';
import { ProductKey, ViewName, ViewZones } from 'src/zonesData/zonesData';
import { toZonedTime } from 'date-fns-tz';

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
        proceso: In(['DRILL', 'INSP. PINTURA', 'ENSAMBLE FINAL', 'D-FLASH']),
      },
    });
  }

  private getTurno(fechaUTC: Date | string): string {
    const localDate = toZonedTime(new Date(fechaUTC), 'America/Tijuana');
    const hour = localDate.getHours();
    const minute = localDate.getMinutes();

    const totalMinutes = hour * 60 + minute;

    // Turno 1: 23:45 (1425) → 06:05 (365)
    if (totalMinutes >= 1425 || totalMinutes < 365) {
      return '1';
    }

    // Turno 2: 06:05 (365) → 15:35 (935)
    if (totalMinutes >= 365 && totalMinutes < 935) {
      return '2';
    }

    // Turno 3: 15:35 (935) → 23:45 (1425)
    return '3';
  }

  async findLastRegisteredDefect() {
    const initialDate = new Date();
    initialDate.setHours(0, 0, 0, 0); // Normalización de horas iniciales

    const data = await this.dataRepository.findOne({
      where: {
        fecha_rechazo: initialDate,
        proceso: In(['DRILL', 'INSP. PINTURA', 'ENSAMBLE FINAL', 'D-FLASH']),
      },
      order: {
        fecha_alta: 'DESC',
      },
    });
    return data;
  }

  //Get total defects quantity by station
  async findTotalDefects() {
    const lineProcess = ['DRILL', 'INSP. PINTURA', 'ENSAMBLE FINAL', 'D-FLASH'];
    const initialDate = new Date();
    initialDate.setHours(0, 0, 0, 0); // Normalización de horas iniciales

    //Retorno de la DATA de la BD CQNG
    const data = await this.getData(initialDate);

    // Data agrupara por procesos
    const groupedData = data.reduce<
      Record<string, Record<string, Record<string, number>>>
    >((acc, item) => {
      const { proceso, defecto, fecha_alta } = item;
      const turno = this.getTurno(fecha_alta); // ← aquí normalizas y clasificas

      if (lineProcess.includes(proceso)) {
        if (!acc[proceso]) acc[proceso] = {};
        if (!acc[proceso][turno]) acc[proceso][turno] = {};
        acc[proceso][turno][defecto] = (acc[proceso][turno][defecto] || 0) + 1;
      }
      return acc;
    }, {});

    // 🔢 Transformar a totales por proceso y turno
    const totalByProcessAndShift: Record<string, Record<string, number>> = {};

    for (const [proceso, turnos] of Object.entries(groupedData)) {
      totalByProcessAndShift[proceso] = {};
      for (const [turno, defectos] of Object.entries(turnos)) {
        const total = Object.values(defectos).reduce(
          (sum, count) => sum + count,
          0,
        );
        totalByProcessAndShift[proceso][turno] = total;
      }
    }

    return totalByProcessAndShift;
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
