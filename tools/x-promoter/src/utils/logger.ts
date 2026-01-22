import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, accountId, ...meta }) => {
    const accountTag = accountId ? `[${accountId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${accountTag} ${message}${metaStr}`;
  })
);

// JSON format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: fileFormat,
    })
  );
}

// Helper functions for account-specific logging
export function accountLogger(accountId: string) {
  return {
    info: (message: string, meta?: object) => 
      logger.info(message, { accountId, ...meta }),
    warn: (message: string, meta?: object) => 
      logger.warn(message, { accountId, ...meta }),
    error: (message: string, meta?: object) => 
      logger.error(message, { accountId, ...meta }),
    debug: (message: string, meta?: object) => 
      logger.debug(message, { accountId, ...meta }),
  };
}

export default logger;


