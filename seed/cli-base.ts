import colors from 'colors';
import program, { CommanderStatic } from 'commander';
import _, { assign, forEach, forIn, get, includes, isFunction, map, set } from 'lodash';

import { ARGUMENT_NAMES, STRIP_COMMENTS } from './consts';
import { Cli } from './holder';
import { IAllCliDefinedFunctions, IGroupedDefinedFunctions, isDefinedCliFunction } from './models';

// create the basic program
program
  .version('1.0.0', '-v, --version')
  .description('create data for development testing');

createCLICommandsFromClass(program);

program.parse(process.argv);

// caught all errors
process.on('uncaughtException', (error) => {
  console.log(error.stack);
  process.exit(1);
});

// gets the param names from the function definition
function getParamNames(func: Function): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result: RegExpMatchArray | null = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  result = result === null ? [] : result;

  return result;
}

function createCLICommandsFromClass(givenProgram: CommanderStatic) {
  // get all the atomic requests members
  const allDefinedFunctions: IAllCliDefinedFunctions = {};
  const before: Function[] = [];
  const after: Function[] = [];

  forIn(Cli, (propertyValue: any, propertyName: string) => {
    const isIgnoredObjectProperty = [ 'length', 'prototype', 'name' ].includes(propertyName);
    const isIgnoredDecorator = get(Cli, `${ propertyName }.ignore`);
    const isNotAFunction = !isFunction(Cli[ propertyName ]);

    if (isIgnoredObjectProperty || isIgnoredDecorator || isNotAFunction) {
      return;
    }

    const funcName = propertyName;
    const functionObject: Function = propertyValue;

    if (Cli[ funcName ].beforeEach) {
      // @ts-ignore
      before.push(Cli[ funcName ] as any);
      return;
    }

    if (Cli[ funcName ].afterEach) {
      // @ts-ignore
      after.push(Cli[ funcName ]);
      return;
    }

    const fullParams = getParamNames(Cli[ funcName ]);
    let params = fullParams;
    if (Cli[ funcName ].hiddenParams) {
      params = fullParams.filter((param) => !includes(Cli[ funcName ].hiddenParams, param));
    }

    allDefinedFunctions[ funcName ] = {
      name: Cli[ funcName ].cliName || funcName,
      functionName: funcName,
      params,
      fullParams,
      optionalParams: Cli[ funcName ].optionalParams,
      description: Cli[ funcName ].description || '',
      group: Cli[ funcName ].group,
      kib_type_kib: 'ICliDefinedFunction'
    };
  });

  const groupedFunctions: IGroupedDefinedFunctions = groupByPath(allDefinedFunctions);

  createCLI(groupedFunctions, before, after, givenProgram);
}

function groupByPath(functionArray) {
  const groupedFunctions = {};

  forEach(functionArray, (func: any) => {
    if (func.group) {
      set(groupedFunctions, `${ func.group }.${ func.name }`, func);
    } else {
      groupedFunctions[ func.name ] = func;
    }

  });

  return groupedFunctions;
}

function createCLI(groupedFunctions: IGroupedDefinedFunctions, before, after, givenProgram) {

  forEach(groupedFunctions, (item, key) => {
    if (isDefinedCliFunction(item)) {
      // change function parameters from array to a string expected
      // by gitlike-cli: '<username> <password>'
      const visibleParamsString = item.params
        .map((param) => {
          return includes(item.optionalParams, param) ? `[${ param }]` : `<${ param }>`;
        }).join(' ');

      program.command(`${ item.name } ${ visibleParamsString }`)
        .description(colors.yellow(item.description))
        .action(function (...inputs) {
          const options: { [ key: string ]: any } = inputs.pop();
          const args: any[] = inputs;
          const inputObject = {};

          return Promise.resolve()
            .then(() => Promise.all(map(before, (func: Function) => func(item.functionName))))
            // .then(() => before.reduce((p, fn) => p.then(fn), Promise.resolve()))
            // .then((fromBefore) => console.log(fromBefore))
            .then((fromBefore: any) => assign.apply(_, fromBefore))
            .then((fromBefore) => item.fullParams.map((param, index) => {
              inputObject[ param ] = args[ index ] || fromBefore[ param ];

              return inputObject[ param ];
            }))
            // @ts-ignore
            .then((readyInputs) => Cli[ item.functionName ].apply(this, readyInputs))
            .then((output) => Promise.all(map(after, (func: Function) => func(item.functionName, output, inputObject))));
        });
    } else {
      const groupCommand = program
        .command(key)
        .description(colors.blue(`group of ${ colors.yellow(key) } commands`));

      createCLI(item, before, after, groupCommand);
    }

  });
}
