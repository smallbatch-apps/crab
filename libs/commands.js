const utils = require('./utils');
const inquirer = require('inquirer');
const fs = require('fs');
const handlebars = require('handlebars');
const execa = require('execa');
const chalk = require('chalk');
const errors = require('./errors');
const log = require('./log');
const path = require('path');
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

    if(args.state){
      if(!args.hooks) args.hooks = [];
      args.hooks.push('useState');
    } 

    const props = utils.parseProps(args.props);
    const propsString = props.map(({name}) => name).join(', ');
    const state = utils.parseState(args.state);

    const values = {
      importReactRouter: false,
      importReactQuery: false,
      importRedux: false,
      importReact: false,
      reactRouterHooks: false,
      reactQueryHooks: false,
      reduxHooks: false,
      reactHooks: false,
      useQuery: args.hooks.includes('useQuery'), 
      useEffect: args.hooks.includes('useEffect'), 
      useSelect: args.hooks.includes('useSelector'), 
      useState: args.hooks.includes('useState'), 
      props,
      state,
      propsString
    }
  
    if(args.hooks) {
      const allHooksGrouped = args.hooks.split(',').reduce((all, hook)=> {
        const hookLib = utils.hooksLookup[hook];
        if(!hookLib) return all;
        if(!all[hookLib]) all[hookLib] = [];
        all[hookLib].push(hook);
        return all;
      }, {});

      if(allHooksGrouped['React']) {
        values.importReact = true;
        values.reactHooks = allHooksGrouped['React'].join(', ');
      }
      if(allHooksGrouped['ReactRouter']) {
        values.importReactRouter = true;
        values.reactRouterHooks = allHooksGrouped['ReactRouter'].join(', ');
      }
      if(allHooksGrouped['ReactQuery']) {
        values.importReactQuery = true;
        values.reactQueryHooks = allHooksGrouped['ReactQuery'].join(', ');
      }
      if(allHooksGrouped['Redux']) {
        values.importRedux = true;
        values.reduxHooks = allHooksGrouped['Redux'].join(', ');
      } 
    }

    let template = handlebars.compile(data);
    let filePath = utils.resolveGeneratedFilePath(args);

    args.pathToRedux = utils.getPathToRedux(filePath, args);

    if (args.isRoute && !args.content) {
      args.content = utils.createRouteDefaultContent(args);
    }

    let finishedTemplate = utils.formatContent(template({...values, ...args}));
    
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
  
  if (name && fs.existsSync(`${process.cwd()}/${name}`)) {
    log.danger(`🛑  Directory "${name}" already exists. You cannot create a project there.\n`);
    return;
  }

  if(!name) {
    const namer = await inquirer.prompt({
      type: "input",
      name: "namer",
      message: "Please specify the name/directory, eg: my-app"
    });
    name = namer.namer;
    log.log(`🦀  Installing to ./${name} directory\n`);
  }

  if(!args.next && !args.react){
    const creator = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'rnext',
          message: 'Standard React app, or NextJS',
          choices: ['React', 'NextJS'],
        },
      ]);

    if(creator.rnext === 'NextJS') {
      args.next = true;
    }
  }


  const cmdcmd = args.next ? 'create-next-app' : 'create-react-app';
  const cmdName = args.next ? 'Create Next App': 'Create React App';

  log.log(`🦀  Scaffolding with ${cmdName}\n`);

  if(!args.typescript && !args.javascript){
    const language = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'tsjs',
        message: 'JavaScript or TypeScript?',
        choices: ['JavaScript', 'TypeScript'],
      },
    ]);
    log.log(`🦀  ${language.tsjs} it is!\n`);

    if(language.tsjs === "TypeScript") {
      args.typescript = true;
    } 
  }
  let deps = {optionalDependencies:[]};

  if(args.utils) {
    deps = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'optionalDependencies',
        message: '🦀  So what utilities are you going to need? React Router is included by default.',
        choices: [
          'Redux', 'React Query', 'TailwindCSS', 'React Bootstrap', 'Material UI', 'Font Awesome', 'Styled Components'
        ],
      },
    ])
  } 

  log.log(`🦀  OK, got it. Creating new project in "${name}" directory.\n`);

  log.log(`🦀 All of the output after the army of crabs is from ${cmdName}, not from Crab\n`);
  log.log('🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀\n');



  let cmdFlags = '';
  if(args.next) {
    cmdFlags = args.typescript ? ' --template=typescript' : '';
  } else {
    if(deps.optionalDependencies.includes('Redux')){
      cmdFlags = args.typescript ? ' --template redux-typescrip' : '--template redux';
    }
  }

  const craCommand = `npx ${cmdcmd} ${name}${cmdFlags}`;

  let craRunning = true;
  const mockCreation = true;

  if (!mockCreation) {
    setTimeout(() => {
      if (craRunning) log.log('🦀  Seriously this is a pretty long process. It\'s working, it\'s just long.');
    }, 10000);
    
    const subprocess = execa.command(craCommand);
    subprocess.stdout.pipe(process.stdout);
    await subprocess;
  } else {
    // To use this feature you MUST create a /samples directory containing 
    // all combinations of default npx installed apps
    const copyDir = path.join(__dirname, '..', 'samples', `${cmdcmd}_${args.typescript ? "typescript" : "javascript"}`);

    await ncp(copyDir, name, (error) => {
      if(error) console.log(error)
    });
    
    log.log('🦀  Copying pre-stored templates to new directory. This should only take about 10 seconds');
    await new Promise(r => setTimeout(r, 10000));
  }
  
  craRunning = false;
  
  log.log('🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀🦀');
  log.log(`🦀 ${cmdName} has finished its work. Crab is taking over and setting up your stuff.`);

  log.log(`🦀 Switching to ${name} directory to install software.`);
  process.chdir(name);
  
  if(!args.next) {
    await installers.installReactRouter();
  }

  if(args.utils) {
    if (deps.optionalDependencies.includes('React Query')) {
      await installers.installReactQuery();
    }
    if (deps.optionalDependencies.includes('TailwindCSS')) {
      await installers.installTailwind();
    }
  }

  log.success(`🦀 Crab has finished setting up. Switch to the ${name} directory to begin work.`);
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
