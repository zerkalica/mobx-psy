"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.psyBootInfoPkgSync = exports.psyBootInfoPkg = void 0;
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = require("fs");
async function psyBootInfoPkg(pkgPath) {
    pkgPath = pkgPath !== null && pkgPath !== void 0 ? pkgPath : (await find_up_1.default('package.json'));
    const packageJsonData = await (pkgPath
        ? fs_1.promises.readFile(pkgPath)
        : '');
    const pkg = packageJsonData
        ? JSON.parse(packageJsonData.toString())
        : {};
    return { pkg, pkgPath };
}
exports.psyBootInfoPkg = psyBootInfoPkg;
function psyBootInfoPkgSync(pkgPath) {
    pkgPath = pkgPath !== null && pkgPath !== void 0 ? pkgPath : find_up_1.default.sync('package.json');
    const packageJsonData = (pkgPath
        ? fs_1.readFileSync(pkgPath)
        : '');
    const pkg = packageJsonData
        ? JSON.parse(packageJsonData.toString())
        : {};
    return { pkg, pkgPath };
}
exports.psyBootInfoPkgSync = psyBootInfoPkgSync;
//# sourceMappingURL=pkg.js.map