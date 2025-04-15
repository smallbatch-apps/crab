import handlebars from "handlebars";
import { PropState } from "./utils.js";
import { relative, join } from "path";

export default () => {
  handlebars.registerHelper("isChildren", function (name) {
    return name === "children";
  });

  handlebars.registerHelper("hasChildren", function (options) {
    return options.props.some((p: PropState) => p.name === "children");
  });

  handlebars.registerHelper("isPropSpread", function (name) {
    return name === "...props";
  });

  handlebars.registerHelper("hasPropSpread", function (options) {
    return options.props.some((p: PropState) => p.name === "...props");
  });

  handlebars.registerHelper("importStatement", function (name, isNamed) {
    return isNamed ? `{ ${name} }` : name;
  });

  handlebars.registerHelper("propType", function (resourceName, options) {
    const { readonlyProps, props, javascript, reactFC } = options;
    if (javascript || reactFC || !props.length) return "";
    if (options.forwardRef) return ", ref";
    if (options.justProps) resourceName = "";

    return readonlyProps
      ? `: Readonly<${resourceName}Props>`
      : `: ${resourceName}Props`;
  });

  handlebars.registerHelper("cssRoot", function (cssModuleRoot) {
    return cssModuleRoot || "container";
  });

  handlebars.registerHelper("isSelfClosing", function (element: string) {
    if (!element) return false;
    const selfClosingTags = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    return selfClosingTags.has(element);
  });

  handlebars.registerHelper("getDefaultState", function (type, defaultValue) {
    if (defaultValue) return defaultValue;

    switch (type) {
      case "string":
        return '""';
      case "number":
        return "0";
      case "boolean":
        return "false";
      case "array":
        return "[]";
      case "object":
        return "{}";
      default:
        return "null";
    }
  });

  handlebars.registerHelper("getDefaultProp", function (type, defaultValue) {
    if (!defaultValue) return "";
    return type === "string" ? ` = "${defaultValue}"` : ` = ${defaultValue}`;
  });

  handlebars.registerHelper("getStoryDefault", function (type, defaultValue) {
    if (type === "ReactNode" && !defaultValue) {
      return "<></>";
    }

    if (!defaultValue) return '""';

    // Raw values
    if (type === "number" || type === "boolean") {
      return defaultValue;
    }

    // Check if it's an object/array
    if (defaultValue.startsWith("{") || defaultValue.startsWith("[")) {
      return defaultValue;
    }

    // Everything else gets quotes
    // it MIGHT be a string, but it might be a custom type or enum
    return `"${defaultValue}"`;
  });

  handlebars.registerHelper("getPropArgs", function (props) {
    if (!props.length) return "";
    const newProps = props
      .map((p: PropState) => {
        if (p.name === "...props") return p.name;
        if (!p.defaultValue) return p.name;

        const defaultStr =
          p.type === "number" ||
          p.type === "boolean" ||
          p.type === "array" ||
          p.type === "object"
            ? ` = ${p.defaultValue}`
            : ` = "${p.defaultValue}"`;

        return `${p.name}${defaultStr}`;
      })
      .join(", ");

    return `{ ${newProps} }`;
  });

  handlebars.registerHelper(
    "propsDefinition",
    function (resourceName, options) {
      const {
        typeProps,
        extends: hasExtends,
        elementProps,
        elementType,
        justProps,
      } = options;

      if (justProps) resourceName = "";

      if (typeProps) {
        // Type syntax
        return `type ${resourceName}Props = ${
          hasExtends ? `${elementProps}<${elementType}> & ` : ""
        }{`;
      } else {
        // Interface syntax
        return `interface ${resourceName}Props${
          hasExtends ? ` extends ${elementProps}<${elementType}>` : ""
        } {`;
      }
    }
  );

  handlebars.registerHelper("storybookTitle", function (templateOptions) {
    const { rootDir, componentDir, finalPath, resourceName } = templateOptions;

    const relativePath = relative(join(rootDir, componentDir), finalPath);

    const pathArray = relativePath.split("/").map((segment) => {
      if (segment.toLowerCase() === "ui") return "UI";
      return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    });

    const title = ["Components", ...pathArray, resourceName].join("/");
    return `"${title}"`;
  });

  handlebars.registerHelper("exportDefinition", function (options) {
    let string = "";
    if (options.inlineExport) {
      string = "export ";
      if (!options.exportNamed) {
        string += "default ";
      }
    }
    if (options.arrowFunction && !options.inlineExport) {
      string += "const ";
    }

    if (!options.arrowFunction) {
      string += "function ";
    }

    if (
      !options.arrowFunction ||
      !options.inlineExport ||
      options.exportNamed
    ) {
      string += options.resourceName;
    }

    if (options.reactFC) {
      string += ": FC";
      if (options.props.length) {
        string += `<${options.resourceName}Props>`;
      }
    }

    if (options.arrowFunction) {
      string += " = ";
    }

    return string;
  });

  handlebars.registerHelper("displayReturnType", function (options) {
    let string = "";

    if (!options.javascript && options.returnType) {
      string += ": JSX.Element";
    }

    string += options.arrowFunction ? " => {" : " {";

    return string;
  });

  handlebars.registerHelper("refParams", function (options) {
    if (!options.forwardRef || options.javascript) return "";

    const refProps = options.props.length ? options.propName : "{}";
    const refType = options.extends ? options.elementType : "HTMLElement";

    return `<${refType}, ${refProps}>`;
  });

  handlebars.registerHelper("reactImports", function (options) {
    let imports = [];

    if (options.hasChildren) {
      imports.push("type ReactNode");
    }

    if (options.forwardRef) {
      imports.push("forwardRef");
    }

    if (options.useState) {
      imports.push("useState");
    }

    if (options.elementProps) {
      imports.push("type " + options.elementProps);
    }

    if (options.reactFC) {
      imports.push("type FC");
    }

    if (!imports.length && options.importReact) {
      return `import React from "react";`;
    }

    const isTypesOnly = imports.every((i) => i.startsWith("type "));

    imports = imports.map((i) => i.replace("type ", ""));

    if (isTypesOnly) {
      return `import type { ${imports.join(", ")} } from "react"`;
    }

    if (!imports.length && !options.importReact) {
      return "";
    }

    const importString =
      !imports.length && options.importReact
        ? "React"
        : `${isTypesOnly ? "type " : ""}{ ${imports.join(", ")} }`;

    return `import ${importString} from "react"`;
  });
};
