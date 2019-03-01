<p align="center">
  <a href="https://www.npmjs.com/package/@kibibit/cli-lit" target="blank"><img src="http://kibibit.io/kibibit-assets/cli-lit-logo-transparent.png" width="150" ></a>
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
  generate a :fire:lit:fire: CLI tool from a typescript class
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

## Functions

<dl>
<dt><a href="#cliDescription">cliDescription(...args)</a></dt>
<dd><p>Create a description for the CLI.
 That description will be displayed when
calling the function with <code>-h</code> or <code>--help</code>.
This is usually a one liner summary of
what the function does.</p></dd>
<dt><a href="#cliGroup">cliGroup(cliGroup)</a></dt>
<dd><p>Create a group or several groups
for the function in CLI form.
To create a nested group inside a group,
you can chain the group names with a <code>.</code>.</p></dd>
<dt><a href="#cliRename">cliRename(newFunctionName)</a></dt>
<dd><p>Give this function a different name
in CLI mode.
This is usually <strong>combined with <code>@cliGroup</code></strong>
to allow function hierarchy, like
nesting set and get functions inside a group.</p></dd>
<dt><a href="#cliOptionalParams">cliOptionalParams(optionalArray)</a></dt>
<dd><p>Optional params for this function.
Usually when a default value is set
to that param in typescript or passed
from the @cliBeforeEach function</p></dd>
<dt><a href="#cliHiddenParams">cliHiddenParams(hiddenArray)</a></dt>
<dd><p>HIDDEN params for this function.
Usually when a beforeEach function
passes that argument instead</p></dd>
<dt><a href="#cliBeforeEach">cliBeforeEach()</a></dt>
<dd><p>Runs before all function called.
The function should return an object
with keys as input names and value as the
value passed. You can also return
a promise that resolves to an object.
For example, you might want to fetch a
token from the system&#39;s keychain in
order to do an http request, or ask
the user to input a username and password
in an <a href="https://github.com/SBoudrias/Inquirer.js/"><code>inquirer.js</code></a> manner</p></dd>
<dt><a href="#cliAfterEach">cliAfterEach()</a></dt>
<dd><p>runs after all functions called.</p></dd>
<dt><a href="#cliIgnore">cliIgnore()</a></dt>
<dd><p>Ignore this function when translating the class into a CLI.</p></dd>
</dl>

<a name="cliDescription"></a>

## cliDescription(...args)
<p>Create a description for the CLI.
 That description will be displayed when
calling the function with <code>-h</code> or <code>--help</code>.
This is usually a one liner summary of
what the function does.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| ...args | <p>the description of the function</p> |

**Example**  
```typescript
.@cliDescription(`get the user's info`)
static getUserInfo(userId) { ... }
```
<a name="cliGroup"></a>

## cliGroup(cliGroup)
<p>Create a group or several groups
for the function in CLI form.
To create a nested group inside a group,
you can chain the group names with a <code>.</code>.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cliGroup | <code>string</code> | <p>The group path string. every inner group is separated by a dot (.)</p> |

**Example**  
```typescript
// will create a cli command:
// $ cli user info get <user_id>
.@cliRename('get')
.@cliGroup('user.info')
static getUserInfo(userId) { ... }
```
<a name="cliRename"></a>

## cliRename(newFunctionName)
<p>Give this function a different name
in CLI mode.
This is usually <strong>combined with <code>@cliGroup</code></strong>
to allow function hierarchy, like
nesting set and get functions inside a group.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| newFunctionName | <code>string</code> | <p>the new function name</p> |

**Example**  
```typescript
// will create a cli command:
// $ cli get <user_id>
.@cliRename('get')
static getUserInfo(userId) { ... }
```
<a name="cliOptionalParams"></a>

## cliOptionalParams(optionalArray)
<p>Optional params for this function.
Usually when a default value is set
to that param in typescript or passed
from the @cliBeforeEach function</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| optionalArray | <code>Array.&lt;string&gt;</code> | <p>array of optional params</p> |

**Example**  
```typescript
// will create a cli command:
// $ cli renameUser <new_name>
.@cliOptionalParams(['newName'])
static renameUser(newName: string = randomName()) { ... }
```
<a name="cliHiddenParams"></a>

## cliHiddenParams(hiddenArray)
<p>HIDDEN params for this function.
Usually when a beforeEach function
passes that argument instead</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| hiddenArray | <code>Array.&lt;string&gt;</code> | <p>array of hidden params</p> |

**Example**  
```typescript

// won't ask the user to set a token.
.@cliHiddenParams(['token'])
static getUserInfo(token: string, ) { ... }
```
<a name="cliBeforeEach"></a>

## cliBeforeEach()
<p>Runs before all function called.
The function should return an object
with keys as input names and value as the
value passed. You can also return
a promise that resolves to an object.
For example, you might want to fetch a
token from the system's keychain in
order to do an http request, or ask
the user to input a username and password
in an <a href="https://github.com/SBoudrias/Inquirer.js/"><code>inquirer.js</code></a> manner</p>

**Kind**: global function  
**Example**  
```typescript
// won't ask the user to set a token.
.@cliBeforeEach()
static fetchTokenFromKeychain() {
  return keytar.getPassword(cfg.username)
    .then((token) => ({ token: token }))
    .catch(() => throw new Error('user not logged in'));
}
```
<a name="cliAfterEach"></a>

## cliAfterEach()
<p>runs after all functions called.</p>

**Kind**: global function  
**Example**  
```typescript
.@cliAfterEach()
static logResult(functionName, returnValue, givenParams) {
  console.log('function result: ', returnValue);
}
```
<a name="cliIgnore"></a>

## cliIgnore()
<p>Ignore this function when translating the class into a CLI.</p>

**Kind**: global function  
**Example**  
```typescript
.@cliIgnore()
static dontTraslate(arg) { ... }
```

## Contributing

If you have suggestions for how @kibibit/cli-lit could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://github.com/Thatkookooguy"><img src="https://avatars0.githubusercontent.com/u/10427304?s=460&v=4" width="100px;" alt="Neil Kalman"/><br /><sub><b>Neil Kalman</b></sub></a><br /><a href="#infra-Thatkookooguy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#design-Thatkookooguy" title="Design">🎨</a> <a href="https://github.com/kibibit/cli-lit/commits?author=Thatkookooguy" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](LICENSE) © 2019 Neil Kalman <neilkalman@gmail.com>
