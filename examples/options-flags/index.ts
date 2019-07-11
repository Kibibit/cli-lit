import { cliDescription, cliGroup, cliRename, cliOptionalParams, cliBeforeEach, cliIgnore, cliHiddenParams } from '@kibibit/cli-lit';

declare var console: any;

export class TaTa {
  @cliRename('setup')
  @cliDescription(`Initial setup to use the CLI`)
  @cliHiddenParams([ 'options' ])
  static funcWithOptions(regular: string, options: any) {
    console.log('length of arguments: ', [].slice.call(arguments).length);
    console.log('got the following single param: ', regular);
    console.log('got the following options: ', options);
  }

  @cliGroup('nice')
  @cliDescription(`Initial setup to use the CLI`)
  @cliHiddenParams([ 'options' ])
  static test2(regular: string, options: any) {
    console.log('length of arguments: ', [].slice.call(arguments).length);
    console.log('got the following single param: ', regular);
    console.log('got the following options: ', options);
  }
}
