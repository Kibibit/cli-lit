export function description(...args : string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        let originalMethod = descriptor.value;

        originalMethod.description = args.join('\n');

        return descriptor;
    };
}

export function cligroup(groupName) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        let originalMethod = descriptor.value;

        originalMethod.group = groupName;

        return descriptor;
    };
}

export function cliRename(newFunctionName) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if(descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        let originalMethod = descriptor.value;

        originalMethod.cliName = newFunctionName;

        return descriptor;
    };
}