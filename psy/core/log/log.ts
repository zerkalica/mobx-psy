export class PsyLog {
  static error(p: { place: Object | string; error?: Error }) {
    console.error(p.error)
  }
}
