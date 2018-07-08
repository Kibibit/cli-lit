## CLI-lit

generate a lit CLI tool from a typescript class

## Installation

### Install Globally
```
npm i -g @kibibit/cli-lit 
```
and run it using
```
cli-lit --name <cli_name> --file <typescript_file> --class <exported_class>
```

### Install Locally
```
npm i --save @kibibit/cli-lit
```
Then, you can add it to your `package.json` as a script:
```javascript
"scripts": {
  // ...
  "generate-cli": "cli-lit --name <cli_name> --file <typescript_file> --class <exported_class>"
}
```
and run it using
```
npm run generate-cli
```

### Available Decorators

Some decorators are included to allow modifying the given typescript class when mapping it into a CLI tool.

You can rename functions, add a description, and more. Also, you can define some functions as a **pre-run** functions.

#### @clidescription

This will attach a description string to each function. That description will be displayed when calling the function with `-h` or `--help`. This is usually a one liner summary of what the function does.

#### @clirename

If you want to rename a function in it's CLI form, you can pass the new name to the `clirename` decorator. This is usually combined with `cligroup` to allow function hierarchy, like nesting `set` and `get` functions inside a group.

#### @cligroup

you can group functions into sub-categories by using `@cligroup`. To create a nested group inside a group, you can chain the group names with a `.`. See example below.

#### @cliOptionalParam

Some variables might be optional in their CLI form. Either because they are optional in their normal form, but sometimes because you want to create a more complex logic like fetching tokens in a `beforeEach` function. See example below.

#### @cliIgnore

Ignore this function when translating the class into a CLI.

#### @cliBeforeEach 

You can create function that run before the action selected happens. For example, you might want to fetch a token from the system's keychain in order to do an http request, or ask the user to input a username and password in an [`inquirer.js`](https://github.com/SBoudrias/Inquirer.js/) manner (some examples below). The function will be called before the action called in a promise chain. So the `@cliBeforeEach` decorator can be used to return either an object of values or a Promise that solves into an object of values. That object will be then passed as arguments to the called function, by matching the keys of the object with the function's parameter names.

. this function will get the following parameters as input:
```typescript
@cliBeforeEach()
static beforeActualAction(funcName) {
// ...
}
```

See example below.

#### @cliAfterEach

Same as `@cliBeforeEach` but runs after every function. this function will get the following parameters as input:
```typescript
@cliAfterEach()
static afterActualAction(funcName, output, inputsObject) {
// ...
}
```

## Examples

```typescript
import * as request from 'request-promise';
import * as keytar from 'keytar';
import * as homeConfig from 'home-config';
import { description, cligroup, cliRename, cliOptionalParams, cliBeforeEach } from '@kibibit/cli-lit';

const cfg = homeConfig.load('.myConfigFile');

export class UserActions {
    /* Added FOR the CLI.
     * This will make sure the user is logged in
     * already and retrieve the user token to
     * pass to the function called. If the
     * user is not logged in, throw an error. */
    @cliBeforeEach()
    static getUserToken() {
        const loginErr = Error('Please run my-cli setup to login');

        if (!cfg.username) throw loginErr;

        return keytar.getToken('myCLI', cfg.username)
          .then((token) => {
              return {
                  token: token
              };
          })
          .catch((err) => {
              throw loginErr;
          });
    }

    /* Added FOR the CLI.
     * This will save the user token in the OS's keychain,
     * and the logged in username in a configuration
     * file called .myConfigFile in order to do this once and pass the token using the getUserToken function */
    @cliAfterEach()
    static saveUserToken(functionName, returnValue, givenParams) {
        if (functionName === 'loginUser') {
            return keytar
                .setPassword('myCLI', givenParams.username, returnValue)
                .then(() => cfg.username = givenParams.username)
                .then(() => cfg.save())
        }
    }

    @cliRename('setup')
    @clidescription(`Initial setup to use the CLI`)
    static loginUser(username, password) {
        const options = createLoginOptions(username, password);

        return request(options);
    }

    @cliRename('set')
    @clidescription(`Set the logged in user's email`)
    @cligroup('user.email')
    static setEmail(token, email) {
        const options = postOptions('/user', token, {
            email: email
        });

        return request(options);
    }

    @cliRename('get')
    @clidescription(`Get the logged in user's email`)
    @cligroup('user.email')
    static getEmail(token) {
        const options = getOptions('/user/email', token);

        return request(options);
    }

    @cliRename('publish')
    @clidescription(`Publish a new blog piece`)
    @cligroup('user.blog')
    static postBlog(token, title, markdown) {
        const options = postOptions('/blog', token, {
            title: title,
            body: markdown
        });

        return request(options);
    }

    @cliRename('read')
    @clidescription(`Read a blog piece. Get's a title as a search term`)
    @cligroup('user.blog')
    static getBlog(token, title) {
        const options = getOptions(`/blog/${title}`, token);

        return request(options);
    }
}
```

Will be implemented soon:
- `@cliIgnore`
- `@cliAfterEach`
- rename `description` to `clidescription`
- ability to add order to the beforeEach and afterEach functions