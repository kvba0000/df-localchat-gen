// This file is not for browser, don't import it as one
// it's an internal file for locally generating metadata
// about files here

import { readdirSync, statSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dirs = readdirSync(__dirname)
    .filter(f => statSync(join(__dirname, f)).isDirectory())

const data = dirs.reduce((prev, curr) => {
    const size = readdirSync(join(__dirname, curr)).length
    if(size <= 0) return prev
    return ({...prev, [curr]: size})
}, {})

writeFileSync("metadata.json", JSON.stringify(data))