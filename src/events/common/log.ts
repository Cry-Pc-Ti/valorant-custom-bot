import * as Log4js from 'log4js';

/**
 * ロガークラス
 */
export class Logger {
  /**
   * ロガーを初期化する関数
   *
   * この関数はアプリケーションが起動する際に一度だけ呼び出してください。
   */
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

  /**
   * アクセス情報をログに記録する関数
   *
   * @param message - ログに記録するメッセージ
   *
   * この関数はユーザーの操作やアクセスログを記録するために使用します。
   * 例: ユーザーがシステムにログインした際や、特定の機能を利用した際のログを記録します。
   */
  public static LogAccessInfo(message: string): void {
    const logger = Log4js.getLogger('access');
    logger.info(message);
  }

  /**
   * アクセスエラーをログに記録する関数
   *
   * @param error - ログに記録するエラー
   *
   * この関数はアクセスに関する重大な問題や例外を記録するために使用します。
   * 例: ユーザーが存在しないページにアクセスした場合や、APIリクエストが失敗した場合など。
   */
  public static LogAccessError(message: string, error: unknown): void {
    const logger = Log4js.getLogger('access');
    logger.error(`${message}:`);
    logger.error(error);
  }

  /**
   * システム情報をログに記録する関数
   *
   * @param message - ログに記録するメッセージ
   *
   * この関数はシステムの動作状況や一般的な操作ログを記録するために使用します。
   * 例: システムの起動やシャットダウン時のログを記録します。
   */
  public static LogSystemInfo(message: string): void {
    const logger = Log4js.getLogger('system');
    logger.info(message);
  }

  /**
   * システムエラーをログに記録する関数
   *
   * @param message - ログに記録するメッセージ
   *
   * この関数は重大なシステムエラーや例外を記録するために使用します。
   * 例: データベース接続エラーやサーバーのクラッシュなど、システムに深刻な影響を与えるエラー。
   */
  public static LogSystemError(message: string, error: unknown): void {
    const logger = Log4js.getLogger('system');
    logger.error(`${message}:`);
    logger.error(error);
  }

  /**
   * エラーをログに記録する関数
   *
   * @param message - ログに記録するメッセージ
   *
   * この関数はアクセスやシステム以外の一般的なエラーを記録するために使用します。
   * 例: 特定のモジュールや機能に関するエラー、予期しない例外など。
   */
  public static LogError(message: string, error: unknown): void {
    const logger = Log4js.getLogger('error');
    logger.error(`${message}:`);
    logger.error(error);
  }
}
