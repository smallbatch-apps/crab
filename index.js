#!/usr/bin/env node

'use strict';

const program = require('commander');
const commands = require('./libs/commands');

program
  .command('generate <type> [component-name]')
  .alias('g')
  .description('Generate a React component - defaults to class-based component')
  .option('-f, --functional', 'Create functional (not class) component')
  .option('-r, --redux', 'Create component (class only) with Redux code')
  .option('-c, --components <components>', 'Add imports for components as comma separated list, eg -c List,ListItem,ListButton')
  .option('--content <content>', 'Populate with content')
  .option('--imports <imports>', 'Add import statements')
  .action(commands.generate);

program.command('new [project-name]')
  .alias('create')
  .description('Make a new project')
  .option('-r,--redux', 'Include redux boilerplate and structure')
  .option('--no-git', 'Do not include git files and init process')
  .action(commands.create);

program.command('crab')
  .option('-a, --ascii', 'Ascii art crab')
  .action(commands.crab);

program.command('destroy <file>')
  .action(commands.destroy);

program.parse(process.argv);