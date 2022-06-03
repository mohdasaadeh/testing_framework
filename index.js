#!/usr/bin/env node

const FilesRunner = require("./FilesRunner");

const filesRunner = new FilesRunner();

filesRunner.collectFiles(process.cwd()).then(() => {
  filesRunner.runTestFiles();
});
