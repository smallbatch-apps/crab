import { generatePropStateArray, loadCrabConfig, prettify, getTestFramework, getElementType, findProjectRoot, isTypescriptProject, findComponentRoot, resolvePaths, toKebabCase, } from "./utils.js";
import handlebars from "handlebars";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, basename, join, format, relative, resolve } from "path";
import chalk from "chalk";
import registerHelpers from "./helpers.js";
registerHelpers();
export const generate = async (type, name, options) => {
    const { name: resourceName, path } = parseComponentPath(name);
    const templateOptions = {
        ...loadCrabConfig(),
        ...options,
    };
    templateOptions.resourceName = resourceName;
    templateOptions.path = path;
    templateOptions.cwd = process.cwd();
    // templateOptions.componentPath = resolveComponentDirectory({
    //   name: resourceName,
    //   path: templateOptions.path,
    // });
    templateOptions.filename = templateOptions.lowercaseFilename
        ? toKebabCase(resourceName)
        : resourceName;
    if (!templateOptions.componentDir) {
        templateOptions.componentDir = findComponentRoot();
    }
    templateOptions.finalPath = resolvePaths(templateOptions);
    templateOptions.rootDir = findProjectRoot();
    templateOptions.resourceName = basename(name);
    templateOptions.path = dirname(name);
    if (!templateOptions.props && templateOptions.extends) {
        templateOptions.props = "...props";
    }
    if (templateOptions.forwardRef) {
        templateOptions.inlineExport = false;
        templateOptions.reactFC = false;
        templateOptions.arrowFunction = false;
        templateOptions.importReact = true;
    }
    templateOptions.props = generatePropStateArray(templateOptions.props);
    templateOptions.state = generatePropStateArray(templateOptions.state);
    // force to javascript if it's not a typescript project but has no setting
    if (!Object.hasOwn(templateOptions, "javascript") && !isTypescriptProject()) {
        templateOptions.javascript = true;
    }
    if (type === "component") {
        generateComponent(templateOptions);
    }
    else if (type === "storybook") {
        generateStorybook(templateOptions);
    }
    else if (type === "test") {
        generateTest(templateOptions);
    }
};
export const generateComponent = async (templateOptions) => {
    templateOptions.imports = [];
    templateOptions.env = templateOptions.env
        ? `"use ${templateOptions.env}";`
        : false;
    if (templateOptions.arrowFunction &&
        templateOptions.inlineExport &&
        !templateOptions.exportNamed) {
        templateOptions.inlineDefaultArrow = true;
    }
    if (templateOptions.state.length) {
        templateOptions.importReact = false;
        templateOptions.imports.push('import { useState } from "react"');
    }
    if (templateOptions.css) {
        templateOptions.imports.push(`import styles from './${templateOptions.resourceName}.module.css'`);
    }
    if (templateOptions.reactFC) {
        templateOptions.arrowFunction = true;
        templateOptions.inlineExport = false;
        templateOptions.readonlyProps = false;
        templateOptions.returnType = false;
    }
    if (templateOptions.extends) {
        const elementTypes = getElementType(templateOptions.extends);
        if (templateOptions.props.length === 0) {
            templateOptions.props = ["...props"];
        }
        templateOptions.elementType = elementTypes.element;
        templateOptions.elementProps = elementTypes.props;
    }
    templateOptions.typeAnnotation = getPropName(templateOptions);
    templateOptions.propName = `${templateOptions.resourceName}Props`;
    templateOptions.hasChildren = templateOptions.props.some((p) => p.name === "children");
    const templatePath = getTemplatePath("component");
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const finishedTemplate = await prettify(template(templateOptions));
    const filename = buildComponentPath(templateOptions);
    if (existsSync(filename)) {
        console.log("File already exists: ", filename);
        return;
    }
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, finishedTemplate);
    console.log(chalk.green(`🦀 ${templateOptions.resourceName} component generated`));
    if (templateOptions.storybook) {
        generateStorybook(templateOptions);
    }
    if (templateOptions.test) {
        generateTest(templateOptions);
    }
    if (templateOptions.css) {
        generateCssModule(templateOptions);
    }
};
export const generateStorybook = async (templateOptions) => {
    const filename = buildStorybookPath(templateOptions);
    if (existsSync(filename)) {
        console.log("File already exists: ", filename);
        return;
    }
    const templatePath = getTemplatePath("storybook");
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const finishedTemplate = await prettify(template(templateOptions));
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, finishedTemplate);
    console.log(chalk.green(`🦀 ${templateOptions.resourceName} storybook generated`));
};
export const generateTest = async (templateOptions) => {
    const testFramework = getTestFramework();
    if (!testFramework) {
        console.log("No test framework found");
        return;
    }
    const templatePath = getTemplatePath(`test-${testFramework}`);
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const finishedTemplate = await prettify(template(templateOptions));
    const filename = buildTestPath(templateOptions);
    if (existsSync(filename)) {
        console.log("File already exists: ", filename);
        return;
    }
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, finishedTemplate);
    console.log(chalk.green(`🦀 ${templateOptions.resourceName} test generated`));
};
const generateCssModule = async (templateOptions) => {
    const templatePath = getTemplatePath("css");
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const finishedTemplate = template(templateOptions);
    const filename = buildCssModulePath(templateOptions);
    if (existsSync(filename)) {
        console.log("File already exists: ", filename);
        return;
    }
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, finishedTemplate);
    console.log(chalk.green(`🦀 ${templateOptions.resourceName} css module generated`));
};
const getPropName = (templateOptions) => {
    if (templateOptions.javascript)
        return "";
    if (!templateOptions.props.length)
        return "";
    if (templateOptions.readonlyProps)
        return `: Readonly<${templateOptions.propName}>`;
    return ": " + templateOptions.propName;
};
export const getTemplatePath = (name) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return join(__dirname, "../../templates", `${name}.hbs`);
};
function parseComponentPath(fullPath) {
    const name = basename(fullPath); // Gets 'Button'
    const path = dirname(fullPath); // Gets 'forms'
    return { name, path };
}
// function checkPathOverlap(cwd: string, splitPath: ComponentPath) {
//   // Get the path segments after 'components/'
//   const cwdSegments = cwd.split("/components/")[1]?.split("/") || [];
//   const { name, path } = splitPath;
//   const pathSegments = path.split("/");
//   // Look for overlapping segments
//   const overlap = pathSegments.some((segment) => cwdSegments.includes(segment));
//   if (overlap) {
//     throw new Error(
//       `Warning: Path '${path}' overlaps with current directory structure.\n` +
//         `You are in: ${cwdSegments.join("/")}\n` +
//         `Consider:\n` +
//         `- 'crab g component ${name}' to create in current directory\n` +
//         `- Use a full path from components root for a different location`
//     );
//   }
// }
function buildComponentPath(templateOptions) {
    const path = templateOptions.finalPath;
    const name = templateOptions.filename;
    return format({
        dir: relative(process.cwd(), path),
        name,
        ext: templateOptions.javascript ? "jsx" : "tsx",
    });
}
function buildTestPath(templateOptions) {
    const path = templateOptions.finalPath;
    const name = templateOptions.filename + ".test";
    return format({
        dir: relative(process.cwd(), path),
        name,
        ext: templateOptions.javascript ? "jsx" : "tsx",
    });
}
function buildStorybookPath(templateOptions) {
    const path = templateOptions.finalPath;
    const name = templateOptions.filename + ".stories";
    return format({
        dir: relative(process.cwd(), path),
        name,
        ext: templateOptions.javascript ? "jsx" : "tsx",
    });
}
function buildCssModulePath(templateOptions) {
    const path = templateOptions.finalPath;
    const name = templateOptions.filename + ".module";
    return format({
        dir: relative(process.cwd(), path),
        name,
        ext: "css",
    });
}
// function resolveComponentDirectory(
//   componentPath: ComponentPath,
//   configComponentDir?: string
// ) {
//   const { name, path } = componentPath;
//   const cwd = process.cwd();
//   // 1. Use configured directory if provided
//   if (configComponentDir) {
//     return {
//       path: join(configComponentDir, path),
//       name,
//     };
//   }
//   // 2. Use current directory if in components/
//   if (cwd.includes("/components")) {
//     // Check for path overlap to prevent confusing nesting
//     checkPathOverlap(cwd, { name, path });
//     // If no path, use current directory
//     if (path === "." || path === "") {
//       return {
//         path: cwd,
//         name,
//       };
//     }
//     // With path, use absolute from components root
//     const componentsRoot = cwd.split("/components")[0] + "/components";
//     return {
//       path: join(componentsRoot, path),
//       name,
//     };
//   }
//   // 3. Look for components directory
//   const possibleRoots = [join(cwd, "src/components"), join(cwd, "components")];
//   for (const root of possibleRoots) {
//     if (existsSync(root)) {
//       return {
//         path: join(root, path),
//         name,
//       };
//     }
//   }
//   throw new Error(
//     "Could not find components directory. " +
//       "Please specify a componentDir in crab.json or " +
//       "run this command from within a components directory"
//   );
// }
export const init = async () => {
    const templatePath = getTemplatePath("crabrc");
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const projectRoot = findProjectRoot() ?? ".";
    if (resolve(projectRoot) !== resolve(process.cwd())) {
        console.log("Directory is not project root");
        return;
    }
    // const finishedTemplate = template(templateOptions))
    writeFileSync(join(projectRoot, "crab.json"), template({}));
};
