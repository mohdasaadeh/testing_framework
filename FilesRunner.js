const { readdir, lstat } = require("node:fs/promises");
const path = require("path");
require("colors");

const render = require("./render");

const ignoredFolders = [".git", "node_modules"];

class FilesRunner {
  constructor() {
    this.testFiles = [];
  }

  async collectFiles(workingPath) {
    const files = await readdir(workingPath);

    for (let file of files) {
      const filePath = path.join(workingPath, file);
      const stat = await lstat(filePath);

      if (stat.isFile() && file.includes(".test.js")) {
        this.testFiles.push({ name: file });
      } else if (stat.isDirectory() && !ignoredFolders.includes(file)) {
        const subFiles = await readdir(filePath);

        files.push(...subFiles.map((f) => path.join(file, f)));
      }
    }
  }

  async runTestFiles() {
    for (let file of this.testFiles) {
      const forEaches = [];

      global.render = render;

      global.forEach = (fn) => {
        forEaches.push(fn);
      };

      console.log(file.name);

      global.it = async (desc, fn) => {
        forEaches.forEach((fn) => fn());

        try {
          await fn();

          console.log("OK".green, desc);
        } catch (err) {
          console.log("X".red, desc);
          console.log(err.message.red);
        }
      };

      try {
        require(path.join(process.cwd(), file.name));
      } catch (err) {
        console.log(err.message);
      }
    }
  }
}

module.exports = FilesRunner;
