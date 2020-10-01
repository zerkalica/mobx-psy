"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.psyBootInfoTsConfig = exports.psyBootInfoTsConfigFind = void 0;
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const formatHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
    getNewLine: () => typescript_1.default.sys.newLine,
};
function psyBootInfoTsConfigFind(directory, configName = 'tsconfig.json') {
    return typescript_1.default.findConfigFile(directory, typescript_1.default.sys.fileExists, configName);
}
exports.psyBootInfoTsConfigFind = psyBootInfoTsConfigFind;
const cache = new Map();
function psyBootInfoTsConfig(configPath) {
    let params = cache.get(configPath);
    if (!params) {
        const rec = typescript_1.default.readConfigFile(configPath, typescript_1.default.sys.readFile);
        if (rec.error)
            throw new Error(typescript_1.default.formatDiagnostic(rec.error, formatHost));
        params = typescript_1.default.parseJsonConfigFileContent(rec.config, typescript_1.default.sys, path_1.default.dirname(configPath), undefined, configPath);
        cache.set(configPath, params);
    }
    return params;
}
exports.psyBootInfoTsConfig = psyBootInfoTsConfig;
//# sourceMappingURL=tsConfig.js.map