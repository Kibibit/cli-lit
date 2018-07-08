export function clidescription(...args : string[]) {
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

export function cliHiddenParams(hiddenArray: string[]) {
    return addValueToFunction('hiddenParams', hiddenArray);
}

export function cliBeforeEach() {
    return addValueToFunction('beforeEach', true);
}

export function cliAfterEach() {
    return addValueToFunction('afterEach', true);
}

export function cliIgnore() {
    return addValueToFunction('ignore', true);
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