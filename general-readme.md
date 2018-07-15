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

## Available Decorators