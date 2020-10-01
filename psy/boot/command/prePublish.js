"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandPrePublishYargs = exports.commandPrePublish = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const sys_1 = require("../sys");
const pkg_1 = require("../info/pkg");
const copy = sys_1.psyBootCreateCopy();
const distRegex = /^.*\//;
async function commandPrePublish({ resourcesMask, srcDir, outDir, pkgPath }) {
    var _a, _b, _c, _d;
    await copy({ resourcesMask, srcDir, outDir });
    const { pkg: pkgSrc } = await pkg_1.psyBootInfoPkg(pkgPath);
    const pkg = {
        ...pkgSrc,
        typings: (_a = pkgSrc.typings) === null || _a === void 0 ? void 0 : _a.replace(distRegex, ''),
        main: (_b = pkgSrc.main) === null || _b === void 0 ? void 0 : _b.replace(distRegex, ''),
        module: (_c = pkgSrc.module) === null || _c === void 0 ? void 0 : _c.replace(distRegex, ''),
        browser: (_d = pkgSrc.browser) === null || _d === void 0 ? void 0 : _d.replace(distRegex, ''),
    };
    await fs_1.promises.writeFile(path_1.default.join(outDir, 'package.json'), JSON.stringify(pkg, null, '  '));
}
exports.commandPrePublish = commandPrePublish;
exports.commandPrePublishYargs = {
    command: 'prepublish',
    describe: 'Copy package.json to build directory and fix main section',
    handler: commandPrePublish,
    builder: (y) => y.option('resourcesMask', {
        type: 'string',
        default: '!(node_modules)/*.{npmrc,npmignore,md,png};doc/**;bin/**',
        description: 'Resources glob mask, relative to src dir',
    }),
};
//# sourceMappingURL=prePublish.js.map