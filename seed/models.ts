export interface ICliDefinedFunction {
  name: string;
  functionName: string;
  params: string[];
  fullParams: string[];
  optionalParams: string[];
  description: string;
  group: string;
  kib_type_kib: 'ICliDefinedFunction';
}

export interface IAllCliDefinedFunctions {
  [ functionName: string ]: ICliDefinedFunction;
}

export interface IGroupedDefinedFunctions {
  [ groupOrFunction: string ]: ICliDefinedFunction | IGroupedDefinedFunctions;
}

export interface IDecoratedFunction {
  cliName?: string;
  beforeEach?: boolean;
  afterEach?: boolean;
  hiddenParams?: string[];
  optionalParams?: string[];
  description?: string;
  group?: string;
}

export function isDefinedCliFunction(item: any): item is ICliDefinedFunction {
  return item.kib_type_kib === 'ICliDefinedFunction';
}