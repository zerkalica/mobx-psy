"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandYargs = exports.command = void 0;
const yargs_1 = __importDefault(require("yargs"));
const prePublish_1 = require("./prePublish");
const clean_1 = require("./clean");
const info_1 = require("../info/info");
async function command() {
    const yargs = await commandYargs();
    const commands = yargs
        .command(prePublish_1.commandPrePublishYargs)
        .command(clean_1.commandCleanYargs)
        .help();
    const argv = commands.parse();
    console.log(argv._[0], argv.lib ? 'library' : 'application', argv.projectDir);
    if (argv._.length === 0)
        commands.showHelp();
}
exports.command = command;
async function commandYargs() {
    const context = await info_1.psyBootInfo();
    return addContextOptions(yargs_1.default, context);
}
exports.commandYargs = commandYargs;
function addContextOptions(yargs, p) {
    return yargs
        .option('lib', {
        type: 'boolean',
        default: p.lib,
        description: 'Project is a library?',
    })
        .option('projectDir', {
        type: 'boolean',
        default: p.projectDir,
        description: 'Project directory',
    })
        .option('outDir', {
        type: 'string',
        default: p.outDir,
        description: 'Build directory',
    })
        .option('srcDir', {
        type: 'string',
        default: p.srcDir,
        description: 'Src directory',
    })
        .option('pkgPath', {
        type: 'string',
        default: p.pkgPath,
        description: 'package.json pathname',
    });
}
//# sourceMappingURL=command.js.map