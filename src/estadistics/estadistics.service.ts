import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Estadistic } from './entities/estadistic.entity';
import { Repository } from 'typeorm';

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

    console.log('initialDate', initialDate);

    //Retorno de la DATA de la BD CQNG
    const data = await this.getData(initialDate);

    console.log('data', data);

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
}
