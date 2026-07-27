import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'brand'
const BRAND = '#1F4B7A'
const FONT = "'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',sans-serif"

const fav = readFileSync('public/favicon.svg', 'utf8')
const inner = fav.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const scale = 56 / 17
const iconW = 13 * scale

function lockupSvg({ textColor, iconFillOverride }) {
  const icon = iconFillOverride
    ? inner.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${iconFillOverride}"`)
    : inner
  const W = 760, H = 96
  const iconY = (H - 56) / 2
  const textX = 20 + iconW + 18
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g transform="translate(20 ${iconY}) scale(${scale})" shape-rendering="crispEdges">${icon}</g><text x="${textX}" y="${H / 2}" dominant-baseline="central" font-family="${FONT}" font-weight="700" font-size="58" fill="${textColor}" letter-spacing="1">ユーノーミー</text></svg>`
}

async function render(svg, name) {
  const png = await sharp(Buffer.from(svg), { density: 288 }).png().toBuffer()
  const out = await sharp(png)
    .trim()
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  writeFileSync(`${OUT}/${name}.png`, out)
  const m = await sharp(out).metadata()
  console.log(`${name}.png ${m.width}x${m.height}`)
}

const p = lockupSvg({ textColor: BRAND })
writeFileSync(`${OUT}/logo-lockup.svg`, p)
await render(p, 'logo-lockup')

const w = lockupSvg({ textColor: '#ffffff', iconFillOverride: '#ffffff' })
writeFileSync(`${OUT}/logo-lockup-white.svg`, w)
await render(w, 'logo-lockup-white')

console.log('done')
