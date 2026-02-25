# Bed Game (Vite + React)

这是一个基于 Vite + React + Motion 的互动流程网页：

- gate（规则确认）
- setup（模式/强度/回合/昵称）
- draw（任务卡翻牌）
- task modal（任务计时）
- aftercare（结束关怀）

## 本地开发

```bash
npm install
npm run dev
```

默认地址：`http://127.0.0.1:5173`

## 生产构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`。

## 技术栈

- React 18
- Vite 5
- Motion (`motion/react`)

## 自动化测试相关钩子

应用暴露：

- `window.render_game_to_text()`
- `window.advanceTime(ms)`

用于 Playwright 客户端脚本做状态读取与时间推进验证。

## 关键产物目录（最近一次）

- 基础回归：`output/web-game/vite-react-base/`
- 交互流程：`output/web-game/vite-react-flow-2/`
