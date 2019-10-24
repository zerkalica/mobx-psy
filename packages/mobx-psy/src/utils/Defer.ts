export type DeferCallback = () => void

const frame = requestAnimationFrame || ((cb: () => void) => { Promise.resolve().then(cb) } )

export class Defer {
    callbacks: DeferCallback[] = []
    protected scheduled = false

    add(cb: DeferCallback): this {
        this.callbacks.push(cb)
        if (this.scheduled) return this
        this.scheduled = true
        frame(this.rewind)

        return this
    }

    rewind = () => {
        this.scheduled = false
        const callbacks = this.callbacks
        this.callbacks = []
        for (let cb of callbacks) {
            try {
                cb()
            } catch (error) {
                console.warn(error)
            }
        }
    }
}

export const defer = new Defer()
