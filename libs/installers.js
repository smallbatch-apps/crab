const ncp = require('ncp').ncp;
const log = require('./log');
const fs = require('fs');
const execa = require('execa');
const path = require('path');
const utils = require('./utils');

const installReactRouter = async () => {
  log.log(`🦀 Installing React Router`);

  const isTypescript = utils.isTypescript();
  const language = isTypescript ? 'typescript' : 'javascript';
  const extension = isTypescript ? 'tsx' : 'jsx';
  await execa.command(`npm i react-router-dom${isTypescript ? ' @types/react-router-dom' : ''}`);
  log.log(`🦀 React Router installed - setting up`);

  fs.mkdirSync(utils.pageDirectory(), { recursive: true });
  log.log(`🦀 Creating component and page directories`);

  createAppProvider(utils.createImportString('{BrowserRouter}', 'react-router-dom'), 'BrowserRouter');
  log.log(`🦀 Modified index.js to include browser provider`);

  await ncp(path.join(__dirname, 'templates', language, 'src/components/pages'), path.join(utils.rootDirectory(), 'src/components/pages'));
  log.log(`🦀 Set up page files for demo navigation`);

  const appfile = isTypescript ? 'App.ts' : 'App.js';
  await ncp(path.join(__dirname, 'templates', language, 'src/components', appfile), path.join(utils.rootDirectory(), 'src', appfile));
  await ncp(path.join(__dirname, 'templates/javascript/src/index.css'), path.join(utils.rootDirectory(), 'src', 'index.css'));
  log.log(`🦀 Modified App.${extension} to include switch and dashboard routes`);
}

const installReactQuery = async () => {
  log.log('🦀 Installing React Query');
  await execa.command('npm i react-query');
  log.log('🦀 React Query installed, setting up');
  const importString = utils.createImportString('{QueryClient, QueryClientProvider}', 'react-query')
  createAppProvider(importString, 'QueryClientProvider queryClient={queryClient}', 'const queryClient = new QueryClient()');
  log.log('🦀 React Query setup complete');
}

const installCraco = async () => {
  log.log('🦀 Setting up Craco for extended configuration');
  await execa.command('npm install @craco/craco');

  await ncp(path.join(__dirname, 'templates/javascript', utils.FILE_PKG), path.join(utils.rootDirectory(), utils.FILE_PKG), { clobber: false });

  const pkgjson = utils.loadJsonFile(utils.FILE_PKG)
  pkgjson.scripts = {
    ...pkgjson.scripts,
    start: 'craco start',
    build: 'craco build',
    test: 'craco test'
  };
  utils.setJsonFile(pkgjson, utils.FILE_PKG);

  log.log('🦀 Craco setup. Returning to more interesting things.');
}

const installTailwind = async () => {
  log.log('🦀 Installing Tailwind CSS');
  log.warn('🦀 This actually does some pretty weird things, and you might want to restart the NPM process once finished');
  await execa.command('npm install -D tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9');
  await installCraco();

  utils.cracoAddPlugins(['tailwindcss', 'autoprefixer'], 'tailwind');

  await ncp(path.join(__dirname, 'templates/javascript', utils.FILE_PKG), path.join(utils.rootDirectory(), utils.FILE_PKG));
  await ncp(path.join(__dirname, 'templates/javascript/src/tailwind.css'), path.join(utils.rootDirectory(), 'src', 'index.css'));
  log.log('🦀 Tailwind setup completed');
}

const installMaterialUI = async () => {
  log.log('🦀 Setting up Material UI');
  await execa.command('npm i @material-ui/core @material-ui/icons');
  if (utils.isTypescript()) {
    utils.setTsCompilerOptions({
      lib: ["es6", "dom"],
      noImplicitAny: true,
      noImplicitThis: true,
      strictNullChecks: true
    });
    log.log('🦀 Material UI setup completed');
  }

  const installStyledComponents = async () => {
    log.log('🦀 Setting up Styled Components');
    await execa.command('npm i styled-components');
    await execa.command(`npm i --save-dev ${utils.isTypescript() ? 'typescript' : 'babel'}-plugin-styled-components`);

    utils.installCraco();
    utils.cracoAddPlugins(['babel-plugin-styled-components'], 'babel');
    log.log('🦀 Styled Components completed');
  }

  const installReactBootstrap = async () => {
    log.log('🦀 Setting up React Bootstrap');
    await execa.command(`npm i react-bootstrap@next bootstrap@latest${utils.isTypescript ? '@types/react-bootstrap' : ''}`)
    log.log('🦀 React Bootstrap installed, importing css files');
    createAppProvider(utils.createImportString("'bootstrap/dist/css/bootstrap.min.css'"));
    log.log('🦀 React Bootstrap setup complete');
  }

  const createAppProvider = async (importString, providerString, codeString = null) => {
    const ext = utils.isTypescript() ? 'tsx' : 'js';
    const fileName = path.join(utils.rootDirectory(), `src/index.${ext}`)
    const contents = fs.readFileSync(fileName);
    const replacementString = `<${providerString}>
  <App />
  </${providerString.split(' ')[0]}>`;

    const codeReplacementString = `${codeString}
  
  ReactDOM.render`;

    let newContent = utils.insertImport(newContent, importString);
    if (providerString) newContent = contents.toString().replace('<App />', replacementString);
    if (codeString) newContent = newContent.replace('ReactDOM.render', codeReplacementString);

    fs.writeFileSync(fileName, newContent);
    utils.formatFile(fileName);
  }

  module.exports = { installReactRouter, installReactQuery, installTailwind, installMaterialUI, installStyledComponents, installReactBootstrap, createAppProvider };