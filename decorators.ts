/**
 * Create a description for the CLI.
 *  That description will be displayed when
 * calling the function with `-h` or `--help`.
 * This is usually a one liner summary of
 * what the function does.
 * @example
 * ```typescript
 * .@cliDescription(`get the user's info`)
 * static getUserInfo(userId) { ... }
 * ```
 * @param args the description of the function
 */
export function cliDescription(...args: string[]) {
  return addValueToFunction("description", args.join("\n"));
}

/**
 * Create a group or several groups
 * for the function in CLI form.
 * To create a nested group inside a group,
 * you can chain the group names with a `.`.
 * @example
 * ```typescript
 * // will create a cli command:
 * // $ cli user info get <user_id>
 * .@cliRename('get')
 * .@cliGroup('user.info')
 * static getUserInfo(userId) { ... }
 * ```
 * @param {string} cliGroup The group path string.
 * every inner group is separated by a dot (.)
 */
export function cliGroup(groupName: string) {
  return addValueToFunction("group", groupName);
}

/**
 * Give this function a different name
 * in CLI mode.
 * This is usually **combined with `@cliGroup`**
 * to allow function hierarchy, like
 * nesting set and get functions inside a group.
 * @example
 * ```typescript
 * // will create a cli command:
 * // $ cli get <user_id>
 * .@cliRename('get')
 * static getUserInfo(userId) { ... }
 * ```
 * @param {string} newFunctionName the new function name
 */
export function cliRename(newFunctionName: string) {
  return addValueToFunction("cliName", newFunctionName);
}

/**
 * Optional params for this function.
 * Usually when a default value is set
 * to that param in typescript or passed
 * from the @cliBeforeEach function
 * @example
 * ```typescript
 * // will create a cli command:
 * // $ cli renameUser <new_name>
 * .@cliOptionalParams(['newName'])
 * static renameUser(newName: string = randomName()) { ... }
 * ```
 * @param {string[]} optionalArray array of optional params
 */
export function cliOptionalParams(optionalArray: string[]) {
  return addValueToFunction("optionalParams", optionalArray);
}

/**
 * HIDDEN params for this function.
 * Usually when a beforeEach function
 * passes that argument instead
 * @example
 * ```typescript
 *
 * // won't ask the user to set a token.
 * .@cliHiddenParams(['token'])
 * static getUserInfo(token: string, ) { ... }
 * ```
 * @param {string[]} hiddenArray array of hidden params
 */
export function cliHiddenParams(hiddenArray: string[]) {
  return addValueToFunction("hiddenParams", hiddenArray);
}

/**
 * Runs before all function called.
 * The function should return an object
 * with keys as input names and value as the
 * value passed. You can also return
 * a promise that resolves to an object.
 * For example, you might want to fetch a
 * token from the system's keychain in
 * order to do an http request, or ask
 * the user to input a username and password
 * in an [`inquirer.js`](https://github.com/SBoudrias/Inquirer.js/) manner
 * @example
 * ```typescript
 * // won't ask the user to set a token.
 * .@cliBeforeEach()
 * static fetchTokenFromKeychain() {
 *   return keytar.getPassword(cfg.username)
 *     .then((token) => ({ token: token }))
 *     .catch(() => throw new Error('user not logged in'));
 * }
 * ```
 */
export function cliBeforeEach() {
  return addValueToFunction("beforeEach", true);
}

/**
 * runs after all functions called.
 * @example
 * ```typescript
 * .@cliAfterEach()
 * static logResult(functionName, returnValue, givenParams) {
 *   console.log('function result: ', returnValue);
 * }
 * ```
 */
export function cliAfterEach() {
  return addValueToFunction("afterEach", true);
}

/**
 * Ignore this function when translating the class into a CLI.
 * @example
 * ```typescript
 * .@cliIgnore()
 * static dontTraslate(arg) { ... }
 * ```
 */
export function cliIgnore() {
  return addValueToFunction("ignore", true);
}

function addValueToFunction(key: string, value: any) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }

    let originalMethod = descriptor.value;

    originalMethod[key] = value;

    return descriptor;
  };
}
