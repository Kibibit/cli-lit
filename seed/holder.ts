import { cliDescription, cliHiddenParams, cliOptionalParams } from '../decorators';

// tslint:disable-next-line:class-name
export class KbPlaceholderCli {
  @cliDescription('this is very nice')
  @cliOptionalParams([ 'token' ])
  static testFunction(token: string, hello: string) {
    console.log(`hello ${ hello }`);
  }
}
