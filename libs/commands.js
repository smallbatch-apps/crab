const utils = require('./utils');
const inquirer = require('inquirer');
const fs = require('fs');
const handlebars = require('handlebars');
const execa = require('execa');
const chalk = require('chalk');
const errors = require('./errors');
const log = require('./log');
const ncp = require('ncp').ncp;

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
  //utils.insertRouteIntoApplication(args);

  try {
    utils.validateArgs(type, args);
  } catch(error) {
    log.danger(`🛑  ${error.message}`);
    return;
  }
  
  let templateFile = utils.resolveTemplateFile(args);

  fs.readFile(`${__dirname}/templates/${templateFile}`, 'utf8', (error, data) => {
    if (error) {
      log.danger(`🛑  Could not read template file: ${__dirname}/templates/${utils.templateDirectory(args)}/${templateFile}`);
      return;
    }
    
    let template = handlebars.compile(data);
    let filePath = utils.resolveGeneratedFilePath(args);

    args.pathToRedux = utils.getPathToRedux(filePath, args);
    
    if (args.isRoute && !args.content) {
      args.content = utils.createRouteDefaultContent(args);
    }

    
    let finishedTemplate = template(args);
    
    fs.writeFile(filePath, finishedTemplate, { encoding: 'utf8', flag: 'wx' }, (error) => {
      if(error === null) {
        log.success(`✅  Your ${args.type} ${args.resourceName} successfully created`);
        utils.updateComponentsList(filePath, args);
        if (args.isRoute) {
          utils.insertRouteIntoApplication(args);
        }
      } else {
        errors.writeGeneratedFile(error);
      }
    });
  });
}

const crab = (cmd) => {
  const args = utils.cleanArgs(cmd);
  const crabString = args.ascii ? '(\\/)!_!(\\/)' :  '🦀';

  log.crab(crabString);
};

const create = async function(name, cmd) {
  log.log(`🦀  Creating new project in ${name} directory.\n`);
  
  const args = utils.cleanArgs(cmd);

  try {
    await utils.checkGlobalDependencies(args);
  } catch(error) {
    log.danger('🛑  ' + error.message);
    return;
  }
  
  if (fs.existsSync(`${process.cwd()}/${name}`)) {
    log.danger(`🛑  Directory "${name}" already exists. You cannot create a project there.`);
    return;
  }

  log.log('🦀  Copying app template files');

  await ncp(`${__dirname}/templates/${utils.templateDirectory(args)}/app`, name, function (err) {
    if (err) {
      console.error(err);
      return;
    }

    log.success('✅  Template files copied\n');
    process.chdir(name);
    log.log('🦀  Initialising dependency management\n');
    execa.shellSync('npm init -y');

    let dependencies = ['react', 'react-router-dom', 'babel-polyfill'];

    if (args.redux) {
      dependencies.push('redux', 'react-redux');

      if (args.typescript) {
        dependencies.push('@types/react-redux');
      }
    }

    log.log('🦀  Installing code dependencies. This can take a while depending on whether NPM has cached them.');
    execa.shellSync(`npm install --save ${dependencies.join(' ')}`);
    log.success('✅  Dependencies installed\n');
    log.log('🦀  Installing dev dependencies. This can take a bit a bit longer.');
    execa.shellSync('npm install --save-dev node-sass');
    log.success('✅  Dev dependencies installed\n');

    if (args.git && utils.checkGit(args)) {
      log.log('🦀  Initialising Git for version control');
      
      execa.shellSync('git init');
  
      fs.copyFile(`${__dirname}/templates/${utils.templateDirectory(args)}/gitignore.hbs`, `${process.cwd()}/.gitignore`, (error) => {
        if (error) {
          console.error(error);
          return false;
        }
        log.success('✅  Git initialised\n');
      });
    }
    
    if (args.redux) {
      log.log('🦀  Setting up redux files');
      ncp(`${__dirname}/templates/${utils.templateDirectory(args)}/redux`, `${process.cwd()}/redux`, (error) => {
        if (error) {
          console.error(error);
        }
        log.success('✅  Redux files added\n');
      });
    }

    fs.readFile(`${__dirname}/templates/${utils.templateDirectory(args)}/app-index.${args.fileExtension}`, 'utf8', (error, data) => {
      if (error) {
        log.danger(`🛑  Could not read template file: ${__dirname}/templates/${utils.templateDirectory(args)}/app-index.${args.fileExtension}`);
        return;
      }

      if (args.typescript || args.redux) {
        try {
          utils.createCrabFile(args);
          log.success('✅  Saved created .crabfile');
        } catch(error) {
          log.warn('⚠️ Unable to create crabfile to save your project settings.');
        }        
      }
      
      let template = handlebars.compile(data);
      let finishedTemplate = template(args);
    
      const writeOptions = { encoding: 'utf8', flag: 'wx' };
      
      fs.writeFile(`${process.cwd()}/index.${args.fileExtension}`, finishedTemplate, writeOptions, (error) => {
        if(error === null) {
          log.success(`✅  Saved index.${args.fileExtension} successfully. That's the last step.\n`);
          console.log(`🙌  You now just need to run "cd ${name}" and then run "parcel index.html" and your app will be running at http://localhost:1234.\n`);

          log.crab('(\\/)!_!(\\/)\n');

        } else {
          log.danger(`🛑  An error has occured at the final step, creating the index.${args.fileExtension} file`);
        }
      });
    });

  });

  
}

const install = (feature, cmd) => {

  let args = utils.cleanArgs(cmd);
  const options = ['tailwind'];

  if (args.list || feature === 'list') {
    log.log(`🦀  Install options are: ${options.join(', ')}`);
    return;
  }

  if (!options.includes(feature)) {
    log.danger(`🛑  ${feature} is not an option`);
    log.log(`🦀  Install options are: ${options.join(', ')}`);
    return;
  }

  if (!utils.isCurrentRoot()) {
    log.danger(`🛑  This does not appear to be the root directory.`);
    return;
  }
  
  if (feature === 'tailwind') {
    utils.installTailwind();
  }
}

module.exports = { crab, generate, create, destroy, install };