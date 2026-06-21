# brand 主题统一实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将项目的品牌主色统一收敛为 `brand` 体系，并移除主色层面的 `indigo` / `primary` 混用。

**架构：** 通过在 `src/index.css` 建立 Tailwind v4 可消费的 `brand` 主题 token，把主题来源集中到全局样式层。随后以一次性等价迁移的方式，将项目内所有品牌主色相关的 `indigo-*` 类名替换为 `brand-*`，并补充一个静态一致性测试防止后续回归。

**技术栈：** React 19、TypeScript、Vite 8、Tailwind CSS v4、Vitest

---

## 文件结构

- 修改：`src/index.css`
  - 负责声明 `brand` 主题 token，并收敛旧的 `--color-primary` / `--color-secondary`
- 修改：`src/**/*.tsx`
  - 负责把以 `indigo-*` 表达品牌主色的类名统一迁移到 `brand-*`
- 创建：`src/theme/themeConsistency.test.ts`
  - 负责校验主题 token 已建立，且源码中不再出现品牌主色语义下的 `indigo-*`

### 任务 1：补充主题一致性失败测试

**文件：**
- 创建：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(process.cwd(), 'src')
const indexCss = readFileSync(join(root, 'index.css'), 'utf8')

describe('theme consistency', () => {
  it('defines brand tokens in index.css', () => {
    expect(indexCss).toContain('@theme')
    expect(indexCss).toContain('--color-brand-500')
    expect(indexCss).toContain('--color-brand-900')
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：FAIL，提示 `@theme` 或 `--color-brand-500` 不存在。

### 任务 2：建立 brand 主题 token

**文件：**
- 修改：`src/index.css`
- 测试：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：编写最少实现代码**

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;
  --color-brand-950: #1e1b4b;
}
```

- [ ] **步骤 2：收敛旧变量**

```css
:root {
  --color-primary: var(--color-brand-600);
  --color-secondary: var(--color-brand-500);
}

::selection {
  background: color-mix(in srgb, var(--color-brand-600) 18%, white);
}
```

- [ ] **步骤 3：运行测试验证通过**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：PASS。

### 任务 3：迁移组件中的品牌主色类名

**文件：**
- 修改：`src/components/**/*.tsx`
- 修改：`src/pages/**/*.tsx`
- 修改：`src/admin/**/*.tsx`
- 修改：`src/features/**/*.ts`
- 测试：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：扩展测试覆盖 indigo 回归**

```ts
it('does not use indigo utility classes for brand color anymore', () => {
  const files = collectSourceFiles(root)
  const offenders = files.filter((file) => /(?:^|[^-])(?:bg|text|border|from|to|via|ring)-indigo-\d+/m.test(readFileSync(file, 'utf8')))

  expect(offenders).toEqual([])
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：FAIL，输出仍包含多个 `indigo-*` 文件。

- [ ] **步骤 3：编写最少实现代码**

```txt
将所有表达品牌主色的：
- bg-indigo-* → bg-brand-*
- text-indigo-* → text-brand-*
- border-indigo-* → border-brand-*
- from-indigo-* / to-indigo-* / via-indigo-* → from-brand-* / to-brand-* / via-brand-*
- ring-indigo-* → ring-brand-*
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：PASS。

### 任务 4：回归验证

**文件：**
- 修改：`src/index.css`
- 修改：`src/**/*.ts`
- 修改：`src/**/*.tsx`
- 测试：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：运行单测**

运行：`npm test`
预期：PASS。

- [ ] **步骤 2：运行 lint**

运行：`npm run lint`
预期：PASS。

- [ ] **步骤 3：获取诊断**

检查：`src/index.css` 与最近编辑的 TSX 文件无新增诊断问题。

## 自检

- 规格中的主题 token、旧变量收敛、全量类名迁移和验证步骤均已映射到任务
- 计划中未使用 `TODO`、`待定`、`后续实现` 等占位词
- `brand`、`indigo`、`--color-primary` / `--color-secondary` 的命名口径在任务中保持一致
