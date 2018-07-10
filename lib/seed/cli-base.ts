#!/usr/bin/env node

import * as program from 'gitlike-cli';
import * as _ from 'lodash';
import * as colors from 'colors';
import { {{ class }} } from "{{ file }}";

declare var process: any;
declare var Promise: any;

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
    let before = [];
    let after = [];

    _.forEach(Object.getOwnPropertyNames({{ class }}), (funcName) => {
        if (['length', 'prototype', 'name'].indexOf(funcName) >= 0 ||
        {{ class }}[funcName].ignore ||
        !_.isFunction({{ class }}[funcName])) {
            return;
        }

        if ({{ class }}[funcName].beforeEach) {
            before.push({{ class }}[funcName]);
            return;
        }

        if ({{ class }}[funcName].afterEach) {
            after.push({{ class }}[funcName]);
            return;
        }

        let fullParams = getParamNames({{ class }}[funcName]);
        let params = fullParams;
        if ({{ class }}[funcName].hiddenParams) {
            params = fullParams.filter((param) => !_.includes({{ class }}[funcName].hiddenParams, param));
        }

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

    createCLI(groupedFunctions, before, after, program);
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

function createCLI(groupedFunctions, before, after, program) {

    _.forEach(groupedFunctions, (item, key) => {
        if (!_.isNil(item.description)) {
            // change function parameters from array to a string expected
            // by gitlike-cli: '<username> <password>'
            let visibleParamsString = item.params
            .map((param) => {
                return _.includes(item.optionalParams, param) ? `[${ param }]` : `<${ param }>`;
            }).join(' ');
            
            program.command(`${ item.name } ${ visibleParamsString }`)
                .description(colors.yellow(item.description))
                .action(function (args, options) {
                    let token;
                    let Arr = [];
                    let inputObject = {};

                    return Promise.resolve()
                        .then(() => Promise.all(_.map(before, (func: Function) => func(item.functionName))))
                        // .then(() => before.reduce((p, fn) => p.then(fn), Promise.resolve()))
                        // .then((fromBefore) => console.log(fromBefore))
                        .then((fromBefore) => _.assign.apply(_, fromBefore))
                        .then((fromBefore) => item.fullParams.map((param, index) => {
                            inputObject[param] = args[param] || fromBefore[param];

                            return inputObject[param];
                        }))
                        .then((inputs) => {{ class }}[item.functionName].apply(this, inputs))
                        .then((output) => Promise.all(_.map(after, (func: Function) => func(item.functionName, output, inputObject))));
                });
        } else {
            let groupCommand = program
                .command(key)
                .description(colors.blue(`group of ${colors.yellow(key)} commands`));

            createCLI(item, before, after, groupCommand);
        }

    });
}
