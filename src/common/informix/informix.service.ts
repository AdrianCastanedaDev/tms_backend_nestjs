import {
  Injectable,
  OnModuleDestroy,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ibmdb from 'ibm_db';

@Injectable()
export class InformixService implements OnModuleDestroy {
  private readonly logger = new Logger(InformixService.name);
  private pool: ibmdb.Pool;
  private readonly connStr: string;

  constructor(private readonly config: ConfigService) {
    const server = this.config.get<string>('INFORMIX_SERVER');
    const database = this.config.get<string>('INFORMIX_DATABASE');
    const host = this.config.get<string>('INFORMIX_HOST');
    const port = this.config.get<string>('INFORMIX_PORT');
    const user = this.config.get<string>('INFORMIX_USER');
    const password = this.config.get<string>('INFORMIX_PASSWORD');

    this.connStr =
      `SERVER=${server};DATABASE=${database};HOST=${host};` +
      `SERVICE=${port};UID=${user};PWD=${password};PROTOCOL=onsoctcp;`;

    this.pool = new ibmdb.Pool();
    this.pool.setMaxPoolSize(10);
    this.logger.log(`Informix pool initialized -> ${host}:${port}/${database}`);
  }

  async onModuleDestroy() {
    try {
      this.pool.close(() => {
        this.logger.log('Informix pool closed');
      });
    } catch (e) {
      this.logger.error('Error closing Informix pool', e);
    }
  }

  async executeSp(
    spName: string,
    params: { value: any; type: string }[],
  ): Promise<any[]> {
    const formattedParams = params.map((p) => this.formatParam(p)).join(', ');
    const query = `EXECUTE PROCEDURE ${spName}(${formattedParams});`;

    this.logger.debug(`Executing: ${query}`);

    return new Promise((resolve, reject) => {
      this.pool.open(this.connStr, (err, conn) => {
        if (err) {
          this.logger.error(`Connection error: ${err.message}`);
          return reject(
            new HttpException(
              'Error al conectar con Informix',
              HttpStatus.SERVICE_UNAVAILABLE,
            ),
          );
        }

        conn.query(query, (queryErr, rows) => {
          conn.close(() => {});

          if (queryErr) {
            this.logger.error(`Query error: ${queryErr.message}`);
            return reject(
              new HttpException(
                queryErr.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }

          resolve(rows || []);
        });
      });
    });
  }

  private formatParam(param: { value: any; type: string }): string {
    const { value, type } = param;
    const upperType = type.trim().toUpperCase();

    if (value === null || value === undefined || value === '') {
      if (['NUMERIC', 'INT', 'INTEGER', 'DECIMAL'].includes(upperType)) {
        return 'NULL';
      }
      return "''";
    }

    if (['NUMERIC', 'INT', 'INTEGER', 'DECIMAL'].includes(upperType)) {
      return String(value);
    }

    if (['VARCHAR', 'TEXT', 'CHAR'].includes(upperType)) {
      const sanitized = String(value)
        .replace(/'/g, ' ')
        .replace(/\0/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .trim();
      return `'${sanitized}'`;
    }

    if (upperType === 'DATE') {
      return `'${this.formatDate(String(value))}'`;
    }

    if (upperType === 'DATETIME') {
      return `'${this.formatDatetime(String(value))}'`;
    }

    return `'${String(value)}'`;
  }

  private formatDate(value: string): string {
    const parts = value.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  }

  private formatDatetime(value: string): string {
    try {
      let clean = value;
      if (clean.endsWith('Z')) clean = clean.slice(0, -1);
      const dt = new Date(clean);
      return dt.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return value;
    }
  }
}
