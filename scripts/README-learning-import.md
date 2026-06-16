# Learning Article Importer

这个脚本用于为 UIcoding.ai 自动发现并导入学习资料。

## 常用命令

```bash
npm run learning:discover -- --query "Codex tutorial best practices"
npm run learning:extract -- --url "https://example.com/article"
npm run learning:import -- --url "https://example.com/article" --write
npm run learning:auto -- --query "Claude Code best practices" --write
```

## 环境变量

```bash
export OPENAI_API_KEY="..."
export OPENAI_MODEL="gpt-5-mini"
```

可选搜索服务：

```bash
export BRAVE_SEARCH_API_KEY="..."
export BING_SEARCH_API_KEY="..."
```

未配置搜索 API 时，脚本会尝试使用 DuckDuckGo HTML 搜索兜底。

## 内容模式

默认模式：

```bash
npm run learning:import -- --url "https://example.com/article" --write
```

默认生成中文学习稿：保留原文标题结构和内容顺序，忠实整理核心信息，但不是逐字全文翻译。

严格翻译模式：

```bash
npm run learning:import -- --url "https://example.com/article" --translation strict --license permitted --write
```

严格翻译只应在来源明确允许全文翻译、你已获得授权、或来源采用开放许可时使用。脚本会阻止未确认许可来源的严格全文翻译。

## 写入位置

脚本会追加写入：

- `src/data.js` 的 `lessons`
- `src/content/learningContent.js` 的 `learningContent`

写入后请运行：

```bash
npm run build
```
