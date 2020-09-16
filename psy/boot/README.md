# Typescript build scripts

`@psy/boot` command line utility and library, that exports three commands: clean, watch, build.
This commands runs `tsc`, `jest`, `rm` and helps to integrate custom dev servers, bundlers, watchers into your application or library.

## Install

In your application or library.

package.json

```json
{
  "scripts": {
    "clean": "@psy/boot clean",
    "build": "@psy/boot build prod",
    "build:dev": "@psy/boot build dev",
    "watch": "@psy/boot watch dev",
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

`@psy/boot clean` removes files in your project by default mask. You can customize this mask.

`--cleanMask` Clean file glob mask, defaults: `"dist,*.tsbuildinfo,*.log"`

### Build

`@psy/boot build <target>` (default target is `prod`)

* Runs `tsc --build`
* Removes `__tests__` in `outDir`, this makes unnecessary `tsconfig.build.json` or `tsconfig.test.json`
* Creates empty assets (svg, css, img, etc) in `outDir`, if some of them imported in any `src/*.tsx?`, this helps to run server side code directly without bundlers
* Runs `<outDir>/app/<target>/build.js` if exists. You can place webpack or parcel calls here

### Watch

`@psy/boot watch <target>` (default target is `dev`)

If exists `<rootDir>/app/<target>/watch.ts` (your custom dev server)

* creates empty assets (svg, css, img, etc) in `outDir`, if some of them imported in any `src/*.tsx?`, this helps to run server side code directly without bundlers
* runs `tsc --build`
* Runs `<outDir>/app/<target>/watch.js` if exists. You can place express init and webpack or parcel middlewares here.

else (library)

* Runs `tsc --build --watch`

## Base configs

To prevent copypaste, you can extend some configs from `@psy/boot` in your project.

### tsconfig.json

`@psy/mobx/tsconfig.json`

```json
{
    "extends": "@psy/boot/tsconfig.base.json",
    "exclude": [
        ".cache",
        "**/dist",
        "**/node_modules"
    ],
    "compilerOptions": {
        "baseUrl": "packages",
        "paths": {
            "@psy/mobx": ["@psy/mobx/src"],
            "@psy/mobx-*": ["@psy/mobx-*/src"]
        }
    }
}
```

`@psy/mobx/packages/@psy/mobx/tsconfig.json`

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

`@psy/mobx/jest.config.js`

```js
module.exports = {
  projects: ["<rootDir>/packages/*"]
}
```

`@psy/mobx/packages/@psy/mobx/jest.config.js`

```js
module.exports = require('@psy/boot').jestConfig(__dirname)
```

### prettier.config.js

`@psy/mobx/prettier.config.js`

```js
module.exports = require('@psy/boot').createPrettierConfig(__dirname)
```

`@psy/mobx/packages/@psy/mobx/prettier.config.js`

```js
module.exports = require('@psy/boot').createPrettierConfig(__dirname)
```

## Advanced

* For additional help, use `@psy/boot --help` or `@psy/boot <command> --help`.
* Example monorepository with libraries and application: [@psy/mobx](https://github.com/zerkalica/mobx-psy)
