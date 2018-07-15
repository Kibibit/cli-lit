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
