#!/usr/bin/env node

import * as program from 'gitlike-cli';
// import * as keytar from 'keytar';
// import * as homeConfig from 'home-config';
// import * as prettyjson from 'prettyjson';
import * as _ from 'lodash';
import * as colors from 'colors';
import { {{ class }} } from "{{ file }}";

declare var process: any;
declare var Promise: any;

// const cfg = homeConfig.load('.kibgenrc');
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

program
    .version('1.0.0')
    .description('create data for development testing');

createCLICommandsFromClass(program);

program.parse(process.argv);

process.on('uncaughtException', function (error) {
    console.log(error.stack);
    process.exit(1);
});

function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function createCLICommandsFromClass(program) {
    // get all the atomic requests members
    let allAll = {};
    _.forEach(Object.getOwnPropertyNames({{ class }}), (funcName) => {
        if (['length', 'prototype', 'name', 'createPost'].indexOf(funcName) >= 0) {
            return;
        }

        let fullParams = getParamNames({{ class }}[funcName]);
        let params = fullParams
            .filter((param) => ['token', 'isSilent'].indexOf(param) < 0);

        allAll[funcName] = {
            name: {{ class }}[funcName].cliName || funcName,
            functionName: funcName,
            params: params,
            fullParams: fullParams,
            optionalParams: {{ class }}[funcName].optionalParams,
            description: {{ class }}[funcName].description || '',
            group: {{ class }}[funcName].group
        };
    });

    let groupedFunctions = groupByPath(allAll);

    createCLI(groupedFunctions, program);
}

function groupByPath(functionArray) {
    let groupedFunctions = {};

    _.forEach(functionArray, (func: any) => {
        if (func.group) {
            _.set(groupedFunctions, `${ func.group }.${func.name}`, func);
        } else {
            groupedFunctions[func.name] = func;
        }

    });

    return groupedFunctions;
}

function createCLI(groupedFunctions, program) {

    _.forEach(groupedFunctions, (item, key) => {
        if (!_.isNil(item.description)) {
            // change function parameters from array to a string expected
            // by gitlike-cli: '<username> <password>'
            let visibleParamsString = item.params
            .map((param) => {
                return _.includes(item.optionalParams, param) ? `<${ param }>` : `[${ param }]`;
            }).join(' ');
            
            program.command(`${ item.name } ${ visibleParamsString }`)
                .description(colors.yellow(item.description))
                .action(function (args, options) {
                    let token;
                    let Arr = [];

                    return Promise.resolve()
                        // .then(() => ensureConfiguration())
                        // .then((ensuredConfig) => cfg.token = ensuredConfig.token)
                        .then(() => item.params.map((param) => args[param]))
                        // .then((inputs) => console.log(`command line function called! ` + colors.yellow(`{{ class }}[${item.functionName}].apply(this, ${[cfg.token].concat(inputs).join(', ')})`)))
                        .then((inputs) => {{ class }}[item.functionName].apply(this, inputs))
                });
        } else {
            let groupCommand = program
                .command(key)
                .description(colors.blue(`${key} Group of commands`));

            createCLI(item, groupCommand);
        }

    });
}
