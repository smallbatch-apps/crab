const log = require('./log');
const ncp = require('ncp').ncp;

const handleParcel = async () => {  
  let answers = await inquirer.prompt({
    type: 'confirm',
    name: 'installParcel',
    message: chalk.red('We need parceljs installed for this to work. Install globally now?')
  });
  
  if (answers.installParcel) {
    log.crab('Installing parcel, please wait');
    execa.shellSync('npm install -g parcel-bundler');
    log.success('Parcel installed successfully. Moving on.');
  } else {
    log.danger('Cannot continue without Parcel installation. Closing now.');
  }
}

const copyAppTemplate = async (name) => {
  log.crab('Copying app files');

  return await ncp(`${__dirname}/templates/app`, `testbed/${name}`, function (err) {
    if (err) {
      console.error(err);
      return;
    }
    log.success('done!');
  });
}

const hasValidArgs = (type, args) => {
  if (type === 'component') {
    if (args.functional && args.redux) {
      log.warn('You cannot use a redux in a functional component, so the redux requirement has been abandoned.\n\nYou can destroy this component with  "crab destroy" and run your command again without the -f flag to make a stateful, redux connected class component.');
      return true;
    }
    
  }
  if (type === 'class') {
    if (args.functional || args.redux || args.components) {
      log.warn('You cannot use these options in a class');
      return true;
    }
  }
  
  return true;
}

const cleanArgs = (cmd) => {
  const args = {};
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '');
    
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
    
    if (typeof cmd[key.substr(3)] !== 'function' && typeof cmd[key.substr(3)] !== 'undefined') {
      args[key.substr(3)] = cmd[key.substr(3)];
    }
  })
  return args
}

module.exports = { handleParcel, cleanArgs, copyAppTemplate, hasValidArgs };