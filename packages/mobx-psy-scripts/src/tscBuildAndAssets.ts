import spawn from 'cross-spawn'

export function tscBuildAndAssets() {
  spawn('tsc --build')
  return '/'
}
