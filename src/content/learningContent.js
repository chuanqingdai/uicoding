const guidedNotice = "本文为 Uicoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。";

function parseLearningMarkdown(markdown) {
  const sections = [];
  let current = { heading: '', blocks: [] };
  let paragraphLines = [];
  let codeLines = [];
  let codeLanguage = '';
  let inCodeBlock = false;

  const commitParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    current.blocks.push({
      type: 'paragraph',
      content: paragraphLines.join('\n'),
    });
    paragraphLines = [];
  };

  const commitSection = () => {
    commitParagraph();
    if (current.heading || current.blocks.length > 0) {
      sections.push(current);
    }
  };

  markdown.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        current.blocks.push({
          type: 'code',
          label: codeLanguage ? `${codeLanguage} prompt` : '可复制内容',
          content: codeLines.join('\n').trimEnd(),
        });
        codeLines = [];
        codeLanguage = '';
        inCodeBlock = false;
        return;
      }

      commitParagraph();
      codeLanguage = line.slice(3).trim();
      inCodeBlock = true;
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      commitParagraph();
      return;
    }

    if (line.startsWith('## ')) {
      commitSection();
      current = { heading: line.replace(/^##\s+/, '').trim(), blocks: [] };
      return;
    }

    if (!line.trim() || line.trim() === '---') {
      commitParagraph();
      return;
    }

    paragraphLines.push(line);
  });

  if (inCodeBlock) {
    current.blocks.push({
      type: 'code',
      label: codeLanguage ? `${codeLanguage} prompt` : '可复制内容',
      content: codeLines.join('\n').trimEnd(),
    });
  }

  commitSection();

  return sections;
}

