const log = require('./log');
const ncp = require('ncp').ncp;
const inquirer = require('inquirer');
const execa = require('execa');
const fs = require('fs');
const path = require('path');

const installParcel = async () => {  
  let answers = await inquirer.prompt({
    type: 'confirm',
    name: 'install',
    message: 'We need parceljs installed for this to work - this is a one-time install. Install globally now?'
  });
  
  
  if (answers.install) {
    log.crab('🦀  Installing parcel, please wait. This will take a minute or two.');
    execa.shellSync('npm install -g parcel-bundler');
    log.success('✅  Parcel installed\n');
  } 
  else {
    process.exitCode = 1;
    throw Error('You must install parcel to use crab. Exiting now.');
  }
}

const installTypeScript = async () => {  
  let answers = await inquirer.prompt({
    type: 'confirm',
    name: 'install',
    message: 'Because you want TypeScript support we need to add the tsc dependency - this is a one-time install. Install globally now?'
  });
  
  if (answers.install) {
    log.crab('🦀  Installing TypeScript, please wait. This will take a minute.');
    execa.shellSync('npm install -g typescript');
    log.success('✅  TypeScript installed\n');
  }
  else {
    process.exitCode = 1;
    throw Error('You must install TypeScript to use this command. Exiting now.');
  }
}

const resolveTemplateFile = (args) => {
  let file = args.type;
  if (args.type === 'component' || args.type === 'route') {
    file = args.functional ? 'component-functional' : 'component';
  }

  let templateDirectory = args.typescript ? 'typescript' : 'javascript';
  
  return `${templateDirectory}/${file}.${args.fileExtension}`;
}

const resolveGeneratedFilePath = (args) => {
  const base = `${args.resourceName}.${args.fileExtension}`;
  return path.join(process.cwd(), args.directory, base);
}

const copyAppTemplate = async (name) => {
  log.crab('🦀  Copying App files');

  return await ncp(`${__dirname}/templates/app`, `testbed/${name}`, function (err) {
    if (err) {
      console.error(err);
      return;
    }
    log.success('✅  App file structure created.');
  });
}

const validateArgs = (type, args) => {
  if (type === 'component') {
    if (args.redux && args.rootDirectory === false) {
      log.danger('🛑  Crab cannot find the root of your project where the Redux files are.\nWe are looking for a package.json file, and only searching back five parent directories. No files have been created.');
      throw Error('Cannot find project root');
    }
  }
}

const insertRouteIntoApplication = (args) => {
  const appComponentPath = `${args.rootDirectory}/components/App.${args.fileExtension}`;
  
  log.log('🦀  Updating App component');
  
  let file = fs.readFileSync(appComponentPath, { encoding: 'utf8' });

  let appArray = file.split(/\r?\n/);
  let successString = '';

  try {
    let componentRegex = new RegExp('import {([A-Za-z ,]*)} from \'./components\';');
    let componentImportLineNumber = appArray.findIndex(line => componentRegex.test(line));
    let componentLineResult = componentRegex.exec(appArray[componentImportLineNumber]);

    const replacementComponents = componentLineResult[1]
      .trim().split(', ')
      .concat(args.resourceName).join(', ');

    const newComponentImportLine = 'import { ' + replacementComponents + " } from \'./components\';";

    appArray.splice(componentImportLineNumber, 1, newComponentImportLine);
  } catch(error) {
    log.warn('⚠️  Unable to import component. You will have to do it manually.');
  }

  try {
    let lastRouteLineNumber = appArray.findIndex(line => new RegExp('</Switch>').test(line)) - 1;
  
    let newRoute = appArray[lastRouteLineNumber];
  
    let routePath = new RegExp('path="([a-zA-Z0-9/-]+)"').exec(newRoute)[1];
    let routeComponent = new RegExp('component={([a-zA-Z0-9/-]+)}').exec(newRoute)[1];
  
    newRoute = newRoute.replace(routePath, args.resourceLink)
       .replace(routeComponent, args.resourceName);

    appArray.splice(lastRouteLineNumber+1, 0, newRoute);
    
    //log.log('✅  Route entry inserted');
    //successString += 'Route entry inserted. '
  } catch(error) {
    log.warn('⚠️  Could not add Route. This may be because you do not have your routes in a <Switch> component.');
  }

  if (args.menu) {
    try {
      let lineNumber = getLastNavLineNumber(appArray);
      
      let newLink = appArray[lineNumber];

      let linkTo = new RegExp('to="([a-zA-Z0-9/-]+)"').exec(newLink)[1];
      let linkContent = new RegExp('>([^<]+)<').exec(newLink)[1];

      newLink = newLink.replace(linkTo, args.resourceLink)
        .replace(linkContent, args.resourceDisplayName);

      appArray.splice(lineNumber + 1, 0, newLink);
    } catch(error) {
      log.warn('⚠️  Could not update navigation automatically. This may be as your nav items span multiple lines, or are too complex for crab to handle.');
    }
  }

  updateApplicationFile(appComponentPath, appArray);
}

