#!/usr/bin/env node

'use strict';

const program = require('commander');

program
  .command('generate')
  .description('Generate a React component - defaults to class-based component')
  .option('-f, --functional', 'Create functional (not class) component')
  .option('-r, --redux', 'Add redux boilerplate')
  .action(function(name, cmd){
    console.log(name);
    console.log(cleanArgs(cmd));
    //console.log(cmd);
  })

program.command('whatever')
  .action(function(name, cmd){
    console.log('anything?');
  });

program.parse(process.argv);


function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}