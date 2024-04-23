import * as Log4js from 'log4js';

// const FILE_DIRECTORY = '/src/logs/app/access.log'

export class Logger {
  public static initialize() {
    Log4js.configure({
      appenders: {
        app: { type: 'dateFile', filename: 'logs/app.log', pattern: 'yyyyMMdd', numBackups: 10 },
      },
      categories: {
        default: { appenders: ['app'], level: 'all' },
      },
    });
  }
  public static LogAccessInfo(message: string): void {
    const logger = Log4js.getLogger('access');
    logger.info(message);
  }

  public static LogAccessWarning(message: string): void {
    const logger = Log4js.getLogger('access');
    logger.warn(message);
  }

  public static LogAccessError(message: string): void {
    const logger = Log4js.getLogger('access');
    logger.error(message);
  }

  public static LogSystemInfo(message: string): void {
    const logger = Log4js.getLogger('system');
    logger.info(message);
  }

  public static LogSystemWarning(message: string): void {
    const logger = Log4js.getLogger('system');
    logger.warn(message);
  }

  public static LogSystemError(message: string): void {
    const logger = Log4js.getLogger('system');
    logger.error(message);
  }
  public static LogError(message: string): void {
    const logger = Log4js.getLogger('error');
    logger.error(message);
  }
}
