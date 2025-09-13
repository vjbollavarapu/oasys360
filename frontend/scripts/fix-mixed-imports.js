import fs from "node:fs/promises"
import { join } from "node:path"

// --- CONFIG -------------------------------------------------------------
const ROOT = process.cwd() // repo root
const exts = [".ts", ".tsx"] // files to inspect
// ------------------------------------------------------------------------

const reMixed = /import\s*\{\s*([^}]*)\btype\b[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gm

async function getAllFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((d) => {
      const res = join(dir, d.name)
      return d.isDirectory() ? getAllFiles(res) : res
    }),
  )
  return files.flat()
}

function splitImport(stmt) {
  const [all, specifiers] = stmt.match(/import\s*\{\s*([^}]*)\}/)
  const parts = specifiers
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const valueParts = parts.filter((p) => !p.startsWith("type "))
  const typeParts = parts.filter((p) => p.startsWith("type ")).map((p) => p.replace(/^type\s+/, ""))

  const fromPath = stmt.match(/from\s*(['"][^'"]+['"])/)[1]

  const valueImport = valueParts.length ? `import { ${valueParts.join(", ")} } from ${fromPath};\n` : ""
  const typeImport = typeParts.length ? `import type { ${typeParts.join(", ")} } from ${fromPath};\n` : ""
  return valueImport + typeImport
}

async function fixFile(file) {
  let code = await fs.readFile(file, "utf8")
  if (!reMixed.test(code)) return false
  code = code.replace(reMixed, (m) => splitImport(m))
  await fs.writeFile(file, code, "utf8")
  return true
}

const main = async () => {
  const files = (await getAllFiles(ROOT)).filter((f) => exts.some((e) => f.endsWith(e)))
  let changed = 0
  for (const f of files) {
    if (await fixFile(f)) {
      changed++
      console.log("fixed:", f.replace(ROOT + "/", ""))
    }
  }
  console.log(`\n✨  Done – ${changed} file${changed === 1 ? "" : "s"} updated`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
