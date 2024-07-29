// This file is not for browser, don't import it as one
// it's an internal file for locally generating metadata
// about files here

import { readdirSync, statSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const path = join(__dirname, "src", "sprites", "faces")

const dirs = readdirSync(path)
    .filter(f => statSync(join(path, f)).isDirectory())

const data = dirs.reduce((prev, curr) => {
    const size = readdirSync(join(path, curr)).length
    if(size <= 0) return prev
    return ({...prev, [curr]: size})
}, {})

writeFileSync(join(path, "metadata.json"), JSON.stringify(data))