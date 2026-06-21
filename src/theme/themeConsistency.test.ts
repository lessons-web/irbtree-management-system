import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcRoot = join(process.cwd(), 'src')
const indexCss = readFileSync(join(srcRoot, 'index.css'), 'utf8')

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectSourceFiles(fullPath)
    }

    const isSourceFile = /\.(ts|tsx|css)$/.test(entry.name)
    const isTestFile = /\.test\.(ts|tsx)$/.test(entry.name)

    return isSourceFile && !isTestFile ? [fullPath] : []
  })
}

describe('theme consistency', () => {
  it('defines brand tokens in index.css', () => {
    expect(indexCss).toContain('@theme')
    expect(indexCss).toContain('--color-brand-500')
    expect(indexCss).toContain('--color-brand-900')
  })

  it('uses the refreshed cool-purple brand palette', () => {
    expect(indexCss).toContain('--color-brand-500: #7c84ff;')
    expect(indexCss).toContain('--color-brand-600: #635bff;')
    expect(indexCss).toContain('--color-brand-900: #372f92;')
  })

  it('does not use indigo utility classes for brand color anymore', () => {
    const indigoUtilityPattern = /\b(?:bg|text|border|from|to|via|ring)-indigo-\d+\b/
    const offenders = collectSourceFiles(srcRoot).filter((filePath) => indigoUtilityPattern.test(readFileSync(filePath, 'utf8')))

    expect(offenders).toEqual([])
  })
})
