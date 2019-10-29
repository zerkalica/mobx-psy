import path from 'path'

export const bundleRoot = path.join(process.cwd(), 'dist', 'public')
export const port = process.env.PORT || 8080
export const publicUrl = process.env.PUBLIC_URL || '/'
