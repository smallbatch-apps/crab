const chalk = require('chalk');

const log = (message) => console.log(message);

const warn = (message) => console.log(chalk.yellow(message));

const danger = (message) => console.log(chalk.red(message));

const success = (message) => console.log(chalk.green(message));

const crab = (message) => console.log(chalk.keyword('orange')(message));

module.exports = { log, warn, danger, success, crab };