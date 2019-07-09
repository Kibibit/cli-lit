import { cliDescription, cliHiddenParams, cliOptionalParams } from '../decorators';

export class Cli {
  @cliDescription('this is very nice')
  @cliOptionalParams([ 'token' ])
  static testFunction(token: string, hello: string) {
    console.log(`hello ${ hello }`);
  }
}
