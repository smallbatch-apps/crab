#!/usr/bin/env node

'use strict';

const program = require('commander');
const commands = require('./libs/commands');

program
  .command('generate <type> [component-name]')
  .alias('g')
  .description('Generate a React resource - defaults to class-based component')
  .option('-c, --class', 'Create class component')
  .option('-h, --hooks', 'Import and use hooks (useEffect, useQuery)')
  .option('-p, --props', 'Set props to use, can type with typescript: name:string,age:number')
  .option('-s, --state', 'Set the application state')
  .option('--path <path>', 'Url for links - Pages only')
  .action(commands.generate);

program.command('create [project-name]')
  .alias('new')
  .description('Make a new project in the <project-name> directory')
  .option('-j, --javascript', 'Create project as JavaScript')
  .option('-t, --typescript', 'Create project as TypeScript')
  .option('-r, --react', 'Create React project, not NextJS')
  .option('-n, --next', 'Create NextJS project instead of standard React')
  .option('--no-utils', 'Do not include any optional libraries')
  .action(commands.create);

program.command('crab')
  .option('-a, --ascii', 'Ascii art crab')
  .action(commands.crab);

program.command('install [feature]')
  .option('-l, --list', 'List the available features you can install')
  .action(commands.install);

program.parse(process.argv);