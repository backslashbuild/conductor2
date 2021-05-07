#!/usr/bin/env node
const fs = require("fs");
const util = require("util");
const path = require("path");
const chalk = require("chalk");
const program = require("commander");
const YAML = require("yamljs");

const system = require("./system");
const checkSchema = require("./check-schema");

const readFile = util.promisify(fs.readFile);

const handleError = (error) => {
  console.log(chalk.red(error));
  process.exit(1);
};

program
  .version(require("./package.json").version)
  .usage("[options] [config file]")
  .arguments("[config file]", "The config file, defaults to ./conductor.yml")
  .action(async (configFile = "./conductor.yml") => {
    try {
      const configString = await readFile(configFile, {
        encoding: "utf8",
      }).catch(handleError);
      const config = YAML.parse(configString);

      const { valid, message } = checkSchema(config);
      if (!valid) handleError(message);

      system(config);
    } catch (e) {
      return handleError(e);
    }
  });

program.parse(process.argv);
