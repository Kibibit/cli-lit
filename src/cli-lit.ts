import Steps from 'cli-step';
import program, { CommanderStatic } from 'commander';
import findRoot from 'find-root';
import fs from 'fs-extra';
import path from 'path';
import _pkginfo from 'pkginfo';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import webpack from 'webpack';

// tslint:disable-next-line:no-var-requires
const exec = require('child_process').exec;
// tslint:disable-next-line:no-var-requires
const mergedirs = require('merge-dirs').default;

_pkginfo(module);

const totalNumberOfSteps = 5;
const steps = new Steps(totalNumberOfSteps);

program
  .version(module.exports.version)
  .description('generate command line tools from typescript class with decorators')
  .option('-n, --name <cliName>', 'define the cli name')
  .option('-f, --file <inputFile>', 'typescript file to compile to cli')
  .option('-c, --class <typescriptClass>', 'the typescript class to use')
  .option('-g, --global', 'install the created tool globally with npm link')
  .parse(process.argv);

const options = program.options;

if (!program.file || !program.name || !program.class) {
  console.error('--file, --name and --class flags are required');
  process.exit(1);
}

const outputDir = path.join(process.cwd(), './' + program.name);
const fullFilePath = path.join(process.cwd(), program.file);
const givenFilePackageJsonPath = path.join(findRoot(fullFilePath), '/package.json');
// const cliGenPackageJson = require(path.join(__dirname, '../package.json'));
// const givenFilePackageJson = JSON.parse(fs.readFileSync(givenFilePackageJsonPath, 'utf8'));

// console.log(__dirname);
const cliBase = path.join(__dirname, '../seed/cli-base.ts');

console.log('CLI BASE: ', cliBase);

fs.readFile(cliBase, 'utf-8')
  .then((fileContent) => fs.writeFile(cliBase, fileContent.replace(
    `import { KbPlaceholderCli as KbGivenCli } from './holder';`,
    `import { ${ program.class } as KbGivenCli } from '${ fullFilePath }';`
  )))
  .then(() => {
    const config: webpack.Configuration = {
      target: 'node',
      mode: 'production',
      entry: cliBase,
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            include: new RegExp(`(@kibibit\/cli-lit)|${ process.cwd() }`),
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
      },
      output: {
        path: outputDir,
        filename: `${ program.name }.bundle.js`
      },
      optimization: {
        // we don't minimze to get function parameter names
        minimize: false
      }
      // plugins: [
      //   new webpack.NormalModuleReplacementPlugin(
      //     new RegExp('holder'),
      //     (resource) => {
      //       console.log('resource found: ', resource);

      //       resource.request = resource.request;
      //     }
      //   )
      // ]
    };

    return webpackPromise(config);
  })
  .finally(() => {
    fs.readFile(cliBase, 'utf-8')
      .then((fileContent) => fs.writeFile(cliBase, fileContent.replace(
        `import { ${ program.class } as KbGivenCli } from '${ fullFilePath }';`,
        `import { KbPlaceholderCli as KbGivenCli } from './holder';`
      )))
  })
  .catch((err) => console.error(err));

export const cliLit: CommanderStatic = program;

// generateCodeFromSeed(outputDir)
//   .then(() => generatePackageJson(outputDir, options))
//   .then(() => _.keys(_.merge({}, givenFilePackageJson.dependencies, cliGenPackageJson.dependencies)))
//   .then((packagesToInstall) => installDependencies(outputDir, packagesToInstall))
//   .then(() => compilingTypescript(outputDir))
//   .then(() => createGlobalLink(outputDir))
//   .catch((err) => console.log(err));

// process.on('uncaughtException', function (error) {
//   console.error(error.stack);
// });

// function installDependencies(outputDir, dependencies) {
//   console.log();
//   const dependenciesStep = steps
//     .advance('Installing npm dependencies', 'hourglass_flowing_sand')
//     .start();

//   const cliModulesDir = path.join(outputDir, '/node_modules');
//   const originalModulesDir = path.join(findRoot(fullFilePath), '/node_modules');
//   const cliLitModulesDir = path.join(__dirname, '../node_modules');

//   return runCommand('npm install', { cwd: outputDir })
//     .then(() => dependenciesStep.success('Successfully installed dependencies', 'white_check_mark'))
//     .catch((err) => {
//       dependenciesStep.error('failed installing dependencies', 'x');

//       throw err;
//     });
// }