const uicodingSkillArticleMarkdown = "# 我如何用 Codex + Impeccable Skill 做出 UIcoding.ai\n\n最近我用 Codex 搭了一个新站：UIcoding.ai。\n\n这个网站的定位很简单：整理 AI Coding 案例、学习资料、工具介绍，帮助设计师、产品经理、独立开发者更快学会用 Codex、Claude Code、Cursor 这类工具做真实产品。\n\n但真正做下来，我发现一个问题：\n\nCodex 写代码很快，但默认设计能力不稳定。\n\n它可以很快创建页面、组件、路由、数据结构，也能修构建错误。但当我说“页面更高级一点”“更像编辑精选站”“减少模板感”的时候，Codex 经常会走偏。\n\n比如它会加很多卡片。\n加很多背景块。\n加很重的阴影。\n加渐变。\n加发光边框。\n按钮越来越黑。\n标签越来越抢眼。\n最后页面不是更高级，而是更像 AI 自动生成的网站。\n\n后面我开始配合使用一个前端设计 Skill：Impeccable。\n\n我自己的理解是：\n\nCodex 负责写代码。\nImpeccable 负责做设计审查。\n\n它不是直接替你变出一个完美网站，而是帮你发现页面为什么不高级、哪里像模板、哪里排版不舒服、哪里组件太重、哪里视觉层级混乱。\n\n这篇文章复盘一下，我是怎么用 Codex + Impeccable Skill 搭建 UIcoding.ai 的。\n\n文中的代码块都可以直接复制到 Codex 输入框里，根据你的项目名称做少量替换就能用。\n\n---\n\n## 1. 为什么要给 Codex 配 Impeccable\n\n只用 Codex 写代码时，它非常适合完成明确的工程任务。\n\n比如：\n\n创建页面。\n新增组件。\n调整路由。\n补静态数据。\n修构建错误。\n优化移动端。\n整理页面结构。\n\n这些事情只要你描述清楚，Codex 基本都能完成。\n\n但设计不一样。\n\n设计不是简单地“多写几行样式”。\n\n很多时候页面不高级，不是因为缺少效果，而是因为东西太多了。\n\n我在做 UIcoding.ai 的时候，遇到过很多这种问题：\n\n首页 Hero 区域信息太满。\n案例卡片像普通组件库默认样式。\n学习资料页面没有文章阅读感。\n工具页 icon 白底太突兀。\n按钮颜色太重，抢了内容注意力。\n标签太多，视觉上比标题还突出。\n卡片 hover 太夸张，页面像模板站。\n灰色占位图太默认，没有编辑感。\n\n如果我只对 Codex 说：\n\n```text\n页面不够高级，帮我优化一下。\n```\n\n它很容易继续堆效果。\n\n但 Impeccable 更适合做“设计审查”。\n\n我会让它先审查页面，再只挑最影响质感的几个问题改。\n\n这样比一次性大改稳定很多。\n\n---\n\n## 2. 一键安装 Impeccable：直接复制给 Codex\n\n如果你想在 Codex 项目里使用 Impeccable，最简单的方式不是自己去研究一堆命令，而是直接让 Codex 帮你检查、安装、初始化。\n\n我会把安装任务也写得很明确。\n\n不要让 Codex 一边安装，一边顺手改项目代码。\n\n可以直接复制这段：\n\n```text\n请帮我在当前项目中一键安装并初始化 Impeccable Skill。\n\n要求：\n1. 先确认当前目录是否是项目根目录。\n2. 检查 package.json 是否存在。\n3. 不要修改业务代码。\n4. 不要修改页面组件。\n5. 不要修改 CSS 文件。\n6. 只执行 Impeccable 的安装和初始化相关步骤。\n7. 如果需要执行命令，请先说明命令用途，然后再执行。\n8. 安装完成后，告诉我如何在 Codex 中调用 Impeccable。\n\n请执行：\n- npx impeccable install\n- 按项目级安装优先\n- 安装后提示我重启 Codex 或重新加载技能\n- 然后指导我运行 /impeccable init\n\n如果 Codex 中看不到 /impeccable，请告诉我如何通过 /skills 或 $ 检查技能是否已加载。\n```\n\n这段的重点是：\n\n只安装 Skill。\n不要改页面。\n不要改 CSS。\n不要顺手优化 UI。\n\n安装工具和修改项目要分开。\n\n这是我踩过的坑。\n\n有时候你只是想安装一个 Skill，Codex 会顺手开始“优化项目结构”。这种非常没必要。\n\n所以安装阶段一定要写清楚：只安装，不改业务代码。\n\n---\n\n## 3. 初始化 Impeccable：先告诉它 UIcoding.ai 是什么\n\n安装之后，不要马上让它改页面。\n\n先初始化项目上下文。\n\nImpeccable 需要知道这个网站是什么类型、面向谁、视觉方向是什么、不要像什么。\n\nUIcoding.ai 不是一个传统 SaaS 工具站。\n\n它更像一个 AI Coding 案例和学习内容站。\n\n所以我不会只说“现代、简洁、高级”。\n\n这种词太泛了。\n\n我会这样描述：\n\n```text\n请使用 /impeccable init 初始化当前项目的设计上下文。\n\n这是 UIcoding.ai，一个 AI Coding 案例和学习内容站。\n\n项目定位：\n- 面向设计师、产品经理、独立开发者、一人公司\n- 帮助用户学习如何使用 Codex、Claude Code、Cursor 等 AI Coding 工具\n- 展示优秀 AI Coding 案例、教程、工具和实战经验\n\n网站气质：\n- 编辑感\n- 可信\n- 简洁\n- 有审美\n- 像高质量内容精选站\n- 不要像普通 SaaS 模板\n- 不要像组件库 demo\n- 不要像自动生成的 AI 工具站\n\n视觉参考：\n- 高质量编辑型内容站\n- 设计案例精选站\n- 干净的产品手册页面\n- 有留白、有节奏、有明确层级\n\n反向要求：\n- 不要重渐变\n- 不要重阴影\n- 不要发光边框\n- 不要多层卡片嵌套\n- 不要满屏黑色按钮\n- 不要让标签比标题更抢眼\n- 不要把所有内容都放进背景块\n\n初始化完成后，请总结 Impeccable 记录了哪些项目上下文。\n不要修改页面代码。\n```\n\n这一步很重要。\n\n因为如果没有项目上下文，Impeccable 也只能给出比较通用的设计建议。\n\n我希望它理解：\n\nUIcoding.ai 是内容站，不是后台系统。\n是编辑精选站，不是普通工具站。\n是给 AI Coding 学习者看的，不是给企业采购看的。\n\n上下文越清楚，后面的设计审查越准确。\n\n---\n\n## 4. 先做能跑起来的项目，不要一开始追求完美\n\nUIcoding.ai 一开始不是直接做完整网站。\n\n我先让 Codex 创建一个最小可运行版本。\n\n技术上也没有搞复杂：\n\nReact。\nVite。\nnpm。\n普通 CSS。\n静态数据。\n\n页面也先只做首页：\n\nHeader。\nHero。\n精选案例。\n学习资料。\n常用工具。\nFooter。\n\n这个阶段最重要的不是设计多漂亮，而是项目能跑、结构清晰、文件不要拆太碎。\n\n可以直接复制：\n\n```text\n从零开始创建一个 React + Vite 前端项目。\n\n技术栈：\n- React\n- Vite\n- npm\n- 普通 CSS\n- 静态数据\n\n当前只做首页。\n不要做后端。\n不要做登录。\n不要做数据库。\n不要接 API。\n不要引入复杂组件库。\n\n文件结构保持简单：\n- src/main.jsx\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/\n\n样式文件可以按规范拆分，但不要过度复杂：\n- tokens\n- base\n- layout\n- components\n- pages\n\n首页包含：\n1. Header\n2. Hero\n3. 精选案例\n4. 学习资料\n5. 常用工具\n6. Footer\n\n完成后运行：\nnpm install\nnpm run build\n\n构建成功后停止，不要继续扩展新功能。\n```\n\n这里有个坑。\n\n如果一开始就说“帮我做完整网站”，Codex 很容易把项目拆得很复杂。\n\n路由、状态、组件、样式文件、数据文件全部一起上。\n\n看起来很专业，但后面非常难控。\n\n我现在更倾向于：\n\n先简单跑起来。\n再逐页迭代。\n再用 Impeccable 审查。\n最后把规范沉淀到固定样式文件里。\n\n---\n\n## 5. 设计规范不要只写进 MD，要沉淀成固定 CSS 规范\n\n这里我后来也调整过一次。\n\n一开始我以为，把设计规则写进 AGENTS.md 或 DESIGN.md 就够了。\n\n比如告诉 Codex：\n\n页面要高级。\n按钮不要太重。\n卡片不要太模板。\n不要使用重渐变。\n标签不要太抢眼。\n\n但实际开发下来发现，只写在 MD 文件里不够。\n\nMD 文件更适合做上下文说明和工作规则。\n\n真正决定网站质感的，是固定的 CSS 规范。\n\n我的理解是：\n\nAGENTS.md 管 Codex 的行为。\nPRODUCT.md / DESIGN.md 管设计上下文。\n固定 CSS 文件管真正的视觉系统。\nImpeccable 负责审查页面有没有偏离规范。\n\n所以 UIcoding.ai 的样式不应该散落在每个页面里，也不应该每次让 Codex 重新写一套样式。\n\n更合理的方式是建立固定样式结构：\n\n```text\nsrc/styles/\n  tokens.css\n  base.css\n  layout.css\n  components.css\n  pages.css\n```\n\n这里不展开 CSS 代码，只说每个文件的作用。\n\ntokens.css：放颜色、字体、字号、间距、圆角、阴影、容器宽度。\nbase.css：放 body、标题、段落、链接、图片等基础样式。\nlayout.css：放 Container、Section、Grid、页面宽度、响应式布局。\ncomponents.css：放 Button、Card、Badge、Nav、Footer 等通用组件样式。\npages.css：放首页、案例页、详情页等页面级样式。\n\n这样做的好处是：\n\n颜色不会每个页面乱写。\n按钮不会每个页面长得不一样。\n卡片圆角和间距会统一。\n页面布局有固定节奏。\nCodex 不会每次重新发明一套视觉系统。\n\n可以直接复制这个 prompt：\n\n```text\n请为当前项目建立一套固定 CSS 设计规范，但不要输出具体 CSS 代码给我解释。\n\n目标：\n把 UIcoding.ai 的视觉规范沉淀到固定样式文件中，而不是只写进 AGENTS.md 或 DESIGN.md。\n\n请整理或创建这些文件：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n要求：\n1. tokens.css 只负责设计变量，比如颜色、字体、字号、间距、圆角、阴影、容器宽度。\n2. base.css 只负责全站基础样式，比如 body、标题、段落、链接、图片。\n3. layout.css 只负责布局规则，比如 Container、Section、Grid、响应式。\n4. components.css 只负责通用组件，比如 Button、Card、Badge、Nav、Footer。\n5. pages.css 只负责页面级样式，比如首页、案例页、详情页。\n6. 不要把页面专属样式写进 tokens。\n7. 不要在页面文件里随机新增颜色、阴影、圆角和间距。\n8. 不要引入新的 UI 组件库。\n9. 不要重构业务逻辑。\n10. 不要修改页面内容结构，除非样式引用必须调整。\n\n视觉方向：\n- 编辑感\n- 干净\n- 高级\n- 可信\n- 不要像默认组件库\n- 不要重渐变\n- 不要重阴影\n- 不要多层卡片嵌套\n- 标签不要抢过标题\n- 按钮不要太重\n\n完成后运行 npm run build，并总结：\n1. 创建或修改了哪些样式文件\n2. 每个样式文件负责什么\n3. 哪些页面或组件引用了这些样式\n4. 是否存在需要后续清理的重复样式\n```\n\n这个比“把设计规则写进 AGENTS.md”更有效。\n\nAGENTS.md 可以提醒 Codex 不要乱改设计系统。\n\n但真正的设计系统，必须落到固定 CSS 文件里。\n\n---\n\n## 6. 把大任务拆成单页任务\n\nAI Coding 最容易失控的地方，就是一次性要求它做完整站点。\n\nUIcoding.ai 我后面拆成了几个页面：\n\n首页。\n案例列表页。\n案例详情页。\n学习资料页。\n工具索引页。\n工具详情页。\n提交作品页。\n登录页。\n404 页面。\n\n每次只做一个页面。\n\n比如做案例页，我不会说“把案例系统做完整”。\n\n我会这样写：\n\n```text\n继续开发当前项目。\n\n本次任务只实现一个页面：/cases。\n\n不要创建后端。\n不要创建登录。\n不要接数据库。\n不要重构目录。\n不要引入复杂路由方案。\n不要修改首页视觉风格。\n不要修改设计 tokens。\n\n允许新增：\n- src/pages/CasesPage.jsx\n\n允许修改：\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/pages.css\n\n页面必须复用已有组件和样式规范：\n- Container\n- Section\n- Button\n- Badge\n- Card\n- CaseCard\n\n页面内容：\n1. 页面标题\n2. 简短说明\n3. 分类筛选\n4. 案例卡片列表\n5. 空状态\n\n完成后运行：\nnpm run build\n\n如果构建成功就停止。\n```\n\n这种写法看起来啰嗦，但非常有用。\n\n因为它限制了 Codex 的修改范围。\n\n我之前踩过的坑是：只想做一个页面，它顺手把全站样式也改了。\n\n所以现在我会明确写：\n\n允许新增什么。\n允许修改什么。\n禁止修改什么。\n必须复用什么。\n完成后跑什么命令。\n\n这样出问题也容易定位。\n\n---\n\n## 7. 用 Impeccable 做第一次设计审查\n\n页面能跑起来之后，不要马上继续加功能。\n\n先让 Impeccable 做设计审查。\n\n这里一定不要说“帮我改好看一点”。\n\n要让它先审查，不要直接改代码。\n\n可以复制：\n\n```text\n请使用 Impeccable Skill 走查当前首页。\n\n目标：\n- 高级\n- 编辑感\n- 可信\n- 像高质量 AI Coding 内容站\n- 不要像默认组件库模板\n- 不要像 AI 自动生成的 SaaS 页面\n\n请重点检查：\n1. 信息层级是否清楚\n2. Hero 是否太满\n3. 字体和字号是否有节奏\n4. 按钮是否太重\n5. 卡片是否太像模板\n6. 标签是否太抢眼\n7. 图片占位是否太默认\n8. 移动端是否拥挤\n9. 页面是否复用 src/styles 下的设计规范\n10. 是否存在页面里随机新增颜色、阴影、圆角和间距\n\n不要直接大改代码。\n先只指出最影响质感的 3 个问题。\n\n每个问题请包含：\n- 具体问题\n- 为什么影响质感\n- 建议怎么改\n- 可能涉及哪些样式文件或组件\n```\n\n这一步很关键。\n\n我不让它马上改代码，而是先让它审查。\n\n因为很多时候 Codex 直接改，会一次性改太多。\n\n先让 Impeccable 给出问题清单，再挑前三个改，效果会稳定很多。\n\n---\n\n## 8. 只修前三个最影响质感的问题\n\nImpeccable 走查后，通常会指出很多问题。\n\n但不要一次性全改。\n\n我一般只挑最重要的 3 个。\n\n比如它指出：\n\n按钮太重。\n卡片信息太挤。\n图片占位太默认。\n\n那这一轮就只改这三个。\n\n可以这样写：\n\n```text\n根据刚才 Impeccable 的设计走查结果，本轮只修复最影响质感的 3 个问题。\n\n只允许调整：\n- 颜色引用\n- 字体层级\n- 间距\n- 卡片样式\n- 按钮样式\n- 图片占位样式\n- 移动端布局细节\n\n优先修改：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n不要新增页面。\n不要修改数据结构。\n不要重构组件。\n不要改路由。\n不要引入新依赖。\n不要做动画大改。\n不要在页面文件中写散乱样式。\n\n修复目标：\n1. 降低按钮的视觉重量\n2. 让卡片信息更舒展\n3. 让图片占位更像真实内容站，而不是灰色默认块\n\n完成后运行 npm run build，并总结修改了哪些文件。\n```\n\n这个方式比“帮我整体提升设计”稳定很多。\n\n因为它不是凭感觉改，而是基于设计审查结果改。\n\n---\n\n## 9. Impeccable 真正有用的地方：反模板感\n\n我觉得 Impeccable 最大的价值，不是让页面突然变成世界顶级设计。\n\n而是帮你避免 AI 页面常见问题。\n\n比如：\n\n卡片太多。\n按钮太黑。\n标签太抢眼。\n阴影太模板。\n渐变太重。\n页面到处都是圆角卡片。\n图标都放在圆角方块里。\n灰色文字放在浅色背景上，可读性很差。\nHero 区域堆太多信息，像 AI 生成的 SaaS 模板。\n\n这些问题非常常见。\n\nCodex 默认很容易做出这种页面，因为它学到的很多前端模式就是这种。\n\nImpeccable 的好处是，它会提醒你：\n\n不要再堆卡片了。\n不要再加渐变了。\n不要让标签比标题还抢眼。\n不要用组件库默认审美。\n不要把所有内容都装进背景块里。\n不要让 hover 效果变成炫技。\n\n这对 UIcoding.ai 很有帮助。\n\n因为我希望它更像一个编辑精选站，而不是一个普通 AI 工具站。\n\n---\n\n## 10. 自动设计审查：让 Impeccable 每轮都检查\n\n后面我更常用的是一个固定循环：\n\nCodex 完成页面。\nImpeccable 审查。\n只修前三个问题。\n重新构建。\n再检查页面。\n\n可以把这个流程写成固定提示词：\n\n```text\n请对当前页面执行一次 Impeccable 自动设计审查循环。\n\n流程：\n1. 读取当前页面和相关样式文件。\n2. 从视觉品质角度审查页面。\n3. 检查页面是否符合 src/styles 下的固定 CSS 规范。\n4. 只列出最影响质感的 3 个问题。\n5. 不要提出超过 3 个问题。\n6. 不要大改结构。\n7. 只针对这 3 个问题做最小修改。\n8. 修改后运行 npm run build。\n9. 最后总结修改文件、修改内容和剩余问题。\n\n审查标准：\n- 是否像真实内容站\n- 是否有编辑感\n- 是否有清晰层级\n- 是否避免组件库默认感\n- 是否避免 AI 模板感\n- 是否移动端可读\n- 是否复用 tokens、layout、components 的样式规范\n- 是否存在随机颜色、随机圆角、随机阴影、随机间距\n\n不要新增页面。\n不要新增功能。\n不要修改业务逻辑。\n不要引入新依赖。\n```\n\n这个提示词我觉得很适合零基础用户。\n\n因为你不需要懂太多设计术语。\n\n只要让 Impeccable 先审查，再让 Codex 只改前三个问题，就能稳定提升页面质感。\n\n---\n\n## 11. 更严格一点：用 detect 做反模式检查\n\n除了让 Impeccable 在 Codex 里审查页面，也可以让它做更偏自动化的反模式检查。\n\n我会把它理解成：\n\n不是审美打分。\n而是检查页面里有没有明显的 AI 设计坏味道。\n\n比如：\n\n重渐变。\n发光边框。\n过度阴影。\n模板化色彩。\n不必要的视觉装饰。\n\n可以直接复制：\n\n```text\n请为当前项目执行一次 Impeccable 反模式检测。\n\n要求：\n1. 运行 npx impeccable detect src/\n2. 如果检测失败，请不要马上大改。\n3. 先总结检测到了哪些问题。\n4. 按严重程度排序。\n5. 只选择最影响页面质感的 3 个问题。\n6. 说明每个问题可能影响哪些页面或组件。\n7. 等我确认后再修改。\n\n不要修改业务逻辑。\n不要新增依赖。\n不要改路由。\n不要重构组件结构。\n```\n\n我建议不要让它检测完就自动大改。\n\n先让它列问题。\n\n因为有些检测结果可能不是当前最重要的问题。\n\n设计优化不是越多越好。\n\n每次只改最重要的 3 个，反而更稳。\n\n---\n\n## 12. 页面验证不要省\n\n很多问题不是看代码能发现的。\n\n而是在浏览器里才看得出来。\n\n我做 UIcoding.ai 的时候，遇到过这些问题：\n\n卡片底部有一条白线。\n图标白底太大。\nHero 图片被裁剪。\n详情页正文宽度太宽。\n标签在移动端换行很乱。\n某个卡片 hover 后会撑开布局。\n图片加载失败后占位很丑。\n页面出现横向滚动条。\n\n所以每次修改后，我都会要求 Codex 做验证。\n\n```text\n修改完成后请执行以下验证：\n\n1. 运行 npm run build。\n2. 打开本地页面。\n3. 检查是否有横向溢出。\n4. 检查移动端布局是否拥挤。\n5. 如果页面包含图片，检查图片是否加载成功、是否被裁剪。\n6. 如果页面包含卡片，检查 hover、按钮、标签、标题和描述是否对齐。\n7. 如果页面包含长文本，检查正文宽度和行高是否适合阅读。\n8. 检查页面是否继续复用 src/styles 下的固定样式规范。\n\n只汇报验证结果。\n不要继续扩展新功能。\n```\n\n这里的关键是最后一句：\n\n不要继续扩展新功能。\n\nCodex 有时候很容易顺手做更多事情。\n\n你必须让它停在当前任务。\n\n---\n\n## 13. AGENTS.md 应该写什么\n\n设计规范不应该只写进 AGENTS.md。\n\n但 AGENTS.md 仍然有用。\n\n它应该写工作规则，而不是承载完整设计系统。\n\n我会这样写：\n\n```text\n请更新 AGENTS.md，只加入必要的工作规则。\n\n不要把完整设计规范写进 AGENTS.md。\n真正的设计规范在 src/styles/ 下的固定 CSS 文件中。\n\nAGENTS.md 只需要说明：\n1. 不要删除、移动、重命名文件，除非明确要求。\n2. 不要重构无关代码。\n3. 不要修改业务逻辑，除非当前任务要求。\n4. UI 修改必须优先复用 src/styles 下的规范。\n5. 不要在页面文件里随机新增颜色、阴影、圆角、间距。\n6. 不要随便修改 tokens，除非任务明确要求调整设计系统。\n7. 每次 UI 修改后，优先使用 Impeccable 做设计审查。\n8. 每轮只修最重要的 3 个视觉问题。\n9. 修改完成后必须运行 npm run build。\n10. 最后总结修改了哪些文件。\n\n保持简洁，不要写成长文档。\n```\n\n这样更合理。\n\nAGENTS.md 负责提醒 Codex：\n\n设计系统已经在 CSS 里了。\n不要每次重新发明样式。\n不要乱改 tokens。\n不要把页面样式写散。\n\n而 Impeccable 负责审查页面有没有偏离规范。\n\n---\n\n## 14. Impeccable 帮我具体改出了哪些方向\n\nUIcoding.ai 后面的视觉方向，就是这样一点点收敛出来的。\n\n一开始页面比较像普通组件站。\n\n后来慢慢改成：\n\n品牌色从纯黑转向更有温度的棕色。\n按钮变轻，不再满屏黑色按钮。\n卡片 hover 只做轻微反馈。\n学习详情页更像文章阅读，不再用很多背景块。\n工具页统一真实产品 icon，而不是随机图标。\n案例详情页减少模块堆叠，重点展示图片和作者信息。\n列表页标签降低视觉权重，让标题和封面更突出。\nFooter 和导航更克制，不抢主内容。\n\n这些不是一次性做出来的。\n\n而是每次审查一点，修改一点，再验证一点。\n\n这也是我现在觉得最适合 AI Coding 的方式：\n\n不要追求一次生成完美页面。\n而是让 AI 帮你持续迭代。\n\n---\n\n## 15. 给零基础用户的建议\n\n如果你是零基础用户，不要把 AI Coding 理解成“一句话生成完整网站”。\n\n这种方式很容易失控。\n\n更稳定的方式是：\n\n先做一个能运行的版本。\n再逐页拆任务。\n每次只改一个页面。\n每次只解决 3 个设计问题。\n每次修改后都构建验证。\n最后把规则沉淀到固定 CSS 规范里。\n\nImpeccable 最适合用在这种场景：\n\n你觉得页面不对劲。\n但你说不清哪里不对。\n\n这时候不要直接让 Codex “优化一下”。\n\n而是让 Impeccable 先审查。\n\n比如：\n\n```text\n请用 Impeccable 审查这个页面。\n只指出最影响质感的 3 个问题。\n不要直接改代码。\n```\n\n然后再让 Codex 按这 3 个问题修改。\n\n这样做慢一点，但更稳。\n\n也更接近真实产品开发流程。\n\n---\n\n## 总结\n\n这次做 UIcoding.ai，我最大的感受是：\n\nCodex 适合执行。\nImpeccable 适合审查。\n\nCodex 能很快把页面写出来，但它不一定知道页面为什么不高级。\n\nImpeccable 的价值，就是帮你把“感觉不对”变成更具体的问题。\n\n比如：\n\n按钮太重。\n标签太抢眼。\n卡片太模板。\n图片像占位。\n间距没有节奏。\n页面信息太满。\n移动端阅读压力太大。\n\n有了这些判断，再让 Codex 修改，效率会高很多。\n\n我现在的工作流基本是：\n\n```text\nCodex 搭页面\n↓\n固定 CSS 规范约束视觉\n↓\nImpeccable 做设计审查\n↓\n只改最重要的 3 个问题\n↓\nnpm run build\n↓\n浏览器验证\n↓\n把稳定规则沉淀到项目结构里\n```\n\n这套流程不复杂，但很适合独立开发者。\n\n尤其是你不想只做一个“能跑”的网站，而是希望页面真的有一点质感。\n\nUIcoding.ai 就是这样一点点做出来的。";

