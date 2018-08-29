#!/usr/bin/env node

'use strict';

const program = require('commander');
const commands = require('./libs/commands');

program
  .command('generate <type> [component-name]')
  .alias('g')
  .description('Generate a React resource - defaults to class-based component')
  .option('-f, --functional', 'Create functional (not class) component')
  .option('-r, --redux', 'Create component (class only) with Redux code')
  .option('-t, --typescript', 'Create TypeScript component')
  .option('--components <components>', 'Add imports for components as comma separated list')
  .option('--path <path>', 'Url for links - Routes only')
  .option('--menu', 'Insert into nav menu - Routes only')
  .option('--content <content>', 'Populate with content')
  .option('--imports <imports>', 'Add import statements')
  .action(commands.generate);

program.command('create <project-name>')
  .alias('new')
  .description('Make a new project in the <project-name> directory')
  .option('-r,--redux', 'Include redux boilerplate and structure')
  .option('-t, --typescript', 'Create project as TypeScript')
  .option('--no-git', 'Do not include git files and init process')
  .action(commands.create);

program.command('crab')
  .option('-a, --ascii', 'Ascii art crab')
  .action(commands.crab);

program.command('install [feature]')
  .option('-l, --list', 'List the available features you can install')
  .action(commands.install);

program.command('destroy <file>')
  .action(commands.destroy);

program.parse(process.argv);