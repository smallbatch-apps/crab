#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";

import { generate, init } from "./lib/commands.js";

const program = new Command();

program
  .version("3.0.0")
  .description("Modern React project utility and generator");

program
  .command("crab")
  .description("Output an emoji crab")
  .option("--ascii", "Make an ascii crab")
  .action((options) => {
    console.log(chalk.red.bold(options.ascii ? "(\\/)¡_¡(\\/)" : "🦀"));
  });

program
  .command("generate")
  .alias("g")
  .description("Generate React resources such as components and other elements")
  .argument("[type]", "Name or type of resource")
  .argument("[name]", "Name (if type specified)")
  .option("--test", "Include test file")
  .option("--forwardRef", "Include test file")
  .option("--storybook", "Include Storybook story")
  .option("--css", "Include CSS module")
  .option(
    "-p, --props <props>",
    "Comma separated list of props - name:type,name:type,name"
  )
  .option(
    "-s, --state <state>",
    "Comma separated list of state variables - name:type,name:type,name"
  )
  .option(
    "-e, --env <environment>",
    "React environment directive (client/server)"
  )
  .option("-x, --extends <extends>", "HTML element to extend")
  .option("--js, --javascript", "Use JavaScript instead of TypeScript")
  .action((resource, name, options) => {
    if (!name) {
      // Single argument - treat as component name
      generate("component", resource, options);
    } else {
      // Two arguments - normal type + name
      generate(resource, name, options);
    }
  });

program
  .command("init")
  .description("Create a new crab config file")
  .action(init);

program.parse(process.argv);