export const learningContent = [
  {
    "id": "getting-the-most-out-of-codex",
    "sourceUrl": "https://x.com/dotey/article/2057250417638035555",
    "translationMode": "guidedTranslation",
    "title": "如何把 Codex 用到极致：来自 Codex 团队的工作流分享",
    "originalTitle": "Getting the most out of Codex",
    "notice": "本文为 Uicoding 基于外部文章整理的中文精读稿，不是原文全文搬运。原文来自 X Article，中文参考宝玉的公开整理稿；请访问原始来源查看完整上下文。",
    "sections": [
      {
        "heading": "这篇文章真正想说明什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人刚开始使用 Codex 时，会把它当成一个更聪明的代码编辑助手：让它读代码库，生成 diff，跑测试，修 bug，最后提交 PR。这当然是 Codex 的核心能力，但这篇文章提醒我们，Codex 的价值已经不止于“写代码”。"
          },
          {
            "type": "paragraph",
            "content": "现实工作里，大量任务虽然最后会落到代码上，但过程并不只发生在代码库里。你可能要查网页、看文档、整理 Slack 里的线索、导出 PDF、检查表格、操作浏览器、等待反馈、触发自动化流程。Codex 如果能连接这些上下文，就不再只是帮你补代码，而是能协助完成一整段电脑工作。"
          },
          {
            "type": "paragraph",
            "content": "这篇文章的核心，是把 Codex 当成一个可持续协作的工作流系统来用，而不是一次性聊天框。持久对话流、语音输入、任务干预、工具连接、自动化、Goals、侧边栏和共享记忆，都是为了让 Codex 更稳定地在真实工作中接力。"
          }
        ],
        "image": "/learn-images/codex-maximizing-hero.jpg",
        "imageAlt": "Codex 工作流分享文章配图"
      },
      {
        "heading": "持久对话流：把一个任务变成长期工作空间",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章首先讲的是 durable threads，也就是可以长期保存上下文的对话流。普通聊天的缺点是每次都像重新开始，你要反复解释项目背景、偏好、当前进度和之前做过的决定。持久对话流则像一个长期工作空间，适合反复推进同一类任务。"
          },
          {
            "type": "paragraph",
            "content": "你可以把常用对话流固定下来，例如一个专门处理日常事务的线程，一个负责产品发布的线程，一个审查文档的线程，一个监控外部数据的线程。它们不是一次性提问窗口，而是长期存在的工作台。随着时间推移，Codex 可以在同一个线程里回到之前的上下文，继续处理未完成的工作。"
          },
          {
            "type": "paragraph",
            "content": "对独立开发者来说，这一点非常实用。你可以为一个产品建立长期线程，比如“Uicoding.ai 内容维护”“KnowLens.ai 发布准备”“每周检查网站问题”。每个线程只处理一类任务，长期积累上下文，避免所有事情混在一个聊天里。"
          }
        ]
      },
      {
        "heading": "语音输入：先把粗糙想法倒出来",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章接着提到语音输入。它的价值不在于让输入更酷，而是能捕捉那些还没有被你整理成清晰文字的想法。很多时候，我们脑子里有一个方向，但还没来得及组织成正式 prompt。直接说出来，反而能保留更多上下文。"
          },
          {
            "type": "paragraph",
            "content": "比如你只记得某个人在 Slack 里提过一个问题，但不记得细节。你可以先把模糊记忆说给 Codex，让它去帮你搜索、收集线索、整理成可执行任务。对于一个能自己查找上下文的 Agent 来说，粗糙但完整的口述，往往比一句精炼但缺少背景的指令更有用。"
          },
          {
            "type": "paragraph",
            "content": "会议录音、临时想法、产品复盘、视觉反馈，都适合先用语音输入收集。不要急着把它变成完美 prompt。先把想法说完整，再让 Codex 帮你整理成任务清单、修改计划或可执行步骤。"
          }
        ]
      },
      {
        "heading": "任务干预和任务排队：执行中也要保持控制",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 在执行任务时，人不应该完全放手。文章区分了两个能力：steering 和 queuing。Steering 是在任务还没完成时中途干预，发现方向不对就立刻纠正；queuing 是不打断当前任务，而是把下一步安排到队列里。"
          },
          {
            "type": "paragraph",
            "content": "比如你让 Codex 审查一个网页时，看到侧边栏里的页面间距不对，可以直接打断它，告诉它把某个元素调小，或者提醒它某段文案理解错了。这种干预能避免它沿着错误方向越跑越远。"
          },
          {
            "type": "paragraph",
            "content": "任务排队则适合安排后续动作。比如当前修复完成后，让它把预览链接发给审核人，或者等构建完成后再检查截图。简单理解：干预是改变它正在做什么，排队是安排它接下来做什么。这两者让你在自动化过程中仍然保留主导权。"
          }
        ]
      },
      {
        "heading": "工具和触达范围：不要把 Codex 关在代码库里",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当一个对话流能保存上下文后，下一步就是扩展它能触达的范围。文章提到浏览器、Chrome、电脑控制、MCP server 和各种连接器。它们让 Codex 不只处理代码文件，也能参与网页审查、登录态浏览器流程、桌面图形界面任务和外部数据工作。"
          },
          {
            "type": "paragraph",
            "content": "浏览器适合在侧边栏里审查网页，尤其是本地开发页面、UI 预览、交互流程和视觉问题。Chrome 适合需要你个人账号登录态的工作，例如只能在你的浏览器会话中打开的后台或工具。电脑控制则适合那些没有 API，只能通过桌面界面完成的任务。"
          },
          {
            "type": "paragraph",
            "content": "MCP 和连接器的意义，是把真实工作流里的材料接进来。很多任务最开始不是代码，而是一条 Slack 消息、一封邮件、一个日程、一份文档或一个外部系统反馈。Codex 能连接这些来源，才能从“代码助手”变成“工作流助手”。"
          },
          {
            "type": "paragraph",
            "content": "文章还提到 Skills。一个已经验证有效的重复流程，可以沉淀成 Skill，下次直接调用，而不是每次重新解释。对于 Uicoding.ai 这类内容站，设计审查、文章整理、案例补全、上线检查，都可以逐步变成可复用流程。"
          }
        ]
      },
      {
        "heading": "随时随地工作：任务不一定要停在电脑前",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章也强调了跨设备协作。一个任务可以在你的本地电脑上启动，使用本地文件、权限和环境运行。当你离开电脑时，你仍然可以通过手机查看进度，回答 Codex 的问题，批准下一步行动，或者在回到工位前补充新的方向。"
          },
          {
            "type": "paragraph",
            "content": "这对长任务很有意义。比如跑测试、生成素材、整理反馈、重构模块、生成报告，这些任务不需要你一直坐在电脑前盯着。你可以让 Codex 在本地环境里继续推进，而你用移动端保持决策权。"
          }
        ]
      },
      {
        "heading": "自动化：让线程自己定期回来工作",
        "blocks": [
          {
            "type": "paragraph",
            "content": "自动化是文章里很关键的一部分。它可以按计划定时执行任务。如果是每天从零开始的例行工作，例如生成日报、检查代码库或整理更新，可以用定时自动化。如果任务需要保留历史上下文，就更适合使用 thread automation，让同一个对话流定期被唤醒。"
          },
          {
            "type": "paragraph",
            "content": "文章把 thread automation 形容成一种心跳机制：它会按照设定时间回到同一个线程里继续工作，直到满足某个条件。比如一个日常助理线程可以每隔一段时间检查 Slack 和 Gmail，找出还没处理的重要消息，帮你整理优先级，甚至先起草回复。"
          },
          {
            "type": "paragraph",
            "content": "自动化也适合处理反馈循环。比如 PR、Google Docs、Slack 里有人留下评论，Codex 可以定期检查新反馈，回到代码库做修改，然后继续等待下一轮意见。真正有价值的地方不是“自动跑一次”，而是它可以围绕同一个上下文持续推进。"
          }
        ]
      },
      {
        "heading": "Goals：长任务必须有明确终点线",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章强调，长任务不能只靠一句泛泛的目标。一个坏目标是“把这个计划实现一下”。这种说法没有终点线，Codex 不知道什么时候算完成，也不知道如何判断自己做得更接近目标。"
          },
          {
            "type": "paragraph",
            "content": "一个好的 Goal 必须包含可验证的成功标准。比如迁移一个内部工具时，可以设定为“直到所有单元测试通过才算完成”。这样 Codex 不只是一直工作，而是在朝着一个可衡量的结果前进。"
          },
          {
            "type": "paragraph",
            "content": "适合做验证器的东西包括测试用例、性能基准、稳定复现的 bug、验证矩阵、端到端流程。对 AI Coding 来说，野心很重要，但如果没有验证机制，野心就只是愿望。目标设定的本质，是把持续执行和验证器结合起来。"
          }
        ]
      },
      {
        "heading": "侧边栏：在原地审查产物",
        "blocks": [
          {
            "type": "paragraph",
            "content": "侧边栏是这篇文章里非常实用的一部分。它让 Codex 生成的成果和聊天窗口并排出现，你不需要把文件导出到别的软件里再检查。生成成果可以是代码，也可以是网页、PDF、幻灯片、表格、Markdown 文档或其他文件。"
          },
          {
            "type": "paragraph",
            "content": "侧边栏主要适合四类工作：检查生成文件，在文件上标注需要修改的地方，操作网页界面，审查代码或文件变更。对设计师和产品经理来说，这意味着你可以像审稿一样看 Codex 的产物，而不是只看文字回复。"
          }
        ],
        "image": "/learn-images/codex-side-panel-pdf.jpg",
        "imageAlt": "Codex 侧边栏审查 PDF 示例"
      },
      {
        "heading": "侧边栏也能让网页成为工作台",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当侧边栏和应用内浏览器结合起来，网页既是 Codex 的输出，也可以成为控制面板。Codex 可以生成一个页面，在侧边栏打开，检查渲染效果，发现 bug，再继续修复。你在网页上的标注和反馈也能留在同一个闭环里。"
          },
          {
            "type": "paragraph",
            "content": "文章提到很多适合侧边栏的场景：一个单独的 index.html 可以变成轻量交互页面；Storybook 可以用来审查 UI 组件；Remotion Studio 可以处理代码生成动画；浏览器里的幻灯片、数据分析应用也都适合这种方式。核心是让 Codex 直接看见最终产物，而不是只凭代码想象页面效果。"
          }
        ],
        "image": "/learn-images/codex-side-panel-csv.jpg",
        "imageAlt": "Codex 侧边栏审查数据文件示例"
      },
      {
        "heading": "共享记忆：把上下文放到单次对话之外",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章最后讲共享记忆。持久对话流很有用，但重要上下文不应该只锁在某一次聊天里。更稳的方法，是把长期上下文写进明确的文件或知识库，让未来的任务也能读取和接手。"
          },
          {
            "type": "paragraph",
            "content": "一个简单做法是建立纯文本知识库。里面可以放 TODO、人员信息、项目记录、Agent 规则和笔记。最外层可以放一个 AGENTS.md，告诉 Codex 当它了解到新的人员、项目、决策、待办或卡点时，应该怎样更新这些文件。"
          },
          {
            "type": "paragraph",
            "content": "这里的重点不是照抄某种文件夹结构，而是教会 Codex：哪些上下文需要被保留，应该放在哪里，什么时候不要乱改。代码库存代码，知识库存持续滚动的上下文。否则两次聊天中断之后，很多关键细节就会消失。"
          }
        ],
        "image": "/learn-images/codex-side-panel-slides.jpg",
        "imageAlt": "Codex 侧边栏审查幻灯片示例"
      },
      {
        "heading": "从代码向外延伸",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这篇文章最后的判断是：Codex 仍然以写代码为核心，但围绕代码发生的许多周边工作，正在进入同一个系统。MCP、网页、桌面控制、自动化、侧边栏文件审查，都让 Codex 不再只是代码补全工具。"
          },
          {
            "type": "paragraph",
            "content": "这也改变了人控制 AI 的方式。你可以在任务中途干预，让它排队执行下一步，用自动化在人不在时继续推进，用 Goals 给长任务设定终点线，用侧边栏直接审查最终文件。一个完整工作流从听取指令、执行任务到审查产物，都可以在 Codex 里形成闭环。"
          },
          {
            "type": "paragraph",
            "content": "对新手来说，不需要一次学会所有功能。更好的顺序是：先用持久线程保存项目上下文，再练习干预和排队，然后用浏览器或侧边栏审查结果，接着把重要规则写进文件，最后再尝试自动化和 Goals。这样能真正把 Codex 从“会写代码”用到“能协作完成工作”。"
          }
        ]
      }
    ]
  },
  {
    "id": "uicoding-skill-coding-process",
    "sourceUrl": "",
    "translationMode": "original",
    "title": "我如何用 Codex + Impeccable Skill 做出 UIcoding.ai",
    "originalTitle": "",
    "notice": "本文为 Uicoding.ai 站内原创经验稿，记录这个网站使用 Codex 和 Impeccable Skill 搭建与设计走查的过程。",
    "hideLead": true,
    "sections": parseLearningMarkdown(uicodingSkillArticleMarkdown)
  },
  {
    "id": "knowlens-codex-2b-token-tips",
    "sourceUrl": "",
    "translationMode": "original",
    "title": "20 亿 Token 后，我用 Codex 开发 KnowLens.ai 的 8 个技巧",
    "originalTitle": "",
    "notice": "",
    "hideLead": true,
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "type": "paragraph",
            "content": "过去两周，我基本都在用 Codex 开发 KnowLens.ai。"
          },
          {
            "type": "paragraph",
            "content": "累计差不多花了 20 亿 token。"
          },
          {
            "type": "paragraph",
            "content": "说实话，这里面至少 50% 都浪费在重构、修 bug、恢复错误改动上。"
          },
          {
            "type": "paragraph",
            "content": "不是 Codex 不行，而是我一开始太乐观了。我以为只要不停把需求丢给它，它就能一路把产品做出来。结果真正做下来才发现，如果前期没有设计好产品工作流，Codex 会很努力地写代码，也会很努力地把项目改乱。"
          },
          {
            "type": "paragraph",
            "content": "KnowLens.ai 最开始只是想做一个很简单的功能："
          },
          {
            "type": "paragraph",
            "content": "用户输入一段文本，AI 生成一张专业的信息可视化图片。"
          },
          {
            "type": "paragraph",
            "content": "但做着做着，功能很快就变多了。"
          },
          {
            "type": "paragraph",
            "content": "登录、积分、支付、生成记录、图片下载、SEO 页面、博客页、案例页、错误处理、部署、环境变量，全部都会冒出来。"
          },
          {
            "type": "paragraph",
            "content": "如果一开始没有主线，后面就会不断重构。"
          },
          {
            "type": "paragraph",
            "content": "我踩了一圈坑之后，现在总结出 8 个具体技巧。顺序是由浅入深，从最基础的任务拆分，到最后的上线和支付链路。"
          }
        ]
      }
    ]
  },
  {
    "id": "codex-quickstart-first-task",
    "sourceUrl": "https://github.com/openai/codex#quickstart",
    "translationMode": "guidedTranslation",
    "title": "Codex CLI 官方入门：安装、登录和第一次运行",
    "originalTitle": "openai/codex README · Quickstart",
    "notice": "本文基于 openai/codex 官方 README 与 OpenAI Developers CLI 文档整理成中文学习稿。README 使用 Apache-2.0 许可证；CLI 文档请以原始页面为准。",
    "sections": [
      {
        "heading": "先看原文到底在讲什么",
        "content": "这篇学习资料的主来源是 OpenAI 在 GitHub 上公开的 openai/codex README。原文把 Codex CLI 定义为一个运行在你电脑本地的 coding agent，也就是可以在你的项目目录里读取代码、修改文件、运行命令的编程助手。它不是一个普通聊天窗口，而是和你的本地项目绑定在一起的工具。",
        "image": "/learn-covers/codex-quickstart.svg",
        "imageAlt": "Codex CLI 入门示意图"
      },
      {
        "heading": "Codex CLI 是什么",
        "content": "按照官方 README 的说法，Codex CLI 是 OpenAI 的本地 coding agent。它运行在你的电脑上，而不是只在网页里回答问题。你把它启动在某个项目文件夹里，它就能围绕这个文件夹工作：阅读代码、解释项目结构、提出修改计划、编辑文件，并在你允许的情况下运行命令。对新手来说，可以先把它理解成“会看项目文件的 AI 编程同伴”。"
      },
      {
        "heading": "CLI 又是什么意思",
        "content": "CLI 是 command-line interface 的缩写，可以理解为“命令行界面”。它不像普通软件那样主要靠按钮操作，而是在终端里输入文字命令。终端就是电脑里的一个文字窗口：Mac 上叫 Terminal，Windows 上常见的是 PowerShell 或 Windows Terminal，VS Code 里也有 Terminal 面板。你不是把命令输入到浏览器里，而是输入到终端里。"
      },
      {
        "heading": "什么时候应该用 Codex CLI",
        "content": "如果你已经有一个本地项目，比如一个 React、Vite、Next.js 或普通 HTML/CSS 项目，并希望 Codex 直接读取和修改这些文件，就适合用 Codex CLI。如果你更习惯在 VS Code、Cursor、Windsurf 这样的编辑器里操作，官方 README 也提示可以安装 IDE 插件；如果你想用桌面应用体验，可以运行 codex app；如果你想让云端代理处理任务，则去 Codex Web。新手如果只是想学习网页项目，优先从本地小项目加 CLI 或 IDE 开始。"
      },
      {
        "heading": "安装前要先准备什么",
        "content": "安装前你至少需要知道三件事：第一，你使用的是 Mac、Linux 还是 Windows；第二，你是否能打开终端；第三，你是否有一个可以练习的小项目。不要一开始就在重要项目里测试。更稳的方式是准备一个空的练习项目，或者复制一份项目副本。这样 Codex 即使改错，也不会影响正式工作。"
      },
      {
        "heading": "Mac 或 Linux 的官方安装方式",
        "content": "官方 README 给出的 Mac 和 Linux 安装方式，是在终端里运行安装脚本。对新手来说，执行前要先确认你打开的是终端，而不是浏览器地址栏。把下面这一行完整复制到终端里，然后按回车。安装过程可能会下载文件，并把 codex 命令放到系统可执行路径中。",
        "code": {
          "label": "Mac / Linux 安装命令",
          "content": "curl -fsSL https://chatgpt.com/codex/install.sh | sh"
        }
      },
      {
        "heading": "Windows 的官方安装方式",
        "content": "如果你使用 Windows，官方 README 给出了 PowerShell 安装命令。PowerShell 是 Windows 自带的命令行工具。你可以在开始菜单搜索 PowerShell，打开后把下面这一行复制进去执行。注意不要把 Mac 的 curl 安装命令直接拿到 Windows 里用。",
        "code": {
          "label": "Windows PowerShell 安装命令",
          "content": "powershell -ExecutionPolicy ByPass -c \"irm https://chatgpt.com/codex/install.ps1 | iex\""
        }
      },
      {
        "heading": "也可以用 npm 或 Homebrew 安装",
        "content": "官方 README 也列出了包管理器安装方式。如果你已经熟悉 npm，可以用 npm 全局安装；如果你是 Mac 用户，并且已经安装 Homebrew，也可以用 brew 安装。零基础用户不必同时尝试多种方式，选择一种成功即可。",
        "code": {
          "label": "可选安装方式",
          "content": "npm install -g @openai/codex\n\nbrew install --cask codex"
        }
      },
      {
        "heading": "怎么确认安装成功",
        "content": "安装完成后，官方 README 说可以直接运行 codex 开始。意思是：在终端输入 codex，就可以启动。如果终端提示找不到 codex，说明安装没有生效，或者终端还没有刷新到新的路径。你可以先关闭终端重新打开，再输入 codex 试一次。",
        "code": {
          "label": "启动 Codex CLI",
          "content": "codex"
        }
      },
      {
        "heading": "第一次运行会发生什么",
        "content": "根据 OpenAI Developers 的 CLI 文档，第一次运行 Codex 时会提示你登录。官方推荐使用 ChatGPT 账号登录，这样可以通过 Plus、Pro、Business、Edu 或 Enterprise 等计划使用 Codex。你也可以使用 API key，但这对新手来说需要额外配置，第一天学习不建议从 API key 开始。"
      },
      {
        "heading": "项目目录是什么，为什么重要",
        "content": "Codex CLI 会在你选择的目录里工作。目录就是文件夹；项目目录就是放项目代码的文件夹。比如一个前端项目里通常会看到 package.json、src、index.html 这些文件。你在哪个目录里启动 Codex，它就主要围绕哪个目录理解和修改文件。所以启动前最好先确认自己在正确项目目录里。",
        "code": {
          "label": "检查当前目录",
          "content": "pwd\nls"
        }
      },
      {
        "heading": "如果看不到 package.json 怎么办",
        "content": "如果你输入 ls 后看不到 package.json、src 或 index.html，可能说明你不在项目目录里。你需要先进入项目文件夹。比如项目在桌面的 web 文件夹，可以这样写。这里的 cd 是进入文件夹，pwd 是显示当前位置，ls 是列出当前文件夹内容。",
        "code": {
          "label": "进入项目目录示例",
          "content": "cd ~/Desktop/web\npwd\nls"
        }
      },
      {
        "heading": "第一次不要让它直接大改项目",
        "content": "Codex 很强，但新手第一次使用时不要说“帮我优化整个网站”或“帮我重构项目”。更安全的方式是先让它只读项目、不改文件。你可以让它解释项目结构、入口文件、运行方式和可能的修改范围。这样你先确认它理解得对，再让它做小改动。",
        "code": {
          "label": "第一次建议复制的任务",
          "content": "请先阅读当前项目，不要修改任何文件。\n请用适合零基础用户的语言解释：\n1. 这个项目是什么技术栈；\n2. 入口文件在哪里；\n3. 首页或主要页面由哪些文件组成；\n4. 如果我要改一段文案，应该先看哪个文件；\n5. 运行和构建项目通常用什么命令。"
        }
      },
      {
        "heading": "第二步再做一个很小的修改",
        "content": "当 Codex 已经解释清楚项目后，再给它一个很小、容易检查的任务。比如只改一段文案、只调整一个按钮文字、只让某张卡片描述显示两行。任务越小，越容易验证结果，也越容易发现 Codex 有没有改错。",
        "code": {
          "label": "小任务示例",
          "content": "请只修改首页 Hero 的描述文案。\n不要修改路由、数据结构和其他页面。\n修改完成后请运行 npm run build。\n如果构建成功，请告诉我改了哪些文件。"
        }
      },
      {
        "heading": "什么是 diff，为什么要看",
        "content": "diff 可以理解为“这次到底改了什么”。Codex 修改文件后，你应该看一下改动范围。比如只要求改文案，却看到它改了很多 CSS、数据和路由，就要警惕。看 diff 不需要你完全懂代码，先学会判断：改动文件数量是否合理，是否碰了不相关页面。",
        "code": {
          "label": "查看改动",
          "content": "git diff"
        }
      },
      {
        "heading": "什么是 build，为什么每次要跑",
        "content": "build 可以理解为“把项目打包检查一遍”。很多错误在浏览器里不一定立刻看出来，但 build 会提前发现语法错误、导入错误或组件不存在。对新手来说，每次让 Codex 改完后都跑 npm run build，是最基础的安全检查。",
        "code": {
          "label": "构建检查",
          "content": "npm run build"
        }
      },
      {
        "heading": "成功标准是什么",
        "content": "第一次学习 Codex CLI，不要求做出复杂页面。成功标准应该很简单：终端能运行 codex；能完成登录；Codex 能看懂当前项目；它没有在你没允许的情况下乱改文件；一个小修改完成后 build 成功；你能在浏览器里看到预期变化。达到这些，就说明你已经完成了 Codex CLI 的入门闭环。"
      },
      {
        "heading": "常见问题：codex 命令找不到",
        "content": "如果输入 codex 后提示 command not found，先不要慌。通常是安装没有完成，或者终端没有刷新环境变量。你可以关闭终端重新打开，再输入 codex。如果仍然不行，回到官方 README，换一种安装方式，比如 npm 或 Homebrew。不要同时乱跑很多安装命令，先记录你尝试了哪一种。"
      },
      {
        "heading": "常见问题：不知道自己在哪个文件夹",
        "content": "这是新手最常见的问题。先输入 pwd 看当前路径，再输入 ls 看当前文件。如果看不到项目文件，就说明你还没进入项目目录。你可以把项目文件夹拖到终端窗口里，很多系统会自动填入路径；或者在 VS Code 打开项目后使用内置 Terminal。"
      },
      {
        "heading": "常见问题：Codex 想改太多文件",
        "content": "如果 Codex 计划改很多文件，而你只是想做一个小改动，可以直接让它停止，并重新限定范围。比如告诉它“只允许修改 src/components/HomeSections.jsx，不要修改其他文件”。新手使用 Codex 的关键不是让它一次做很多，而是学会把任务缩小。"
      },
      {
        "heading": "下一步怎么学",
        "content": "完成安装、登录和第一次小任务后，再去学习审批模式、安全沙盒、如何写清楚任务、如何查看 diff、如何让 Codex 按步骤修改。不要急着上复杂项目。先把“进入正确项目目录、描述小任务、看 diff、跑 build、浏览器检查”这套流程练熟。"
      }
    ]
  },
  {
    "id": "codex-cli-basic-operations",
    "sourceUrl": "https://developers.openai.com/codex/cli/features",
    "translationMode": "guidedTranslation",
    "title": "Codex CLI 基础操作：从交互模式到第一个可验证修改",
    "originalTitle": "Codex CLI features",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先别急着输入命令",
        "content": "如果你从来没用过终端，不要担心。终端只是电脑里的一个文字操作窗口：平时我们点按钮打开软件，在终端里则是输入一行文字让电脑做事。Codex CLI 就是在这个文字窗口里运行的 Codex。你可以把它理解成：在项目文件夹旁边打开一个对话窗口，让 Codex 帮你看文件、改文件和检查结果。"
      },
      {
        "heading": "终端在哪里打开",
        "content": "Mac 用户可以打开“终端 Terminal”，Windows 用户通常会用 PowerShell、Windows Terminal 或 VS Code 里的 Terminal。最简单的方式是：如果你已经用 VS Code 打开项目，就在 VS Code 顶部菜单找到 Terminal，再选择 New Terminal。这样打开的终端通常就在当前项目附近，更不容易走错文件夹。"
      },
      {
        "heading": "什么是命令",
        "content": "命令就是你输入给电脑的一句话。比如 pwd 是“告诉我现在在哪个文件夹”，ls 是“列出当前文件夹里的文件”，cd 是“进入某个文件夹”。你不需要背很多命令，只要先理解这几个基础命令，就能开始使用 Codex CLI。",
        "code": {
          "label": "最基础的三个命令",
          "content": "pwd   # 显示当前所在文件夹\nls    # 查看当前文件夹里有什么\ncd 文件夹路径   # 进入某个文件夹"
        }
      },
      {
        "heading": "什么是项目文件夹",
        "content": "项目文件夹就是放网站代码的文件夹。一个常见前端项目里会有 package.json、src、index.html 这些文件。package.json 像项目说明书，src 里通常放页面和组件代码。Codex CLI 必须在正确的项目文件夹里启动，才能看到这些文件。"
      },
      {
        "heading": "先确认自己在正确位置",
        "content": "打开终端后，先不要马上运行 Codex。你可以先输入 pwd 看当前位置，再输入 ls 看当前文件夹里有什么。如果能看到 package.json、src、index.html 之类的文件，通常说明你已经在项目目录里了。",
        "code": {
          "label": "位置检查命令",
          "content": "pwd\nls"
        }
      },
      {
        "heading": "如果不在项目目录怎么办",
        "content": "如果 ls 之后看不到项目文件，说明你可能还没有进入项目目录。需要用 cd 进入项目文件夹。比如项目在桌面的 web 文件夹里，就输入 cd ~/Desktop/web。这里的 cd 可以理解成“走进这个文件夹”。",
        "code": {
          "label": "进入项目目录示例",
          "content": "cd ~/Desktop/web\npwd\nls"
        }
      },
      {
        "heading": "再启动 Codex CLI",
        "content": "确认位置正确后，再输入 codex 启动 Codex CLI。启动后，你就可以像聊天一样输入中文任务。第一次不要让它修改代码，先让它解释项目，这样你能确认它看到了正确文件。",
        "code": {
          "label": "启动 Codex",
          "content": "codex"
        }
      },
      {
        "heading": "第一次只让它解释项目",
        "content": "新手第一次使用 Codex CLI，最稳的任务不是“帮我做页面”，而是“请解释这个项目”。这一步会让你知道项目大概由哪些文件组成，也能让 Codex 先熟悉上下文。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "请先阅读当前项目，不要修改任何文件。\n请用非常适合零基础用户的语言解释：\n1. 这个项目是什么；\n2. 主要文件夹和文件分别有什么作用；\n3. 首页或当前页面在哪里；\n4. 如果我要改一段文案，应该先看哪个文件；\n5. 如果我要运行这个项目，通常会用什么命令。"
        }
      },
      {
        "heading": "npm 是什么，不要被吓到",
        "content": "npm 是前端项目常用的工具，可以理解成“安装和运行项目的助手”。npm install 通常用来安装项目需要的依赖，npm run build 通常用来检查项目能不能成功打包。你不需要理解所有细节，只要知道：install 是准备材料，build 是检查能不能做成成品。",
        "code": {
          "label": "常见 npm 命令",
          "content": "npm install      # 安装项目需要的依赖\nnpm run build    # 检查项目能不能成功打包"
        }
      },
      {
        "heading": "交互模式是什么",
        "content": "输入 codex 进入后，你会进入交互模式。交互模式就像持续聊天：你提一个问题，Codex 回答；你确认后，它再继续下一步。新手应该优先使用交互模式，因为你可以一步步确认，不容易让 Codex 一次改太多。"
      },
      {
        "heading": "不要一开始就让它改代码",
        "content": "很多新手第一次会直接说“帮我优化网站”。这句话太大了，Codex 可能会改很多文件。更安全的方法是先让它提出计划，不要马上修改。你确认计划没问题，再让它执行。",
        "code": {
          "label": "先提计划的提示词",
          "content": "请先不要修改文件。\n我想优化学习资料卡片，但我是零基础用户。\n请先告诉我：\n1. 你需要看哪些文件；\n2. 每个文件大概负责什么；\n3. 你建议最小修改哪几个地方；\n4. 修改后我应该如何检查结果。\n等我确认后再执行。"
        }
      },
      {
        "heading": "再做一个非常小的修改",
        "content": "确认计划后，只让 Codex 做一个小改动。比如只改一段文案、只调整一个卡片、只修一个按钮。小任务更容易成功，也更容易理解 Codex 到底做了什么。",
        "code": {
          "label": "小任务提示词",
          "content": "请只做一个小修改：把学习卡片的描述统一限制为两行。\n只允许修改和学习卡片相关的组件或样式文件。\n不要改数据，不要新增页面，不要重构目录，不要新增依赖。\n完成后运行 npm run build，并用中文告诉我改了哪些文件。"
        }
      },
      {
        "heading": "diff 是修改记录，不是考试题",
        "content": "diff 是代码修改前后的对比记录。你不需要完全看懂每一行，但可以看出 Codex 改了哪些文件、改动多不多、有没有碰到不该碰的地方。如果不懂，可以直接让 Codex 解释 diff。",
        "code": {
          "label": "让 Codex 解释修改",
          "content": "请用中文解释这次 diff：\n1. 哪些文件被修改了；\n2. 每个文件为什么要改；\n3. 有没有可能影响其他页面；\n4. 我应该重点检查哪里。"
        }
      },
      {
        "heading": "build 是运行前的体检",
        "content": "build 可以理解成上线前的体检。npm run build 成功，说明项目至少没有明显语法错误和打包错误。失败也不用慌，把报错复制给 Codex，让它解释原因并修复。注意：build 成功不代表页面一定好看，所以还要打开浏览器看结果。"
      },
      {
        "heading": "一套适合零基础用户的完整流程",
        "content": "你可以每次都按这个顺序来：打开项目，打开终端，确认位置，启动 Codex，让它解释项目，让它提计划，确认后做小修改，看 diff，运行 build，最后打开浏览器检查页面。这就是最基础但最稳的 AI Coding 工作流。",
        "code": {
          "label": "完整流程提示词",
          "content": "我是零基础用户，请你按非常稳妥的方式协助我：\n1. 先解释当前项目，不要修改文件；\n2. 再提出最小修改计划；\n3. 等我确认后，只做一个小改动；\n4. 修改后运行 npm run build；\n5. 用中文解释修改了什么、为什么这样改、我应该检查哪里。"
        }
      }
    ]
  },
  {
    "id": "codex-safety-sandbox-approvals",
    "sourceUrl": "https://developers.openai.com/codex/agent-approvals-security",
    "translationMode": "guidedTranslation",
    "title": "Codex 安全使用入门：沙盒、审批和 Git 检查点",
    "originalTitle": "Agent approvals and security",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "为什么安全设置对新手很重要",
        "content": "AI Coding 工具能读文件、写文件、运行命令，这让它很有用，也意味着你需要理解权限边界。新手最常见的风险不是模型“故意破坏项目”，而是任务说得太模糊，导致它改了太多文件、安装了不必要依赖，或执行了你没有真正理解的命令。"
      },
      {
        "heading": "什么是沙盒",
        "content": "沙盒可以理解为 Codex 的活动范围。权限越小，它越难影响项目外部环境；权限越大，它越方便完成复杂任务，但你也越需要检查它要做什么。新手建议先在小项目里使用较保守的权限，不要为了省一次确认就开放过大的权限。",
        "visualType": "prompt"
      },
      {
        "heading": "什么是审批",
        "content": "审批就是 Codex 在执行某些操作前请求你的确认。看到审批提示时，不要机械点同意，要先看它准备做什么：是读取文件、修改文件、安装依赖，还是执行可能影响系统的命令。你可以要求它解释命令用途，再决定是否批准。"
      },
      {
        "heading": "新手推荐的安全流程",
        "content": "开始任务前先确认 git 状态，任务中要求 Codex 小范围修改，任务后检查 diff 和构建结果。如果是重要项目，先建分支或备份。这个流程听起来慢，但它能让你放心地尝试 AI Coding。",
        "code": {
          "label": "终端检查命令",
          "content": "git status\ngit diff\nnpm run build"
        }
      },
      {
        "heading": "哪些操作要谨慎",
        "content": "删除文件、批量重命名、安装依赖、修改配置、运行远程脚本、提交和推送代码，都应该谨慎。不是说不能做，而是每次都要让 Codex 解释原因，并确认这一步和当前目标直接相关。"
      },
      {
        "heading": "安全提示词模板",
        "content": "你可以在任务开头明确约束 Codex 的行为。这样它会更倾向于先分析、再计划、最后只做必要修改。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "请先分析问题并给出计划，不要立即修改文件。\n执行时只允许修改和本任务直接相关的文件。\n不要删除文件，不要安装新依赖，不要改配置，不要提交或推送代码。\n每一步如果需要运行命令，请先说明命令用途。\n完成后运行 npm run build，并让我检查 git diff。"
        }
      }
    ]
  },
  {
    "id": "codex-prompting-basics",
    "sourceUrl": "https://developers.openai.com/codex/prompting",
    "translationMode": "guidedTranslation",
    "title": "Codex 提示词入门：如何把需求讲清楚",
    "originalTitle": "Prompting Codex",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "为什么“帮我优化一下”不够",
        "content": "Codex 可以做很多事，但它不能自动知道你心里的审美、业务目标和边界条件。“帮我优化一下”太宽泛，容易导致它重写结构、改动无关文件，或者只做表面样式。更好的提示词应该说明目标、范围、约束、验收标准和停止条件。"
      },
      {
        "heading": "好任务的六个要素",
        "content": "一个适合交给 Codex 的任务，通常包含六个信息：你要解决什么问题，允许改哪些文件，不能改什么，用户会看到什么变化，完成后如何验证，以及构建成功后是否停止。信息越具体，Codex 越容易稳定执行。"
      },
      {
        "heading": "把模糊需求改成清晰任务",
        "content": "下面这个例子适合网页视觉优化。它把“高级一点”拆成了可执行的约束，包括文件范围、视觉目标、禁止事项和验证命令。",
        "code": {
          "label": "提示词对比",
          "content": "不推荐：\n帮我把首页做高级一点。\n\n推荐：\n请只优化首页案例卡片的视觉品质。\n允许修改：src/components/Cards.jsx、src/styles.css。\n不要改数据、路由和页面结构。\n目标：图片保持 16:9，标题更清晰，描述统一两行，标签弱化，浏览点赞和查看案例形成稳定底栏。\nhover 时卡片轻微上移，不要放大。\n完成后运行 npm run build，如果构建成功就停止。"
        }
      },
      {
        "heading": "让 Codex 先提计划",
        "content": "如果任务稍微复杂，比如涉及多个页面或多个组件，先让 Codex 只给计划。你确认计划后再让它改代码。这样可以减少返工，也能避免它一上来就做大范围修改。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "请先不要修改文件。\n请阅读相关代码后，给出一个最小修改计划。\n计划里说明：\n1. 需要修改哪些文件；\n2. 每个文件改什么；\n3. 哪些内容不能改；\n4. 如何验证结果。\n等我确认后再执行。"
        }
      },
      {
        "heading": "适合设计师的提示词模板",
        "content": "设计师可以把视觉判断转成更明确的规则：字体大小、行高、留白、按钮权重、卡片层级、图片比例、响应式行为。不要只说“好看”，要说“哪里更轻、哪里更稳、哪里不要抢视觉”。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "请优化当前页面的视觉细节，但不要改变页面结构。\n品牌目标：高级、编辑感、可信、克制。\n只修改颜色、字体、间距、卡片、按钮和标签样式。\n卡片 hover 轻微上移，不要 scale。\n标签弱化，不要抢标题。\n按钮只保留主操作有强调色，其他操作用文字链接。\n完成后运行 npm run build。"
        }
      }
    ]
  },
  {
    "id": "codex-best-practices-plan-first",
    "sourceUrl": "https://developers.openai.com/codex/learn/best-practices",
    "translationMode": "guidedTranslation",
    "title": "Codex 最佳实践：先计划，再写代码",
    "originalTitle": "Codex best practices",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "为什么要先计划",
        "content": "当任务涉及多个文件、多个页面或不明确的视觉目标时，直接让 Codex 写代码很容易扩大改动范围。先计划的价值是把目标拆小，把风险暴露出来，也让你有机会纠正方向。对新手来说，计划阶段就是理解项目和学习工作流的过程。"
      },
      {
        "heading": "让 Codex 先采访你",
        "content": "如果你还没想清楚，不要急着让 Codex 动手。可以要求它先提出 3 到 5 个关键问题，比如目标用户是谁、页面必须保留什么、哪些文件不能动、最终怎么验收。它问得越准，后面写得越稳。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "我想优化当前页面，但需求还不够清楚。\n请先向我提出最多 5 个关键问题，帮助我明确：目标用户、视觉方向、功能边界、允许修改文件和验收标准。\n在我回答之前，不要修改任何文件。"
        }
      },
      {
        "heading": "把大需求拆成小任务",
        "content": "不要一次让 Codex 完成首页、列表页、详情页、登录页和提交页。更稳定的方式是一轮只做一个页面或一个组件。每轮结束后运行构建，再进入下一轮。这样项目不会因为一次大改动变得不可控。"
      },
      {
        "heading": "把规则写进 AGENTS.md",
        "content": "如果项目有长期约束，比如使用普通 CSS、不引入复杂路由、卡片 hover 不能放大、截图不要放进项目目录，就可以写进 AGENTS.md。以后 Codex 读到这些规则，就不用每次都重新解释。",
        "code": {
          "label": "AGENTS.md 示例",
          "content": "# Project Rules\n\n- Use React + Vite and npm.\n- Keep CSS in src/styles.css unless explicitly asked to split files.\n- Do not add backend, database, auth, or upload features unless requested.\n- Cards should use subtle hover: translateY(-3px), no scale.\n- Place temporary screenshots outside the project folder.\n- Always run npm run build after code changes."
        }
      },
      {
        "heading": "把重复流程做成 Skill",
        "content": "当你发现自己反复让 Codex 做同一类事，比如视觉走查、首页优化、学习文章整理、案例详情排版，就可以把这些经验沉淀成 Skill。Skill 的意义不是替代你的判断，而是让 Codex 每次都按更稳定的流程工作。"
      },
      {
        "heading": "每轮任务后的验收清单",
        "content": "最佳实践的核心是闭环：任务前明确目标，任务中限制范围，任务后检查结果。下面这个清单适合每次 AI Coding 后复制使用。",
        "code": {
          "label": "验收清单",
          "content": "请完成以下验收：\n1. 运行 npm run build。\n2. 汇报构建是否成功。\n3. 列出修改过的文件。\n4. 确认没有新增无关页面或功能。\n5. 如果是视觉修改，请打开页面检查是否有横向溢出、图片加载失败或文字重叠。\n6. 构建成功后停止，不要继续扩展。"
        }
      }
    ]
  },
  {
    "id": "claude-code-beginner-first-task",
    "sourceUrl": "https://code.claude.com/docs/en/terminal-guide",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 新手入门：安装并完成第一个任务",
    "originalTitle": "Terminal guide for new users",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先安装 Claude Code",
        "content": "官方新手指南建议先准备好 Node.js 和终端环境，然后安装 Claude Code。零基础用户可以把这一步理解为“把 Claude 放进你的电脑开发环境里”。安装完成后，后续操作都在具体项目目录中进行，而不是在任意位置随便运行。",
        "code": {
          "label": "终端命令",
          "content": "npm install -g @anthropic-ai/claude-code\nclaude"
        }
      },
      {
        "heading": "进入你的项目目录",
        "content": "Claude Code 最重要的上下文来自当前文件夹。你应该先进入要修改的项目目录，再启动 Claude。比如你的网站项目放在桌面上的 my-site 文件夹，就先切换到这个目录。这样 Claude 看到的是你的真实项目文件，而不是一个空环境。",
        "code": {
          "label": "终端命令",
          "content": "cd ~/Desktop/my-site\nclaude"
        }
      },
      {
        "heading": "第一个任务不要太大",
        "content": "新手最容易犯的错误，是第一次就让 Claude “帮我做一个完整网站”。更稳的方式是从一个很小、可以验证的任务开始，比如改文案、修一个按钮样式、解释某个文件、补一个简单组件。任务越小，你越容易判断结果是否正确，也更容易学习 Claude 是怎么工作的。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请先阅读当前项目结构，告诉我这个项目是用什么技术栈搭建的。\n不要修改任何文件。\n请只总结：入口文件、主要页面、样式文件、运行和构建命令。"
        }
      },
      {
        "heading": "先让它读懂，再让它修改",
        "content": "Claude Code 的强项是结合项目上下文工作。第一次修改前，最好先让它读相关文件并复述理解，再让它给出修改计划。这样可以减少它误改无关文件的概率。你也能通过它的复述判断：它是否真的理解了页面结构和你的目标。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请阅读首页相关文件，先不要修改。\n目标：我想让首页案例卡片更清晰。\n请先告诉我：\n1. 首页案例卡片由哪些组件组成；\n2. 样式主要在哪个 CSS 文件里；\n3. 如果只做最小修改，你建议改哪 3 个地方。"
        }
      },
      {
        "heading": "开始一个可验证的小修改",
        "content": "当你确认 Claude 的理解没有偏差后，再让它执行修改。注意要限制范围：允许改哪些文件、不要改哪些功能、完成后要运行什么验证命令。对零基础用户来说，这比“帮我优化一下”稳定得多。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请只优化首页案例卡片的视觉细节。\n允许修改：src/components/Cards.jsx、src/styles.css。\n不要修改数据，不要新增页面，不要重构目录。\n要求：图片区域保持 16:9；标题更清晰；描述统一两行；标签视觉弱化；浏览和点赞与“查看案例”形成稳定底栏。\n完成后运行 npm run build，并告诉我构建结果。"
        }
      },
      {
        "heading": "看 diff，而不是只看它说完成了",
        "content": "Claude Code 修改完成后，不要只看它的总结。你应该检查它到底改了哪些文件，最好看一下 diff，再打开页面确认视觉结果。如果你不懂代码，也可以让 Claude 用中文解释每个改动的目的。这个习惯能避免“看起来完成了，但其实改坏别的页面”的问题。",
        "code": {
          "label": "终端命令",
          "content": "git diff\nnpm run build"
        }
      }
    ]
  },
  {
    "id": "claude-code-quickstart-zero-basic",
    "sourceUrl": "https://code.claude.com/docs/en/quickstart",
    "translationMode": "guidedTranslation",
    "title": "Claude Code Quickstart：零基础完成第一个小修改",
    "originalTitle": "Claude Code quickstart",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "这篇文章会带你完成什么",
        "content": "这篇文章教你从零开始使用 Claude Code：先理解终端和项目文件夹，再安装 Claude Code，最后让它在一个前端项目里完成一次很小的修改。目标不是立刻做完整产品，而是让你知道每一步在哪里操作、复制什么、看到什么算成功。"
      },
      {
        "heading": "先理解 Claude Code 是什么",
        "content": "Claude Code 是 Anthropic 提供的命令行 AI 编程工具。你可以把它理解成一个运行在项目文件夹里的 Claude：它能看项目文件、解释代码、提出修改方案、编辑文件，并在需要时运行命令。它不是网页聊天框，也不是设计软件插件，而是一个在终端里工作的编程助手。"
      },
      {
        "heading": "终端是什么",
        "content": "终端是电脑里的文字操作窗口。平时你用鼠标点击按钮打开软件；在终端里，你输入一行文字让电脑做事。Mac 上可以打开 Terminal，Windows 上可以打开 PowerShell 或 Windows Terminal。如果你使用 VS Code，也可以用顶部菜单里的 Terminal，然后选择 New Terminal。"
      },
      {
        "heading": "项目根目录是什么",
        "content": "项目根目录就是代码项目最外层的文件夹。一个前端项目里通常能看到 package.json、src、index.html 或 vite.config.js。package.json 可以理解成项目说明书，里面记录项目如何运行、如何构建、用了哪些依赖。Claude Code 应该在项目根目录里启动，这样它才能看到正确文件。"
      },
      {
        "heading": "先确认自己在正确目录",
        "content": "打开终端后，先不要安装或启动 Claude Code。先用两个最基础的命令确认当前位置。pwd 会显示当前路径，ls 会列出当前文件夹里的文件。如果你能看到 package.json，通常说明已经在项目根目录。",
        "code": {
          "label": "在终端里执行",
          "content": "pwd\nls"
        }
      },
      {
        "heading": "如果没有看到 package.json",
        "content": "如果 ls 后没有看到 package.json，说明你可能还没进入项目文件夹。需要用 cd 进入正确目录。比如项目在桌面的 web 文件夹里，可以输入下面的命令。执行后再输入 ls，确认能看到 package.json。",
        "code": {
          "label": "进入项目目录示例",
          "content": "cd ~/Desktop/web\npwd\nls"
        }
      },
      {
        "heading": "安装前检查 Node 和 npm",
        "content": "Claude Code 的官方安装方式需要 Node.js 和 npm。Node.js 可以理解成让前端工具运行的基础环境，npm 是安装这些工具的助手。先在终端里检查它们是否存在。能看到版本号，就说明已经安装。",
        "code": {
          "label": "在终端里执行",
          "content": "node -v\nnpm -v"
        }
      },
      {
        "heading": "安装 Claude Code",
        "content": "确认你在项目根目录，并且 node 和 npm 都能显示版本号后，再执行安装命令。根据 Claude Code 官方文档，安装命令如下。执行成功后，终端通常会回到可继续输入命令的状态。如果出现权限或网络报错，先不要反复乱试，优先检查 Node/npm 是否可用、网络是否正常。",
        "code": {
          "label": "在终端里执行",
          "content": "npm install -g @anthropic-ai/claude-code"
        }
      },
      {
        "heading": "启动 Claude Code",
        "content": "安装完成后，在同一个项目目录里输入 claude。它会在当前项目上下文中启动。第一次使用时，可能会要求你登录或授权。按照终端提示完成即可。成功后，你应该能看到 Claude Code 的交互界面，并可以输入自然语言任务。",
        "code": {
          "label": "在终端里执行",
          "content": "claude"
        }
      },
      {
        "heading": "第一个任务只让它解释项目",
        "content": "第一次不要马上让 Claude Code 改代码。先让它解释项目，确认它能读到正确文件。这个任务不会修改文件，适合新手建立安全感。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请先阅读当前项目，不要修改任何文件。\n我是零基础用户，请用中文解释：\n1. 这个项目是做什么的；\n2. package.json、src、index.html 分别有什么作用；\n3. 首页或主要页面在哪里；\n4. 如果我要改一段文案，应该先看哪个文件；\n5. 如何运行和构建这个项目。"
        }
      },
      {
        "heading": "第二个任务才做小修改",
        "content": "确认 Claude Code 能正确解释项目后，再让它做一个很小的修改。比如只改一段文案、只调整一个按钮、只解释一个组件。不要一开始就说“帮我优化整个网站”，那样范围太大，很容易改乱。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请只做一个很小的修改：把首页某一段描述文案改得更清楚。\n要求：\n1. 先告诉我你准备修改哪个文件；\n2. 只修改和这段文案相关的内容；\n3. 不要改页面结构，不要新增功能，不要新增依赖；\n4. 修改后告诉我改了什么。"
        }
      },
      {
        "heading": "怎么看它有没有改对",
        "content": "修改完成后，不要只看 Claude Code 的总结。你需要检查两件事：第一，它改了哪些文件；第二，项目还能不能正常构建。git diff 可以看到修改记录，npm run build 可以检查项目是否还能打包成功。",
        "code": {
          "label": "在终端里执行",
          "content": "git diff\nnpm run build"
        }
      },
      {
        "heading": "成功标准是什么",
        "content": "一次新手任务算成功，至少要满足这些标准：Claude Code 能正确解释项目；只修改了你允许它修改的文件；npm run build 成功；打开浏览器后页面能正常显示；没有出现横向滚动、文字重叠或明显破图。"
      },
      {
        "heading": "常见问题",
        "content": "如果提示找不到 claude，可能是安装没有成功，或者终端没有识别全局命令。先重新打开终端再试。如果提示 npm 不存在，说明 Node.js 可能没装好。如果 Claude Code 看不到项目文件，先检查 pwd 和 ls，确认你在项目根目录。如果修改结果不满意，不要继续追加很多要求，先让它解释 diff，再决定是否回退或重新给一个更小的任务。"
      },
      {
        "heading": "建议你记住的工作流",
        "content": "最稳的 Claude Code 新手流程是：打开项目，打开终端，确认项目根目录，检查 Node/npm，安装并启动 Claude Code，让它先解释项目，再做一个小修改，最后用 git diff 和 npm run build 验证。只要这个流程跑通，你就已经完成了 AI Coding 的第一步。"
      }
    ]
  },
  {
    "id": "claude-code-common-workflows-beginner",
    "sourceUrl": "https://docs.anthropic.com/en/docs/claude-code/common-workflows",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 常用工作流：读懂项目、修问题、做验证",
    "originalTitle": "Claude Code common workflows",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "这篇文章解决什么问题",
        "content": "很多新手装好 Claude Code 后，第一反应是让它“帮我优化项目”。这句话太大，容易让它改很多文件。本文教你一套更稳的日常工作流：先让 Claude Code 读懂项目，再让它定位问题，最后只做一个小修改并验证结果。"
      },
      {
        "heading": "先理解工作流是什么意思",
        "content": "工作流就是一套固定做事顺序。比如做饭要先准备材料，再下锅，再尝味道。AI Coding 也一样：不要一上来就改代码，而是先读项目、确认目标、提出计划、执行小修改、检查结果。顺序对了，工具才稳定。"
      },
      {
        "heading": "第一步：让 Claude 先读懂项目",
        "content": "你可以把这一步理解成“让 Claude 先熟悉现场”。不要让它修改文件，只让它解释项目结构。这样你能确认它看到了正确目录，也能顺便学习这个项目是怎么组织的。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请先阅读当前项目，不要修改任何文件。\n我是零基础用户，请用中文解释：\n1. 这个项目主要做什么；\n2. 哪些文件是入口文件；\n3. 页面组件通常放在哪里；\n4. 样式文件通常放在哪里；\n5. 如果我要修改当前页面，最应该先看哪些文件。"
        }
      },
      {
        "heading": "第二步：让它帮你找相关文件",
        "content": "新手经常不知道应该改哪个文件。这个时候不要自己乱找，也不要让 Claude 直接改。你可以先让它列出和问题相关的文件，并说明每个文件的作用。",
        "code": {
          "label": "找文件提示词",
          "content": "我想修改学习资料详情页，但不知道相关文件在哪里。\n请先不要修改文件。\n请帮我找出：\n1. 页面组件文件；\n2. 学习资料数据文件；\n3. 正文内容文件；\n4. 样式文件；\n5. 哪些文件本次不应该修改。"
        }
      },
      {
        "heading": "第三步：把问题说小",
        "content": "不要说“页面不好看”。要说一个具体问题，比如“按钮太重”“描述太长”“图片占位太复杂”“移动端有横向滚动”。问题越小，Claude Code 越容易给出可控修改。"
      },
      {
        "heading": "第四步：先让它给计划",
        "content": "计划的作用是防止 Claude Code 直接改乱项目。你可以要求它说明准备改哪些文件、为什么改、风险是什么。你看完计划再决定是否执行。",
        "code": {
          "label": "计划提示词",
          "content": "请先给出修改计划，不要立即修改文件。\n问题：学习详情页顶部信息有点重复。\n请说明：\n1. 你准备修改哪些文件；\n2. 每个文件为什么要改；\n3. 有没有可能影响其他页面；\n4. 修改后如何验证。"
        }
      },
      {
        "heading": "第五步：只执行一个小修改",
        "content": "确认计划后，再让它执行。一次只修一个问题，这样你能看清楚修改效果。如果一次修很多问题，即使页面变好了，你也不知道到底是哪一步起作用。"
      },
      {
        "heading": "第六步：看 diff",
        "content": "diff 是代码修改记录。你不需要完全懂代码，也可以看出它改了几个文件、改动是否过大。如果它改了和任务无关的文件，就要停下来让它解释。",
        "code": {
          "label": "在终端里执行",
          "content": "git diff"
        }
      },
      {
        "heading": "第七步：运行 build",
        "content": "build 可以理解成上线前体检。它能检查项目是否还能正常打包。页面看起来没问题但 build 失败，也不能放心继续。新手每次让 AI 改完代码，都应该运行一次构建。",
        "code": {
          "label": "在终端里执行",
          "content": "npm run build"
        }
      },
      {
        "heading": "第八步：打开浏览器检查",
        "content": "构建成功后，还要打开页面看真实效果。重点检查：页面能不能打开，文字有没有重叠，图片有没有破图，按钮是否正常，移动端有没有横向滚动。视觉问题不能只靠 build 检查。"
      },
      {
        "heading": "常见问题",
        "content": "如果 Claude Code 找不到文件，先检查你是否在项目根目录启动。若它准备改太多文件，让它重新给最小方案。若 build 失败，把报错完整复制给它，并要求只修构建错误。若页面变丑，不要继续追加大段要求，先让它解释这次 diff，再决定回退还是小修。"
      },
      {
        "heading": "可以反复使用的工作流",
        "content": "以后每次遇到页面问题，都可以按这个顺序来：读懂项目，找相关文件，把问题说小，先给计划，只做一个小修改，看 diff，运行 build，打开浏览器检查。这个流程虽然慢一点，但非常适合零基础用户建立控制感。"
      }
    ]
  },
  {
    "id": "claude-code-memory-project-rules",
    "sourceUrl": "https://docs.anthropic.com/en/docs/claude-code/memory",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 记忆入门：让它记住项目规则",
    "originalTitle": "How Claude remembers your project",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "这篇文章解决什么问题",
        "content": "很多新手使用 Claude Code 时，会反复解释同样的事情：这是 React 项目、不要改路由、按钮要复用组件、改完要运行 build。项目越大，重复解释越累。这篇文章教你理解 Claude Code 的“记忆”概念，并把长期规则沉淀下来。"
      },
      {
        "heading": "先理解什么是记忆",
        "content": "记忆不是让 Claude 永远记住你所有聊天内容。更准确地说，它是给 Claude Code 的项目上下文说明。你可以把它理解成放在项目里的“工作说明书”：这个项目是什么、有哪些规则、哪些文件不能乱改、完成后应该怎么验证。"
      },
      {
        "heading": "什么是上下文",
        "content": "上下文就是 Claude 做任务时能参考的信息。比如项目目标、目录结构、技术栈、已有组件、设计规范、构建命令、你上一次反馈的问题。上下文越清楚，Claude 越不容易猜错。记忆的作用，就是把一些长期有效的上下文保存下来。"
      },
      {
        "heading": "什么时候需要写项目规则",
        "content": "如果你发现自己每次都在重复说“不要新增后端”“不要重构目录”“只改相关文件”“改完运行 npm run build”，就说明这些内容适合写成项目规则。规则不是一次性需求，而是每次任务都应该遵守的约束。"
      },
      {
        "heading": "项目规则应该写什么",
        "content": "项目规则要短、明确、可执行。不要写“请写出高质量代码”这种空话，而要写清楚技术栈、目录约束、组件复用、禁止事项和验证命令。新手可以先从 6 到 10 条规则开始，不要写成很长的文档。"
      },
      {
        "heading": "可以写入的规则示例",
        "content": "下面是适合新手项目的规则示例。它不包含复杂代码，只告诉 Claude Code 做事边界。你可以根据自己的项目改掉项目名称和技术栈。",
        "code": {
          "label": "项目规则示例",
          "content": "项目规则：\n- 这是一个 React + Vite 前端项目。\n- 使用 npm，不使用 pnpm 或 yarn。\n- 不要新增后端、数据库、真实登录或上传功能。\n- 页面按钮复用已有 Button 组件，卡片复用已有 Card 组件。\n- 不要新增第二套按钮、标签或卡片基础样式。\n- 修改 CSS 时优先维护 tokens、base、layout、components、pages 这些层级。\n- 每次修改后运行 npm run build。\n- 如果任务不清楚，先提问或给计划，不要直接大改。"
        }
      },
      {
        "heading": "不要把临时需求写进长期规则",
        "content": "长期规则适合写稳定约束，比如技术栈、目录、组件复用、验证方式。临时需求不要写进去，比如“今天把首页标题改成某句话”。临时需求应该放在当次提示词里，否则以后 Claude 可能会一直受这个旧要求影响。"
      },
      {
        "heading": "如何验证规则是否有用",
        "content": "你可以给 Claude Code 一个小任务，看它是否主动遵守规则。比如让它优化一个卡片，如果它没有新增第二套样式、没有改无关文件、最后运行了 build，说明规则开始发挥作用。"
      },
      {
        "heading": "让 Claude 先复述规则",
        "content": "新手最稳的做法，是每次重要任务开始前，让 Claude Code 先复述它理解到的项目规则。你看它复述得对不对，再让它修改文件。",
        "code": {
          "label": "规则确认提示词",
          "content": "请先不要修改文件。\n请阅读当前项目规则，并用中文复述：\n1. 这个项目的技术栈；\n2. 哪些事情不能做；\n3. 组件和 CSS 应该如何复用；\n4. 修改后应该如何验证。\n等我确认后，再继续执行任务。"
        }
      },
      {
        "heading": "常见问题",
        "content": "如果 Claude 仍然乱改，通常是规则太抽象或任务太大。先把规则改得更具体，再把任务拆小。如果规则太长，Claude 可能抓不住重点。优先保留最重要的 6 到 10 条。如果你不确定当前 Claude Code 版本使用哪种记忆文件或机制，优先查看官方 Memory 文档。"
      },
      {
        "heading": "新手可以怎么练习",
        "content": "找一个小项目，先写 6 条项目规则。然后让 Claude Code 只改一个按钮或一段文案。修改前让它复述规则，修改后检查 diff 和 build。这样你能很快感受到：规则不是形式主义，而是在帮你减少 AI 乱改。"
      },
      {
        "heading": "最后记住这个原则",
        "content": "Claude Code 的记忆不是为了替你做决定，而是为了减少重复沟通。长期规则写进项目记忆，当次需求写进提示词，修改后用 diff 和 build 验证。这个分工清楚后，AI Coding 会稳定很多。"
      }
    ]
  },
  {
    "id": "datacamp-codex-cli-beginner",
    "sourceUrl": "https://www.datacamp.com/tutorial/open-ai-codex-cli-tutorial",
    "translationMode": "guidedTranslation",
    "title": "Codex CLI 新手入门：从安装到生成页面",
    "originalTitle": "OpenAI Codex CLI Tutorial",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "这篇资料重点学什么",
        "content": "这篇资料适合把 Codex CLI 当成第一个 AI Coding 工具来学习。重点不是记住所有命令，而是理解三个基础能力：在本地项目中启动 Codex、让它读取和修改文件、通过审批和验证控制风险。对零基础用户来说，先建立这个工作闭环，比追求复杂技巧更重要。"
      },
      {
        "heading": "先理解审批模式",
        "content": "Codex CLI 的一个关键点是审批模式。新手不要一开始就让工具自动修改所有内容，更稳的方式是先使用默认或受限模式，让它提出修改建议、展示 diff，再由你确认执行。这样可以避免因为任务描述不清导致项目结构被大幅重写。",
        "code": {
          "label": "终端命令示例",
          "content": "npm install -g @openai/codex\ncodex"
        }
      },
      {
        "heading": "用图片输入生成页面原型",
        "content": "教程中比较适合设计师和产品经理学习的一段，是把截图或界面参考交给 Codex，让它生成网页原型。这里的重点不是复制截图，而是学会描述目标、保留视觉结构、说明技术栈和验收标准。"
      },
      {
        "heading": "图片输入前要先补文字说明",
        "content": "只给截图不够，因为截图只能表达视觉，不能说明业务目标、交互状态和技术限制。比如一张 dashboard 截图，AI 不知道你要做真实数据、静态页面还是视觉复刻。最好同时写清楚页面用途、技术栈、允许修改的文件和最终验收标准。",
        "code": {
          "label": "图片输入配套提示词",
          "content": "请参考我提供的截图，做一个静态前端页面。\n目标用户：设计师和产品经理。\n技术栈：React + Vite + 普通 CSS。\n要求：只做前端，不做后端、登录、数据库和上传。\n请先描述页面结构，再生成代码。\n完成后运行 npm run build。"
        }
      },
      {
        "heading": "生成页面后要检查什么",
        "content": "图片生成页面后，不要只看第一眼像不像。你要检查：移动端是否溢出，文字是否可读，按钮是否能点击，图片比例是否正确，是否新增了不必要依赖，构建是否成功。如果是学习项目，还要让 Codex 解释每个组件的作用。"
      },
      {
        "heading": "新手练习建议",
        "content": "第一次练习可以选一个非常小的页面：一个登录弹窗、一张案例卡片、一个工具卡片或一个 Hero 区域。不要一开始就让 Codex 根据截图做完整应用。先练小页面，你会更快理解提示词、文件修改和验证流程。"
      },
      {
        "heading": "可以直接复用的练习流程",
        "content": "把学习重点放在流程上：准备截图或参考，写清楚目标和限制，让 Codex 先拆结构，再生成小范围代码，最后运行构建并打开页面检查。",
        "code": {
          "label": "练习流程模板",
          "content": "请按这个流程工作：\n1. 先根据截图拆解页面结构；\n2. 告诉我需要哪些组件；\n3. 等我确认后再写代码；\n4. 只修改和这个页面相关的文件；\n5. 完成后运行 npm run build；\n6. 总结页面还有哪些需要人工检查的地方。"
        }
      }
    ]
  },
  {
    "id": "codex-usage-practices",
    "sourceUrl": "https://developers.openai.com/codex/prompting",
    "translationMode": "guidedTranslation",
    "title": "Codex 使用实践：如何把任务交代清楚",
    "originalTitle": "Prompting Codex",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解什么是任务交代",
        "content": "任务交代就是告诉 Codex：你要解决什么问题、它可以看哪些文件、可以改哪些文件、不能改什么、完成后怎么验证。它不是一句命令，而是一份小型工作说明书。"
      },
      {
        "heading": "为什么边界比灵感更重要",
        "content": "Codex 很擅长执行清楚的工程任务，但它不会自动知道你的项目规则。如果你不写边界，它可能会新增依赖、重构目录或改动无关页面。清楚的边界能让它像团队成员一样按规则工作。"
      },
      {
        "heading": "一个完整任务应该包含什么",
        "content": "建议包含五部分：背景、目标、允许修改范围、禁止事项、验收标准。背景让它理解为什么做；目标让它知道要达到什么效果；范围和禁止事项保护项目；验收标准让它知道什么时候停止。",
        "code": {
          "label": "Codex 任务模板",
          "content": "背景：当前学习卡片信息太拥挤。\n目标：让卡片更适合零基础用户阅读。\n允许修改：src/components/Cards.jsx、src/styles.css。\n禁止事项：不要改数据、不要新增路由、不要重构目录、不要新增依赖。\n验收标准：标题清楚，描述两行，底部信息对齐，移动端不溢出，npm run build 成功。"
        }
      },
      {
        "heading": "让 Codex 自己复述理解",
        "content": "复杂任务开始前，可以让 Codex 先复述它的理解。你只要看它是否遗漏了关键约束，就能提前发现风险。确认无误后再让它修改文件。"
      }
    ]
  },
  {
    "id": "cursor-agent-workflow",
    "sourceUrl": "https://docs.cursor.com/agent/overview",
    "translationMode": "guidedTranslation",
    "title": "Cursor Agent 工作流：从需求到多文件修改",
    "originalTitle": "Cursor Agent Documentation",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解什么是 Agent",
        "content": "Agent 可以理解为“能自己看文件、计划修改、执行操作的 AI 助手”。Cursor Agent 工作在编辑器里，可以结合当前项目上下文处理任务。它比普通聊天更接近真实开发协作。"
      },
      {
        "heading": "先让 Agent 找文件",
        "content": "新手不要直接让 Agent 改代码。第一步应该让它找出相关文件，比如页面组件、数据文件、样式文件。这样你会知道项目结构，也能判断它有没有找错地方。",
        "code": {
          "label": "Cursor Agent 模板",
          "content": "请先不要修改代码。\n请帮我找到当前学习资料页面相关文件，并说明：\n1. 页面组件在哪里；\n2. 卡片组件在哪里；\n3. 数据在哪里；\n4. 样式在哪里；\n5. 如果要优化排版，最小修改范围是什么。"
        }
      },
      {
        "heading": "再让它做小步修改",
        "content": "确认文件后，再让 Agent 执行一个小修改。比如只改卡片间距、只改按钮样式、只补一个空状态。小步修改更容易检查，也更容易回退。"
      },
      {
        "heading": "每轮都检查 diff",
        "content": "diff 是修改前后的差异。即使你不完全懂代码，也可以看出它改了哪些文件、改动是否过大。新手要养成习惯：AI 修改后先看 diff，再看页面。"
      }
    ]
  },
  {
    "id": "cursor-rules-project-standards",
    "sourceUrl": "https://docs.cursor.com/context/rules",
    "translationMode": "guidedTranslation",
    "title": "Cursor Rules 项目规范：让 AI 按你的方式写代码",
    "originalTitle": "Cursor Rules Documentation",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "Rules 是什么",
        "content": "Rules 可以理解为写给 AI 的项目说明书。它记录这个项目长期都要遵守的规则，比如技术栈、目录结构、组件复用、视觉规范、禁止事项和验证命令。"
      },
      {
        "heading": "为什么新手也需要 Rules",
        "content": "新手经常在每次任务里重复说明“不要重构目录、不要新增功能、改完要构建”。Rules 可以把这些重复说明固定下来，减少 AI 忘记上下文的概率。"
      },
      {
        "heading": "Rules 应该写什么",
        "content": "不要写抽象口号，写可执行规则。比如“按钮必须复用 Button 组件”“不要新增第二套卡片样式”“截图不要放进项目目录”“每次修改后运行 npm run build”。",
        "code": {
          "label": "项目规则示例",
          "content": "项目规则：\n- 使用 React + Vite + npm。\n- 不要新增后端、数据库、真实登录或上传功能。\n- 页面按钮复用已有 Button，卡片复用已有 Card。\n- 不要创建第二套卡片或标签样式。\n- 视觉目标：高级、编辑感、可信、克制。\n- 修改完成后运行 npm run build。"
        }
      },
      {
        "heading": "规则要短而稳定",
        "content": "Rules 不是需求文档，不能写得太长。它应该记录长期稳定的约束。某一次任务的临时要求，仍然写在当次提示词里。"
      }
    ]
  },
  {
    "id": "claude-code-best-practices",
    "sourceUrl": "https://www.anthropic.com/engineering/claude-code-best-practices",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 最佳实践：用 Agent 处理真实代码库",
    "originalTitle": "Claude Code: Best practices for agentic coding",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解 Claude Code 的角色",
        "content": "Claude Code 是命令行里的 Coding Agent。它能在项目目录中读取文件、修改代码、执行命令。对零基础用户来说，它像一个会操作终端的协作者，但你仍然需要给它边界和验收标准。"
      },
      {
        "heading": "先建立上下文",
        "content": "上下文就是 Claude Code 需要知道的信息：项目目标、相关文件、技术栈、不能改的内容、你希望看到的结果。上下文越清楚，它越不容易做无关修改。"
      },
      {
        "heading": "让任务小步推进",
        "content": "不要一次让 Claude Code 做完整系统。先让它解释项目，再让它改一个小功能，最后运行构建。每一轮都保持可检查、可回退。",
        "code": {
          "label": "Claude Code 新手模板",
          "content": "请先阅读当前项目，不要修改文件。\n请说明项目结构、运行命令和首页相关文件。\n然后给出一个最小修改计划。\n未经我确认前，不要删除文件、不要安装依赖、不要修改配置。"
        }
      },
      {
        "heading": "对高风险操作保持谨慎",
        "content": "删除文件、安装依赖、修改构建配置、执行远程脚本，都属于高风险操作。看到这类操作时，先让 Claude Code 解释原因，再决定是否继续。"
      }
    ]
  },
  {
    "id": "v0-ui-prompting-method",
    "sourceUrl": "https://v0.app/docs",
    "translationMode": "guidedTranslation",
    "title": "v0 界面生成方法：从页面意图到组件提示词",
    "originalTitle": "v0 Documentation",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解 v0 是什么",
        "content": "v0 是偏界面生成的工具，适合把页面想法快速变成 React 组件或页面原型。它不是替你完成产品思考，而是帮助你更快得到一个可以看、可以改、可以讨论的界面起点。"
      },
      {
        "heading": "先写页面意图",
        "content": "不要只说“生成一个首页”。你要说明页面面向谁、解决什么问题、用户看完后应该做什么。页面意图越清楚，v0 生成的结构越接近需求。"
      },
      {
        "heading": "再写组件和状态",
        "content": "一个真实页面不只有默认状态，还可能有空状态、加载状态、错误状态和移动端布局。新手可以先列出需要哪些卡片、按钮、表单、筛选和提示信息，再让 v0 生成。",
        "code": {
          "label": "v0 提示词模板",
          "content": "请生成一个学习资料列表页。\n用户：零基础学习 AI 编程的人。\n页面包含：标题、简介、学习卡片网格、空状态。\n卡片显示：标题、两行描述、浏览量、点赞量、查看资料链接。\n视觉要求：简洁、可信、像编辑精选站。\n移动端：单列，不横向溢出。"
        }
      },
      {
        "heading": "生成后要二次整理",
        "content": "v0 生成的页面通常只是起点。你还需要统一字体、颜色、间距、按钮权重、真实数据和页面状态。不要把第一次生成结果直接当最终稿。"
      }
    ]
  },
  {
    "id": "context-engineering-coding-agents",
    "sourceUrl": "https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html",
    "translationMode": "guidedTranslation",
    "title": "Coding Agent 的上下文工程：让 AI 看见正确的信息",
    "originalTitle": "Context engineering for coding agents",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解上下文",
        "content": "上下文就是 AI 做任务时能看到和理解的信息。它不只是一句提示词，还包括项目文件、需求目标、已有规则、报错信息、截图反馈、构建结果和你对输出的评价。"
      },
      {
        "heading": "为什么上下文会影响结果",
        "content": "如果 AI 看不到正确文件，它会猜；如果看不到项目规则，它会乱改；如果没有错误信息，它很难修 bug。上下文工程就是把正确的信息放到 AI 面前，让它少猜、多验证。"
      },
      {
        "heading": "给足够信息，但不要塞太多",
        "content": "上下文不是越多越好。把整个项目所有文件都塞给 AI，反而会分散注意力。更好的方式是指向相关页面、组件、数据和样式文件，再让它先复述理解。",
        "code": {
          "label": "上下文提示词模板",
          "content": "请只关注学习资料详情页。\n相关文件：src/pages/LearnDetailPage.jsx、src/components/Cards.jsx、src/styles.css、src/content/learningContent.js。\n目标：让正文更适合零基础用户阅读。\n请先解释这些文件分别负责什么，再给出修改计划。"
        }
      },
      {
        "heading": "把反馈也当作上下文",
        "content": "截图、报错、构建失败信息、用户反馈，都是上下文。比如你告诉 AI“卡片太挤、标签太重、图片有黑边”，它下一轮就能更准确地修改。不要只说“不好看”，要描述具体问题。"
      }
    ]
  }
];
