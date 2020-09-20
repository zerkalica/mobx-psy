import { PsyBootInfo } from '../info/info';

export type CommandContext = Pick<PsyBootInfo, 'lib' | 'projectDir' | 'outDir' | 'srcDir' | 'pkgPath'>
