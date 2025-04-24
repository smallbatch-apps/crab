import { generatePropStateArray, loadCrabConfig, prettify, getTestFramework, getElementType, findProjectRoot, isTypescriptProject, findComponentRoot, resolvePaths, toKebabCase, hasDependency, } from "./utils.js";
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
        console.log(chalk.red(`🦀 File ${filename} already exists`));
        return;
    }
    if (!hasDependency("@storybook/react")) {
        console.log(chalk.red("🦀 Storybook not installed"));
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
        console.log(chalk.red("🦀 No test framework found"));
        return;
    }
    const templatePath = getTemplatePath(`test-${testFramework}`);
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const finishedTemplate = await prettify(template(templateOptions));
    const filename = buildTestPath(templateOptions);
    if (existsSync(filename)) {
        console.log(chalk.red(`🦀 File ${filename} already exists`));
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
export const init = async () => {
    const templatePath = getTemplatePath("crabrc");
    const templateContent = readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateContent);
    const projectRoot = findProjectRoot() ?? ".";
    if (resolve(projectRoot) !== resolve(process.cwd())) {
        console.log("Directory is not project root");
        return;
    }
    writeFileSync(join(projectRoot, "crab.json"), template({}));
    console.log(chalk.green("🦀 Crab config initialized"));
};