// function runCommand(command, options) {
//   return new Promise((resolve, reject) => {
//     exec(command, options, (err, stdout, stderr) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       resolve({
//         stdout,
//         stderr
//       });
//     });
//   });
// }

// function compilingTypescript(outputDir) {
//   console.log();
//   const tsStep = steps
//     .advance('Compiling Typescript to Javascript', 'hourglass_flowing_sand')
//     .start();

//   return new Promise((resolve, reject) => {
//     exec(`tsc --target ES5 --lib es2015 --experimentalDecorators ${ path.join(outputDir, '/index.ts') }`, (err, stdout, stderr) => {
//       if (err) {
//         tsStep.error('Could not compile file to typescript :-(', 'x');
//         reject(err);
//         return;
//       }

//       tsStep.success('Successfully compiled Typescript', 'white_check_mark');
//       resolve();
//     });
//   });
// }

// function createGlobalLink(outputDir) {
//   console.log();
//   const linkStep = steps
//     .advance('Create a global link to created CLI', 'hourglass_flowing_sand')
//     .start();

//   return new Promise((resolve, reject) => {
//     exec(`cd ${ outputDir } && npm link`, (err, stdout, stderr) => {
//       if (err) {
//         // run with sudo
//         exec(`cd ${ outputDir } && sudo npm link`, (err, stdout, stderr) => {
//           if (err) {
//             linkStep.error('Could not create global link :-(', 'x');
//             reject(err);

//             return;
//           }

//           linkStep.success('Successfully created global link', 'white_check_mark');
//           resolve();
//         });
//       } else {
//         linkStep.success('Successfully created global link', 'white_check_mark');
//         resolve();
//       }
//     });
//   });
// }

// function generatePackageJson(outputDir, options) {
//   const packageStep = steps
//     .advance('Creating package.json', 'hourglass_flowing_sand');
//   const fullFilePath = path.join(process.cwd(), options.file);
//   const givenFilePackageJsonPath = path.join(findRoot(fullFilePath), '/package.json');
//   const cliGenPackageJson = require(path.join(__dirname, '../package.json'));
//   const givenFilePackageJson = JSON.parse(fs.readFileSync(givenFilePackageJsonPath, 'utf8'));

//   let packageJson;

//   return Promise.resolve()
//     .then(() => console.log())
//     .then(() => packageStep.start())
//     .then(() => _.merge({}, givenFilePackageJson.dependencies, cliGenPackageJson.dependencies))
//     .then((dependencies) => ({
//       'name': _.kebabCase(options.name),
//       'version': '1.0.0',
//       'description': '',
//       'main': 'index.js',
//       'scripts': {
//         'test': 'echo "Error: no test specified" && exit 1'
//       },
//       'author': '',
//       'license': 'ISC',
//       'dependencies': dependencies,
//       'bin': {
//         'cli-gen': 'bin/cli-gen.js'
//       }
//     }))
//     .then((pack) => packageJson = pack)
//     .then(() => packageJson.bin = {})
//     .then(() => packageJson.bin[ _.kebabCase(options.name) ] = 'index.js')
//     .then(() => fs.writeFileSync(outputDir + '/package.json', JSON.stringify(packageJson, null, 2), 'utf8'))
//     .then(() => packageStep.success('package.json Created', 'white_check_mark'))
//     .catch((err) => packageStep.error('something went wrong'));
// }

// function generateCodeFromSeed(outputDir) {
//   const generateCodeStep = steps
//     .advance('Creating index.ts', 'hourglass_flowing_sand');

//   return Promise.resolve()
//     .then(() => console.log())
//     .then(() => generateCodeStep.start())
//     .then(() => mkdirp.sync(outputDir))
//     .then(() => fs.readFileSync(__dirname + '/seed/cli-base.ts', 'utf8'))
//     .then((source) => Handlebars.compile(source))
//     .then((template) => template({
//       name: options.name,
//       file: path.relative(outputDir, path.join(process.cwd(), options.file)).replace(/\.ts$/, ''),
//       class: options.class
//     }))
//     .then((compiledTemplate) => fs.writeFileSync(outputDir + '/index.ts', compiledTemplate, 'utf8'))
//     .then(() => generateCodeStep.success('Generated index.ts', 'white_check_mark'));
// }

async function webpackPromise(config: webpack.Configuration): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err || stats.toString());
        return;
      }

      resolve(stats);
    });
  });
}
