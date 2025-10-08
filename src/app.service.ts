import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello little shinning stars! This is CSP QCNG REPORTS Backend';
  }
}
