"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function description() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (target, propertyKey, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        var originalMethod = descriptor.value;
        originalMethod.description = args.join('\n');
        return descriptor;
    };
}
exports.description = description;
function cligroup(groupName) {
    return function (target, propertyKey, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        var originalMethod = descriptor.value;
        originalMethod.group = groupName;
        return descriptor;
    };
}
exports.cligroup = cligroup;
function cliRename(newFunctionName) {
    return function (target, propertyKey, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        var originalMethod = descriptor.value;
        originalMethod.cliName = newFunctionName;
        return descriptor;
    };
}
exports.cliRename = cliRename;
