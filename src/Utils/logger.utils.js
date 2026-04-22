import chalk from 'chalk';
import { NODE_ENV } from '../../config/config.service.js';

class Logger {
  constructor() {
    this.colors = {
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow,
      info: chalk.blue,
      debug: chalk.magenta,
      log: chalk.white
    };
  }

  success(message, ...args) {
    console.log(this.colors.success(`[SUCCESS] ${message}`), ...args);
  }

  error(message, ...args) {
    console.error(this.colors.error(`[ERROR] ${message}`), ...args);
  }

  warning(message, ...args) {
    console.warn(this.colors.warning(`[WARNING] ${message}`), ...args);
  }

  info(message, ...args) {
    console.info(this.colors.info(`[INFO] ${message}`), ...args);
  }

  debug(message, ...args) {
    if (NODE_ENV === 'development') {
      console.debug(this.colors.debug(`[DEBUG] ${message}`), ...args);
    }
  }

  log(message, ...args) {
    console.log(this.colors.log(`[LOG] ${message}`), ...args);
  }

  server(port) {
    console.log(
      chalk.cyan.bold('='.repeat(50)),
      '\n',
      chalk.green.bold('Server Status:'),
      chalk.green(' Running'),
      '\n',
      chalk.blue.bold('Environment:'),
      chalk.blue(` ${NODE_ENV}`),
      '\n',
      chalk.yellow.bold('Port:'),
      chalk.yellow(` ${port}`),
      '\n',
      chalk.cyan.bold('='.repeat(50))
    );
  }

  database(status, type = 'MongoDB') {
    const color = status === 'connected' ? chalk.green : chalk.red;
    console.log(
      color.bold(`[DATABASE] ${type.toUpperCase()}:`),
      color(status.toUpperCase())
    );
  }

  route(method, path, middleware = '') {
    console.log(
      chalk.magenta(`[ROUTE] ${method}`),
      chalk.cyan(path),
      middleware ? chalk.gray(`(${middleware})`) : ''
    );
  }

  middleware(name, status = 'loaded') {
    console.log(
      chalk.blue(`[MIDDLEWARE] ${name}`),
      chalk.green(`(${status})`)
    );
  }
}

export default new Logger();
