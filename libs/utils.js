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

const copyAppTemplate = (type, destination) => {
  log.crab('Copying app files');
  ncp(source, destination, function (err) {
    if (err) {
      console.error(err);
    }
    console.log(chalk.green('done!'));
  });
}

const cleanArgs = (cmd) => {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

module.exports = { handleParcel, cleanArgs, copyAppTemplate };