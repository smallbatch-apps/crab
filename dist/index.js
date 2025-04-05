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
    console.log(chalk.red(options.ascii ? "(\\/)!_!(\\/)" : "🦀"));
});
program
    .command("generate")
    .alias("g")
    .description("Generate React resources such as components and other elements")
    .argument("<type>", "Type of resource to generate (component, storybook, test)")
    .argument("<name>", "Name of the resource")
    .option("--test", "Include test file")
    .option("--storybook", "Include Storybook story")
    .option("--css", "Include CSS module")
    .option("-p, --props <props>", "Comma separated list of props - name:type,name:type,name")
    .option("-s, --state <state>", "Comma separated list of state variables - name:type,name:type,name")
    .option("-e, --env <environment>", "React environment directive (client/server)")
    .option("-x, --extends <extends>", "HTML element to extend")
    .option("--js, --javascript", "Use JavaScript instead of TypeScript")
    .action(generate);
program
    .command("init")
    .description("Create a new crab config file")
    .action(init);
program.parse(process.argv);
