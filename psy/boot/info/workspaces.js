"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.psyBootInfoWorkspacesSync = void 0;
const find_up_1 = __importDefault(require("find-up"));
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const pkg_1 = require("./pkg");
function psyBootInfoWorkspacesSync(srcRoot = process.cwd()) {
    let workspaceRoot = srcRoot;
    let workspaces;
    do {
        const pkgPath = find_up_1.default.sync('package.json', { cwd: workspaceRoot });
        if (!pkgPath)
            return undefined;
        const p = pkg_1.psyBootInfoPkgSync(pkgPath);
        workspaces = p === null || p === void 0 ? void 0 : p.pkg.workspaces;
        workspaceRoot = path_1.default.dirname(workspaceRoot);
    } while (!workspaces);
    return globby_1.default
        .sync(workspaces.map(ws => `${ws}/package.json`), { cwd: workspaceRoot })
        .map(pkgPath => pkg_1.psyBootInfoPkgSync(path_1.default.join(workspaceRoot, pkgPath)));
}
exports.psyBootInfoWorkspacesSync = psyBootInfoWorkspacesSync;
//# sourceMappingURL=workspaces.js.map