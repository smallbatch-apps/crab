#!/usr/bin/env node

'use strict';

const fs = require('fs');
const program = require('commander');
const handlebars = require('handlebars');
const chalk = require('chalk');
const inquirer = require('inquirer');
const execa = require('execa');

program
  .command('generate <component-name>')
  .alias('g')
  .description('Generate a React component - defaults to class-based component')
  .option('-f, --functional', 'Create functional (not class) component')
  //.option('-r, --redux', 'Add redux boilerplate')
  .action(function(name, cmd){
    const args = cleanArgs(cmd);
    
    let templateFile = args.functional ?
      'templates/component-functional.js' : 
      'templates/component.js';
    
    fs.readFile(templateFile, 'utf8', (error, data) => {
      let template = handlebars.compile(data);
      const componentNameArray = name.split('/');
      const componentName = componentNameArray.pop(); 
      let finishedTemplate = template({componentName});

      const writeOptions = { encoding: 'utf8', flag: 'wx' };
      
      fs.writeFile(`${process.cwd()}/${name}.js`, finishedTemplate, writeOptions, (error) => {
        
        if(error === null) {
          console.log(chalk.green(`Component ${name} successfully created`));
          return;
        }
        
        if (error.code === 'EEXIST') {
          console.log(chalk.red(`A file already exists at ${error.path}. Overwriting prevented.`));
          return;
        }
        if (error.code === 'ENOENT') {
          console.log(chalk.red(`Not able to create ${error.path}.\n\nYou can create components directly to any subdirectory, but the directory itself must already exist.`));
          return;
        }

      });
    });
  });

program.command('new [project-name]')
  .alias('create')
  .description('Make a new project')
  .action(async function(name, cmd) {
    
    try {
      const { stdout } = execa.shellSync('parcel --version');
    }
    catch(error) {
      if (error.code === 127) {

        let answers = await inquirer.prompt({
          type: 'confirm',
          name: 'installParcel',
          message: chalk.yellow('We need parceljs installed for this to work. Install globally now?')
        });
        
        if (answers.installParcel) {
          console.log('Installing parcel, please wait');
          execa.shellSync('npm install -g parcel-bundler');
          console.log(chalk.green('Parcel installed successfully. Moving on.'));
        } else {
          console.log(chalk.red('Cannot continue without Parcel installation. Closing now.'));
        }
        return;
      } 
    }

    if (name === undefined) {
      let rawAnswers = await inquirer.prompt({
        type: 'confirm',
        name: 'rawproject',
        message: chalk.yellow('You have not entered any project name, so the project will be initialised in the current directory.')
      });
      
      console.log(answers);
      if (!answers.rawproject) {
        console.log(chalk.red('Closing now.'));
        return;
      }
      
    }

    const args = cleanArgs(cmd);

    if (fs.existsSync(`${process.cwd()}/${name}`)) {
      console.log(chalk.red(`Directory "${name}" already exists. You cannot create a project there.`));
      return;
    }


  });

program.command('crab')
  .action(function(name, cmd){
    console.log('🦀');
  });

program.parse(process.argv);

console.log(`\n🦀\n`);

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