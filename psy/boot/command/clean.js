"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandCleanYargs = exports.commandClean = void 0;
const sys_1 = require("../sys");
async function commandClean({ cleanMask, projectDir, }) {
    const cmds = cleanMask.split(',');
    await sys_1.del(cmds, { cwd: projectDir });
}
exports.commandClean = commandClean;
exports.commandCleanYargs = {
    command: 'clean',
    describe: 'Clean project dist directory',
    handler: commandClean,
    builder: (y) => y.option('cleanMask', {
        type: 'string',
        default: '-,*.tsbuildinfo,*.log',
        description: 'Clean file glob mask',
    }),
};
//# sourceMappingURL=clean.js.map