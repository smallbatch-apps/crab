const utils = require('./utils');
const inquirer = require('inquirer');
const fs = require('fs');
const handlebars = require('handlebars');
const execa = require('execa');
const chalk = require('chalk');
const errors = require('./errors');
const log = require('./log');
const ncp = require('ncp').ncp;
const installers = require('./installers');

const generate = async (type, name, cmd) => {
  const args = utils.cleanArgs(cmd);

  try {
    utils.validateArgs(type, args);
  } catch (error) {
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
      if (error === null) {
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
  log.crab(args.ascii ? '(\\/)!_!(\\/)' : '🦀');
};

const create = async function (name, cmd) {
  log.log(`🦀  We have to ask you some questions first.\n`);

  const args = utils.cleanArgs(cmd);

  if (fs.existsSync(`${process.cwd()}/${name}`)) {
    log.danger(`🛑  Directory "${name}" already exists. You cannot create a project there.\n`);
    return;
  }

  const language = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'tsjs',
        message: 'TypeScript or JavaScript?',
        choices: ['TypeScript', 'JavaScript'],
      },
    ]);

  log.log(`🦀  ${language.tsjs} it is!\n`);

  const deps = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'optionalDependencies',
      message: '🦀  So what utilities are you going to need? React Router is included by default.',
      choices: [
        'Redux', 'React Query', 'TailwindCSS', 'React Bootstrap', 'Material UI', 'Font Awesome', 'Styled Components'
      ],
    },
  ])

  log.log(`🦀  OK, got it. Creating new project in "${name}" directory.\n\n`);

  log.log('🦀 All of the output after the crabs is from Create React App, not from Crab\n');
  log.log('🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀\n');

  const craCommand = `npx create-react-app ${name}${language.tsjs === 'TypeScript' ? ' --template=typescript' : ''}`;
  let craRunning = true;
  // setTimeout(() => {
  //   if (craRunning) log.log('🦀  Create React App is still installing. It\'s a pretty long process, but there isn\'t a lot we can do about it.');
  // }, 1000);

  // setTimeout(() => {
  //   if (craRunning) log.log('🦀  Still installing. It\'s got a lot of stuff to do...');
  // }, 3000);

  setTimeout(() => {
    if (craRunning) log.log('🦀  Seriously this is a pretty long process. It\'s working, it\'s just long.');
  }, 10000);
  // const { stdout } = await execa.command(craCommand);
  // console.log(stdout);


  const subprocess = execa.command(craCommand);
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  craRunning = false;

  log.log('🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀');
  log.log('🦀 Create React App has finished its work. Crab is taking over and setting up your stuff.');

  log.log(`🦀 Switching to ${name} directory to install software.`);
  process.chdir(name);

  await installers.installReactRouter();

  console.log(deps.optionalDependencies);

  if (deps.optionalDependencies.includes('React Query')) {
    await installers.installReactQuery();
  }
  if (deps.optionalDependencies.includes('TailwindCSS')) {
    await installers.installTailwind();
  }
}

const install = (feature, cmd) => {

  let args = utils.cleanArgs(cmd);

  const options = {
    tailwind: installers.installTailwind,
    'react-query': installers.installReactQuery
  };

  if (args.list || feature === 'list') {
    log.log(`🦀  Install options are: ${Object.keys(options).join(', ')}`);
    return;
  }

  if (!Object.keys(options).includes(feature)) {
    log.danger(`🛑  ${feature} is not an option`);
    log.log(`🦀  Install options are: ${options.join(', ')}`);
    return;
  }

  if (!utils.isCurrentRoot()) {
    log.danger(`🛑  You can only install in the application root directory.`);
    return;
  }

  options[feature]();
}

module.exports = { crab, generate, create, install };
