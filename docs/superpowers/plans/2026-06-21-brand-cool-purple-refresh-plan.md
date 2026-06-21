# brand 冷蓝紫主题色刷新实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将项目 `brand` 主题色板刷新为新的冷蓝紫方案，并让整站 `brand-*` 消费位置同步体现新的视觉主色。

**架构：** 这次实现只改主题源头，不动组件消费代码。通过更新 `src/index.css` 中的 `brand-50` 到 `brand-950`，让所有已接入 `brand-*` 的按钮、导航、focus ring 和浅底高亮自动换肤；再通过主题测试、全量测试与构建验证结果。

**技术栈：** React 19、TypeScript、Vite 8、Tailwind CSS v4、Vitest

---

## 文件结构

- 修改：`src/index.css`
  - 负责提供新的冷蓝紫 `brand` 色板
- 修改：`src/theme/themeConsistency.test.ts`
  - 负责校验新的关键色值已写入主题文件，避免未来误回退

### 任务 1：补充冷蓝紫色板失败测试

**文件：**
- 修改：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
it('uses the refreshed cool-purple brand palette', () => {
  expect(indexCss).toContain('--color-brand-500: #7c84ff;')
  expect(indexCss).toContain('--color-brand-600: #635bff;')
  expect(indexCss).toContain('--color-brand-900: #372f92;')
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：FAIL，提示旧色值仍存在，新的 `brand-500` / `brand-600` / `brand-900` 未命中。

### 任务 2：更新 brand 冷蓝紫色板

**文件：**
- 修改：`src/index.css`
- 测试：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：编写最少实现代码**

```css
@theme {
  --color-brand-50: #f4f5ff;
  --color-brand-100: #eceeff;
  --color-brand-200: #d9ddff;
  --color-brand-300: #bbc2ff;
  --color-brand-400: #98a2ff;
  --color-brand-500: #7c84ff;
  --color-brand-600: #635bff;
  --color-brand-700: #5546f5;
  --color-brand-800: #4638c7;
  --color-brand-900: #372f92;
  --color-brand-950: #241f63;
}
```

- [ ] **步骤 2：运行测试验证通过**

运行：`npm test -- src/theme/themeConsistency.test.ts`
预期：PASS。

### 任务 3：回归验证

**文件：**
- 修改：`src/index.css`
- 修改：`src/theme/themeConsistency.test.ts`

- [ ] **步骤 1：运行全量测试**

运行：`npm test`
预期：PASS。

- [ ] **步骤 2：运行构建**

运行：`npm run build`
预期：PASS。

- [ ] **步骤 3：获取诊断**

检查：`src/index.css` 与 `src/theme/themeConsistency.test.ts` 无新增诊断问题。

## 自检

- 规格中的新色板值、只改主题源头、不动组件类名、验证方式都已映射到任务
- 计划中未使用 `TODO`、`待定`、`后续实现` 等占位词
- 色值命名、文件路径和测试口径保持一致
