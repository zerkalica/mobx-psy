import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

const noop = () => undefined
require.extensions['.css'] = noop
require.extensions['.png'] = noop
require.extensions['.woff'] = noop
require.extensions['.woff2'] = noop
