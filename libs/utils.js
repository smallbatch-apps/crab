// const log = require('./log');
// const ncp = require('ncp').ncp;
const { EOL } = require('os');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const FILE_CRACO = 'craco.config.js';
const FILE_PKG = 'package.json';
const FILE_TS = 'tsconfig.json';

const formatFile = async (file, parser = 'javascript') => {
  const fullPath = path.join(rootDirectory(), file);
  const contents = fs.readFileSync(fullPath);
  const formatted = prettier.format(contents, { parser });
  fs.writeFileSync(fullPath, formatted);
}

const formatContent = async (contents, parser = 'javascript') => {
  return prettier.format(contents, { parser });
}

const createImportString = (imported, from = false) => {
  let importString = `import ${imported}`;
  if (from) {
    importString += `from '${from}'`;
  }
  return importString;
}

const isTypescript = () => fs.existsSync(path.join(rootDirectory(), 'tsconfig.json'));

const findFinalImportLine = array => {
  let importEnds = 0;
  array.forEach((line, index) => {
    if (line.substr(0, 6) === 'import') importEnds = index;
  })
  return importEnds + 1;
}

const resolveTemplateFile = (args) => {
  let file = args.type;
  if (args.type === 'component' || args.type === 'route') {
    file = args.functional ? 'component-functional' : 'component';
  }

  let templateDirectory = args.typescript ? 'typescript' : 'javascript';

  return `${templateDirectory} /${file}.${args.fileExtension}`;
}

const loadJsonFile = file => {
  const contents = fs.readFileSync(path.join(rootDirectory(), file));
  return JSON.parse(contents);
}

const loadCracoConfig = () => {
  const contents = fs.readFileSync(path.join(rootDirectory(), FILE_CRACO));
  return JSON.parse(contents.replace('module.exports = '));
}

const setJsonFile = (json, file) => {
  const fileName = path.join(rootDirectory(), file);
  fs.writeFileSync(fileName, JSON.stringify(json));
  formatFile(fileName, 'json');
}

const setTsCompilerOptions = options => {
  if (!isTypescript()) return false;
  const json = loadJsonFile(FILE_TS);
  json.compilerOptions = {
    ...json.compilerOptions,
    ...options
  }
  setJsonFile(json, FILE_TS);
}

const setCracoConfig = json => {
  const fileName = path.join(rootDirectory(), FILE_CRACO);
  fs.writeFileSync(fileName, 'module.exports = ' + JSON.stringify(json));
  formatFile(fileName);
}

const cracoAddPlugins = (plugins, location = 'postcss') => {
  const json = loadCracoConfig();
  plugins = Array.isArray(plugins) ? plugins : [plugins];
  location = location === 'postcss' ? json.style[location] : json[location];

  const newPlugins = [...Set.fromArray([...location.plugins, ...plugins.map(plugin => `require('${plugin}')`)])];
  if (location === 'postcss') {
    json.style.postcss = newPlugins;
  } else {
    json[location] = newPlugins;
  }
  const fileName = path.join(rootDirectory(), FILE_CRACO);
  fs.writeFileSync(fileName, 'module.exports = ' + JSON.stringify(json));
  formatFile(fileName);
}

const insertImport = (stringContent, importString) => {
  const newContent = stringContent.split(EOL);

  newContent.splice(findFinalImportLine(newContent), 0, importString)
  return newContent.join(EOL);
}

const resolveGeneratedFilePath = (args) => {
  const base = `${args.resourceName}.${args.fileExtension}`;
  return path.join(process.cwd(), args.directory, base);
}

const getPathToComponents = (componentPath, args) => {
  return safePathRelative(path.dirname(componentPath), args.rootDirectory) + 'components/';
}

const safePathRelative = (from, to) => path.relative(from, to);

const templateDirectory = args => args.typescript ? 'typescript' : 'javascript';

const cleanArgs = cmd => {
  let args = {};

  if (cmd._name !== 'create') {
    args = {
      rootDirectory: rootDirectory()
    };
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

  if(args.javascript) args.typescript = false;
  if(args.react) args.next = false;

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

const isRootAtPath = path => fs.existsSync(`${path}package.json`);

const rootDirectory = () => {
  if (isRootAtPath(`${process.cwd()}/`)) {
    return process.cwd();
  }

  let relativePath = '';

  for (let i = 0; i < 7; i++) {
    relativePath += '../';
    if (isRootAtPath(`${process.cwd()}/${relativePath}`)) {
      return path.resolve(process.cwd(), relativePath);
    }
  }
  return false;
}

const hooksLookup = {
  useState: 'React',
  useEffect: 'React',
  useMemo: 'React',
  useContext: 'React',
  useReducer: 'React',
  useNavigate: 'ReactRouter',
  useParams: 'ReactRouter',
  useQuery: 'ReactQuery',
  useMutation:'ReactQuery',
  useQueryClient: 'ReactQuery',
  useCache: 'ReactQuery',
  useSelector: 'Redux',
  useDispatch: 'Redux',
  useStore: 'Redux'
}

const parseProps = props => {
  return props.split(',').map(prop => {
    const { name, type = 'string' } = prop.split(':');
    return { name, type };
  })
}

const parseState = state => {
  return state.split(',').map(key => {
    const { name, type = 'string' } = key.split(':');
    return { name, type };
  })
}


const pageDirectory = () => path.normalize(path.join(rootDirectory(), 'src/components/pages'));

const isCurrentRoot = () => isRootAtPath(`${process.cwd()}/`);

module.exports = { loadJsonFile, cracoAddPlugins, loadCracoConfig, setJsonFile, setCracoConfig, setTsCompilerOptions, formatFile, formatContent, createImportString, isTypescript, findFinalImportLine, insertImport, cleanArgs, resolveTemplateFile, templateDirectory, rootDirectory, pageDirectory, resolveGeneratedFilePath, getPathToComponents, isCurrentRoot, hooksLookup, parseProps, parseState, FILE_CRACO, FILE_PKG, FILE_TS };
