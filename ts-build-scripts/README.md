# Typescript build scripts

`ts-build-scripts` command line utility and library, that exports three commands: clean, watch, build.
This commands runs `tsc`, `jest`, `rm` and helps to integrate custom dev servers, bundlers, watchers into your application or library.

## Install

In your application or library.

package.json

```json
{
  "scripts": {
    "clean": "ts-build-scripts clean",
    "build": "ts-build-scripts build prod",
    "build:dev": "ts-build-scripts build dev",
    "watch": "ts-build-scripts watch dev",
    "test": "jest"
  }
}
```

Optionally (usable for aplications) you can create additional command-helpers:

`src/app/<target>/` - where `target` is `dev`, `prod`, `my-custom-production-1` or `testing-some-2`

  `watch.ts` - watch command, you can place express init and webpack or parcel middlewares here.

  `build.ts` - build command, you can place webpack or parcel calls here.

## Commands

All commands use `outDir`, `rootDir` options from your project `tsconfig.json`.

### Clean

`ts-build-scripts clean` removes files in your project by default mask. You can customize this mask.

`--cleanMask` Clean file glob mask, defaults: `"dist,*.tsbuildinfo,*.log"`

### Build

`ts-build-scripts build <target>` (default target is `prod`)

* Runs `tsc --build`
* Removes `__tests__` in `outDir`, this makes unnecessary `tsconfig.build.json` or `tsconfig.test.json`
* Creates empty assets (svg, css, img, etc) in `outDir`, if some of them imported in any `src/*.tsx?`, this helps to run server side code directly without bundlers
* Runs `<outDir>/app/<target>/build.js` if exists. You can place webpack or parcel calls here

### Watch

`ts-build-scripts watch <target>` (default target is `dev`)

If exists `<rootDir>/app/<target>/watch.ts` (your custom dev server)

* creates empty assets (svg, css, img, etc) in `outDir`, if some of them imported in any `src/*.tsx?`, this helps to run server side code directly without bundlers
* runs `tsc --build`
* Runs `<outDir>/app/<target>/watch.js` if exists. You can place express init and webpack or parcel middlewares here.

else (library)

* Runs `tsc --build --watch`

## Base configs

To prevent copypaste, you can extend some configs from `ts-build-scripts` in your project.

### tsconfig.json

`mobx-psy/tsconfig.json`

```json
{
    "extends": "ts-build-scripts/tsconfig.base.json",
    "exclude": [
        ".cache",
        "**/dist",
        "**/node_modules"
    ],
    "compilerOptions": {
        "baseUrl": "packages",
        "paths": {
            "mobx-psy": ["mobx-psy/src"],
            "mobx-psy-*": ["mobx-psy-*/src"]
        }
    }
}
```

`mobx-psy/packages/mobx-psy/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### jest.config.js

`mobx-psy/jest.config.js`

```js
module.exports = {
  projects: ["<rootDir>/packages/*"]
}
```

`mobx-psy/packages/mobx-psy/jest.config.js`

```js
module.exports = require('ts-build-scripts/jestConfig').jestConfig(__dirname)
```

### prettier.config.js

`mobx-psy/prettier.config.js`

```js
module.exports = require('ts-build-scripts').createPrettierConfig(__dirname)
```

`mobx-psy/packages/mobx-psy/prettier.config.js`

```js
module.exports = require('ts-build-scripts').createPrettierConfig(__dirname)
```

## Advanced

* For additional help, use `ts-build-scripts --help` or `ts-build-scripts <command> --help`.
* Example monorepository with libraries and application: [mobx-psy](https://github.com/zerkalica/mobx-psy)
