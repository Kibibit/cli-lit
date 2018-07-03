export function description(...args : string[]) {
    return addValueToFunction('description', args.join('\n'));
}

export function cligroup(groupName) {
    return addValueToFunction('group', groupName);
}

export function cliRename(newFunctionName) {
    return addValueToFunction('cliName', newFunctionName);
}

export function cliOptionalParams(optionalArray: string[]) {
    return addValueToFunction('optionalParams', optionalArray);
}

function addValueToFunction(key: string, value: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        let originalMethod = descriptor.value;

        originalMethod[key] = value;

        return descriptor;
    };
}