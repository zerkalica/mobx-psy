import { Info } from '../info/info';

export type CommandContext = Pick<Info, 'lib' | 'projectDir' | 'outDir' | 'srcDir' | 'pkgPath'>
