import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import prettier from "prettier";
import * as ts from "typescript";
// import * as path from 'path';

interface SymbolMatch {
  name: string;
  filePath: string;
  kind: ts.SyntaxKind;
  requiresImport: boolean;
  isDefaultExport: boolean;
}

// Convert kebab-case or snake_case to PascalCase for components
export const formatName = (name: string) => {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

export const findProjectRoot = (
  startDir: string = process.cwd()
): string | null => {
  let currentDir = startDir;

  while (true) {
    if (existsSync(join(currentDir, "package.json"))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);

    if (parentDir === currentDir) return null;

    currentDir = parentDir;
  }
};

export function findComponentRoot() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) return null;

  const possibleRoots = [
    join(projectRoot, "src/components"),
    join(projectRoot, "components"),
  ];

  for (const root of possibleRoots) {
    if (existsSync(root)) return root;
  }
  return null;
}

export const isTypescriptProject = (): boolean => {
  const projectRoot = findProjectRoot();
  if (!projectRoot) return false;
  return existsSync(join(projectRoot, "tsconfig.json"));
};

export const getDependencies = (): Record<string, any> => {
  const root = findProjectRoot();
  if (!root) return {};
  const packageJson = JSON.parse(
    readFileSync(join(root, "package.json"), "utf8")
  );
  return { ...packageJson.dependencies, ...packageJson.devDependencies };
};

export const isNextProject = (): boolean => hasDependency("next");
export const hasStorybook = (): boolean => hasDependency("storybook");

export const hasDependency = (
  dep: string,
  deps?: Record<string, string>
): boolean => {
  return Object.hasOwn(deps || getDependencies(), dep);
};

export const getTestFramework = (): "jest" | "vitest" | null => {
  const deps = getDependencies();
  if (hasDependency("jest", deps)) {
    return "jest";
  }
  if (
    hasDependency("vitest", deps) &&
    hasDependency("@testing-library/react", deps)
  ) {
    return "vitest";
  }

  return null;
};

export const getStoreImplementation = ():
  | "zustand"
  | "redux"
  | "mobx"
  | "jotai"
  | null => {
  const deps = getDependencies();
  if (hasDependency("zustand", deps)) return "zustand";
  if (hasDependency("mobx", deps)) return "mobx";
  if (hasDependency("redux", deps)) return "redux";
  if (hasDependency("jotai", deps)) return "jotai";
  return null;
};

export const getValidationLibrary = (): "zod" | "yup" | null => {
  const deps = getDependencies();
  if (hasDependency("zod", deps)) return "zod";
  if (hasDependency("yup", deps)) return "yup";
  return null;
};

export const hasRouter = (): "react-router" | "tanstack-router" | null => {
  const deps = getDependencies();
  if (hasDependency("react-router-dom", deps)) return "react-router";
  if (hasDependency("@tanstack/router", deps)) return "tanstack-router";
  return null;
};

export const getFormLibrary = ():
  | "react-hook-form"
  | "formik"
  | "tanstack-form"
  | null => {
  const deps = getDependencies();
  if (hasDependency("react-hook-form", deps)) return "react-hook-form";
  if (hasDependency("formik", deps)) return "formik";
  if (hasDependency("@tanstack/react-form", deps)) return "tanstack-form";
  return null;
};

export type PropState = {
  name: string;
  type: string;
  setter: string;
  defaultValue: any;
};

export const generatePropStateArray = (optionsValue: string): PropState[] => {
  if (!optionsValue) return [];
  return optionsValue
    .split(",")
    .map((state: string) => {
      let [name, type, defaultValue] = state.split(":");
      if (!type) type = name === "children" ? "ReactNode" : "string";

      const setter = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;

      return { name, type, setter, defaultValue };
    })
    .filter((prop) => prop.name !== "");
};

export const loadCrabConfig = (): Record<string, any> => {
  const root = findProjectRoot();
  if (!root) return {};
  try {
    const configFile = readFileSync(join(root, "crab.json"), "utf8");
    return JSON.parse(configFile);
  } catch (e) {
    return {};
  }
};

export const prettify = async (code: string): Promise<string> => {
  const config = await prettier.resolveConfig(process.cwd());
  const formatted = prettier.format(code, {
    ...config,
    parser: "typescript", // still need to specify parser
  });
  return formatted;
};

const specialElementNames: Record<string, string> = {
  hr: "HR",
  br: "BR",
  ul: "UList",
  ol: "OList",
  li: "LI",
  td: "TableDataCell",
  tr: "TableRow",
  th: "TableHeaderCell",
  dd: "DescriptionDetails",
  dt: "DescriptionTerm",
  dl: "DescriptionList",
  img: "Image",
  iframe: "IFrame",
  thead: "TableHeader",
  tbody: "TableBody",
  tfoot: "TableFooter",
  colgroup: "TableColumnGroup",
  fieldset: "FieldSet",
  datalist: "DataList",
  optgroup: "OptGroup",
} as const;

export const getElementType = (element: string) => {
  const elementName =
    specialElementNames[element] ||
    element.charAt(0).toUpperCase() + element.slice(1);

  return {
    name: element,
    props: `${elementName}HTMLAttributes`,
    element: `HTML${elementName}Element`,
  };
};

export const generatePropArgs = (props: PropState[]) => {
  if (!props.length) return "";

  return props.map((prop: PropState) => prop.name.trim()).join(", ");
};

export const resolvePaths = (templateOptions: Record<string, any>) => {
  const cwd = process.cwd();
  const rootDir = findProjectRoot() ?? "";
  const { componentDir, path } = templateOptions;

  const compFullPath = join(rootDir, componentDir);

  const isInComponentDir = cwd.startsWith(compFullPath);

  const finalPath = isInComponentDir
    ? join(cwd, path)
    : join(compFullPath, path);

  console.log("Final path", finalPath);

  return finalPath;
};

export const toKebabCase = (name: string) => {
  return name
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
};

export function findSymbols(names: string[]): Map<string, SymbolMatch[]> {
  const searchPath = findProjectRoot();
  if (!searchPath) throw new Error("Could not find project root");
  const program = ts.createProgram([searchPath], {});
  const results = new Map<string, SymbolMatch[]>();

  names.forEach((name) => results.set(name, []));

  // Single pass through all files
  for (const sourceFile of program.getSourceFiles()) {
    if (
      sourceFile.fileName.includes("node_modules") ||
      sourceFile.fileName.includes("lib.d.ts")
    )
      continue;

    ts.forEachChild(sourceFile, (node) => {
      if (
        (ts.isTypeAliasDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isClassDeclaration(node) ||
          ts.isEnumDeclaration(node)) &&
        node.name?.text &&
        names.includes(node.name.text)
      ) {
        const isExported = node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );

        if (isExported) {
          const matches = results.get(node.name.text) || [];
          matches.push({
            name: node.name.text,
            filePath: sourceFile.fileName,
            kind: node.kind,
            requiresImport: !sourceFile.fileName.endsWith(".d.ts"),
            isDefaultExport:
              node.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
              ) ?? false,
          });
          results.set(node.name.text, matches);
        }
      }
    });
  }

  return results;
}
