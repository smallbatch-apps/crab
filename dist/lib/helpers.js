import handlebars from "handlebars";
export default () => {
    handlebars.registerHelper("isChildren", function (name) {
        return name === "children";
    });
    handlebars.registerHelper("hasChildren", function (options) {
        return options.props.some((p) => p.name === "children");
    });
    handlebars.registerHelper("isPropSpread", function (name) {
        return name === "...props";
    });
    handlebars.registerHelper("hasPropSpread", function (options) {
        return options.props.some((p) => p.name === "...props");
    });
    handlebars.registerHelper("importStatement", function (name, isNamed) {
        return isNamed ? `{ ${name} }` : name;
    });
    handlebars.registerHelper("propType", function (resourceName, options) {
        const { readonlyProps, props, javascript, reactFC } = options;
        if (javascript || reactFC || !props.length)
            return "";
        return readonlyProps
            ? `: Readonly<${resourceName}Props>`
            : `: ${resourceName}Props`;
    });
    handlebars.registerHelper("cssRoot", function (cssModuleRoot) {
        return cssModuleRoot || "container";
    });
    handlebars.registerHelper("isSelfClosing", function (element) {
        if (!element)
            return false;
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
        if (defaultValue)
            return defaultValue;
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
        if (!defaultValue)
            return "";
        return type === "string" ? ` = "${defaultValue}"` : ` = ${defaultValue}`;
    });
    handlebars.registerHelper("getStoryDefault", function (type, defaultValue) {
        console.log("type:", type, "defaultValue:", defaultValue, "typeof:", typeof defaultValue);
        if (!defaultValue)
            return '""';
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
        if (!props.length)
            return "";
        const newProps = props
            .map((p) => {
            if (p.name === "...props")
                return p.name;
            if (!p.defaultValue)
                return p.name;
            const defaultStr = p.type === "number" ||
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
    handlebars.registerHelper("propsDefinition", function (resourceName, options) {
        console.log("propsDefinition", resourceName, options);
        const { typeProps, extends: hasExtends, elementProps, elementType, } = options;
        if (typeProps) {
            // Type syntax
            return `type ${resourceName}Props = ${hasExtends ? `${elementProps}<${elementType}> & ` : ""}{`;
        }
        else {
            // Interface syntax
            return `interface ${resourceName}Props${hasExtends ? ` extends ${elementProps}<${elementType}>` : ""} {`;
        }
    });
};
