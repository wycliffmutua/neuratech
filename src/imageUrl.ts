/** Resolve app-local image paths under Vite's configured deployment base. */
export function imageUrl(path?: string) {
  if (!path) return undefined
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const base = import.meta.env.BASE_URL
  const localPath = path.replace(/^\/+/, '')
  const assetPath = localPath.includes('/') ? localPath : `images/${localPath}`
  return `${base}${assetPath}`
}
