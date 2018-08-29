const log = require('./log');

const destroyFile = (error) => {
  if(error.code === 'ENOENT') {
    log.danger(`File does not exist and cannot be deleted.`);
  }

}

const writeGeneratedFile = (error) => {
  
  if (error.code === 'EEXIST') {
    log.danger(`A file already exists at ${error.path}. Overwriting prevented.`);
  }

  if (error.code === 'ENOENT') {
    log.danger(`Not able to create ${error.path}.\n\nYou can create components directly to any subdirectory, but the directory itself must already exist.`);
  }
}

module.exports = { destroyFile, writeGeneratedFile };