const pkginfo = require('pkginfo')(module);
const program = require('gitlike-cli');
const Handlebars = require('handlebars');
const fs = require('fs');
const ts = require('typescript');
const path = require('path');
const exec = require('child_process').exec;
const mkdirp = require('mkdirp');
const copydir = require('copy-dir');
const findRoot = require('find-root');
const _ = require('lodash');
const npm = require('npm-programmatic');

program
  .version(module.exports.version)
  .description('generate command line tools from typescript class with decorators')
  .option('-n, --name <cliName>', 'define the cli name')
  .option('-f, --file <inputFile>', 'typescript file to compile to cli')
  .option('-c, --class <typescriptClass>', 'the typescript class to use')
  .option('-g, --global', 'install the created tool globally with npm link')
  .parse(process.argv);

const options = program.options;

if (!options.file || !options.name || !options.class) {
  console.error('--file, --name and --class flags are required');
  process.exit(1);
}

// got everything we want. inject given file and name for import

let source = fs.readFileSync(__dirname + '/seed/cli-base.ts', 'utf8');
const template = Handlebars.compile(source);
const result = template({
  name: options.name,
  file: path.relative(__dirname, path.join(process.cwd(), options.file.replace(/\..*$/, ''))),
  class: options.class
});

const outputDir = process.cwd() + '/' + options.name;
mkdirp.sync(outputDir);
fs.writeFileSync(outputDir + '/index.ts', result, 'utf8');
const cliGenPackageJson = require(path.join(__dirname, '../package.json'));
const fullFilePath = path.join(process.cwd(), options.file);
const givenFilePackageJsonPath = path.join(findRoot(fullFilePath), '/package.json');
const givenFilePackageJson = JSON.parse(fs.readFileSync(givenFilePackageJsonPath, 'utf8'));

const packagesToInstall = _.merge({}, givenFilePackageJson.dependencies, cliGenPackageJson.dependencies);

let package = {
  "name": _.kebabCase(options.name),
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {},
  "bin": {
    "cli-gen": "bin/cli-gen.js"
  }
};

package.bin = {};

package.bin[_.kebabCase(options.name)] = 'index.js';

fs.writeFileSync(outputDir + '/package.json', JSON.stringify(package, null, 2), 'utf8');

console.info('Installing dependencies');
npm.install(_.keys(packagesToInstall), {
    cwd: outputDir,
    save: true
  })
  .then(function () {
    console.info('DONE!');
    console.info('compiling typescript...');
    exec(`tsc --target ES5 --experimentalDecorators ${ path.join(outputDir, '/index.ts') }`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.info('DONE!');
      console.info('creating global link');
      exec(`cd ${ outputDir } && npm link`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.info('DONE!');
      });
    });
  })
  .catch(function () {
    console.log("Unable to install package");
  });

process.on('uncaughtException', function (error) {
  console.error(error.stack);
});