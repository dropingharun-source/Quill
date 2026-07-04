/*
 * Tiny dependency-free static server for the production build in dist/.
 * Serves on 127.0.0.1:5173 — the SAME origin as the dev server, because the
 * journal's localStorage data is bound to that origin.
 *
 * Started automatically at login by "Quill server.vbs" in the user's
 * Startup folder; run manually with `npm run serve`. If the port is already
 * taken (e.g. `npm run dev` is running), it exits quietly.
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('./dist', import.meta.url))
const HOST = '127.0.0.1'
const PORT = 5173

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let filePath = normalize(join(DIST, pathname))
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403)
      res.end()
      return
    }
    let data
    try {
      data = await readFile(filePath)
    } catch {
      filePath = join(DIST, 'index.html') // SPA fallback
      data = await readFile(filePath)
    }
    const isHashedAsset = filePath.includes(`${sep}assets${sep}`)
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    res.end(data)
  } catch {
    res.writeHead(500)
    res.end()
  }
})

server.on('error', (err) => {
  // Port taken → something (probably the dev server) already serves Quill.
  process.exit(err.code === 'EADDRINUSE' ? 0 : 1)
})

server.listen(PORT, HOST, () => {
  console.log(`Quill: serving dist/ at http://localhost:${PORT}`)
})