const updateApplicationFile = (appComponentPath, appArray) => {
  try {
    fs.writeFileSync(appComponentPath, appArray.join("\n"), { encoding: 'utf8' });
    log.success('✅  Updated App.js with new route\n');
  } catch(error) {
    console.error(error);
  }
}

const getLastNavLineNumber = (appArray) => {
  let linkLines = appArray.map((line, index) => {
    if (new RegExp('<(NavLink|Link)').test(line)) {
      return index;
    }
  }).filter(Boolean);

  let navArray = [];
  for (let i = 0; i <= linkLines.length; i++) {
    if (linkLines[i + 1] === linkLines[i] + 1) {
      if(!navArray.includes(linkLines[i])) {
        navArray.push(linkLines[i]);
      }
      
      navArray.push(linkLines[i + 1]);
    }
  }
  
  let navLength = navArray.length;
  if (navLength < 3) {
    
    return false;
  }

  return navArray[navLength - 1];
}

const getPathToRedux = (componentPath, args) => {
  return path.relative(path.dirname(componentPath), args.rootDirectory) + '/redux/';
}

const getPathToComponents = (componentPath, args) => {
  return path.relative(path.dirname(componentPath), args.rootDirectory) + '/components/';
}

const templateDirectory = (args) => {
  return args.typescript ? 'typescript' : 'javascript';
}

const loadCrabFile = (args) => {
  try {
    let file = fs.readFileSync(`${args.rootDirectory}/.crab`, { encoding: 'utf8' });
    return JSON.parse(file);
  } catch(error) {
    return {};
  }
}

const cleanArgs = (cmd) => {
  let args = {};
  if (cmd._name !== 'create') {
    args = {
      rootDirectory: rootDirectory()
    };
    args = Object.assign(loadCrabFile(args), args); 
  }
  
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '');
    
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
    
    if (typeof cmd[key.substr(3)] !== 'function' && typeof cmd[key.substr(3)] !== 'undefined') {
      args[key.substr(3)] = cmd[key.substr(3)];
    }
  });
  
  args.fileExtension = args.typescript ? 'tsx' : 'js';
  args.command = cmd._name;

  

  if (args.command === 'generate') {
    args.type = cmd.parent.args[0];
    let resourcePath = cmd.parent.args[1];

    if (!resourcePath) {
      args.type = 'component';
      resourcePath = cmd.parent.args[0];
    }

    if (resourcePath) {
      resourcePath = path.parse(resourcePath);
      args.resourceName = resourcePath.name;
      args.directory = resourcePath.dir;
    }
  
    if (args.resourceName) {
      args.resourceDisplayName = args.resourceName.split(/(?=[A-Z])/).join(" ");
      args.resourceLink = args.path ? 
        args.path :
        args.resourceName.split(/(?=[A-Z])/).join("-").toLowerCase();
      
      if (args.resourceLink.charAt(0) !== '/') {
        args.resourceLink = '/' + args.resourceLink;
      }
    }
  
    if (args.content) {
      args.content = args.content.split("\\n");
    }
  
    if (args.imports) {
      args.imports = args.imports.split("\\n");
    }
  
    if (args.components) {
      args.components = args.components.split(",");
    }

    args.isRoute = args.type === 'route';
  
  }
  
  return args
}

const checkGit = (args) => {
  if (args.git) {
    try {
      const { stdout } = execa.shellSync('git --version');
      return true;
    } catch(error) {
      if (error.code === 127) {
        log.warn('⚠️  The default installation initialises a git repo and you don\'t have git installed. You can remove this warning by using the "--no-git" flag, but we strongly recommend you install git. Unlike global NPM dependencies, we won\'t install git.\n');
        return false;
      } 
    }
  }
}

