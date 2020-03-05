export function promisify<Result, Args extends unknown[]>(
  errorRate: number,
  timeout: number,
  cb: (...args: Args) => Result
): (...args: Args) => Promise<Result> {
  return (...args: Args) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > errorRate) return reject(new Error('Fake 500 error'))
        try {
          resolve(cb(...args))
        } catch (e) {
          reject(e)
        }
      }, timeout)
    })
  }
}
