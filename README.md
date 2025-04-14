# CRAB V3 - Revenge of the Crab

## Overview

The `crab` command line utility is intended as a CLI for React. It is drawn from extensive experience with the value of the comprehensive Ember CLI tool, but also inspired in part by VueCLI and create-react-app.

V3 is a complete rewrite of the original crab from scratch. It is a much more modern tool, and is built on the latest version of Node.js, and factors in the latest React best practices, and changes to tooling and the ecosystem.

The primary change to previous versions is that is has **lost** the ability to scaffold a new project. At its inception, getting a project started well was challenging, and so crab was designed to make this as easy as possible. However, Vite and NextJS have made this much easier, and so crab no longer needs to do this. It is now intended for generating the components, pages, and other elements of a React and/or NextJS application.

## Installation and basic usage

If you want to, you can use the global `crab-cli` command. That makes a shorter command of `crab g MyComponent` but it is not required.

```
npm install -g crab-cli
crab g components/Menu
```

The more common usage approach will be to just use npx. This will install the package locally and then execute it.

```
npx crab-cli g component Menu
```

## Usage

### generate

Create a component file for React. By default this will be a TypeScript component but you can force it to javascript with the `--javascript` or `-j` flag. Note that you shouldn't need to do this manually, and it is not recommended. Crab will note that the environment is JavaScript and will generate a JavaScript file. The `-j` flag is only really useful to make a JavaScript file in a TypeScript project.

Simple example

```
npx crab-cli generate component Menu
```

As the `generate` command is aliased to `g`, and the following is identical.

```
npx crab-cli g component Menu
```

Last but not least though it's encouraged, `component` is also not required. Crab will assume you're making a component if you don't tell it something else.

```
npx crab-cli g Menu
```

A `.tsx` is appended to the filename automatically and is not required, but is harmless and will not duplicate if accidentally added. (Obviously a .jsx file in the case of JavaScript files.)

Crab will create the file in the current directory if you are inside a valid component directory, or in the `src/components` directory if you are not.

```
npx crab-cli g ui/nav/NavBar
```

There are some more advanced options available that allow you to generate a more complete component. In particular you can pass through props, state values, and if you're extending a standard element type.

Options are:

| Option                    | Description                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `-p, --props <props>`     | Comma separated list of props with optional types (e.g., name:string,active:boolean,children)   |
| `-s, --state <state>`     | Comma separated list of state variables with optional types (e.g., count:number,isOpen:boolean) |
| `--forwardRef`            | Create component as a forwardRef                                                                |
| `--test`                  | Include a test file for the resource                                                            |
| `--storybook`             | Include a Storybook story                                                                       |
| `--css`                   | Include a CSS module file                                                                       |
| `-e, --env <environment>` | React environment directive ('use client' or 'use server')                                      |
| `-x, --extends <element>` | HTML element to extend (e.g., button, input, div)                                               |
| `--js, --javascript`      | Generate JavaScript instead of TypeScript                                                       |

Usage example:

```
npx crab-cli g component SubmitButton --props variant:string,children --extends button --env client --test --css
```

Props and state have the same format: a comma separated list with optional types and default values separated by a colon. Default values are inferred from the type if not provided. Custom types can be used but they must be imported manually. String is the default if type is not set.

For example

```
... --props variant:ButtonVariant:primary,isActive:boolean,children
```

This will include the props variant as a "ButtonVariant" type, with a default of `"primary"`. The `isActive` prop will be a boolean, and `children` will be a `React.ReactNode`.

State works exactly the same. A useState hook is generated for each state variable, and the state is initialized to the default value.

There are a few minor features that are not immediately obvious. In the props list the values `children` and `...props` have special handling. The `...props` prop will be spread into the component automatically. The `children` prop will be added to the component automatically. A children prop is automatically typed as `React.ReactNode`, while the `...props` prop will not be included in the props type for the component.

#### crab

The command `crab` will allow you to generate crab by using `npx crab-cli crab`. This will output a 🦀.

| Option        | Description                              |
| ------------- | ---------------------------------------- |
| `-a, --ascii` | outputs an orange (\\/)!\_!(\\/) instead |

This is mostly just used as a health check command to ensure that the package is loaded for testing and development.

#### init

The `init` command is used to generate a `crab.json` file. This file is used to configure the behavior of crab, overriding the defaults.

```
crab init
```

You can then edit this file to configure the behavior of crab, but note that the values set in there are all the defaults anyway. If you create the file and change nothing it will have no effect. Simply delete any lines you don't want to change.

Genuine consideration will be given to additional configuration options if they are needed. This is the full `crab.json` file, however the generated file doesn't have any of the comments. It is included here for reference.

```
{
  "arrowFunction": false,             // Use arrow function syntax
  "importReact": false,               // import React is not required since React 17
  "typeProps": false,                 // use type instead of interface for props
  "exportNamed": false,               // export function Button (vs export default function Button)
  "readonlyProps": false,             // : Readonly<Props>
  "reactFC": false,                   // const Button: React.FC<ButtonProps>
  "inlineExport": false,              // export default function Button
  "returnType": false,                // include the return type JSX.Element on the function
  "cssModuleRoot": "container",       // the root class for the CSS module
  "componentDir": "src/components",   // the root element for the component
  "lowercaseFilename": false,         // create a kebab-case filename eg submit-button.tsx
}
```

### Advanced usage

```
npx crab-cli g forms/CustomInput --props label:string,value:string,onChange:Function,error:string,disabled:boolean,required:boolean,children,...props --state isFocused:boolean:false,touched:boolean:false --extends input --env client --test --storybook --css
```

The above is probably a warcrime. But here is the output. First there's the actual component.

```
"use client";

import { useState } from "react";
import styles from "./CustomInput.module.css";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: Function;
  error: string;
  disabled: boolean;
  required: boolean;
  children: React.ReactNode;
}

function CustomInput({
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  children,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>();
  const [touched, setTouched] = useState<boolean>();

  return <input className={styles.container} {...props} />;
}

export default CustomInput;
```

And a storybook file.

```
import type { Meta, StoryObj } from "@storybook/react";
import CustomInput from "./CustomInput";

const meta: Meta<typeof CustomInput> = {
  component: CustomInput,
  title: "Components/CustomInput",
};

export default meta;
type Story = StoryObj<typeof CustomInput>;

export const Default: Story = {
  args: {
    label: "",
    value: "",
    onChange: "",
    error: "",
    disabled: false,
    required: false,
    children: "",
  },
};

export const Empty: Story = {
  args: {},
};
```