const updateComponentsList = (componentFile, args) => {
  
  const componentListFile = `${args.rootDirectory}/components/components.${args.typescript ? 'ts' : 'js'}`;
  
  let data = fs.readFile(componentListFile, { encoding: 'utf8', flag: 'r' }, (error,data) => {
    let entries = data.split(/\r?\n/).filter(Boolean).map((item) => {  
      let matchExport = /{ default as ([A-Za-z]*) }/g;
      let match = matchExport.exec(item);
      return match[1];
    });
    let exportAs = args.resourceName;
    
    if (entries.includes(args.resourceName)) {
      const segment = path.dirname(componentFile).split('/').filter(Boolean).pop();
      exportAs = ( segment.charAt(0).toUpperCase() + segment.slice(1) ) + args.resourceName ;
    }
  
    const exportPath = path.relative(path.dirname(componentListFile), path.dirname(componentFile));
    const exportFrom = `${exportPath ? exportPath : '.'}/${args.resourceName}`;
    const exportString = `\n\nexport { default as ${exportAs} } from '${exportFrom}';`;
    try {
      fs.appendFile(componentListFile, exportString, { encoding: 'utf8', flag: 'a' }, (error) => {
        if (!error) {
          log.success('✅  Component list updated');
        }
      });
    } catch(error) {
      if (args.isRoute) {
        throw Error('Components file not found');
      }
    }
  });
  
  
}

const createRouteDefaultContent = (args) => {
  return [
    `<h2>${args.resourceDisplayName}</h2>`,
    '',
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse convallis, lorem sit amet hendrerit dictum, nisl arcu tincidunt odio, vitae bibendum quam nibh sit amet est. Nulla eget urna lobortis, varius tellus in, tempus enim. In metus quam, aliquam sed ligula non, luctus commodo tortor. Donec ac tristique est. Sed vehicula lacus ac est posuere tempus. </p>'
  ]
}

const checkGlobalDependencies = async (args) => {
  
  if (args.command === 'create') {
    try {
      const { stdout } = execa.shellSync('parcel --version');
    } catch(error) {
      if (error.code === 127) {
        await installParcel();
      } 
    }

    if (args.typescript) {
      try {
        const { stdout } = execa.shellSync('tsc --version');
      } catch(error) {
        if (error.code === 127) {
          await installTypeScript();
        } 
      }
    }
  }
}

const isRootAtPath = (path) => {
  return fs.existsSync(`${path}package.json`);
}

const createCrabFile = ({typescript, redux}) => {
  fs.writeFileSync(`${rootDirectory()}/.crab`, JSON.stringify({typescript, redux}));
}

const rootDirectory = (args) => {
  if (isRootAtPath(`${process.cwd()}/`) ) {
    return process.cwd();
  }

  let relativePath = '';
  
  for (let i = 0; i < 5; i++) {
    relativePath += '../';
    if(isRootAtPath(`${process.cwd()}/${relativePath}`)) {
      return path.resolve(process.cwd(), relativePath);
    }
  }
  return false;
}

const isCurrentRoot = () => isRootAtPath(`${process.cwd()}/`);

const installTailwind = async () => {
  log.log(`🦀  Installing Tailwind from NPM`);
  execa.shellSync('npm install tailwindcss');
  log.success('✅  NPM install complete');
  log.log('🦀  Configuring Tailwind for building with Parcel');
  execa.shellSync('./node_modules/.bin/tailwind init');

  const configContent = `var tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss('./tailwind.js')
  ]
}`;

  const cssContent = `@tailwind preflight;
@tailwind utilities;
@tailwind components;`;

  try{
    fs.writeFileSync('postcss.config.js', configContent);
    log.success('✅  Config file created');
  } catch(error) {
    log.warn('⚠️  Unable to create file at postcss.config.js');
    log.log('You will need to manually create this file with the following content\n');
    log.log(`\n${configContent}\n`);
  }
  
  try {
    fs.writeFileSync('styles/app.css', cssContent);
    log.success('CSS file created');
  } catch (error) {
    console.log(error);
    log.warn('⚠️  A styles/index.css file already exists or cannot be created.\n');
    log.log('You will need to manually add the required css directives:');
    log.log(`\n${cssContent}\n`);
  }
  
  log.success('Tailwind successfully installed\n');
  log.warn('⚠️  You will need to import the new CSS file in the Application.js file');
  log.log('Before you can use tailwind in actual code you need to make sure the css that includes the directives is what is being imported by Parcel.\n');
  log.warn('⚠️  If using a default crab project ensure you remove the Tailwind utility class CDN import from index.html!');

}

const asciiCrab = () => {
  log.crab('                _     ');
  log.crab('  ___ _ __ __ _| |__  ');
  log.crab(' / __| \'__/ _` | \'_ \\ ');
  log.crab('| (__| | | (_| | |_) |');
  log.crab(' \\___|_|  \\__,_|_.__/ ');
}

module.exports = { checkGit, cleanArgs, copyAppTemplate, resolveTemplateFile, validateArgs, templateDirectory, rootDirectory, createCrabFile, checkGlobalDependencies, resolveGeneratedFilePath, getPathToRedux, createRouteDefaultContent, updateComponentsList, getPathToComponents, installTailwind, isCurrentRoot, insertRouteIntoApplication };
