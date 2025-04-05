import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import prettier from "prettier";
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

export const hasRouter = (): "react-router" | "tanstack-router" | null => {
  const deps = getDependencies();
  if (hasDependency("react-router-dom", deps)) return "react-router";
  if (hasDependency("@tanstack/router", deps)) return "tanstack-router";
  return null;
};

export const getFormLibrary = (): "react-hook-form" | "formik" | null => {
  const deps = getDependencies();
  if (hasDependency("react-hook-form", deps)) return "react-hook-form";
  if (hasDependency("formik", deps)) return "formik";
  return null;
};

// export type Prop = {
//   name: string;
//   type: string;
// }

// export const parseProps = (props: string): Prop[] => {
//   if(!props) return [];
//   return props.split(',').reduce((acc, prop) => {
//     let [name, type] = prop.split(':').map(p => p.trim());
//     if (!type) type = name === 'children' ? 'React.ReactNode' : 'string';

//     acc.push({name, type});
//     return acc;
//   }, [] as Prop[]);
// }

export type PropState = {
  name: string;
  type: string;
  setter: string;
  defaultValue: any;
};

export const generatePropStateArray = (optionsValue: string): PropState[] => {
  if (!optionsValue) return [];
  return optionsValue.split(",").map((state: string) => {
    let [name, type, defaultValue] = state.split(":");
    if (!type) type = name === "children" ? "React.ReactNode" : "string";

    const setter = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;

    return { name, type, setter, defaultValue };
  });
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
    props: `React.${elementName}HTMLAttributes`,
    element: `HTML${elementName}Element`,
  };
};

export const generatePropArgs = (props: PropState[]) => {
  if (!props.length) return "";

  return props.map((prop: PropState) => prop.name.trim()).join(", ");
};
