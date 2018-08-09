const utils = require('./utils');
const inquirer = require('inquirer');
const fs = require('fs');
const handlebars = require('handlebars');
const chalk = require('chalk');
const errors = require('./errors');
const log = require('./log');

const destroy = async (name, cmd) => {
  let rawAnswers = await inquirer.prompt({
    type: 'confirm',
    name: 'deleteComponent',
    message: chalk.red('Are you ABSOLUTELY sure you want to delete this component file?')
  });
  
  if(name.substr(-3) === '.js') {
    name = name.substring(0, name.length - 3);
  }

  if (rawAnswers.deleteComponent) {
    try {
      await fs.unlinkSync(`${process.cwd()}/${name}.js`);
    } catch(error) {
      errors.destroyFile(error);
      return;
    }
    
  }
};

const generate = async (type, name, cmd) => {
  const args = utils.cleanArgs(cmd);
  
  if (!name) {
    // support "crab g MyComponent"
    name = type;
    type = 'component';
  }

  if(name.substr(-3) === '.js') {
    name = name.substring(0, name.length - 3);
  }
  
  let templateFile = args.functional ?
    'templates/component-functional.js' : 
    'templates/component.js';
  
  fs.readFile(`${__dirname}/${templateFile}`, 'utf8', (error, data) => {
    if (error) {
      log.danger('Could not read template file');
      return;
    }
    
    let template = handlebars.compile(data);
    const componentNameArray = name.split('/');
    if (args.imports) {
      args.imports = args.imports.split("\\n");
    }

    if (args.content) {
      args.content = args.content.split("\\n");
    }
    
    args.componentName = componentNameArray.pop();
    let finishedTemplate = template(args);
    
    const writeOptions = { encoding: 'utf8', flag: 'wx' };
    
    fs.writeFile(`${process.cwd()}/${name}.js`, finishedTemplate, writeOptions, (error) => {
      if(error === null) {
        log.success(`Component ${name} successfully created`);
      } else {
        errors.writeGeneratedFile(error);
      }
    });
  });
}

const crab = (cmd) => {
  const args = utils.cleanArgs(cmd);
  const crabString = args.ascii ? '(\\/)!_!(\\/)' :  '🦀'
  log.crab(crabString);
};

const create = async function(name, cmd) {

  try {
    const { stdout } = execa.shellSync('parcel --version');
  }
  catch(error) {
    if (error.code === 127) {
      utils.handleParcel();
      return;
    } 
  }

  if (name === undefined) {
    
    let rawAnswers = await inquirer.prompt({
      type: 'confirm',
      name: 'rawproject',
      message: chalk.yellow('You have not entered any project name, so the project will be initialised in the current directory.')
    });
    
    if (!rawAnswers.rawproject) {
      log.crab('Closing now.');
      return;
    }
  }

  const args = utils.cleanArgs(cmd);

  if (fs.existsSync(`${process.cwd()}/${name}`)) {
    log.danger(`Directory "${name}" already exists. You cannot create a project there.`);
    return;
  }
}

module.exports = { crab, generate, create, destroy };