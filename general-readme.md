<p align="center">
  <a href="https://www.npmjs.com/package/@kibibit/cli-lit" target="blank"><img src="http://kibibit.io/kibibit-assets/lit.svg" width="250" ></a>
  <h2 align="center">
    @kibibit/cli-lit
  </h2>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@kibibit/cli-lit"><img src="https://img.shields.io/npm/v/@kibibit/cli-lit.svg?logo=npm&color=CB3837&style=for-the-badge"></a>
</p>
<p align="center">
  <!-- <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg"></a> -->
  <a href="https://greenkeeper.io/"><img src="https://img.shields.io/badge/greenkeeper-enabled-brightgreen.svg"></a>
  <!-- <a href="https://travis-ci.org/Kibibit/cli-lit"><img src="https://travis-ci.org/Kibibit/cli-lit.svg?branch=master"></a>
  <a href="https://coveralls.io/github/Kibibit/cli-lit?branch=master"><img src="https://coveralls.io/repos/github/Kibibit/cli-lit/badge.svg?branch=master"></a> -->
  <a href="#contributors"><img src="https://img.shields.io/badge/all_contributors-1-orange.svg"></a>
  <a href="https://salt.bountysource.com/teams/kibibit"><img src="https://img.shields.io/endpoint.svg?url=https://monthly-salt.now.sh&style=flat-square"></a>
</p>
<p align="center">
  generate a 🔥lit🔥 CLI tool from a typescript class
</p>
<hr>

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

## NPM Development Commands

When running `npm install @kibibit/cli-lit`, it will automatically compile
the typescript decorators.

- `npm run compile` - compile typescript decorators file to javascript
- `npm run build:doc` - will compile a new `README.md` file based on `general-readme.md` and the decorators' jsdoc comments.

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
