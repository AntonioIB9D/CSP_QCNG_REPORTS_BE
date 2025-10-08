import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadisticDto } from './create-estadistic.dto';

export class UpdateEstadisticDto extends PartialType(CreateEstadisticDto) {}
