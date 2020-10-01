"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.psyBootInfo = void 0;
const path_1 = __importDefault(require("path"));
const pkg_1 = require("./pkg");
const tsConfig_1 = require("./tsConfig");
async function psyBootInfo() {
    const { pkg, pkgPath } = await pkg_1.psyBootInfoPkg();
    const projectDir = pkgPath ? path_1.default.dirname(pkgPath) : process.cwd();
    const tsConfigPath = tsConfig_1.psyBootInfoTsConfigFind(projectDir);
    if (!tsConfigPath)
        throw new Error(`tsconfig.json not found`);
    const tsConfig = tsConfig_1.psyBootInfoTsConfig(tsConfigPath);
    const { options: { outDir = path_1.default.resolve('-'), rootDir: srcDir = path_1.default.resolve('.'), }, } = tsConfig;
    const lib = pkg.source ? false : true;
    return {
        lib,
        projectDir,
        outDir,
        srcDir,
        pkg,
        pkgPath,
    };
}
exports.psyBootInfo = psyBootInfo;
//# sourceMappingURL=info.js.map