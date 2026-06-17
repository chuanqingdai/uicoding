const guidedNotice = "本文为 Uicoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。";

function parseLearningMarkdown(markdown) {
  const sections = [];
  let current = { heading: '', blocks: [] };
  let paragraphLines = [];
  let codeLines = [];
  let codeLanguage = '';
  let inCodeBlock = false;
  let codeFence = '';
  let nestedCodeFence = '';

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
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);

    if (fenceMatch) {
      if (inCodeBlock) {
        if (nestedCodeFence) {
          codeLines.push(line);
          if (fenceMatch[1].startsWith(nestedCodeFence)) {
            nestedCodeFence = '';
          }
          return;
        }

        if (
          codeLanguage.toLowerCase() === 'md' &&
          fenceMatch[1].length < codeFence.length
        ) {
          nestedCodeFence = fenceMatch[1];
          codeLines.push(line);
          return;
        }

        if (fenceMatch[1].startsWith(codeFence)) {
          current.blocks.push({
            type: 'code',
            label: codeLanguage ? `${codeLanguage} 提示词` : '可复制内容',
            content: codeLines.join('\n').trimEnd(),
          });
          codeLines = [];
          codeLanguage = '';
          codeFence = '';
          nestedCodeFence = '';
          inCodeBlock = false;
          return;
        }

        codeLines.push(line);
        return;
      }

      commitParagraph();
      codeFence = fenceMatch[1];
      codeLanguage = fenceMatch[2].trim();
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
      label: codeLanguage ? `${codeLanguage} 提示词` : '可复制内容',
      content: codeLines.join('\n').trimEnd(),
    });
  }

  commitSection();

  return sections;
}

const uicodingSkillArticleMarkdown = "# 我如何用 Codex + Impeccable Skill 做出 UIcoding.ai\n\n最近我用 Codex 搭了一个新站：UIcoding.ai。\n\n这个网站的定位很简单：整理 AI Coding 案例、学习资料、工具介绍，帮助设计师、产品经理、独立开发者更快学会用 Codex、Claude Code、Cursor 这类工具做真实产品。\n\n但真正做下来，我发现一个问题：\n\nCodex 写代码很快，但默认设计能力不稳定。\n\n它可以很快创建页面、组件、路由、数据结构，也能修构建错误。但当我说“页面更高级一点”“更像编辑精选站”“减少模板感”的时候，Codex 经常会走偏。\n\n比如它会加很多卡片。\n加很多背景块。\n加很重的阴影。\n加渐变。\n加发光边框。\n按钮越来越黑。\n标签越来越抢眼。\n最后页面不是更高级，而是更像 AI 自动生成的网站。\n\n后面我开始配合使用一个前端设计 Skill：Impeccable。\n\n我自己的理解是：\n\nCodex 负责写代码。\nImpeccable 负责做设计审查。\n\n它不是直接替你变出一个完美网站，而是帮你发现页面为什么不高级、哪里像模板、哪里排版不舒服、哪里组件太重、哪里视觉层级混乱。\n\n这篇文章复盘一下，我是怎么用 Codex + Impeccable Skill 搭建 UIcoding.ai 的。\n\n文中的代码块都可以直接复制到 Codex 输入框里，根据你的项目名称做少量替换就能用。\n\n---\n\n## 1. 为什么要给 Codex 配 Impeccable\n\n只用 Codex 写代码时，它非常适合完成明确的工程任务。\n\n比如：\n\n创建页面。\n新增组件。\n调整路由。\n补静态数据。\n修构建错误。\n优化移动端。\n整理页面结构。\n\n这些事情只要你描述清楚，Codex 基本都能完成。\n\n但设计不一样。\n\n设计不是简单地“多写几行样式”。\n\n很多时候页面不高级，不是因为缺少效果，而是因为东西太多了。\n\n我在做 UIcoding.ai 的时候，遇到过很多这种问题：\n\n首页 Hero 区域信息太满。\n案例卡片像普通组件库默认样式。\n学习资料页面没有文章阅读感。\n工具页 icon 白底太突兀。\n按钮颜色太重，抢了内容注意力。\n标签太多，视觉上比标题还突出。\n卡片 hover 太夸张，页面像模板站。\n灰色占位图太默认，没有编辑感。\n\n如果我只对 Codex 说：\n\n```text\n页面不够高级，帮我优化一下。\n```\n\n它很容易继续堆效果。\n\n但 Impeccable 更适合做“设计审查”。\n\n我会让它先审查页面，再只挑最影响质感的几个问题改。\n\n这样比一次性大改稳定很多。\n\n---\n\n## 2. 一键安装 Impeccable：直接复制给 Codex\n\n如果你想在 Codex 项目里使用 Impeccable，最简单的方式不是自己去研究一堆命令，而是直接让 Codex 帮你检查、安装、初始化。\n\n我会把安装任务也写得很明确。\n\n不要让 Codex 一边安装，一边顺手改项目代码。\n\n可以直接复制这段：\n\n```text\n请帮我在当前项目中一键安装并初始化 Impeccable Skill。\n\n要求：\n1. 先确认当前目录是否是项目根目录。\n2. 检查 package.json 是否存在。\n3. 不要修改业务代码。\n4. 不要修改页面组件。\n5. 不要修改 CSS 文件。\n6. 只执行 Impeccable 的安装和初始化相关步骤。\n7. 如果需要执行命令，请先说明命令用途，然后再执行。\n8. 安装完成后，告诉我如何在 Codex 中调用 Impeccable。\n\n请执行：\n- npx impeccable install\n- 按项目级安装优先\n- 安装后提示我重启 Codex 或重新加载技能\n- 然后指导我运行 /impeccable init\n\n如果 Codex 中看不到 /impeccable，请告诉我如何通过 /skills 或 $ 检查技能是否已加载。\n```\n\n这段的重点是：\n\n只安装 Skill。\n不要改页面。\n不要改 CSS。\n不要顺手优化 UI。\n\n安装工具和修改项目要分开。\n\n这是我踩过的坑。\n\n有时候你只是想安装一个 Skill，Codex 会顺手开始“优化项目结构”。这种非常没必要。\n\n所以安装阶段一定要写清楚：只安装，不改业务代码。\n\n---\n\n## 3. 初始化 Impeccable：先告诉它 UIcoding.ai 是什么\n\n安装之后，不要马上让它改页面。\n\n先初始化项目上下文。\n\nImpeccable 需要知道这个网站是什么类型、面向谁、视觉方向是什么、不要像什么。\n\nUIcoding.ai 不是一个传统 SaaS 工具站。\n\n它更像一个 AI Coding 案例和学习内容站。\n\n所以我不会只说“现代、简洁、高级”。\n\n这种词太泛了。\n\n我会这样描述：\n\n```text\n请使用 /impeccable init 初始化当前项目的设计上下文。\n\n这是 UIcoding.ai，一个 AI Coding 案例和学习内容站。\n\n项目定位：\n- 面向设计师、产品经理、独立开发者、一人公司\n- 帮助用户学习如何使用 Codex、Claude Code、Cursor 等 AI Coding 工具\n- 展示优秀 AI Coding 案例、教程、工具和实战经验\n\n网站气质：\n- 编辑感\n- 可信\n- 简洁\n- 有审美\n- 像高质量内容精选站\n- 不要像普通 SaaS 模板\n- 不要像组件库 demo\n- 不要像自动生成的 AI 工具站\n\n视觉参考：\n- 高质量编辑型内容站\n- 设计案例精选站\n- 干净的产品手册页面\n- 有留白、有节奏、有明确层级\n\n反向要求：\n- 不要重渐变\n- 不要重阴影\n- 不要发光边框\n- 不要多层卡片嵌套\n- 不要满屏黑色按钮\n- 不要让标签比标题更抢眼\n- 不要把所有内容都放进背景块\n\n初始化完成后，请总结 Impeccable 记录了哪些项目上下文。\n不要修改页面代码。\n```\n\n这一步很重要。\n\n因为如果没有项目上下文，Impeccable 也只能给出比较通用的设计建议。\n\n我希望它理解：\n\nUIcoding.ai 是内容站，不是后台系统。\n是编辑精选站，不是普通工具站。\n是给 AI Coding 学习者看的，不是给企业采购看的。\n\n上下文越清楚，后面的设计审查越准确。\n\n---\n\n## 4. 先做能跑起来的项目，不要一开始追求完美\n\nUIcoding.ai 一开始不是直接做完整网站。\n\n我先让 Codex 创建一个最小可运行版本。\n\n技术上也没有搞复杂：\n\nReact。\nVite。\nnpm。\n普通 CSS。\n静态数据。\n\n页面也先只做首页：\n\nHeader。\nHero。\n精选案例。\n学习资料。\n常用工具。\nFooter。\n\n这个阶段最重要的不是设计多漂亮，而是项目能跑、结构清晰、文件不要拆太碎。\n\n可以直接复制：\n\n```text\n从零开始创建一个 React + Vite 前端项目。\n\n技术栈：\n- React\n- Vite\n- npm\n- 普通 CSS\n- 静态数据\n\n当前只做首页。\n不要做后端。\n不要做登录。\n不要做数据库。\n不要接 API。\n不要引入复杂组件库。\n\n文件结构保持简单：\n- src/main.jsx\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/\n\n样式文件可以按规范拆分，但不要过度复杂：\n- tokens\n- base\n- layout\n- components\n- pages\n\n首页包含：\n1. Header\n2. Hero\n3. 精选案例\n4. 学习资料\n5. 常用工具\n6. Footer\n\n完成后运行：\nnpm install\nnpm run build\n\n构建成功后停止，不要继续扩展新功能。\n```\n\n这里有个坑。\n\n如果一开始就说“帮我做完整网站”，Codex 很容易把项目拆得很复杂。\n\n路由、状态、组件、样式文件、数据文件全部一起上。\n\n看起来很专业，但后面非常难控。\n\n我现在更倾向于：\n\n先简单跑起来。\n再逐页迭代。\n再用 Impeccable 审查。\n最后把规范沉淀到固定样式文件里。\n\n---\n\n## 5. 设计规范不要只写进 MD，要沉淀成固定 CSS 规范\n\n这里我后来也调整过一次。\n\n一开始我以为，把设计规则写进 AGENTS.md 或 DESIGN.md 就够了。\n\n比如告诉 Codex：\n\n页面要高级。\n按钮不要太重。\n卡片不要太模板。\n不要使用重渐变。\n标签不要太抢眼。\n\n但实际开发下来发现，只写在 MD 文件里不够。\n\nMD 文件更适合做上下文说明和工作规则。\n\n真正决定网站质感的，是固定的 CSS 规范。\n\n我的理解是：\n\nAGENTS.md 管 Codex 的行为。\nPRODUCT.md / DESIGN.md 管设计上下文。\n固定 CSS 文件管真正的视觉系统。\nImpeccable 负责审查页面有没有偏离规范。\n\n所以 UIcoding.ai 的样式不应该散落在每个页面里，也不应该每次让 Codex 重新写一套样式。\n\n更合理的方式是建立固定样式结构：\n\n```text\nsrc/styles/\n  tokens.css\n  base.css\n  layout.css\n  components.css\n  pages.css\n```\n\n这里不展开 CSS 代码，只说每个文件的作用。\n\ntokens.css：放颜色、字体、字号、间距、圆角、阴影、容器宽度。\nbase.css：放 body、标题、段落、链接、图片等基础样式。\nlayout.css：放 Container、Section、Grid、页面宽度、响应式布局。\ncomponents.css：放 Button、Card、Badge、Nav、Footer 等通用组件样式。\npages.css：放首页、案例页、详情页等页面级样式。\n\n这样做的好处是：\n\n颜色不会每个页面乱写。\n按钮不会每个页面长得不一样。\n卡片圆角和间距会统一。\n页面布局有固定节奏。\nCodex 不会每次重新发明一套视觉系统。\n\n可以直接复制这个提示词：\n\n```text\n请为当前项目建立一套固定 CSS 设计规范，但不要输出具体 CSS 代码给我解释。\n\n目标：\n把 UIcoding.ai 的视觉规范沉淀到固定样式文件中，而不是只写进 AGENTS.md 或 DESIGN.md。\n\n请整理或创建这些文件：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n要求：\n1. tokens.css 只负责设计变量，比如颜色、字体、字号、间距、圆角、阴影、容器宽度。\n2. base.css 只负责全站基础样式，比如 body、标题、段落、链接、图片。\n3. layout.css 只负责布局规则，比如 Container、Section、Grid、响应式。\n4. components.css 只负责通用组件，比如 Button、Card、Badge、Nav、Footer。\n5. pages.css 只负责页面级样式，比如首页、案例页、详情页。\n6. 不要把页面专属样式写进 tokens。\n7. 不要在页面文件里随机新增颜色、阴影、圆角和间距。\n8. 不要引入新的 UI 组件库。\n9. 不要重构业务逻辑。\n10. 不要修改页面内容结构，除非样式引用必须调整。\n\n视觉方向：\n- 编辑感\n- 干净\n- 高级\n- 可信\n- 不要像默认组件库\n- 不要重渐变\n- 不要重阴影\n- 不要多层卡片嵌套\n- 标签不要抢过标题\n- 按钮不要太重\n\n完成后运行 npm run build，并总结：\n1. 创建或修改了哪些样式文件\n2. 每个样式文件负责什么\n3. 哪些页面或组件引用了这些样式\n4. 是否存在需要后续清理的重复样式\n```\n\n这个比“把设计规则写进 AGENTS.md”更有效。\n\nAGENTS.md 可以提醒 Codex 不要乱改设计系统。\n\n但真正的设计系统，必须落到固定 CSS 文件里。\n\n---\n\n## 6. 把大任务拆成单页任务\n\nAI Coding 最容易失控的地方，就是一次性要求它做完整站点。\n\nUIcoding.ai 我后面拆成了几个页面：\n\n首页。\n案例列表页。\n案例详情页。\n学习资料页。\n工具索引页。\n工具详情页。\n提交作品页。\n登录页。\n404 页面。\n\n每次只做一个页面。\n\n比如做案例页，我不会说“把案例系统做完整”。\n\n我会这样写：\n\n```text\n继续开发当前项目。\n\n本次任务只实现一个页面：/cases。\n\n不要创建后端。\n不要创建登录。\n不要接数据库。\n不要重构目录。\n不要引入复杂路由方案。\n不要修改首页视觉风格。\n不要修改设计 tokens。\n\n允许新增：\n- src/pages/CasesPage.jsx\n\n允许修改：\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/pages.css\n\n页面必须复用已有组件和样式规范：\n- Container\n- Section\n- Button\n- Badge\n- Card\n- CaseCard\n\n页面内容：\n1. 页面标题\n2. 简短说明\n3. 分类筛选\n4. 案例卡片列表\n5. 空状态\n\n完成后运行：\nnpm run build\n\n如果构建成功就停止。\n```\n\n这种写法看起来啰嗦，但非常有用。\n\n因为它限制了 Codex 的修改范围。\n\n我之前踩过的坑是：只想做一个页面，它顺手把全站样式也改了。\n\n所以现在我会明确写：\n\n允许新增什么。\n允许修改什么。\n禁止修改什么。\n必须复用什么。\n完成后跑什么命令。\n\n这样出问题也容易定位。\n\n---\n\n## 7. 用 Impeccable 做第一次设计审查\n\n页面能跑起来之后，不要马上继续加功能。\n\n先让 Impeccable 做设计审查。\n\n这里一定不要说“帮我改好看一点”。\n\n要让它先审查，不要直接改代码。\n\n可以复制：\n\n```text\n请使用 Impeccable Skill 走查当前首页。\n\n目标：\n- 高级\n- 编辑感\n- 可信\n- 像高质量 AI Coding 内容站\n- 不要像默认组件库模板\n- 不要像 AI 自动生成的 SaaS 页面\n\n请重点检查：\n1. 信息层级是否清楚\n2. Hero 是否太满\n3. 字体和字号是否有节奏\n4. 按钮是否太重\n5. 卡片是否太像模板\n6. 标签是否太抢眼\n7. 图片占位是否太默认\n8. 移动端是否拥挤\n9. 页面是否复用 src/styles 下的设计规范\n10. 是否存在页面里随机新增颜色、阴影、圆角和间距\n\n不要直接大改代码。\n先只指出最影响质感的 3 个问题。\n\n每个问题请包含：\n- 具体问题\n- 为什么影响质感\n- 建议怎么改\n- 可能涉及哪些样式文件或组件\n```\n\n这一步很关键。\n\n我不让它马上改代码，而是先让它审查。\n\n因为很多时候 Codex 直接改，会一次性改太多。\n\n先让 Impeccable 给出问题清单，再挑前三个改，效果会稳定很多。\n\n---\n\n## 8. 只修前三个最影响质感的问题\n\nImpeccable 走查后，通常会指出很多问题。\n\n但不要一次性全改。\n\n我一般只挑最重要的 3 个。\n\n比如它指出：\n\n按钮太重。\n卡片信息太挤。\n图片占位太默认。\n\n那这一轮就只改这三个。\n\n可以这样写：\n\n```text\n根据刚才 Impeccable 的设计走查结果，本轮只修复最影响质感的 3 个问题。\n\n只允许调整：\n- 颜色引用\n- 字体层级\n- 间距\n- 卡片样式\n- 按钮样式\n- 图片占位样式\n- 移动端布局细节\n\n优先修改：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n不要新增页面。\n不要修改数据结构。\n不要重构组件。\n不要改路由。\n不要引入新依赖。\n不要做动画大改。\n不要在页面文件中写散乱样式。\n\n修复目标：\n1. 降低按钮的视觉重量\n2. 让卡片信息更舒展\n3. 让图片占位更像真实内容站，而不是灰色默认块\n\n完成后运行 npm run build，并总结修改了哪些文件。\n```\n\n这个方式比“帮我整体提升设计”稳定很多。\n\n因为它不是凭感觉改，而是基于设计审查结果改。\n\n---\n\n## 9. Impeccable 真正有用的地方：反模板感\n\n我觉得 Impeccable 最大的价值，不是让页面突然变成世界顶级设计。\n\n而是帮你避免 AI 页面常见问题。\n\n比如：\n\n卡片太多。\n按钮太黑。\n标签太抢眼。\n阴影太模板。\n渐变太重。\n页面到处都是圆角卡片。\n图标都放在圆角方块里。\n灰色文字放在浅色背景上，可读性很差。\nHero 区域堆太多信息，像 AI 生成的 SaaS 模板。\n\n这些问题非常常见。\n\nCodex 默认很容易做出这种页面，因为它学到的很多前端模式就是这种。\n\nImpeccable 的好处是，它会提醒你：\n\n不要再堆卡片了。\n不要再加渐变了。\n不要让标签比标题还抢眼。\n不要用组件库默认审美。\n不要把所有内容都装进背景块里。\n不要让 hover 效果变成炫技。\n\n这对 UIcoding.ai 很有帮助。\n\n因为我希望它更像一个编辑精选站，而不是一个普通 AI 工具站。\n\n---\n\n## 10. 自动设计审查：让 Impeccable 每轮都检查\n\n后面我更常用的是一个固定循环：\n\nCodex 完成页面。\nImpeccable 审查。\n只修前三个问题。\n重新构建。\n再检查页面。\n\n可以把这个流程写成固定提示词：\n\n```text\n请对当前页面执行一次 Impeccable 自动设计审查循环。\n\n流程：\n1. 读取当前页面和相关样式文件。\n2. 从视觉品质角度审查页面。\n3. 检查页面是否符合 src/styles 下的固定 CSS 规范。\n4. 只列出最影响质感的 3 个问题。\n5. 不要提出超过 3 个问题。\n6. 不要大改结构。\n7. 只针对这 3 个问题做最小修改。\n8. 修改后运行 npm run build。\n9. 最后总结修改文件、修改内容和剩余问题。\n\n审查标准：\n- 是否像真实内容站\n- 是否有编辑感\n- 是否有清晰层级\n- 是否避免组件库默认感\n- 是否避免 AI 模板感\n- 是否移动端可读\n- 是否复用 tokens、layout、components 的样式规范\n- 是否存在随机颜色、随机圆角、随机阴影、随机间距\n\n不要新增页面。\n不要新增功能。\n不要修改业务逻辑。\n不要引入新依赖。\n```\n\n这个提示词我觉得很适合零基础用户。\n\n因为你不需要懂太多设计术语。\n\n只要让 Impeccable 先审查，再让 Codex 只改前三个问题，就能稳定提升页面质感。\n\n---\n\n## 11. 更严格一点：用 detect 做反模式检查\n\n除了让 Impeccable 在 Codex 里审查页面，也可以让它做更偏自动化的反模式检查。\n\n我会把它理解成：\n\n不是审美打分。\n而是检查页面里有没有明显的 AI 设计坏味道。\n\n比如：\n\n重渐变。\n发光边框。\n过度阴影。\n模板化色彩。\n不必要的视觉装饰。\n\n可以直接复制：\n\n```text\n请为当前项目执行一次 Impeccable 反模式检测。\n\n要求：\n1. 运行 npx impeccable detect src/\n2. 如果检测失败，请不要马上大改。\n3. 先总结检测到了哪些问题。\n4. 按严重程度排序。\n5. 只选择最影响页面质感的 3 个问题。\n6. 说明每个问题可能影响哪些页面或组件。\n7. 等我确认后再修改。\n\n不要修改业务逻辑。\n不要新增依赖。\n不要改路由。\n不要重构组件结构。\n```\n\n我建议不要让它检测完就自动大改。\n\n先让它列问题。\n\n因为有些检测结果可能不是当前最重要的问题。\n\n设计优化不是越多越好。\n\n每次只改最重要的 3 个，反而更稳。\n\n---\n\n## 12. 页面验证不要省\n\n很多问题不是看代码能发现的。\n\n而是在浏览器里才看得出来。\n\n我做 UIcoding.ai 的时候，遇到过这些问题：\n\n卡片底部有一条白线。\n图标白底太大。\nHero 图片被裁剪。\n详情页正文宽度太宽。\n标签在移动端换行很乱。\n某个卡片 hover 后会撑开布局。\n图片加载失败后占位很丑。\n页面出现横向滚动条。\n\n所以每次修改后，我都会要求 Codex 做验证。\n\n```text\n修改完成后请执行以下验证：\n\n1. 运行 npm run build。\n2. 打开本地页面。\n3. 检查是否有横向溢出。\n4. 检查移动端布局是否拥挤。\n5. 如果页面包含图片，检查图片是否加载成功、是否被裁剪。\n6. 如果页面包含卡片，检查 hover、按钮、标签、标题和描述是否对齐。\n7. 如果页面包含长文本，检查正文宽度和行高是否适合阅读。\n8. 检查页面是否继续复用 src/styles 下的固定样式规范。\n\n只汇报验证结果。\n不要继续扩展新功能。\n```\n\n这里的关键是最后一句：\n\n不要继续扩展新功能。\n\nCodex 有时候很容易顺手做更多事情。\n\n你必须让它停在当前任务。\n\n---\n\n## 13. AGENTS.md 应该写什么\n\n设计规范不应该只写进 AGENTS.md。\n\n但 AGENTS.md 仍然有用。\n\n它应该写工作规则，而不是承载完整设计系统。\n\n我会这样写：\n\n```text\n请更新 AGENTS.md，只加入必要的工作规则。\n\n不要把完整设计规范写进 AGENTS.md。\n真正的设计规范在 src/styles/ 下的固定 CSS 文件中。\n\nAGENTS.md 只需要说明：\n1. 不要删除、移动、重命名文件，除非明确要求。\n2. 不要重构无关代码。\n3. 不要修改业务逻辑，除非当前任务要求。\n4. UI 修改必须优先复用 src/styles 下的规范。\n5. 不要在页面文件里随机新增颜色、阴影、圆角、间距。\n6. 不要随便修改 tokens，除非任务明确要求调整设计系统。\n7. 每次 UI 修改后，优先使用 Impeccable 做设计审查。\n8. 每轮只修最重要的 3 个视觉问题。\n9. 修改完成后必须运行 npm run build。\n10. 最后总结修改了哪些文件。\n\n保持简洁，不要写成长文档。\n```\n\n这样更合理。\n\nAGENTS.md 负责提醒 Codex：\n\n设计系统已经在 CSS 里了。\n不要每次重新发明样式。\n不要乱改 tokens。\n不要把页面样式写散。\n\n而 Impeccable 负责审查页面有没有偏离规范。\n\n---\n\n## 14. Impeccable 帮我具体改出了哪些方向\n\nUIcoding.ai 后面的视觉方向，就是这样一点点收敛出来的。\n\n一开始页面比较像普通组件站。\n\n后来慢慢改成：\n\n品牌色从纯黑转向更有温度的棕色。\n按钮变轻，不再满屏黑色按钮。\n卡片 hover 只做轻微反馈。\n学习详情页更像文章阅读，不再用很多背景块。\n工具页统一真实产品 icon，而不是随机图标。\n案例详情页减少模块堆叠，重点展示图片和作者信息。\n列表页标签降低视觉权重，让标题和封面更突出。\nFooter 和导航更克制，不抢主内容。\n\n这些不是一次性做出来的。\n\n而是每次审查一点，修改一点，再验证一点。\n\n这也是我现在觉得最适合 AI Coding 的方式：\n\n不要追求一次生成完美页面。\n而是让 AI 帮你持续迭代。\n\n---\n\n## 15. 给零基础用户的建议\n\n如果你是零基础用户，不要把 AI Coding 理解成“一句话生成完整网站”。\n\n这种方式很容易失控。\n\n更稳定的方式是：\n\n先做一个能运行的版本。\n再逐页拆任务。\n每次只改一个页面。\n每次只解决 3 个设计问题。\n每次修改后都构建验证。\n最后把规则沉淀到固定 CSS 规范里。\n\nImpeccable 最适合用在这种场景：\n\n你觉得页面不对劲。\n但你说不清哪里不对。\n\n这时候不要直接让 Codex “优化一下”。\n\n而是让 Impeccable 先审查。\n\n比如：\n\n```text\n请用 Impeccable 审查这个页面。\n只指出最影响质感的 3 个问题。\n不要直接改代码。\n```\n\n然后再让 Codex 按这 3 个问题修改。\n\n这样做慢一点，但更稳。\n\n也更接近真实产品开发流程。\n\n---\n\n## 总结\n\n这次做 UIcoding.ai，我最大的感受是：\n\nCodex 适合执行。\nImpeccable 适合审查。\n\nCodex 能很快把页面写出来，但它不一定知道页面为什么不高级。\n\nImpeccable 的价值，就是帮你把“感觉不对”变成更具体的问题。\n\n比如：\n\n按钮太重。\n标签太抢眼。\n卡片太模板。\n图片像占位。\n间距没有节奏。\n页面信息太满。\n移动端阅读压力太大。\n\n有了这些判断，再让 Codex 修改，效率会高很多。\n\n我现在的工作流基本是：\n\n```text\nCodex 搭页面\n↓\n固定 CSS 规范约束视觉\n↓\nImpeccable 做设计审查\n↓\n只改最重要的 3 个问题\n↓\nnpm run build\n↓\n浏览器验证\n↓\n把稳定规则沉淀到项目结构里\n```\n\n这套流程不复杂，但很适合独立开发者。\n\n尤其是你不想只做一个“能跑”的网站，而是希望页面真的有一点质感。\n\nUIcoding.ai 就是这样一点点做出来的。";

const knowlensCodexTipsMarkdown = "# 20 亿 Token 后，我用 Codex 开发 KnowLens.ai 的 8 个技巧\n\n过去两周，我基本都在用 Codex 开发 KnowLens.ai。\n\n累计差不多花了 20 亿 token。\n\n说实话，这里面至少 50% 都浪费在重构、修 bug、恢复错误改动上。\n\n不是 Codex 不行，而是我一开始太乐观了。我以为只要不停把需求丢给它，它就能一路把产品做出来。结果真正做下来才发现，如果前期没有设计好产品工作流，Codex 会很努力地写代码，也会很努力地把项目改乱。\n\nKnowLens.ai 最开始只是一个很简单的想法：\n\n用户输入一段文本，AI 自动生成一张专业的信息可视化图片。\n\n比如科普内容、新闻热点、财报摘要、历史知识、流程说明，都可以变成一张更适合传播的 infographic。\n\n但真正做起来之后，功能很快就变多了。\n\nGoogle 登录要做。\n积分要做。\nStripe 支付要做。\n生成记录要保存。\n图片要能下载。\nSEO 页面要批量做。\n博客页、案例页、错误页、loading 状态都要补。\nVercel 环境变量、数据库、图片存储、支付回调也都要处理。\n\n一开始如果没有主线，后面就会不断重构。\n\n我前期最大的问题就是：想到哪里做到哪里。\n\n今天让 Codex 改生成流程，明天让它改登录，后天让它接 Stripe，再后面又让它做 SEO 页面。页面、组件、API、数据库、支付逻辑全部混在一起改，很快项目就开始变乱。\n\n后面我才慢慢总结出一套比较稳定的使用方式。\n\n下面是我用 Codex 开发 KnowLens.ai 后，总结出来的 8 个技巧。顺序是由浅入深，从最基础的任务拆分，到后面更容易出问题的登录、支付、部署链路。\n\n---\n\n## 1. 先写产品主流程，不要一上来就让 Codex 写功能\n\n这是我踩的第一个坑。\n\n我一开始太想快速看到效果了。\n\n想到一个功能，就直接丢给 Codex 做。\n\n比如：\n\n```text\n帮我做一个 AI infographic generator。\n```\n\n然后又继续加：\n\n```text\n增加登录。\n增加支付。\n增加积分。\n增加生成历史。\n增加 SEO 页面。\n增加博客页面。\n增加案例页面。\n```\n\n看起来每天都在推进，但其实项目越来越乱。\n\n因为我没有先定义清楚 KnowLens.ai 的核心工作流。\n\n后面我重新收敛了一下，发现真正最核心的流程其实就这一条：\n\n```text\n用户输入文本\n↓\nAI 理解内容\n↓\n生成 infographic 提示词\n↓\n调用图像模型\n↓\n生成图片\n↓\n保存生成记录\n↓\n扣除积分\n↓\n用户下载图片\n```\n\n这条主流程稳定之前，不应该同时做太多分支。\n\n我后来会先把这个主流程发给 Codex：\n\n```text\n这是 KnowLens.ai 当前最核心的产品流程：\n\n用户输入文本\n↓\nAI 理解内容\n↓\n生成 infographic 提示词\n↓\n调用图像模型\n↓\n生成图片\n↓\n保存生成记录\n↓\n扣除积分\n↓\n用户下载图片\n\n后续所有功能都围绕这个流程做。\n不要新增复杂分支。\n不要提前做 PPT、视频、博客、案例库等功能。\n先保证文本生成 infographic 的主链路稳定。\n```\n\n这样 Codex 执行起来会稳定很多。\n\n我现在的感受是，Codex 不怕写代码，它怕你没有主线。\n\n你不给它主线，它就会按自己的理解扩展。最后功能可能做了很多，但产品会越来越散。\n\n---\n\n## 2. 每次只让 Codex 做一个小任务\n\n第二个坑，是我一开始特别喜欢一次性给大需求。\n\n比如我会说：\n\n```text\n帮我整体优化一下网站，看起来更高级一点，顺便把移动端、SEO、交互、组件都处理下。\n```\n\n这种需求看起来很省事，但结果基本都会失控。\n\nCodex 可能会同时改首页、组件、全局样式、layout、SEO、按钮、卡片，甚至还会顺手改一些和当前任务没关系的逻辑。\n\n我遇到过很多次这种情况：\n\n我只是想优化一个页面的视觉，结果它改了公共组件。\n我只是想调整一个按钮，结果它动了全局 CSS。\n我只是想做一个 SEO 页面，结果它顺手改了路由结构。\n\n后面排查起来非常浪费时间。\n\n现在我基本只让 Codex 一次做一个很小的任务。\n\n比如只优化首页 Hero：\n\n```text\n只优化首页 Hero 区域。\n不要改其他页面。\n不要改全局样式。\n不要动登录、支付、积分、数据库逻辑。\n\n目标：\n1. H1 更清晰\n2. 按钮更统一\n3. 留白更舒服\n4. 移动端不要拥挤\n\n完成后告诉我改了哪些文件。\n```\n\n如果我要做一个完整页面，也会拆成几轮：\n\n第一轮：只做页面结构。\n第二轮：只优化视觉。\n第三轮：只做移动端。\n第四轮：只补 SEO metadata。\n第五轮：只补 loading / error 状态。\n\n这样看起来慢一点，但实际更快。\n\n因为你不需要反复返工。\n\nCodex 最怕的不是任务复杂，而是边界不清楚。\n\n---\n\n## 3. 需求要写验收标准，不要只写感觉\n\n这是做 UI 时最容易踩的坑。\n\n我之前经常会说：\n\n```text\n这个页面不够高级，帮我优化一下。\n```\n\n结果 Codex 很容易理解成：多加一点设计元素。\n\n然后页面上就会出现：\n\n渐变背景。\n大阴影。\n发光边框。\n多层卡片。\n很多小图标。\n一堆装饰线。\n\n最后页面更复杂了，但不一定更高级。\n\n我发现，Codex 对“高级”“精致”“有质感”这种词理解不稳定。它会努力做设计，但很容易做成那种 AI 模板站。\n\n后面我就不只说感觉，而是写具体验收标准。\n\n比如：\n\n```text\n只优化首页 Hero 区域。\n\n验收标准：\n- H1 桌面端 64px，移动端 40px\n- H1 最多 2 行\n- 副标题最大宽度 640px\n- 主按钮高度 48px\n- 按钮圆角 999px\n- 不要新增渐变背景\n- 不要新增装饰图标\n- 不要使用多层卡片嵌套\n- 移动端改成上下结构\n```\n\n这种效果会好很多。\n\n因为 Codex 终于知道什么叫“完成”。\n\n我现在做视觉优化，一般都会直接写：\n\n```text\n不要加复杂背景。\n不要堆装饰元素。\n不要使用多层卡片嵌套。\n不要把页面做得很重。\n保持干净、清晰、留白充足。\n```\n\n如果有具体参数，我会直接写参数。\n\n比如字号、间距、按钮高度、圆角、最大宽度、移动端布局。\n\n对 Codex 来说，“高级”太抽象，具体参数才是约束。\n\n---\n\n## 4. 一定要写 AGENTS.md\n\n这个是我后面才开始重视的。\n\nAGENTS.md 可以理解成写给 Codex 的项目规则。\n\n它不是写给用户看的，也不是普通说明文档，而是告诉 AI coding agent：\n\n这个项目是什么。\n哪些东西不能乱动。\n哪些逻辑不能随便改。\n遇到任务应该怎么读文件。\n改完以后怎么总结。\n\n我前期没有 AGENTS.md，Codex 经常会做一些让我很崩溃的事情。\n\n比如：\n\n让它改一个页面，它全项目搜索。\n让它修一个样式，它动了公共组件。\n让它新增一个页面，它顺手重构了 layout。\n让它优化视觉，它把全局样式也改了。\n\n后面我给项目加了 AGENTS.md，情况明显好了很多。\n\n可以直接让 Codex 创建：\n\n```text\n在项目根目录创建 AGENTS.md。\n\n要求：\n- 项目是 Next.js + TypeScript\n- 产品是 KnowLens.ai，一个 AI infographic generator\n- 不要删除、移动、重命名文件\n- 不要重构无关代码\n- 不要全项目乱搜\n- 不要修改登录、支付、积分、数据库、部署逻辑，除非我明确要求\n- UI 保持简洁、高级、干净，不要做成很重的 AI 模板风格\n- 每次修改后总结改了哪些文件\n```\n\n生成出来可以类似这样：\n\n````md\n# AGENTS.md\n\n## Project\n\nKnowLens.ai is a Next.js + TypeScript product for generating AI infographics from text.\n\nThe product includes:\n- Landing pages\n- AI infographic generation workflow\n- Google login\n- Stripe payment\n- User credits\n- SEO pages\n- Blog and example pages\n\n## Working Rules\n\n- Do not delete, move, or rename files unless explicitly requested.\n- Do not refactor unrelated code.\n- Do not rewrite the whole project.\n- Do not run broad project-wide searches unless necessary.\n- Read only the files related to the current task.\n- Keep changes small and easy to review.\n- If the task is large, split it into smaller steps.\n- Always explain which files were changed.\n\n## UI Rules\n\n- Keep the UI clean, premium, and simple.\n- Avoid heavy gradients, too many background blocks, and nested cards.\n- Use clear typography, spacing, and hierarchy.\n- Prefer mobile-readable layouts.\n- Do not add random decorative elements.\n- Do not make the site look like a generic AI template.\n\n## Product Rules\n\n- Do not change login, payment, credit, database, or deployment logic unless requested.\n- Keep the generation flow simple.\n- Preserve existing routes and user flows.\n- For SEO pages, keep metadata, H1, FAQ, internal links, and CTA sections.\n- For generation tasks, keep the flow stable: input → 提示词 → image generation → save result → deduct credits → download.\n\n## Commands\n\nUse the package manager already used by the project.\n\nCommon commands:\n\n```bash\npnpm install\npnpm dev\npnpm lint\npnpm build\n````\n\nIf pnpm is not available, check package.json before using npm.\n\n## After Changes\n\nAfter every task, summarize:\n\n* Files changed\n* What changed\n* Any risk or follow-up needed\n\n````\n\nAGENTS.md 不需要写很长。\n\n我之前试过写特别复杂的规则，结果效果反而不好。\n\n太长了，Codex 也抓不住重点。\n\n核心就是几句话：\n\n```text\n不要乱删文件。\n不要乱重构。\n不要改无关代码。\n不要碰关键业务逻辑。\n只做当前任务。\n````\n\n这几个规则比长篇大论更有用。\n\n---\n\n## 5. 登录、支付、积分、数据库要单独保护\n\n这是我觉得最重要的经验之一。\n\n页面坏了，一眼能看出来。\n\n但登录、支付、积分、数据库逻辑坏了，可能线上跑一段时间才发现。\n\n我在开发 KnowLens.ai 的时候，就发现这些模块一定不能让 Codex 随便碰。\n\n比如：\n\n用户支付成功了，但积分没加。\n图片生成失败了，但积分没退。\n用户没登录，却能访问不该访问的页面。\nStripe webhook 被改坏了，但当时没发现。\n数据库字段被改了，结果旧数据读不出来。\n\n这些问题都比 UI 问题严重。\n\n所以我现在只要做页面任务，都会加一句：\n\n```text\n不要修改 Google 登录逻辑。\n不要修改 Stripe webhook。\n不要修改积分扣除逻辑。\n不要修改数据库 schema。\n只做当前页面展示。\n```\n\n比如优化 pricing 页面，我会这样写：\n\n```text\n只优化 pricing section 的前端展示。\n\n不要修改 Stripe API。\n不要修改 webhook。\n不要修改环境变量。\n不要修改数据库。\n不要修改积分逻辑。\n\n只调整页面展示、文案、布局和按钮样式。\n```\n\n这个非常重要。\n\nCodex 有时候太热心了。\n\n你只是让它优化 pricing，它可能顺手帮你“优化”支付逻辑。\n\n你只是让它改登录页面文案，它可能顺手动 auth 逻辑。\n\n这种都很危险。\n\n我的建议是：凡是涉及钱、账号、积分、数据库的地方，一定要单独开任务。\n\n不要和 UI 优化混在一起。\n\n---\n\n## 6. 不要让 Codex 一直全项目搜索\n\nCodex 卡顿，很多时候不是代码写不出来，而是它一直在搜索。\n\n项目小的时候无所谓。\n\n但项目一大，文件一多，它可能为了改一个按钮，把整个项目翻一遍。\n\n我遇到过很典型的情况：\n\n只是让它改首页 Hero，它去读支付文件。\n只是让它改登录页，它去看生成接口。\n只是让它做 SEO 页面，它去扫数据库逻辑。\n\n然后它就一直读文件、分析、搜索，最后非常慢。\n\n后面我会直接限制它的读取范围。\n\n比如改首页：\n\n```text\n只查看首页文件和首页用到的组件。\n不要读取支付、数据库、API 相关文件。\n不要扫描整个项目。\n```\n\n比如改登录页：\n\n```text\n只查看 login 页面、auth button 组件和相关路由。\n不要读取 Stripe、credit、generation 相关代码。\n```\n\n比如改 pricing：\n\n```text\n只查看 pricing 组件和页面文件。\n不要读取 Stripe webhook。\n不要读取数据库文件。\n不要修改支付 API。\n```\n\n这个技巧非常实用。\n\nCodex 不是不能搜索，而是不要无目的搜索。\n\n越大的项目，越要限制它读哪些文件。\n\n否则 token 会消耗很快，效率也会变低。\n\n---\n\n## 7. GitHub 和 Vercel 要形成固定开发节奏\n\nCodex 改代码很快，但也正因为快，所以更需要版本管理。\n\n我前期有个问题，就是连续让 Codex 改很多需求，最后才看整体效果。\n\n结果一旦出问题，很难知道是哪一步改坏的。\n\n现在我会用更固定的节奏：\n\n```text\n一个小任务\n↓\n看修改文件\n↓\n本地运行\n↓\n提交 GitHub\n↓\nVercel 自动部署\n↓\n线上检查\n↓\n再做下一个任务\n```\n\n每次也会要求 Codex 总结：\n\n```text\n完成后告诉我：\n1. 修改了哪些文件\n2. 每个文件改了什么\n3. 有没有影响登录、支付、数据库、生成流程\n4. 有没有需要我手动配置的环境变量\n```\n\n这个习惯能帮你及时发现问题。\n\n尤其是 Vercel 部署时，最容易出问题的是环境变量。\n\n比如：\n\nGoogle OAuth Client ID。\nGoogle OAuth Secret。\nStripe Secret Key。\nStripe Webhook Secret。\nDatabase URL。\n图像模型 API Key。\n图片存储 Token。\n\n这些东西本地和线上都要配置对。\n\n我的坑是，本地跑通了，不代表线上没问题。\n\n有时候 Vercel 报错，不是代码问题，而是环境变量没配，或者 callback URL 不一致。\n\n所以涉及 Vercel、Google、Stripe 的任务，我都会让 Codex 最后列出：\n\n```text\n需要检查哪些环境变量？\n本地和线上分别要配置什么？\n有没有需要手动在 Vercel 后台设置的地方？\n```\n\n不要让 Codex 猜你的线上配置。\n\n它只能帮你检查和提醒，真正的密钥和后台配置还是要自己确认。\n\n---\n\n## 8. Google、Stripe 这类外部服务要分阶段接，不要一次全做\n\n这是更深一点的坑。\n\n独立开发者很容易一上来就想把所有东西接完。\n\nGoogle 登录。\nStripe 支付。\n积分。\n数据库。\n生成记录。\n用户中心。\nSEO。\n邮件通知。\n\n但这些东西耦合起来之后，Bug 会很难排查。\n\n我前期就遇到过这种问题：\n\n登录还没完全稳定，就开始做积分。\n积分逻辑还没完全稳定，又去接 Stripe。\nStripe 还没完全验证，又去做 pricing 页面和 SEO 页面。\n\n结果一旦出问题，不知道到底是登录状态问题、支付 webhook 问题、数据库问题，还是环境变量问题。\n\n现在我会分阶段做。\n\n第一阶段，只做核心生成：\n\n```text\n输入文本 → 生成图片 → 下载\n```\n\n第二阶段，加 Google 登录：\n\n```text\n登录 → 生成 → 保存记录\n```\n\n第三阶段，加积分：\n\n```text\n登录用户 → 检查积分 → 生成成功扣积分 → 失败退积分\n```\n\n第四阶段，加 Stripe：\n\n```text\n积分不足 → 跳转 Stripe → 支付成功 → webhook 加积分\n```\n\n第五阶段，再做 SEO 和增长页面：\n\n```text\nSEO 页面 → 引导用户进入生成流程\n```\n\n每一阶段都单独验证。\n\n比如接 Google 登录时，我会这样给 Codex：\n\n```text\n这次只接 Google 登录。\n不要接 Stripe。\n不要做积分。\n不要修改生成逻辑。\n\n完成后只验证：\n1. 用户可以点击 Google 登录\n2. 登录后能看到用户状态\n3. 退出登录正常\n```\n\n接 Stripe 时，我会单独开任务：\n\n```text\n这次只接 Stripe checkout 和 webhook。\n不要修改 UI 页面之外的其他功能。\n不要修改 Google 登录。\n不要修改生成提示词。\n\n完成后说明：\n1. 支付成功后如何加积分\n2. webhook 如何验证\n3. 需要配置哪些环境变量\n4. 本地和 Vercel 分别要检查什么\n```\n\n外部服务一定要分阶段接。\n\n不要为了快，把所有东西一次性塞给 Codex。\n\n这不是效率高，这是给后面挖坑。\n\n---\n\n## 总结\n\n这两周用 Codex 做 KnowLens.ai，我最大的感受是：\n\nCodex 很强，但不要让它自由发挥。\n\n你越具体，它越好用。\n\n你越模糊，它越容易把项目改乱。\n\n我花了差不多 20 亿 token，其中至少一半都浪费在重构、修 bug、恢复错误改动上。\n\n现在回头看，最大的问题不是 Codex 能力不够，而是我前期没有把产品流程和任务边界设计清楚。\n\n如果重新来一次，我会一开始就做这几件事：\n\n```text\n先写主流程。\n每次只做一个小任务。\n需求写验收标准。\n提前创建 AGENTS.md。\n保护登录、支付、积分、数据库。\n限制 Codex 全项目搜索。\n用 GitHub 和 Vercel 固定开发节奏。\nGoogle、Stripe 这类外部服务分阶段接入。\n```\n\nAI Coding 不是让你不用思考产品和架构了。\n\n恰恰相反，它会放大产品架构的重要性。\n\n以前你自己写代码，可能慢一点，但你知道自己改了哪里。\n\n现在 Codex 写得很快，但如果你没有规则，它也会很快地把项目搞乱。\n\n所以我的结论很简单：\n\nCodex 可以帮你写代码。\n但你要负责把产品流程、代码边界和验收标准讲清楚。\n\n否则它确实能帮你生成很多代码，也会帮你制造很多返工。";

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
        "heading": "本文真正想说明什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人刚开始使用 Codex 时，会把它当成一个更聪明的代码编辑助手：让它读代码库，生成 diff，跑测试，修 bug，最后提交 PR。这当然是 Codex 的核心能力，但本文提醒我们，Codex 的价值已经不止于“写代码”。"
          },
          {
            "type": "paragraph",
            "content": "现实工作里，大量任务虽然最后会落到代码上，但过程并不只发生在代码库里。常见动作包括查网页、看文档、整理 Slack 线索、导出 PDF、检查表格、操作浏览器、等待反馈、触发自动化流程。Codex 如果能连接这些上下文，就不再只是补代码，而是能协助完成一整段电脑工作。"
          },
          {
            "type": "paragraph",
            "content": "本文的核心，是把 Codex 当成一个可持续协作的工作流系统来用，而不是一次性聊天框。持久对话流、语音输入、任务干预、工具连接、自动化、Goals、侧边栏和共享记忆，都是为了让 Codex 更稳定地在真实工作中接力。"
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
            "content": "文章首先讲的是 durable threads，也就是可以长期保存上下文的对话流。普通聊天的缺点是每次都像重新开始，需要反复解释项目背景、偏好、当前进度和之前做过的决定。持久对话流则像一个长期工作空间，适合反复推进同一类任务。"
          },
          {
            "type": "paragraph",
            "content": "可以把常用对话流固定下来，例如一个专门处理日常事务的线程，一个负责产品发布的线程，一个审查文档的线程，一个监控外部数据的线程。它们不是一次性提问窗口，而是长期存在的工作台。随着时间推移，Codex 可以在同一个线程里回到之前的上下文，继续处理未完成的工作。"
          },
          {
            "type": "paragraph",
            "content": "对独立开发者来说，这一点很实用。可以为一个产品建立长期线程，比如“Uicoding.ai 内容维护”“KnowLens.ai 发布准备”“每周检查网站问题”。每个线程只处理一类任务，长期积累上下文，避免所有事情混在一个聊天里。"
          }
        ]
      },
      {
        "heading": "语音输入：先把粗糙想法倒出来",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章接着提到语音输入。它的价值不在于让输入更酷，而是捕捉尚未整理成清晰文字的想法。很多方向在一开始并不完整，直接口述反而能保留更多上下文。"
          },
          {
            "type": "paragraph",
            "content": "比如只记得某个人在 Slack 里提过一个问题，但不记得细节。可以先把模糊记忆说给 Codex，让它搜索、收集线索、整理成可执行任务。对于能主动查找上下文的 Agent 来说，粗糙但完整的口述，往往比一句精炼但缺少背景的指令更有用。"
          },
          {
            "type": "paragraph",
            "content": "会议录音、临时想法、产品复盘、视觉反馈，都适合先用语音输入收集。不要急着把它变成完美提示词。先把想法说完整，再让 Codex 帮助整理成任务清单、修改计划或可执行步骤。"
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
            "content": "比如让 Codex 审查网页时，发现侧边栏里的页面间距不对，可以直接打断它，要求调小某个元素，或者纠正某段文案理解。这种干预能避免它沿着错误方向越跑越远。"
          },
          {
            "type": "paragraph",
            "content": "任务排队则适合安排后续动作。比如当前修复完成后，让它把预览链接发给审核人，或者等构建完成后再检查截图。可以理解为：干预是改变它正在做什么，排队是安排它接下来做什么。这两者让使用者在自动化过程中仍然保留主导权。"
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
            "content": "浏览器适合在侧边栏里审查网页，尤其是本地开发页面、UI 预览、交互流程和视觉问题。Chrome 适合需要个人账号登录态的工作，例如只能在个人浏览器会话中打开的后台或工具。电脑控制则适合那些没有 API、只能通过桌面界面完成的任务。"
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
            "content": "文章也强调了跨设备协作。一个任务可以在本地电脑上启动，使用本地文件、权限和环境运行。离开电脑后，仍然可以通过手机查看进度，回答 Codex 的问题，批准下一步行动，或者在回到工位前补充新的方向。"
          },
          {
            "type": "paragraph",
            "content": "这对长任务很有意义。比如跑测试、生成素材、整理反馈、重构模块、生成报告，这些任务不需要一直坐在电脑前盯着。Codex 可以在本地环境里继续推进，人通过移动端保持决策权。"
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
            "content": "文章把 thread automation 形容成一种心跳机制：它会按照设定时间回到同一个线程里继续工作，直到满足某个条件。比如一个日常助理线程可以每隔一段时间检查 Slack 和 Gmail，找出还没处理的重要消息，帮助整理优先级，甚至先起草回复。"
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
            "content": "侧边栏是本文里很实用的一部分。它让 Codex 生成的成果和聊天窗口并排出现，不需要把文件导出到别的软件里再检查。生成成果可以是代码，也可以是网页、PDF、幻灯片、表格、Markdown 文档或其他文件。"
          },
          {
            "type": "paragraph",
            "content": "侧边栏主要适合四类工作：检查生成文件，在文件上标注需要修改的地方，操作网页界面，审查代码或文件变更。对设计师和产品经理来说，这意味着可以像审稿一样看 Codex 的产物，而不是只看文字回复。"
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
            "content": "当侧边栏和应用内浏览器结合起来，网页既是 Codex 的输出，也可以成为控制面板。Codex 可以生成一个页面，在侧边栏打开，检查渲染效果，发现 bug，再继续修复。网页上的标注和反馈也能留在同一个闭环里。"
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
            "content": "本文最后的判断是：Codex 仍然以写代码为核心，但围绕代码发生的许多周边工作，正在进入同一个系统。MCP、网页、桌面控制、自动化、侧边栏文件审查，都让 Codex 不再只是代码补全工具。"
          },
          {
            "type": "paragraph",
            "content": "这也改变了人控制 AI 的方式。可以在任务中途干预，让它排队执行下一步，用自动化在人不在时继续推进，用 Goals 给长任务设定终点线，用侧边栏直接审查最终文件。一个完整工作流从听取指令、执行任务到审查产物，都可以在 Codex 里形成闭环。"
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
    "image": "/learn-images/uicoding-skill-coding-process-hero.png",
    "imageAlt": "Uicoding.ai 从真实作品学习 AI 编程头图",
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
    "sections": parseLearningMarkdown(knowlensCodexTipsMarkdown)
  },
  {
    "id": "ai-coding-full-workflow-prompt-chain",
    "sourceUrl": "https://github.com/vlad-ko/claude-wizard",
    "translationMode": "guidedTranslation",
    "title": "让 Claude Code / Codex 先思考再写代码：一套可复制的完整链路提示词",
    "originalTitle": "I Made Claude Code Think Before It Codes. Here's the Prompt.",
    "notice": "本文为 Uicoding.ai 基于 Claude Wizard、Addy Osmani 的 AI Agent Spec 写法和 OpenAI Codex 官方提示词建议整理的中文学习笔记，不是原文全文翻译。主要参考：https://github.com/vlad-ko/claude-wizard、https://addyosmani.com/blog/good-spec/、https://developers.openai.com/codex/prompting。",
    "sections": [
      {
        "heading": "为什么本文值得收录",
        "paragraphs": [
          "很多人使用 Claude Code 或 Codex 时，习惯直接输入一句“帮我做这个功能”。这当然能跑起来，但越到真实项目，越容易出现三个问题：AI 没弄清需求就开始写、没有验证标准、改完之后不知道有没有影响其它模块。",
          "Claude Wizard 这类资料的价值在于，它把 AI Coding 从“写代码”变成了一条工程链路：先理解需求，再探索代码，然后写测试或验证标准，接着最小实现，最后运行验证、自我审查和总结交付。",
          "Addy Osmani 关于好 Spec 的文章强调，给 AI Agent 的说明应该包含目标、上下文、约束、验收标准和失败边界。OpenAI Codex 官方提示词建议也强调，要写清楚任务范围、测试方式和期望输出。三者合在一起，就能形成一套稳定、可复制的工作流。"
        ]
      },
      {
        "heading": "适合什么时候使用",
        "paragraphs": [
          "这套提示词适合中等以上复杂度的任务，比如新增一个页面、重构一个组件、接入一个 API、修复一个线上问题、优化一段核心流程，或者让 AI 帮助完成一轮带测试的功能开发。",
          "如果只是改一句文案，没必要套完整流程。真正需要它的场景是：担心 AI 改太多文件、担心它凭空假设、担心它不跑验证、担心它动到登录、支付、数据库这类高风险逻辑。",
          "可以理解为给 Claude Code / Codex 的“开发纪律”：不是限制它能力，而是让它先想清楚、再下手。对独立开发者尤其有用，因为缺少完整工程团队帮助做代码审查，AI 自己的审查流程就更重要。"
        ]
      },
      {
        "heading": "一套完整链路提示词",
        "paragraphs": [
          "下面这段可以直接复制到 Claude Code、Codex 或 Cursor Agent 中使用。建议在一个具体任务开始前粘贴，然后把“本次任务”替换成实际任务。",
          "如果项目有 AGENTS.md、CLAUDE.md、README 或内部开发规范，一定要让 AI 先读这些文件。这样它不会只凭当前对话猜项目结构。"
        ],
        "code": {
          "label": "完整链路提示词",
          "content": `你现在不是普通代码助手，而是我的资深软件架构师和结对工程师。

本次任务：
请在这里写清楚你要完成的具体任务。

请按以下 8 个阶段完成任务，不要跳步，不要一上来就写代码。

阶段 1：理解与计划
- 先阅读项目规则文件，例如 AGENTS.md、CLAUDE.md、README 或 package.json。
- 理解当前任务目标、范围、风险和验收标准。
- 如果需求不清楚，先提出问题。
- 给出简短实施计划，等我确认后再继续。

阶段 2：探索代码
- 搜索已有实现和相似模式。
- 确认要调用的函数、组件、接口、数据结构真实存在。
- 不要凭空假设项目里有某个方法、字段或依赖。
- 列出你准备修改的文件和原因。

阶段 3：先写测试或验证标准
- 如果项目有测试，先补能覆盖新行为的测试。
- 如果暂时不适合写测试，明确列出可验证步骤。
- 测试要验证具体结果，不要只验证“成功”。
- 覆盖边界情况：空值、异常输入、重复执行、极端值。

阶段 4：最小实现
- 只实现当前任务需要的最小改动。
- 遵循项目已有代码风格和组件模式。
- 不要顺手重构无关代码。
- 不要修改登录、支付、权限、数据库等高风险逻辑，除非任务明确要求。

阶段 5：运行验证
- 运行相关测试、lint、build 或手动验证步骤。
- 如果失败，分析根因后修复。
- 不要在测试失败时宣称完成。

阶段 6：文档与状态同步
- 如果行为、命令、环境变量或使用方式发生变化，更新对应文档。
- 如果有任务清单、issue 或 TODO，同步完成状态。

阶段 7：自我审查
请像严格 reviewer 一样检查自己的改动：
- 是否有硬编码？
- 是否有遗漏的错误处理？
- 是否可能重复执行出错？
- 是否可能产生竞态问题？
- 是否影响了无关页面或模块？
- 是否有安全风险？
- 是否有测试或验证缺口？

阶段 8：总结交付
最后请输出：
1. 改了哪些文件；
2. 每个文件改了什么；
3. 如何验证；
4. 有哪些风险；
5. 是否需要我手动处理配置或线上环境。`
        }
      },
      {
        "heading": "第一阶段：先让 AI 读项目，不要马上写代码",
        "paragraphs": [
          "AI Coding 最容易失控的第一步，就是没有读项目就开始补代码。真实项目里，很多约束藏在 README、AGENTS.md、路由文件、数据结构和已有组件里。",
          "这一阶段的目标不是产出代码，而是让 AI 先建立项目地图：这个项目是什么、入口在哪里、相关文件有哪些、哪些模块不能碰。"
        ],
        "code": {
          "label": "项目理解提示词",
          "content": `请先阅读当前项目，不要修改任何文件。

请重点理解：
1. 这个项目是什么；
2. 主要页面、组件和数据文件在哪里；
3. 本次任务可能涉及哪些文件；
4. 项目是否有 AGENTS.md、CLAUDE.md、README 或其它开发规则；
5. 哪些模块属于高风险区域，例如登录、支付、权限、数据库、部署配置。

请用中文总结你的理解，并列出你下一步准备查看的文件。
在我确认之前，不要写代码。`
        }
      },
      {
        "heading": "第二阶段：把需求写成 Spec",
        "paragraphs": [
          "Addy Osmani 文章里最有价值的一点是：不要只告诉 AI“做什么”，还要告诉它“为什么做、不能做什么、怎么算完成”。这就是 Spec 的作用。",
          "一个好 Spec 不需要很长，但至少要包含目标、用户场景、范围、非目标、验收标准和验证方式。这样 AI 更像在执行一个工程任务，而不是根据一句话自由发挥。"
        ],
        "code": {
          "label": "Spec 提示词模板",
          "content": `请先把我的需求整理成一份简短 Spec，不要写代码。

需求背景：
请在这里写背景。

目标：
请在这里写要达成的结果。

请按以下结构输出：
1. 用户场景：谁在什么情况下使用这个功能；
2. 目标结果：完成后用户能看到或做到什么；
3. 修改范围：预计会涉及哪些页面、组件、接口或数据；
4. 非目标：本次明确不做什么；
5. 风险点：哪些地方可能影响已有功能；
6. 验收标准：用具体条目描述怎样才算完成；
7. 验证方式：需要运行哪些测试、命令或手动检查。

输出 Spec 后先停下来，等我确认。`
        }
      },
      {
        "heading": "第三阶段：先写测试或验证标准",
        "paragraphs": [
          "Claude Wizard 的思路里，一个关键点是让 AI 在实现前先考虑验证。不是所有项目都有测试，但至少要让 AI 写清楚怎么证明这次改动是对的。",
          "对前端页面来说，验证可以是 build、lint、截图检查、关键 DOM 文案、移动端布局检查。对业务逻辑来说，最好有单元测试、集成测试或明确的输入输出样例。"
        ],
        "code": {
          "label": "测试与验证提示词",
          "content": `在开始实现之前，请先给出测试或验证计划。

要求：
1. 如果项目已有测试框架，优先补充自动化测试。
2. 如果不适合写测试，请列出可执行的手动验证步骤。
3. 验证步骤必须具体，例如检查某个页面、某个按钮、某个状态或某个返回值。
4. 至少考虑 3 类边界情况：空数据、异常输入、重复操作。
5. 说明需要运行哪些命令，例如 npm run test、npm run lint、npm run build。

请先输出验证计划，不要开始实现。`
        }
      },
      {
        "heading": "第四阶段：限制 AI 只做最小实现",
        "paragraphs": [
          "AI 很容易过度热心。只是让它修一个按钮，它可能顺手重构样式；只是让它接一个字段，它可能顺手改数据结构。所以实现阶段一定要写边界。",
          "这里的核心是三句话：只做当前任务、复用已有模式、不要动无关模块。尤其是登录、支付、权限、数据库、环境变量这类地方，除非任务明确要求，否则要写进禁止范围。"
        ],
        "code": {
          "label": "最小实现提示词",
          "content": `现在开始实现，但请严格控制修改范围。

实现要求：
1. 只做当前 Spec 中明确要求的功能。
2. 优先复用已有组件、函数、样式和数据结构。
3. 不要重构无关代码。
4. 不要新增依赖，除非你先说明必要性并获得确认。
5. 不要修改登录、支付、权限、数据库、部署配置和环境变量，除非任务明确要求。
6. 如果发现必须扩大修改范围，请先停下来说明原因。

实现完成后，请运行前面列出的验证命令。`
        }
      },
      {
        "heading": "第五阶段：让 AI 自己做一次代码审查",
        "paragraphs": [
          "很多 AI 生成代码的问题，不是语法错误，而是边界情况、隐性副作用和维护成本。自我审查不能保证万无一失，但能显著减少低级问题。",
          "这一段适合放在每次实现之后。它会逼 AI 从“完成任务”的状态切换到“审查改动”的状态。"
        ],
        "code": {
          "label": "自我审查提示词",
          "content": `请对你刚才的改动做一次严格自我审查。

请逐项检查：
1. 是否有不必要的文件修改；
2. 是否有硬编码、重复逻辑或临时方案；
3. 是否遗漏错误处理、加载状态、空状态；
4. 是否可能影响其它页面或已有功能；
5. 是否有安全、权限、数据一致性风险；
6. 是否有未覆盖的边界情况；
7. 是否有测试或验证步骤没有运行；
8. 是否有需要我手动配置的环境变量或后台设置。

如果发现问题，请先列出问题，再修复。
如果没有发现问题，也请说明剩余风险。`
        }
      },
      {
        "heading": "第六阶段：交付总结要能帮助复盘",
        "paragraphs": [
          "最后的总结不是形式主义。它能帮助快速判断 AI 有没有改到不该改的地方，也方便后续提交 Git、写 PR 或回滚。",
          "一个好的交付总结应该包含文件、行为、验证、风险和后续动作。不要只让 AI 说“已完成”。"
        ],
        "code": {
          "label": "交付总结提示词",
          "content": `请用中文给我一份交付总结。

格式如下：
1. 修改文件：列出每个文件路径；
2. 修改内容：每个文件具体改了什么；
3. 验证结果：运行了哪些命令，结果是什么；
4. 页面检查：如果是前端改动，应该重点看哪些页面和状态；
5. 风险说明：有哪些可能影响其它功能的地方；
6. 后续建议：有没有需要我手动配置、上线检查或继续补充的事项。

请保持简洁，但不要遗漏风险。`
        }
      },
      {
        "heading": "把这套流程变成固定工作法",
        "paragraphs": [
          "这套提示词最适合沉淀到项目规则里。可以把完整链路放进 AGENTS.md、CLAUDE.md 或团队的工作流文档里，让 AI 每次进入项目时都按同一套节奏工作。",
          "真正的变化不是提示词更长，而是开始用工程流程管理 AI：需求先变成 Spec，代码先经过探索，修改先有边界，结果必须验证，最后必须自审。",
          "使用这套方式工作一段时间，会发现 AI Coding 的体验会稳定很多。AI 依然可以很快，但它不再是自由发挥，而是在一条清楚的产品和工程链路里加速交付。"
        ]
      }
    ]
  },
  {
    "id": "claude-code-official-prompt-library-copyable-workflows",
    "sourceUrl": "https://code.claude.com/docs/en/prompt-library",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 官方提示词库：从探索代码到验证结果的可复制提示词",
    "originalTitle": "Claude Code Prompt Library / Common Workflows",
    "notice": "本文为 Uicoding.ai 基于 Claude Code 官方提示词库 和 常用工作流整理的中文学习笔记，不是原文全文翻译。主要参考：https://code.claude.com/docs/en/prompt-library 和 https://docs.anthropic.com/en/docs/claude-code/common-workflows。",
    "sections": [
      {
        "heading": "本文不是提示词片段，而是完整工作提示词",
        "paragraphs": [
          "Claude Code 官方提示词库 的重点不是讲解写一句万能咒语，而是把任务说清楚：让 Agent 先理解上下文，再按目标修改，最后给出可验证结果。常用工作流也强调从理解代码库、查找相关代码、修 Bug、写测试到提交总结的一整套流程。",
          "所以本文不整理成零散句子，而是把官方推荐的模式改写成可以直接复制的完整中文提示词。每个代码块都可以单独复制到 Claude Code，也可以改一下工具名后用于 Codex、Cursor Agent 或其它 AI Coding 工具。",
          "使用时只需要替换方括号里的内容，例如页面路径、Bug 描述、验收标准、允许修改范围。其它约束建议保留，因为这些约束能减少 AI 误改、过度重构和没有验证就结束的情况。"
        ]
      },
      {
        "heading": "完整总控提示词：从探索代码到验证结果",
        "paragraphs": [
          "如果只想复制一段最完整的提示词，就用下面这一段。它适合中等复杂度任务：新增页面、修复问题、优化组件、补测试、调整工作流。",
          "这段提示词的核心是：先探索，不急着改；先定义验收标准，再实现；实现后必须验证；最后要输出风险和检查项。"
        ],
        "code": {
          "label": "完整总控提示词",
          "content": `你现在是我的 Claude Code 结对工程师。请按“探索代码 -> 制定计划 -> 最小实现 -> 验证结果 -> 总结交付”的流程完成任务。

任务目标：
[在这里写清楚本次要完成的任务，例如：修复 /learn 页面卡片描述被截断的问题。]

背景信息：
[在这里补充用户看到的问题、截图描述、相关页面路径、期望效果。]

验收标准：
1. [写清楚第一个可检查结果。]
2. [写清楚第二个可检查结果。]
3. [写清楚第三个可检查结果。]

限制范围：
- 先不要修改文件，先探索代码并说明计划。
- 优先复用已有组件、样式、数据结构和工具函数。
- 不要重构无关代码。
- 不要新增依赖，除非先说明原因并获得确认。
- 不要修改登录、支付、权限、数据库、部署配置和环境变量。
- 如果发现必须扩大修改范围，请先停下来说明原因。

请按以下步骤执行：

第一步：理解项目
- 阅读与任务相关的文件。
- 如果存在 README、AGENTS.md、CLAUDE.md 或项目规则，请先读取。
- 找到当前功能的入口、相关组件、样式和数据来源。
- 用中文总结你理解到的项目结构和任务影响范围。

第二步：制定计划
- 列出你准备修改的文件。
- 说明每个文件为什么需要改。
- 给出最小实现方案。
- 如果任务有不确定性，先问我，不要猜。

第三步：实现
- 只做当前任务需要的最小修改。
- 保持现有代码风格。
- 不要顺手清理、移动、重命名或重构无关内容。

第四步：验证
- 根据项目情况运行必要命令，例如 npm run build、npm run test、npm run lint。
- 如果是前端页面问题，请说明需要打开哪个页面检查什么。
- 如果验证失败，请先分析原因再修复，不要跳过失败。

第五步：交付总结
请最后用中文输出：
1. 修改了哪些文件；
2. 每个文件改了什么；
3. 运行了哪些验证命令，结果如何；
4. 我应该在浏览器里重点检查哪里；
5. 是否存在风险、未验证项或需要我手动处理的地方。`
        }
      },
      {
        "heading": "探索代码库提示词：先弄清楚项目再动手",
        "paragraphs": [
          "这是最适合新项目、新页面、新需求开始前使用的提示词。它不会要求 AI 立刻改代码，而是先让它建立代码地图。",
          "如果经常遇到 AI 改错文件、找不到真实入口、凭空假设组件存在，先运行这一段会稳很多。"
        ],
        "code": {
          "label": "探索代码库提示词",
          "content": `请先探索当前代码库，不要修改任何文件。

我想完成的任务是：
[写清楚你想做什么。]

请帮我找到和这个任务最相关的代码位置，并用中文解释：
1. 这个功能或页面的入口文件在哪里；
2. 它依赖哪些组件、样式文件、数据文件或接口；
3. 相关文件之间是什么关系；
4. 现有代码里有没有类似实现可以复用；
5. 如果要完成这个任务，最小修改范围是什么；
6. 哪些文件或模块不应该被修改；
7. 你建议的实施步骤是什么。

要求：
- 只阅读和任务相关的文件。
- 不要全项目无目的扫描。
- 不要修改文件。
- 不要给出最终代码。
- 如果你找不到入口，请说明你已经查了哪些位置，以及下一步建议怎么找。

最后请给我一个简短计划，等我确认后再执行。`
        }
      },
      {
        "heading": "修 Bug 提示词：带复现、范围和验证",
        "paragraphs": [
          "修 Bug 最怕的问题是 AI 只根据报错文字猜原因。更稳的方式是把现象、复现步骤、期望结果、限制范围和验证方式都写进去。",
          "下面这段适合 UI Bug、交互 Bug、接口 Bug 和构建报错。可以把截图描述、终端报错或浏览器控制台报错粘到对应位置。"
        ],
        "code": {
          "label": "修 Bug 完整提示词",
          "content": `请帮我修复一个 Bug。先分析，不要马上改代码。

Bug 现象：
[描述用户看到的问题，例如：学习卡片描述文字被截断一半。]

复现步骤：
1. 打开 [页面路径或操作入口]。
2. 执行 [具体操作]。
3. 观察到 [错误现象]。

期望结果：
[描述正确表现，例如：文字最多显示三行，不应该露出半行，也不应该遮挡按钮。]

已知信息：
- 相关页面：[页面路径]
- 相关截图：[如果有截图，用文字描述关键问题]
- 报错信息：[如果有终端或控制台报错，粘贴在这里]

限制范围：
- 优先修改和 Bug 直接相关的文件。
- 不要重构无关组件。
- 不要修改数据结构，除非这是根因。
- 不要修改登录、支付、权限、数据库或环境变量。

请按这个流程做：
1. 找出最可能的相关文件。
2. 解释 Bug 根因。
3. 给出最小修复方案。
4. 实施修复。
5. 运行必要验证命令。
6. 告诉我应该如何在浏览器中复查。

最后请总结：
- 根因是什么；
- 改了哪些文件；
- 如何验证已经修好；
- 有没有可能影响其它页面。`
        }
      },
      {
        "heading": "安全重构提示词：保持行为不变",
        "paragraphs": [
          "重构时要特别强调“行为不变”。如果不写清楚，AI 可能把重构理解成重新设计功能，最后改出新 Bug。",
          "这段提示词适合整理重复代码、拆组件、移动样式、命名清理、抽工具函数。"
        ],
        "code": {
          "label": "安全重构提示词",
          "content": `请帮我做一次小范围安全重构。

重构目标：
[写清楚要整理什么，例如：把重复的学习卡片样式收敛到一个组件样式中。]

必须保持不变的行为：
1. 页面路由不变。
2. 用户看到的主要内容不变。
3. 交互行为不变。
4. 数据结构不变。
5. 对外 API 不变。

允许修改：
- [列出允许修改的文件或目录。]

禁止修改：
- 登录、支付、权限、数据库、环境变量、部署配置。
- 与本次重构无关的页面和组件。
- 用户可见文案，除非我明确要求。

请先输出重构计划：
1. 当前重复或混乱点在哪里；
2. 你准备怎么拆分或合并；
3. 哪些文件会被修改；
4. 如何证明行为没有变化。

我确认后再执行。执行后请运行构建或测试，并给出修改前后行为保持一致的验证说明。`
        }
      },
      {
        "heading": "补测试提示词：让 AI 先定义测试目标",
        "paragraphs": [
          "官方工作流里经常会把测试作为任务的一部分。重点不是让 AI 随便补几个测试，而是先说明测试要保护什么行为。",
          "这段适合已有测试框架的项目。如果项目暂时没有测试，也可以让 AI 输出手动验证清单。"
        ],
        "code": {
          "label": "补测试提示词",
          "content": `请为当前功能补充测试。先不要写实现代码，先制定测试计划。

要保护的功能：
[写清楚功能名称或页面路径。]

用户期望行为：
1. [正常情况应该怎样。]
2. [空数据或异常情况应该怎样。]
3. [重复操作或边界情况应该怎样。]

请先检查项目已有测试方式：
- 使用了什么测试框架；
- 测试文件一般放在哪里；
- 命名规则是什么；
- 有没有可以参考的类似测试。

然后请输出测试计划：
1. 需要新增或修改哪些测试文件；
2. 每个测试覆盖什么行为；
3. 哪些边界情况需要覆盖；
4. 需要运行什么命令验证。

获得确认后再写测试。
写完测试后请运行测试命令。如果测试失败，请解释失败原因并修复。`
        }
      },
      {
        "heading": "验证交付提示词：不要让任务停在“我改完了”",
        "paragraphs": [
          "很多 AI Coding 的问题发生在最后一步：代码改了，但没有说明怎么验，也没有说明风险在哪里。",
          "这段适合每次改完后复制使用。它会强制 AI 把验证、浏览器检查、风险和后续动作讲清楚。"
        ],
        "code": {
          "label": "验证交付提示词",
          "content": `请对刚才的修改做一次完整交付检查。

请按以下结构输出，不要省略：

1. 修改文件
- 列出所有被修改、新增或删除的文件。

2. 修改说明
- 每个文件分别改了什么。
- 为什么需要这样改。

3. 验证命令
- 你已经运行了哪些命令。
- 每个命令的结果是什么。
- 如果有命令没有运行，请说明原因。

4. 浏览器检查
- 如果是前端页面，请告诉我应该打开哪个 URL。
- 应该检查哪些元素、状态、交互和移动端情况。

5. 风险检查
- 是否可能影响其它页面；
- 是否可能影响数据、权限、登录、支付或部署；
- 是否有未覆盖的边界情况；
- 是否有需要我手动配置的内容。

6. 最终结论
- 用一句话说明这次任务是否已经完成。
- 如果还有后续事项，请列出来。`
        }
      },
      {
        "heading": "如何把这些提示词用在真实项目里",
        "paragraphs": [
          "最稳的用法不是每次都把所有提示词全部复制一遍，而是按任务阶段选择。刚进入项目时用“探索代码库提示词”，遇到问题时用“修 Bug 提示词”，想整理代码时用“安全重构提示词”，改完以后用“验证交付提示词”。",
          "如果希望团队长期复用，可以把这些提示词放进 CLAUDE.md、AGENTS.md 或项目内部文档。更进一步，还可以把它们拆成 Claude Code slash commands，比如 /explore-task、/fix-bug、/verify-change。",
          "真正重要的是让 AI 形成固定节奏：先理解，再计划，再改动，再验证，再交付。只要这个节奏稳定，Claude Code 和 Codex 都会比“想到什么说什么”的使用方式可靠很多。"
        ]
      }
    ]
  },
  {
    "id": "codex-official-workflows-copyable-prompts",
    "sourceUrl": "https://developers.openai.com/codex/workflows",
    "translationMode": "guidedTranslation",
    "title": "Codex 官方工作流：7 个可直接复制的实战提示词",
    "originalTitle": "Workflows",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex 官方工作流整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/workflows。",
    "sections": [
      {
        "heading": "为什么本文适合做 Codex 实战学习页",
        "paragraphs": [
          "OpenAI Codex 官方工作流不是只讲“提示词怎么写”，而是把 Codex 放到真实开发任务里：理解代码、修 Bug、写测试、根据截图做原型、迭代 UI、做本地 code review，以及在 GitHub PR 上做 review。",
          "这几个场景基本覆盖了独立开发者每天会遇到的工作：先弄懂项目，再动手改；改完要验证；提交前要审查；别人提 PR 时，也可以让 Codex 先帮助看一轮。",
          "下面每个代码块都是完整提示词。可以直接复制到 Codex 里使用，只需要替换方括号中的页面路径、Bug 描述、截图信息或 PR 信息。"
        ]
      },
      {
        "heading": "1. 解释代码流：先让 Codex 讲清楚系统怎么跑",
        "paragraphs": [
          "这个提示词适合接手新项目、理解一个页面、读接口链路或梳理某个功能的执行路径。重点是让 Codex 先解释，而不是马上修改。",
          "如果是零基础用户，这也是最安全的第一步：先知道文件在哪里、数据怎么走、用户操作会触发哪些代码。"
        ],
        "code": {
          "label": "解释代码流提示词",
          "content": `请帮我解释当前项目中的一条代码流，不要修改任何文件。

我想理解的功能或页面是：
[例如：用户打开 /learn 页面后，学习卡片是如何从数据渲染到页面上的。]

请按以下方式分析：
1. 找到这个功能的入口文件。
2. 找到相关组件、数据文件、样式文件和工具函数。
3. 按用户操作顺序解释代码是如何执行的。
4. 说明数据从哪里来，经过哪些组件，最后如何显示到页面。
5. 标出最重要的 3 到 5 个文件，并解释每个文件的职责。
6. 如果有容易误解的地方，请单独提醒我。

输出要求：
- 用中文解释，适合非资深工程师理解。
- 不要只列文件名，要解释它们之间的关系。
- 不要修改文件。
- 最后给我一份“如果我要修改这个功能，应该先看哪些文件”的清单。`
        }
      },
      {
        "heading": "2. 修 Bug：给现象、复现步骤和验收标准",
        "paragraphs": [
          "修 Bug 时，最重要的是不要只给一句“这里坏了”。需要告诉 Codex：现象是什么、如何复现、期望结果是什么、哪些模块不能碰。",
          "下面这段适合 UI Bug、构建错误、状态错误和数据展示错误。"
        ],
        "code": {
          "label": "修 Bug 提示词",
          "content": `请帮我修复一个 Bug。先分析根因，再做最小修改。

Bug 现象：
[描述用户看到的问题，例如：页面标题显示错误，或者卡片描述文字被截断。]

复现步骤：
1. 打开 [页面 URL 或路由]。
2. 执行 [具体操作]。
3. 观察到 [错误表现]。

期望结果：
[描述修复后的正确表现。]

限制范围：
- 优先只修改和这个 Bug 直接相关的文件。
- 不要重构无关代码。
- 不要新增依赖。
- 不要修改登录、支付、权限、数据库、部署配置或环境变量。
- 如果你发现必须扩大修改范围，请先说明原因。

请按以下流程执行：
1. 找到相关文件。
2. 解释 Bug 的可能根因。
3. 给出最小修复方案。
4. 实施修复。
5. 运行必要验证命令，例如 npm run build、npm run test 或 npm run lint。
6. 如果是前端问题，告诉我应该打开哪个页面、检查哪些状态。

最后请总结：
- 根因是什么；
- 改了哪些文件；
- 如何验证已经修好；
- 是否可能影响其它页面或功能。`
        }
      },
      {
        "heading": "3. 写测试：让 Codex 先理解要保护的行为",
        "paragraphs": [
          "写测试不是让 Codex 随便补几个断言，而是先说清楚“这个测试保护什么行为”。如果项目没有测试框架，也可以要求它先输出手动验证方案。",
          "这段提示词适合给核心函数、组件状态、表单逻辑、接口处理和回归 Bug 补测试。"
        ],
        "code": {
          "label": "写测试提示词",
          "content": `请为当前功能补充测试。先制定测试计划，不要马上写代码。

要测试的功能：
[描述功能，例如：学习资料详情页可以正确渲染代码块，并且复制按钮能复制完整提示词。]

需要保护的行为：
1. 正常数据下应该如何表现；
2. 空数据或缺失字段时应该如何表现；
3. 用户交互后应该如何表现；
4. 回归场景：之前出过什么问题，不能再出现。

请先检查项目现有测试方式：
- 使用什么测试框架；
- 测试文件放在哪里；
- 有没有类似测试可以参考；
- 应该运行什么命令。

然后请输出测试计划：
1. 需要新增或修改哪些测试文件；
2. 每个测试覆盖什么行为；
3. 哪些边界情况需要覆盖；
4. 哪些测试不值得现在写，原因是什么。

我确认后再写测试。
写完后请运行测试命令。
如果测试失败，请解释失败原因并修复。`
        }
      },
      {
        "heading": "4. 根据截图做原型：把图片变成可运行页面",
        "paragraphs": [
          "Codex 工作流里一个很实用的场景，是基于截图快速做原型。这里的关键不是“照着做一个差不多的页面”，而是写清楚还原范围、交互、响应式和不允许新增的复杂度。",
          "如果给 Codex 截图，最好同时描述：这是哪个页面、哪些元素必须还原、哪些只是参考、移动端怎么处理。"
        ],
        "code": {
          "label": "根据截图做原型提示词",
          "content": `请根据我提供的截图，为当前项目实现一个可运行的前端原型。

截图说明：
[描述截图里的页面类型、核心元素、布局结构、颜色和交互。]

目标页面：
[例如：/submit、/pricing、/learn/new-page]

还原重点：
1. 页面结构和信息层级；
2. 主要标题、按钮、表单、卡片或导航；
3. 间距、字体层级、颜色气质；
4. 桌面端和移动端的布局；
5. 必要的 hover、focus、loading、empty 状态。

限制范围：
- 优先使用项目已有组件、样式变量和布局规则。
- 不要引入新的 UI 组件库。
- 不要接后端接口。
- 不要实现真实登录、支付、数据库逻辑。
- 如果截图里有复杂图表或图片，可以先用静态占位或简单结构还原。

请按步骤执行：
1. 先阅读项目现有页面和样式规范。
2. 给出你准备新增或修改的文件。
3. 说明哪些部分会高保真还原，哪些部分会合理简化。
4. 实现页面。
5. 运行 npm run build。
6. 告诉我应该打开哪个 URL 检查效果。

最后请总结：还原了哪些截图元素，哪些地方需要后续人工微调。`
        }
      },
      {
        "heading": "5. UI 迭代：不要让 Codex 一次性大改视觉",
        "paragraphs": [
          "UI 迭代最容易失控：一句“优化一下”可能导致全局样式被重写。更稳的做法是让 Codex 只围绕一个页面、三个问题、明确验收标准做最小调整。",
          "这段提示词适合已经有页面，但觉得层级、留白、卡片、按钮或移动端不够好时使用。"
        ],
        "code": {
          "label": "UI 迭代提示词",
          "content": `请帮我对当前页面做一轮小范围 UI 迭代。

目标页面：
[写页面路径，例如 /learn 或 /tools。]

当前问题：
1. [问题一，例如标题层级不够清晰。]
2. [问题二，例如卡片内容太挤。]
3. [问题三，例如移动端按钮和文字距离太近。]

设计目标：
- 更清晰；
- 更有编辑感；
- 更易读；
- 不要增加复杂装饰；
- 不要做成普通 AI 模板站。

限制范围：
- 只修改这个页面相关组件和样式。
- 不要重构路由。
- 不要修改数据结构。
- 不要新增依赖。
- 不要改无关页面。
- 不要引入大面积渐变、发光、重阴影或多层卡片嵌套。

请先输出：
1. 你观察到的主要 UI 问题；
2. 最小修改方案；
3. 预计修改哪些文件。

我确认后再执行。
执行后请运行 npm run build，并告诉我桌面端和移动端分别应该检查什么。`
        }
      },
      {
        "heading": "6. 本地代码审查：提交前让 Codex 先审一轮",
        "paragraphs": [
          "Codex 支持本地审查工作流。可以在提交前让它检查当前 diff，重点看 bug、回归风险、测试缺口和无关改动。",
          "这段提示词适合在已经改完代码、准备提交之前使用。"
        ],
        "code": {
          "label": "本地代码审查提示词",
          "content": `请对我当前本地改动做一次 code review。

审查范围：
- 当前工作区 diff；
- 已修改、新增或删除的文件；
- 与本次任务相关的测试和构建结果。

请重点检查：
1. 是否存在明显 Bug 或回归风险；
2. 是否有无关文件被修改；
3. 是否有过度重构；
4. 是否遗漏错误处理、空状态、加载状态或边界情况；
5. 是否影响登录、支付、权限、数据库、部署配置；
6. 是否缺少必要测试或验证；
7. 是否有命名、可读性或维护性问题。

输出要求：
- 先列问题，按严重程度排序。
- 每个问题都说明文件位置、原因和建议修复方式。
- 如果没有发现问题，请明确说“未发现阻塞问题”。
- 最后给出提交前还应该运行哪些命令或检查哪些页面。

请先只 review，不要直接修改代码。`
        }
      },
      {
        "heading": "7. PR 审查：让 Codex 帮助读 Pull Request",
        "paragraphs": [
          "当团队协作时，Codex 可以用于 PR 审查：总结改动、找风险、检查测试、提出问题。重点是不要只让它“看看”，而是明确审查维度。",
          "如果使用 GitHub，可以把 PR 链接、diff 摘要、测试结果或 CI 报错一起给 Codex。"
        ],
        "code": {
          "label": "PR 审查提示词",
          "content": `请帮我 review 这个 Pull Request。

PR 链接或编号：
[粘贴 PR 链接或编号。]

PR 目标：
[描述这个 PR 想解决什么问题。]

请按以下维度审查：
1. 这个 PR 实际改了什么；
2. 改动是否符合 PR 目标；
3. 是否存在明显 Bug、回归风险或安全风险；
4. 是否影响登录、支付、权限、数据库、部署配置；
5. 是否有无关重构或不必要文件改动；
6. 测试是否充分；
7. 文档、环境变量或迁移说明是否缺失；
8. 是否有需要向作者确认的问题。

输出格式：
- 先给一句总体结论：建议通过、需要修改，或需要更多信息。
- 然后列出发现的问题，按严重程度排序。
- 每条问题包含：位置、原因、建议。
- 最后列出开放问题和建议补充的测试。

请保持 review 口吻专业、具体、可执行，不要只给泛泛建议。`
        }
      },
      {
        "heading": "怎么选择这 7 个提示词",
        "paragraphs": [
          "刚进入项目，用“解释代码流”。如果线上或页面出问题，用“修 Bug”。如果要避免回归，用“写测试”。如果从截图开始做页面，用“根据截图做原型”。如果页面已经有了但不够好，用“UI 迭代”。如果准备提交，用“本地代码审查”。如果团队有人开 PR，用“PR 审查”。",
          "这 7 个提示词的共同点是：都要求 Codex 先理解上下文，再明确范围，然后执行，最后验证。它们不是为了让提示词显得复杂，而是为了让 AI Coding 更接近真实工程流程。",
          "也可以把它们沉淀成自己的常用命令，比如 /explain-flow、/fix-bug、/write-tests、/prototype-from-screenshot、/ui-iterate、/local-review、/pr-review。每次复用同一套结构，项目会稳定很多。"
        ]
      }
    ]
  },
  {
    "id": "codex-real-webpage-prompt-case-library",
    "sourceUrl": "https://developers.openai.com/codex/use-cases",
    "translationMode": "guidedTranslation",
    "title": "Codex 真实网页案例提示词库：从网页拆解到验证套件",
    "originalTitle": "Codex 提示词 examples and real web workflow cases",
    "notice": "本文为 Uicoding.ai 基于公开资料整理的中文学习笔记，不是原文全文翻译。参考来源包括 OpenAI Codex Use Cases：https://developers.openai.com/codex/use-cases，OpenAI Codex Figma to code 用例：https://developers.openai.com/codex/use-cases/figma-designs-to-code，以及 Jose Casanova Codex Prompts：https://www.josecasanova.com/prompts/for/codex。",
    "sections": [
      {
        "heading": "本文解决什么问题",
        "paragraphs": [
          "很多 AI Coding 教程只讲“写清楚需求”，但真实做产品时，常见输入往往是一个真实网页、一个截图、一个竞品页面、一个 Figma 设计、一个已经上线但有问题的页面。需要 Codex 不只是写代码，而是先拆解网页，再做实现计划，最后用验证套件检查结果。",
          "本文把几个真实网页来源组合起来：OpenAI Codex 官方 Use Cases 提供真实用例方向，Figma to code 用例说明如何把设计转成代码，Jose Casanova 的 Codex 提示词则偏向验证、执行计划和提交前检查。",
          "下面所有提示词都是完整可复制版本。可以把真实网页 URL、截图描述、目标页面路径和验收标准填进去，然后直接交给 Codex 执行。"
        ]
      },
      {
        "heading": "可以用来练习的真实网页来源",
        "paragraphs": [
          "网页案例一：OpenAI Codex Use Cases，地址：https://developers.openai.com/codex/use-cases。这个页面适合学习 Codex 在 PR 审查、Figma to code、数据分析、反馈整理等真实任务中的应用方向。",
          "网页案例二：OpenAI Codex Figma designs to code，地址：https://developers.openai.com/codex/use-cases/figma-designs-to-code。这个案例适合练习“从设计稿或截图到可运行页面”的工作流。",
          "网页案例三：Jose Casanova Codex Prompts，地址：https://www.josecasanova.com/prompts/for/codex。这个页面适合学习把验证套件、执行计划、Git commit 分析、跨智能体审查这类任务做成可复用提示词。"
        ]
      },
      {
        "heading": "提示词 1：真实网页拆解，先把网页变成实现清单",
        "paragraphs": [
          "看到一个好网页，不要马上让 Codex“仿一个”。更稳的方式是先让它拆解页面：信息架构、布局、组件、视觉层级、交互状态、移动端策略。",
          "这段提示词适合输入一个真实网页 URL，或者已经打开网页后，把页面结构描述给 Codex。"
        ],
        "code": {
          "label": "真实网页拆解提示词",
          "content": `请基于下面这个真实网页，帮我做一次产品和前端实现拆解。先不要写代码。

真实网页 URL：
[粘贴网页地址，例如 https://developers.openai.com/codex/use-cases/figma-designs-to-code]

我的目标：
[说明你想学习它的什么，例如：学习它如何组织 use case 页面，或者把类似结构做进我的网站。]

请按以下结构拆解：

1. 页面定位
- 这个页面面向什么用户；
- 用户进入页面后最想解决什么问题；
- 页面第一屏传递了什么核心信息。

2. 信息架构
- 页面从上到下有哪些主要区块；
- 每个区块承担什么任务；
- 区块之间的阅读顺序是否清晰。

3. 组件结构
- 哪些是可复用组件；
- 哪些是页面专属模块；
- 是否有卡片、代码块、步骤列表、CTA、FAQ、示例图等。

4. 视觉和排版
- 标题层级如何组织；
- 文本宽度和段落节奏如何控制；
- 图片、代码块或示例如何承载重点；
- 哪些视觉细节值得借鉴，哪些不适合照搬。

5. 交互和状态
- 页面里有哪些按钮、链接、展开区、复制按钮或跳转；
- 如果要做成真实产品页面，需要补哪些 hover、focus、loading、empty 状态。

6. 移动端适配
- 哪些区块在移动端需要改成单列；
- 图片、代码块、长标题应该如何处理；
- 哪些内容需要压缩或换行。

7. 可实现清单
- 如果我要在当前项目中做一个类似页面，应该新增或修改哪些文件；
- 哪些组件可以复用；
- 哪些地方需要新写样式；
- 哪些地方需要我手动提供图片或文案。

最后请输出一份“最小可实现版本”的开发计划，不要开始写代码。`
        }
      },
      {
        "heading": "提示词 2：从真实网页或截图复刻一个原型页面",
        "paragraphs": [
          "网页复刻最怕两个极端：要么只抄表面，要么过度设计。这个提示词会要求 Codex 先还原结构和层级，再实现可运行原型，并明确哪些地方可以简化。",
          "适合练习 OpenAI 的 Figma to code 思路，也适合把竞品网页、截图、设计稿转成项目里的一个新页面。"
        ],
        "code": {
          "label": "真实网页/截图复刻提示词",
          "content": `请根据我提供的真实网页或截图，帮我在当前项目中实现一个可运行的原型页面。

参考网页或截图：
[粘贴 URL，或用文字描述截图内容。]

目标路由：
[例如 /learn/codex-prompt-case-study 或 /cases/new-example]

复刻目标：
- 复刻页面的信息架构；
- 复刻主要视觉层级；
- 复刻关键组件关系；
- 不要求逐像素完全一致，但要保留页面的产品表达方式。

必须还原：
1. 首屏标题、说明、主要行动按钮；
2. 主要内容区块顺序；
3. 卡片、代码块、步骤说明或案例区；
4. 桌面端和移动端布局；
5. 基础交互状态，例如 hover、focus、active。

允许简化：
- 复杂插图可以先用已有图片或简单占位；
- 复杂动画可以先不做；
- 后端数据和真实接口可以先用静态数据；
- 图表可以先用静态结构。

限制范围：
- 优先复用当前项目已有组件、样式变量和布局规则；
- 不要引入新的 UI 组件库；
- 不要修改登录、支付、权限、数据库、部署配置或环境变量；
- 不要重构无关页面；
- 如果必须新增文件，请先说明文件用途。

请按步骤执行：
1. 先给出页面结构分析；
2. 再给出实现计划；
3. 等我确认后再写代码；
4. 实现后运行 npm run build；
5. 最后告诉我应该打开哪个 URL 检查，以及重点检查哪些区域。`
        }
      },
      {
        "heading": "提示词 3：执行计划提示词，把拆解结果变成可落地任务",
        "paragraphs": [
          "网页拆解之后，不要一次性让 Codex 全部实现。更稳的是把它拆成可执行任务：先页面结构，再内容数据，再样式，再移动端，再验证。",
          "这个提示词适合把上一段拆解结果变成任务清单，也适合在真实项目里控制 Codex 的修改范围。"
        ],
        "code": {
          "label": "执行计划提示词",
          "content": `请把前面的网页拆解结果整理成一个可执行开发计划。先不要写代码。

项目目标：
[说明你要在当前项目里做什么页面或功能。]

参考来源：
[粘贴真实网页 URL 或截图说明。]

请输出一个分阶段计划：

阶段 1：页面结构
- 需要新增或修改哪些页面文件；
- 页面主要区块是什么；
- 每个区块需要哪些内容。

阶段 2：数据和内容
- 是否需要新增静态数据；
- 每条数据需要哪些字段；
- 是否需要来源地址、图片、标签、作者或发布时间。

阶段 3：组件复用
- 当前项目里哪些组件可以复用；
- 哪些组件需要新增；
- 哪些组件不要动。

阶段 4：样式实现
- 需要新增哪些页面级样式；
- 哪些样式应该复用设计变量；
- 桌面端和移动端分别如何布局。

阶段 5：验证
- 需要运行哪些命令；
- 需要打开哪些页面；
- 需要检查哪些边界情况。

要求：
- 每个阶段都要足够小，可以单独完成；
- 不要安排无关重构；
- 不要修改登录、支付、权限、数据库、部署配置或环境变量；
- 给出建议的第一步任务。

最后请问我是否确认执行第一阶段。`
        }
      },
      {
        "heading": "提示词 4：验证套件提示词，检查页面不是只做到表面相似",
        "paragraphs": [
          "页面做完以后，最容易出现的问题是：桌面端看起来还行，移动端溢出；标题能显示，但按钮被遮挡；代码块能出现，但复制不完整。",
          "这段提示词参考验证套件的思路，把视觉、内容、交互、响应式、性能和无关改动都纳入检查。"
        ],
        "code": {
          "label": "验证套件提示词",
          "content": `请为刚才实现的页面执行一轮验证套件检查。

目标页面：
[填写页面 URL 或路由。]

参考网页或目标效果：
[填写参考网页 URL、截图说明或验收标准。]

请按以下维度检查：

1. 内容完整性
- 标题、副标题、正文、来源链接是否完整；
- 代码块或提示词是否完整显示；
- 是否存在文字被截断、重叠或半行显示。

2. 结构一致性
- 页面区块顺序是否符合计划；
- 关键组件是否都出现；
- 是否遗漏 CTA、来源、案例、步骤或验证信息。

3. 视觉质量
- 标题层级是否清晰；
- 段落宽度是否适合阅读；
- 卡片、代码块、按钮、图片是否和现有设计风格一致；
- 是否存在过重阴影、过度渐变、多层卡片嵌套或模板感。

4. 交互状态
- 链接是否可点击；
- 复制按钮是否能复制完整内容；
- hover、focus、active 状态是否可用；
- 空状态或图片加载失败时是否可接受。

5. 响应式
- 桌面端是否正常；
- 移动端是否单列可读；
- 长标题、长 URL、长提示词是否会撑破布局；
- 图片和代码块是否会横向溢出。

6. 工程验证
- 运行 npm run build；
- 如果有测试，运行相关测试；
- 检查是否修改了无关文件；
- 检查是否影响共享组件或其它页面。

输出格式：
1. 通过项；
2. 发现的问题，按严重程度排序；
3. 建议修复方案；
4. 是否需要继续修改；
5. 最终是否可以交付。`
        }
      },
      {
        "heading": "提示词 5：Git Commit 分析提示词，提交前确认改动范围",
        "paragraphs": [
          "当一个页面做完以后，不要立刻提交。先让 Codex 看一遍 diff，确认改动范围、风险和验证结果，再决定是否提交。",
          "这个提示词适合准备 commit 前使用，尤其是在 Codex 连续做了几轮页面和内容改动之后。"
        ],
        "code": {
          "label": "Git Commit 分析提示词",
          "content": `请在提交前分析当前本地改动，但先不要 stage，也不要 commit。

请检查：
1. 当前 git status；
2. 当前 diff；
3. 修改文件是否都和本次任务相关；
4. 是否有临时文件、调试代码、无关格式化或误删内容；
5. 是否有高风险模块被修改，例如登录、支付、权限、数据库、部署配置或环境变量；
6. 是否已经运行必要验证命令；
7. 是否还有需要我手动检查的页面。

请输出：

## 改动摘要
- 用 3 到 5 条说明本次改动做了什么。

## 文件分组
- 内容数据；
- 页面组件；
- 样式；
- 静态资源；
- 其它。

## 验证状态
- 已运行的命令和结果；
- 未运行的验证和原因；
- 浏览器中需要检查的 URL。

## 风险点
- 可能影响哪些页面；
- 是否有未验证的边界情况；
- 是否需要我确认来源、版权、图片或文案。

## 建议 commit message
- 给出一个简短英文 commit message；
- 再给一个中文说明版本。

最后请问我是否要继续 stage 和 commit，不要自动执行。`
        }
      },
      {
        "heading": "这套案例提示词怎么用",
        "paragraphs": [
          "如果需要学习一个真实网页，先用“真实网页拆解提示词”。如果需要把网页或截图做成页面，用“真实网页/截图复刻提示词”。如果页面较复杂，用“执行计划提示词”拆阶段。做完以后，用“验证套件提示词”检查。准备提交前，用“Git Commit 分析提示词”。",
          "这套流程的重点是：真实网页不是让使用者照抄，而是帮助拆解产品表达、页面结构和工程实现。Codex 最适合做的不是凭空生成，而是在给出真实参考和明确验收标准后，把页面落地出来。",
          "也可以把这些提示词做成自己的项目 Skill，例如 /analyze-webpage、/prototype-page、/plan-implementation、/verify-page、/commit-analysis。这样以后每次看到一个好网页，都能稳定地从参考变成可实现任务。"
        ]
      }
    ]
  },
  {
    "id": "codex-best-practices-plan-agents-review",
    "sourceUrl": "https://developers.openai.com/codex/learn/best-practices",
    "translationMode": "guidedTranslation",
    "title": "Codex 官方最佳实践：Plan first、AGENTS.md 和可验证交付",
    "originalTitle": "Best practices",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex 官方 Best practices 整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/learn/best-practices。",
    "sections": [
      {
        "heading": "本文最佳实践真正讲的是什么",
        "paragraphs": [
          "Codex 很强，但它不是读心工具。官方最佳实践的核心不是“写更长的提示词”，而是把任务讲成一个可执行工程任务：目标是什么、上下文在哪里、不能改什么、做到什么算完成。",
          "对复杂任务，官方建议先让 Codex 制定计划，甚至反问澄清问题，而不是一上来就改代码。对长期项目，则应该把常用规则沉淀到 AGENTS.md，让 Codex 每次进入项目都知道项目习惯。",
          "本文把官方思路整理成 5 个可以直接复制的模板：任务总模板、Plan first 模板、AGENTS.md 模板、验证清单模板和交付 review 模板。"
        ]
      },
      {
        "heading": "提示词 1：Codex 任务总模板",
        "paragraphs": [
          "这是最通用的一段。适合新增功能、修 Bug、优化页面、补内容、重构小模块。只需要替换方括号里的信息。",
          "它对应官方最佳实践里的四个要素：Goal、Context、Constraints、Done when。"
        ],
        "code": {
          "label": "Codex 任务总模板",
          "content": `请帮我完成下面这个任务，但先阅读相关代码并给出简短计划。

Goal / 目标：
[写清楚你希望 Codex 完成什么，例如：修复学习卡片文字被截断的问题。]

Context / 上下文：
[写清楚相关页面、用户看到的问题、截图描述、相关文件或已有实现。]

Constraints / 约束：
- 只修改和当前任务直接相关的文件。
- 优先复用已有组件、样式、数据结构和工具函数。
- 不要重构无关代码。
- 不要新增依赖，除非你先说明必要性。
- 不要修改登录、支付、权限、数据库、部署配置或环境变量。
- 如果发现必须扩大范围，请先停下来说明原因。

Done when / 完成标准：
1. [写清楚第一个可验证结果。]
2. [写清楚第二个可验证结果。]
3. [写清楚第三个可验证结果。]

请按以下流程执行：
1. 找到相关文件；
2. 说明你理解的任务和修改计划；
3. 等我确认后再修改；
4. 修改后运行必要验证命令，例如 npm run build、npm run test 或 npm run lint；
5. 最后总结改了哪些文件、如何验证、还有什么风险。`
        }
      },
      {
        "heading": "提示词 2：Plan first，让 Codex 先计划再动手",
        "paragraphs": [
          "复杂需求不要直接让 Codex 写代码。先让它做计划，能暴露很多问题：它是否理解了范围、是否会误改文件、是否需要更多信息。",
          "这个模板适合需求还不完全清楚，或者涉及多个页面、组件、数据、样式、测试时使用。"
        ],
        "code": {
          "label": "Plan first 模板",
          "content": `请先不要修改任何文件。请先为这个任务制定计划。

任务：
[写清楚你要做什么。]

我希望你先完成：

1. 理解任务
- 用你自己的话复述任务目标；
- 说明用户最终会看到什么变化；
- 说明哪些内容不属于本次任务。

2. 探索代码
- 找出最相关的页面、组件、样式、数据或测试文件；
- 说明每个文件和任务的关系；
- 找出可以复用的已有模式。

3. 风险判断
- 哪些修改可能影响其它页面；
- 哪些模块不能碰；
- 是否涉及登录、支付、权限、数据库、部署配置或环境变量。

4. 实施计划
- 把任务拆成 3 到 6 个小步骤；
- 每一步说明要改什么、为什么要改；
- 标出最小可交付范围。

5. 验证计划
- 需要运行哪些命令；
- 需要打开哪些页面；
- 需要检查哪些边界情况。

如果需求不清楚，请先问我最多 3 个关键问题。
在我确认计划之前，不要写代码。`
        }
      },
      {
        "heading": "模板 3：AGENTS.md，让项目规则长期生效",
        "paragraphs": [
          "AGENTS.md 适合放项目长期规则：项目是什么、如何运行、不要改什么、完成后怎么验证。它比每次在对话里重复规则更稳定。",
          "下面这个模板适合前端内容站、产品原型站、案例库、学习资料站。可以复制到项目根目录的 AGENTS.md，再根据项目改。"
        ],
        "code": {
          "label": "AGENTS.md 模板",
          "content": `# AGENTS.md

## Project

This project is a frontend website for publishing AI coding cases, learning materials, and tool guides.

The main audience includes designers, product managers, independent developers, and beginners learning to build real products with AI coding tools.

## Working Rules

- Keep changes tightly scoped to the user's request.
- Do not delete, move, or rename files unless explicitly requested.
- Do not refactor unrelated code.
- Do not introduce new dependencies unless necessary and explained first.
- Prefer existing components, styles, data structures, and helper functions.
- If the task is ambiguous, ask a focused question before editing.
- If a task is large, propose a plan first and wait for confirmation.

## High-Risk Areas

Do not modify these areas unless the user explicitly asks:

- Authentication
- Payment
- User permissions
- Database schema
- Deployment configuration
- Environment variables
- Analytics or tracking logic

## UI Rules

- Keep the interface clean, readable, and editorial.
- Avoid heavy gradients, glow effects, excessive shadows, and nested cards.
- Do not make labels more visually dominant than titles.
- Make sure text does not overflow, overlap, or show half lines.
- Check desktop and mobile layouts when UI changes.
- Use existing tokens and page patterns where possible.

## Verification

After changes, run the smallest meaningful verification command:

- npm run build for frontend/content changes.
- npm run test when logic or tested behavior changes.
- npm run lint if linting is configured.

If a command fails, fix the issue before claiming the task is complete.

## Final Response

Always summarize:

1. Files changed.
2. What changed.
3. Verification commands and results.
4. Remaining risks or manual checks.
5. Whether the user needs to inspect any specific page.`
        }
      },
      {
        "heading": "提示词 4：可验证交付清单",
        "paragraphs": [
          "很多 AI Coding 出问题不是因为没写代码，而是没有把“完成”定义清楚。这个模板适合每次实现前让 Codex 先写 Done criteria。",
          "它能让 Codex 从“写完代码”切换到“交付一个可验证结果”。"
        ],
        "code": {
          "label": "Done criteria 模板",
          "content": `在开始实现之前，请先为这个任务写一份可验证交付清单。

任务：
[写清楚任务。]

请输出：

1. 用户可见结果
- 用户最终应该看到什么；
- 哪些文案、按钮、页面、状态应该变化。

2. 文件范围
- 预计需要修改哪些文件；
- 哪些文件明确不应该修改。

3. 功能验收标准
- 至少列出 3 条可检查的结果；
- 每一条都要能通过页面、命令或测试验证。

4. 边界情况
- 空数据时怎样；
- 图片或接口失败时怎样；
- 移动端怎样；
- 长文本、长 URL 或长代码块怎样。

5. 验证方式
- 需要运行哪些命令；
- 需要打开哪些页面；
- 需要手动检查哪些交互。

输出后先停下来，等我确认。`
        }
      },
      {
        "heading": "提示词 5：交付前审查",
        "paragraphs": [
          "Codex 官方最佳实践也强调验证和 review。这个模板适合任务完成后使用：让 Codex 站在 reviewer 视角检查自己刚才的改动。",
          "它不会替代人工 review，但可以帮助提前发现无关改动、测试缺口、边界问题和风险模块。"
        ],
        "code": {
          "label": "交付前审查提示词",
          "content": `请对你刚才完成的改动做一次交付前 review。

请检查：

1. 任务匹配
- 当前改动是否完全对应原始任务；
- 是否做了超出范围的事情；
- 是否遗漏了某个验收标准。

2. 文件范围
- 哪些文件被修改；
- 是否有无关文件被修改；
- 是否有不必要的格式化或重构。

3. 代码风险
- 是否有硬编码；
- 是否有重复逻辑；
- 是否遗漏错误处理、空状态、加载状态；
- 是否可能影响其它页面或共享组件。

4. 高风险模块
- 是否修改了登录、支付、权限、数据库、部署配置或环境变量；
- 如果没有，请明确说明没有涉及；
- 如果涉及，请说明原因和风险。

5. 验证结果
- 已运行哪些命令；
- 命令是否通过；
- 如果没有运行，请说明原因；
- 页面上还需要手动检查什么。

6. 最终建议
- 是否可以交付；
- 是否还需要继续修改；
- 是否需要用户手动验证。

请用中文输出，先列风险，再给结论。`
        }
      },
      {
        "heading": "怎么把这套最佳实践用起来",
        "paragraphs": [
          "如果只是做一个小改动，用“任务总模板”就够了。如果任务有点复杂，先用“Plan first 模板”。如果这是长期项目，把 AGENTS.md 模板放进项目根目录。实现前用 Done criteria 模板，完成后用交付前审查。",
          "这套流程看起来比一句“帮我做一下”麻烦，但它能减少返工。给 Codex 的不是一段愿望，而是一张带边界、验证和交付标准的任务卡。",
          "最好的 Codex 使用方式，不是让它自由发挥，而是把它放进稳定工程流程里：先计划、再修改、再验证、再 review。这样它会更像靠谱的协作者，而不是随机生成代码的工具。"
        ]
      }
    ]
  },
  {
    "id": "codex-agent-skills-reusable-workflow-templates",
    "sourceUrl": "https://developers.openai.com/codex/skills",
    "translationMode": "guidedTranslation",
    "title": "Codex Agent Skills：把高频提示词封装成可靠工作流",
    "originalTitle": "Agent Skills",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Agent Skills 官方文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/skills。",
    "sections": [
      {
        "heading": "为什么 Codex 也需要 Skills",
        "paragraphs": [
          "当你已经积累了很多好提示词，下一步不是继续复制粘贴，而是把它们沉淀成可复用 Skill。Codex Agent Skills 的思路就是：把一套稳定工作流写进 `SKILL.md`，让 Codex 在合适任务里自动或按名称调用。",
          "这适合高频任务：页面走查、内容导入、真实网页案例整理、本地 review、交付验证、PR 摘要。它们每次都差不多，但如果每次手写提示词，很容易漏掉边界、验证或禁止修改范围。",
          "可以把 Skill 理解成“给 Codex 的专业操作手册”。普通提示词是这次对话有效，AGENTS.md 是项目长期规则，Skill 则是某一类任务的可复用流程。"
        ]
      },
      {
        "heading": "推荐目录结构",
        "paragraphs": [
          "项目级 Skill 适合放在仓库里，让团队一起复用。对内容站、案例库、工具站来说，建议把页面走查、内容写入、验证交付这几类任务都 Skill 化。",
          "下面是一个适合前端内容项目的目录结构。可以直接复制目录名，也可以按自己的项目改。"
        ],
        "code": {
          "label": "Codex Skills 目录结构",
          "content": `.agents/
  skills/
    webpage-case-importer/
      SKILL.md
    ui-polish-review/
      SKILL.md
    verify-delivery/
      SKILL.md
    local-code-review/
      SKILL.md`
        }
      },
      {
        "heading": "Skill 1：webpage-case-importer，导入真实网页案例",
        "paragraphs": [
          "这个 Skill 适合 UIcoding.ai 这种案例和学习站：从真实网页、截图、官方文档或外部文章里整理学习资料，再写入站内详情页。",
          "它会要求 Codex 保留来源、避免全文搬运、生成中文解读，并且给出可复制提示词。"
        ],
        "code": {
          "label": "webpage-case-importer/SKILL.md",
          "content": `---
name: webpage-case-importer
description: Use this skill when the user asks Codex to turn a real webpage, article, official doc, or 提示词 library into a structured learning detail page.
---

# Webpage Case Importer

Use this skill to create a learning page from a real external source.

## Source Rules

- Prefer official docs, open source repositories, or clearly attributed public articles.
- Always preserve the original source URL.
- Do not copy a full copyrighted article verbatim.
- Summarize and explain in Chinese.
- Keep original structure only when the user explicitly asks for translation and rights allow it.
- If the source includes useful 提示词, convert them into complete copyable 提示词 blocks.

## 工作流

1. Read the source page or repository.
2. Identify the core learning value.
3. Extract real use cases, 提示词 examples, workflows, screenshots, or code templates.
4. Rewrite the material as a Chinese learning page.
5. Include source URL, source type, author, and collection date.
6. Create a route-friendly slug.
7. Add metadata to the learning list.
8. Add detail content with sections and copyable code blocks.
9. Run the project build.
10. Summarize changed files and verification results.

## Content Shape

The learning page should include:

- Why this source is worth learning
- Who should read it
- Original source link
- Key ideas explained in Chinese
- Complete copyable 提示词 or template blocks
- How to use the 提示词 in a real project
- Risks, boundaries, and verification advice

## Constraints

- Keep changes limited to learning data, content data, and required static assets.
- Do not modify layout, routing, analytics, payment, auth, database, or deployment config unless explicitly requested.
- If the source has images and the user asks to preserve them, save images locally when allowed and cite the source.
- Do not invent claims that are not supported by the source.

## Final Response

Summarize in Chinese:

1. New learning page URL.
2. Source URL.
3. What content was added.
4. Which files changed.
5. Verification command and result.`
        }
      },
      {
        "heading": "Skill 2：ui-polish-review，页面视觉走查",
        "paragraphs": [
          "这个 Skill 适合每次页面做完以后跑一遍，尤其适合学习页、案例页、工具页这种内容型界面。它会让 Codex 不只是说“好看”，而是按排版、阅读、响应式、文字溢出、图片状态逐项检查。",
          "如果经常遇到页面文字截断、卡片高度不稳、图片缺失、移动端拥挤，就可以沉淀这个 Skill。"
        ],
        "code": {
          "label": "ui-polish-review/SKILL.md",
          "content": `---
name: ui-polish-review
description: Use this skill when the user asks Codex to review or polish a frontend page for layout, typography, responsive behavior, and content readability.
---

# UI Polish 审查

Use this skill for frontend pages, cards, detail pages, content pages, dashboards, or tool interfaces.

## 审查 Focus

Check:

- Visual hierarchy
- Text readability
- Card spacing
- Button weight
- Image handling
- Code block readability
- Long text overflow
- Mobile layout
- Empty states
- Hover and focus states
- Consistency with existing design patterns

## 工作流

1. Identify the target page and route.
2. Read the page component, related card/detail components, and relevant CSS.
3. Do not start by changing code.
4. First list the 3 most important UI problems.
5. Explain why each problem hurts usability or visual quality.
6. Propose the smallest safe fix for each.
7. If the user confirms, implement only those fixes.
8. Run the build.
9. Provide browser/manual inspection steps.

## Design Rules

- Do not add decorative gradients, glow effects, or heavy shadows.
- Do not nest cards inside cards.
- Do not make labels more prominent than titles.
- Do not let text overlap, truncate half lines, or overflow buttons.
- Prefer existing CSS variables and component patterns.
- Keep content pages editorial, readable, and calm.

## Output Format

请用中文输出：

1. 页面问题
- 最多列 3 个最重要问题。

2. 修改方案
- 每个问题对应一个最小修复方式。

3. 修改文件
- 列出涉及文件。

4. 验证
- 运行了哪些命令；
- 需要打开哪些页面检查；
- 桌面端和移动端分别看什么。

## Constraints

- Do not redesign the entire site.
- Do not modify data unless the issue is data-specific.
- Do not introduce new UI libraries.
- Do not touch auth, payment, database, deployment, or environment variables.`
        }
      },
      {
        "heading": "Skill 3：verify-delivery，交付前验证",
        "paragraphs": [
          "这个 Skill 适合任何改动完成后运行。它把“我改完了”变成“我验证过了”，能显著减少构建失败、页面溢出、来源缺失和无关改动。",
          "它尤其适合当前这种不断写入学习资料的工作流：新增内容后必须检查 slug、来源、详情页、代码块和 build。"
        ],
        "code": {
          "label": "verify-delivery/SKILL.md",
          "content": `---
name: verify-delivery
description: Use this skill after Codex has implemented a change and needs to verify build health, affected pages, source links, and delivery quality.
---

# Verify Delivery

Use this skill after implementation and before final response.

## 工作流

1. Inspect git status.
2. Identify files changed by the current task.
3. Check whether the change matches the user's latest request.
4. Run the smallest meaningful verification command.
5. For frontend/content changes, identify affected routes.
6. Check source links, images, code blocks, and long text.
7. Report unverified items honestly.

## Verification Matrix

For learning/content pages:

- Metadata exists in the learning list.
- Detail content exists for the same id.
- href matches the detail route.
- Source URL is preserved.
- Copyable 提示词 blocks are complete.
- Build passes.
- No unrelated pages were removed.

For UI changes:

- Build passes.
- Desktop layout is readable.
- Mobile layout is readable.
- Text does not overlap or show half lines.
- Images have fallback behavior.

For logic changes:

- Relevant tests run.
- Edge cases are considered.
- Error handling is checked.

## Output Format

请用中文输出：

1. 验证结果
- 已运行命令；
- 命令结果；
- 如果有 warning，说明是否影响交付。

2. 影响范围
- 哪些页面或文件受影响；
- 是否有无关改动。

3. 手动检查建议
- 用户应该打开哪些 URL；
- 重点检查什么。

4. 风险
- 未验证项；
- 可能影响其它功能的点。

5. 结论
- 可以交付 / 需要继续修复 / 需要用户确认。

## Rules

- Never claim a command passed unless it actually ran.
- Do not hide build warnings.
- Do not run destructive git commands.
- Do not stage or commit unless explicitly requested.`
        }
      },
      {
        "heading": "Skill 4：local-code-review，本地提交前审查",
        "paragraphs": [
          "这个 Skill 适合准备提交前运行，专门检查 diff 是否干净、有没有无关改动、有没有遗漏验证。和 verify-delivery 不同，它更偏 review 视角。",
          "如果经常让 Codex 连续加多篇内容或做多轮 UI 修改，这个 Skill 可以帮助在最后收口。"
        ],
        "code": {
          "label": "local-code-review/SKILL.md",
          "content": `---
name: local-code-review
description: Use this skill when the user asks Codex to review local changes before commit, PR, deployment, or handoff.
---

# Local 代码审查

Use this skill to review current local changes.

## 审查 Priorities

Look for:

- Bugs
- Behavioral regressions
- Missing tests
- Missing verification
- Unrelated changes
- Accidental deletion
- Broken routes or ids
- Source attribution problems
- UI overflow or layout risks
- High-risk module changes

## 工作流

1. Inspect git status.
2. Inspect the diff.
3. Identify changed files by category.
4. Check whether changes match the user request.
5. Check for suspicious unrelated edits.
6. Check whether tests/build were run.
7. 审查 content routes, ids, images, and source URLs when relevant.
8. Produce findings first, ordered by severity.

## Output Format

请用中文输出：

1. Findings
- 如果发现问题，按严重程度排序；
- 每条包含文件、问题、影响、建议修复。

2. Open Questions
- 有哪些需要用户确认的内容、来源、版权、图片或验收标准。

3. Verification Gap
- 哪些验证已运行；
- 哪些验证还没运行；
- 是否需要浏览器检查。

4. Change Summary
- 简短总结本次改动。

If there are no findings, say:
未发现阻塞问题。

## Rules

- Do not modify files unless the user asks you to fix findings.
- Do not stage, commit, or push.
- Do not bury findings under a long summary.
- Be specific and cite file paths when possible.`
        }
      },
      {
        "heading": "怎么开始用这一组 Skills",
        "paragraphs": [
          "最简单的方式是先只做一个 Skill，比如 `verify-delivery`。当你发现它确实能帮你省掉重复检查，再继续加入 `webpage-case-importer`、`ui-polish-review` 和 `local-code-review`。",
          "不要一开始就把所有提示词都做成 Skill。Skill 的价值在于复用，不在于数量。只要某个任务会反复做三次以上，它就值得被沉淀。",
          "对 UIcoding.ai 这种内容型网站来说，最推荐的顺序是：先做 `webpage-case-importer` 管内容导入，再做 `verify-delivery` 管交付，最后做 `ui-polish-review` 和 `local-code-review` 管质量。"
        ]
      }
    ]
  },
  {
    "id": "codex-slack-team-workflow-prompts",
    "sourceUrl": "https://developers.openai.com/codex/integrations/slack",
    "translationMode": "guidedTranslation",
    "title": "Slack 里调用 Codex：把团队反馈变成可执行任务提示词",
    "originalTitle": "Use Codex in Slack",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Slack 官方集成文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/integrations/slack。",
    "sections": [
      {
        "heading": "为什么 Slack 场景适合 Codex",
        "paragraphs": [
          "很多真实需求不是从 issue 开始的，而是从 Slack 里的几句话开始：用户说页面坏了，设计师说按钮不对，产品说这个文案要改，工程师说这个 PR 需要再看一眼。",
          "Codex 的 Slack 集成价值在于：你可以在频道或线程里直接 `@Codex`，让它把上下文转成一个云端编码任务。它可以利用线程里的讨论，但你最好在最后一条消息里把目标、仓库、环境、约束和完成标准说清楚。",
          "本文不讲安装步骤，而是整理一组可以直接复制到 Slack 线程里的提示词。可以把它们当成团队协作模板：Bug 反馈、UI 反馈、PR 审查、发布前检查、把讨论整理成 issue。"
        ]
      },
      {
        "heading": "Slack 提示词的基本结构",
        "paragraphs": [
          "在 Slack 里给 Codex 的提示词要比普通对话更明确，因为它可能从一段很长的线程里接任务。最稳的结构是：先说明仓库和环境，再总结线程结论，然后写清楚任务目标、限制范围和验收标准。",
          "下面这个是通用模板，可以作为任何 Slack 任务的起点。"
        ],
        "code": {
          "label": "Slack 通用 @Codex 模板",
          "content": `@Codex 请根据这个线程创建一个编码任务。

仓库：
[填写仓库名称或链接]

目标分支或环境：
[填写 main、staging、preview、某个环境名，或说明请按默认环境处理]

线程结论摘要：
[用 3 到 5 条总结这个 Slack 线程真正要解决的问题，不要让 Codex 自己从几十条消息里猜重点。]

本次任务目标：
[写清楚要修复、实现或检查什么。]

限制范围：
- 只修改和当前任务直接相关的文件。
- 优先复用现有组件、样式、数据结构和工具函数。
- 不要重构无关代码。
- 不要新增依赖，除非先说明必要性。
- 不要修改登录、支付、权限、数据库、部署配置或环境变量。

验收标准：
1. [第一条可验证结果。]
2. [第二条可验证结果。]
3. [第三条可验证结果。]

验证要求：
- 运行项目里合适的验证命令，例如 build、test 或 lint。
- 如果是前端页面，说明应该检查哪个 URL 和哪些状态。
- 最后总结改了哪些文件、如何验证、还有什么风险。`
        }
      },
      {
        "heading": "提示词 1：把用户 Bug 反馈变成修复任务",
        "paragraphs": [
          "用户反馈经常很模糊：打不开、错位、按钮没反应、数据显示不对。需要在 Slack 里帮 Codex 把反馈补成可复现任务。",
          "这段提示词适合客服、产品、运营把用户反馈直接转交给 Codex。"
        ],
        "code": {
          "label": "Slack Bug 修复提示词",
          "content": `@Codex 请根据这个线程修复一个 Bug。

仓库：
[填写仓库名称或链接]

Bug 现象：
[用一句话描述用户看到的问题。]

复现路径：
1. 打开 [页面 URL 或路由]。
2. 执行 [用户操作]。
3. 观察到 [错误表现]。

期望结果：
[说明正确表现。]

线程里有用的信息：
- 用户设备或浏览器：[如果有就填写]
- 截图或录屏：[如果有就说明]
- 报错信息：[如果有就粘贴]
- 首次出现时间：[如果有就填写]

请执行：
1. 找到相关代码。
2. 分析最可能的根因。
3. 做最小修复。
4. 不要改无关页面。
5. 不要修改登录、支付、权限、数据库、部署配置或环境变量。
6. 运行必要验证命令。

完成后请回复：
- 根因；
- 修改文件；
- 验证结果；
- 需要我们在浏览器里复查的页面和状态；
- 是否还有未验证风险。`
        }
      },
      {
        "heading": "提示词 2：把设计反馈变成 UI 迭代任务",
        "paragraphs": [
          "设计反馈最容易变成“优化一下”。在 Slack 里交给 Codex 时，一定要明确页面、问题、视觉目标、禁止项和验收方式。",
          "这段适合设计师或产品经理在评审线程里直接发给 Codex。"
        ],
        "code": {
          "label": "Slack UI 迭代提示词",
          "content": `@Codex 请根据这个设计反馈线程做一轮小范围 UI 迭代。

仓库：
[填写仓库名称或链接]

目标页面：
[填写页面 URL 或路由]

当前问题：
1. [例如：标题层级不清晰。]
2. [例如：卡片内容太挤。]
3. [例如：移动端按钮和正文距离太近。]

设计目标：
- 更清晰；
- 更易读；
- 更符合现有设计系统；
- 不增加复杂装饰；
- 不做成模板站风格。

限制范围：
- 只修改该页面相关组件和样式。
- 不要改数据结构。
- 不要改路由。
- 不要新增 UI 库。
- 不要引入重渐变、发光、重阴影或多层卡片嵌套。

验收标准：
1. 桌面端页面内容不重叠、不截断、不出现半行文字。
2. 移动端布局可读，按钮和文字有足够间距。
3. 页面风格和现有组件保持一致。

请先检查相关页面和样式文件，再做最小修改。
完成后请运行 build，并回复修改文件、验证结果和需要设计复查的页面。`
        }
      },
      {
        "heading": "提示词 3：把 PR 线程变成 Codex 审查",
        "paragraphs": [
          "团队里常见场景是：有人在 Slack 贴了一个 PR，让大家帮忙看。可以直接让 Codex 先做一轮结构化审查，找风险、测试缺口和无关改动。",
          "注意：这不是让 Codex 自动合并，而是让它先给 reviewer 一份清晰检查清单。"
        ],
        "code": {
          "label": "Slack PR 审查提示词",
          "content": `@Codex 请帮我们 review 这个 PR。

PR 链接：
[粘贴 PR URL]

PR 目标：
[用一句话说明这个 PR 要解决什么问题。]

请重点检查：
1. 改动是否符合 PR 目标；
2. 是否有明显 Bug 或回归风险；
3. 是否有无关重构或不必要文件改动；
4. 是否影响登录、支付、权限、数据库、部署配置或环境变量；
5. 是否缺少测试、文档或迁移说明；
6. 是否有 UI 溢出、移动端问题或可访问性问题；
7. 是否需要作者补充截图、验证结果或说明。

输出格式：
- 总体结论：建议通过 / 需要修改 / 需要更多信息。
- Findings：按严重程度列出问题，每条包含位置、原因、建议。
- Open questions：列出需要向作者确认的问题。
- Suggested tests：列出建议补充或重新运行的测试。

请只做 review，不要直接修改代码，也不要批准或合并 PR。`
        }
      },
      {
        "heading": "提示词 4：发布前检查",
        "paragraphs": [
          "发布前检查适合交给 Codex 做第一轮。它可以从代码角度看构建、路由、环境变量、静态资源、关键页面和风险模块。",
          "这段适合在准备上线、发版、部署 preview 之前发到 Slack 发布线程。"
        ],
        "code": {
          "label": "Slack 发布前检查提示词",
          "content": `@Codex 请根据当前分支做一次发布前检查。

仓库：
[填写仓库名称或链接]

目标分支或部署环境：
[填写分支、preview 链接或部署环境]

本次发布包含：
[用 3 到 5 条总结这次发布的主要改动。]

请检查：
1. 构建是否通过；
2. 测试或 lint 是否需要运行；
3. 新增或修改的路由是否可访问；
4. 关键页面是否有明显内容缺失、图片缺失、文字溢出或链接错误；
5. 是否改动了登录、支付、权限、数据库、部署配置或环境变量；
6. 是否有需要手动配置的环境变量或后台设置；
7. 是否有未提交、临时或调试文件。

输出格式：
- 可以发布 / 暂不建议发布 / 需要人工确认；
- 已通过的检查；
- 发现的问题；
- 需要人工验证的页面；
- 发布前建议补做的步骤。

请不要自动部署，也不要执行破坏性命令。`
        }
      },
      {
        "heading": "提示词 5：把 Slack 讨论整理成 Issue",
        "paragraphs": [
          "并不是每个 Slack 讨论都应该马上让 Codex 改代码。有时更好的做法是先整理成一个清晰 issue，等产品或工程确认后再执行。",
          "这段提示词适合需求还没定、多人意见分散、线程很长的时候。"
        ],
        "code": {
          "label": "Slack 讨论转 Issue 提示词",
          "content": `@Codex 请先不要改代码。请把这个 Slack 线程整理成一个清晰的工程 issue。

线程背景：
[用一句话说明这个讨论从什么问题开始。]

请整理成以下结构：

## 背景
- 这个问题为什么重要；
- 影响哪些用户或页面；
- 目前看到的现象是什么。

## 目标
- 这次希望解决什么；
- 完成后用户应该看到什么变化。

## 非目标
- 本次不做什么；
- 哪些方向需要以后单独讨论。

## 验收标准
- 至少列出 3 条可验证标准；
- 每条都要能通过页面、测试或命令确认。

## 相关信息
- 相关页面；
- 截图或录屏；
- 报错；
- 相关 PR、issue 或讨论链接。

## 风险
- 是否涉及登录、支付、权限、数据库、部署配置或环境变量；
- 是否需要设计、产品或后端确认。

## 建议执行计划
- 拆成 3 到 5 个小步骤；
- 标出第一步应该做什么。

请输出 issue 草稿，不要修改代码。`
        }
      },
      {
        "heading": "Slack 里调用 Codex 的关键习惯",
        "paragraphs": [
          "第一，不要让 Codex 从一长串聊天里猜需求。你应该在 `@Codex` 那条消息里总结线程结论。第二，一定要写仓库、环境和页面路径。第三，要写清楚不要动什么，尤其是登录、支付、数据库和部署配置。",
          "第四，Slack 里的任务也要有验收标准。否则 Codex 可能完成了代码修改，但团队不知道怎么判断结果是否正确。第五，如果需求还没定，先让 Codex 整理 issue，不要直接写代码。",
          "把 Slack 当成任务入口，而不是需求垃圾桶。人负责把讨论收敛成清晰任务，Codex 负责按任务执行和验证，这样团队协作会稳很多。"
        ]
      }
    ]
  },
  {
    "id": "codex-pixel-perfect-website-rebuild-prompts",
    "sourceUrl": "https://developers.openai.com/codex/use-cases/figma-designs-to-code",
    "translationMode": "guidedTranslation",
    "title": "Codex 高保真网站复现提示词：从参考网页到像素级验证",
    "originalTitle": "Turn Figma designs into code",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Figma-to-code 官方用例整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/use-cases/figma-designs-to-code。请仅用于自己的设计稿、授权页面、学习临摹或内部原型；不要直接复制第三方品牌页面并冒充上线。",
    "sections": [
      {
        "heading": "高保真复现不是一句“照着做”",
        "paragraphs": [
          "很多人让 Codex 复现网站时，会直接说“帮我做一个和这个网站一样的页面”。这种提示词很容易失败：Codex 不知道需要复现哪些部分，也不知道哪些可以简化，更不知道完成后怎么判断像不像。",
          "更稳定的方式是把复现拆成五步：先拆解参考页面，再收集资产和约束，然后实现页面，接着做响应式和交互，最后用截图对比继续迭代。",
          "OpenAI Codex 的 Figma-to-code 用例也强调了类似思路：给 Codex 足够的设计上下文和资产，实现后通过浏览器截图检查，再迭代修正。下面这组提示词就是把这个流程改写成可以直接复制的中文版本。"
        ]
      },
      {
        "heading": "提示词 1：复现前拆解参考网页",
        "paragraphs": [
          "不要一开始就写代码。先让 Codex 拆解参考页面：布局、字号、间距、颜色、图片、动效、响应式、交互状态。拆得越清楚，后面实现越稳定。",
          "如果有 URL，就粘 URL；如果只有截图，就用文字描述截图，或者把截图提供给 Codex。"
        ],
        "code": {
          "label": "参考网页拆解提示词",
          "content": `请先拆解这个参考网页或截图，不要写代码。

参考来源：
[粘贴网页 URL、Figma 链接，或描述截图内容。]

我要复现的目标：
[例如：复现首页首屏和下方案例区，作为我自己项目的内部原型。]

使用边界：
- 这是学习、临摹、内部原型或已授权页面复现。
- 不要复制第三方品牌名称、Logo、商标文案用于正式上线。
- 如果参考页包含第三方图片或版权素材，请提醒我需要替换成自有素材。

请按以下维度拆解：

1. 页面结构
- 从上到下有哪些区块；
- 每个区块承担什么信息任务；
- 哪些区块必须复现，哪些可以简化。

2. 首屏布局
- 导航栏高度、Logo 区、导航项、按钮位置；
- Hero 标题、副标题、CTA、媒体区域；
- 首屏是否需要露出下一屏内容。

3. 视觉系统
- 背景颜色、文字颜色、强调色；
- 字体气质、字号层级、行高；
- 圆角、边框、阴影、留白和最大宽度；
- 页面是否偏编辑感、SaaS 感、工具感或作品集感。

4. 组件清单
- 导航、按钮、卡片、标签、图片、代码块、表单、列表；
- 哪些组件可以复用当前项目已有组件；
- 哪些需要新写。

5. 动效和交互
- hover、focus、active 状态；
- 滚动、吸顶、展开、切换、加载或空状态；
- 哪些动效必须做，哪些可以先不做。

6. 响应式
- 桌面端布局；
- 平板端布局；
- 移动端布局；
- 长标题、长按钮、图片和卡片如何换行。

7. 实现风险
- 哪些部分最容易不像；
- 哪些素材需要我提供；
- 哪些地方不能直接复制原站内容。

最后请输出一份“高保真复现实施计划”，但不要开始写代码。`
        }
      },
      {
        "heading": "提示词 2：高保真实现页面",
        "paragraphs": [
          "拆解完成后，再让 Codex 实现页面。这个提示词会明确目标路由、允许简化项、禁止项和验收标准，避免它一边复现一边重构整个项目。",
          "如果已经有项目设计系统，要强调复用现有组件和样式变量；如果是空项目，要让 Codex 先建立最小可运行页面。"
        ],
        "code": {
          "label": "高保真实现提示词",
          "content": `请根据前面的页面拆解，在当前项目中实现一个高保真原型页面。

目标路由：
[例如 /landing-rebuild 或 /cases/reference-clone]

复现范围：
- 必须复现：[列出必须复现的区块，例如导航、Hero、案例区、CTA。]
- 可以简化：[列出可以简化的内容，例如复杂动画、第三方图片、真实后端数据。]
- 不要复现：[列出不应复制的品牌 Logo、商标文案、专有图片或敏感内容。]

实现要求：
1. 页面整体信息层级要接近参考网页。
2. 首屏布局、标题节奏、按钮位置、图片比例要尽量接近。
3. 颜色、字体层级、间距、圆角、边框和阴影要保持一致的视觉气质。
4. 桌面端和移动端都要可用。
5. 需要包含 hover、focus、active 等基础交互状态。
6. 图片缺失时要有可接受的 fallback。
7. 长标题、长段落、长按钮不能溢出或遮挡。

工程限制：
- 优先复用当前项目已有组件、样式变量和布局规则。
- 不要引入新的 UI 组件库。
- 不要接真实后端。
- 不要修改登录、支付、权限、数据库、部署配置或环境变量。
- 不要重构无关页面。
- 如果需要新增文件，请先说明用途。

请按步骤执行：
1. 列出准备新增或修改的文件。
2. 实现页面结构和样式。
3. 补充移动端样式。
4. 运行 npm run build。
5. 告诉我应该打开哪个 URL 检查效果。

完成后请总结：
- 还原了哪些参考页面特征；
- 哪些地方做了合理简化；
- 哪些地方需要我提供真实素材；
- 有哪些风险或后续微调点。`
        }
      },
      {
        "heading": "提示词 3：专门做响应式复现",
        "paragraphs": [
          "很多页面桌面端看起来像，移动端就崩了。高保真复现必须单独处理响应式：导航、Hero、图片比例、卡片列数、长文本和按钮换行都要检查。",
          "这段提示词适合页面初版完成后单独运行一轮。"
        ],
        "code": {
          "label": "响应式复现提示词",
          "content": `请针对刚才实现的页面做一轮响应式高保真检查和修复。

目标页面：
[填写本地页面 URL 或路由。]

参考页面或截图：
[填写参考网页 URL，或说明桌面端/移动端截图。]

请检查以下视口：
- 1440px 桌面端；
- 1024px 平板端；
- 768px 小平板；
- 390px 手机端；
- 320px 极窄手机端。

重点检查：
1. 导航是否拥挤、换行或溢出；
2. Hero 标题是否过长、是否遮挡媒体；
3. CTA 按钮是否完整显示；
4. 图片比例是否合理，是否被过度裁切；
5. 卡片列数是否自然变化；
6. 长文本、长 URL、长英文单词是否撑破容器；
7. 页面是否出现横向滚动；
8. 首屏是否还能露出下一段内容；
9. 代码块或列表是否在移动端可读。

修复要求：
- 只修改响应式相关样式。
- 不要改变页面内容结构，除非确实需要。
- 不要重构无关组件。
- 不要新增依赖。

完成后请运行 npm run build，并输出：
1. 修改了哪些响应式规则；
2. 每个视口重点检查结果；
3. 仍然需要人工确认的地方。`
        }
      },
      {
        "heading": "提示词 4：Playwright 截图对比验证",
        "paragraphs": [
          "要逼近“完美复现”，不能只靠肉眼一句“差不多”。最实用的方式是让 Codex 用浏览器打开页面，截桌面和移动端截图，和参考截图逐项比较。",
          "如果项目里已经能用 Playwright 或浏览器工具，这段提示词适合做视觉 QA。"
        ],
        "code": {
          "label": "截图对比验证提示词",
          "content": `请对当前页面做一轮截图对比验证。

目标页面：
[填写本地 URL，例如 http://localhost:3000/rebuild]

参考来源：
[填写参考网页 URL，或说明参考截图文件路径。]

请使用可用的浏览器或 Playwright 工具完成：
1. 打开目标页面。
2. 分别在 1440px、1024px、390px 视口截图。
3. 如果可以访问参考网页，也在相同视口截图。
4. 对比目标页面和参考页面。

请按以下维度打分，满分 10 分：
- 布局结构相似度；
- 首屏视觉相似度；
- 字体层级相似度；
- 间距和留白相似度；
- 颜色和背景相似度；
- 图片和媒体比例相似度；
- 移动端相似度；
- 交互状态完整度。

请输出：
1. 当前最不像的 5 个地方；
2. 每个问题对应的文件和 CSS/组件位置；
3. 最小修复建议；
4. 哪些差异是因为版权素材或品牌内容不能直接复制；
5. 下一轮应该优先修哪 3 个问题。

如果截图工具不可用，请退而求其次：用 DOM、CSS 和人工检查清单完成对比，并说明限制。`
        }
      },
      {
        "heading": "提示词 5：按截图差异继续迭代",
        "paragraphs": [
          "第一版复现通常不会一次到位。更好的做法是每轮只修最影响相似度的 3 个问题，修完再截图对比。",
          "这个提示词适合已经有截图对比结果，想让 Codex 继续微调页面。"
        ],
        "code": {
          "label": "高保真迭代提示词",
          "content": `请根据上一轮截图对比结果，继续做高保真迭代。

上一轮最主要差异：
1. [差异一，例如 Hero 标题字号偏小。]
2. [差异二，例如右侧图片比例不对。]
3. [差异三，例如卡片间距太大。]

本轮只修这 3 个问题，不要扩大范围。

修复要求：
- 尽量通过 CSS 和现有组件微调解决；
- 不要重写整个页面；
- 不要修改无关内容；
- 不要新增依赖；
- 不要复制第三方品牌素材或商标文案；
- 保持桌面端和移动端都可用。

请执行：
1. 找到相关样式或组件；
2. 做最小修改；
3. 运行 npm run build；
4. 重新说明 1440px 和 390px 两个视口应该检查什么；
5. 输出本轮相似度是否提升，以及还剩哪些差异。

最后请给出下一轮建议，但不要自动继续大改。`
        }
      },
      {
        "heading": "提示词 6：复现交付检查",
        "paragraphs": [
          "当页面已经页面已经很像了，最后要做一次交付检查：版权素材是否替换、移动端是否可用、链接是否正常、构建是否通过、是否误改其它页面。",
          "这一步能避免“看起来像，但不能上线”的问题。"
        ],
        "code": {
          "label": "复现交付检查提示词",
          "content": `请对这个高保真复现页面做最终交付检查。

目标页面：
[填写页面 URL 或路由。]

参考来源：
[填写参考网页、Figma 或截图来源。]

请检查：
1. 是否还包含第三方品牌 Logo、商标文案或未经授权图片；
2. 所有图片、链接、按钮、表单状态是否可用；
3. 桌面端、平板端、移动端是否正常；
4. 是否有文本溢出、遮挡、半行截断或横向滚动；
5. hover、focus、active 状态是否可接受；
6. 是否影响其它页面、共享组件或全局样式；
7. 是否修改了登录、支付、权限、数据库、部署配置或环境变量；
8. npm run build 是否通过。

请输出：
- 可以交付 / 需要继续修改 / 需要用户确认；
- 必须修复的问题；
- 建议优化的问题；
- 需要替换的素材或文案；
- 验证命令和结果；
- 用户应该最后人工检查的页面和视口。`
        }
      },
      {
        "heading": "怎么用这套提示词才稳定",
        "paragraphs": [
          "不要把 6 段提示词一次性全丢给 Codex。最稳的顺序是：先拆解，再实现，再响应式，再截图对比，再小步迭代，最后交付检查。",
          "如果有 Figma 或截图，效果通常比只给 URL 更稳定。因为截图能提供明确视觉目标，Codex 可以用浏览器截图反复对比。URL 适合拆解结构，截图适合校准视觉。",
          "最后再强调一次：高保真复现适合学习、内部原型、授权项目和自己的设计稿。真正上线时，要替换第三方品牌、图片和专有文案，保留参考里的结构思路，而不是照搬别人的商业页面。"
        ]
      }
    ]
  },
  {
    "id": "codex-cinematic-web-effects-prompts",
    "sourceUrl": "https://developers.openai.com/codex/use-cases/figma-designs-to-code",
    "translationMode": "guidedTranslation",
    "title": "Codex 酷炫网页效果提示词：3D、滚动叙事和高级动效",
    "originalTitle": "Build cinematic web experiences with Codex",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Figma-to-code 用例、Three.js 官方文档和 GSAP ScrollTrigger 官方资料整理的中文学习笔记，不是原文全文翻译。参考来源：https://developers.openai.com/codex/use-cases/figma-designs-to-code、https://threejs.org/docs/、https://gsap.com/docs/v3/Plugins/ScrollTrigger/。",
    "sections": [
      {
        "heading": "酷炫网页效果最怕一句话乱做",
        "paragraphs": [
          "让 Codex 做酷炫网页时，最危险的提示词就是“做得炫一点”。它可能会堆渐变、发光、粒子、动效、阴影和随机装饰，最后页面确实动起来了，但不高级、不稳定，也不一定能在手机上正常运行。",
          "更好的方式是把酷炫效果拆成可实现模块：沉浸式 Hero、3D 背景、滚动叙事、粒子动效、微交互、性能降级和浏览器验证。每个模块都要写清楚视觉目标、技术约束、响应式策略和验收标准。",
          "下面这组提示词适合给 Codex、Claude Code 或 Cursor Agent 使用。可以复制完整代码块，把项目名称、目标页面、视觉参考和技术栈替换掉。"
        ]
      },
      {
        "heading": "提示词 1：酷炫网页效果总控提示词",
        "paragraphs": [
          "如果只想复制一段完整提示词，就用这一段。它适合从零做一个带视觉冲击力的页面，也适合重做一个普通首页。",
          "它会约束 Codex：先做计划，不要堆装饰；优先保证可读、可用和性能；最后必须验证。"
        ],
        "code": {
          "label": "酷炫网页效果总控提示词",
          "content": `请帮我为当前项目实现一个高级、酷炫但可用的网页效果页面。先制定计划，不要马上写代码。

目标页面：
[填写路由，例如 /showcase、/landing、/product-demo]

页面主题：
[填写产品或主题，例如 AI Coding 案例库、3D 产品展示、创意工具官网]

视觉方向：
- 沉浸式；
- 有空间感；
- 有高级动效；
- 第一屏有强视觉记忆点；
- 不要像普通 SaaS 模板；
- 不要堆廉价渐变、发光边框和随机装饰。

期望效果：
1. 首屏有一个沉浸式 Hero。
2. 背景可以使用 3D、粒子、网格、光线、玻璃感或动态几何。
3. 滚动时内容有节奏地出现。
4. 鼠标或触摸操作有轻微反馈。
5. 移动端保持简洁可读，不强行动画堆满屏。

技术约束：
- 优先使用当前项目已有技术栈。
- 如果项目已经有 Three.js、GSAP、Framer Motion 或 Motion，可以复用。
- 如果需要新增依赖，先说明为什么必须新增。
- 不要引入沉重、难维护的动画框架。
- 不要修改登录、支付、权限、数据库、部署配置或环境变量。
- 不要影响其它页面。

性能约束：
- 动画不能阻塞阅读。
- 移动端可以降级或减少粒子数量。
- 避免无限制 requestAnimationFrame。
- Canvas 或 WebGL 必须有非 WebGL fallback。
- 文字不能被动画遮挡。

请先输出：
1. 页面结构；
2. 动效设计；
3. 技术实现方案；
4. 需要新增或修改的文件；
5. 性能和移动端降级策略；
6. 验证方式。

等我确认后再实现。`
        }
      },
      {
        "heading": "提示词 2：沉浸式 Hero + 3D 背景",
        "paragraphs": [
          "酷炫网页最重要的是首屏。首屏要有记忆点，但不能牺牲标题可读性。这个提示词适合做 Three.js 背景、粒子场、动态网格、漂浮几何或光线效果。",
          "如果项目没有 Three.js，可以让 Codex 先用 CSS + Canvas 做轻量版。"
        ],
        "code": {
          "label": "沉浸式 Hero 提示词",
          "content": `请为目标页面实现一个沉浸式 Hero 区域，包含高级动态背景，但不要影响文字可读性。

目标页面：
[填写页面路由]

Hero 内容：
- H1：[填写主标题]
- 副标题：[填写副标题]
- 主按钮：[填写按钮文案]
- 次按钮：[填写按钮文案，可选]

视觉效果：
- 背景有空间纵深感；
- 可以使用 Three.js、Canvas 或纯 CSS 实现动态几何、粒子、网格、光线或波纹；
- 视觉要克制高级，不要廉价霓虹和过度发光；
- 前景文字必须始终清晰；
- 首屏底部要隐约露出下一段内容。

交互效果：
- 鼠标移动时背景有轻微视差；
- 按钮 hover 有轻微位移或光泽；
- 动效不能抢走阅读注意力；
- 用户开启 reduced motion 时应减少动画。

实现要求：
1. 创建独立的 Hero 组件，不要把复杂动画直接塞进页面文件。
2. 动画代码要和内容结构分离。
3. 如果使用 Canvas 或 WebGL，要处理容器 resize。
4. 移动端减少动画复杂度。
5. 提供 fallback 背景，避免 WebGL 不可用时空白。

验证要求：
- 运行 npm run build；
- 检查桌面端 1440px；
- 检查移动端 390px；
- 检查文字是否被背景遮挡；
- 检查页面是否出现横向滚动。

请先列出实现计划和文件清单，等我确认后再写代码。`
        }
      },
      {
        "heading": "提示词 3：滚动叙事和视差转场",
        "paragraphs": [
          "很多高级网站的酷，不是元素一直乱动，而是滚动时有节奏：标题出现、图片推进、卡片错位、背景层慢慢切换。",
          "这个提示词适合用 GSAP ScrollTrigger、IntersectionObserver 或轻量 CSS 动画实现滚动叙事。"
        ],
        "code": {
          "label": "滚动叙事提示词",
          "content": `请为当前页面加入高级滚动叙事效果，让内容随着滚动有节奏地出现。

目标页面：
[填写页面路由]

页面区块：
1. Hero；
2. 核心卖点；
3. 案例展示；
4. 工作流步骤；
5. CTA。

动效目标：
- 滚动时每个区块自然进入视野；
- 标题、正文、图片或卡片有轻微错层；
- 背景可以有慢速视差；
- 不要让内容闪烁、跳动或遮挡；
- 动效节奏要服务阅读，而不是炫技。

技术选择：
- 如果项目已有 GSAP，可以使用 ScrollTrigger。
- 如果没有 GSAP，优先使用 IntersectionObserver + CSS transition。
- 不要为了小动效新增大型依赖，除非先说明必要性。

实现要求：
1. 动效逻辑封装到独立 hook 或组件中。
2. 不要把动画状态和业务数据混在一起。
3. reduced motion 用户应直接显示内容或使用极弱动画。
4. 移动端减少位移距离和动画数量。
5. 所有内容在 JS 失败时仍然可见。

验收标准：
- 滚动过程没有明显卡顿；
- 内容不会因为动画导致不可读；
- 移动端没有横向滚动；
- build 通过；
- 页面结构仍然可被搜索引擎读取。

请先输出动效方案和风险，再实现。`
        }
      },
      {
        "heading": "提示词 4：粒子、流体和动态网格效果",
        "paragraphs": [
          "粒子和流体效果很容易变土。关键是少而准：数量可控、色彩克制、运动慢、不要挡住内容、移动端降级。",
          "这段适合做背景氛围、产品展示区或创意工具的视觉记忆点。"
        ],
        "code": {
          "label": "粒子/动态网格提示词",
          "content": `请为页面实现一个克制但高级的动态背景效果，可以是粒子场、动态网格、柔和光带或流体感背景。

目标区域：
[填写 Hero、某个 section，或整个页面背景]

视觉要求：
- 高级、克制、有空间感；
- 颜色不要超过 3 个主色；
- 不要使用廉价霓虹、重发光、过度模糊；
- 背景要衬托内容，不要抢内容；
- 动效要慢、稳、流畅。

技术要求：
- 优先使用 CSS 或 Canvas；
- 如果使用 Three.js，要封装成独立组件；
- 粒子数量需要根据设备能力或视口尺寸调整；
- 移动端降低粒子数量或静态化；
- 支持 prefers-reduced-motion；
- 必须有纯 CSS fallback。

交互要求：
- 鼠标移动可以轻微影响背景；
- 不要让交互产生眩晕感；
- 不要阻塞页面滚动；
- 不要影响按钮点击或文本选择。

实现限制：
- 不要引入新的依赖，除非先说明必要性；
- 不要修改其它页面；
- 不要把动画写成难维护的大段匿名代码；
- 不要导致首屏加载明显变慢。

完成后请验证：
1. build 是否通过；
2. 1440px 桌面端是否流畅；
3. 390px 移动端是否降级合理；
4. 文字是否清晰；
5. 背景是否会遮挡交互元素。

最后请说明：动效如何实现、如何降级、还有哪些性能风险。`
        }
      },
      {
        "heading": "提示词 5：高级微交互和按钮动效",
        "paragraphs": [
          "酷炫网页不一定都靠大背景。有时按钮、卡片、导航、输入框这些小交互更能让页面有质感。",
          "这个提示词适合在页面结构已经完成后，单独加一轮微交互。"
        ],
        "code": {
          "label": "微交互提示词",
          "content": `请为当前页面做一轮高级微交互优化，只处理交互质感，不重做页面结构。

目标页面：
[填写页面路由]

需要优化的元素：
- 导航；
- 主按钮和次按钮；
- 卡片；
- 图片或预览图；
- 表单或输入框；
- 代码块复制按钮。

动效方向：
- hover 时有轻微位移、阴影或边框变化；
- active 时有明确按压反馈；
- focus 状态清晰可见；
- 卡片 hover 不要过度漂浮；
- 按钮动效不要影响文字可读；
- 复制成功状态要明确但不刺眼。

限制：
- 不要新增复杂动画库；
- 不要加夸张发光；
- 不要让 hover 改变布局尺寸；
- 不要影响移动端点击；
- 不要破坏键盘可访问性。

请执行：
1. 找出页面中最重要的交互元素；
2. 只做最小样式和状态增强；
3. 保持现有视觉风格；
4. 运行 npm run build；
5. 输出需要手动检查的交互清单。

验收标准：
- 鼠标用户能感知到交互反馈；
- 键盘用户能看到 focus；
- 移动端没有 hover 依赖；
- 页面没有布局跳动。`
        }
      },
      {
        "heading": "提示词 6：酷炫效果 QA 和性能验证",
        "paragraphs": [
          "高级动效做完以后，一定要单独 QA。酷炫页面最常见的问题是：手机卡、文字被挡、滚动抖、截图空白、Canvas 没 fallback、动画影响点击。",
          "这段提示词适合最后一轮检查。"
        ],
        "code": {
          "label": "酷炫效果 QA 提示词",
          "content": `请对当前酷炫网页效果做一轮 QA 和性能验证。

目标页面：
[填写页面 URL 或路由]

请检查：

1. 视觉完整性
- Hero 是否非空白；
- 背景动画是否正常；
- 文本是否清晰可读；
- 按钮和链接是否不被遮挡；
- 页面是否有高级感而不是模板感。

2. 响应式
- 1440px 桌面端；
- 1024px 平板端；
- 390px 手机端；
- 320px 极窄手机端；
- 是否有横向滚动、文字截断、图片溢出。

3. 动效稳定性
- 动画是否卡顿；
- 滚动是否抖动；
- hover 和 focus 是否正常；
- prefers-reduced-motion 是否有降级；
- JS 失败时主要内容是否仍可见。

4. 性能风险
- 是否存在过多粒子；
- 是否存在无限循环但未清理的动画；
- 是否监听 resize、mousemove 但没有节流；
- 是否可能导致移动端耗电或发热；
- 是否影响首屏加载。

5. 工程检查
- npm run build 是否通过；
- 是否新增了不必要依赖；
- 是否改动了无关页面；
- 是否影响登录、支付、权限、数据库、部署配置或环境变量。

请输出：
- 通过项；
- 阻塞问题；
- 建议优化项；
- 需要降级的效果；
- 下一轮最应该修的 3 个问题；
- 是否可以交付。`
        }
      },
      {
        "heading": "怎么让 Codex 做出酷而不乱的页面",
        "paragraphs": [
          "第一，不要只说“酷炫”。要说清楚是哪一种酷：3D 空间感、滚动叙事、粒子氛围、视觉冲击 Hero，还是细腻微交互。",
          "第二，不要一次要求所有效果。先做 Hero，再做滚动，再做微交互，最后做 QA。每轮只解决一个视觉目标，页面会更稳。",
          "第三，必须写性能和降级要求。真正高级的网页不是一直动，而是在合适的地方动，并且在低性能设备上仍然可读、可点、可访问。"
        ]
      }
    ]
  },
  {
    "id": "codex-design-system-consistency-prompts",
    "sourceUrl": "https://m3.material.io/foundations/design-tokens",
    "translationMode": "guidedTranslation",
    "title": "Codex 设计规范一致性提示词：从 Tokens 到组件治理",
    "originalTitle": "Design systems and design tokens consistency workflows",
    "notice": "本文为 Uicoding.ai 基于公开设计系统资料整理的中文学习笔记，不是原文全文翻译。参考来源包括 Material 设计变量：https://m3.material.io/foundations/design-tokens，Figma 设计系统：https://www.figma.com/design-systems/，W3C Design Tokens Community Group：https://www.w3.org/community/design-tokens/。",
    "sections": [
      {
        "heading": "为什么网站越做越不一致",
        "paragraphs": [
          "很多网站一开始看起来还不错，但页面越多越乱：按钮高度不一样、卡片圆角不一样、标题字号随手写、颜色越来越多、间距没有节奏、移动端每个页面都靠临时修补。",
          "这不是单纯审美问题，而是设计规范没有沉淀成可执行系统。设计系统资料里经常强调 tokens、组件、样式规则和复用模式，本质上都是为了让产品在增长时仍然保持一致。",
          "Codex 适合做这类治理工作，但不能只说“统一一下设计”。需要让它先审计，再收敛 tokens，再统一组件，最后做页面级 QA。下面这组提示词可以直接复制使用。"
        ]
      },
      {
        "heading": "提示词 1：设计系统一致性审计",
        "paragraphs": [
          "第一步不是改代码，而是审计。让 Codex 找出颜色、字号、间距、圆角、阴影、按钮、卡片、表单和页面节奏里的不一致。",
          "这个提示词适合项目已经有多个页面、多个 CSS 文件、多个组件之后使用。"
        ],
        "code": {
          "label": "设计系统一致性审计提示词",
          "content": `请对当前项目做一次设计系统一致性审计。先不要修改代码。

审计目标：
找出项目里颜色、字体、字号、间距、圆角、阴影、按钮、卡片、表单、页面布局和响应式规则的不一致问题。

请重点查看：
- 全局 CSS / tokens / theme 文件；
- 主要页面样式；
- Button、Card、Badge、Nav、Form 等通用组件；
- 首页、列表页、详情页、工具页等代表性页面。

请按以下维度审计：

1. 颜色
- 是否存在很多临时颜色；
- 是否绕过了已有 CSS 变量；
- 文本颜色对比度是否足够；
- 强调色是否使用过多。

2. 字体和排版
- 标题字号是否有层级；
- 正文行高和宽度是否稳定；
- 是否存在页面里随手写的大字号；
- 中文和英文混排是否可读。

3. 间距和布局
- section 间距是否有节奏；
- 卡片内边距是否统一；
- 网格列宽和 gap 是否一致；
- 移动端是否有特殊补丁过多。

4. 圆角、边框和阴影
- 是否有太多不同圆角值；
- 是否有重阴影和边框同时堆叠；
- 卡片、按钮、输入框是否风格一致。

5. 组件
- 按钮是否存在多套高度、颜色、hover；
- 卡片是否存在重复变体；
- 标签、导航、代码块是否视觉一致。

6. 风险
- 哪些样式可以安全收敛；
- 哪些可能影响多个页面；
- 哪些需要先人工确认。

输出要求：
- 只输出审计结果，不要修改文件；
- 按严重程度排序；
- 每条问题说明涉及文件、问题原因和建议修复方式；
- 最后给一个分阶段治理计划。`
        }
      },
      {
        "heading": "提示词 2：收敛设计变量",
        "paragraphs": [
          "设计一致性最核心的是 tokens。颜色、字体、字号、间距、圆角、阴影和容器宽度不要散落在页面里，而应该进入统一变量。",
          "这段提示词适合在审计之后使用，让 Codex 把散乱值收敛到已有 tokens 或新增少量必要 tokens。"
        ],
        "code": {
          "label": "设计变量收敛提示词",
          "content": `请帮我收敛当前项目的设计 tokens，但不要做大规模视觉重设计。

目标：
把项目中重复出现的颜色、字号、间距、圆角、阴影和容器宽度收敛到统一 CSS 变量或设计 token 中。

要求：
1. 优先复用已有 tokens。
2. 只有当现有 tokens 无法表达必要语义时，才新增 token。
3. 新增 token 必须有清晰语义，例如 --color-surface、--color-muted、--radius-card、--space-section。
4. 不要为了追求统一把所有视觉差异抹平。
5. 不要改变品牌主色和已有核心视觉气质。
6. 不要修改无关页面结构。

请先输出：
- 当前已有 tokens 清单；
- 发现的重复硬编码值；
- 建议保留的 tokens；
- 建议新增或重命名的 tokens；
- 预计影响哪些文件。

我确认后再执行修改。

执行时请遵守：
- 小步替换；
- 每次替换都确保视觉语义一致；
- 不要把页面专属样式塞进全局 tokens；
- 不要新增过多变量；
- 运行 npm run build。

完成后请总结：
1. 新增或修改了哪些 tokens；
2. 哪些硬编码值被替换；
3. 哪些地方暂时保留原样；
4. 是否可能影响其它页面。`
        }
      },
      {
        "heading": "提示词 3：统一按钮、卡片和标签组件",
        "paragraphs": [
          "按钮、卡片和标签是最容易暴露不一致的地方。一个网站如果有 5 种按钮高度、6 种卡片圆角、4 种标签样式，很快就会显得像拼出来的。",
          "这段提示词适合统一核心组件，但不要求 Codex 重写所有页面。"
        ],
        "code": {
          "label": "核心组件一致性提示词",
          "content": `请帮我统一当前项目中的核心 UI 组件样式，重点是 Button、Card、Badge / Tag。

目标：
让按钮、卡片和标签在不同页面中保持统一的高度、圆角、间距、颜色、hover 和 focus 状态。

请先审查：
1. Button 组件和所有按钮 class；
2. Card 组件和各种卡片样式；
3. Badge、Tag、Pill 等标签样式；
4. 这些组件在首页、列表页、详情页、工具页中的使用情况。

统一原则：
- 组件应该有少量清晰变体，而不是每个页面随手写一套。
- 变体命名要表达用途，例如 primary、secondary、ghost、compact。
- hover 不能导致布局跳动。
- focus 状态必须可见。
- 移动端按钮文字不能溢出。
- 卡片圆角和内边距要有明确上限，不要过度圆角。
- 标签不要比标题更抢眼。

请先输出：
- 当前存在的组件变体；
- 哪些变体可以合并；
- 哪些变体必须保留；
- 建议统一后的组件规则。

我确认后再修改。

修改限制：
- 不要改页面数据；
- 不要重构路由；
- 不要新增 UI 库；
- 不要改变业务逻辑；
- 不要一次性重写所有 CSS。

完成后运行 npm run build，并告诉我应该重点检查哪些页面和组件状态。`
        }
      },
      {
        "heading": "提示词 4：统一页面节奏和布局规范",
        "paragraphs": [
          "设计一致性不只是组件长得一样，还包括页面节奏：容器宽度、section 间距、标题和正文关系、列表密度、详情页阅读宽度。",
          "这段提示词适合内容站、案例站、学习资料站，能让页面像同一个产品，而不是不同页面拼在一起。"
        ],
        "code": {
          "label": "页面节奏统一提示词",
          "content": `请帮我统一当前项目的页面布局节奏。先审查，不要马上修改。

目标：
让首页、列表页、详情页、工具页在容器宽度、section 间距、标题层级、正文宽度和响应式节奏上保持一致。

请检查：
1. 全局 container 宽度；
2. section 上下间距；
3. H1、H2、H3 的字号、行高和换行；
4. 列表页卡片网格；
5. 详情页正文宽度；
6. 图片和代码块宽度；
7. 移动端边距和断点。

统一原则：
- 内容型页面正文行长控制在适合阅读的范围；
- 页面标题不要过大或过小；
- section 之间要有节奏，不要全部等距；
- 列表页密度要可扫描；
- 详情页要可阅读；
- 移动端不要横向溢出；
- 长标题要自然换行。

请先输出：
- 当前页面节奏不一致的地方；
- 建议统一的布局规则；
- 哪些 CSS 变量或工具 class 可以承担这些规则；
- 建议分几步修改。

确认后再实现。

实现限制：
- 优先改 layout、page-level CSS 和通用 class；
- 不要无关重构组件；
- 不要改内容数据；
- 不要引入新依赖。

完成后运行 npm run build，并列出需要检查的页面和视口。`
        }
      },
      {
        "heading": "提示词 5：清理散乱 CSS 和临时样式",
        "paragraphs": [
          "长期项目里经常会出现一次性 class、重复选择器、页面专属 hack、同一个颜色写十几次。清理这些东西能显著提升一致性。",
          "这个提示词要求 Codex 小步清理，避免它为了“整洁”大规模重构。"
        ],
        "code": {
          "label": "散乱 CSS 清理提示词",
          "content": `请帮我清理当前项目里的散乱 CSS 和临时样式，但必须保持视觉和行为基本不变。

清理目标：
- 重复颜色；
- 重复间距；
- 重复圆角；
- 重复阴影；
- 一次性按钮样式；
- 一次性卡片样式；
- 无用或过时 class；
- 页面里过于具体的 hack。

请先做分析，不要马上修改：
1. 找出重复程度最高的 CSS 规则；
2. 判断哪些可以安全合并；
3. 判断哪些虽然重复但语义不同，暂时不应合并；
4. 列出可能影响多个页面的高风险选择器；
5. 给出最小清理计划。

清理规则：
- 只清理和设计一致性相关的 CSS；
- 不要重写整个样式系统；
- 不要改变页面信息结构；
- 不要删除不确定用途的 class；
- 不要修改业务逻辑；
- 每次合并都要保持视觉含义一致。

验证要求：
- 运行 npm run build；
- 检查受影响页面；
- 特别检查按钮、卡片、代码块、导航和移动端。

完成后请输出：
1. 删除或合并了哪些样式；
2. 哪些重复样式暂时保留；
3. 哪些页面可能受影响；
4. 后续还可以继续清理什么。`
        }
      },
      {
        "heading": "提示词 6：设计一致性 QA",
        "paragraphs": [
          "治理之后要做 QA，不然很容易以为统一了，实际页面上仍然有截断、溢出、按钮不一致、移动端变形。",
          "这段提示词适合每次设计系统治理后运行。"
        ],
        "code": {
          "label": "设计一致性 QA 提示词",
          "content": `请对当前项目做一轮设计一致性 QA。

检查页面：
- 首页；
- 列表页；
- 详情页；
- 工具页；
- 任何最近修改过的页面。

请按以下维度检查：

1. 视觉一致性
- 颜色是否来自统一 tokens；
- 字体和字号层级是否一致；
- 按钮、卡片、标签是否同一套规范；
- 圆角、边框、阴影是否稳定。

2. 排版一致性
- 标题换行是否自然；
- 正文行长是否适合阅读；
- 卡片描述是否截断合理；
- 是否有半行文字或内容被遮挡。

3. 布局一致性
- container 宽度是否一致；
- section 间距是否有节奏；
- 网格和 gap 是否稳定；
- 移动端是否有横向滚动。

4. 交互一致性
- hover 是否一致；
- focus 是否清晰；
- active 状态是否可见；
- 复制按钮、链接、CTA 是否反馈明确。

5. 可访问性
- 正文对比度是否足够；
- 交互元素是否可键盘访问；
- 图片是否有 alt；
- 动效是否支持 reduced motion。

输出格式：
1. 通过项；
2. 不一致问题，按严重程度排序；
3. 建议修复方式；
4. 是否需要继续修改；
5. 如果继续修改，下一轮只建议修哪 3 个问题。

请先只 QA，不要直接修改代码。`
        }
      },
      {
        "heading": "怎么长期保持一致",
        "paragraphs": [
          "提升设计一致性不是一次大扫除，而是一套工作习惯。先把 tokens 定住，再统一高频组件，然后整理页面节奏，最后每次新增页面都跑一遍一致性 QA。",
          "不要追求所有页面完全一样。设计系统的一致性不是把差异消灭，而是让差异有理由：按钮变体有语义，卡片密度有场景，页面节奏有规则。",
          "最适合 Codex 的做法是小步治理：一次只统一一类东西，比如按钮、卡片、间距或详情页正文。每次都 build，每次都检查页面。这样项目会越来越稳，而不是被一次“大统一”改乱。"
        ]
      }
    ]
  },
  {
    "id": "ai-coding-team-collaboration-operating-model",
    "sourceUrl": "https://dora.dev/research/2025/dora-report/",
    "translationMode": "guidedTranslation",
    "title": "AI Coding 团队协作落地方法论：角色分工、产出物和流程",
    "originalTitle": "AI-assisted software development operating model",
    "notice": "本文为 Uicoding.ai 基于多份专业报告和公开资料整理的中文学习笔记，不是原文全文翻译。主要参考：DORA 2025 AI-assisted Software Development Report：https://dora.dev/research/2025/dora-report/，McKinsey 生成式 AI 软件开发生产力研究：https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/unleashing-developer-productivity-with-generative-ai，Faros AI Engineering Productivity Paradox：https://www.faros.ai/reports/ai-engineering-productivity-paradox，Atlassian State of DevEx 2025：https://www.atlassian.com/reports/state-of-developer-experience。",
    "sections": [
      {
        "heading": "先说结论：AI Coding 是组织系统问题，不是工具采购问题",
        "paragraphs": [
          "很多团队引入 Codex、Claude Code、Cursor、GitHub Copilot 后，第一反应是让每个工程师自己试。个人很快会感觉变快：写样板代码更快、补测试更快、查 API 更快、解释代码更快。但团队层面的交付不一定同步变快。",
          "DORA、McKinsey、Faros AI 和 Atlassian 这些报告共同提醒了一件事：AI 对软件交付的影响不是线性的。它会放大已有系统的优点，也会放大已有系统的问题。如果团队本来需求不清、review 慢、环境难跑、测试不稳、知识分散，AI 只会让更多代码更快进入这些瓶颈。",
          "成熟落地的方法不是“所有人都装一个 AI 编程工具”，而是重做协作系统：谁负责把需求变成 Spec，谁负责让 Agent 执行，谁负责 review，谁负责测试和安全，谁负责沉淀提示词 / skill，谁负责看指标和优化流程。"
        ]
      },
      {
        "heading": "成熟团队的六阶段落地模型",
        "paragraphs": [
          "一个可持续的 AI Coding 落地流程，可以拆成六个阶段：战略和治理、用例选择、工作流设计、角色分工、质量门禁、度量和改进。",
          "第一阶段是战略和治理：明确为什么用 AI Coding，是为了缩短交付周期、减少重复劳动、提升测试覆盖，还是改善代码理解和新人 onboarding。这个阶段的产出不是代码，而是团队 AI 使用原则、数据安全边界、允许和禁止的任务类型。",
          "第二阶段是用例选择：不要一上来让 AI 接管所有开发。先选低风险高频任务，例如解释代码、生成测试、修小 Bug、迁移样式、整理文档、生成 PR 摘要。高风险任务，如支付、权限、数据库迁移、生产事故修复，需要更严格的人工审查。",
          "第三阶段是工作流设计：把 AI 放进现有 SDLC，而不是另起炉灶。需求仍然要有 Spec，设计仍然要有验收标准，代码仍然要 review，测试仍然要通过，发布仍然要有回滚方案。AI 只是加速某些环节，不替代质量系统。",
          "第四阶段是角色分工：每个角色都要知道自己什么时候使用 AI，什么时候不要用，产出物是什么，交给下游什么。否则团队会变成每个人各自和 Agent 聊天，最后没有统一上下文。",
          "第五阶段是质量门禁：AI 生成的代码不能因为“看起来能跑”就合并。必须定义测试、lint、build、security scan、review、手动验收、浏览器检查这些门槛。",
          "第六阶段是度量和改进：不要只看生成了多少代码，也不要只看个人感受。要看端到端指标：需求到上线周期、PR 等待时间、review 返工、缺陷逃逸、测试稳定性、部署频率、开发者满意度。"
        ]
      },
      {
        "heading": "角色 1：业务负责人 / Sponsor",
        "paragraphs": [
          "业务负责人不是来挑工具的，而是定义 AI Coding 的业务目标。比如三个月内把小需求交付周期缩短 20%，把测试补齐任务时间减半，或者让新成员理解老代码的时间从两周降到一周。",
          "他需要决定哪些团队先试点，试点成功的标准是什么，哪些风险不能接受。比如客户数据不能进入外部工具，核心支付链路不能由 Agent 独立改动，所有 AI 生成代码必须经过人工 review。",
          "业务负责人还要保护试点团队，不要让 AI Coding 变成额外 KPI 压力。成熟落地不是要求工程师“必须多交付 30%”，而是移除流程阻塞，让团队真实变快。"
        ],
        "code": {
          "label": "Sponsor 产出物清单",
          "content": `业务负责人 / Sponsor 需要产出：

1. AI Coding 北极星目标
- 为什么要引入 AI Coding；
- 希望改善哪个业务或工程指标；
- 试点周期多长；
- 成功和失败如何判断。

2. 使用边界
- 哪些任务允许 AI 参与；
- 哪些任务必须人工主导；
- 哪些数据、代码和客户信息禁止输入 AI 工具；
- 哪些模块属于高风险区。

3. 试点团队选择
- 选择 1 到 2 个有代表性的团队；
- 明确试点范围；
- 给团队预留学习和复盘时间。

4. 投入承诺
- 工具预算；
- 培训时间；
- 安全和法务支持；
- 平台和 DevEx 支持。

5. 复盘机制
- 每两周看一次 adoption 和质量数据；
- 每月决定是否扩大试点；
- 不用“生成代码行数”作为成功指标。`
        }
      },
      {
        "heading": "角色 2：AI Coding 负责人 / Enablement Owner",
        "paragraphs": [
          "AI Coding 负责人是整个落地的产品经理。他不一定是最高级工程师，但要懂研发流程、工具链、培训、知识沉淀和指标。",
          "这个角色负责把零散使用变成组织能力：建立提示词 library、skill library、AGENTS.md 模板、任务边界、培训材料、试点复盘、风险清单、常见问题和最佳实践。",
          "如果没有这个角色，AI Coding 很容易变成个人技巧：某几个高手用得很好，其他人不知道怎么复用，团队也不知道到底哪里变快了。"
        ],
        "code": {
          "label": "AI Coding 负责人产出物",
          "content": `AI Coding 负责人需要产出：

1. AI Coding Playbook
- 团队如何使用 Codex、Claude Code、Cursor；
- 哪些任务适合 Agent；
- 哪些任务需要人工主导；
- 不同工具适合什么场景。

2. 提示词库
- 解释代码提示词；
- 修 Bug 提示词；
- 写测试提示词；
- PR 审查提示词；
- UI 迭代提示词；
- 发布前检查提示词。

3. Skill / Command Library
- summarize-changes；
- fix-issue；
- verify-delivery；
- local-code-review；
- ui-polish-review；
- pr-summary。

4. AGENTS.md / CLAUDE.md 模板
- 项目规则；
- 禁止修改范围；
- 验证命令；
- 代码风格；
- 最终交付格式。

5. 培训和复盘
- 新人 onboarding；
- 每周 AI coding clinic；
- 失败案例复盘；
- 高质量案例沉淀。

6. 指标看板
- 采用率；
- PR cycle time；
- 审查等待时间；
- 缺陷逃逸；
- 返工率；
- 开发者满意度。`
        }
      },
      {
        "heading": "角色 3：产品经理 / PM",
        "paragraphs": [
          "PM 在 AI Coding 流程里最重要的变化，是不能再只写模糊需求。以前一个模糊需求可以靠工程师讨论澄清，现在如果直接交给 Agent，会快速生成错误方向的代码。",
          "PM 的核心产出应该是 AI-ready Spec：用户场景、目标、非目标、验收标准、边界条件、数据来源、埋点需求、上线判断。AI-ready 的意思不是写给机器看的冷冰冰格式，而是让工程师和 Agent 都能准确执行。",
          "PM 还要参与验收。AI 生成速度越快，PM 越需要快速判断结果是否符合真实用户目标，而不是只看界面有没有出现。"
        ],
        "code": {
          "label": "PM 的 AI-ready Spec 模板",
          "content": `# AI-ready Spec

## 背景
- 用户遇到什么问题；
- 为什么现在要做；
- 这个需求和业务目标的关系。

## 用户场景
- 谁在什么情况下使用；
- 用户当前的替代方案是什么；
- 成功体验是什么。

## 目标
- 本次要解决什么；
- 用户最终能看到或做到什么；
- 需要影响哪些指标。

## 非目标
- 本次不做什么；
- 哪些需求以后再做；
- 哪些方向明确不要碰。

## 功能范围
- 页面或入口；
- 用户操作流程；
- 数据展示；
- 状态变化；
- 权限或角色差异。

## 验收标准
1. 正常场景：
2. 空状态：
3. 错误状态：
4. 移动端：
5. 性能或加载：
6. 埋点或数据：

## 约束
- 不修改哪些模块；
- 不接哪些外部服务；
- 不改变哪些现有行为。

## 交付物
- 页面；
- 接口；
- 测试；
- 文档；
- 截图或录屏；
- 发布说明。`
        }
      },
      {
        "heading": "角色 4：设计师 / Designer",
        "paragraphs": [
          "设计师在 AI Coding 团队里不是只交 Figma。设计师要把视觉规范、组件状态、响应式、动效和验收标准说清楚，否则 Agent 会按自己的默认审美补细节。",
          "设计师应该提供 Design Brief、关键截图、组件状态、token 对照、交互说明、移动端规则和设计 QA 清单。对于高保真页面，还应该明确哪些地方必须像，哪些地方可以由工程实现时合理简化。",
          "设计师还应该参与 AI 产物的视觉审查，重点看层级、节奏、文字溢出、状态缺失和设计系统偏离。"
        ],
        "code": {
          "label": "设计师交付物清单",
          "content": `设计师需要交付：

1. Design Brief
- 页面目标；
- 用户情绪；
- 品牌气质；
- 视觉参考；
- 不希望出现的反向参考。

2. Figma / Screenshot Context
- 关键画板；
- 桌面端和移动端；
- 首屏和关键状态；
- 可导出的图片资源；
- 字体和图标来源。

3. Component States
- default；
- hover；
- focus；
- active；
- disabled；
- loading；
- empty；
- error。

4. 设计变量
- 颜色；
- 字号；
- 行高；
- 间距；
- 圆角；
- 阴影；
- 容器宽度。

5. Design QA Checklist
- 标题是否符合层级；
- 卡片是否统一；
- 按钮是否一致；
- 移动端是否可读；
- 是否有文字溢出；
- 动效是否过度；
- 是否符合品牌气质。`
        }
      },
      {
        "heading": "角色 5：技术负责人 / Tech Lead",
        "paragraphs": [
          "Tech Lead 负责把 AI Coding 放进架构边界里。他要定义哪些目录可以让 Agent 改，哪些模块必须人工主导，哪些命令必须运行，哪些代码风格必须遵守。",
          "Tech Lead 还要设计任务拆分方式。不是把一个大需求直接丢给 Agent，而是拆成可验证的小任务：先数据结构，再组件，再样式，再测试，再清理。",
          "他最重要的产出是项目级上下文文件：AGENTS.md、架构说明、目录职责、危险区域、验证命令、review checklist。"
        ],
        "code": {
          "label": "Tech Lead 的项目规则模板",
          "content": `# Project AI Coding Rules

## Project Architecture
- src/pages：页面入口；
- src/components：可复用组件；
- src/data：静态数据；
- src/content：长内容；
- src/styles：全局样式和设计系统；
- public：静态资源。

## Allowed Changes By Task Type

Content task:
- 可以改 data/content/public assets；
- 不要改 layout、auth、routing。

UI task:
- 可以改 page component、shared component、CSS；
- 不要改数据结构和业务逻辑。

Logic task:
- 可以改相关函数和测试；
- 必须补验证；
- 不要同时做 UI 重构。

High-risk modules:
- auth；
- payment；
- permissions；
- database；
- deployment；
- env vars。

## Required Verification
- npm run build；
- npm run test when logic changes；
- npm run lint when linting exists；
- manual browser check for UI changes。

## 审查 Rules
- AI generated code must be reviewed by a human.
- Large diffs should be split.
- Unrelated refactors are rejected.
- Verification results must be included in final summary.`
        }
      },
      {
        "heading": "角色 6：工程师 / Developer",
        "paragraphs": [
          "工程师不是把任务丢给 AI 就结束。成熟团队里，工程师更像 Agent 的导演和 reviewer：提供上下文、约束、检查计划、拆任务、审 diff、跑验证。",
          "工程师要学会把任务分成适合 Agent 的颗粒度。比如“做完整支付系统”不适合直接交给 Agent，但“为 pricing 页面增加一个静态 plan 卡片，并保持现有 Stripe 逻辑不变”就适合。",
          "工程师还要对最终代码负责。AI 生成代码不能成为质量问题的借口。合并之前，工程师必须理解改动。"
        ],
        "code": {
          "label": "Developer 日常工作流",
          "content": `开发者使用 AI Coding 的标准流程：

1. 接收 Spec
- 确认目标；
- 确认非目标；
- 确认验收标准。

2. 拆任务
- 把大需求拆成 30 到 90 分钟可验证小任务；
- 每个任务只涉及有限文件；
- 每个任务都有验证方式。

3. 给 Agent 下任务
- 提供目标；
- 提供上下文；
- 提供允许修改范围；
- 提供禁止修改范围；
- 提供 Done criteria。

4. 审查 Agent 输出
- 看 diff；
- 看是否改了无关文件；
- 看是否符合项目风格；
- 看是否有边界问题。

5. 验证
- 跑 build/test/lint；
- 手动检查页面；
- 修复失败项。

6. 提交
- 写清 PR 摘要；
- 标注 AI 辅助部分；
- 提供验证结果；
- 请求对应 reviewer。`
        }
      },
      {
        "heading": "角色 7：QA / 测试负责人",
        "paragraphs": [
          "AI Coding 会让代码变化更快，QA 的价值反而更高。QA 需要把隐性经验转成可执行验收清单和自动化测试策略。",
          "QA 不只是最后点页面，而是要提前参与 Spec，定义正常流、异常流、空状态、权限边界、回归路径、浏览器和设备覆盖。",
          "成熟团队会把 QA 的清单变成提示词和测试模板，让 Agent 在实现阶段就知道哪些边界不能漏。"
        ],
        "code": {
          "label": "QA 产出物清单",
          "content": `QA 需要产出：

1. Test Strategy
- 哪些功能必须自动化测试；
- 哪些适合手动验收；
- 哪些风险需要回归测试。

2. Acceptance Checklist
- 正常状态；
- 空状态；
- 错误状态；
- 加载状态；
- 权限差异；
- 移动端；
- 浏览器兼容。

3. Regression Suite
- 核心用户路径；
- 关键页面截图；
- 关键 API 响应；
- 过去出现过的 Bug。

4. AI Verification 提示词
- 让 Agent 先列测试计划；
- 让 Agent 补测试；
- 让 Agent 运行验证；
- 让 Agent 总结未覆盖风险。

5. Release Sign-off
- 是否可发布；
- 哪些风险可接受；
- 哪些问题必须阻塞。`
        }
      },
      {
        "heading": "角色 8：安全 / 法务 / 合规",
        "paragraphs": [
          "AI Coding 落地必须有安全边界。团队需要明确什么代码、数据、日志、客户信息、密钥、商业资料不能输入工具，也要明确 AI 生成代码如何审查许可证和安全风险。",
          "安全团队不应该只在最后否决，而应该提供可执行政策：哪些仓库可用、哪些工具可用、哪些模型可用、敏感数据如何脱敏、依赖如何审查、生成代码如何记录。",
          "合规要求越明确，工程师越敢用。模糊的“注意安全”反而会让团队要么不用，要么乱用。"
        ],
        "code": {
          "label": "安全合规产出物",
          "content": `安全 / 法务 / 合规需要产出：

1. AI Tool Policy
- 允许使用的工具；
- 允许使用的代码仓库；
- 禁止输入的数据类型；
- 敏感信息处理规则；
- 日志和审计要求。

2. Data Classification
- Public；
- Internal；
- Confidential；
- Restricted；
- Secret。

3. Secure Coding Checklist
- 输入校验；
- 权限检查；
- 密钥处理；
- SQL / XSS / SSRF 等风险；
- 依赖安全；
- 日志脱敏。

4. AI-generated 代码审查 Rules
- 所有 AI 生成代码必须 review；
- 高风险模块需要安全 reviewer；
- 新依赖必须检查许可证和安全风险；
- 不允许凭 AI 输出修改生产密钥或权限策略。

5. Incident Protocol
- 如果 AI 工具误用了敏感信息怎么办；
- 如果生成代码引入漏洞怎么办；
- 谁负责响应和复盘。`
        }
      },
      {
        "heading": "角色 9：平台 / DevEx / DevOps",
        "paragraphs": [
          "平台团队负责让 AI Coding 在工程环境里顺畅运行。很多团队 AI 效率上不去，不是模型不行，而是本地环境难装、测试慢、CI 不稳、文档过期、仓库结构复杂。",
          "平台团队要把开发环境、验证命令、预览环境、日志、测试、CI 和权限都整理清楚，让 Agent 和人都能快速跑起来。",
          "一个成熟的 AI Coding 团队，通常会有标准 devcontainer、快速 build/test 命令、可靠 preview、清晰错误日志和自动化质量门禁。"
        ],
        "code": {
          "label": "平台团队产出物",
          "content": `平台 / DevEx / DevOps 需要产出：

1. Local Setup
- 一键安装；
- devcontainer 或环境说明；
- 常见错误处理；
- 测试数据准备。

2. Verification Commands
- build；
- test；
- lint；
- typecheck；
- e2e；
- visual regression。

3. CI Quality Gates
- 必跑检查；
- 可选检查；
- 阻塞规则；
- flaky test 处理。

4. Preview 工作流
- 每个 PR 的预览环境；
- 页面链接；
- 日志入口；
- 回滚方式。

5. Agent-friendly Documentation
- 项目结构；
- 常用命令；
- 环境变量说明；
- 禁止修改区域；
- 调试指南。`
        }
      },
      {
        "heading": "端到端协作流程：从需求到上线",
        "paragraphs": [
          "成熟 AI Coding 团队的流程不是“PM 提需求，工程师叫 AI 写代码”。更合理的是一个端到端链路：Intake、Spec、Design、Plan、Implementation、审查、QA、Release、Retro。",
          "Intake 阶段，PM 收集团队讨论、用户反馈和业务目标，判断是否适合 AI 辅助。产出是需求摘要和风险初判。",
          "Spec 阶段，PM 写 AI-ready Spec，设计师补设计上下文，Tech Lead 补技术边界。产出是可执行任务卡。",
          "Plan 阶段，工程师让 Codex 先读代码、提出计划、列文件、列风险。产出是实施计划和验证计划。",
          "Implementation 阶段，Agent 负责小步实现，工程师负责监督和分段审查。产出是 diff、测试、截图或预览链接。",
          "审查阶段，人工 reviewer 看设计、代码、安全、测试和业务验收。产出是 review comments 和修复清单。",
          "QA 阶段，QA 执行回归和边界检查。产出是测试报告和发布建议。",
          "Release 阶段，DevOps 或工程师发布，PM 和 QA 验收。产出是发布说明和回滚方案。",
          "Retro 阶段，AI Coding 负责人复盘哪些提示词、Skill、规则可以沉淀。产出是更新后的 playbook。"
        ],
        "code": {
          "label": "AI Coding 端到端流程",
          "content": `AI Coding Team 工作流

1. Intake
Owner: PM
Input: 用户反馈 / 业务目标 / Slack 讨论
Output: 需求摘要、风险初判、是否适合 AI 辅助

2. Spec
Owner: PM + Designer + Tech Lead
Input: 需求摘要
Output: AI-ready Spec、设计上下文、技术边界

3. Plan
Owner: Developer
Input: Spec + 项目规则
Output: 实施计划、修改文件清单、验证计划

4. Implementation
Owner: Developer + Codex / Claude Code
Input: 实施计划
Output: 代码 diff、测试、截图、预览

5. 审查
Owner: Code Owner + Designer + Security when needed
Input: PR / diff / 验证结果
Output: review comments、修复清单、通过或阻塞结论

6. QA
Owner: QA
Input: 预览环境、验收标准
Output: 测试结果、回归结论、发布建议

7. Release
Owner: DevOps / Developer
Input: 通过的 PR、发布计划
Output: 上线版本、回滚方案、发布说明

8. Retro
Owner: AI Coding Enablement Owner
Input: 本次任务数据、失败点、成功提示词
Output: 更新后的提示词 library、skill library、AGENTS.md、流程改进项`
        }
      },
      {
        "heading": "团队必须维护的 12 个产出物",
        "paragraphs": [
          "如果一个团队想长期使用 AI Coding，不能只靠聊天记录。成熟团队会把关键上下文沉淀成固定产物，让新人、Agent 和 reviewer 都能复用。",
          "这些产物不一定一开始全做，但至少要逐步建立。否则每个任务都要重新解释项目，AI 输出也会越来越不稳定。"
        ],
        "code": {
          "label": "AI Coding 团队产出物清单",
          "content": `团队级产出物：

1. AI Coding Charter
- 为什么使用 AI Coding；
- 目标；
- 边界；
- 风险。

2. Tool Matrix
- Codex 做什么；
- Claude Code 做什么；
- Cursor 做什么；
- GitHub Copilot 做什么；
- 哪些场景不用 AI。

3. Use Case Backlog
- 适合 AI 的任务；
- 风险等级；
- 试点状态；
- 成功案例。

4. 提示词库
- 按任务分类的可复制提示词；
- 每个提示词的适用场景；
- 成功和失败示例。

5. Skill / Command Library
- 可复用工作流；
- 安装位置；
- 调用方式；
- 维护人。

6. AGENTS.md / CLAUDE.md
- 项目规则；
- 验证命令；
- 禁止修改范围；
- 交付格式。

7. AI-ready Spec Template
- PM 和设计师共同使用的需求模板。

8. Design QA Checklist
- 设计师验收 AI 产物的标准。

9. 代码审查 Checklist
- 工程 reviewer 的检查项。

10. Security Policy
- 数据输入边界；
- 高风险模块；
- 审计要求。

11. 指标看板
- 交付周期；
- review 等待；
- rework；
- defect；
- adoption；
- developer satisfaction。

12. Retrospective Log
- 哪些提示词有用；
- 哪些失败；
- 哪些规则需要更新；
- 哪些任务不适合 AI。`
        }
      },
      {
        "heading": "例会和协作节奏",
        "paragraphs": [
          "AI Coding 落地需要轻量但稳定的协作节奏。不要开太多会，但要有固定复盘和知识沉淀。",
          "推荐三个节奏：每周 AI Coding Clinic、每两周试点复盘、每月治理评审。Clinic 解决具体问题，试点复盘看流程和指标，治理评审看安全、工具、预算和扩展。",
          "日常开发里，还可以设置 Agent Task Queue：工程师把适合 AI 的小任务排队，Tech Lead 或 senior engineer 定期 review 输出质量。"
        ],
        "code": {
          "label": "AI Coding 团队节奏",
          "content": `Weekly AI Coding Clinic
Owner: AI Coding Enablement Owner
Participants: Developers, PM, Designer, QA
Agenda:
- 展示 1 个成功案例；
- 复盘 1 个失败案例；
- 更新提示词 / skill；
- 解决工具和流程问题。

Bi-weekly Pilot 审查
Owner: Engineering Manager
Participants: Sponsor, Tech Lead, PM, QA, Security when needed
Agenda:
- 看交付周期和质量指标；
- 看 adoption；
- 看风险和阻塞；
- 决定是否扩大试点。

Monthly Governance 审查
Owner: Sponsor + Security + Platform
Agenda:
- 工具使用情况；
- 成本；
- 安全事件；
- 政策更新；
- 需要新增的训练和平台能力。

Daily Agent Task Queue
Owner: Developer
Usage:
- 把小任务拆成 Agent 可执行项；
- 每个任务都有 Spec、范围和验证；
- 完成后由人 review。`
        }
      },
      {
        "heading": "指标怎么设：不要只看代码行数",
        "paragraphs": [
          "专业报告普遍提醒，不要只用代码行数、生成次数、个人速度来判断 AI Coding 成功。这些指标容易让团队生成更多代码，但不一定交付更多价值。",
          "更好的指标是端到端指标和质量指标：从需求到上线多久，PR 等多久，review 返工几次，缺陷有没有增加，测试是否更稳定，开发者是否更容易进入项目。",
          "DORA 一直强调软件交付性能要看系统；Faros AI 也指出 AI 可能让局部生产率提升，但端到端吞吐未必同步提升。团队要关注瓶颈有没有转移，比如代码写得更快了，但 review 队列更堵了。"
        ],
        "code": {
          "label": "AI Coding 指标体系",
          "content": `不要作为核心指标：
- AI 生成代码行数；
- 使用 AI 的次数；
- 单个工程师主观感觉快了多少；
- 提示词数量；
- commit 数量。

建议跟踪：

1. Flow Metrics
- 需求到上线 Lead Time；
- PR cycle time；
- 审查 wait time；
- 部署频率；
- 任务阻塞时间。

2. Quality Metrics
- escaped defects；
- rollback rate；
- rework rate；
- test pass rate；
- flaky test rate；
- security findings。

3. DevEx Metrics
- 本地环境启动时间；
- build/test 等待时间；
- 新人理解代码时间；
- 工程师满意度；
- 工具使用阻塞。

4. AI-specific Metrics
- 适合 AI 的任务占比；
- AI 输出被接受比例；
- AI 输出需要大改比例；
- 高质量提示词 / skill 复用次数；
- 因 AI 引入的问题数量。

5. Business Metrics
- 功能交付速度；
- 用户反馈处理时间；
- 实验上线速度；
- 关键业务目标改善。`
        }
      },
      {
        "heading": "一套可复制的团队启动计划",
        "paragraphs": [
          "如果团队还没有系统使用 AI Coding，可以按 30 天启动。不要第一天就推广到全公司，先选一个团队、一个仓库、三类低风险任务。",
          "第一周建立边界和模板，第二周开始试点，第三周沉淀提示词和 skill，第四周看指标和决定是否扩大。这个节奏足够轻，也能避免混乱扩散。",
          "最重要的是，AI Coding 的成熟度不是工具安装率，而是团队能否稳定把需求变成高质量交付，并持续复盘改进。"
        ],
        "code": {
          "label": "30 天 AI Coding 试点计划",
          "content": `第 1 周：准备
- 选择试点团队和仓库；
- 明确允许和禁止的任务；
- 建立 AGENTS.md；
- 建立 AI-ready Spec 模板；
- 建立基础提示词 library；
- 定义质量门禁和指标。

第 2 周：低风险试点
- 解释代码；
- 补测试；
- 修小 Bug；
- 整理文档；
- 生成 PR 摘要；
- 每个任务记录输入、输出、验证和问题。

第 3 周：沉淀工作流
- 把成功提示词做成 skill / command；
- 建立 fix-issue、verify-delivery、summarize-changes；
- 更新 review checklist；
- 训练 PM、设计师、QA 如何写 AI-ready 输入。

第 4 周：评估和扩展
- 看 Lead Time、PR cycle time、rework、defect；
- 访谈工程师和 reviewer；
- 找出新的瓶颈；
- 决定继续试点、扩大范围或暂停调整。

试点结束必须产出：
- AI Coding Playbook；
- 提示词库；
- Skill Library；
- AGENTS.md 模板；
- 指标报告；
- 风险和治理建议。`
        }
      },
      {
        "heading": "最后的判断",
        "paragraphs": [
          "团队使用 Codex、Claude Code、Cursor 这类 AI Coding 工具，真正成熟的标志不是“大家都会用”，而是“团队知道什么时候用、谁来用、怎么验收、怎么复盘”。",
          "AI 会让个人更快，但只有当需求、设计、工程、测试、安全、平台和管理都围绕新的工作方式调整时，团队才会真正变快。",
          "最值得先做的不是买更多工具，而是建立一套小而清晰的协作系统：AI-ready Spec、AGENTS.md、提示词库、Skill Library、审查 Checklist、Verification Gates 和 指标看板。有了这些，AI Coding 才会从个人技巧变成团队能力。"
        ]
      }
    ]
  },
  {
    "id": "claude-code-skills-reusable-prompt-workflows",
    "sourceUrl": "https://docs.anthropic.com/en/docs/claude-code/skills",
    "translationMode": "guidedTranslation",
    "title": "Claude Code Skills 官方指南：把一次性提示词沉淀成可复用工作流",
    "originalTitle": "Claude Code Skills",
    "notice": "本文为 Uicoding.ai 基于 Anthropic Claude Code Skills 官方文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://docs.anthropic.com/en/docs/claude-code/skills。",
    "sections": [
      {
        "heading": "为什么要把提示词沉淀成 Skill",
        "paragraphs": [
          "一次性提示词适合临时任务，但真实项目里有很多动作会反复出现：总结当前改动、修复 issue、生成 PR 摘要、做提交前检查、审查 UI 改动。如果每次都重新写一遍，不仅浪费时间，还容易漏掉验证步骤。",
          "Claude Code Skills 的价值，就是把这些高频工作流写进一个固定的 SKILL.md 文件。以后只需要调用对应 Skill，Claude Code 就会按同一套步骤执行。",
          "官方文档里也强调，Skills 可以把任务说明、约束、允许工具和动态上下文组织在一起。旧的 slash commands 仍然可用，但官方更推荐把复杂工作流迁移到 Skills。"
        ]
      },
      {
        "heading": "一个 Skill 最小长什么样",
        "paragraphs": [
          "一个 Skill 通常就是一个文件夹，里面放一个 SKILL.md。文件开头是元数据，下面是具体工作流说明。可以理解为：一份专门写给 Claude Code 的可复用操作手册。",
          "下面这个是最小模板。复制后，把 name、description 和正文替换成项目的工作流即可。"
        ],
        "code": {
          "label": "最小 SKILL.md 模板",
          "content": `---
name: example-skill
description: Use this skill when the user asks Claude Code to perform a reusable project workflow.
---

# Example Skill

Use this skill when the user asks for:
- A repeatable workflow
- A task that should follow the same checklist every time
- A task that needs project-specific rules

## 工作流

1. Read the relevant project files.
2. Identify the smallest safe change.
3. Ask clarifying questions if the task is ambiguous.
4. Make the change.
5. Run the required verification command.
6. Summarize files changed, verification results, and risks.

## Rules

- Keep changes scoped.
- Do not refactor unrelated code.
- Do not modify auth, payment, database, deployment, or environment variables unless explicitly requested.
- If verification fails, explain the failure and fix it before claiming the task is done.`
        }
      },
      {
        "heading": "保存在哪里，怎么调用",
        "paragraphs": [
          "如果是项目专属 Skill，建议放在当前项目的 .claude/skills/ 目录下。这样它跟项目一起走，适合团队共享。如果是个人通用 Skill，可以放在用户级 Claude Code 配置目录里。",
          "调用时通常可以用 slash command 形式，例如 /summarize-changes、/fix-issue、/pr-summary。具体是否立即生效，取决于当前 Claude Code 版本和当前会话是否重新加载了 Skills。"
        ],
        "code": {
          "label": "项目级 Skill 文件结构",
          "content": `.claude/
  skills/
    summarize-changes/
      SKILL.md
    fix-issue/
      SKILL.md
    pr-summary/
      SKILL.md`
        }
      },
      {
        "heading": "Skill 1：summarize-changes，自动总结当前改动",
        "paragraphs": [
          "这个 Skill 适合每次改完代码后使用。它不会继续改代码，只负责查看当前 diff、总结文件变化、验证状态和风险点。",
          "可以把它做成 /summarize-changes，在提交 Git 或发给别人 review 前运行。"
        ],
        "code": {
          "label": "summarize-changes/SKILL.md",
          "content": `---
name: summarize-changes
description: Use this skill when the user asks to summarize local code changes, explain the diff, or prepare a concise handoff after implementation.
---

# Summarize Changes

Use this skill after code has already been modified.

The goal is to explain what changed, why it changed, how it was verified, and what risks remain.

## 工作流

1. Inspect the current git status.
2. Inspect the relevant diff.
3. Identify modified, added, deleted, and renamed files.
4. Group changes by feature area or user-facing behavior.
5. Check whether tests, lint, build, or manual verification were run in this session.
6. Produce a concise Chinese summary.

## Output Format

请用中文输出：

1. 修改文件
- 列出每个被修改、新增或删除的文件。

2. 修改内容
- 每个文件具体改了什么。
- 这些改动解决了什么问题。

3. 验证情况
- 已运行哪些命令。
- 每个命令是否通过。
- 如果没有运行验证，请明确说明。

4. 风险和检查项
- 是否可能影响其它页面或模块。
- 是否涉及登录、支付、权限、数据库、部署配置或环境变量。
- 用户应该重点检查哪些页面、交互或边界情况。

5. 一句话结论
- 当前改动是否可以进入下一步。

## Rules

- Do not modify files.
- Do not stage or commit changes.
- Do not invent verification results.
- If verification was not run, say so plainly.
- Keep the summary concise but specific.`
        }
      },
      {
        "heading": "Skill 2：fix-issue，按固定流程修复 Issue",
        "paragraphs": [
          "这个 Skill 适合把 GitHub issue、产品反馈或用户报错变成可执行修复流程。它要求 Claude Code 先理解 issue，再找代码，再制定计划，最后最小修改和验证。",
          "它的重点是防止 AI 一上来就改代码。复杂 issue 一定要先复现、定位、计划，再实现。"
        ],
        "code": {
          "label": "fix-issue/SKILL.md",
          "content": `---
name: fix-issue
description: Use this skill when the user asks Claude Code to fix a bug, resolve an issue, or implement a narrowly scoped issue from a tracker.
---

# Fix Issue

Use this skill when the user provides an issue, bug report, screenshot, reproduction steps, or failing behavior.

## Inputs To Collect

Before editing, identify:
- The issue title or summary
- The observed behavior
- The expected behavior
- Reproduction steps
- Relevant route, component, API, or command
- Any logs, screenshots, or failing tests

If key information is missing and cannot be inferred from the repo, ask a focused question before editing.

## 工作流

1. Read project rules such as AGENTS.md, CLAUDE.md, README, or package.json.
2. Locate files most likely related to the issue.
3. Explain the suspected root cause.
4. Propose the smallest safe fix.
5. Identify files that should not be touched.
6. Implement only the necessary change.
7. Run the most relevant verification command.
8. If verification fails, debug and fix before finishing.
9. Summarize the fix, verification, and remaining risk.

## Constraints

- Do not refactor unrelated code.
- Do not introduce new dependencies unless clearly necessary.
- Do not change public routes, data schemas, auth, payment, permissions, database, deployment, or environment variables unless the issue explicitly requires it.
- If the fix requires a larger architectural change, stop and explain the tradeoff before continuing.

## Output Format

请用中文输出：

1. 问题复述
- 用一句话说明这个 issue 是什么。

2. 根因判断
- 说明你认为问题出在哪里。

3. 修改内容
- 列出修改文件和每个文件的变化。

4. 验证结果
- 列出运行的命令和结果。
- 如果是 UI 问题，说明应该打开哪个页面检查什么。

5. 风险
- 是否可能影响其它模块。
- 是否有未覆盖的边界情况。

6. 最终结论
- issue 是否已经解决。

## Final Check

Before final response, verify:
- The issue behavior is addressed.
- No unrelated files were changed.
- Verification results are accurate.
- Any unverified assumptions are stated clearly.`
        }
      },
      {
        "heading": "Skill 3：pr-summary，生成 PR 摘要和审查说明",
        "paragraphs": [
          "这个 Skill 适合准备提交 PR 时使用。它会把当前改动整理成 reviewer 容易读的结构：背景、改动、验证、风险、截图或检查方式。",
          "如果团队经常要求 PR 描述清楚，这个模板会很省时间。"
        ],
        "code": {
          "label": "pr-summary/SKILL.md",
          "content": `---
name: pr-summary
description: Use this skill when the user asks to draft a pull request summary, release note, or review handoff from local changes.
---

# PR Summary

Use this skill when code changes are ready to be described for review.

## 工作流

1. Inspect git status and the current diff.
2. Identify the user-facing goal of the change.
3. Group changed files by area.
4. Identify verification commands that were run.
5. Identify screenshots, pages, states, or manual checks the reviewer should inspect.
6. Note any risks, assumptions, or follow-up items.
7. Draft a clear PR summary in Chinese.

## PR Description Template

请生成以下结构：

## 背景

说明这个 PR 要解决什么问题，以及为什么需要这次改动。

## 改动内容

- 列出主要改动点。
- 按页面、组件、数据、样式、测试或文档分组。
- 不要只罗列文件名，要说明行为变化。

## 验证

- 列出已运行命令，例如 npm run build、npm run test、npm run lint。
- 如果有手动检查，说明检查了哪个页面、哪个状态、哪个交互。
- 如果没有运行某些验证，说明原因。

## 风险

- 说明可能影响的页面或模块。
- 特别说明是否涉及登录、支付、权限、数据库、部署配置或环境变量。
- 列出 reviewer 应重点关注的地方。

## 截图或录屏

- 如果是 UI 改动，提醒需要附截图。
- 如果当前没有截图，写“待补充”。

## 审查 Checklist

- [ ] 主要页面表现符合预期
- [ ] 移动端布局可用
- [ ] 无明显无关改动
- [ ] 构建或测试通过
- [ ] 风险点已说明

## Rules

- Do not stage or commit files.
- Do not invent tests that were not run.
- If the diff is too large, summarize by feature area and call out review hotspots.
- Keep the PR description practical for human reviewers.`
        }
      },
      {
        "heading": "Skill 4：verify-change，改完后强制验证",
        "paragraphs": [
          "很多 AI Coding 的问题不是不会写代码，而是写完后没有验证。可以把验证流程单独做成 Skill，每次改完都跑一遍。",
          "这个 Skill 适合前端项目、静态内容站、工具页、学习页、案例页等场景。"
        ],
        "code": {
          "label": "verify-change/SKILL.md",
          "content": `---
name: verify-change
description: Use this skill after implementation to verify build health, user-facing behavior, and risk before handing work back to the user.
---

# Verify Change

Use this skill after files have been modified.

## 工作流

1. Inspect the changed files.
2. Decide the smallest meaningful verification set.
3. Run available automated checks when appropriate.
4. For frontend changes, identify pages and states to inspect manually.
5. Check whether the change could affect unrelated routes, shared components, or data rendering.
6. Report verification results honestly.

## Recommended Verification Choices

For JavaScript or React projects:
- Run npm run build when available.
- Run npm run test if tests exist and the change touches tested logic.
- Run npm run lint if the project uses linting.

For content-only changes:
- Run build.
- Check that new route, title, source link, and code blocks render correctly.

For UI changes:
- Check desktop and mobile layout.
- Check text overflow, image rendering, hover or active states, and empty states.

## Output Format

请用中文输出：

1. 验证命令
- 已运行哪些命令；
- 每个命令是否通过；
- 如果没有运行某个命令，说明原因。

2. 页面检查
- 应打开哪些 URL；
- 每个页面重点看什么。

3. 风险检查
- 是否影响共享组件；
- 是否影响其它页面；
- 是否涉及高风险模块。

4. 结论
- 可以交付；
- 需要继续修复；
- 或需要用户手动验证。

## Rules

- Do not claim verification passed unless it actually ran.
- Do not ignore failed commands.
- If a dev server or browser check is unavailable, say so and give manual verification steps.`
        }
      },
      {
        "heading": "什么时候用 Skill，什么时候只用提示词",
        "paragraphs": [
          "如果某个任务只会做一次，用普通提示词就够了。比如临时解释一段代码、一次性改一段文案、问一个概念问题，没有必要做成 Skill。",
          "如果某个任务会反复出现，而且希望每次都按同样流程执行，就应该做成 Skill。比如 summarize-changes、fix-issue、pr-summary、verify-change、ui-review、release-note 这类任务。",
          "判断标准很简单：只要发现自己第三次复制同一段提示词，就应该考虑把它沉淀成 Skill。这样 Claude Code 不再依赖每次手动补全规则，而是自动按项目约定工作。"
        ]
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
        "content": "如果从来没用过终端，不要担心。终端只是电脑里的一个文字操作窗口：平时我们点按钮打开软件，在终端里则是输入一行文字让电脑做事。Codex CLI 就是在这个文字窗口里运行的 Codex。可以理解为：在项目文件夹旁边打开一个对话窗口，让 Codex 帮助看文件、改文件和检查结果。"
      },
      {
        "heading": "终端在哪里打开",
        "content": "Mac 用户可以打开“终端 Terminal”，Windows 用户通常会用 PowerShell、Windows Terminal 或 VS Code 里的 Terminal。最简单的方式是：如果已经用 VS Code 打开项目，就在 VS Code 顶部菜单找到 Terminal，再选择 New Terminal。这样打开的终端通常就在当前项目附近，更不容易走错文件夹。"
      },
      {
        "heading": "什么是命令",
        "content": "命令就是输入给电脑的一句话。比如 pwd 是“告诉我现在在哪个文件夹”，ls 是“列出当前文件夹里的文件”，cd 是“进入某个文件夹”。不需要背很多命令，只要先理解这几个基础命令，就能开始使用 Codex CLI。",
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
        "content": "打开终端后，先不要马上运行 Codex。可以先输入 pwd 看当前位置，再输入 ls 看当前文件夹里有什么。如果能看到 package.json、src、index.html 之类的文件，通常说明已经在项目目录里了。",
        "code": {
          "label": "位置检查命令",
          "content": "pwd\nls"
        }
      },
      {
        "heading": "如果不在项目目录怎么办",
        "content": "如果 ls 之后看不到项目文件，说明当前还没有进入项目目录。需要用 cd 进入项目文件夹。比如项目在桌面的 web 文件夹里，就输入 cd ~/Desktop/web。这里的 cd 可以理解成“走进这个文件夹”。",
        "code": {
          "label": "进入项目目录示例",
          "content": "cd ~/Desktop/web\npwd\nls"
        }
      },
      {
        "heading": "再启动 Codex CLI",
        "content": "确认位置正确后，再输入 codex 启动 Codex CLI。启动后，可以像聊天一样输入中文任务。第一次不要让它修改代码，先让它解释项目，这样能确认它看到了正确文件。",
        "code": {
          "label": "启动 Codex",
          "content": "codex"
        }
      },
      {
        "heading": "第一次只让它解释项目",
        "content": "新手第一次使用 Codex CLI，最稳的任务不是“帮我做页面”，而是“请解释这个项目”。这一步会让使用者知道项目大概由哪些文件组成，也能让 Codex 先熟悉上下文。",
        "code": {
          "label": "复制到 Codex 输入框",
          "content": "请先阅读当前项目，不要修改任何文件。\n请用非常适合零基础用户的语言解释：\n1. 这个项目是什么；\n2. 主要文件夹和文件分别有什么作用；\n3. 首页或当前页面在哪里；\n4. 如果我要改一段文案，应该先看哪个文件；\n5. 如果我要运行这个项目，通常会用什么命令。"
        }
      },
      {
        "heading": "npm 是什么，不要被吓到",
        "content": "npm 是前端项目常用的工具，可以理解成“安装和运行项目的助手”。npm install 通常用来安装项目需要的依赖，npm run build 通常用来检查项目能不能成功打包。不需要理解所有细节，只要知道：install 是准备材料，build 是检查能不能做成成品。",
        "code": {
          "label": "常见 npm 命令",
          "content": "npm install      # 安装项目需要的依赖\nnpm run build    # 检查项目能不能成功打包"
        }
      },
      {
        "heading": "交互模式是什么",
        "content": "输入 codex 进入后，会进入交互模式。交互模式就像持续聊天：输入一个问题，Codex 回答；确认后，它再继续下一步。新手应该优先使用交互模式，因为可以一步步确认，不容易让 Codex 一次改太多。"
      },
      {
        "heading": "不要一开始就让它改代码",
        "content": "很多新手第一次会直接说“帮我优化网站”。这句话太大了，Codex 可能会改很多文件。更安全的方法是先让它提出计划，不要马上修改。确认计划没问题，再让它执行。",
        "code": {
          "label": "先提计划的提示词",
          "content": "请先不要修改文件。\n我想优化学习资料卡片，但我是零基础用户。\n请先告诉我：\n1. 你需要看哪些文件；\n2. 每个文件大概负责什么；\n3. 你建议最小修改哪几个地方；\n4. 修改后我应该如何检查结果。\n等我确认后再执行。"
        }
      },
      {
        "heading": "再做一个很小的修改",
        "content": "确认计划后，只让 Codex 做一个小改动。比如只改一段文案、只调整一个卡片、只修一个按钮。小任务更容易成功，也更容易理解 Codex 到底做了什么。",
        "code": {
          "label": "小任务提示词",
          "content": "请只做一个小修改：把学习卡片的描述统一限制为两行。\n只允许修改和学习卡片相关的组件或样式文件。\n不要改数据，不要新增页面，不要重构目录，不要新增依赖。\n完成后运行 npm run build，并用中文告诉我改了哪些文件。"
        }
      },
      {
        "heading": "diff 是修改记录，不是考试题",
        "content": "diff 是代码修改前后的对比记录。不需要完全看懂每一行，但可以看出 Codex 改了哪些文件、改动多不多、有没有碰到不该碰的地方。如果不懂，可以直接让 Codex 解释 diff。",
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
        "content": "可以每次都按这个顺序来：打开项目，打开终端，确认位置，启动 Codex，让它解释项目，让它提计划，确认后做小修改，看 diff，运行 build，最后打开浏览器检查页面。这就是最基础但最稳的 AI Coding 工作流。",
        "code": {
          "label": "完整流程提示词",
          "content": "我是零基础用户，请你按非常稳妥的方式协助我：\n1. 先解释当前项目，不要修改文件；\n2. 再提出最小修改计划；\n3. 等我确认后，只做一个小改动；\n4. 修改后运行 npm run build；\n5. 用中文解释修改了什么、为什么这样改、我应该检查哪里。"
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
        "content": "Codex 可以做很多事，但它不能自动知道业务审美、业务目标和边界条件。“帮我优化一下”太宽泛，容易导致它重写结构、改动无关文件，或者只做表面样式。更好的提示词应该说明目标、范围、约束、验收标准和停止条件。"
      },
      {
        "heading": "好任务的六个要素",
        "content": "一个适合交给 Codex 的任务，通常包含六个信息：需要解决什么问题，允许改哪些文件，不能改什么，用户会看到什么变化，完成后如何验证，以及构建成功后是否停止。信息越具体，Codex 越容易稳定执行。"
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
        "content": "如果任务稍微复杂，比如涉及多个页面或多个组件，先让 Codex 只给计划。确认计划后再让它改代码。这样可以减少返工，也能避免它一上来就做大范围修改。",
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
    "title": "Codex 官方最佳实践：从提示词到自动化工作流",
    "originalTitle": "Best practices - Codex",
    "notice": "本文为 UIcoding 基于 OpenAI 官方英文资料整理的中文精读稿，不是原文逐字全文翻译。原文地址已附在正文中，请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "原文地址和适合谁读",
        "blocks": [
          {
            "type": "paragraph",
            "content": "英文原文地址：https://developers.openai.com/codex/learn/best-practices"
          },
          {
            "type": "paragraph",
            "content": "本文官方资料适合两类人：一类是刚开始使用 Codex 的新手，另一类是已经能让 Codex 改代码，但经常遇到“改动太大、上下文说不清、验证不稳定、反复返工”的使用者。它真正讨论的不是某个单一命令，而是如何把 Codex 当成一个可以规划、执行、验证、沉淀经验的 coding agent 来协作。"
          },
          {
            "type": "paragraph",
            "content": "可以把它理解成一套从输入到交付的工作流：先说清楚任务，再让 Codex 规划，再限定修改范围，然后通过构建、测试、预览和人工检查完成验收。等流程稳定后，把项目规则写进 AGENTS.md，把重复流程沉淀成 Skill，把外部系统接入 MCP 或连接器，最后再考虑自动化。"
          }
        ]
      },
      {
        "heading": "先建立正确心智模型",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人第一次用 Codex，会把它当成一个更强的代码补全工具。更合适的心智模型是：Codex 是一个能在项目上下文里工作的工程伙伴。它可以读文件、理解结构、提出计划、修改代码、运行命令、解释 diff，并根据验证结果继续修正。"
          },
          {
            "type": "paragraph",
            "content": "这也意味着，交给 Codex 的不该是一句“帮我优化一下”，而是一份小型任务说明。任务说明越像真实工程协作，Codex 越稳定：目标是什么，为什么要做，允许改哪里，不能碰哪里，成功标准是什么，完成后如何验证。"
          },
          {
            "type": "paragraph",
            "content": "对零基础用户来说，不需要一开始就掌握所有高级能力。先学会三个动作就够了：让 Codex 解释项目，让它先给计划，再让它做一个很小、可验证的修改。这个闭环跑顺后，再扩展到复杂任务。"
          }
        ]
      },
      {
        "heading": "把提示词写成任务说明书",
        "blocks": [
          {
            "type": "paragraph",
            "content": "高质量提示词不一定很长，但一定要包含关键边界。最容易出问题的提示词通常只有目标，没有上下文和验收标准。例如“帮我重构首页”会让 Codex 自己猜什么是重构、首页哪些部分能动、视觉风格是否可以改、构建失败时是否继续修。"
          },
          {
            "type": "paragraph",
            "content": "更稳的写法是给出五类信息：背景、目标、范围、限制、验证。背景让 Codex 知道项目是什么；目标说明用户会看到什么变化；范围说明允许修改哪些文件；限制说明不要引入什么副作用；验证说明做到什么才算结束。"
          },
          {
            "type": "code",
            "label": "任务说明模板",
            "content": "请在当前项目中完成一个小范围修改。\n\n背景：这是一个 React + Vite 前端项目。\n目标：优化学习详情页的来源提示，让用户能清楚看到原文地址。\n允许修改：src/pages/LearnDetailPage.jsx、src/styles.css。\n不要修改：路由、数据结构、其他页面、依赖配置。\n验收标准：页面能显示来源说明和原文链接；移动端不溢出；npm run build 成功。\n在修改前请先简短说明计划。"
          }
        ]
      },
      {
        "heading": "先用 Plan mode，而不是直接开改",
        "blocks": [
          {
            "type": "paragraph",
            "content": "官方最佳实践里很重要的一点，是先讨论计划。复杂任务不要一开始就让 Codex 修改文件，而是先让它读代码、提出方案、列出可能修改的文件和风险。计划确认后，再进入执行。"
          },
          {
            "type": "paragraph",
            "content": "Plan mode 的价值不是拖慢速度，而是让方向提前暴露。比如任务只是调整详情页内容，但 Codex 的计划里出现重构路由、拆分组件库、换 CSS 架构，就能在动手前纠正方向。对真实项目来说，前面多花一分钟，后面少返工半小时。"
          },
          {
            "type": "code",
            "label": "先计划提示词",
            "content": "请先进入计划模式，不要修改文件。\n\n任务：我想优化当前学习详情页。\n请先完成：\n1. 读取相关页面、数据和样式文件。\n2. 判断最小修改范围。\n3. 列出你准备修改的文件。\n4. 说明可能的风险和验证方式。\n\n等我确认后再执行。"
          }
        ]
      },
      {
        "heading": "让 Codex 先提问",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当需求还模糊时，不要假装自己已经想清楚。可以直接让 Codex 先问问题。好的问题会把任务从“感觉上要优化”拉回到可执行层面：目标用户是谁，当前问题是什么，必须保留哪些内容，哪些文件不能动，最后用什么方式验收。"
          },
          {
            "type": "paragraph",
            "content": "这对非工程背景用户尤其有用。不需要一上来就写出完美技术描述，可以先用自然语言讲大概方向，再让 Codex 帮助把它整理成任务边界。"
          },
          {
            "type": "code",
            "label": "澄清问题提示词",
            "content": "我想做这个需求，但还没完全想清楚。\n请先向我提出最多 5 个关键问题，帮助我明确：\n- 用户会看到什么变化\n- 哪些页面或组件相关\n- 哪些内容必须保留\n- 哪些文件不要修改\n- 完成后如何验证\n\n在我回答前，不要修改任何文件。"
          }
        ]
      },
      {
        "heading": "把大任务拆成连续小任务",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 可以处理很大的任务，但新手最稳的方式不是一次性让它完成整站，而是把目标拆成连续的小任务。比如做一个内容站，不要一次说“做完整学习系统”，而是先做列表页，再做详情页，再加来源提示，再加推荐模块，最后再做移动端检查。"
          },
          {
            "type": "paragraph",
            "content": "每个小任务都应该有自己的结束点。结束点可以是构建通过、测试通过、截图检查通过、某个交互能正常点击、某段内容成功显示。没有结束点的任务，很容易越做越大。"
          },
          {
            "type": "code",
            "label": "小任务拆分方式",
            "content": "请把这个需求拆成 3 到 5 个可独立完成的小任务。\n每个小任务请说明：\n1. 目标\n2. 允许修改的文件\n3. 验收方式\n4. 完成后是否应该停止\n\n先只输出拆分结果，不要写代码。"
          }
        ]
      },
      {
        "heading": "把长期规则写进 AGENTS.md",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果某些约束会反复出现，就不要每次都写在提示词里。官方资料强调，可以把项目级规则写进 AGENTS.md。这个文件相当于项目里的协作说明，Codex 在处理代码时会参考它。"
          },
          {
            "type": "paragraph",
            "content": "AGENTS.md 适合写稳定规则，而不是临时任务。例如项目使用什么技术栈，构建命令是什么，哪些目录不能随便动，UI 修改要复用哪些样式文件，完成后必须跑什么检查。临时需求仍然写在当前对话里。"
          },
          {
            "type": "code",
            "label": "AGENTS.md 示例",
            "content": "# Project Rules\n\n- This project uses React, Vite and npm.\n- Keep UI changes consistent with src/styles.css.\n- Do not add backend, database, auth or upload features unless requested.\n- Do not introduce new dependencies without explaining why.\n- Keep each task scoped to the files named in the 提示词 when possible.\n- After code changes, run npm run build and report the result.\n- For visual changes, check desktop and mobile layouts before finishing."
          }
        ]
      },
      {
        "heading": "用配置控制 Codex 的工作方式",
        "blocks": [
          {
            "type": "paragraph",
            "content": "除了 AGENTS.md，Codex 还可以通过配置来调整默认行为。对于普通使用者来说，最重要的不是记住所有配置项，而是理解配置和提示词的区别：提示词适合当前任务，AGENTS.md 适合项目规则，配置适合更底层的默认行为。"
          },
          {
            "type": "paragraph",
            "content": "例如沙盒、审批策略、默认模型、MCP server、命令策略等，更接近工具运行方式；而“这个页面要更有编辑感”“不要改登录页”这种内容，更适合放在当前任务或项目说明里。把不同层级的规则放对位置，Codex 才不会被一堆混杂指令干扰。"
          }
        ]
      },
      {
        "heading": "每轮都要有验证闭环",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 修改完代码后，不应该只看它的文字总结。更可靠的是用项目自己的验证方式检查结果。前端项目至少要跑构建；有测试就跑测试；有页面变化就打开浏览器检查；有长文本就看移动端是否溢出；有图片就确认图片是否加载成功。"
          },
          {
            "type": "paragraph",
            "content": "验证闭环还包括看 diff。diff 能说明 Codex 到底改了哪些文件。即使不完全看懂每一行代码，也至少要判断：文件数量是否合理，是否修改了不相关页面，是否新增了奇怪依赖，是否动了配置或数据结构。"
          },
          {
            "type": "code",
            "label": "验收清单",
            "content": "请完成以下验收：\n1. 运行 npm run build。\n2. 汇报构建是否成功。\n3. 列出修改过的文件。\n4. 确认没有新增无关页面、依赖或功能。\n5. 如果是 UI 修改，请检查桌面和移动端是否有横向溢出、文字重叠、图片加载失败。\n6. 如果发现问题，只修复和本任务直接相关的问题。\n7. 验收通过后停止，不要继续扩展。"
          }
        ]
      },
      {
        "heading": "接入 MCP 和外部上下文",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当任务只发生在代码库里，Codex 读取本地文件就足够了。但真实工作经常需要外部上下文：GitHub issue、设计文档、内部知识库、数据库、浏览器页面、项目管理工具。MCP 和连接器的价值，就是把这些上下文接进来，让 Codex 不必只依赖复制粘贴的信息工作。"
          },
          {
            "type": "paragraph",
            "content": "不过，外部工具越多，越需要明确边界。不要为了“看起来高级”就接一堆工具。先问：这个任务是否真的需要外部数据？Codex 需要读还是需要写？是否涉及隐私和权限？有没有更安全的只读方式？"
          },
          {
            "type": "paragraph",
            "content": "学习阶段可以先从 GitHub、浏览器预览和官方文档这类低风险上下文开始。熟悉审批和验证之后，再接入更敏感的系统。"
          }
        ]
      },
      {
        "heading": "把重复流程沉淀成 Skill",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当同一类任务反复出现，就可以考虑把流程写成 Skill。Skill 不是一段神奇提示词，而是一套可复用的工作说明：什么时候使用，先读什么文件，按什么步骤检查，修改后如何验证。"
          },
          {
            "type": "paragraph",
            "content": "例如这个网站里，学习文章整理、案例详情页补全、前端设计审查、构建后浏览器检查，都可以变成 Skill。这样每次执行时，Codex 不需要重新猜项目的标准，而是按固定流程走。"
          },
          {
            "type": "paragraph",
            "content": "沉淀 Skill 的前提是流程已经稳定。不要把一个还没跑通的临时想法马上写成 Skill。先在真实任务里跑几轮，确认它确实能减少返工，再固化下来。"
          }
        ]
      },
      {
        "heading": "用自动化处理重复检查",
        "blocks": [
          {
            "type": "paragraph",
            "content": "自动化适合那些定期发生、流程清楚、验收方式明确的任务。例如每天检查依赖更新、定期扫描构建失败、每周整理未处理 issue、在 PR 有新反馈后提醒负责人。"
          },
          {
            "type": "paragraph",
            "content": "但自动化不应该过早使用。如果一个任务还没人工跑通，就不要马上自动执行。先把手动流程跑稳定：输入是什么，输出是什么，失败怎么办，哪些动作需要批准。流程清楚后，再让 Codex 定期唤醒或排队执行。"
          },
          {
            "type": "code",
            "label": "自动化前检查",
            "content": "在把这个流程做成自动化之前，请先帮我检查：\n1. 触发频率应该是什么？\n2. 任务需要读取哪些上下文？\n3. 是否需要写文件或提交代码？\n4. 哪些操作必须先让我确认？\n5. 如何判断任务完成或失败？\n6. 失败时应该停止、重试还是提醒我？"
          }
        ]
      },
      {
        "heading": "新手最容易踩的坑",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一个坑，是把任务说得太大。比如“帮我优化网站”“重构这个项目”“做一个完整应用”。这类指令会让 Codex 自己填补太多空白，结果可能改动很大，却不一定符合项目的真实目标。"
          },
          {
            "type": "paragraph",
            "content": "第二个坑，是没有限制修改范围。任务可能只需要改一个页面，但如果没有说明不能改全局样式、路由和依赖，Codex 可能会为了完成目标顺手改更多东西。"
          },
          {
            "type": "paragraph",
            "content": "第三个坑，是没有验收。Codex 说完成了，不等于项目真的可用。构建失败、移动端溢出、图片路径错误、按钮不可点击、内容没有进入正确页面，这些都需要检查。"
          },
          {
            "type": "paragraph",
            "content": "第四个坑，是把所有规则都堆进同一个提示词。更好的方式是分层：当前任务写在提示词，长期项目约束写在 AGENTS.md，稳定重复流程写成 Skill，外部数据通过 MCP 或连接器接入。"
          }
        ]
      },
      {
        "heading": "推荐的新手练习路径",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一步，只读项目。让 Codex 解释项目结构、入口文件、样式文件、运行方式，不要修改任何文件。第二步，让它针对一个很小的需求写计划，例如修改一个来源提示、调整一个按钮文案或补一段静态内容。第三步，确认计划后再让它执行。"
          },
          {
            "type": "paragraph",
            "content": "第四步，看 diff，让 Codex 解释它改了什么。第五步，运行构建。第六步，打开页面检查视觉和交互。第七步，把后续会重复出现的规则写进 AGENTS.md。"
          },
          {
            "type": "paragraph",
            "content": "这套路径看起来慢，但它能帮助建立判断力。AI Coding 的关键不是一次生成多大，而是每一轮都知道自己为什么这样改、改了哪里、怎么证明它真的完成了。"
          }
        ]
      },
      {
        "heading": "这套官方最佳实践的核心结论",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 最值得学习的地方，不是某个单一技巧，而是一整套协作方式：先给清楚上下文，再规划，再小步执行，再验证，再沉淀规则。"
          },
          {
            "type": "paragraph",
            "content": "设计师、产品经理和独立开发者最应该先掌握任务边界和验收方式。不需要变成专业工程师才能使用 Codex，但需要像一个清楚的协作者那样描述目标。"
          },
          {
            "type": "paragraph",
            "content": "真正把 Codex 用好，不是让它一次性做完所有决定，而是让它在清晰规则下持续推进。越是复杂的任务，越要拆小；越是长期的项目，越要沉淀规则；越是自动化，越要先有可靠验证。"
          }
        ]
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
        "content": "官方新手指南建议先准备好 Node.js 和终端环境，然后安装 Claude Code。零基础用户可以把这一步理解为“把 Claude 放进本地电脑开发环境里”。安装完成后，后续操作都在具体项目目录中进行，而不是在任意位置随便运行。",
        "code": {
          "label": "终端命令",
          "content": "npm install -g @anthropic-ai/claude-code\nclaude"
        }
      },
      {
        "heading": "进入项目目录",
        "content": "Claude Code 最重要的上下文来自当前文件夹。应该先进入要修改的项目目录，再启动 Claude。比如项目的网站项目放在桌面上的 my-site 文件夹，就先切换到这个目录。这样 Claude 看到的是真实项目文件，而不是一个空环境。",
        "code": {
          "label": "终端命令",
          "content": "cd ~/Desktop/my-site\nclaude"
        }
      },
      {
        "heading": "第一个任务不要太大",
        "content": "新手最容易犯的错误，是第一次就让 Claude “帮我做一个完整网站”。更稳的方式是从一个很小、可以验证的任务开始，比如改文案、修一个按钮样式、解释某个文件、补一个简单组件。任务越小，结果越容易判断，也更容易理解 Claude 的工作方式。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请先阅读当前项目结构，告诉我这个项目是用什么技术栈搭建的。\n不要修改任何文件。\n请只总结：入口文件、主要页面、样式文件、运行和构建命令。"
        }
      },
      {
        "heading": "先让它读懂，再让它修改",
        "content": "Claude Code 的强项是结合项目上下文工作。第一次修改前，最好先让它读相关文件并复述理解，再让它给出修改计划。这样可以减少它误改无关文件的概率。也能通过它的复述判断：它是否真的理解了页面结构和目标。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请阅读首页相关文件，先不要修改。\n目标：我想让首页案例卡片更清晰。\n请先告诉我：\n1. 首页案例卡片由哪些组件组成；\n2. 样式主要在哪个 CSS 文件里；\n3. 如果只做最小修改，你建议改哪 3 个地方。"
        }
      },
      {
        "heading": "开始一个可验证的小修改",
        "content": "当确认 Claude 的理解没有偏差后，再让它执行修改。注意要限制范围：允许改哪些文件、不要改哪些功能、完成后要运行什么验证命令。对零基础用户来说，这比“帮我优化一下”稳定得多。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请只优化首页案例卡片的视觉细节。\n允许修改：src/components/Cards.jsx、src/styles.css。\n不要修改数据，不要新增页面，不要重构目录。\n要求：图片区域保持 16:9；标题更清晰；描述统一两行；标签视觉弱化；浏览和点赞与“查看案例”形成稳定底栏。\n完成后运行 npm run build，并告诉我构建结果。"
        }
      },
      {
        "heading": "看 diff，而不是只看它说完成了",
        "content": "Claude Code 修改完成后，不要只看它的总结。应该检查它到底改了哪些文件，最好看一下 diff，再打开页面确认视觉结果。如果不懂代码时，也可以让 Claude 用中文解释每个改动的目的。这个习惯能避免“看起来完成了，但改坏别的页面”的问题。",
        "code": {
          "label": "终端命令",
          "content": "git diff\nnpm run build"
        }
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
        "heading": "本文解决什么问题",
        "content": "很多新手装好 Claude Code 后，第一反应是让它“帮我优化项目”。这句话太大，容易让它改很多文件。本文讲解一套更稳的日常工作流：先让 Claude Code 读懂项目，再让它定位问题，最后只做一个小修改并验证结果。"
      },
      {
        "heading": "先理解工作流是什么意思",
        "content": "工作流就是一套固定做事顺序。比如做饭要先准备材料，再下锅，再尝味道。AI Coding 也一样：不要一上来就改代码，而是先读项目、确认目标、提出计划、执行小修改、检查结果。顺序对了，工具才稳定。"
      },
      {
        "heading": "第一步：让 Claude 先读懂项目",
        "content": "可以把这一步理解为“让 Claude 先熟悉现场”。不要让它修改文件，只让它解释项目结构。这样能确认它看到了正确目录，也能顺便学习这个项目是怎么组织的。",
        "code": {
          "label": "复制到 Claude Code 输入框",
          "content": "请先阅读当前项目，不要修改任何文件。\n我是零基础用户，请用中文解释：\n1. 这个项目主要做什么；\n2. 哪些文件是入口文件；\n3. 页面组件通常放在哪里；\n4. 样式文件通常放在哪里；\n5. 如果我要修改当前页面，最应该先看哪些文件。"
        }
      },
      {
        "heading": "第二步：让它帮助找相关文件",
        "content": "新手经常不知道应该改哪个文件。这个时候不要自己乱找，也不要让 Claude 直接改。可以先让它列出和问题相关的文件，并说明每个文件的作用。",
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
        "content": "计划的作用是防止 Claude Code 直接改乱项目。可以要求它说明准备改哪些文件、为什么改、风险是什么。看完计划再决定是否执行。",
        "code": {
          "label": "计划提示词",
          "content": "请先给出修改计划，不要立即修改文件。\n问题：学习详情页顶部信息有点重复。\n请说明：\n1. 你准备修改哪些文件；\n2. 每个文件为什么要改；\n3. 有没有可能影响其他页面；\n4. 修改后如何验证。"
        }
      },
      {
        "heading": "第五步：只执行一个小修改",
        "content": "确认计划后，再让它执行。一次只修一个问题，这样能看清楚修改效果。如果一次修很多问题，即使页面变好了，也很难知道到底是哪一步起作用。"
      },
      {
        "heading": "第六步：看 diff",
        "content": "diff 是代码修改记录。不需要完全懂代码，也可以看出它改了几个文件、改动是否过大。如果它改了和任务无关的文件，就要停下来让它解释。",
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
        "content": "如果 Claude Code 找不到文件，先检查是否在项目根目录启动。若它准备改太多文件，让它重新给最小方案。若 build 失败，把报错完整复制给它，并要求只修构建错误。若页面变丑，不要继续追加大段要求，先让它解释这次 diff，再决定回退还是小修。"
      },
      {
        "heading": "可以反复使用的工作流",
        "content": "以后每次遇到页面问题，都可以按这个顺序来：读懂项目，找相关文件，把问题说小，先给计划，只做一个小修改，看 diff，运行 build，打开浏览器检查。这个流程虽然慢一点，但适合零基础用户建立控制感。"
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
        "heading": "本文解决什么问题",
        "content": "很多新手使用 Claude Code 时，会反复解释同样的事情：这是 React 项目、不要改路由、按钮要复用组件、改完要运行 build。项目越大，重复解释越累。本文讲解理解 Claude Code 的“记忆”概念，并把长期规则沉淀下来。"
      },
      {
        "heading": "先理解什么是记忆",
        "content": "记忆不是让 Claude 永远记住所有聊天内容。更准确地说，它是给 Claude Code 的项目上下文说明。可以理解为放在项目里的“工作说明书”：这个项目是什么、有哪些规则、哪些文件不能乱改、完成后应该怎么验证。"
      },
      {
        "heading": "什么是上下文",
        "content": "上下文就是 Claude 做任务时能参考的信息。比如项目目标、目录结构、技术栈、已有组件、设计规范、构建命令、上一次反馈的问题。上下文越清楚，Claude 越不容易猜错。记忆的作用，就是把一些长期有效的上下文保存下来。"
      },
      {
        "heading": "什么时候需要写项目规则",
        "content": "如果发现自己每次都在重复说“不要新增后端”“不要重构目录”“只改相关文件”“改完运行 npm run build”，就说明这些内容适合写成项目规则。规则不是一次性需求，而是每次任务都应该遵守的约束。"
      },
      {
        "heading": "项目规则应该写什么",
        "content": "项目规则要短、明确、可执行。不要写“请写出高质量代码”这种空话，而要写清楚技术栈、目录约束、组件复用、禁止事项和验证命令。新手可以先从 6 到 10 条规则开始，不要写成很长的文档。"
      },
      {
        "heading": "可以写入的规则示例",
        "content": "下面是适合新手项目的规则示例。它不包含复杂代码，只告诉 Claude Code 做事边界。可以根据自己的项目改掉项目名称和技术栈。",
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
        "content": "可以给 Claude Code 一个小任务，看它是否主动遵守规则。比如让它优化一个卡片，如果它没有新增第二套样式、没有改无关文件、最后运行了 build，说明规则开始发挥作用。"
      },
      {
        "heading": "让 Claude 先复述规则",
        "content": "新手最稳的做法，是每次重要任务开始前，让 Claude Code 先复述它理解到的项目规则。检查复述是否准确，再让它修改文件。",
        "code": {
          "label": "规则确认提示词",
          "content": "请先不要修改文件。\n请阅读当前项目规则，并用中文复述：\n1. 这个项目的技术栈；\n2. 哪些事情不能做；\n3. 组件和 CSS 应该如何复用；\n4. 修改后应该如何验证。\n等我确认后，再继续执行任务。"
        }
      },
      {
        "heading": "常见问题",
        "content": "如果 Claude 仍然乱改，通常是规则太抽象或任务太大。先把规则改得更具体，再把任务拆小。如果规则太长，Claude 可能抓不住重点。优先保留最重要的 6 到 10 条。如果不确定当前 Claude Code 版本使用哪种记忆文件或机制，优先查看官方 Memory 文档。"
      },
      {
        "heading": "新手可以怎么练习",
        "content": "找一个小项目，先写 6 条项目规则。然后让 Claude Code 只改一个按钮或一段文案。修改前让它复述规则，修改后检查 diff 和 build。这样能很快感受到：规则不是形式主义，而是在帮助减少 AI 乱改。"
      },
      {
        "heading": "最后记住这个原则",
        "content": "Claude Code 的记忆不是为了替人做决定，而是为了减少重复沟通。长期规则写进项目记忆，当次需求写进提示词，修改后用 diff 和 build 验证。这个分工清楚后，AI Coding 会稳定很多。"
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
        "heading": "本文重点学什么",
        "content": "本文适合把 Codex CLI 当成第一个 AI Coding 工具来学习。重点不是记住所有命令，而是理解三个基础能力：在本地项目中启动 Codex、让它读取和修改文件、通过审批和验证控制风险。对零基础用户来说，先建立这个工作闭环，比追求复杂技巧更重要。"
      },
      {
        "heading": "先理解审批模式",
        "content": "Codex CLI 的一个关键点是审批模式。新手不要一开始就让工具自动修改所有内容，更稳的方式是先使用默认或受限模式，让它提出修改建议、展示 diff，再由确认执行。这样可以避免因为任务描述不清导致项目结构被大幅重写。",
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
        "content": "只给截图不够，因为截图只能表达视觉，不能说明业务目标、交互状态和技术限制。比如一张工作台截图，AI 不知道需要做真实数据、静态页面还是视觉复刻。最好同时写清楚页面用途、技术栈、允许修改的文件和最终验收标准。",
        "code": {
          "label": "图片输入配套提示词",
          "content": "请参考我提供的截图，做一个静态前端页面。\n目标用户：设计师和产品经理。\n技术栈：React + Vite + 普通 CSS。\n要求：只做前端，不做后端、登录、数据库和上传。\n请先描述页面结构，再生成代码。\n完成后运行 npm run build。"
        }
      },
      {
        "heading": "生成页面后要检查什么",
        "content": "图片生成页面后，不要只看第一眼像不像。需要检查：移动端是否溢出，文字是否可读，按钮是否能点击，图片比例是否正确，是否新增了不必要依赖，构建是否成功。如果是学习项目，还要让 Codex 解释每个组件的作用。"
      },
      {
        "heading": "新手练习建议",
        "content": "第一次练习可以选一个很小的页面：一个登录弹窗、一张案例卡片、一个工具卡片或一个 Hero 区域。不要一开始就让 Codex 根据截图做完整应用。先练小页面，会更快理解提示词、文件修改和验证流程。"
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
        "content": "任务交代就是告诉 Codex：需要解决什么问题、它可以看哪些文件、可以改哪些文件、不能改什么、完成后怎么验证。它不是一句命令，而是一份小型工作说明书。"
      },
      {
        "heading": "为什么边界比灵感更重要",
        "content": "Codex 很擅长执行清楚的工程任务，但它不会自动知道项目规则。如果不写边界，它可能会新增依赖、重构目录或改动无关页面。清楚的边界能让它像团队成员一样按规则工作。"
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
        "content": "复杂任务开始前，可以让 Codex 先复述它的理解。只要检查它是否遗漏关键约束，就能提前发现风险。确认无误后再让它修改文件。"
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
        "content": "新手不要直接让 Agent 改代码。第一步应该让它找出相关文件，比如页面组件、数据文件、样式文件。这样会知道项目结构，也能判断它有没有找错地方。",
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
        "content": "diff 是修改前后的差异。即使不完全懂代码，也可以看出它改了哪些文件、改动是否过大。新手要养成习惯：AI 修改后先看 diff，再看页面。"
      }
    ]
  },
  {
    "id": "cursor-rules-project-standards",
    "sourceUrl": "https://docs.cursor.com/context/rules",
    "translationMode": "guidedTranslation",
    "title": "Cursor Rules 项目规范：让 AI 按既定方式写代码",
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
        "content": "Claude Code 是命令行里的 Coding Agent。它能在项目目录中读取文件、修改代码、执行命令。对零基础用户来说，它像一个会操作终端的协作者，但仍然需要给它边界和验收标准。"
      },
      {
        "heading": "先建立上下文",
        "content": "上下文就是 Claude Code 需要知道的信息：项目目标、相关文件、技术栈、不能改的内容、希望看到的结果。上下文越清楚，它越不容易做无关修改。"
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
    "id": "effective-context-engineering-ai-agents",
    "sourceUrl": "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    "translationMode": "guidedTranslation",
    "title": "AI Agent 上下文工程：让 Coding Agent 真正落地",
    "originalTitle": "Effective context engineering for AI agents",
    "notice": "本文为 UIcoding 基于 Anthropic 工程文章整理的中文学习稿，不是原文逐字全文翻译。为便于学习，保留原文结构与核心内容顺序，并附上原文地址。",
    "sections": [
      {
        "heading": "Effective context engineering for AI agents",
        "blocks": [
          {
            "type": "paragraph",
            "content": "英文原文地址：https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
          },
          {
            "type": "paragraph",
            "content": "本文讨论的是：当我们开始构建真正可用的 AI Agent 时，重点不再只是写一个漂亮的提示词，而是持续管理 Agent 能看到、能调用、能记住、能反馈的信息。Anthropic 把这种能力称为 context engineering，也就是上下文工程。"
          },
          {
            "type": "paragraph",
            "content": "对 AI Coding 来说，这个概念很关键。Codex、Claude Code 或其他 coding agent 的表现，往往不是由一句提示词决定，而是由完整上下文决定：项目目标、相关文件、代码约束、工具权限、历史决策、测试结果、错误日志、用户反馈，以及 Agent 自己在执行过程中收集到的新信息。"
          },
          {
            "type": "paragraph",
            "content": "如果只把 Agent 当成“会写代码的聊天框”，会不断遇到跑偏、忘记约束、改动过大、验证不足的问题。上下文工程的目标，是让 Agent 在每一步都看到正确的信息，并能随着任务推进不断调整这些信息。"
          }
        ]
      },
      {
        "heading": "Context engineering vs. 提示词 engineering",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章首先区分了提示词 engineering 和 context engineering。提示词 engineering 更像是在单次输入里写清楚指令，让模型按照预期输出。它仍然重要，但对复杂 Agent 来说远远不够。"
          },
          {
            "type": "paragraph",
            "content": "Context engineering 关注的是整个系统给模型提供了什么上下文。这里的上下文不只是用户输入的一句话，还包括系统提示词、工具说明、检索结果、文件内容、对话历史、外部状态、工作记忆和执行反馈。"
          },
          {
            "type": "paragraph",
            "content": "用 AI Coding 的例子理解：提示词 engineering 是告诉 Codex“修复这个 bug”；context engineering 是让它看到 bug 复现步骤、相关文件、测试命令、项目规则、历史修改原因，以及哪些文件不能动。前者是请求，后者是工作环境。"
          }
        ],
        "image": "/learn-images/context-engineering-prompt-vs-context.png",
        "imageAlt": "原文配图：提示词 engineering 与 context engineering 的对比"
      },
      {
        "heading": "Why context engineering is important to building capable agents",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章接着解释，为什么上下文工程对强 Agent 很重要。Agent 的任务通常不是一次问答，而是多步骤、多工具、多轮反馈的过程。它可能需要先判断目标，再搜索信息，再调用工具，再根据结果更新计划。"
          },
          {
            "type": "paragraph",
            "content": "如果上下文组织不好，Agent 很容易出现三类问题：第一，缺少关键信息，于是只能猜；第二，看到太多无关信息，注意力被稀释；第三，任务推进后没有更新上下文，导致后续行动基于过期理解。"
          },
          {
            "type": "paragraph",
            "content": "这也是很多 AI Coding 失败的原因。用户以为模型“不够聪明”，但实际问题可能是 Agent 没看到正确文件、没拿到构建错误、没理解项目规范，或者没有把上一轮反馈纳入下一轮修改。"
          },
          {
            "type": "paragraph",
            "content": "一个可用的 coding agent，不只是能生成代码，还要能在正确上下文里判断下一步。上下文越贴近真实任务，Agent 的行动越像工程协作；上下文越混乱，它越像在猜谜。"
          }
        ]
      },
      {
        "heading": "The anatomy of effective context",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章把有效上下文拆成几个组成部分。第一是指令，也就是 Agent 应该遵守的目标、身份、边界和输出方式。对 AI Coding 来说，这可以对应任务提示词、AGENTS.md、项目规则或系统级工作流。"
          },
          {
            "type": "paragraph",
            "content": "第二是知识，也就是 Agent 执行任务需要理解的材料。它可能来自代码库、文档、issue、设计稿、数据库、日志或浏览器页面。关键不是把所有信息都塞进去，而是让 Agent 在正确时间拿到正确信息。"
          },
          {
            "type": "paragraph",
            "content": "第三是工具。Agent 不只是阅读上下文，还会通过工具改变上下文：搜索、读取文件、运行测试、打开浏览器、调用 API、生成文件。工具说明本身也必须清楚，否则 Agent 可能不知道什么时候该用哪个工具。"
          },
          {
            "type": "paragraph",
            "content": "第四是反馈。每次工具调用结果、测试失败、用户纠正、页面截图、报错堆栈，都会改变 Agent 后续判断。一个好的 Agent 系统会把这些反馈重新放回上下文，而不是让模型忘记刚刚发生了什么。"
          },
          {
            "type": "paragraph",
            "content": "原文还强调，系统提示词需要持续校准。不是写一次就结束，而是根据 Agent 的真实表现不断调整：哪里容易误解，哪里权限过大，哪里输出格式不稳定，哪里需要补充边界。"
          }
        ],
        "image": "/learn-images/context-engineering-system-prompt.png",
        "imageAlt": "原文配图：在上下文工程中校准系统提示词"
      },
      {
        "heading": "Context retrieval and agentic search",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当任务变复杂后，所有上下文不可能一开始就全部塞进模型。文章提出的重要方向是 context retrieval 和 agentic search，也就是让 Agent 在需要时主动寻找相关上下文。"
          },
          {
            "type": "paragraph",
            "content": "传统检索更像用户输入关键词，系统返回一批结果。Agentic search 则更进一步：Agent 会根据当前任务决定要搜什么、在哪里搜、如何判断结果是否有用，并把结果整合进下一步推理。"
          },
          {
            "type": "paragraph",
            "content": "放到代码场景里，这意味着 Agent 不应该只读被点名的一个文件。它应该能根据错误信息追踪调用链，根据组件名查找样式文件，根据测试失败定位相关实现，根据文档链接确认 API 用法。"
          },
          {
            "type": "paragraph",
            "content": "但这并不等于让 Agent 无限搜索。更好的做法是给它明确的检索边界：优先读哪些目录，哪些文件是权威来源，哪些外部网站可信，搜索到什么程度应该停下来，什么时候需要向用户确认。"
          }
        ]
      },
      {
        "heading": "Context engineering for long-horizon tasks",
        "blocks": [
          {
            "type": "paragraph",
            "content": "长任务是上下文工程最容易暴露问题的地方。一个只需要两分钟完成的小任务，即使上下文不完美也可能成功；但一个需要几十分钟、多轮修改、多次验证的任务，如果没有上下文管理，很快就会跑偏。"
          },
          {
            "type": "paragraph",
            "content": "长任务里，Agent 需要记住已经做过什么、为什么这样做、哪些方案被否定、当前阻塞点是什么、下一步要验证什么。否则它可能重复搜索、重复修改、忘记用户约束，甚至把已经解决的问题又改坏。"
          },
          {
            "type": "paragraph",
            "content": "对 Codex 或 Claude Code 的实际使用来说，可以把长任务拆成多个上下文检查点：先理解项目，再制定计划，再修改小范围代码，再运行构建，再根据结果继续。每个阶段都应该产生可审查的输出，让用户能及时纠偏。"
          },
          {
            "type": "paragraph",
            "content": "文章的核心启发是：长任务不是靠更长的提示词解决，而是靠持续更新上下文解决。好的 Agent 工作流应该像真实工程协作一样，有阶段、有反馈、有记录、有验收。"
          }
        ]
      },
      {
        "heading": "Conclusion",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章最后的结论可以概括为：构建强 Agent 的关键，是为模型提供正确上下文，而不是只追求更强的单次提示词。上下文工程会决定 Agent 是否能持续理解任务、调用工具、吸收反馈并完成长周期目标。"
          },
          {
            "type": "paragraph",
            "content": "对 AI Coding 学习者来说，本文最值得带走的不是某个具体模板，而是一种工作方式：把需求、代码、规则、工具、记忆、反馈和验证组织成一个闭环。这样 Agent 才能从“帮助写一段代码”升级为“协助推进一个真实项目”。"
          },
          {
            "type": "paragraph",
            "content": "如果正在用 Codex 或 Claude Code，可以先从最小动作开始实践：每次任务前说明目标和边界，每次任务中让 Agent 主动找相关上下文，每次任务后把构建结果、截图反馈和人工判断继续喂回下一轮。"
          }
        ]
      },
      {
        "heading": "Acknowledgements",
        "blocks": [
          {
            "type": "paragraph",
            "content": "原文最后感谢了参与讨论和反馈的相关人员。对读者来说，这也提醒我们：Agent 工作流不是单人闭门写提示词，而是需要在真实项目、真实反馈和团队经验中不断打磨。"
          }
        ]
      }
    ]
  },
  {
    "id": "codex-cli-first-days-terminal-workflow",
    "sourceUrl": "https://amanhimself.dev/blog/first-few-days-with-codex-cli/",
    "translationMode": "guidedTranslation",
    "title": "Codex CLI 初体验：把 AI Agent 放进终端工作流",
    "originalTitle": "First few days with Codex CLI",
    "notice": "本文为 UIcoding 基于 Aman Mittal 英文文章整理的中文学习稿，不是原文逐字全文翻译。原文配图已保存到本地并用于辅助理解，请访问原文查看完整上下文。",
    "sections": [
      {
        "heading": "原文地址与本文的重点",
        "blocks": [
          {
            "type": "paragraph",
            "content": "英文原文地址：https://amanhimself.dev/blog/first-few-days-with-codex-cli/"
          },
          {
            "type": "paragraph",
            "content": "本文适合把 Codex CLI 当成“终端里的本地 AI Agent”来理解。作者最初长期使用 Cursor 写代码，但在处理 Obsidian 笔记时遇到一个问题：如果所有笔记本来就是本地 Markdown 文件，为什么还要把它们搬进另一个编辑器里，才能让 AI 帮忙整理？"
          },
          {
            "type": "paragraph",
            "content": "Codex CLI 的价值就在这里：它运行在终端中，天然可以进入某个目录，读取那里的文件，按照项目的规则修改、整理或生成内容。换句话说，它不只是写代码，也可以帮助处理任何以文件形式存在的工作流。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-01.webp",
        "imageAlt": "原文截图：Codex CLI 初体验"
      },
      {
        "heading": "Codex CLI 是什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex CLI 是 OpenAI 的本地 coding agent，运行在终端里。可以用自然语言和它对话，让它读取文件、修改文件、运行命令，并通过 MCP 连接本机上的外部工具。"
          },
          {
            "type": "paragraph",
            "content": "原文里最重要的洞察是：终端本来就能访问本地电脑上的文件。像 Obsidian 这样的工具，本质上把笔记保存在本地 Markdown 文件里。只要进入对应目录，Codex CLI 就能直接处理这些笔记，不需要额外插件，也不一定需要把整个笔记库塞进某个代码编辑器。"
          },
          {
            "type": "paragraph",
            "content": "这也是 AI Coding 工具的一个延展方向：不只帮助写代码，而是帮助处理本地文件系统里的真实工作。代码、笔记、会议记录、任务清单、文章草稿，都可以变成 Agent 能理解和整理的材料。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-02.webp",
        "imageAlt": "原文截图：Codex CLI 运行在终端中"
      },
      {
        "heading": "为什么我反而喜欢 CLI 这种方式",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人会觉得命令行比漂亮的聊天窗口落后，但作者反而喜欢 CLI 方式。原因是 Codex 会生成和使用普通 Markdown 文件，例如 AGENTS.md 和 SKILL.md。这些文件可以直接放在项目或笔记目录里，成为长期可维护的上下文。"
          },
          {
            "type": "paragraph",
            "content": "这和普通聊天工具最大的区别是：上下文不只是留在某个对话窗口里，而是变成了项目的一部分。可以把写作风格、目录规则、输出格式、禁止事项写进 AGENTS.md，让 Codex 每次进入这个目录时都知道该怎么工作。"
          },
          {
            "type": "paragraph",
            "content": "对于长期项目来说，这比反复复制粘贴聊天记录更稳定。尤其是在多个文件夹、多个工作流并行时，每个目录都可以拥有自己的规则。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-03.webp",
        "imageAlt": "原文截图：AGENTS.md 和终端工作流"
      },
      {
        "heading": "如何快速安装 Codex CLI",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者使用 npm 全局包安装 Codex CLI。这个方式需要先安装 Node.js，因为 Node.js 可以运行像 Codex CLI、Claude Code 这类命令行工具。"
          },
          {
            "type": "paragraph",
            "content": "零基础用户可以先把这一步理解成：终端需要一个运行环境，Codex CLI 通过 npm 安装到本地电脑上。安装完成后，就能在任意项目目录或笔记目录中启动它。"
          },
          {
            "type": "code",
            "label": "安装 Codex CLI",
            "content": "npm install -g @openai/codex"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-04.webp",
        "imageAlt": "原文截图：安装 Codex CLI"
      },
      {
        "heading": "第一次会话：几个常用命令",
        "blocks": [
          {
            "type": "paragraph",
            "content": "安装后，第一步是确认命令是否可用。原文建议运行版本检查命令，如果能看到类似 codex-cli 0.77.0 的输出，就说明安装成功。"
          },
          {
            "type": "paragraph",
            "content": "进入 Codex 之后，可以直接用自然语言描述任务。新手第一次不要急着让它大改项目，可以先让它解释当前目录、读取某个文件，或者帮助总结一份笔记。"
          },
          {
            "type": "code",
            "label": "检查版本并启动",
            "content": "codex --version\ncodex"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-05.webp",
        "imageAlt": "原文截图：Codex CLI 版本和第一次会话"
      },
      {
        "heading": "继续上一次 Codex 会话",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果退出了 Codex，但后来发现任务还没做完，可以通过 session ID 恢复上一次会话。退出时，Codex 会显示一个 session ID，复制它再运行 resume 命令即可。"
          },
          {
            "type": "paragraph",
            "content": "这个能力对长任务很重要。比如整理一个 Obsidian 笔记库、同步 Linear 任务，或者让 Codex 多轮修改一篇文章，恢复会话能让上下文更连续。"
          },
          {
            "type": "code",
            "label": "恢复会话",
            "content": "codex resume <SESSION_ID>\ncodex resume --last"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-06.webp",
        "imageAlt": "原文截图：恢复 Codex CLI 会话"
      },
      {
        "heading": "几个实用的 Codex 命令",
        "blocks": [
          {
            "type": "paragraph",
            "content": "在 Codex 会话里输入斜杠，可以看到可用的系统命令。比如 /status 可以查看当前会话配置和 token 使用情况，/init 可以初始化项目规则，/approval 可以调整当前目录的审批模式。"
          },
          {
            "type": "paragraph",
            "content": "这些命令看起来像小功能，但对长期使用很重要。需要知道 Codex 当前处于什么权限、是否能执行命令、是否能改文件，以及它正在消耗多少上下文。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-07.webp",
        "imageAlt": "原文截图：Codex CLI 斜杠菜单命令"
      },
      {
        "heading": "示例：把 Codex 当作编辑器使用",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者把 Codex 用在 Obsidian vault 里，而不是只在代码仓库里使用。不同目录需要不同规则，所以他先运行 /init 生成 AGENTS.md，再写入自己的写作偏好、编辑风格和注意事项。"
          },
          {
            "type": "paragraph",
            "content": "Codex 支持用 @filename 的方式引用当前目录里的具体文件。这样可以让它只读某一篇草稿、某个会议记录或某个索引文件，而不是让它扫描整个笔记库。"
          },
          {
            "type": "paragraph",
            "content": "这个例子对 AI Coding 也有启发：不要把 AGENTS.md 当成只给代码项目用的东西。只要一个目录里有固定工作方式，就可以为这个目录写规则。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-08.webp",
        "imageAlt": "原文截图：用 Codex 编辑 Obsidian 笔记"
      },
      {
        "heading": "用 Codex 管理笔记，并在 Obsidian 中生成摘要",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者把工作会议笔记都放在 Obsidian 的 work-meetings 目录里。年底时，他希望生成一个 index.md，把 2025 年的所有会议笔记链接起来。"
          },
          {
            "type": "paragraph",
            "content": "他直接让 Codex 创建索引文件，并链接所有会议笔记。几十秒后，一个格式正确、链接可用的 index 文件就生成了。这个任务不是写代码，但适合终端 Agent：读取文件列表，理解命名，生成 Markdown。"
          },
          {
            "type": "code",
            "label": "Obsidian 索引任务示例",
            "content": "Create an index.md file for all the meetings I had in 2025 and link to those meeting notes."
          }
        ],
        "image": "/learn-images/codex-cli-first-days-09.webp",
        "imageAlt": "原文截图：Codex 为 Obsidian 生成会议索引"
      },
      {
        "heading": "示例：从 Linear 同步任务到 Obsidian",
        "blocks": [
          {
            "type": "paragraph",
            "content": "接下来作者想把 Linear 里的 Todo 任务同步到 Obsidian，这样就不用反复打开 Linear 网站查看任务。这个场景比本地文件整理更进一步：Codex 不仅要写 Markdown，还要从网页或外部工具拿到任务信息。"
          },
          {
            "type": "paragraph",
            "content": "这个需求引出了后面的 MCP 和浏览器控制能力。纯终端里的 Codex 能操作本地文件，但如果要读取浏览器里的 Linear 页面，就需要额外工具把浏览器上下文接进来。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-10.webp",
        "imageAlt": "原文截图：从 Linear 同步任务到 Obsidian"
      },
      {
        "heading": "使用 Codex CLI Agent",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex CLI 不只是一个问答工具，它可以作为 Agent 执行动作。作者举了一个很简单的例子：让 Codex 打开 amanhimself.dev。这个任务会调用系统默认浏览器。"
          },
          {
            "type": "paragraph",
            "content": "如果自然语言指令不能执行，需要检查当前项目目录的 approval 模式。原文提到可以通过 /approval 选择 Agent 相关权限。这里的关键是：Codex 能做事，但必须清楚它当前被允许做什么。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-11.webp",
        "imageAlt": "原文截图：Codex CLI 作为 Agent 打开网站"
      },
      {
        "heading": "继续使用 Codex CLI Agent",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者随后让 Codex 打开网站、搜索文章标题、再打开对应链接。这个流程部分成功了，但也暴露出限制：Codex CLI 本身并不能像人一样稳定点击网页。"
          },
          {
            "type": "paragraph",
            "content": "这个限制很真实。很多 Agent 看起来能“控制浏览器”，但如果没有合适的浏览器工具，它只能做很有限的动作。要让 Codex 更可靠地处理网页，就需要 MCP server。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-12.webp",
        "imageAlt": "原文截图：Codex CLI 操作网站搜索流程"
      },
      {
        "heading": "什么是模型上下文协议（MCP）",
        "blocks": [
          {
            "type": "paragraph",
            "content": "MCP 是一种让 AI 模型连接外部工具的开放标准。可以把它理解成通用适配器：通过 MCP，Codex 可以和浏览器、Figma、文档站点、内部工具等系统交互。"
          },
          {
            "type": "paragraph",
            "content": "在这个案例里，MCP 的作用是让 Codex 更可靠地访问浏览器页面。它不再只是终端里的文本助手，而是能通过工具看到和操作网页上下文。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-13.gif",
        "imageAlt": "原文动图：Codex CLI 与浏览器交互示例"
      },
      {
        "heading": "配置 Playwright MCP",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者使用 Microsoft 的 Playwright MCP。它提供一个 MCP server，让 Codex CLI 可以和网页交互。Codex CLI 支持连接 MCP server，所以添加 Playwright MCP 只需要一条命令。"
          },
          {
            "type": "code",
            "label": "添加 Playwright MCP",
            "content": "codex mcp add playwright npx \"@playwright/mcp@latest\" --extension\ncodex mcp list"
          },
          {
            "type": "paragraph",
            "content": "配置完成后，可以用 mcp list 检查是否添加成功。对新手来说，重点不是背命令，而是理解：MCP 是把 Codex 能力扩展到外部工具的桥。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-14.webp",
        "imageAlt": "原文截图：配置 Playwright MCP"
      },
      {
        "heading": "安装 Playwright MCP Bridge 浏览器扩展",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Playwright MCP Bridge 是 Chrome 和 Edge 的扩展。它可以让 AI Agent 使用已有浏览器 profile。这样访问 Linear、内部系统或需要登录的网站时，不必重新登录。"
          },
          {
            "type": "paragraph",
            "content": "这一步需要手动安装扩展。安装后，浏览器扩展列表里会出现 Playwright MCP Bridge。对真实工作流来说，这是很关键的一步，因为很多工具都依赖登录态。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-15.gif",
        "imageAlt": "原文动图：安装 Playwright MCP Bridge 扩展"
      },
      {
        "heading": "把 Linear 任务同步到 Obsidian 工作流",
        "blocks": [
          {
            "type": "paragraph",
            "content": "配置好 MCP 和浏览器扩展后，作者测试把 Linear todo 拉到 Obsidian。Codex 打开 Linear 分配给自己的任务页面，读取任务信息，再写入 Obsidian vault 中指定文件。"
          },
          {
            "type": "paragraph",
            "content": "这个流程很像真实办公自动化：从一个网页工具读取任务，再同步到本地笔记。关键是需要告诉 Codex 输出文件放在哪里，以及要保存成什么格式。"
          },
          {
            "type": "code",
            "label": "Linear 到 Obsidian 任务示例",
            "content": "Open https://linear.app/expo/my-issues/assigned\n\nSync my Todo tasks into my Obsidian vault as a checklist."
          }
        ],
        "image": "/learn-images/codex-cli-first-days-16.gif",
        "imageAlt": "原文动图：同步 Linear 任务到 Obsidian"
      },
      {
        "heading": "用 Skills 把工作流变成可复用能力",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最后一步是把这个流程变成可复用 Skill。Skill 本质上是一组说明、资源和可选脚本，放在一个目录里，通过 SKILL.md 描述什么时候使用、按什么步骤执行。"
          },
          {
            "type": "paragraph",
            "content": "如果每次都要让 Codex 打开 Linear、读取 Todo、写入 Obsidian，那就不应该每次重新写提示词。把流程固化成 Skill 后，Codex 就能按固定步骤执行，减少遗漏和返工。"
          },
          {
            "type": "paragraph",
            "content": "这也是 Codex CLI 最有价值的方向之一：把零散的一次性提示，变成可维护的工作流资产。AGENTS.md 解决目录规则，SKILL.md 解决某类任务的固定流程。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-17.webp",
        "imageAlt": "原文截图：把工作流沉淀成 Skill"
      },
      {
        "heading": "总结",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者最后的结论是：Codex CLI 代表一种他期待已久的 AI 使用方式，让 AI 在文件本来所在的位置工作，而不是强迫所有内容都经过聊天窗口或代码编辑器。"
          },
          {
            "type": "paragraph",
            "content": "本文展示的工作流只是起点。一旦理解 Skills，就可以把许多重复流程自动化：读取文件、修改文件、创建文件、同步外部任务、整理笔记、生成索引。"
          },
          {
            "type": "paragraph",
            "content": "对 AI Coding 学习者来说，本文最重要的启发是：2025 年的 Agent 不只是用来做 toy apps，而是开始进入日常工作流。Codex CLI 的价值，正是在那些无聊、重复、但每天消耗时间的任务里体现出来。"
          }
        ],
        "image": "/learn-images/codex-cli-first-days-22.webp",
        "imageAlt": "原文截图：Codex CLI 工作流总结"
      }
    ]
  },
  {
    "id": "claude-code-best-practices-agentic-coding",
    "sourceUrl": "https://www.anthropic.com/engineering/claude-code-best-practices",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 官方最佳实践：让 Agentic Coding 真正落地",
    "originalTitle": "Best practices for Claude Code",
    "notice": "本文为 UIcoding 基于 Anthropic 官方英文资料整理的中文学习稿，不是原文逐字全文翻译。原文页面主要为文档内容，没有适合正文导入的配图；请访问原始来源查看完整上下文。",
    "sections": [
      {
        "heading": "原文地址与阅读重点",
        "blocks": [
          {
            "type": "paragraph",
            "content": "英文原文地址：https://www.anthropic.com/engineering/claude-code-best-practices"
          },
          {
            "type": "paragraph",
            "content": "本文官方资料不是单纯教授几个命令，而是在讲怎样把 Claude Code 用成一个可靠的 coding agent。它覆盖了验证、计划、上下文、项目记忆、权限、CLI 工具、MCP、Hooks、Skills、子代理、会话管理和自动化等完整工作流。"
          },
          {
            "type": "paragraph",
            "content": "已经会让 Claude Code 改代码，但经常遇到“它没看对文件、改动太大、忘记约束、验证不完整、长任务跑偏”，本文很值得系统读一遍。它真正要解决的是：如何让 AI 编程从一次性对话，变成可重复、可验证、可扩展的工程协作流程。"
          }
        ]
      },
      {
        "heading": "先给 Claude 一个验证自己工作的方式",
        "blocks": [
          {
            "type": "paragraph",
            "content": "官方首先强调的是验证。Claude Code 不应该只负责“写出一段代码”，它还需要知道怎样判断这段代码是否正确。对真实项目来说，验证可以是测试、类型检查、lint、构建命令、页面预览、截图检查，或者某个业务流程的人工验收步骤。"
          },
          {
            "type": "paragraph",
            "content": "这点很重要，因为没有验证标准时，Agent 很容易在看似完成后停下。它可能改了文件，但没有运行构建；可能修了一个报错，却引入另一个页面问题；可能完成了主路径，却忽略边界状态。"
          },
          {
            "type": "code",
            "label": "把验证写进任务里",
            "content": "请修改这个页面，并在完成后运行：\n1. npm run build\n2. 检查页面是否有横向溢出\n3. 确认移动端标题不换行错乱\n\n如果验证失败，请先说明失败原因，再继续修复。"
          }
        ]
      },
      {
        "heading": "先探索，再计划，最后写代码",
        "blocks": [
          {
            "type": "paragraph",
            "content": "官方建议不要一上来就让 Claude 直接改代码。更稳的流程是：先让它探索代码库，理解相关文件和约束；然后让它提出计划；方向确认之后，再让它执行。"
          },
          {
            "type": "paragraph",
            "content": "这和真实工程协作很像。一个靠谱的工程师接到需求后，也不会马上开始改，而是先看现有实现、确认依赖关系、判断影响范围。Claude Code 也一样，尤其是当任务涉及多个文件、组件或业务逻辑时，先探索可以显著减少返工。"
          },
          {
            "type": "code",
            "label": "先探索再计划",
            "content": "请先不要修改文件。\n\n任务：优化学习详情页的文章阅读体验。\n请先做三件事：\n1. 找出这个页面相关的组件、数据和样式文件。\n2. 总结当前渲染流程。\n3. 给出最小修改计划。\n\n等我确认后再执行。"
          }
        ]
      },
      {
        "heading": "提示词要给具体上下文",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Claude Code 很依赖上下文。不能只说“优化一下”，而要告诉它为什么优化、面向谁、允许改哪里、不能碰哪里、完成后怎样验收。越具体，Agent 越不容易自由发挥。"
          },
          {
            "type": "paragraph",
            "content": "上下文不只是一段文字，也可以是文件名、报错信息、截图反馈、产品目标、设计规则、代码片段、测试命令和用户流程。对 AI Coding 来说，最重要的是把“任务边界”和“成功标准”讲清楚。"
          },
          {
            "type": "code",
            "label": "上下文充足的提示词",
            "content": "这是一个面向零基础用户的 AI Coding 学习站。\n当前任务只优化 /learn 页面卡片排版。\n允许修改：LearningCard、LearnPage、styles.css。\n不要修改：数据结构、路由、详情页正文内容。\n验收标准：无图文章也能排版自然；有真实配图的文章保留图片；npm run build 通过。"
          }
        ]
      },
      {
        "heading": "配置环境，让 Agent 更接近真实开发者",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Claude Code 的效果不仅取决于模型，也取决于运行环境。它需要知道项目如何安装依赖、如何启动、如何测试、如何构建、哪些命令是安全的、哪些目录不该动。"
          },
          {
            "type": "paragraph",
            "content": "如果这些信息没有写清楚，Agent 就会猜。比如它可能用错包管理器，可能不知道项目端口，可能不知道测试命令，或者在不该运行的目录里执行命令。把环境规则明确下来，是减少低级错误的第一步。"
          },
          {
            "type": "paragraph",
            "content": "对团队项目来说，可以把这些约定放进项目文档；对 Claude Code 来说，更直接的方式是写进 CLAUDE.md，让 Agent 每次进入项目时都能读取。"
          }
        ]
      },
      {
        "heading": "写好 CLAUDE.md，沉淀项目记忆",
        "blocks": [
          {
            "type": "paragraph",
            "content": "CLAUDE.md 类似写给 Claude Code 的项目说明书。它可以记录项目结构、常用命令、代码规范、测试方式、设计原则、禁止事项和特殊注意点。"
          },
          {
            "type": "paragraph",
            "content": "这类文件的价值是长期记忆。不需要每次都重新告诉 Claude“不要乱改路由”“不要碰支付逻辑”“样式要复用 tokens”“构建命令是 npm run build”。把稳定规则写进去，后续任务就更容易保持一致。"
          },
          {
            "type": "code",
            "label": "CLAUDE.md 可以写什么",
            "content": "# Project Rules\n\n- Use npm for this project.\n- Run npm run build after code changes.\n- Do not change routing unless explicitly requested.\n- Keep UI changes small and consistent with existing styles.\n- Do not modify payment, auth, database, or deployment logic during UI tasks."
          }
        ]
      },
      {
        "heading": "配置权限，避免 Agent 做过头",
        "blocks": [
          {
            "type": "paragraph",
            "content": "权限配置决定 Claude 能不能读文件、改文件、执行命令、访问工具。官方把权限作为最佳实践的一部分，是因为真实项目里“能做”和“应该做”不是一回事。"
          },
          {
            "type": "paragraph",
            "content": "在小练习项目里，可以给 Agent 更高自由度；在生产项目、支付系统、数据库迁移或大规模重构里，就应该更谨慎。审批、沙盒和权限边界能让使用者在效率和安全之间取得平衡。"
          },
          {
            "type": "paragraph",
            "content": "一个实用原则是：UI 和文案类任务可以相对放宽；涉及账号、支付、积分、数据库、部署和安全配置时，要单独开任务，并让 Agent 先说明影响范围。"
          }
        ]
      },
      {
        "heading": "善用 CLI 工具和 MCP",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Claude Code 不应该只靠模型脑补。它可以通过 CLI 工具查看文件、搜索代码、运行测试、读取日志；也可以通过 MCP 连接外部系统，比如浏览器、文档、设计工具、项目管理工具或内部服务。"
          },
          {
            "type": "paragraph",
            "content": "MCP 的价值在于扩展上下文和行动能力。比如当任务需要查看网页、操作浏览器、读取设计稿、同步任务系统时，单纯终端里的文本上下文就不够了。MCP 能让 Agent 通过受控工具拿到更真实的信息。"
          },
          {
            "type": "paragraph",
            "content": "但工具越多，越需要规则。需要告诉 Agent 什么时候该用搜索，什么时候该读文档，什么时候该跑测试，什么时候应该停下来向人确认，而不是无限制地探索。"
          }
        ]
      },
      {
        "heading": "用 Hooks、Skills 和子代理扩展工作流",
        "blocks": [
          {
            "type": "paragraph",
            "content": "官方提到的 Hooks、Skills 和 custom subagents，代表了 Agentic Coding 的进阶方向：把一次性的人工提示，逐步沉淀成可复用流程。"
          },
          {
            "type": "paragraph",
            "content": "Hooks 适合在特定时机自动执行动作，例如修改后运行格式化或验证；Skills 适合封装某类任务的方法，例如固定的发布检查、设计审查、文档整理；子代理适合把调查、审查、搜索这类工作拆给专门角色。"
          },
          {
            "type": "paragraph",
            "content": "对个人开发者来说，不必一开始就全部配置。可以先从一个高频流程开始，比如“每次改 UI 后自动构建并检查截图”，等这个流程稳定后，再把它沉淀成 Skill。"
          }
        ]
      },
      {
        "heading": "沟通方式会直接影响代码质量",
        "blocks": [
          {
            "type": "paragraph",
            "content": "和 Claude Code 沟通时，要尽量早纠偏。不要等它做完一大堆改动才说方向不对。看到计划不合适、读错文件、改动范围变大，就立刻打断并修正。"
          },
          {
            "type": "paragraph",
            "content": "官方也强调让 Claude 反过来提问。很多需求一开始并不清楚，与其让 Agent 猜，不如让它先问三五个关键问题：目标用户是谁、边界在哪里、是否要兼容旧行为、完成后怎么验收。"
          },
          {
            "type": "paragraph",
            "content": "这也是 AI Coding 和传统写提示词的区别。不是一次性把完美需求写出来，而是在一个协作过程中持续校准方向。"
          }
        ]
      },
      {
        "heading": "长会话要主动管理上下文",
        "blocks": [
          {
            "type": "paragraph",
            "content": "长任务最容易出问题的地方，是上下文变得又长又乱。Claude 可能记得很多历史细节，但不一定都和当前任务有关。上下文太杂时，它会重复搜索、忘记最新约束，或者把旧目标带进新任务。"
          },
          {
            "type": "paragraph",
            "content": "更好的做法是阶段性总结：当前已经完成什么，哪些文件被改过，验证结果如何，还有哪些问题没有解决。必要时可以恢复会话、回到检查点，或者让一个子代理只负责调查，不直接修改代码。"
          },
          {
            "type": "paragraph",
            "content": "对日常使用来说，一句简单的“请先总结当前状态，再继续下一步”就很有用。它能帮助 Agent 重新整理任务边界，也方便判断它有没有跑偏。"
          }
        ]
      },
      {
        "heading": "把自动化用在合适的位置",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当流程稳定后，可以让 Claude Code 做更多自动化工作，例如非交互模式、多个会话并行、跨文件批量处理、自动模式、或者加入对抗性审查步骤。"
          },
          {
            "type": "paragraph",
            "content": "但自动化的前提是流程已经清楚。如果任务本身还不稳定，过早自动化只会把错误放大。比如还没确定代码规范，就批量重构；还没确定验收标准，就让 Agent 自动改几十个文件。"
          },
          {
            "type": "paragraph",
            "content": "一个稳妥路径是：先人工跑通一次，再让 Claude 按同样步骤重复执行，最后才把流程写进脚本、Hook、Skill 或自动任务里。"
          }
        ]
      },
      {
        "heading": "避免常见失败模式",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Claude Code 常见失败模式包括：没理解任务就直接改、上下文不足就猜、改动范围过大、没有验证、长会话里忘记约束、权限过宽导致误操作、工具太多导致探索失控。"
          },
          {
            "type": "paragraph",
            "content": "解决这些问题的方法并不神秘：先探索再计划，提示词写清边界，CLAUDE.md 沉淀规则，权限按任务收紧，验证命令写进验收标准，长任务定期总结，关键业务逻辑单独保护。"
          },
          {
            "type": "paragraph",
            "content": "当开始能预判 Claude 在什么情况下会犯错，就说明 Agentic Coding 直觉正在形成。这个直觉比记住某个提示词模板更重要。"
          }
        ]
      },
      {
        "heading": "总结：把 Claude Code 当成工程协作者",
        "blocks": [
          {
            "type": "paragraph",
            "content": "本文官方最佳实践的核心可以概括为一句话：不要把 Claude Code 当成一个“自动写代码按钮”，而要把它当成一个需要上下文、工具、规则、反馈和验证的工程协作者。"
          },
          {
            "type": "paragraph",
            "content": "真正有效的工作流通常是这样的：先给上下文，要求它探索；再让它计划；确认后小步修改；修改后运行验证；失败就带着错误继续修；稳定后把规则写进 CLAUDE.md，把重复流程沉淀成 Skills 或自动化。"
          },
          {
            "type": "paragraph",
            "content": "对零基础用户来说，先不用追求复杂配置。只要记住三点就够了：任务要小，边界要清楚，验证要具体。做到这三点，Claude Code 的稳定性会明显提升。"
          }
        ]
      }
    ]
  },
  {
    "id": "context-engineering-coding-agents",
    "sourceUrl": "https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html",
    "translationMode": "guidedTranslation",
    "title": "Coding Agent 的上下文工程：让 AI 看见正确的信息",
    "originalTitle": "Context engineering for AI 编程智能体",
    "notice": "本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。",
    "sections": [
      {
        "heading": "先理解上下文",
        "content": "上下文就是 AI 做任务时能看到和理解的信息。它不只是一句提示词，还包括项目文件、需求目标、已有规则、报错信息、截图反馈、构建结果以及人工对输出的评价。"
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
        "content": "截图、报错、构建失败信息、用户反馈，都是上下文。比如反馈“卡片太挤、标签太重、图片有黑边”，AI 下一轮就能更准确地修改。不要只说“不好看”，要描述具体问题。"
      }
    ]
  },
  {
    "id": "copyable-prompts-for-stunning-ai-websites",
    "sourceUrl": "https://developers.openai.com/showcase",
    "translationMode": "guidedTranslation",
    "title": "5 个带可复制提示词的酷炫网页案例：照着还原首页",
    "originalTitle": "Copyable prompts for stunning AI websites",
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附官网链接，以及适合直接拿去还原网页的中文提示词。",
    "sections": [
      {
        "heading": "先怎么用本文",
        "blocks": [
          {
            "type": "paragraph",
            "content": "本文不是单纯列链接，而是把 5 个首页视觉足够惊艳的 AI 生成网站整理成一套可练习素材。建议先选一个案例，只还原首页第一屏和主视觉；做出气质之后，再补动效、滚动和响应式。"
          },
          {
            "type": "paragraph",
            "content": "每个案例下面我都放了两个可直接复制的提示词。第一个负责把结构和画面气质先搭准，第二个负责补视觉、交互和收尾。可以直接丢给 Codex，也可以按自己的技术栈稍作改写。"
          },
          {
            "type": "code",
            "label": "通用使用方法",
            "content": "使用方式建议：\n1. 先打开案例官网，观察首屏结构、字体、主视觉、按钮位置和滚动节奏。\n2. 先复制提示词 1，让 Codex 只把首页骨架和视觉方向做出来。\n3. 构建成功后，再复制提示词 2，补动画、质感和响应式。\n4. 每一轮都要求它运行 npm run build，并在成功后停止。\n5. 如果页面开始变成普通 SaaS 模板，就提醒它：不要卡片堆叠、不要默认功能区块、不要模板化卖点布局。"
          }
        ]
      },
      {
        "heading": "案例 1：Forged in Silence",
        "image": "/case-screenshots/forged-in-silence-home.png",
        "imageAlt": "Forged in Silence 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是一个适合练 3D 品牌首页气质的案例。它不是传统电商站那种信息密集的首屏，而是用极少文案、强主视觉、滚动叙事和沉浸式光影，先把品牌氛围打进用户脑子里。"
          },
          {
            "type": "paragraph",
            "content": "值得重点观察的地方有三个：黑金配色怎么保持高级而不俗、主视觉 3D 物体怎么和滚动叙事绑定、以及首页如何在“内容很少”的情况下依然成立。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://katana-3d-5mdo.vercel.app"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先搭首屏骨架",
            "content": "请创建一个 React + Vite 单页网页，还原一个高质感武士刀品牌首页，视觉气质参考 Forged in Silence。\n\n目标：\n- 第一屏就建立强烈的品牌压迫感\n- 页面像奢侈品视觉官网，不像普通 SaaS 模板\n- 以黑色、冷白、金属灰和少量暗金为主\n\n页面要求：\n1. 顶部导航极简，左侧品牌名，右侧少量菜单和一个克制的 CTA。\n2. 首屏中央使用超大标题，文案极少，允许上下分层排版。\n3. 背景必须很深，保留微弱纹理或空气感，不要彩色渐变。\n4. 首屏中心放一个悬浮的主视觉对象占位，后续可替换为 3D 武士刀或高质感金属物件。\n5. 页面整体保留大量留白，不要做功能卡片宫格。\n6. 向下滚动前，首屏必须完整、克制、沉浸。\n\n技术要求：\n- React\n- Vite\n- 普通 CSS\n- 先不要引入 UI 组件库\n- 代码结构清晰，样式集中\n\n完成后运行 npm run build，构建成功后停止。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补 3D 气质和滚动叙事",
            "content": "继续完善当前页面，把它推进到接近 Forged in Silence 的沉浸式品牌首页效果。\n\n本轮目标：\n- 增加 scroll-driven 叙事感\n- 强化主视觉物件的存在感\n- 让页面更像 cinematic 着陆页\n\n请实现：\n1. 使用 Three.js 或 React Three Fiber 做一个高质感金属主视觉，可先用程序化几何体模拟，不依赖外部 3D 模型也可以。\n2. 首屏到第二屏之间建立滚动联动：主视觉有轻微旋转、位移、镜头推进或光影变化。\n3. 补充 3 到 5 个章节，每个章节只有少量文字，让内容像视觉旁白，不要写成卖点卡片。\n4. 加入更克制的细节效果，例如微粒、暗角、金属反光、极轻的扫描质感，但不要过度炫技。\n5. 移动端保持首屏张力，标题允许换行，但不要破坏中心构图。\n6. 不要引入夸张 hover，不要把后续内容做成普通电商组件堆叠。\n\n最后运行 npm run build；如果构建成功，就停止并总结修改了哪些文件。"
          }
        ]
      },
      {
        "heading": "案例 2：Watchmaker 着陆页",
        "image": "/case-screenshots/watchmaker-home.png",
        "imageAlt": "Watchmaker 着陆页网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例适合练“高奢品牌官网”的克制感。它最迷人的地方不是特效很多，而是版式、留白、数字章节、精密部件展示和高端商品叙事做得很稳。"
          },
          {
            "type": "paragraph",
            "content": "经常把高端官网做成重营销模板，这个案例很值得反复拆。重点不只是手表图本身，而是标题、序号、图文错位、视差和章节节奏怎么一起工作。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-landing-page-examples.vercel.app/haute-horlogerie"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做高奢首屏和章节结构",
            "content": "请创建一个 React + Vite 品牌官网首页，主题是一家高端制表品牌，视觉方向参考 Watchmaker 着陆页。\n\n要求：\n- 首屏气质必须高端、克制、精密\n- 不要做成普通产品营销页\n- 排版以大留白、细字体、章节数字和高质量产品图为核心\n\n页面结构：\n1. 极简导航，品牌名左侧，菜单极少。\n2. Hero 区域使用非常大的标题和少量说明文案。\n3. 首屏右侧或中央放精密腕表主视觉，图像要有收藏品质感。\n4. 下方分成多个章节，每个章节像一本奢侈品画册中的段落。\n5. 使用编号章节标题，例如 01、02、03，但样式要克制。\n6. 全站避免默认卡片列表、避免功能卖点图标区。\n\n风格要求：\n- 象牙白、暖灰、深黑、金属银、少量金色点缀\n- 字体优雅，有呼吸感\n- 边框和阴影很轻\n\n完成后运行 npm run build，成功后停止。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补视差、图文错位和精密质感",
            "content": "继续完善这个高端制表品牌首页，让视觉更接近 Watchmaker 着陆页。\n\n请重点增强：\n1. 主视觉腕表或零件图的分层感，可以做 exploded view、部件悬浮或轻微 parallax。\n2. 文本章节与图片之间使用错位布局，让页面更像编辑型叙事，不要整齐排成模板区块。\n3. 加入细微滚动过渡：文字淡入、部件慢速移动、章节切换时的节奏变化。\n4. 调整标题和段落的字重、字号、行距，让画面更像 luxury editorial site。\n5. CTA 数量保持极少，避免强销售感。\n6. 移动端优先保证构图稳定和阅读节奏，不要为了响应式把页面压成普通竖排模块。\n\n不要新增复杂功能，不要引入沉重组件库。最后运行 npm run build。"
          }
        ]
      },
      {
        "heading": "案例 3：Arcade Bar 着陆页",
        "image": "/case-screenshots/arcade-bar-home.png",
        "imageAlt": "Arcade Bar 着陆页网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "想要练一个风格很鲜明、又不至于失控的娱乐型首页，这个案例很好用。它把霓虹、暗色背景、活动感和游戏厅气氛结合得很直接，但整体信息还是清楚的。"
          },
          {
            "type": "paragraph",
            "content": "它特别适合用来练“强风格首页怎么避免做脏”。因为这种题材一不小心就会变成俗艳夜店风，而这个案例更像一个经过设计控制的品牌活动页。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做霓虹娱乐场所首页",
            "content": "请创建一个 React + Vite 单页着陆页，主题是一家霓虹风格的街机与弹珠酒吧，视觉参考 Arcade Bar 着陆页。\n\n目标：\n- 一眼看出是夜间娱乐场所\n- 页面有很强的品牌气氛，但结构依然清楚\n- 不要做成普通餐厅官网模板\n\n页面要求：\n1. Hero 使用大标题、霓虹风主视觉和一个主要 CTA。\n2. 背景以深色为主，加入紫红、蓝青、橙色等霓虹点缀，但要控制层次。\n3. 首页往下包含活动、饮品、小食、游戏项目、到店信息等模块。\n4. 模块可以有海报感，但不要全部做成同尺寸卡片宫格。\n5. 标题字体和装饰细节需要有 arcade vibe。\n6. 页面第一屏必须足够抓人，像一家真实会想去的潮流场地。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 不做后端\n- 构图优先，不要先堆功能组件\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补霓虹细节和版式控制",
            "content": "继续打磨这个街机酒吧首页，让它更接近 Arcade Bar 着陆页的完成度。\n\n请增强：\n1. 霓虹招牌感的排版和边缘发光，但发光范围要可控，不要糊成一片。\n2. 不同区块之间建立节奏变化，例如海报区、菜单区、活动区、游戏区可以有不同构图。\n3. 为 CTA、分隔线、图像边框和标签加入街机视觉语言，但保持信息可读。\n4. 为首屏和关键区块加入轻微 hover 或滚动反馈，让页面更有现场感。\n5. 检查配色，避免整页只剩一种紫蓝；要有暖色作为点亮点。\n6. 移动端保持强风格，不要退化成普通白底列表页。\n\n最后运行 npm run build，构建成功后停止。"
          }
        ]
      },
      {
        "heading": "案例 4：Neon FPS",
        "image": "/case-screenshots/neon-voxel-breach-home.png",
        "imageAlt": "Neon FPS 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是一个更偏游戏化的案例，适合练“AI 能不能直接生成一个有完整氛围的网页游戏入口页”。它的亮点不是纯 UI，而是氛围、HUD、题材设定和第一眼的赛博朋克冲击力。"
          },
          {
            "type": "paragraph",
            "content": "想要做更酷一点的作品集首页、游戏活动页、或者可玩的 AI Demo，这种案例特别有参考价值。哪怕不真的做 FPS，也可以学它的标题、配色、HUD 和开场界面语言。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/fps/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做赛博朋克游戏入口页",
            "content": "请创建一个 React + Vite 的游戏网页首页，主题是赛博朋克体素风第一人称射击游戏，视觉参考 Neon FPS。\n\n目标：\n- 首页像可玩的独立游戏入口页\n- 第一眼就有 neon cyberpunk atmosphere\n- 不要做成普通游戏官网营销模板\n\n页面要求：\n1. 使用全屏 hero，带有强烈标题、简短背景设定、开始按钮。\n2. 视觉上要有体素、霓虹、工业感、夜间 megablock 气质。\n3. 页面叠加 HUD 风格元素，例如状态字、小型指示、扫描线、准星感组件，但不要影响阅读。\n4. 可以加入一张主视觉图或 canvas 场景占位，营造游戏世界入口。\n5. 文案保持少而硬朗，像游戏开场界面。\n6. 不要出现常规 SaaS 的 feature cards、pricing 区和团队介绍区。\n\n技术要求：\n- React + Vite\n- 普通 CSS，必要时可加入 canvas 或 WebGL 占位\n- 优先把氛围和构图做对\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补 HUD、光效和可玩气氛",
            "content": "继续完善这个赛博朋克游戏首页，让它更接近 Neon FPS 的完成度。\n\n请重点处理：\n1. 让画面更像游戏启动界面，而不是静态海报页。\n2. 增加 HUD 式 UI 细节：角标、状态文本、扫描框、微弱噪点、目标标记等。\n3. 背景中的主视觉加入更强层次，例如体素建筑、走廊、敌人剪影、霓虹标识或雾感光束。\n4. CTA 和交互控件要像游戏按钮，不要像通用网页按钮。\n5. 颜色以黑、蓝青、紫、电光粉为主，但控制对比，避免花掉。\n6. 如果加入动效，请优先做轻量入场、闪烁和漂浮，不要引入卡顿的复杂动画。\n\n最后运行 npm run build，并总结哪些部分最能体现游戏氛围。"
          }
        ]
      },
      {
        "heading": "案例 5：Time to Fly",
        "image": "/case-screenshots/time-to-fly-home.png",
        "imageAlt": "Time to Fly 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例适合练“可玩产品首页”和“游戏规则可视化”。它不是纯海报式官网，而是把宇宙谜题、轨道、重力、按钮和可玩逻辑放进了一个很轻盈的界面里。"
          },
          {
            "type": "paragraph",
            "content": "想要做 AI 生成小游戏、教育交互页、或者带一点产品实验感的首页，这个方向很值得学。它的优秀之处在于复杂规则没有把界面压垮，反而形成了清楚、可探索的体验。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://codextimetofly.com/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做宇宙谜题首页和主玩法区",
            "content": "请创建一个 React + Vite 的网页游戏首页，主题是宇宙重力谜题，视觉和玩法表达参考 Time to Fly。\n\n目标：\n- 首页既像一个可玩的产品，也像一个被精心设计的实验性网页\n- 用户一眼就能理解“拖动行星、调整发射角度、把火箭送到目标”的核心概念\n- 界面轻盈、清楚、带一点太空童话感\n\n页面要求：\n1. 首屏展示标题、简短玩法说明和一个主玩法区域。\n2. 主玩法区域用圆形轨道、行星、火箭、目标点来构成一个 miniature solar system。\n3. 界面信息简洁，不要出现复杂仪表盘。\n4. 用少量发光、轨道线和星空背景表现宇宙感。\n5. 交互区旁边可以有开始按钮、重置按钮和关卡提示。\n6. 不要把页面做成游戏介绍长文页，核心是“马上想点一下试试”。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可以用 SVG、Canvas 或 DOM 实现轨道和星体\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补规则表达、动画和细节",
            "content": "继续完善这个宇宙重力谜题首页，让体验更接近 Time to Fly。\n\n请增强：\n1. 行星、轨道、重力场和火箭路径的视觉表达，让用户不看教程也能理解玩法。\n2. 加入轻量动画，例如星体缓慢漂浮、按钮反馈、发射前后状态切换。\n3. 为界面补充更细腻的太空层次，比如柔和光晕、粒子、遥远星点和颜色深浅变化。\n4. 保持整体简洁，避免加入多余说明卡片。\n5. 如果实现可玩演示，允许用户拖动行星位置、点击发射、立即重试。\n6. 移动端优先保证主玩法区域完整可见，不要被说明文案挤压。\n\n最后运行 npm run build，成功后停止并总结实现了哪些可玩交互。"
          }
        ]
      },
      {
        "heading": "最后一层：怎么让还原结果更像原站",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人第一次复制提示词后，页面会“有点像，但还是模板味很重”。通常不是代码能力不够，而是提示词没把气质约束写清楚。真正决定像不像的，往往是构图、留白、内容密度、动效节奏和对“不要什么”的限制。"
          },
          {
            "type": "paragraph",
            "content": "如果发现 Codex 开始自动加功能卡片、价格区、团队介绍、过多按钮，就说明它退回了常见模板。这个时候最有效的做法不是重来，而是补一轮收尾提示词，把不该出现的模式明确排除掉。"
          },
          {
            "type": "code",
            "label": "通用收尾提示词",
            "content": "请继续优化当前页面，但不要改变核心结构。\n\n本轮只做视觉和体验收尾：\n1. 减少模板感，删除或弱化普通 SaaS 风格区块。\n2. 强化首屏构图、标题层级、留白和品牌气质。\n3. 检查颜色是否过杂，保留 1 到 2 个主色系和少量强调色。\n4. 调整按钮、标签、边框和阴影，让它们更克制。\n5. 让图片、主视觉或 canvas 成为第一视线焦点，而不是一堆说明文字。\n6. 检查移动端，确保标题、主视觉和按钮不会互相挤压。\n7. 不要新增无关功能，不要把页面改成通用营销模板。\n\n完成后运行 npm run build，并用一句话总结当前页面最接近原案例的地方，和仍然不够像的地方。"
          }
        ]
      }
    ]
  },
  {
    "id": "copyable-prompts-for-playable-ai-websites",
    "sourceUrl": "https://developers.openai.com/showcase",
    "translationMode": "guidedTranslation",
    "title": "5 个更偏游戏感的 AI 网页案例：直接照着做首页和交互入口",
    "originalTitle": "Copyable prompts for playable AI websites",
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附真实网址，以及适合直接拿去还原网页首页和交互入口的中文提示词。",
    "sections": [
      {
        "heading": "本文更适合谁看",
        "blocks": [
          {
            "type": "paragraph",
            "content": "已经会让 Codex 生成普通着陆页，但总觉得作品还不够酷、不够有记忆点，本文会更对路。这里挑的 5 个案例都不是标准产品营销页，而是更强调场景、氛围、可玩性和“第一屏就想点一下”的网页。"
          },
          {
            "type": "paragraph",
            "content": "这类页面的关键，不是加很多特效，而是让用户一打开就进入情境。也就是说，主场景、标题、按钮、规则提示和操作入口要一起成立，而不是先写一大段介绍再把用户送到真正的体验区。"
          },
          {
            "type": "code",
            "label": "通用练习方式",
            "content": "推荐练法：\n1. 先还原首页第一屏，不急着做完整玩法。\n2. 先把主场景、标题、开始按钮和基础 HUD 做出来。\n3. 第二轮再补轻量交互，例如 hover、镜头移动、按钮反馈、规则提示。\n4. 如果想继续深入，再把核心玩法做成一个小 demo。\n5. 每次都要求 Codex 在完成后运行 npm run build，并在成功后停止。"
          }
        ]
      },
      {
        "heading": "案例 1：London Dream Railway",
        "image": "/case-screenshots/london-dream-railway-home.png",
        "imageAlt": "London Dream Railway 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例最值得学的地方，是它几乎把首页直接做成了一个可探索的小世界。3D 城市、轨道交通、参数面板和互动控件同屏出现，用户一进来就知道这不是介绍页，而是体验本身。"
          },
          {
            "type": "paragraph",
            "content": "想要练“沉浸式场景首页”，它比普通 3D hero 更有参考价值，因为它不只是摆一个物体，而是让场景和控制面板一起工作。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://petergpt.github.io/london-train/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做可探索 3D 城市首页",
            "content": "请创建一个 React + Vite 的互动网页首页，主题是一个可探索的伦敦城市轨道世界，视觉方向参考 London Dream Railway。\n\n目标：\n- 首页本身就是体验，不是传统介绍页\n- 第一屏就出现城市模型、轨道线路和控制入口\n- 用户进入页面后会立刻想拖动、切换或观察场景\n\n页面要求：\n1. 使用全屏或接近全屏的主场景区域，展示抽象化的伦敦城市与轨道系统。\n2. 保留标题和简短说明，但文字必须克制，不能盖过场景本身。\n3. 场景旁边或上方叠加一个轻量控制面板，包含线路切换、时间、视角或模式控制。\n4. 视觉上要有模型感、交通感、未来演示感，但不要做成企业数据后台。\n5. 页面结构优先围绕“观察和探索”，不要加产品卖点卡片。\n6. 移动端允许弱化控制项，但要保留场景沉浸感。\n\n技术要求：\n- React + Vite\n- 可用 Three.js 或 React Three Fiber\n- 不引入重型 UI 组件库\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补场景控制和导览感",
            "content": "继续完善这个城市轨道互动首页，让它更接近 London Dream Railway 的可探索感。\n\n请增强：\n1. 让主场景具备轻量交互，例如镜头缓慢移动、场景旋转、线路高亮、车体移动或 hover 提示。\n2. 控制面板要更像体验控制台，而不是普通网页筛选器。\n3. 加入少量信息标记，例如站点名、线路标签、当前模式说明，但不要变成信息噪声。\n4. 通过层次、雾感、灯光和景深增强 miniature city 气质。\n5. 首屏仍然以场景为主，避免后续内容抢走注意力。\n6. 不要加入模板化 feature section，不要把页面变成普通产品官网。\n\n最后运行 npm run build，并总结哪些交互最能体现“首页就是体验”。"
          }
        ]
      },
      {
        "heading": "案例 2：Golden Gate Experience",
        "image": "/case-screenshots/golden-gate-home.png",
        "imageAlt": "Golden Gate Experience 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例更偏“电影感体验页”。它不是典型游戏 HUD 那种密集界面，而是把大桥、海面、空气透视和少量控制元素叠在一起，让人一进页面就像进入一个飞行体验入口。"
          },
          {
            "type": "paragraph",
            "content": "它适合参考“体验型品牌页”和“可视化交互页”的中间形态：既有强视觉主场景，也保留了可操作的仪表感。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-miniapps-examples.vercel.app/bridge-5p5/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做飞行体验首屏",
            "content": "请创建一个 React + Vite 的沉浸式网页首页，主题是飞越金门大桥的互动体验，视觉方向参考 Golden Gate Experience。\n\n目标：\n- 第一屏像电影海报和体验入口的结合体\n- 用户一眼看到主场景、标题和开始体验按钮\n- 页面重心是空间感和沉浸感，不是功能说明\n\n页面要求：\n1. Hero 采用大幅场景图或 3D 场景，金门大桥必须成为绝对视觉中心。\n2. 文案要很少，只保留标题、简短副标题和一个开始按钮。\n3. 在场景边缘叠加轻量控制元素或状态信息，让页面有“可操作”暗示。\n4. 颜色以雾蓝、海水灰、桥梁暖红和高光白为主。\n5. 保留大量留白和纵深，不要做模块化卡片拼接。\n6. 页面打开后要像一个体验入口，而不是旅游官网或 SaaS 首页。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补电影感和控制叠层",
            "content": "继续完善这个飞越金门大桥的首页，让它更接近 Golden Gate Experience 的完成度。\n\n请重点增强：\n1. 场景纵深和镜头感，例如轻微漂移、海雾、远景淡化、桥体透视。\n2. 控制叠层要更自然地贴在场景之上，像体验面板而不是网页表单。\n3. 给按钮和状态条加入克制但高级的交互反馈。\n4. 文本层级要像预告片式体验页，避免普通宣传页语气。\n5. 如果补充后续区块，也要延续 cinematic 叙事，不要落回普通卡片布局。\n6. 移动端优先保留桥体构图和按钮可点性。\n\n最后运行 npm run build，并用一句话总结当前页面的主情绪。"
          }
        ]
      },
      {
        "heading": "案例 3：Ember Tactics",
        "image": "/case-screenshots/ember-tactics-home.png",
        "imageAlt": "Ember Tactics 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是一个特别适合练“可玩型首页”的案例。用户打开页面之后，看到的不是宣传文案，而是地图、角色、战斗信息和操作按钮。它几乎跳过了传统介绍阶段，直接进入玩法情境。"
          },
          {
            "type": "paragraph",
            "content": "想要做游戏风格作品集、策略类 demo、或者有强规则感的网页工具，这种结构很值得照着拆。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://trpg-demo-codex.vercel.app/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做战棋式可玩首页",
            "content": "请创建一个 React + Vite 的网页首页，主题是回合制策略 RPG，视觉和界面组织参考 Ember Tactics。\n\n目标：\n- 首页直接进入战场情境\n- 地图、角色、状态面板和操作按钮同屏出现\n- 用户一眼就知道这是可玩的策略体验，而不是普通游戏官网\n\n页面要求：\n1. 第一屏包含俯视角战场区域，至少有地格、角色单位和目标区域的视觉暗示。\n2. 画面侧边或底部保留一个轻量 HUD，展示角色状态、技能按钮或回合信息。\n3. 顶部可以有标题和一句世界观说明，但不要喧宾夺主。\n4. 配色偏奇幻、战术、略带独立游戏质感，不要做成卡通手游广告页。\n5. 页面必须让人感觉“已经开局”，而不是“准备介绍”。\n6. 不要加入价格、团队、FAQ 这类官网结构。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可以用 CSS Grid、Canvas 或 SVG 模拟地图\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补战场 HUD 和操作反馈",
            "content": "继续完善这个回合制 RPG 首页，让它更接近 Ember Tactics 的可玩质感。\n\n请增强：\n1. 地格、单位、攻击范围、高亮选中和悬停反馈，让战术感更清楚。\n2. HUD 元素要有游戏面板气质，但布局仍然清晰易读。\n3. 给技能按钮、回合提示和状态区加入轻量交互反馈。\n4. 场景中的光影、地形和单位轮廓要更明确，让首页更像试玩版开局画面。\n5. 不要为了“网页化”而削弱玩法感。\n6. 移动端可以精简 HUD，但必须保留核心战场构图。\n\n最后运行 npm run build，并总结当前页面最像游戏启动界面的部分。"
          }
        ]
      },
      {
        "heading": "案例 4：Neon Voxel Breach",
        "image": "/case-screenshots/neon-voxel-breach-home.png",
        "imageAlt": "Neon Voxel Breach 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这一类就更直接了：赛博朋克、霓虹、硬核标题、进入战场按钮，全都在第一屏正面撞过来。它适合练“动作类网页游戏入口页”，也适合练酷炫作品集首页的强情绪表达。"
          },
          {
            "type": "paragraph",
            "content": "它最有价值的地方不是单纯好看，而是入口很明确。用户不会犹豫下一步做什么，因为所有视觉都在把人往“开始”这件事上推。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/fps/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做赛博朋克 FPS 入口页",
            "content": "请创建一个 React + Vite 的网页首页，主题是赛博朋克体素风第一人称射击游戏，视觉方向参考 Neon Voxel Breach。\n\n目标：\n- 第一屏像硬核游戏启动界面\n- 强调 neon、夜景、工业感和即将开战的气氛\n- 用户进入页面后，第一反应是点击开始而不是阅读说明\n\n页面要求：\n1. 使用全屏 hero，背景可以是场景图、插画或轻量 3D/canvas 场景。\n2. 放置巨大标题、极短玩法文案和一个强 CTA。\n3. 叠加少量 HUD 元素，例如状态字、角标、准星感图形或按键提示。\n4. 颜色以黑、蓝青、紫、电光粉为主，但控制对比，不要糊。\n5. 页面要像游戏入口，不要出现普通 feature cards。\n6. 保持强风格，但文字必须仍可读。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补 HUD、光效和战场预热感",
            "content": "继续完善这个赛博朋克 FPS 首页，让它更接近 Neon Voxel Breach 的完成度。\n\n请增强：\n1. 增加 HUD 风格元素，例如警告条、目标标识、模式说明和轻微扫描线。\n2. 背景主场景要更像即将进入的战场，而不是静态壁纸。\n3. 按钮、标题和关键标签要像游戏 UI，而不是普通网页控件。\n4. 使用轻量动效增加预热感，例如霓虹闪烁、远景漂浮、标题细微位移。\n5. 控制视觉节奏，不要把所有元素都做得同样亮。\n6. 移动端依然要保留“强入口”特征，避免退化成普通宣传页。\n\n最后运行 npm run build，并总结你用了哪些手法避免页面变脏。"
          }
        ]
      },
      {
        "heading": "案例 5：Brickbound Climb",
        "image": "/case-screenshots/brickbound-climb-home.png",
        "imageAlt": "Brickbound Climb 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例更偏复古街机感。它不是靠复杂 3D 或粒子撑场面，而是靠像素场景、月夜屋顶、角色站位和极短信息，把“马上开玩”的信号打得很干净。"
          },
          {
            "type": "paragraph",
            "content": "想要做更轻、更小、更容易完成的游戏网页练习，它是很好的切入口。难度比 3D 场景低，但气质依然鲜明。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/brick-platformer/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做复古平台跳跃首页",
            "content": "请创建一个 React + Vite 的网页游戏首页，主题是复古像素风平台跳跃，视觉方向参考 Brickbound Climb。\n\n目标：\n- 首页直接呈现关卡开局画面\n- 用户一眼就能理解这是跳跃攀登类玩法\n- 画面轻巧、复古、带一点月夜冒险感\n\n页面要求：\n1. 第一屏使用像素风屋顶、砖块平台、月亮和角色站位构成完整场景。\n2. 顶部或角落保留少量 UI 信息，例如时间、得分、生命或提示键位。\n3. 文案必须极少，按钮可只有一个开始或重试入口。\n4. 不要做成手机游戏广告页或普通独立游戏官网。\n5. 重点是“场景本身就能说明玩法”。\n6. 移动端要优先保持主关卡构图完整。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可用 CSS 像素画、SVG 或 Sprite 风格实现\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补像素 HUD 和开局反馈",
            "content": "继续完善这个复古平台跳跃首页，让它更接近 Brickbound Climb 的完成度。\n\n请重点处理：\n1. 让角色、平台和危险区更像真的可玩关卡，而不是装饰场景。\n2. 为 HUD 加入像素风边框、计时器、分数或简单提示，但保持克制。\n3. 增加轻量动态，例如角色待机、月光闪烁、云层移动或平台高亮。\n4. 标题和按钮要延续复古街机语言，不要变成现代 SaaS 按钮样式。\n5. 保持整个首页干净，不要额外补一堆说明模块。\n6. 如果实现试玩 demo，优先做左右移动和跳跃反馈。\n\n最后运行 npm run build，并总结哪些元素最有效地传达了玩法。"
          }
        ]
      },
      {
        "heading": "最后怎么用这些提示词",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这组案例和上一篇最大的区别，是它们更依赖“情境成立”。普通着陆页可以先搭文字结构再补视觉，但这种游戏感网页如果主场景不成立，后面再怎么补按钮和说明都不会像。"
          },
          {
            "type": "paragraph",
            "content": "所以真正高效的顺序通常是：先让场景成立，再让入口明确，最后才补规则说明。只要第一屏已经像一个体验入口，后面哪怕玩法还没做完，页面也已经有记忆点了。"
          },
          {
            "type": "code",
            "label": "通用收尾提示词",
            "content": "请继续优化当前页面，但不要改变核心玩法方向。\n\n本轮只做可玩型首页收尾：\n1. 强化主场景，让用户第一眼就进入情境。\n2. 删除或弱化模板化网页模块，例如 feature cards、团队介绍、FAQ、价格区。\n3. 让 CTA 更明确，但不要破坏画面氛围。\n4. 检查 HUD、状态信息和标题之间的视觉优先级。\n5. 调整颜色和光效，避免脏、乱、全亮或全灰。\n6. 移动端优先保留主场景、标题和主按钮。\n7. 如果页面还是像官网而不像体验入口，请继续减少解释性文案。\n\n完成后运行 npm run build，并总结当前页面最像“可玩首页”的 2 个地方。"
          }
        ]
      }
    ]
  },
  {
    "id": "copyable-prompts-for-ai-tool-surfaces",
    "sourceUrl": "https://developers.openai.com/showcase",
    "translationMode": "guidedTranslation",
    "title": "5 个工具型 AI 网页案例：照着做生成器、控制面板和 3D 场景界面",
    "originalTitle": "Copyable prompts for AI tool surfaces",
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附真实网址，以及适合直接拿去还原网页首页、工具表面和控制面板的中文提示词。",
    "sections": [
      {
        "heading": "为什么要单独学工具型首页",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人已经能让 Codex 生成漂亮首页，但一到工具型页面就容易失手。最常见的问题是：把真正该出现在第一屏的控制区和结果区藏起来，反而先做了一堆营销文案、卖点卡片和品牌介绍。这样页面虽然像官网，却不像真实可用的产品。"
          },
          {
            "type": "paragraph",
            "content": "工具型首页的重点是让用户立刻理解三件事：这个工具能产出什么、我怎么操作它、结果会在什么地方出现。所以本文案例都偏向“首页即工具表面”的方向，适合练生成器、参数控制器、可视化界面和带 3D 场景的交互工具。"
          },
          {
            "type": "code",
            "label": "通用练习方式",
            "content": "推荐顺序：\n1. 先把首页最核心的结果区和控制区做出来。\n2. 第一轮只保证层级和操作路径清楚。\n3. 第二轮再补光影、3D 场景、状态条、微动效和细节。\n4. 如果产品更偏体验型，再让标题、场景和控制面板一起工作。\n5. 每轮都要求 Codex 在完成后运行 npm run build，并在成功后停止。"
          }
        ]
      },
      {
        "heading": "案例 1：Procedural City Generator",
        "image": "/case-screenshots/procedural-city-home.png",
        "imageAlt": "Procedural City Generator 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是最典型的“首页直接暴露核心工具界面”的案例。用户一进来就能看到程序化城市模型、参数面板和调整结果，而不是先读一堆产品故事。它适合学生成器类产品怎么组织第一屏。"
          },
          {
            "type": "paragraph",
            "content": "它的关键不只是 3D 城市本身，而是结果区和控制区几乎同时进入视野，用户会自然理解：左边或中间是产物，右边是调参，这就是工具。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-city-generator-demo.vercel.app/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做生成器首页骨架",
            "content": "请创建一个 React + Vite 的工具型首页，主题是程序化城市生成器，视觉和信息结构参考 Procedural City Generator。\n\n目标：\n- 首页一打开就像真实工具界面\n- 结果区和控制区必须同屏出现\n- 用户一眼就知道这是“调参数 -> 看城市结果”的产品\n\n页面要求：\n1. 主区域展示一个 3D 城市或程序化城市结果预览，可先用简化几何体占位。\n2. 右侧或左侧放一个参数控制面板，包含密度、高度、街区、道路、灯光等控制项。\n3. 顶部只保留极少量品牌和模式切换，不要做营销型导航。\n4. 结果区必须是第一视线焦点，不能被说明文案压过去。\n5. 页面不要做功能卖点卡片，不要先讲故事再进入工具。\n6. 整体气质偏现代、实验性、带一点模拟器和生成器感觉。\n\n技术要求：\n- React + Vite\n- 可使用 Three.js 或 React Three Fiber\n- 普通 CSS\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补参数反馈和工具质感",
            "content": "继续完善这个城市生成器首页，让它更接近 Procedural City Generator 的工具气质。\n\n请增强：\n1. 参数调节与结果区之间要有更明确的因果关系，例如数值变化、开关状态、模式标签。\n2. 让 3D 城市结果更像实时生成产物，而不是静态背景图。\n3. 加入轻量状态区，例如当前 seed、模式、渲染级别或导出入口。\n4. 控制面板要清晰、紧凑、专业，不要做成普通表单页。\n5. 用少量光影、网格感或技术感细节增强工具氛围，但不要过度赛博装饰。\n6. 移动端优先保证“结果先看到、参数还能操作”的基本逻辑。\n\n最后运行 npm run build，并总结当前首页最像真实工具的两个地方。"
          }
        ]
      },
      {
        "heading": "案例 2：London Dream Railway",
        "image": "/case-screenshots/london-dream-railway-home.png",
        "imageAlt": "London Dream Railway 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例比普通工具页更进一步，因为它把参数控制和场景探索揉成了同一个首页。首页既是 3D 城市演示，也是可操作的互动界面。"
          },
          {
            "type": "paragraph",
            "content": "它适合学的是“带场景感的工具表面”怎么做。不是把控件孤零零放一边，而是让控件真的服务于正在展示的世界。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://petergpt.github.io/london-train/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做场景化工具首页",
            "content": "请创建一个 React + Vite 的互动工具首页，主题是一个可探索的伦敦城市轨道系统，视觉方向参考 London Dream Railway。\n\n目标：\n- 首页既像一个小型世界，也像一个可操作工具\n- 城市轨道场景和控制入口必须同时成立\n- 用户进入页面后，会自然想切换线路、调整视角或探索场景\n\n页面要求：\n1. 使用占主导地位的 3D 场景区域，展示抽象化城市、轨道和地标。\n2. 在场景边缘叠加轻量控制面板，例如线路选择、昼夜、速度、视角等。\n3. 文本说明必须非常少，不能破坏探索感。\n4. 页面结构应该围绕“看场景 + 控制场景”展开，而不是常规产品官网结构。\n5. 顶部导航极简，只保留品牌和少量操作入口。\n6. 移动端允许简化控件，但不要失去场景主导地位。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补轨道控制和探索反馈",
            "content": "继续完善这个城市轨道互动工具首页，让它更接近 London Dream Railway 的完成度。\n\n请增强：\n1. 场景里的轨道、列车、节点或站点要更像可探索对象，而不是装饰。\n2. 控制面板要更像体验控制台，带有当前状态、模式提示和明确分组。\n3. 通过镜头移动、线路高亮、车体移动或悬停信息强化“正在观察系统”的感觉。\n4. 页面整体要像互动演示工具，不像营销首页。\n5. 结果区和控制区的对比层级要清楚，避免都一样抢眼。\n6. 不要加入模板化卖点区块或 FAQ。\n\n最后运行 npm run build，并总结当前首页最成功的交互入口。"
          }
        ]
      },
      {
        "heading": "案例 3：Golden Gate Experience",
        "image": "/case-screenshots/golden-gate-home.png",
        "imageAlt": "Golden Gate Experience 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例的首页更偏“体验控制面板”。主场景是绝对核心，但控制层以一种很自然的方式叠在场景之上，让它既像展示页，又像可操作的体验入口。"
          },
          {
            "type": "paragraph",
            "content": "它适合拿来练“体验型产品界面”而不是纯工具界面。尤其适合做飞行、地图、预览、导览类交互产品。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-miniapps-examples.vercel.app/bridge-5p5/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做体验型场景首页",
            "content": "请创建一个 React + Vite 的沉浸式体验首页，主题是飞越金门大桥的可视化场景体验，视觉方向参考 Golden Gate Experience。\n\n目标：\n- 首页以空间感和场景体验为核心\n- 主场景和轻量控制层同时出现\n- 页面像体验入口，而不是普通图文介绍页\n\n页面要求：\n1. 使用大幅主场景作为首屏核心，桥体、海面和纵深空间必须明显。\n2. 保留少量标题、说明和主操作按钮，避免文本过多。\n3. 在场景上叠加轻量控制层，例如模式、视角、状态、信息卡片或开始体验按钮。\n4. 页面整体应该偏 cinematic、导览感、体验感。\n5. 不要加入通用 feature cards，不要做旅游官网结构。\n6. 保持视觉呼吸感，让场景本身说话。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补叠层控件和电影感",
            "content": "继续完善这个飞越金门大桥的体验页，让它更接近 Golden Gate Experience 的完成度。\n\n请增强：\n1. 控制层要更自然地贴在场景上方，像飞行体验面板，而不是普通表单。\n2. 增加景深、雾感、远景层次和镜头移动感，让主场景更有空间张力。\n3. 按钮、状态条和信息块要克制，但必须清楚可点。\n4. 页面首屏要像“正在进入一个体验”，而不是“正在阅读一个网站”。\n5. 如果补充后续区块，也要延续体验叙事，不要转成模板化营销区。\n6. 移动端要优先保住主场景构图和关键控件可操作性。\n\n最后运行 npm run build，并用一句话概括当前页面的核心情绪。"
          }
        ]
      },
      {
        "heading": "案例 4：Ember Tactics",
        "image": "/case-screenshots/ember-tactics-home.png",
        "imageAlt": "Ember Tactics 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "虽然它看起来更像游戏，但从界面结构上看，它也是一个很典型的“首页即操作面板”案例。地图是结果区，侧边和底部 HUD 是控制区，用户无需滚动就能理解系统状态。"
          },
          {
            "type": "paragraph",
            "content": "这类结构对策略产品、复杂模拟器、地图类工具都很有启发，因为它解决的是“高密度信息怎么在第一屏共存”这个问题。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://trpg-demo-codex.vercel.app/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做地图 + HUD 工具表面",
            "content": "请创建一个 React + Vite 的高密度工具型首页，主题是回合制战术地图界面，结构参考 Ember Tactics。\n\n目标：\n- 首页直接展示核心地图和状态面板\n- 用户进入页面后立刻理解系统当前状态和可操作入口\n- 页面像真正的操作界面，而不是介绍页\n\n页面要求：\n1. 第一屏包含主地图区域，地图承担结果区角色。\n2. 侧边或底部保留 HUD 区，展示状态、模式、技能或操作信息。\n3. 信息密度可以高，但层级必须清楚，不能乱成一片。\n4. 顶部只保留少量品牌或模式标题，不做营销导航。\n5. 页面整体偏战术、模拟、系统界面感。\n6. 不要加入 FAQ、品牌故事和卖点卡片。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补状态层级和面板反馈",
            "content": "继续完善这个战术地图型首页，让它更接近 Ember Tactics 的工具表面感。\n\n请增强：\n1. 地图、单位、选中态、范围高亮和当前回合信息之间要有清楚关系。\n2. HUD 面板需要更专业，按钮、状态文本和标签要有明显主次。\n3. 让整个界面看起来像一个可操作系统，而不是一张带说明的海报。\n4. 强化反馈，例如 hover、active、selected、cooldown 或状态变化。\n5. 控制画面密度，不要为了信息量牺牲可读性。\n6. 移动端可以折叠部分 HUD，但核心地图和主操作按钮必须保留。\n\n最后运行 npm run build，并总结你是怎么让高密度界面仍然清楚的。"
          }
        ]
      },
      {
        "heading": "案例 5：Time to Fly",
        "image": "/case-screenshots/time-to-fly-home.png",
        "imageAlt": "Time to Fly 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例最适合练“场景 + 控制 + 规则说明”三者如何同屏。它不是简单把按钮堆在边上，而是让星空主场景、发射逻辑和右侧控制面板一起构成完整的第一屏。"
          },
          {
            "type": "paragraph",
            "content": "对需要同时展示可视化结果和轻量规则的工具来说，这个结构很有参考价值，比如教育工具、模拟器、实验性产品或可玩式引导页面。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://codextimetofly.com/"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做可视化规则首页",
            "content": "请创建一个 React + Vite 的交互型首页，主题是宇宙重力谜题或轨道模拟体验，结构参考 Time to Fly。\n\n目标：\n- 首页同时展示主场景、规则暗示和控制入口\n- 用户不读长文也能理解这是一个可交互系统\n- 页面像实验性产品或轻量模拟器，而不是普通官网\n\n页面要求：\n1. 第一屏包含太空主场景，轨道、星球、火箭或目标点必须明确。\n2. 右侧或下方放一个轻量控制面板，展示开始、重置、角度、强度或关卡提示。\n3. 文案必须很少，以“引导理解玩法”为主，而不是营销介绍。\n4. 结果区和控制区要有明确分工，但视觉上保持统一。\n5. 整体气质轻盈、未来感、实验性，不要做沉重后台风格。\n6. 不要加入与玩法无关的大段说明区块。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补规则表达和控制细节",
            "content": "继续完善这个宇宙规则可视化首页，让它更接近 Time to Fly 的完成度。\n\n请增强：\n1. 轨道、星体、重力场和目标关系要更直观，让用户一眼读懂规则。\n2. 控制面板中的按钮、标签和状态说明要更清楚，像可用产品而不是装饰。\n3. 主场景加入轻量动画，例如漂浮、轨迹、光晕或发射前后状态变化。\n4. 结果区必须保持第一焦点，避免控制区反客为主。\n5. 保持整体简洁，不要往页面里补一堆营销区块。\n6. 移动端优先保证主场景完整和主控制入口可点。\n\n最后运行 npm run build，并总结当前页面最像“实验性工具”的两个细节。"
          }
        ]
      },
      {
        "heading": "最后一条经验：别把工具页做回普通官网",
        "blocks": [
          {
            "type": "paragraph",
            "content": "工具型页面最容易被 AI 自动拉回“标准官网模板”。一旦 Codex 开始自动加卖点卡片、客户评价、FAQ、团队介绍、价格区，就说明它把任务理解成营销首页了。"
          },
          {
            "type": "paragraph",
            "content": "这类页面真正的价值，恰恰是把工具本身提到第一屏。哪怕功能还没全做完，只要结果区、控制区和状态区已经成立，页面就会比普通模板更有说服力。"
          },
          {
            "type": "code",
            "label": "通用收尾提示词",
            "content": "请继续优化当前页面，但不要改变它作为工具型首页的核心结构。\n\n本轮只做工具表面收尾：\n1. 强化结果区、控制区和状态区的层级关系。\n2. 删除或弱化营销型网页模块，例如 feature cards、品牌故事、FAQ、价格区。\n3. 确保用户进入页面后，第一眼就知道能操作什么、结果在哪。\n4. 调整按钮、输入控件、标签和面板样式，让它们更像真实工具。\n5. 如果有 3D 或主场景，让它继续保持第一焦点。\n6. 控制颜色和装饰，不要把工具页做成赛博风展示板。\n7. 移动端优先保住主结果区和主操作入口。\n\n完成后运行 npm run build，并总结当前页面最像真实产品界面的 2 个地方。"
          }
        ]
      }
    ]
  },
  {
    "id": "copyable-prompts-for-knowledge-and-education-ai-websites",
    "sourceUrl": "https://www.uicoding.ai/cases",
    "translationMode": "guidedTranslation",
    "title": "5 个教育与知识表达的 AI 网页案例：照着做信息图、教学和内容解释界面",
    "originalTitle": "Copyable prompts for knowledge and education AI websites",
    "notice": "本文为 UIcoding 基于真实网站与已收录案例整理的中文学习稿。这一组更偏真实产品与公开站点，因此我给出的提示词是面向还原首页与核心交互的拆解版中文提示词。",
    "sections": [
      {
        "heading": "这类网页为什么值得单独学",
        "blocks": [
          {
            "type": "paragraph",
            "content": "教育、知识解释和信息可视化类网页，难点通常不在于动效，而在于“怎么让人快速看懂”。如果首页只追求视觉冲击，却没有把输入、处理和输出讲清楚，用户通常会很快失去耐心。"
          },
          {
            "type": "paragraph",
            "content": "所以本文挑的 5 个案例，不是单纯为了好看，而是为了学它们如何组织知识型产品的第一屏。可以看到不同路径：有的强调文本转视觉，有的强调教学流程，有的强调专业知识解释，有的强调把复杂信息整理成结构化界面。"
          },
          {
            "type": "code",
            "label": "通用练习方式",
            "content": "推荐顺序：\n1. 先观察首页最先让用户理解的是什么。\n2. 第一轮只还原结构，不急着追求花哨效果。\n3. 第二轮再补视觉风格、状态反馈和内容密度。\n4. 如果产品有输入区、结果区或解释区，优先把这三块关系做清楚。\n5. 每轮都要求 Codex 在完成后运行 npm run build，并在成功后停止。"
          }
        ]
      },
      {
        "heading": "案例 1：KnowLens.ai",
        "image": "/case-screenshots/knowlens-ai-home.webp",
        "imageAlt": "KnowLens.ai 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "KnowLens.ai 特别适合学“文本如何变成信息图”这件事。它的首页很清楚地告诉用户：可以输入一个主题、想法或学习文本，系统会把它转成可读的信息可视化结果。"
          },
          {
            "type": "paragraph",
            "content": "它的价值不只是视觉风格，而是把输入框、示例提示词、案例预览和生成按钮组织成一条很直接的体验路径。用户还没往下滚，就已经知道产品怎么用。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://knowlens.ai/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/content-tool/knowlens-ai-infographic-generator"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做文本转信息图首页",
            "content": "请创建一个 React + Vite 的 AI 工具首页，主题是把普通文本生成结构化信息图，视觉和信息结构参考 KnowLens.ai。\n\n目标：\n- 用户进入页面后立刻理解“输入文本 -> 生成信息图”\n- 首页重点是输入区、示例提示词和精选案例预览\n- 页面像真实产品首页，不像普通营销模板\n\n页面要求：\n1. Hero 区域中心放一个大输入框，支持输入主题、学习笔记或一段普通文本。\n2. 输入框附近保留一个明确的生成按钮和少量说明文案。\n3. 输入框下方展示若干示例提示词标签，帮助用户快速开始。\n4. 往下展示精选案例预览，让用户理解输出会长什么样。\n5. 整体界面要干净、克制、偏知识工具，不要重渐变和重阴影。\n6. 不要先做一堆卖点卡片，第一屏必须服务于开始生成。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补案例预览和生成体验",
            "content": "继续完善这个文本转信息图首页，让它更接近 KnowLens.ai 的产品体验。\n\n请增强：\n1. 示例提示词标签要更像真正可点击的起始话题，而不是装饰。\n2. 精选案例区要展示多种信息图风格，让用户一眼看懂产品输出边界。\n3. 输入区、按钮和案例区之间要形成清晰的操作路径。\n4. 整体视觉保持简洁和可信，不要把知识工具做成潮流海报站。\n5. 如果补充后续区块，优先解释输入材料、输出形式和使用场景。\n6. 移动端要优先保住输入框和主按钮的可用性。\n\n最后运行 npm run build，并总结当前页面最能说明产品价值的两个部分。"
          }
        ]
      },
      {
        "heading": "案例 2：Maieutic",
        "image": "/case-screenshots/maieutic-home.png",
        "imageAlt": "Maieutic 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Maieutic 适合学的是“教学型 AI 产品怎么讲清学习流程”。它并不是强调一键生成答案，而是把先写 specification、再编码、再检查偏差这条教学链路讲得很清楚。"
          },
          {
            "type": "paragraph",
            "content": "这类产品最怕的是讲得太抽象，而 Maieutic 的首页会让使用者很快明白它在训练什么能力、服务谁、以及学生和教师各自会看到什么。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://maieutic.dev/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/education/maieutic-programming-education"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做编程教育产品首页",
            "content": "请创建一个 React + Vite 的教育类产品首页，主题是帮助学生先写程序规格说明，再进入编码和调试，信息结构参考 Maieutic。\n\n目标：\n- 首页清楚解释产品在训练什么能力\n- 用户一眼看懂这是教学工具，不是普通代码生成器\n- 页面要同时照顾学生与教师两类角色\n\n页面要求：\n1. Hero 用清楚标题解释核心理念：先写 specification，再写 code。\n2. 第一屏保留一句到两句说明，解释产品如何帮助学生学习，而不是替学生完成答案。\n3. 往下用清晰区块介绍学生流程、教师观察和课堂反馈。\n4. 页面整体要克制、可信、偏教育产品，不要做成强营销页。\n5. 不要加太多炫技视觉，重点是流程和认知价值表达清楚。\n6. 按钮数量要少，避免强销售语气。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补学习流程和教师视图",
            "content": "继续完善这个编程教育产品首页，让它更接近 Maieutic 的完成度。\n\n请增强：\n1. 学生学习流程要更清楚，表现出“写规格 -> 编码 -> 对比偏差”的路径。\n2. 教师视图要体现课堂观察和每个学生 reasoning 的能力。\n3. 页面文案和结构要强调教学价值，而不是技术炫耀。\n4. 通过版式、图示或流程块让复杂理念更容易被第一次访问的人理解。\n5. 保持教育产品的可信与冷静，不要加入过度炫目的特效。\n6. 移动端优先保证标题、流程和角色区块可读。\n\n最后运行 npm run build，并总结当前页面最能解释教学方法的两个地方。"
          }
        ]
      },
      {
        "heading": "案例 3：Medkit",
        "image": "/case-screenshots/medkit-home.png",
        "imageAlt": "Medkit 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Medkit 适合用来学习“专业知识型产品怎么降低信息门槛”。医疗类工具的难点不是做酷，而是把复杂指南、临床路径和建议组织成可快速浏览的界面。"
          },
          {
            "type": "paragraph",
            "content": "这类产品首页需要先解决信任和清晰度，而不是先做花哨视觉。用户要先知道它服务什么场景、帮我节省什么理解成本。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://medkit-app.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/other/medkit-clinical-guide"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做医学知识解释首页",
            "content": "请创建一个 React + Vite 的专业知识工具首页，主题是帮助医护人员快速理解临床指南与诊疗流程，信息结构参考 Medkit。\n\n目标：\n- 页面第一屏传达专业、清晰、可信\n- 用户一眼理解这是“查询指南 / 获取解释 / 找到下一步”的工具\n- 首页重点是场景价值，而不是营销文案\n\n页面要求：\n1. Hero 用清楚标题说明产品能帮助医护人员快速定位和理解临床信息。\n2. 第一屏可加入一个查询入口、搜索框或典型问题示例。\n3. 往下展示产品如何组织症状、指南内容、解释和下一步建议。\n4. 视觉要简洁、克制、专业，不要做成消费级娱乐工具。\n5. 用结构化区块解释工作流，而不是堆很多漂亮插图。\n6. 不要加入与专业场景无关的夸张交互。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补查询路径和可信感",
            "content": "继续完善这个临床知识工具首页，让它更接近 Medkit 的产品表达。\n\n请增强：\n1. 首页的查询路径要更明确，让用户知道从什么问题开始。\n2. 解释区和建议区要有专业秩序感，避免像普通博客页面。\n3. 通过卡片、标签、状态或引用块增强“来自指南和流程”的可信感。\n4. 保持视觉冷静，避免过多装饰色和娱乐化交互。\n5. 如果加入后续区块，优先说明适用场景、信息来源和行动路径。\n6. 移动端优先保住搜索入口和核心解释结构。\n\n最后运行 npm run build，并总结当前页面最能建立信任感的两个细节。"
          }
        ]
      },
      {
        "heading": "案例 4：Poneglyph",
        "image": "/case-screenshots/poneglyph-home.png",
        "imageAlt": "Poneglyph 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Poneglyph 适合用来练“复杂知识如何被拆成更容易追问的结构”。这类产品的关键不是一次把所有信息倒给用户，而是给出主题入口、解释层级和继续探索的可能性。"
          },
          {
            "type": "paragraph",
            "content": "想要做知识解读工具、研究助手或长内容拆解界面，这种结构比普通文章页更有启发。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://poneglyph-chi.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/content-tool/poneglyph-knowledge-tool"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做知识解读首页",
            "content": "请创建一个 React + Vite 的知识解读工具首页，主题是帮助用户理解复杂内容、建立主题结构并继续探索，信息组织参考 Poneglyph。\n\n目标：\n- 首页让用户知道可以从主题入口进入知识内容\n- 页面像一个可探索的知识工具，而不是普通文章列表\n- 结构重点是主题、解释层级和继续追问的空间\n\n页面要求：\n1. 首屏要有清楚的主题入口，可以是搜索框、问题输入框或主题卡片。\n2. 页面需要表现“复杂内容会被拆解成更好理解的结构”。\n3. 往下可以展示解释层级、关联模块或继续追问的路径。\n4. 视觉保持安静、理性、偏知识工作台，不要过度营销化。\n5. 不要堆太多卖点卡片，重点是知识入口和信息结构。\n6. 移动端也要保留主题入口的优先级。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补层级和继续探索路径",
            "content": "继续完善这个知识解读工具首页，让它更接近 Poneglyph 的内容组织方式。\n\n请增强：\n1. 让主题入口、解释层级和延伸探索之间关系更清楚。\n2. 页面要更像“帮助理解复杂知识”的工具，而不是静态信息页。\n3. 可以加入关联主题、问题线索或知识树式结构，但要保持简洁。\n4. 文案和布局要强调帮助用户思考，而不是只展示内容。\n5. 避免重装饰，优先提高内容组织和可追问性。\n6. 移动端要优先保住搜索、主题入口和主解释区块。\n\n最后运行 npm run build，并总结当前页面最像知识工具的两个结构设计。"
          }
        ]
      },
      {
        "heading": "案例 5：Postmortem",
        "image": "/case-screenshots/postmortem-home.png",
        "imageAlt": "Postmortem 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Postmortem 这一类产品适合学“非结构化信息如何被整理成可执行文档”。它不只是内容展示，而是要把时间线、根因、影响范围和行动项收束成一个清晰结构。"
          },
          {
            "type": "paragraph",
            "content": "这类页面的关键不是让人觉得酷，而是让人觉得“这能帮我把混乱事件整理清楚”。在做复盘工具、研究助手、项目记录器，这个方向很值得拆。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://postmortem-mauve.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/content-tool/postmortem-incident-analysis"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做事故复盘工具首页",
            "content": "请创建一个 React + Vite 的内容工具首页，主题是把事故线索、时间线、根因和行动项整理成结构化复盘，信息结构参考 Postmortem。\n\n目标：\n- 用户一眼理解这是“把混乱事件整理成复盘文档”的工具\n- 首页需要同时传达收集信息、组织时间线和输出结论的能力\n- 页面像工作流工具，而不是普通博客页\n\n页面要求：\n1. Hero 区域清楚说明产品如何帮助团队完成 postmortem。\n2. 首页可以展示时间线、根因分析和行动项这三种典型输出结构。\n3. 页面整体偏工程团队工具感，简洁、理性、可执行。\n4. 不要做过多品牌营销文案，重点是结构化复盘的路径。\n5. 可以加入输入材料、分析过程和输出结果的流程说明。\n6. 保持信息清楚，不要把页面做成密密麻麻文档列表。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补时间线和行动项结构",
            "content": "继续完善这个事故复盘工具首页，让它更接近 Postmortem 的工作流表达。\n\n请增强：\n1. 时间线、根因和 action items 之间的逻辑关系要更清楚。\n2. 通过版式和组件让页面更像“可输出复盘”的产品，而不是文章摘要页。\n3. 输入材料、处理中和结果区要有明确阶段感。\n4. 保持工程工具的冷静气质，不要做娱乐化视觉。\n5. 如果加案例演示，优先展示结构化复盘结果，而不是空泛卖点。\n6. 移动端优先保住关键流程和代表性输出结构。\n\n最后运行 npm run build，并总结当前页面最能体现“结构化复盘”的两个地方。"
          }
        ]
      },
      {
        "heading": "最后一条经验：知识型产品先解释，再美化",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这类页面最常见的问题是把首页做得很漂亮，但用户仍然不知道产品具体帮他做什么。真正好的知识型、教育型产品首页，第一步不是证明审美，而是降低理解成本。"
          },
          {
            "type": "paragraph",
            "content": "所以在让 Codex 还原这类站点时，最重要的提示不是“高级一点”，而是“把输入、处理和输出讲清楚”。只要结构清楚，页面自然会更像真实产品，而不是漂亮模板。"
          },
          {
            "type": "code",
            "label": "通用收尾提示词",
            "content": "请继续优化当前页面，但不要改变它作为知识型产品首页的核心结构。\n\n本轮只做信息表达收尾：\n1. 强化输入、处理和输出三者的关系。\n2. 删除或弱化和理解任务无关的营销型区块。\n3. 确保用户进入页面后，第一眼就知道这个产品解决什么理解问题。\n4. 调整标题、说明、标签和案例区块，让信息层级更清楚。\n5. 视觉上保持简洁可信，不要为了好看牺牲解释效率。\n6. 移动端优先保住主入口、主说明和代表性结果区。\n7. 如果页面仍然像普通官网，请继续减少空泛文案，增加结构化示例。\n\n完成后运行 npm run build，并总结当前页面最能降低理解门槛的两个设计。"
          }
        ]
      }
    ]
  },
  {
    "id": "copyable-prompts-for-enterprise-ai-workflows",
    "sourceUrl": "https://www.uicoding.ai/cases",
    "translationMode": "guidedTranslation",
    "title": "5 个企业工作流 AI 网页案例：照着做安全、合规和团队工具界面",
    "originalTitle": "Copyable prompts for enterprise AI workflow websites",
    "notice": "本文为 UIcoding 基于真实网站与已收录案例整理的中文学习稿。这一组案例更偏企业工作流、安全、合规和团队工具，因此我给出的提示词会更强调任务入口、信息层级、状态反馈和专业场景可信感。",
    "sections": [
      {
        "heading": "为什么企业工具页面更难做",
        "blocks": [
          {
            "type": "paragraph",
            "content": "企业工作流页面最难的地方，不是把界面做漂亮，而是把复杂流程说清楚。安全、合规、复盘、团队工作台这类产品，如果首页只剩抽象卖点和大标题，用户通常很难立刻理解它到底帮谁解决什么问题。"
          },
          {
            "type": "paragraph",
            "content": "这类页面真正有价值的地方，是把角色、任务、状态和下一步动作组织得很明确。换句话说，它要像一个真实会被使用的工具，而不是只有品牌语气的宣传页。"
          },
          {
            "type": "code",
            "label": "通用练习方式",
            "content": "推荐顺序：\n1. 先定义首页的主要用户是谁。\n2. 先把任务入口、状态区和结果区做清楚。\n3. 第一轮只保证信息层级和操作路径成立。\n4. 第二轮再补图表、面板、标签、状态反馈和视觉细节。\n5. 每轮都要求 Codex 在完成后运行 npm run build，并在成功后停止。"
          }
        ]
      },
      {
        "heading": "案例 1：Blacklight",
        "image": "/case-screenshots/blacklight-home.png",
        "imageAlt": "Blacklight 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Blacklight 特别适合用来学“复杂安全产品怎么讲清楚自己的系统边界”。它不是简单说自己更安全，而是把 agentic defense、现有 Linux 安全工具链和自动响应能力组织成一个明确叙事。"
          },
          {
            "type": "paragraph",
            "content": "这类案例的重点是：产品概念很复杂，但页面仍然要让用户快速知道它服务什么系统、串联哪些工具、以及能替团队承担哪些防御动作。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://rfxn.com/blacklight"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/other/blacklight-agentic-defense"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做安全工作流首页",
            "content": "请创建一个 React + Vite 的企业安全产品首页，主题是为 Linux 防御工具链增加 agentic defense layer，信息结构参考 Blacklight。\n\n目标：\n- 首页一眼说明产品面向什么系统、处理什么风险、如何协同现有工具\n- 页面要像真实安全产品，不像普通 SaaS 营销模板\n- 重点是能力边界、流程价值和可信感\n\n页面要求：\n1. Hero 清楚说明产品定位，例如连接现有安全工具并进行推理与响应。\n2. 第一屏要快速提到适用场景、主要系统对象和核心动作。\n3. 往下组织成几个清晰区块：工具链接入、事件分析、自动响应、团队信任。\n4. 界面气质要专业、克制、偏安全产品，不要花哨渐变。\n5. 可以使用系统图、流程块或能力卡片，但不要堆太多营销语。\n6. 不要出现与专业场景无关的装饰性炫技组件。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补系统视图和可信感",
            "content": "继续完善这个安全产品首页，让它更接近 Blacklight 的专业表达。\n\n请增强：\n1. 把 Linux 工具链、分析层和响应层之间的关系表现得更清楚。\n2. 页面要更像真实安全控制面，而不是停留在概念介绍。\n3. 通过标签、流程图、状态块或结构图区强化可信感和系统边界。\n4. 控制视觉重量，避免过度赛博风和夸张发光。\n5. 如果加入后续区块，优先说明适配对象、工作流程和输出动作。\n6. 移动端优先保证核心定位和主要能力区块可读。\n\n最后运行 npm run build，并总结当前页面最能建立专业信任的两个部分。"
          }
        ]
      },
      {
        "heading": "案例 2：MasterBorder",
        "image": "/case-screenshots/masterborder-home.png",
        "imageAlt": "MasterBorder 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "MasterBorder 这类产品适合学“复杂规则型业务怎么被解释成可执行流程”。跨境合规本身就很难讲明白，所以首页必须很克制地把问题分类、规则解释和下一步行动组织出来。"
          },
          {
            "type": "paragraph",
            "content": "它的价值不在于酷炫，而在于让人感觉这个系统真的能帮我穿过复杂流程。对于合规、法律、财务或流程审批类产品，这种表达方式很值得借。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://masterborder.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/saas/masterborder-trade-compliance"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做合规流程首页",
            "content": "请创建一个 React + Vite 的企业合规产品首页，主题是帮助用户理解跨境贸易、边境规则和所需文件，信息结构参考 MasterBorder。\n\n目标：\n- 首页要把复杂规则翻译成用户可理解的流程\n- 用户进入页面后，能快速知道自己从哪个问题开始\n- 页面像可信的业务工具，不像普通模板站\n\n页面要求：\n1. Hero 清楚说明产品解决的是哪类复杂合规问题。\n2. 第一屏可以有问题入口、流程入口或业务场景分类。\n3. 往下展示规则解释、所需材料、下一步动作或风险提示。\n4. 页面语气要冷静、专业、偏业务支持系统。\n5. 不要堆太多品牌口号，重点是降低规则理解门槛。\n6. 版式要清楚，不要让大量文本压垮界面。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补规则层级和行动路径",
            "content": "继续完善这个跨境合规产品首页，让它更接近 MasterBorder 的信息表达。\n\n请增强：\n1. 场景分类、规则解释和文件准备之间的关系要更清楚。\n2. 页面要让用户感觉自己可以从复杂问题里找到下一步行动。\n3. 通过标签、流程步骤、清单块或状态提示增强可执行感。\n4. 保持视觉专业和克制，不要把合规工具做成营销海报。\n5. 如果补充后续区块，优先展示典型任务路径。\n6. 移动端优先保住问题入口、说明和关键清单结构。\n\n最后运行 npm run build，并总结当前页面最像业务工具的两个结构设计。"
          }
        ]
      },
      {
        "heading": "案例 3：NERIUM",
        "image": "/case-screenshots/nerium-home.png",
        "imageAlt": "NERIUM 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "NERIUM 适合学的是“AI 工作空间怎么组织上下文和任务”。这类产品最容易做成泛泛的 AI 助手官网，但真正有价值的首页，应该让用户看见任务、上下文、状态和持续推进的感觉。"
          },
          {
            "type": "paragraph",
            "content": "在做工作台、协作面板、任务流或 Agent 工作空间，这种结构会比普通聊天框首页更有参考价值。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://nerium-one.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/saas/nerium-ai-workspace"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做 AI 工作空间首页",
            "content": "请创建一个 React + Vite 的 AI 工作空间首页，主题是组织任务、上下文和生成结果的工作台，信息结构参考 NERIUM。\n\n目标：\n- 首页让用户理解这不是普通聊天工具，而是可持续推进任务的工作空间\n- 页面要体现任务入口、上下文材料和结果承接\n- 界面像真实工作台，而不是通用 AI 着陆页\n\n页面要求：\n1. 第一屏清楚说明产品帮助用户管理任务、上下文和执行状态。\n2. Hero 或主展示区可以出现工作台截图、任务流或上下文面板。\n3. 往下展示任务入口、上下文管理、结果区和后续操作路径。\n4. 界面要安静、清晰、偏生产力工具，不要过度装饰。\n5. 不要把页面做成纯聊天产品介绍页。\n6. 保证信息层级稳定，让用户知道“任务如何被推进”。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补工作台结构和状态感",
            "content": "继续完善这个 AI 工作空间首页，让它更接近 NERIUM 的产品表达。\n\n请增强：\n1. 任务、上下文材料和结果之间的承接关系要更清楚。\n2. 页面要更像工作台界面，而不是抽象概念页。\n3. 通过面板、状态条、列表、标签或流程块增强“持续推进任务”的感觉。\n4. 视觉上保持生产力工具气质，不要做成重营销页。\n5. 如果补充后续区块，优先展示真实工作流而不是口号。\n6. 移动端优先保住任务入口和代表性面板结构。\n\n最后运行 npm run build，并总结当前页面最像工作空间的两个部分。"
          }
        ]
      },
      {
        "heading": "案例 4：Postmortem",
        "image": "/case-screenshots/postmortem-home.png",
        "imageAlt": "Postmortem 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Postmortem 在这一组里也很合适，因为它体现的是团队工作流工具如何把混乱事件收束成共识。事故复盘类产品的关键，不是展示很多功能，而是清楚呈现输入线索、时间线、根因和行动项。"
          },
          {
            "type": "paragraph",
            "content": "这类产品适合参考给工程团队、运营团队或项目团队做结构化工作流工具时的首页表达。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://postmortem-mauve.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/content-tool/postmortem-incident-analysis"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做团队复盘工具首页",
            "content": "请创建一个 React + Vite 的团队工作流工具首页，主题是把事故线索、时间线、根因和行动项整理成结构化复盘，信息结构参考 Postmortem。\n\n目标：\n- 用户一眼理解产品如何把混乱事件整理成团队可执行文档\n- 首页要体现输入、分析和输出三个阶段\n- 页面像真实工程团队工具，而不是普通内容页\n\n页面要求：\n1. Hero 清楚说明产品如何帮助团队完成 postmortem。\n2. 首页展示时间线、根因分析和行动项这几类代表性输出。\n3. 整体界面偏工程工具气质，理性、克制、清楚。\n4. 可以加入流程图或阶段块，但不要做复杂营销叙事。\n5. 文案重点是工作流价值，而不是品牌口号。\n6. 不要让页面看起来像博客或文章模板。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补阶段感和执行路径",
            "content": "继续完善这个团队复盘工具首页，让它更接近 Postmortem 的工作流表达。\n\n请增强：\n1. 输入线索、时间线、根因和行动项之间的阶段关系要更清楚。\n2. 页面要更像帮助团队协作的系统，而不是静态展示页。\n3. 通过时间轴、卡片、清单或状态块强化执行路径。\n4. 保持冷静、专业的工程工具气质。\n5. 如果加示例内容，优先展示结构化复盘结果。\n6. 移动端优先保住关键阶段区块和代表性输出。\n\n最后运行 npm run build，并总结当前页面最能说明团队工作流的两个设计。"
          }
        ]
      },
      {
        "heading": "案例 5：Medkit",
        "image": "/case-screenshots/medkit-home.png",
        "imageAlt": "Medkit 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "虽然 Medkit 也可以归到知识工具，但它放在这里很合适，因为它代表了一类更专业、更流程导向的工作场景产品。它不是泛泛解释知识，而是围绕临床问题、指南路径和下一步建议形成一个实用工作流。"
          },
          {
            "type": "paragraph",
            "content": "这种产品尤其适合练“专业场景的可信首页”怎么做。重点不是华丽，而是让用户觉得这套界面能真正在关键场景里被使用。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://medkit-app.vercel.app/"
              },
              {
                "label": "案例详情",
                "url": "https://www.uicoding.ai/cases/other/medkit-clinical-guide"
              }
            ]
          },
          {
            "type": "code",
            "label": "提示词 1 · 先做专业工作流首页",
            "content": "请创建一个 React + Vite 的专业工作流工具首页，主题是帮助用户围绕复杂专业知识快速查询、理解并找到下一步建议，信息结构参考 Medkit。\n\n目标：\n- 首页让用户理解这是高风险专业场景下的支持工具\n- 页面重点是问题入口、解释结构和行动路径\n- 界面要像可信的专业产品，不像泛 AI 工具模板\n\n页面要求：\n1. Hero 清楚说明产品面向什么专业场景、帮助用户完成什么关键任务。\n2. 第一屏可以加入搜索入口、问题入口或典型场景示例。\n3. 往下展示指南解释、结构化建议和下一步动作。\n4. 视觉必须克制、专业、可信，不要娱乐化。\n5. 页面重点是帮助理解和行动，不是炫技。\n6. 保持结构化区块清楚，避免信息混乱。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 补可信结构和建议路径",
            "content": "继续完善这个专业工作流工具首页，让它更接近 Medkit 的产品表达。\n\n请增强：\n1. 问题入口、解释区和建议区之间的关系要更清楚。\n2. 页面整体要更像专业支持工具，而不是内容站。\n3. 通过引用块、状态标签、结构化清单或流程提示增强可信感。\n4. 保持视觉冷静，不要增加无关装饰。\n5. 如果加入后续区块，优先展示适用场景和行动路径。\n6. 移动端优先保住搜索入口和核心解释结构。\n\n最后运行 npm run build，并总结当前页面最能体现专业可信感的两个细节。"
          }
        ]
      },
      {
        "heading": "最后一条经验：企业工具先让用户知道下一步",
        "blocks": [
          {
            "type": "paragraph",
            "content": "企业工具和工作流产品最怕的一件事，就是页面看上去很高级，但用户完全不知道从哪里开始。只要任务入口、当前状态和下一步动作不清楚，这类产品就会很像概念展示，而不像真实工具。"
          },
          {
            "type": "paragraph",
            "content": "还原这类站点时，最关键的不是喊“做高级一点”，而是明确四件事：谁在用、要做什么、看什么状态、下一步点哪里。把这四件事讲清楚，页面就会自然像真实产品。"
          },
          {
            "type": "code",
            "label": "通用收尾提示词",
            "content": "请继续优化当前页面，但不要改变它作为企业工作流产品首页的核心结构。\n\n本轮只做工作流表达收尾：\n1. 强化任务入口、状态区、结果区和下一步动作之间的关系。\n2. 删除或弱化泛营销型区块，例如空泛卖点卡片和口号式段落。\n3. 确保用户进入页面后，能快速知道这个产品服务谁、处理什么流程。\n4. 调整标签、卡片、流程块和按钮，让它们更像真实工具界面。\n5. 视觉上保持专业、克制和可信，不要为了“高级”增加无意义装饰。\n6. 移动端优先保住主入口、代表性状态和关键说明区块。\n7. 如果页面仍然像宣传站，请继续增加结构化流程示例，减少空话。\n\n完成后运行 npm run build，并总结当前页面最像真实工作流工具的两个部分。"
          }
        ]
      }
    ]
  },
  {
    "id": "ten-essential-codex-skills",
    "sourceUrl": "https://developers.openai.com/codex/skills",
    "translationMode": "original",
    "title": "Codex 最该先装的 10 个 Skills",
    "originalTitle": "10 essential skills for Codex",
    "notice": "本文基于 OpenAI 官方 Codex Skills 文档、plugins 文档、openai/skills 仓库，以及当前 Codex 会话中已启用的 Skills 说明整理。这里的“必用”不是官方排名，而是从真实网站、工具和产品开发流程里筛出来的高频组合。",
    "hideSourceLink": true,
    "hideSourceNoticeLink": true,
    "sections": [
      {
        "heading": "先分清：Skill 到底是什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "只靠一次次重写提示词，Codex 只能发挥一半能力。Skill 更像可复用能力包：提示词、说明、脚本、参考资料和固定工作流都能放进去。调用一个 Skill，本质上是让 Codex 进入一套已经整理好的做事方法。"
          },
          {
            "type": "paragraph",
            "content": "OpenAI 官方文档把 Skill 分成 repo、user、admin 和 system 等几类来源。日常最常见的是三种：Codex 自带的 system Skills；通过插件带进来的 plugin Skills；团队自己维护的自定义 Skills。分清来源，才能判断它是开箱即用、跟插件安装，还是应该放进项目仓库维护。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "官方 Skills 文档",
                "url": "https://developers.openai.com/codex/skills"
              },
              {
                "label": "官方 Plugins 文档",
                "url": "https://developers.openai.com/codex/plugins"
              },
              {
                "label": "openai/skills 仓库",
                "url": "https://github.com/openai/skills"
              }
            ]
          }
        ]
      },
      {
        "heading": "安装前先记住 3 条",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一，system Skill 通常开箱即用。openai-docs、imagegen、skill-installer 这类如果已出现在当前 Skills 列表，无需重复安装。第二，Browser、GitHub、Product Design 往往跟随 plugin 出现；缺失时优先安装对应 plugin。第三，impeccable 这类团队自定义或非官方 Skill，最适合放进 repo 的 `.agents/skills/<skill-name>/`，让整个项目共享同一套工作方式。"
          },
          {
            "type": "paragraph",
            "content": "安装位置不必纠结唯一答案。团队共享 Skill 放 repo 的 `.agents/skills`，跟代码库一起演进；个人长期使用的 Skill 交给 `$skill-installer`，或写入当前 Codex 识别的个人 Skills 目录。安装完成后重启 Codex，避免新 Skill 没被加载。"
          },
          {
            "type": "code",
            "label": "先记住这两个安装位置",
            "content": "团队共享 Skill：\n.repo-root/.agents/skills/<skill-name>/SKILL.md\n\n个人长期 Skill：\n~/.codex/skills/<skill-name>/SKILL.md\n\n不手动管理路径时，优先使用 $skill-installer。安装完成后重启 Codex。"
          }
        ]
      },
      {
        "heading": "不要一次全装：先按工作流分层",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Skill 不适合看到就全装。更稳的顺序是按工作流分层：先装查官方资料和验证页面的基础能力，再装设计和图片能力，最后才装 GitHub、Skill 创作和 plugin 打包能力。每个 Skill 都要对应一段真实工作，而不是只增加一个名字。"
          },
          {
            "type": "paragraph",
            "content": "第一层是“查证和验证”：openai-docs 确认官方规则，browser 检查真实页面。第二层是“设计和实现”：product-design:get-context、product-design:image-to-code、impeccable、imagegen 把想法推进成真实 UI。第三层是“协作和沉淀”：github:yeet、skill-installer、skill-creator、plugin-creator 把一次工作变成可提交、可复用、可分发的团队能力。"
          },
          {
            "type": "code",
            "label": "推荐安装顺序",
            "content": "第 1 批：先保证不会走偏\n- openai-docs\n- browser:control-in-app-browser\n\n第 2 批：开始做真实页面\n- product-design:get-context\n- product-design:image-to-code\n- impeccable\n- imagegen\n\n第 3 批：开始团队协作\n- github:yeet\n- skill-installer\n\n第 4 批：沉淀自己的方法\n- skill-creator\n- plugin-creator"
          }
        ]
      },
      {
        "heading": "1. openai-docs：查模型、查 Codex、查官方做法",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是最容易被低估的一个 Skill。很多人一遇到 Codex、模型升级、Responses API、skills、plugins 之类的问题，第一反应是去搜二手博客，结果很快就会碰到过期信息。openai-docs 的价值在于，它把 Codex 往官方文档路径上拉，尽量基于 OpenAI 当前公开文档给出结论，特别适合处理“这个能力现在到底怎么用”的问题。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括：确认最新模型建议、核对 Codex 当前支持的 customization 方式、查官方推荐的安装与迁移路径、判断某个说法是否来自旧版本。它一般属于 system Skill；当前 Skills 列表里已有时，直接调用即可。"
          },
          {
            "type": "paragraph",
            "content": "它更像“官方事实检查员”，不是普通搜索引擎。写 Codex 教程、升级模型、决定 Skill 放在 repo 还是个人目录、制定团队使用规范之前，都适合先查一次。它能避免一个常见问题：文章写得认真，依据却是几个月前已经过期的接口、命令或产品形态。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $openai-docs，帮我确认当前 Codex 官方文档里关于 Skills 的 3 件事：\n1. Skill 的主要作用是什么。\n2. repo 级自定义 Skill 应该放在哪个目录。\n3. Browser 或 GitHub 这类能力更像 Skill 还是 plugin。\n\n请只引用官方文档，不要混入第三方博客。"
          }
        ]
      },
      {
        "heading": "2. browser:control-in-app-browser：让 Codex 真正看网页",
        "blocks": [
          {
            "type": "paragraph",
            "content": "网站、着陆页、后台和交互页面开发中，这个 Skill 几乎必带。它最大的价值不是“打开浏览器”，而是让 Codex 在真实页面里点击、输入、滚动、截图和验证。很多 UI、布局和交互问题，只有进入真实网页才会暴露。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括：本地页面改完后的走查、首页截图、按钮可用性验证、移动端布局检查、案例采集时抓取网页首屏图。它来自 Browser plugin；Skills 列表缺失时，先安装 Browser 插件。"
          },
          {
            "type": "paragraph",
            "content": "它和普通构建命令的区别在于：`npm run build` 只能证明代码能编译，不能证明页面好用。很多问题只有浏览器里才看得见，例如中文标题换行难看、卡片高度不一致、按钮被遮住、移动端横向溢出、图片加载失败、弹窗关闭不了。做 UI 任务时，browser 应该放在每轮收尾，而不是等到最后才看。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $browser:control-in-app-browser 打开 http://127.0.0.1:5173/ ，只检查首页首屏。\n\n请完成：\n1. 截一张桌面端首页图。\n2. 判断标题、按钮和主视觉是否在第一屏建立了清晰主次。\n3. 如果存在对齐、遮挡或首屏过空的问题，直接指出来。"
          }
        ]
      },
      {
        "heading": "3. impeccable：把“能用”打磨成“像产品”",
        "blocks": [
          {
            "type": "paragraph",
            "content": "代码能生成，不等于界面像成熟产品。impeccable 这类 UI shaping Skill 的价值，是把视觉层级、布局秩序、按钮、卡片、信息密度、响应式和细节统一收紧。它不是替代设计，而是在现有实现上拉高产品完成度。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括官网改版、AI 工具首页、工作台、列表页、详情页和复杂组件收尾优化。impeccable 属于典型团队自定义 Skill。非官方 Skill 最稳的安装方式，是放进 repo 的 `.agents/skills/impeccable/`，让整个项目共用；若托管在 GitHub，也可以交给 `$skill-installer` 从对应 repo/path 安装。"
          },
          {
            "type": "paragraph",
            "content": "使用 impeccable 时，关键是限制范围。先审查，再只改最影响质感的 2 到 3 个问题。按钮太重、卡片太像模板、标题层级不稳、移动端太挤，都比“加一点高级感”更具体。它适合在页面已经能跑之后使用，不适合在需求还没成形时提前介入。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "[$impeccable] 网站首页现在已经能用了，但还不像专业 AI 工具。\n\n请只做产品化优化：\n1. 调整品牌色、按钮、卡片、字体字号和留白。\n2. 强化标题、功能区和主 CTA 的层级。\n3. 删除像模板站的装饰，保留真正有信息价值的模块。\n4. 移动端优先保证主入口和主功能的完整性。\n5. 改完后用浏览器再检查一次。"
          }
        ]
      },
      {
        "heading": "4. product-design:get-context：先把设计问题问明白",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人让 Codex 做页面时，问题不是实现能力不够，而是一上来就给了一个含糊目标。product-design:get-context 的价值，是在真正开始设计和实现前，把产品对象、用户、主流程、视觉方向和交互范围先补齐。它会强迫任务从“给我做个高级网页”变成“给这个产品做一个什么样的网页”。"
          },
          {
            "type": "paragraph",
            "content": "它适合新页面、新产品、新改版的开头阶段，尤其适合方向已有雏形但需求尚未表达清楚的情况。这个 Skill 来自 Product Design plugin；当前会话缺失时，先安装 Product Design 插件。"
          },
          {
            "type": "paragraph",
            "content": "它解决的是“做之前先问清楚”。很多失败页面不是代码失败，而是 brief 失败：目标用户不清楚，主 CTA 不清楚，页面偏内容站还是工具站不清楚，首屏做品牌表达还是直接操作入口也不清楚。get-context 适合把这些模糊点整理成设计简报，再交给 Codex 或 image-to-code 实现。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $product-design:get-context，先帮我补齐这个任务的设计简报：\n\n目标：做一个面向独立开发者的 AI 工具官网。\n已知：产品可以把文本变成信息图。\n未知：视觉方向、首屏信息结构、CTA 路径、信任建立模块。\n\n请先输出一份简洁但完整的 brief，再决定后续页面应该怎么做。"
          }
        ]
      },
      {
        "heading": "5. product-design:image-to-code：把截图或参考图真正落成页面",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这是做内容站、产品站、案例站时很好用的 Skill。它最有价值的地方，是不必把一张优秀网页截图翻译成很长的自然语言描述，而是直接围绕图片实现。参考图质量足够高时，它通常比纯文字描述更稳定，也更容易保住布局比例、视觉节奏和组件关系。"
          },
          {
            "type": "paragraph",
            "content": "适合它的场景包括：复刻首页、把 Figma 导出图转成可运行页面、照着优秀案例做本地原型、或把已有 mockup 变成真实前端。它同样来自 Product Design plugin，因此安装方式和上一个 Skill 一样，缺失时优先补插件。"
          },
          {
            "type": "paragraph",
            "content": "这个 Skill 最怕参考图本身不清楚。完整首屏截图能帮助它判断布局比例、视觉重心和响应式方向；局部截图只能提供有限上下文。实战里最好同时给参考图、目标页面、技术栈、必须复用的组件、不能照搬的地方。目标不是盲目复刻，而是把参考图翻译成适合当前项目的实现。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $product-design:image-to-code，基于我提供的首页截图实现一个响应式网页。\n\n要求：\n1. 保留首屏布局关系和主要视觉比例。\n2. 不要做成营销味太重的着陆页，要像真实 AI 工具。\n3. 按现有代码栈实现，并运行 npm run build。\n4. 桌面和移动端都要检查文字是否溢出。"
          }
        ]
      },
      {
        "heading": "6. imagegen：缺图时，别让页面只能挂占位图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多网页做到最后卡住，不是代码问题，而是缺图。imagegen 的价值就在这里。它适合生成真正能放进网页里的位图资产，比如首屏场景图、概念插图、透明背景产品图、氛围图或社媒配图。"
          },
          {
            "type": "paragraph",
            "content": "最适合的场景是：设计上需要真实 bitmap，而不是 SVG 小图标；案例页缺少头图；需要给某个 AI 产品做更贴题的主视觉；或者要把一张已有图换背景、提清晰度、做风格统一。imagegen 通常是 system Skill，当前会话里可用时直接调用即可。"
          },
          {
            "type": "paragraph",
            "content": "使用 imagegen 时，要先判断页面缺的是“内容图”还是“装饰图”。如果是产品截图、案例头图、Hero 主视觉，生成图是有价值的；如果只是为了填空而加抽象渐变、发光球、无意义插画，反而会让页面更像模板。好的调用方式应该写清楚画面用途、尺寸比例、产品语境、禁止出现的风格，以及图片放在页面哪个位置。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $imagegen，生成一张适合 AI 信息图产品首页 Hero 的宽屏主视觉。\n\n要求：\n- 主题是把文字转成清晰信息图\n- 风格专业、克制、偏白底产品页\n- 不要抽象渐变，不要卡通插画\n- 构图适合网页首屏背景或右侧主图\n- 输出后告诉我更适合放在哪一屏使用"
          }
        ]
      },
      {
        "heading": "7. github:yeet：把本地成果推上 GitHub，而不是停在电脑里",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多项目不是卡在开发，而是卡在发布。github:yeet 这种发布型 Skill 的价值，是把提交、推送、开 draft PR 串成一条稳定出站流程。变更范围、commit message、推送分支、PR 状态都可以按固定节奏处理。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括：本地改动已经完成、需要推送远端、需要清晰提交记录、准备交给团队 review。这个 Skill 来自 GitHub plugin，使用前需要确认 GitHub 插件和仓库授权正常。"
          },
          {
            "type": "paragraph",
            "content": "它不适合在改动还很乱时强行使用。正确节奏是：先完成任务，跑过 build/test，确认 diff 范围合理，再调用 github:yeet 整理提交和 PR。它是“出站发布助手”，不是唯一质量把关人。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $github:yeet，把当前项目里和学习文章相关的修改整理成一次干净提交。\n\n要求：\n1. 先确认变更范围。\n2. 写一条能说明内容主题的 commit message。\n3. 推送当前分支。\n4. 如果合适，创建一个 draft PR。"
          }
        ]
      },
      {
        "heading": "8. skill-installer：安装和分发 Skill",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Skill 用得越多，安装和分发越容易变成负担。skill-installer 的价值，是把“去 GitHub 找、复制目录、命名、放进正确路径、避免重名覆盖”这些琐事收掉。它可以列出 curated Skills，也能从 GitHub repo/path 直接安装，适合快速补强个人工作台。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括：查看 OpenAI 官方 curated Skills 列表、安装公开 Skill、从 GitHub repo 引入团队维护的 Skill、把实验性 Skill 快速放进个人环境。它本身通常是 system Skill，已出现时直接调用；第三方 repo 需要明确给出 repo/path。"
          },
          {
            "type": "paragraph",
            "content": "它最大的好处是减少手动复制造成的低级错误。Skill 目录名、`SKILL.md` 路径、个人安装目录、项目安装目录、重启 Codex 这些细节，只要错一个，新 Skill 就可能不出现。优先用 skill-installer 安装和列举，比手动在文件夹里试错更稳。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $skill-installer：\n1. 先列出当前可安装的 curated Skills。\n2. 如果我给出一个 GitHub repo/path，再从那个地址安装 Skill。\n3. 安装完成后提醒我重启 Codex。"
          }
        ]
      },
      {
        "heading": "9. skill-creator：把一次有效方法沉淀成团队能力",
        "blocks": [
          {
            "type": "paragraph",
            "content": "真正让 Codex 越用越强的，不是临时写出几个好提示词，而是把高命中率方法固化成 Skill。skill-creator 的价值就在这里：把目标、触发条件、说明、脚本和引用资料整理成可复用结构，让同一类任务不再从零开始。"
          },
          {
            "type": "paragraph",
            "content": "它适合流程已经稳定的重复任务，例如 UI 审核、案例抓取、文档整理、API 接入、PR 发布。此时不必继续重复聊天，把方法收进 Skill，后续团队协作会更轻。skill-creator 通常属于 system Skill，开箱即用。"
          },
          {
            "type": "paragraph",
            "content": "判断流程是否值得做成 Skill，可以看三个信号：第一，同一段提示词已经反复复制；第二，任务有固定输入和固定输出；第三，任务中存在容易忘记但必须遵守的规则。学习文章采集、UI 走查、发布前检查、PR 摘要，都适合沉淀成 Skill。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $skill-creator，帮我把“搜索优秀 AI 网页案例并自动整理成站内内容”的流程写成一个 Skill。\n\n要求：\n1. 明确输入、输出和判断标准。\n2. 需要包含网页截图、链接、产品功能摘要和去重规则。\n3. 说明应该放哪些脚本、哪些参考说明。\n4. Skill 名称要能一眼看出用途。"
          }
        ]
      },
      {
        "heading": "10. plugin-creator：当一个 Skill 不够时，把整套能力打包",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当需求从“写一套方法”升级成“还要带工具、命令、MCP、hooks、marketplace 元数据”时，单个 Skill 就不够用了。这时 plugin-creator 更合适。它不负责写页面，而是搭起一整套 Codex 扩展结构，让 Skills、commands、assets 和插件清单作为完整单位安装和分发。"
          },
          {
            "type": "paragraph",
            "content": "适用场景包括：团队内部插件、多 Skill 统一打包、围绕某类工作流做 Codex 扩展。它通常也是内置 Skill 之一，直接调用即可。非官方插件场景下，plugin-creator 是稳妥起点，因为它会先把目录、manifest 和必需文件搭对。"
          },
          {
            "type": "paragraph",
            "content": "可以理解为：Skill 是具体做事方法，plugin 是一组能力的包装和分发单位。沉淀“如何做 UI review”，用 Skill 就够；提供“案例采集 + 截图 + 内容写入 + GitHub 发布”这类组合能力，通常更适合做 plugin。"
          },
          {
            "type": "code",
            "label": "怎么调用",
            "content": "请使用 $plugin-creator，帮我创建一个围绕“网站案例采集与整理”的 Codex plugin。\n\n需要：\n1. 至少包含一个 Skill。\n2. 预留未来接入 MCP 或脚本的结构。\n3. 带上基础 plugin manifest。\n4. 命名要适合团队内部长期维护。"
          }
        ]
      },
      {
        "heading": "非官方 Skill 怎么装最稳",
        "blocks": [
          {
            "type": "paragraph",
            "content": "团队维护的 Skill，最推荐直接跟项目一起放在 `.agents/skills`。这样它和代码库一起演化，成员 clone 仓库后也更容易对齐上下文。单独托管在 GitHub 的 Skill，优先交给 `$skill-installer` 处理，减少目录命名、覆盖冲突和安装位置错误。"
          },
          {
            "type": "paragraph",
            "content": "只有在目录结构很明确时，才建议手动复制 Skill 文件夹。核心原则两条：每个 Skill 都要有自己的 `SKILL.md`；文件夹必须放进 Codex 会扫描的位置。放完之后重启 Codex，否则新 Skill 可能不会立刻出现。"
          },
          {
            "type": "code",
            "label": "安装非官方 Skill 的 3 种方式",
            "content": "方式 1：项目级共享\n.repo-root/.agents/skills/my-skill/SKILL.md\n\n方式 2：个人长期使用\n~/.codex/skills/my-skill/SKILL.md\n\n方式 3：让 Codex 代装\n请使用 $skill-installer，从 GitHub repo/path 安装这个 Skill，并告诉我安装完成后是否需要重启 Codex。"
          }
        ]
      },
      {
        "heading": "这 10 个 Skill，最值得怎么组合",
        "blocks": [
          {
            "type": "paragraph",
            "content": "AI 工具官网或产品站，最顺手的一组通常是：product-design:get-context 补 brief，product-design:image-to-code 做页面骨架，impeccable 做产品化打磨，browser 做走查，imagegen 补主视觉。这样定位、设计、实现、改图和验收不会挤进同一个提示词。"
          },
          {
            "type": "paragraph",
            "content": "长期团队工作流，另一组更重要：openai-docs 查官方做法，skill-creator 把有效经验写成 Skill，plugin-creator 把多套能力打包，skill-installer 负责分发，github:yeet 负责发布。这套链条打通后，Codex 才会从“会回答问题”变成“沿着固定方法持续产出”。"
          },
          {
            "type": "paragraph",
            "content": "内容站或学习资料站，可以用第三种组合：openai-docs 确认官方资料，browser 打开真实网页和本地页面，imagegen 或截图补视觉素材，impeccable 检查文章卡片和详情页阅读体验，最后用 github:yeet 提交。这条链路覆盖查证、采集、写入、排版和发布。"
          },
          {
            "type": "code",
            "label": "真实项目里的组合调用顺序",
            "content": "做一个 AI 工具首页：\n1. $product-design:get-context 先补 brief\n2. $product-design:image-to-code 或 Codex 先实现页面\n3. $imagegen 补主视觉\n4. $impeccable 做设计走查\n5. $browser:control-in-app-browser 做真实页面验证\n6. $github:yeet 提交和开 PR\n\n写一篇学习资料：\n1. $openai-docs 或网页搜索确认来源\n2. Codex 写入内容数据\n3. $browser:control-in-app-browser 打开详情页检查排版\n4. $impeccable 检查阅读体验\n5. $github:yeet 发布"
          }
        ]
      },
      {
        "heading": "核心方法",
        "blocks": [
          {
            "type": "paragraph",
            "content": "真正值得带走的不是 10 个名字，而是判断什么时候该用 Skill。凡是反复出现、流程稳定、容易漏规则的任务，都不该继续靠临时提示词硬撑。先找已有 Skill；没有就安装；再没有就自己写。"
          },
          {
            "type": "paragraph",
            "content": "更直接的执行顺序是四步：先查官方，再选 skill，再进浏览器或 GitHub 做真实验证，最后把有效做法沉淀成 Skill 或 plugin。照这个顺序走，Codex 会越来越像可训练的工作台，而不是一次性代码助手。"
          }
        ]
      }
    ]
  },
  {
    "id": "promptboard-codex-real-developer-case",
    "sourceUrl": "https://levelup.gitconnected.com/i-let-codex-design-and-test-a-frontend-app-for-me-heres-what-actually-happened-a192b514f27e",
    "translationMode": "guidedTranslation",
    "title": "PromptBoard：真实开发者如何用 Codex 做出提示词管理产品",
    "originalTitle": "I Let Codex Design and Test a Frontend App for Me. Here's What Actually Happened",
    "notice": "本文基于开发者公开分享的文章、GitHub 仓库、在线演示和提示词文档整理。PromptBoard 本身是一个演示型开发者工具，但产品结构、页面实现、提示词写法和验证流程都是真实可查的。",
    "hideSourceLink": true,
    "hideSourceNoticeLink": true,
    "sections": [
      {
        "heading": "PromptBoard 是什么产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "PromptBoard 是一个面向开发者的提示词管理产品原型。它要解决的问题并不抽象，而是很具体：当 Codex、Claude Code、Cursor 这类 AI 编程智能体同时进入工作流时，提示词很容易散落在聊天记录、文档和临时文件里，最后既难复用，也难比较效果。PromptBoard 的目标，是把这些提示词重新组织成一个更像产品而不是笔记的工作界面。"
          },
          {
            "type": "paragraph",
            "content": "从公开仓库描述来看，这个原型覆盖了几个很核心的操作：保存提示词、按标签或搜索筛选、打开详情查看用途和内容，以及继续草拟新的提示词。也就是说，它不是只做了一个展示型着陆页，而是把真正的产品表面一起做出来了。对于想学 AI 工具产品怎么落地的人来说，这一点比单纯看一个好看的首屏更有价值。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "GitHub 仓库",
                "url": "https://github.com/sanjaynela/promptBoard"
              },
              {
                "label": "在线演示",
                "url": "https://promptboard-omega.vercel.app"
              }
            ]
          }
        ]
      },
      {
        "heading": "首页为什么看起来像一个真实产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "PromptBoard 的着陆页并不是常见那种只靠大标题和几张功能卡片撑起来的 AI 工具首页。开发者在 README 里明确写了，它想同时展示两件事：一是开发者工具的品牌气质，二是这个产品背后真的存在一个可用的工作台。所以首页不是孤立存在的，它承担的是“先把产品讲清楚，再把用户带到真实工作界面”的作用。"
          },
          {
            "type": "paragraph",
            "content": "从截图和文档能看出，这个首页走的是深色、高对比、偏高级开发者工具的路线，但它没有只把视觉当装饰。Hero 区域里的浮动 UI 卡片、提示词片段、标签和流程节点，本质上都在提前预告这个产品的核心内容是什么。也正因为如此，图片、文案、按钮和页面氛围之间是连起来的，而不是一张漂亮图加一段泛 AI 文案的拼接。"
          },
          {
            "type": "paragraph",
            "content": "如果把它当作产品案例来看，这个首页最值得学的不是“深色配色”本身，而是它如何把品牌表达和功能表达放进同一个首屏。用户一进来既能感受到产品气质，也能猜到后面会看到怎样的工作台。"
          }
        ]
      },
      {
        "heading": "工作台在解决什么工作流问题",
        "image": "https://raw.githubusercontent.com/sanjaynela/promptBoard/main/public/screenshots/dashboard-page.png",
        "imageAlt": "PromptBoard 工作台截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "PromptBoard 的工作台不是一个为了凑页面数量而做出来的附属页，它承担的是产品真正开始工作的地方。仓库说明里提到，这里至少要支持 保存、筛选、查看和继续编写提示词。对一个提示词管理工具来说，这四件事基本就是最核心的主流程。"
          },
          {
            "type": "paragraph",
            "content": "从作者的描述和截图来看，这个界面很像一个真实的中后台工作台：顶部有标题、搜索和过滤项；主区域是提示词列表；旁边有详情面板；同时还保留了新建提示词的入口或表单。这个结构很成熟，因为它把浏览、判断、打开和创建四种动作组织在同一屏里，而不是要求用户在很多页面之间来回跳。"
          },
          {
            "type": "paragraph",
            "content": "更重要的是，这个工作台延续了首页的视觉语言，但没有被首页的气质拖累。它依然是深色、偏高级的开发者工具风格，不过信息层级、可扫描性和操作效率被放在了更前面。这个平衡很难得，因为很多项目一到工具界面就会只剩风格，没有工作流。"
          }
        ]
      },
      {
        "heading": "作者是怎么把 Codex 用进设计流程的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "PromptBoard 最值得反复看的一点，是作者没有把 Codex 只当成“帮我写 React 页面”的工具，而是把整个前端过程拆成了两段。第一段叫 image-guided frontend design，重点不是立刻写代码，而是先通过图像提示词把页面气质、Hero 构图、配色和工作台氛围确定下来。第二段叫 browser-aware iteration，也就是页面出来之后，再回到浏览器里看真实效果，而不是只盯着代码。"
          },
          {
            "type": "paragraph",
            "content": "这是在解决两个完全不同的问题。前一种问题是“页面没有气质，做出来像默认模板”；后一种问题是“页面已经能跑了，但在真实浏览器里层级不清、间距不顺、移动端拥挤”。把这两件事拆开之后，提示词就会更准确，Codex 的行为也更稳定。"
          },
          {
            "type": "code",
            "label": "提示词 1 · 生成 3 个首页视觉方向",
            "content": "请为一个名叫 PromptBoard 的开发者工具生成 3 个首页视觉方向。\n\n产品定位：\n- 面向开发者\n- 用于整理、测试和复用提示词\n- 服务对象包含 Codex、Claude Code、Cursor 这类 AI 编程智能体用户\n\n风格要求：\n- 深色模式优先\n- 像真实 B2B 开发者工具\n- 高级、克制、现代\n- 允许轻微玻璃质感，但不要花哨\n- 可以有少量霓虹点缀\n- 不要卡通，不要插画感过强\n\n请分别给出：\n1. Hero 视觉概念\n2. 产品情绪板方向\n3. 工作台氛围参考\n\n每个方向都要说明：主色、背景氛围、构图重点、适合的页面部位。"
          },
          {
            "type": "code",
            "label": "提示词 2 · 生成首页 Hero 视觉",
            "content": "请生成一个适合开发者工具官网 Hero 区域的宽幅视觉参考图。\n\n要求：\n- 产品主题是提示词管理与工作流协作\n- 深色背景，以海军蓝、石墨黑为主\n- 点缀祖母绿或紫色微光\n- 画面里可以出现浮动 UI 卡片、提示词片段、标签、流程节点\n- 气质要接近高级 SaaS 产品图，而不是概念插画\n- 构图适合放在网页首屏右侧或背景中\n\n输出时请同时说明：\n1. 哪些元素适合继续抽成网页组件\n2. 哪些元素只适合做视觉氛围，不建议直接搬进代码"
          },
          {
            "type": "code",
            "label": "提示词 3 · 按视觉参考落地首屏",
            "content": "请基于已经确定的 PromptBoard Hero 视觉参考，完成首页首屏实现。\n\n目标：\n- 页面不要只是把图片摆上去，而是让布局、按钮、标签、文字层级和图片氛围形成统一语言\n- 产品要像真实开发者工具，而不是普通模板站\n\n页面要求：\n1. 左侧是明确价值主张、简短说明和两个主按钮。\n2. 右侧或下方承接视觉参考图，不能显得像孤立装饰图。\n3. 页面要强调提示词管理、测试和协作，而不是泛 AI 口号。\n4. 控制卡片数量和装饰层级，避免过度模板化。\n5. 完成后运行 npm run build，并总结首屏最能建立产品感的两个细节。"
          }
        ]
      },
      {
        "heading": "为什么浏览器验证是这个案例的关键部分",
        "blocks": [
          {
            "type": "paragraph",
            "content": "PromptBoard 的 README 和提示词文档里都反复强调一点：页面能写出来，不代表体验已经成立。作者专门把浏览器检查列成一条独立工作流，而且关注的问题很具体，比如移动端布局是否拥挤、标题和搜索的层级是否不够清楚、过滤项是否难用、详情面板和创建表单是不是互相抢空间。"
          },
          {
            "type": "paragraph",
            "content": "文档里还写到了几类已经通过浏览器检查修掉的问题：增加工作台页头 的留白，让搜索和标题关系更容易读；把 chip 和控件做得更清楚，提升移动端可点性；同时保住详情面板和创建表单，不让页面一挤就只剩列表；以及重新检查首页 Hero、CTA 和 pricing 区域是否真的支持那张视觉图。这里最有用的启发是，浏览器验证不是抽象地“看看有没有 bug”，而是围绕具体体验点做小而准的修正。"
          },
          {
            "type": "code",
            "label": "提示词 4 · 先做提示词管理工作台",
            "content": "继续开发同一个项目，请新增一个提示词管理工作台。\n\n目标：\n- 用户可以查看、筛选、打开和草拟提示词\n- 页面要像真实工具界面，不像官网延长页\n\n功能结构：\n1. 顶部有标题、搜索和关键过滤项。\n2. 左侧或主区域展示提示词列表。\n3. 右侧展示详情面板，包含标签、用途、内容和备注。\n4. 页面中要保留一个新建提示词的入口或表单。\n5. 整体延续首页的深色高级气质，但优先保证信息层级和可扫描性。\n\n不要做过度重设计。\n先把核心信息架构和操作路径做稳。\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "提示词 5 · 走查工作台真机感",
            "content": "请运行当前项目，并在浏览器中检查 /dashboard 页面。\n\n重点只看这些问题：\n- 移动端布局是否拥挤\n- 标题、搜索和过滤项的层级是否不够清楚\n- 是否存在太紧、太小或不易点击的控件\n- 列表、详情面板和新建表单之间是否互相抢空间\n- 间距、对比度和对齐是否有明显不顺的地方\n\n只做针对性修复：\n- 不要整页重做\n- 不要改变产品定位\n- 保留当前深色高级开发者工具气质\n\n改完以后再次在浏览器中验证，并总结修了哪 3 个最关键的问题。"
          },
          {
            "type": "code",
            "label": "提示词 6 · 走查首页首屏与 CTA",
            "content": "请在浏览器中检查首页，重点关注首屏和 CTA 区域。\n\n请确认：\n1. Hero 图片和页面布局是否真正融为一体。\n2. 标题、说明和按钮是否有明确主次。\n3. 页面在桌面和移动宽度下是否都有足够呼吸感。\n4. 是否存在看起来像模板默认值的区块，例如过多卡片、装饰性标签或不必要的发光效果。\n5. CTA 是否清楚，不要出现多个按钮互相争抢。\n\n请只做有依据的微调，并在改完后重新验证。"
          }
        ]
      },
      {
        "heading": "如果需要照着还原这个产品，可以按这 3 步走",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一步，先做首页气质，不要急着一上来把整个产品做完。把价值主张、视觉方向和产品氛围立住之后，再决定工作台长什么样。第二步，把提示词管理主流程压缩成一屏：搜索、筛选、列表、详情、新建，尽量不要拆得太碎。第三步，一定回到浏览器里检查真实页面，特别是标题层级、控件间距、移动端挤压和 CTA 关系。"
          },
          {
            "type": "paragraph",
            "content": "PromptBoard 这个案例最值得借的，不是某个特定配色或某个单独组件，而是它的节奏感。先把产品讲清楚，再把工作台做出来，最后用浏览器和测试把细节压实。这样做出来的网站，通常会比“一口气让 Codex 做完整站点”更像真实产品。"
          },
          {
            "type": "code",
            "label": "提示词 7 · 交付前验证清单",
            "content": "请把当前项目作为一个准备公开展示的前端作品来做最后验证。\n\n请检查：\n- 关键路由是否都能打开\n- 图片和生成资产路径是否正常\n- 键盘 focus 是否可见\n- 主要按钮和筛选是否可操作\n- 着陆页和工作台在移动端是否仍可用\n- Playwright 或现有测试是否覆盖关键流程\n\n如果发现问题，先修最影响展示质量的部分；如果没有问题，请输出一份简洁的发布前检查总结。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "查看仓库",
                "url": "https://github.com/sanjaynela/promptBoard"
              },
              {
                "label": "打开演示",
                "url": "https://promptboard-omega.vercel.app"
              }
            ]
          }
        ]
      },
      {
        "heading": "核心方法",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例最值得带走的方法，可以概括成三步：先用图像提示词确定产品气质，再把着陆页和工作台拆成可实现的页面任务，最后回到浏览器里做走查和验证。不要一开始就让 Codex 同时解决风格、结构、交互和收尾问题。"
          },
          {
            "type": "paragraph",
            "content": "更实用的执行原则，就是三句话：一个提示词只解决一个阶段的问题；首页必须服务真实产品界面，而不是单独存在；最后一轮一定看浏览器里的真实效果，而不是只看代码。照这个顺序做，产出通常会更像完整产品，也更容易稳定迭代。"
          }
        ]
      }
    ]
  },
  {
    "id": "anthropic-company-wide-claude-code-rollout",
    "sourceUrl": "https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf",
    "translationMode": "guidedTranslation",
    "title": "Anthropic 团队如何使用 Claude Code：10 个内部团队实践",
    "originalTitle": "How Anthropic teams use Claude Code",
    "notice": "本文为 UIcoding 基于 Anthropic 官方 PDF《How Anthropic teams use Claude Code》整理的中文翻译稿，按原文结构保留“团队背景、主要用例、影响、建议”四类信息。本文不额外加入可复制提示词。原文地址：https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf。",
    "sections": [
      {
        "heading": "原文在讲什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Anthropic 在这份资料里采访了内部 Claude Code 重度用户，展示不同部门如何把 Claude Code 用进日常工作。原文不是一篇提示词教程，也不是 CEO 视角的宣言，而是一组跨团队案例：开发者和非技术员工如何处理复杂项目、自动化重复任务，并补上过去限制效率的技能缺口。"
          },
          {
            "type": "paragraph",
            "content": "整份资料覆盖 10 个团队：数据基础设施、产品开发、安全工程、推理、数据科学与可视化、API、增长营销、产品设计、RL 工程和法务。每个章节都围绕同一套结构展开：Claude Code 被用在哪里、带来了什么影响，以及团队给其它组织的采用建议。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "原文 PDF",
                "url": "https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf"
              }
            ]
          }
        ]
      },
      {
        "heading": "数据基础设施团队：让数据工作流自助化",
        "blocks": [
          {
            "type": "paragraph",
            "content": "数据基础设施团队负责组织公司内部业务数据，让各个团队都能使用这些数据。他们把 Claude Code 用在日常数据工程自动化、复杂基础设施问题排查，以及把数据工作流写成文档，让技术和非技术成员都能独立访问、处理数据。"
          },
          {
            "type": "paragraph",
            "content": "原文提到一个 Kubernetes 排障案例：集群无法调度新 pod 时，团队把监控面板截图交给 Claude Code，Claude Code 引导他们在 Google Cloud UI 中逐步定位到 pod IP 地址耗尽，并给出创建新 IP 池、添加到集群的具体命令，避免临时拉网络专家介入。"
          },
          {
            "type": "paragraph",
            "content": "他们还让财务团队用纯文本描述数据流程，例如查询某个看板、运行查询、生成 Excel 输出。Claude Code 读取这些流程后自动执行，并在需要日期等输入时主动询问。新入职的数据科学家也会用 Claude Code 导航庞大代码库，理解 Claude.md 文档、相关文件和数据管道依赖。"
          },
          {
            "type": "paragraph",
            "content": "这类用法带来的影响包括：不用专门专家也能解决部分基础设施问题；新人更快理解复杂系统；支持团队可以处理更多看板和异常；没有编程经验的财务团队也能独立执行复杂数据流程。团队建议是：认真写 Claude.md，用 MCP server 处理敏感数据访问，并通过团队演示分享 Claude Code 的具体工作流。"
          }
        ]
      },
      {
        "heading": "产品开发团队：原型、测试和代码库探索",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Claude Code 团队自己也使用 Claude Code 来开发 Claude Code，包括企业能力和 agentic loop 相关功能。对快速原型，他们会开启 auto-accept mode，让 Claude 写代码、跑测试并持续迭代；工程师再接手约 80% 完成度的方案做最终打磨。"
          },
          {
            "type": "paragraph",
            "content": "对核心业务逻辑相关功能，团队会同步监督 Claude Code，给出更具体的实现要求，实时检查代码质量、样式规范和架构方向。原文还提到 Vim key bindings 的案例：这个功能大约 70% 的最终实现来自 Claude 的自主工作。"
          },
          {
            "type": "paragraph",
            "content": "他们还用 Claude Code 生成测试、处理 PR review 中发现的简单 bug，并通过 GitHub Actions 集成自动处理格式问题或函数重命名等评论。面对不熟悉的 monorepo 或 API 代码，团队会直接向 Claude Code 询问系统如何工作，以减少等待同事回复带来的上下文切换。"
          },
          {
            "type": "paragraph",
            "content": "原文总结的建议是：给 Claude 建立能自我验证的循环，让它自动运行 build、test 和 lint；学会区分适合异步交给 Claude 的边缘任务，和必须同步监督的核心逻辑；当代码库里存在名称相近的组件或函数时，说明必须足够具体。"
          }
        ]
      },
      {
        "heading": "安全工程团队：排障、审查和 runbook",
        "blocks": [
          {
            "type": "paragraph",
            "content": "安全工程团队负责软件开发生命周期安全、供应链安全和开发环境安全。他们把 Claude Code 大量用于写代码和调试代码，尤其是在事故处理、基础设施审查、文档综合和跨项目贡献上。"
          },
          {
            "type": "paragraph",
            "content": "处理事故时，他们会把 stack trace 和文档交给 Claude Code，让它追踪代码库中的控制流。原本需要 10 到 15 分钟人工扫代码的问题，可以在约 5 分钟内理解。对需要安全审批的 Terraform 变更，他们会把 plan 复制给 Claude Code，询问变更会做什么、是否会后悔，从而缩短安全 review 周期。"
          },
          {
            "type": "paragraph",
            "content": "团队还让 Claude Code 吸收多个文档源，生成 markdown runbook、排障指南和概览。相比反复搜索完整知识库，把这些压缩文档作为真实问题排查上下文更高效。原文也提到他们把 markdown 规格写进代码库，再用 Claude Code 编写、审查和执行这些规格，让成员能在几天而不是几周内贡献到已有项目。"
          },
          {
            "type": "paragraph",
            "content": "安全团队的建议包括：大量使用自定义 slash command，因为这能把重复安全流程标准化；让 Claude Code 先自主展开工作，再定期检查；除了写代码，也要把它用于文档综合，并提供写作样例和格式偏好，减少在 Slack、Google Docs 等工具之间来回切换。"
          }
        ]
      },
      {
        "heading": "推理团队：补齐机器学习和代码库理解缺口",
        "blocks": [
          {
            "type": "paragraph",
            "content": "推理团队管理 Claude 读取提示词和生成回复时使用的记忆系统。对没有机器学习背景的新成员来说，Claude Code 可以快速解释模型相关函数、设置和代码结构，帮助他们跨过知识门槛。"
          },
          {
            "type": "paragraph",
            "content": "团队用 Claude Code 快速理解复杂代码库：不用手动搜索 GitHub repo，也不用先问同事，而是直接让 Claude 找出某个功能由哪些文件调用。写完核心功能后，他们会让 Claude 生成覆盖边界情况的单元测试，把原本消耗大量脑力的测试补齐工作压缩到几分钟。"
          },
          {
            "type": "paragraph",
            "content": "在机器学习概念解释上，原文给出的量化效果很明确：过去可能要花 1 小时搜索和读文档的问题，现在通常 10 到 20 分钟就能弄清楚，研究时间减少约 80%。在跨语言测试场景里，团队还会描述想测试什么，让 Claude 用 Rust 等不熟悉语言写出对应逻辑。"
          },
          {
            "type": "paragraph",
            "content": "他们的建议是：先测试 Claude Code 是否能比搜索更快回答知识库问题；从具体代码生成开始建立信任，再扩大到复杂任务；把单元测试生成作为日常开发压力的缓冲，让 Claude 帮助覆盖容易遗漏的测试情况。"
          }
        ]
      },
      {
        "heading": "数据科学与可视化团队：从一次性 notebook 到持久分析工具",
        "blocks": [
          {
            "type": "paragraph",
            "content": "数据科学和 ML 工程团队需要复杂可视化工具来理解模型表现，但构建这些工具常常要求掌握不熟悉的语言和框架。Claude Code 让他们在不成为全栈开发者的情况下，构建生产级分析看板。"
          },
          {
            "type": "paragraph",
            "content": "原文提到，团队即使几乎不了解 JavaScript 和 TypeScript，也能让 Claude Code 从零写出完整 React 应用，用于可视化 RL 模型表现和训练数据。一个例子是 5000 行 TypeScript 应用。因为这类可视化应用上下文相对低，不需要理解整个 monorepo，所以适合快速原型。"
          },
          {
            "type": "paragraph",
            "content": "他们还把 Claude Code 用在重复重构、merge conflict 和半复杂文件调整上：先提交当前状态，让 Claude 自主跑 30 分钟，成功就接受，不行就从干净状态重来。更重要的是，他们把一次性 Jupyter notebook 转成可复用 React dashboard，让模型评估不再依赖临时分析脚本。"
          },
          {
            "type": "paragraph",
            "content": "团队影响包括 2 到 4 倍节省时间、用不熟悉语言构建复杂应用、从一次性 notebook 转向持久工具，以及用可视化支持模型训练和评估决策。建议是：像 slot machine 一样先保存状态再让 Claude 尝试；发现方案过复杂时及时打断，要求它尝试更简单的方法。"
          }
        ]
      },
      {
        "heading": "API Knowledge 团队：把 Claude Code 当作进入代码库的第一站",
        "blocks": [
          {
            "type": "paragraph",
            "content": "API Knowledge 团队负责 PDF 支持、引用、网页搜索等功能，这些功能会把额外知识带进 Claude 的上下文窗口。由于他们长期在大型复杂代码库中工作，常常需要先弄清应该看哪些文件、系统架构如何连接，才能开始修改。"
          },
          {
            "type": "paragraph",
            "content": "他们把 Claude Code 作为任何任务的第一站：修 bug、开发功能或做分析时，先让 Claude Code 指出应该检查哪些文件。这替代了手动导航代码库、搜集上下文的耗时过程。团队成员也因此更敢独立处理陌生区域的 bug，而不是先找别人帮忙。"
          },
          {
            "type": "paragraph",
            "content": "另一个用法是通过 dogfooding 体验模型迭代。Claude Code 会自动使用最新研究模型 snapshot，因此团队可以直接感知模型行为变化。相比之前发布流程中较少亲身体验模型变化，这给他们提供了更直接的反馈。"
          },
          {
            "type": "paragraph",
            "content": "这类使用减少了把代码片段复制到 Claude.ai、拖文件、反复解释问题的心理负担。团队建议把 Claude Code 当作迭代伙伴，而不是一次性答案机器；在不熟悉领域也可以先让它建立信心；开始时只提供必要信息，让 Claude 引导后续过程。"
          }
        ]
      },
      {
        "heading": "增长营销团队：把重复营销任务自动化",
        "blocks": [
          {
            "type": "paragraph",
            "content": "增长营销团队负责付费搜索、付费社交、移动应用商店、邮件营销和 SEO 等表现营销渠道。原文特别指出，这是一个非技术的一人团队，因此他们使用 Claude Code 自动化重复营销任务，构建原本需要工程资源的 agentic 工作流。"
          },
          {
            "type": "paragraph",
            "content": "他们构建了 Google Ads 创意生成工作流：读取包含数百条广告及表现指标的 CSV，识别表现较差的广告并生成新变体，同时遵守标题 30 字符、描述 90 字符等限制。这个系统用两个专门 sub-agent 分别处理标题和描述，能在几分钟内生成数百条广告。"
          },
          {
            "type": "paragraph",
            "content": "团队还开发了 Figma 插件，用来批量生成付费社交广告静态图变体；创建 Meta Ads MCP server，在 Claude Desktop 中直接查询投放表现、花费和广告效果；并实现基础记忆系统，把广告实验假设和结果带入后续变体生成，形成自我改进的测试框架。"
          },
          {
            "type": "paragraph",
            "content": "影响很直接：广告文案创建从 2 小时降到 15 分钟，创意产出提升 10 倍，一人团队可以承担过去需要工程资源的任务，并把更多时间放在策略和自动化设计上。建议是优先寻找有 API 的重复任务，把复杂工作流拆成专门 sub-agent，并在写代码前先充分梳理完整流程。"
          }
        ]
      },
      {
        "heading": "产品设计团队：设计师也能直接实现原型和细节",
        "blocks": [
          {
            "type": "paragraph",
            "content": "产品设计团队支持 Claude Code、Claude.ai 和 Anthropic API，专注 AI 产品设计。原文强调，即使是非开发者，也可以用 Claude Code 缩短设计和工程之间的传统距离，直接实现自己的设计意图，而不必经历大量来回沟通。"
          },
          {
            "type": "paragraph",
            "content": "他们用 Claude Code 做前端 polish 和状态管理修改，例如字体、颜色、间距等视觉细节，不再先写大量设计说明再让工程师实现。工程师也观察到，设计师开始做一些过去通常不会由设计师完成的大型状态管理变更。"
          },
          {
            "type": "paragraph",
            "content": "设计团队还通过 GitHub Actions 集成提交 issue 或 ticket，让 Claude 自动提出代码解法；把 mockup 图片粘贴给 Claude Code，生成可运行交互原型；让 Claude 映射错误状态、逻辑流和系统状态，在设计阶段提前发现边界情况。原文举例：移除全代码库中的“research preview”文案并和法务实时协调，原本可能需要一周来回沟通，最后用两次 30 分钟电话完成。"
          },
          {
            "type": "paragraph",
            "content": "影响包括：Claude Code 成为核心设计工具，Figma 和 Claude Code 约 80% 时间同时打开；视觉和状态管理变更执行快 2 到 3 倍；一些跨团队复杂项目从一周压缩到数小时。建议是：让工程师帮助非开发者完成仓库和权限初始配置；用自定义记忆文件说明自己是设计师、需要更详细解释和小步修改；充分利用截图粘贴，把静态 mockup 变成可交互原型。"
          }
        ]
      },
      {
        "heading": "RL 工程团队：小中型功能、调试和可回滚实验",
        "blocks": [
          {
            "type": "paragraph",
            "content": "RL 工程团队关注 RL 中的高效采样和集群中的权重传输。他们主要把 Claude Code 用于小到中型功能开发、调试和理解复杂代码库，并采用频繁 checkpoint 和 rollback 的迭代方式。"
          },
          {
            "type": "paragraph",
            "content": "在功能开发中，他们让 Claude Code 编写小中型功能的大部分代码，例如为权重传输组件实现认证机制；人类负责监督，并在 Claude 偏离方向时介入。实现完成后，他们也会让 Claude Code 补测试或 review 代码，节省例行质量保障任务的时间。"
          },
          {
            "type": "paragraph",
            "content": "他们对 Claude Code 的调试评价比较克制：有时能立刻定位问题并补相关测试，有时会难以理解问题，但整体仍有价值。工作流中最大的变化之一，是用 Claude Code 快速总结相关组件和 call stack，替代手动读代码或生成大量调试输出。"
          },
          {
            "type": "paragraph",
            "content": "原文也保留了限制：Claude Code 第一次就成功实现小中型 PR 的概率大约三分之一，其余情况需要继续引导或人工介入。团队建议在 Claude.md 中加入针对常见错误的具体规则，频繁提交 checkpoint 以便回滚，并可以先让 Claude one-shot 尝试，失败后再切换到更协作的引导模式。"
          }
        ]
      },
      {
        "heading": "法务团队：非技术团队的原型能力",
        "blocks": [
          {
            "type": "paragraph",
            "content": "法务团队通过实验和了解 Anthropic 产品能力，发现了 Claude Code 对非开发者的价值。原文中既有个人可访问性工具案例，也有面向法务部门内部流程的原型案例。"
          },
          {
            "type": "paragraph",
            "content": "有团队成员为存在说话困难的家庭成员构建沟通助手：用原生语音转文字、预测回复，并通过 voice bank 读出回复。这个应用在约 1 小时内完成，用来补足言语治疗师推荐工具无法满足的空白。"
          },
          {
            "type": "paragraph",
            "content": "在工作场景中，他们构建了原型化的“phone tree”系统，帮助成员找到 Anthropic 内部合适的律师；管理者也构建了 G Suite 应用，自动化每周团队更新并跟踪产品法务 review 状态，让律师用简单按钮标记需要 review 的事项，而不是维护电子表格。"
          },
          {
            "type": "paragraph",
            "content": "法务团队的工作方式是先在 Claude.ai 中充分构思和规划，再转到 Claude Code 实现，并要求它放慢速度、一步步做。他们也会大量使用截图表达界面想法。原文同时提醒，随着 MCP 集成让 AI 工具访问更敏感系统，安全和合规边界会变得更关键。"
          }
        ]
      },
      {
        "heading": "这份资料的共同线索",
        "blocks": [
          {
            "type": "paragraph",
            "content": "把 10 个团队放在一起看，Claude Code 在 Anthropic 内部并不是单一“写代码工具”。对工程团队，它是代码库导航、测试、调试和原型工具；对数据、增长、设计和法务，它是把文字、截图、流程和 API 连接成可执行工作的桥梁。"
          },
          {
            "type": "paragraph",
            "content": "原文反复出现的关键词不是“万能自动化”，而是上下文、检查点、文档、可回滚、迭代和人类监督。团队越能把规则、工作流、权限和期望写清楚，Claude Code 越能承担更长、更复杂的任务；反过来，越高风险、越核心的逻辑，越需要同步监督和人工判断。"
          }
        ]
      }
    ]
  },
  {
    "id": "pallyy-74k-mrr-solo-founder-retrospective",
    "sourceUrl": "https://www.indiehackers.com/post/heres-how-i-ve-built-pallyy-to-74k-mrr-solo-a5d9c78766",
    "translationMode": "guidedTranslation",
    "title": "从自学写代码到 $74K MRR：Pallyy 一人公司复盘",
    "originalTitle": "Here's how I've built Pallyy to $74K MRR solo.",
    "notice": "本文基于 Tim B 在 Indie Hackers 的创始人复盘，以及 Pallyy 当前官网信息整理。文中涉及的学习周期、MVP 时间、首次获客方式、功能取舍和 $74K MRR 规模，均来自作者公开分享；当前产品定位和官网表达，则对照了 Pallyy 官方网站。",
    "sections": [
      {
        "heading": "Pallyy 现在是什么产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Pallyy 现在是一个 social media management platform。官网首屏的表述非常直接：用一个简单日历统一完成 plan、approve、schedule 和 publish。它服务的对象也很明确，不是只做给个人博主的小工具，而是 agencies、brands 和 creators 都能用的社媒协作平台。"
          },
          {
            "type": "paragraph",
            "content": "这点很重要，因为 Tim B 最早做出来的并不是今天这个完整产品。他一开始做的只是一个很基础的 Instagram analytics MVP。也就是说，Pallyy 后来的结果并不是因为一开始就想清楚了全部产品形态，而是一路沿着真实用户需求，从 analytics 慢慢长成 scheduling + approval + publishing 的更完整平台。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "产品网站",
                "url": "https://pallyy.com/"
              },
              {
                "label": "创始人复盘原文",
                "url": "https://www.indiehackers.com/post/heres-how-i-ve-built-pallyy-to-74k-mrr-solo-a5d9c78766"
              }
            ]
          }
        ]
      },
      {
        "heading": "这篇复盘最打动人的地方",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Pallyy 这篇复盘最厉害的地方，是它把“高收入一人公司”的故事讲得非常不神话。Tim B 在文章开头就写得很简洁：今天是他作为 solo founder 的最后一天，然后开始回头复盘自己是怎么把 Pallyy 做到 $74K MRR 的。接着他没有先讲增长技巧，而是先讲了最基础的一步：自己先花了大约 6 个月学习 HTML、CSS、JS 和 Nuxt。"
          },
          {
            "type": "paragraph",
            "content": "这让整个故事一下子可信了很多。很多人看到结果会以为它是一个天生会写代码的人做成的产品，但作者公开给出的第一步恰恰是“先学会写代码”。而且他的学习方式也很朴素：下班后每天晚上花几个小时，用 CodeCademy 这种免费学习平台慢慢补。它提醒人的地方在于，很多长期有效的一人公司，不是靠一夜之间的技术跃迁，而是靠一个人愿意持续把基础补起来。"
          }
        ]
      },
      {
        "heading": "真正开始赚钱前，Pallyy 长什么样",
        "blocks": [
          {
            "type": "paragraph",
            "content": "学完基础以后，Tim B 花了 30 天做出第一个 MVP。这个 MVP 并不是今天官网上的完整社媒平台，而是一个 Instagram analytics 平台。它当时的“差异点”也很具体：用户可以把自己的 Instagram analytics 分享给其他人。作者自己也承认，这个产品非常基础。"
          },
          {
            "type": "paragraph",
            "content": "接着是一个很真实的上线场景：他没有观众，Product Hunt 也几乎没有带来回应。原文里写得很直接，launching was un-eventful，on Product Hunt didn't do well and got almost no response. 这段很值得记，因为它说明即使后来做到 $74K MRR，最开始也不是靠一个漂亮 launch 一炮而红。"
          },
          {
            "type": "paragraph",
            "content": "第一批付费用户是怎么来的？作者给的答案非常具体：一个朋友手里有个免费的 IG analytics 工具，把那个入口直接重定向到了他的产品，最后给他带来了大约 100 个每月 5 美元的客户。也就是说，Pallyy 最早的付费起点，不是复杂增长系统，而是一个极其具体的流量转接。"
          }
        ]
      },
      {
        "heading": "真正让产品长起来的，不是首个功能，而是承认它没用",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Pallyy 复盘里最值得反复看的一个瞬间，是作者主动承认自己一开始做的核心差异点没人要。那套“分享 Instagram analytics”功能，原文里说得很重：absolutely nobody wanted。于是他把它砍掉，转而把精力重新集中到 数据看板本身。"
          },
          {
            "type": "paragraph",
            "content": "很多一人项目做不下去，往往不是因为没人用，而是作者不愿意承认自己最初最在意的功能并不重要。Tim B 的处理方式很干脆：砍掉，回到真正被使用的部分。这种判断力后面继续出现。文章里还写到，之后差不多有近 2 年时间，增长几乎完全停滞。用户同时想要 scheduling 和 analytics，但那时 Instagram scheduling 因为 API 限制还做不了。也就是说，产品需求已经指向下一步了，但外部条件没跟上。"
          },
          {
            "type": "paragraph",
            "content": "从复盘口径来看，Pallyy 后面之所以能继续长，关键并不是把旧 MVP 优化得更漂亮，而是顺着真实需求把产品往 scheduling platform 的方向推。这也是它后来能从一个 analytics 小工具，变成今天这种完整社媒工作台的原因。"
          }
        ]
      },
      {
        "heading": "做到 $74K MRR，这个故事最值得学的不是“增长技巧”",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果只看标题，很容易把这篇文章理解成“如何做到 $74K MRR”的增长帖。但真正读进去以后，会发现它更像是一篇关于长期取舍的复盘。作者并没有给出一串短平快的 marketing tricks，而是把增长前面那些更难熬的阶段老实写出来：先学代码、30 天做 MVP、Product Hunt 失利、靠一个朋友的工具导流拿到前 100 个客户、发现差异功能没人要、经历长时间平台期，再慢慢把产品往更大的需求上挪。"
          },
          {
            "type": "paragraph",
            "content": "这也是为什么它比很多“XX 天做到 $10k MRR”的帖子更值得学。因为大多数独立开发者真正会遇到的，不是某个广告投放技巧，而是：第一个产品形态对不对，没人理你的时候怎么办，前 100 个付费客户从哪来，哪些功能该砍，长时间不增长时还能不能继续做下去。Pallyy 这篇文章没有回避这些问题，所以它的参考价值很高。"
          }
        ]
      },
      {
        "heading": "如果只带走 3 个方法，应该带走什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一，不要等“技术准备完全好了”才开始做产品，但也不要轻视学习基础代码的价值。Tim B 先花 6 个月补 HTML、CSS、JS 和 Nuxt，然后才进到 30 天 MVP，这个顺序并不花哨，却很稳。第二，前 100 个客户的来源要尽量具体。对他来说，那不是宏大的 launch，而是一个朋友已有工具的导流。第三，最重要的功能不一定是你最初以为的那个功能。没人要的功能，越早砍越好。"
          },
          {
            "type": "paragraph",
            "content": "把这 3 点连起来，其实就是一条很朴素的独立开发路线：先把能力补到能交付，再做一个非常窄的 MVP，用一个具体入口拿到最早的付费用户，然后顺着真实需求继续长。Pallyy 现在看起来像一个成熟平台，但它最初的起点其实非常小。也正因为起点小、反馈真、取舍狠，它才有机会一路长到今天这个收入规模。"
          }
        ]
      }
    ]
  },
  {
    "id": "ivabot-solo-founder-first-stripe-retrospective",
    "sourceUrl": "https://www.indiehackers.com/post/im-a-solo-founder-it-took-me-9-months-and-at-least-3-stack-rewrites-to-ship-my-saas-a66b5fbe33",
    "translationMode": "guidedTranslation",
    "title": "9 个月、3 次重写、第一笔 Stripe：IvaBot 一人公司 AI Coding 复盘",
    "originalTitle": "I'm a solo founder. It took me 9 months and at least 3 stack rewrites to ship my SaaS.",
    "notice": "本文基于 Galyna Arikh 在 Indie Hackers 的创始人复盘，以及 IvaBot 当前官网信息整理。文中涉及的时间线、重写过程、成本变化和第一笔 Stripe 收款，均来自作者公开叙述；产品定位、定价方式和功能结构，则对照了当前官网内容。",
    "sections": [
      {
        "heading": "IvaBot 现在是什么产品",
        "image": "/learn-screenshots/ivabot-og.png",
        "imageAlt": "IvaBot 官网预览图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "IvaBot 是一个面向 small business 和 content creators 的 AI SEO 工具。作者在复盘里把它概括成 3 个模块：technical audit、content coverage 和 content generation。官网当前也延续了这个定位，强调它不仅帮你查站点 SEO 问题，还会找关键词机会、写内容，并检查内容是否更容易被 Google 排名、被 AI 工具引用。"
          },
          {
            "type": "paragraph",
            "content": "从当前官网可读到的信息看，它的商业模式并不是重订阅，而是 pay-as-you-go。首页 schema 和 FAQ 里都写得比较清楚：入门包从 5 美元开始，没有订阅，按 credits 使用。这一点和作者在复盘里强调的方向是一致的，她想做的不是另一个每月 50 到 300 美元起步的 SEO 工具，而是一个更适合 solo founders 和小团队的小额入口产品。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "产品网站",
                "url": "https://ivabot.xyz"
              },
              {
                "label": "创始人复盘原文",
                "url": "https://www.indiehackers.com/post/im-a-solo-founder-it-took-me-9-months-and-at-least-3-stack-rewrites-to-ship-my-saas-a66b5fbe33"
              }
            ]
          }
        ]
      },
      {
        "heading": "为什么这篇复盘值得看",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这篇复盘最有价值的地方，在于它不是“我用 AI 两周做到 1 万 MRR”那类故事。Galyna Arikh 在文中说得非常坦白：她不是开发者，也不是 CSS 人。她带进来的背景是 15 年 SEO 经验、一些项目管理经验，以及数字插画兴趣；后端、数据库、webhooks 这些技术点，基本都是第一次碰，而且是边做边学。"
          },
          {
            "type": "paragraph",
            "content": "她对 AI 的定义也很朴素，不是把 AI 写成万能代工厂，而是明确说“AI was my teacher”。前六个月，ChatGPT 主要在教她提示词、HTTP 请求、JSON 解析、webhooks 和真实数据库怎么接；后面切到 Claude 之后，开发速度才明显提起来。这种表述很重要，因为它更接近多数独立开发者真正会遇到的过程：不是一句话生成产品，而是借 AI 把自己带进能做产品的能力区间。"
          },
          {
            "type": "paragraph",
            "content": "另外，它已经跨过了最关键的一道坎。作者在文章摘要和正文里都写到：距离发文往前两周，她拿到了第一笔 Stripe 付款。对创业复盘来说，这个信号非常重要，因为它意味着这不再只是一个练习项目，而是一个已经开始被真实用户付费验证的产品。"
          }
        ]
      },
      {
        "heading": "3 次重写到底重写了什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者把自己的前两个方案都写得很清楚。Plan A 是 Telegram chatbot，但她很快意识到真正会用这种交互形态的人大概只有 10 个左右，所以这条路很早就被放弃了。这个判断很重要，因为它说明第一轮失败并不是技术失败，而是产品形态不成立。"
          },
          {
            "type": "paragraph",
            "content": "Plan B 是 Typebot chat + Webflow landing 的组合。她在 Typebot 免费层里把整条 decision tree 搭起来，并把 Webflow、Memberstack、Stripe、Supabase、SerpDev 和 Make 串成了一套能工作的 no-code / low-code 流水线。也正是在这一轮，她学会了很多最基础但最关键的工程能力：怎么写更有效的提示词，怎么组织逻辑，怎么发 HTTP 请求，怎么解析 JSON，怎么接 webhooks，怎么和真实数据库打交道。"
          },
          {
            "type": "paragraph",
            "content": "但这一轮的问题是成本。作者给出的数字非常直白：在还没卖出任何东西之前，月成本已经接近 200 美元，这对一个刚起步的一人项目来说不可持续。于是她进入第三轮真正意义上的重写：把开发工作切到 Claude，重建 backend，把文件放上 GitHub，去掉 Typebot，去掉 Memberstack，改用 Supabase Auth，同时把数据供应商从 SerpDev 换成按量付费、价格更低的 DataForSEO。做完这一轮之后，月成本降到大约 40 美元，差不多是 5 倍改善。"
          }
        ]
      },
      {
        "heading": "它是怎么从练习项目变成付费产品的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "作者在正文里给出了一个非常清楚的时间点：IvaBot 在 2026 年 4 月 29 日带着 live Stripe 正式上线。到她在 Indie Hackers 发文时，第一笔付费交易已经发生在两周前。这个时间点很值得记，因为它说明前 9 个月的工作并不是一直在空转，最后确实落到了“可收钱”的状态。"
          },
          {
            "type": "paragraph",
            "content": "更有意思的是，作者没有把增长写得很夸张。她提到当时的几个真实信号包括：一篇关于 ChatGPT、Perplexity、Claude 和 Google AI 会引用不同来源的博客文章开始有点 viral；Google Search Console 已经出现最初的 impressions 和 clicks；产品本身已经形成 3 个模块、5 美元起步、按次付费的基础商业结构。换句话说，这个项目不是靠一个爆款 launch 一步到位，而是在“能上线”“能收款”“有人开始看到”这几个节点上慢慢跨过去。"
          }
        ]
      },
      {
        "heading": "作者自己承认，如果重来会更早做什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这篇复盘最实在的一段，是作者最后直接写了自己会怎么重来。她给出的答案很具体：GitHub repo 应该从第一天就建；不该再走 no-code stack；应该更早跳过 Memberstack，把这笔钱直接花在 Claude credits 上，然后把 auth properly build 好；安全问题也该从第一天考虑，而不是最后再补；同时，应该更早用 Claude。"
          },
          {
            "type": "paragraph",
            "content": "这几句看起来平常，其实信息量很大。它说明她不是在事后神化自己的路径，而是已经能分辨：哪些工具只是让自己更快启动，哪些工具会在后面拖垮成本和维护；哪些看似省事的 no-code 选择，最后会变成长期负担；以及什么时候应该把预算从软件堆栈转向真正提高产出的 AI 能力。对一人公司来说，这比“选什么最先进框架”更有现实意义。"
          }
        ]
      },
      {
        "heading": "这个案例最值得带走的方法",
        "blocks": [
          {
            "type": "paragraph",
            "content": "IvaBot 这个案例真正值得带走的，不是某个单点技术，而是它展示了一条非常真实的 AI Coding 创业路径：先用最容易启动的形态验证方向，再在成本和控制权之间做取舍，然后把 AI 从“代写工具”用成“学习加速器”。作者没有把重写看成纯浪费，而是把每一轮重写都当成降低成本、补能力和逼近真实用户的过程。"
          },
          {
            "type": "paragraph",
            "content": "如果要把这篇复盘压缩成一句执行建议，那就是：不要只盯着开发速度，要同时看产品形态、月成本、支付是否跑通，以及自己有没有在这个过程中获得更强的独立交付能力。对一人公司来说，第一笔 Stripe 收款和每月成本从 200 美元降到 40 美元，往往比“用了多少前沿名词”更说明问题。"
          }
        ]
      }
    ]
  },
  {
    "id": "figma-ai-coding-design-system-mcp-workflow",
    "sourceUrl": "https://engineering.monday.com/how-we-use-ai-to-turn-figma-designs-into-production-code/",
    "translationMode": "guidedTranslation",
    "title": "设计师如何用 Figma + AI Coding 保证界面还原：monday.com 的 Design-System MCP 经验",
    "originalTitle": "How We Use AI to Turn Figma Designs into Production Code",
    "notice": "本文为 UIcoding 基于 monday.com 工程团队文章和 Figma 官方 MCP 工作流整理的中文学习稿，不是原文全文翻译。核心参考：monday.com《How We Use AI to Turn Figma Designs into Production Code》、Figma 官方《Inside Figma: The workflow we use to turn design exploration into developer-ready code with MCP》。",
    "sections": [
      {
        "heading": "为什么本文值得设计师看",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多设计师第一次尝试 AI Coding，会把 Figma 链接、截图或页面说明丢给 Cursor、Claude Code 或 Codex，然后期待它自动生成一个高度还原的页面。结果通常是：第一眼还像，但细节不对；颜色被硬编码；字体、间距、圆角、状态、组件用法都偏了；代码也没有使用团队的设计系统。"
          },
          {
            "type": "paragraph",
            "content": "monday.com 的经验很有价值，因为他们没有把问题简化成“让 AI 看懂 Figma”。他们真正解决的是：如何让 AI 在生成代码时理解 monday design system，包括组件、props、tokens、布局规则、可访问性和代码示例。这样 AI 不是凭感觉还原界面，而是在团队既有系统里实现界面。"
          },
          {
            "type": "paragraph",
            "content": "这对设计师特别重要。因为界面还原不是只看视觉相似度，而是看生成结果是否符合设计系统、是否可维护、是否能被工程团队接受、是否能在后续迭代里继续稳定复用。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "monday.com 工程团队文章",
                "url": "https://engineering.monday.com/how-we-use-ai-to-turn-figma-designs-into-production-code/"
              },
              {
                "label": "Figma MCP 工作流文章",
                "url": "https://www.figma.com/blog/inside-figma-dev-mode-mcp-server/"
              }
            ]
          }
        ]
      },
      {
        "heading": "直接把 Figma 链接丢给 AI 为什么不够",
        "blocks": [
          {
            "type": "paragraph",
            "content": "monday.com 文章里提到的核心问题很真实：即使模型能读取 Figma，也不代表它知道公司内部设计系统怎么用。它可能会看出按钮是蓝色的，却不知道应该使用哪个 Button 组件；它可能看出文字大小，却不知道应该映射到哪个 typography token；它可能知道布局像卡片，却不知道团队的 Card 组件有哪些 props。"
          },
          {
            "type": "paragraph",
            "content": "这就是为什么“像素级截图还原”并不等于“生产级代码”。截图还原关心表面，生产级实现关心系统：组件是否正确、样式是否 token 化、状态是否完整、交互是否可访问、文案是否能本地化、埋点是否符合规范、代码是否能被团队继续维护。"
          },
          {
            "type": "code",
            "label": "错误用法：只给 Figma 链接",
            "content": `请根据这个 Figma 链接实现页面：
https://www.figma.com/design/...

要求尽量还原视觉效果。`
          },
          {
            "type": "code",
            "label": "更好的用法：给设计系统约束",
            "content": `请根据这个 Figma 页面实现对应 UI，但不要只做视觉近似。

你必须遵守：
1. 优先使用项目已有组件，不要手写重复组件。
2. 颜色、字号、间距、圆角、阴影必须使用设计 token，不要硬编码。
3. Button、Input、Card、Modal、Tabs、Toast 等必须使用 design system 组件。
4. 如果 Figma 中的样式无法映射到现有 token，请先列出差异，不要擅自新增颜色。
5. 必须实现 default、hover、focus、disabled、loading、error 等必要状态。
6. 必须保证键盘可访问性和语义结构。
7. 先输出映射计划：Figma section -> 组件 -> token -> props -> 状态。
8. 计划确认后再写代码。

完成后运行 npm run build，并说明哪些地方无法 100% 还原以及原因。`
          }
        ]
      },
      {
        "heading": "monday.com 的关键做法：让设计系统变成 MCP 上下文",
        "blocks": [
          {
            "type": "paragraph",
            "content": "monday.com 没有让 AI 单独猜设计系统，而是做了一个 design-system MCP server。它把公司真实代码库里的组件文档、TypeScript 类型、props、tokens、可访问性规则和代码示例变成 AI 可以查询的上下文。"
          },
          {
            "type": "paragraph",
            "content": "这个设计很关键：MCP 不是另建一份容易过期的设计系统说明，而是连接真实代码和真实规则。这样组件怎么用、哪些 props 可用、token 名称是什么，Agent 都能从源头拿到。"
          },
          {
            "type": "paragraph",
            "content": "他们还不是简单返回一堆文档，而是把流程拆成多个节点：读取 Figma、分析布局、识别组件、映射 token、处理本地化、找代码示例、生成实现计划。这个链路让 AI 从“看图写代码”变成“按团队系统生成代码”。"
          },
          {
            "type": "code",
            "label": "Design-System MCP 应该返回什么",
            "content": `当 Agent 请求实现某个 Figma 节点时，设计系统上下文至少应该返回：

1. Component mapping
- Figma layer 名称
- 推荐使用的代码组件
- 必填 props
- 可选 props
- 禁止使用的替代组件

2. Token mapping
- color token
- typography token
- spacing token
- radius token
- shadow token
- breakpoint token

3. State mapping
- default
- hover
- focus
- active
- disabled
- loading
- empty
- error

4. Accessibility rules
- semantic element
- aria label
- keyboard behavior
- focus order

5. Code examples
- 最接近当前需求的真实代码片段
- 推荐 import path
- 常见错误用法

6. 审查 checklist
- 哪些地方必须人工确认
- 哪些差异允许存在
- 哪些差异必须修复`
          }
        ]
      },
      {
        "heading": "设计师应该怎样准备 Figma 文件",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果团队希望 AI 更稳定地还原界面，设计师的 Figma 文件也要更工程友好。不是所有漂亮稿都适合交给 AI。最理想的 Figma 文件应该有清楚命名、组件实例、Auto Layout、变量、token、状态页、响应式断点和注释。"
          },
          {
            "type": "paragraph",
            "content": "设计师要做的不是写代码，而是把“设计意图”和“可实现规则”暴露给 AI 和工程师。比如哪些组件必须复用，哪些视觉效果可以简化，移动端如何重排，空状态和错误状态长什么样，哪些内容需要本地化。"
          },
          {
            "type": "code",
            "label": "设计师 Figma 交付清单",
            "content": `交给 AI Coding 前，设计师请检查：

1. 页面结构
- Frame 命名清楚
- Section 分组清楚
- 关键区域有注释
- 不要把所有图层混在一个大组里

2. 组件使用
- 使用设计系统组件实例
- 不要把组件 detach 后再手改
- 变体状态完整：default / hover / disabled / error / loading

3. Auto Layout
- 列表、卡片、表单、导航都使用 Auto Layout
- spacing 与设计系统 token 对齐
- 不用肉眼拖拽制造间距

4. Tokens / Variables
- 颜色使用变量
- 字体使用 text styles
- 圆角、阴影、间距有对应规范

5. 响应式
- 提供桌面端和移动端关键画板
- 标注哪些区域固定、哪些换行、哪些折叠

6. 真实内容
- 使用接近真实长度的标题、段落和按钮文案
- 提供空状态、错误状态和加载状态

7. 验收标准
- 哪些细节必须完全还原
- 哪些地方允许工程实现时微调
- 哪些动效或交互必须保留`
          }
        ]
      },
      {
        "heading": "工程师应该怎样和 AI 协作实现",
        "blocks": [
          {
            "type": "paragraph",
            "content": "工程侧最重要的变化，是不要让 AI 直接开写。正确顺序应该是：先让 AI 读取 Figma 和设计系统上下文，输出组件映射计划；工程师确认计划；再让 AI 分阶段实现；每一阶段都运行构建和视觉检查。"
          },
          {
            "type": "paragraph",
            "content": "如果团队已经有 Cursor、Claude Code 或 Codex，可以把 Figma 链接、组件文档、项目规则和验证命令一起交给 Agent。重点不是“快点生成”，而是让它先证明自己理解了设计系统。"
          },
          {
            "type": "code",
            "label": "工程实现提示词",
            "content": `请根据 Figma 设计实现这个页面，但先不要写代码。

上下文：
- Figma 链接：
- 目标路由：
- 相关代码目录：
- 设计系统组件目录：
- token 文件：
- 验证命令：

第一步：请先输出实现计划，必须包含：
1. Figma 区块拆解
2. 每个区块对应的现有组件
3. 需要使用的 token
4. 需要实现的状态
5. 可能无法完全还原的地方
6. 需要设计师确认的问题

规则：
- 不要新增重复组件
- 不要硬编码颜色、字号、间距
- 不要绕过现有设计系统
- 不要修改无关页面

我确认计划后，你再开始实现。`
          },
          {
            "type": "code",
            "label": "实现后的 Design QA 提示词",
            "content": `请对刚实现的页面做一次设计还原审查。

请检查：
1. 组件是否使用正确
2. token 是否使用正确
3. 间距、圆角、字号、行高是否和设计系统一致
4. Figma 中的 hover / focus / disabled / loading / error 状态是否覆盖
5. 文案较长时是否溢出
6. 移动端是否保持设计意图
7. 是否有硬编码样式
8. 是否有可访问性问题

输出格式：
- 必须修复的问题
- 可以接受的差异
- 需要设计师确认的问题
- 已完成验证命令`
          }
        ]
      },
      {
        "heading": "团队如何落地：从单点试验到稳定流程",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这类流程要在团队里成功，不能只靠某个会写提示词的设计师或工程师。团队需要明确角色：设计师负责 Figma 质量和验收标准，设计系统 Owner 负责组件和 token 的机器可读上下文，工程师负责代码实现和 review，QA 负责跨状态验证，Tech Lead 负责边界和质量门禁。"
          },
          {
            "type": "paragraph",
            "content": "一个可落地的节奏是：先选 1 到 2 个低风险页面做试点，不追求一次生成完美，而是记录 AI 在还原时最常偏离的点。每次偏离都要反推：是 Figma 没标清楚，设计系统文档不够机器可读，还是项目规则没写明。这样团队会逐渐得到自己的 Figma-to-code playbook。"
          },
          {
            "type": "code",
            "label": "Figma + AI Coding 团队落地流程",
            "content": `第 1 阶段：准备设计系统上下文
- 整理组件库
- 整理 token
- 整理组件 props 和使用示例
- 整理常见错误用法
- 建立 MCP、docs 或 agent-readable context

第 2 阶段：规范 Figma 交付
- 使用组件实例
- 使用 Auto Layout
- 使用变量和 text styles
- 标注响应式、状态和验收标准

第 3 阶段：选择试点页面
- 页面不能太复杂
- 但必须包含真实组件、状态和响应式
- 设计师和工程师共同验收

第 4 阶段：AI 先出计划
- Figma 区块拆解
- 组件映射
- token 映射
- 风险和待确认点

第 5 阶段：分段实现
- 先结构
- 再样式
- 再状态
- 再响应式
- 最后 Design QA

第 6 阶段：沉淀规则
- 哪些提示词有效
- 哪些 Figma 写法会误导 AI
- 哪些组件文档需要补充
- 哪些视觉差异必须进入 QA 清单`
          }
        ]
      },
      {
        "heading": "Figma 官方 MCP 工作流给设计团队的启发",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Figma 官方也在探索 MCP 工作流：把设计探索、代码实现、状态检查和视觉 diff 连接起来。这个方向对设计团队很关键，因为它让设计师不必等工程师手动反馈“这里不好实现”，也让工程师不必靠猜来理解设计意图。"
          },
          {
            "type": "paragraph",
            "content": "更理想的协作方式是双向的：设计稿进入代码，代码状态也能回到设计评审。比如组件有多少状态、token 是否漂移、实现和设计是否有视觉差异，这些都应该能被团队看见。只有这样，AI Coding 才不会变成一次性生成，而是持续协作流程。"
          },
          {
            "type": "code",
            "label": "设计评审会可以直接使用的问题",
            "content": `在 Figma + AI Coding 评审会上，请逐项确认：

1. 设计稿是否已经使用设计系统组件
2. AI 生成代码是否使用同一套组件
3. token 是否一致，是否出现硬编码
4. 哪些状态没有设计稿
5. 哪些状态没有实现
6. 移动端和桌面端差异是否符合预期
7. 是否有视觉 diff 超出可接受范围
8. 哪些问题应该修设计稿
9. 哪些问题应该修代码
10. 哪些问题应该补进设计系统文档`
          }
        ]
      },
      {
        "heading": "最重要的经验：AI 不是替代设计系统，而是放大设计系统",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这套经验最值得带走的一句话是：AI Coding 的还原质量，取决于团队设计系统本身是否清楚、稳定、可机器读取。如果设计系统混乱，AI 会把混乱放大；如果组件、tokens、状态和规则都清楚，AI 才能稳定生成接近生产质量的代码。"
          },
          {
            "type": "paragraph",
            "content": "所以设计师真正要做的，不是学习怎么写更玄的提示词，而是和工程一起把设计系统变成 AI 能理解的上下文。到那一步，Figma 就不只是视觉稿，而会变成团队 AI Coding 工作流的入口。"
          }
        ]
      }
    ]
  },
  {
    "id": "solo-founder-ai-coding-profit-playbook",
    "sourceUrl": "https://productled.com/blog/the-solo-founder-playbook-how-to-run-a-1m-arr-saas-with-one-person",
    "translationMode": "guidedTranslation",
    "title": "一人公司如何用 AI 编程盈利：从低成本交付到可持续增长",
    "originalTitle": "The Solo-Founder Playbook: How to Run a $1M ARR SaaS With One Person",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "sections": [
      {
        "heading": "为什么 Vincent 不再寻找联合创始人",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Vincent Jong 曾经多次尝试传统创业路径，但结果都被联合创始人的问题拖住。有的人投入不够，有的人中途被别的方向吸引，有的人和项目节奏不一致。公司还没真正开始，协作问题已经消耗了大量精力。"
          },
          {
            "type": "paragraph",
            "content": "他后来意识到，等待一个“合适的联合创始人”，本身可能就是一种拖延。很多公司不是死于糟糕的想法，而是还没开始就被组队、磨合和承诺问题耗死。"
          },
          {
            "type": "paragraph",
            "content": "AI 工具开始承担越来越多技术重活之后，等式变了。创始人不再必须先找到技术合伙人，才能验证一个想法是否值得做。一个人可以先把产品做出来，放进市场测试，再用真实反馈判断要不要继续投入。"
          },
          {
            "type": "paragraph",
            "content": "这种变化很深。联合创始人从“绝对必要”变成了“有会更好，但不是启动前提”。对一人公司来说，关键不是先把组织搭起来，而是先证明市场真的需要这个东西。"
          }
        ]
      },
      {
        "heading": "Lovable 和 Cursor 正在替代早期工程团队",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Vincent 并不认为自己是特别强的程序员。放在几年前，这几乎会直接限制他做 SaaS 的可能性。现在，Lovable、Cursor、ChatGPT 这类工具让这个限制变得不再致命。"
          },
          {
            "type": "paragraph",
            "content": "过去做第一版产品，可能需要先准备二十万美元以上预算，雇工程师开发几个月，才有机会见到第一个用户。现在，一个可运行、接近生产质量的产品，有机会在几周内被做出来，而且成本极低。"
          },
          {
            "type": "paragraph",
            "content": "这不是在说 AI 只能做粗糙的最小可行产品。越来越多独立创始人已经能做出足够完整、足够精致、可以和融资团队产品正面竞争的版本。技术壁垒正在被削弱，真正重要的变成执行力、产品品味和进入市场的能力。"
          },
          {
            "type": "paragraph",
            "content": "不理解某个技术问题时，也不再只能等工程师解释。可以直接问智能体，问 ChatGPT，让它解释架构、接口、数据库、部署和错误信息。早期创业里最昂贵的“技术等待时间”，正在被大幅压缩。"
          }
        ]
      },
      {
        "heading": "做产品变容易，卖产品变更难",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最容易让创始人误判的地方在这里：构建变得容易了，但销售并没有变容易，甚至变得更关键。"
          },
          {
            "type": "paragraph",
            "content": "Vincent 曾经花了一年半构建一个产品驱动销售工具。产品慢慢接近他想象中的样子，功能也能跑起来。但越往后，他越发现市场很小，新用户引导很难，还需要客户经理、客户成功和持续服务。"
          },
          {
            "type": "paragraph",
            "content": "这完全违背了一人公司模型。一个产品如果每增加一批客户，就必须增加对应的人力支持，它就很难保持高利润和低复杂度。真正适合一人公司的产品，应该尽可能自助、低交付、低客服、低边际成本。"
          },
          {
            "type": "paragraph",
            "content": "MeetBot 上线时，Vincent 对第一天的预期很现实：也许会有 10 到 20 个注册。最后来了 12 个。没有爆发，也没有奇迹。增长来自持续打磨、持续优化和少数几个真正有效的渠道，而不是一次发布。"
          },
          {
            "type": "paragraph",
            "content": "未来的难点可能不再是技能，而是兴趣。很多人可以借助 AI 做出产品，但并不喜欢销售、分发、定位和增长。如果创始人讨厌这些事情，再强的 AI 工具也救不了公司。"
          }
        ]
      },
      {
        "heading": "为什么要进入红海市场",
        "blocks": [
          {
            "type": "paragraph",
            "content": "传统创业建议常说，要寻找蓝海，避开竞争。Vincent 反着做。他进入了一个极其拥挤的 SaaS 市场：排期工具。这个市场里已经有 Calendly 这样的大公司，有庞大团队，也有明确市场份额。"
          },
          {
            "type": "paragraph",
            "content": "红海市场有隐藏优势：客户已经有预算，正在主动搜索替代方案，市场已经被教育过。创始人不需要从零解释“为什么需要这个产品”，只需要做出足够不同、足够明确的切入口。"
          },
          {
            "type": "paragraph",
            "content": "MeetBot 的差异化不是“再做一个 Calendly”。它选择 API 优先架构，用按会议付费替代按席位付费，把运营成本控制在每月几百美元，并把合作伙伴集成作为分发方式。"
          },
          {
            "type": "paragraph",
            "content": "大公司很难跟随这种策略。它们有既有收入要保护，有团队结构要维护，有投资人增长预期，也很难把某些能力以近乎零成本提供给合作方。一人公司可以选择巨头不方便进入的角落。"
          }
        ]
      },
      {
        "heading": "无限续航的经济学",
        "blocks": [
          {
            "type": "paragraph",
            "content": "MeetBot 每月运行成本只有几百美元。没有办公室，没有员工，没有福利，没有公司管理开销。和拥有数百名员工的大公司相比，这种成本结构就是不公平优势。"
          },
          {
            "type": "paragraph",
            "content": "所谓无限续航，不只是账面上花得少，而是创始人可以长期存在。即使还保留一份工作，也可以持续维护产品、测试定价、优化页面、尝试渠道。只要固定成本足够低，公司就不会因为短期增长慢而被迫死亡。"
          },
          {
            "type": "paragraph",
            "content": "这类公司不是传统意义上的生活方式型公司。它们可以非常赚钱，只是不用大团队支撑。目标不是用人数证明规模，而是让每个员工，甚至只有一个员工，创造尽可能高的收入。"
          },
          {
            "type": "paragraph",
            "content": "如果你的月度消耗是 300 美元，而竞争对手是每月 50 万美元，你就能在他们看不上的收入规模里活得很好。你可以把某些功能免费提供，可以更激进地试定价，可以转向更小的用户群，也不必向董事会解释每一次调整。"
          },
          {
            "type": "paragraph",
            "content": "时间会变成护城河。很多公司价值来自长期存在，让用户把某个名字和某个问题关联起来。低成本让你有机会活得足够久。"
          }
        ]
      },
      {
        "heading": "速度比规模更重要",
        "blocks": [
          {
            "type": "paragraph",
            "content": "一人公司无法和大团队比资源，但可以比速度。大公司需要会议、排期、审批和跨团队协作；一个人可以当天发现问题，当天改产品，当天更新页面，当天测试新价格。"
          },
          {
            "type": "paragraph",
            "content": "这种速度优势尤其适合早期产品。市场还不确定时，过大的团队会增加沟通成本和决策成本；小系统反而更容易快速试错。AI 编程进一步放大了这种优势，因为它把很多执行工作压缩成更短的循环。"
          },
          {
            "type": "paragraph",
            "content": "但速度窗口不会永远存在。随着越来越多创始人掌握 AI 编程，构建速度会变成基础能力。真正可持续的防御来自品牌、分发渠道、成本结构、社区内容、产品网络效应和对细分用户的深刻理解。"
          }
        ]
      },
      {
        "heading": "构建阶段和增长阶段要分开",
        "blocks": [
          {
            "type": "paragraph",
            "content": "一人公司最容易陷入的状态，是一直待在构建阶段。不断加功能、改界面、重构代码，会让产品看起来在进步，但不一定带来收入。"
          },
          {
            "type": "paragraph",
            "content": "更健康的节奏是把工作分成两个阶段：构建阶段专注于做出下一版产品，增长阶段专注于页面、文案、渠道、SEO、用户反馈、定价和转化。增长阶段不能被当成构建完成后的附属工作，它本身就是公司能否赚钱的核心。"
          },
          {
            "type": "paragraph",
            "content": "如果创始人只喜欢写代码，不愿意做销售和分发，AI 工具也救不了这家公司。未来更稀缺的不是单纯会构建产品的人，而是既愿意理解市场，又能借助 AI 快速交付产品的人。"
          }
        ]
      },
      {
        "heading": "别再发布粗糙的最小可行产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "过去常有人说，如果你不为第一版产品感到尴尬，说明发布太晚了。Vincent 认为这个建议已经过时。"
          },
          {
            "type": "paragraph",
            "content": "以前构建产品很慢、很贵，所以先用粗糙版本验证需求是合理的。现在，AI 可以在几周内帮助做出更完整、更好看的版本。用户已经习惯成熟产品的可用性，也会拿你的产品和现有方案比较。"
          },
          {
            "type": "paragraph",
            "content": "AI 能很快完成 80%，但剩下 20% 才是赢的地方：细节、新用户引导、定价、定位、交互、文案、视觉品味和用户路径。新的稀缺能力不是单纯写代码，而是品味。"
          },
          {
            "type": "paragraph",
            "content": "所以不要再用粗糙的最小可行产品当借口。应该发布有观点、有清晰定位、尊重用户预期的产品。构建成本已经下降，产品标准反而提高了。"
          }
        ]
      },
      {
        "heading": "不要太早辞职",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Vincent 的建议很直接：开始做，但不要马上辞职。现在构建速度很快，很多早期验证可以利用周末、晚上和碎片时间完成。"
          },
          {
            "type": "paragraph",
            "content": "当每月成本只有几百美元，最小可行产品又可以在几周内做出来时，保留现金流反而更理性。过早辞职会增加焦虑，让创始人为了短期收入做出错误决定。"
          },
          {
            "type": "paragraph",
            "content": "真正危险的不是慢一点开始，而是长时间停下来。AI 工具变化很快，市场假设也变化很快。如果中间暂停半年，回来时工具、竞品和用户预期可能都已经变了。"
          },
          {
            "type": "paragraph",
            "content": "一人公司最适合的启动方式，是在低成本下持续推进：先做出产品，拿真实用户反馈，验证收费意愿，再决定是否把它变成全职事业。"
          }
        ]
      }
    ]
  },
  {
    "id": "getwebsite-report-nocode-solo-founder",
    "sourceUrl": "https://www.reddit.com/r/SaaS/comments/1cb118p/investors_pulled_out_the_term_sheet_nontech_solo/",
    "translationMode": "fullTranslation",
    "title": "融资失败后，非技术创始人怎样把一个网站审计工具做到 2500 美元收入",
    "originalTitle": "Investors pulled out the term sheet. Non-tech solo founder to building AI micro SaaS with no-code tools. $2500 Revenue in 3 months.",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "投资人撤回条款书之后",
        "blocks": [
          {
            "type": "paragraph",
            "content": "2023 年 8 月，我的创业公司没能拿到融资。"
          },
          {
            "type": "paragraph",
            "content": "我的合伙人离开了。投资人撤回了条款书。整个局面很糟糕。"
          },
          {
            "type": "paragraph",
            "content": "那时候我不是技术创始人，也不会写代码。如果按照传统创业路径，我大概应该继续找新的技术合伙人，继续找投资人，继续等待下一次机会。"
          },
          {
            "type": "paragraph",
            "content": "但我不想再等了。"
          }
        ]
      },
      {
        "heading": "转向一个更小的产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我开始做一个更小、更具体的产品：GetWebsite.Report。"
          },
          {
            "type": "paragraph",
            "content": "它是一个人工智能网站审计工具，帮助机构和网站所有者快速生成着陆页审计报告，找出影响转化的问题，并给出可以执行的改进建议。"
          },
          {
            "type": "paragraph",
            "content": "网站地址是 https://getwebsite.report。"
          },
          {
            "type": "paragraph",
            "content": "我没有从一开始就组建完整团队，也没有先做复杂平台。我用无代码工具把第一版产品做出来，然后尽快拿到真实用户反馈。"
          }
        ]
      },
      {
        "heading": "三个月的结果",
        "blocks": [
          {
            "type": "paragraph",
            "content": "三个月后，这个产品带来了 2500 美元收入。"
          },
          {
            "type": "paragraph",
            "content": "它获得了 100 多个付费用户。"
          },
          {
            "type": "paragraph",
            "content": "它还在 Product Hunt 上被推荐，成为 User Experience 分类的当周第一名，并拿到当天第三名。"
          },
          {
            "type": "paragraph",
            "content": "这不是一个巨大的数字，但对我来说，它证明了一件事：即使没有融资、没有技术合伙人，也可以先做出一个能销售的产品。"
          }
        ]
      },
      {
        "heading": "第一课：任何人都可以构建自己的软件",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我的第一个收获是：任何人都可以构建自己的软件。"
          },
          {
            "type": "paragraph",
            "content": "现在有很多无代码工具，也有很多人工智能工具。它们让非技术创始人可以跳过最早期的技术阻碍，先把想法做成可以被用户试用的东西。"
          },
          {
            "type": "paragraph",
            "content": "这并不意味着技术不重要，也不意味着产品后面不需要工程能力。它只是意味着，在验证阶段，你不一定必须先等到一个完整技术团队出现。"
          },
          {
            "type": "paragraph",
            "content": "你可以先做出一个能运行的版本，先让用户看到结果，先证明问题是否真实存在。"
          }
        ]
      },
      {
        "heading": "第二课：无代码不是终点，而是起点",
        "blocks": [
          {
            "type": "paragraph",
            "content": "无代码工具最有价值的地方，不是让你永远不用写代码，而是让你更快进入市场。"
          },
          {
            "type": "paragraph",
            "content": "早期最重要的问题通常不是架构是否完美，而是用户是否真的愿意使用，是否愿意付费，是否愿意把它推荐给别人。"
          },
          {
            "type": "paragraph",
            "content": "如果你先花几个月搭建一个完美系统，但最后发现没人需要，那才是更大的浪费。"
          },
          {
            "type": "paragraph",
            "content": "我宁愿先用更轻的方式验证需求，再根据真实用户反馈决定下一步要不要继续投入。"
          }
        ]
      },
      {
        "heading": "第三课：小产品也可以有清楚的收费理由",
        "blocks": [
          {
            "type": "paragraph",
            "content": "GetWebsite.Report 做的事情很具体：生成网站审计报告。"
          },
          {
            "type": "paragraph",
            "content": "它不是一个什么都做的平台，也不是一个特别宏大的人工智能产品。它只解决一个清楚的问题：让用户更快知道自己的网站哪里影响转化，应该怎么改。"
          },
          {
            "type": "paragraph",
            "content": "这个问题对机构有价值。机构可以把报告交给客户，作为沟通和销售的一部分；网站所有者也可以用报告判断页面该怎么优化。"
          },
          {
            "type": "paragraph",
            "content": "当一个工具能节省时间、帮助成交、减少沟通成本时，它就有收费理由。"
          }
        ]
      },
      {
        "heading": "第四课：发布能带来真实反馈",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Product Hunt 的发布给产品带来了关注，也带来了用户。"
          },
          {
            "type": "paragraph",
            "content": "发布不是结束，而是开始。真正重要的是发布后用户会不会注册、会不会付费、会不会告诉你哪里不清楚、哪里不够好。"
          },
          {
            "type": "paragraph",
            "content": "这些反馈比想象中的商业计划更有价值。它们会告诉你产品应该继续往哪里走。"
          }
        ]
      },
      {
        "heading": "现在我相信什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我现在相信，非技术创始人不应该因为自己不会写代码就放弃。"
          },
          {
            "type": "paragraph",
            "content": "你可以从一个小问题开始，用现有工具做出第一版，尽快发布，尽快收费，尽快和用户对话。"
          },
          {
            "type": "paragraph",
            "content": "融资失败、合伙人离开、没有技术背景，这些都很难，但它们不一定是终点。"
          },
          {
            "type": "paragraph",
            "content": "有时候，它们反而会迫使你做出更小、更快、更现实的产品。"
          }
        ]
      }
    ]
  },
  {
    "id": "plottie-ai-coding-research-saas-mrr",
    "sourceUrl": "https://www.reddit.com/r/SaaS/comments/1r6kgv4/im_a_researcher_who_cant_code_built_a_saas_with/",
    "translationMode": "fullTranslation",
    "title": "不会做网页的研究者，怎样用 AI 编程把 Plottie 做到 1000 美元月收入",
    "originalTitle": "I'm a researcher who can't code. Built a SaaS with vibe coding. $1K MRR in 25 days, 2,000+ users. Here's everything I did.",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "从不会做网页开始",
        "blocks": [
          {
            "type": "paragraph",
            "content": "大家好。"
          },
          {
            "type": "paragraph",
            "content": "我是生物信息学研究者，不是全栈开发者。"
          },
          {
            "type": "paragraph",
            "content": "我一直会写 Python，也能做数据分析和做图，但从来没有做过真正的网页应用。"
          },
          {
            "type": "paragraph",
            "content": "25 天前，我用 Claude 和 Cursor 做了 Plottie。"
          },
          {
            "type": "paragraph",
            "content": "现在结果是：超过 2000 个用户，超过 100 个付费客户，月经常性收入约 1000 美元，产品还被 Product Hunt 评为当天第二名。"
          },
          {
            "type": "paragraph",
            "content": "我想分享完整过程，因为我在这里看到过很多人提问：不是工程师的人，能不能用人工智能编程真的做出一个能赚钱的软件服务？"
          },
          {
            "type": "paragraph",
            "content": "我的回答是：可以。但过程会很混乱，也有很多细节。"
          }
        ]
      },
      {
        "heading": "我到底做了什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Plottie 是给科研人员用的人工智能绘图工具。"
          },
          {
            "type": "paragraph",
            "content": "用户用自然语言描述想要的科研图，例如通路图、细胞图示、显微镜风格插图、流程图，Plottie 会生成可以直接用于论文或演示文稿的图。"
          },
          {
            "type": "paragraph",
            "content": "它的不同之处在于，生成结果不是通用的人工智能图片，而是偏科研语境的图。"
          },
          {
            "type": "paragraph",
            "content": "产品网站是 https://ai.plottie.art。"
          }
        ]
      },
      {
        "heading": "之前先做了免费图表库",
        "blocks": [
          {
            "type": "paragraph",
            "content": "在做付费产品之前，我先做了一个免费图表库。"
          },
          {
            "type": "paragraph",
            "content": "图表库里有成千上万张免费的科研图、图标和模板，覆盖医学、基因组学、人工智能、微生物学等主题。"
          },
          {
            "type": "paragraph",
            "content": "那部分内容开始从 Google 获得自然搜索流量。很多研究者会搜索科研图、细胞器图标、医学插图、论文图示，然后进入网站。"
          },
          {
            "type": "paragraph",
            "content": "所以后来推出 Plottie 时，我不是从完全没有受众开始，而是已经有了一批相关访客。"
          }
        ]
      },
      {
        "heading": "为什么做付费产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "免费图表库让我看到一个问题：研究者不只是想下载现成素材，他们还想生成自己需要的图。"
          },
          {
            "type": "paragraph",
            "content": "很多科研图很具体，现成素材很难完全匹配。研究者通常需要表达某个实验流程、某种机制、某个细胞结构或某个通路。"
          },
          {
            "type": "paragraph",
            "content": "这就是付费产品的机会。"
          },
          {
            "type": "paragraph",
            "content": "如果用户可以直接描述自己想要的图，并快速生成结果，这比在素材库里搜索、下载、再手动编辑更省时间。"
          }
        ]
      },
      {
        "heading": "第一版是怎么做出来的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我用 Claude 和 Cursor 做第一版。"
          },
          {
            "type": "paragraph",
            "content": "我没有网页开发经验，所以很多东西都是边做边问。页面、状态、支付、用户系统、数据库、部署，都是在过程中一点点拼起来的。"
          },
          {
            "type": "paragraph",
            "content": "人工智能编程很有用，但不是魔法。"
          },
          {
            "type": "paragraph",
            "content": "它能让我快速前进，也能让我在完全不熟悉的地方卡住很久。有些错误我看不懂，只能不断把报错、上下文和目标重新发给模型，让它一步步解释。"
          }
        ]
      },
      {
        "heading": "我做对的事情",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一，我先做了一个免费内容产品。"
          },
          {
            "type": "paragraph",
            "content": "如果没有免费图表库带来的搜索流量，Plottie 的启动会难很多。免费内容让我知道用户是谁、他们搜索什么、他们关心什么。"
          },
          {
            "type": "paragraph",
            "content": "第二，我做的是自己熟悉的领域。"
          },
          {
            "type": "paragraph",
            "content": "我不是凭空选择一个热门方向，而是从科研绘图这个自己每天都理解的问题出发。因为我自己就是目标用户，所以更容易判断哪些生成结果有用，哪些只是看起来漂亮。"
          },
          {
            "type": "paragraph",
            "content": "第三，我很早就收费。"
          },
          {
            "type": "paragraph",
            "content": "如果只让用户免费使用，你很难知道他们是不是真的需要。有人愿意付钱，才说明它解决了一个足够具体的问题。"
          },
          {
            "type": "paragraph",
            "content": "第四，我尽快发布。"
          },
          {
            "type": "paragraph",
            "content": "第一版不完美，但它已经可以让用户完成核心任务。发布之后，我才能拿到真正的反馈。"
          }
        ]
      },
      {
        "heading": "我做错的事情",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我也犯了很多错。"
          },
          {
            "type": "paragraph",
            "content": "一开始我在技术选择上绕了很多弯。因为不熟悉前端和后端，我有时候会让人工智能给出过度复杂的方案，然后自己又没有足够经验判断它是否合理。"
          },
          {
            "type": "paragraph",
            "content": "有些地方后来不得不重写。"
          },
          {
            "type": "paragraph",
            "content": "我也低估了调试时间。人工智能可以生成代码，但当产品出现真实用户、真实支付、真实失败情况时，调试会变得非常具体。"
          },
          {
            "type": "paragraph",
            "content": "另一个问题是，我一开始没有把分析、转化和用户行为记录做得足够清楚。后来我才意识到，想让产品增长，就必须知道用户从哪里来、在哪里卡住、为什么付费。"
          }
        ]
      },
      {
        "heading": "技术栈",
        "blocks": [
          {
            "type": "paragraph",
            "content": "产品主要用 React 和 Tailwind 做界面。"
          },
          {
            "type": "paragraph",
            "content": "后端和数据库使用 Supabase。"
          },
          {
            "type": "paragraph",
            "content": "部署用 Cloudflare 和 Fly.io。"
          },
          {
            "type": "paragraph",
            "content": "生成部分连接了大语言模型接口，也使用了 E2B。"
          },
          {
            "type": "paragraph",
            "content": "我用 Cursor 和 Claude 辅助写代码、解释错误、补功能和调整页面。"
          }
        ]
      },
      {
        "heading": "增长是怎么来的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最早的增长来自已有的免费图表库。"
          },
          {
            "type": "paragraph",
            "content": "搜索流量带来了一批精准用户，他们本来就在找科研图和科研插图。"
          },
          {
            "type": "paragraph",
            "content": "然后我在 Product Hunt 发布，拿到了当天第二名。"
          },
          {
            "type": "paragraph",
            "content": "我也在 Twitter 和相关社区分享产品。"
          },
          {
            "type": "paragraph",
            "content": "但最重要的还是产品和受众匹配。研究者已经有这个问题，他们只是需要一个更快的解决办法。"
          }
        ]
      },
      {
        "heading": "25 天后的数字",
        "blocks": [
          {
            "type": "paragraph",
            "content": "25 天后，Plottie 有超过 2000 个用户。"
          },
          {
            "type": "paragraph",
            "content": "付费客户超过 100 个。"
          },
          {
            "type": "paragraph",
            "content": "月经常性收入约为 1000 美元。"
          },
          {
            "type": "paragraph",
            "content": "这不是一个巨大公司，但对一个不会做网页的人来说，它证明了这条路可行。"
          }
        ]
      },
      {
        "heading": "给其他人的建议",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果你不是工程师，也想用人工智能编程做产品，我的建议是：从你真正理解的问题开始。"
          },
          {
            "type": "paragraph",
            "content": "不要因为某个市场热门就去做。选择你自己知道用户是谁、痛点是什么、结果好不好判断的领域。"
          },
          {
            "type": "paragraph",
            "content": "先做一个可以带来真实用户的入口。它可以是免费工具、内容库、模板库或小功能。"
          },
          {
            "type": "paragraph",
            "content": "然后再把最强的需求做成付费产品。"
          },
          {
            "type": "paragraph",
            "content": "人工智能编程能让你跨过很多技术门槛，但它不会替你理解市场，也不会替你判断什么产品值得做。"
          },
          {
            "type": "paragraph",
            "content": "最重要的仍然是：找到真实问题，尽快发布，尽快收费，然后继续改。"
          }
        ]
      }
    ]
  },
  {
    "id": "solo-founder-made-190k-two-years",
    "sourceUrl": "https://www.reddit.com/r/Entrepreneur/comments/pf2bus/made_190k_in_2_years_as_solo_founder/",
    "translationMode": "fullTranslation",
    "title": "一名单人创始人两年赚到 19 万美元的复盘",
    "originalTitle": "Made $190k in 2 years as Solo Founder",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "两年赚到 19 万美元",
        "blocks": [
          {
            "type": "paragraph",
            "content": "嗨，大家好。"
          },
          {
            "type": "paragraph",
            "content": "我是一个来自印度的人，从 2014 年 4 月 15 日开始担任全栈工程师。辞职之前，我工作了大约四年半。我辞职是因为当时和朋友一起创办了一家初创公司。后来因为一些原因，我被迫退出了那家公司，于是我重新开始找工作。"
          },
          {
            "type": "paragraph",
            "content": "那段时间，我读到了 Pieter Levels 的一篇文章：他在一年里做了 12 家创业项目。随后，我又读了《一人公司》这本书。这两件事激励我开始走上微型创业之路。"
          },
          {
            "type": "paragraph",
            "content": "我开始每个月做一个微型创业项目。我从 2019 年 1 月开始做，持续了一整年。那一年里，我一共发布了 11 个微型创业项目。其中 7 个失败了，3 个被卖掉了，还有 1 个做到了每月超过 2000 美元的经常性收入。"
          }
        ]
      },
      {
        "heading": "第一步",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一步，我开始寻找问题。"
          },
          {
            "type": "paragraph",
            "content": "我在 GitHub 上发现了一个名为 Public APIs 的项目。很多开发者都在使用这个项目。它只是一个接口列表，但我想到，如果能在这些接口之上做一层包装，让人们不用写代码就能使用它们，也许会有价值。"
          },
          {
            "type": "paragraph",
            "content": "于是我做了一个最小可行产品，并在 Product Hunt 上发布。发布结果不错。后来，我把这个项目卖了 2.3 万美元。"
          }
        ]
      },
      {
        "heading": "继续做下一个产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "随后我继续做新的微型创业项目。我不断寻找小问题，然后做出简单产品。不是每个项目都会成功。事实上，大多数项目都失败了。"
          },
          {
            "type": "paragraph",
            "content": "有些项目没有用户，有些项目没有收入，有些项目没有继续做下去的理由。但每一次发布都会带来一点学习：我更了解如何找问题，如何快速做出产品，如何发布，如何判断是否值得继续。"
          },
          {
            "type": "paragraph",
            "content": "最后，其中一个项目做起来了。它就是 NoCodeAPI.com。"
          },
          {
            "type": "paragraph",
            "content": "NoCodeAPI.com 让我在两年里赚到了大约 19 万美元。"
          }
        ]
      },
      {
        "heading": "现在的情况",
        "blocks": [
          {
            "type": "paragraph",
            "content": "现在，我还在继续做 NoCodeAPI.com。"
          },
          {
            "type": "paragraph",
            "content": "这个产品目前每月收入超过 2000 美元。我希望今年能把它做到每月 1 万美元的经常性收入。"
          },
          {
            "type": "paragraph",
            "content": "这一路没有什么神奇的地方。核心就是不断做小产品、发布、学习、失败、继续做。"
          },
          {
            "type": "paragraph",
            "content": "我不是要说每个人都应该走同样的路。我只是想分享我的经历，也许它能帮到正在考虑做自己产品的人。"
          }
        ]
      },
      {
        "heading": "最后",
        "blocks": [
          {
            "type": "paragraph",
            "content": "感谢阅读。"
          }
        ]
      }
    ]
  },
  {
    "id": "bank-statement-converter-11k-month-solo-founder",
    "sourceUrl": "https://www.reddit.com/r/Entrepreneur/comments/16f1mkc/making_11000_every_month_running_a_simple_website/",
    "translationMode": "fullTranslation",
    "title": "一个简单网站每月赚 1.1 万美元",
    "originalTitle": "Making $11,000 every month running a simple website & not doing much",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "采访开始",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这次我采访了 Angus Cheng。他做了一个名为 Bank Statement Converter 的网页应用，目前每月经常性收入约为 1.1 万美元。"
          },
          {
            "type": "paragraph",
            "content": "这个工具可以把 PDF 格式的银行流水转换成 Excel 或 CSV 文件，主要用户是会计师、簿记员和小企业主。"
          },
          {
            "type": "paragraph",
            "content": "Angus 目前独自经营这个业务，每周只花大约 10 小时维护和运营。"
          }
        ]
      },
      {
        "heading": "你是怎么想到这个点子的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我以前在银行工作，经常看到客户把银行流水 PDF 发给会计师。会计师需要把这些数据手动录入 Excel，这个过程非常慢，也很容易出错。"
          },
          {
            "type": "paragraph",
            "content": "我发现很多人都在搜索如何把银行流水 PDF 转成 Excel。这个需求很明确，而且用户已经知道自己想要什么。"
          },
          {
            "type": "paragraph",
            "content": "于是我做了一个简单工具，让用户上传 PDF，然后自动把它转换成电子表格格式。"
          }
        ]
      },
      {
        "heading": "第一版是怎么做出来的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一版大概花了一周时间。它非常简单，只支持基本上传和转换。"
          },
          {
            "type": "paragraph",
            "content": "我没有先做复杂功能，也没有先做大平台。最开始只想验证一件事：有没有人愿意为把银行流水 PDF 转成电子表格付费。"
          },
          {
            "type": "paragraph",
            "content": "上线后，我开始用 Google 搜索广告测试需求。广告很快带来了第一批用户，也让我看到哪些关键词能带来真正愿意付费的人。"
          }
        ]
      },
      {
        "heading": "最早怎么获得用户",
        "blocks": [
          {
            "type": "paragraph",
            "content": "一开始主要靠 Google 搜索广告。因为用户本来就在搜索类似“银行流水转 Excel”这样的词，所以广告能比较直接地触达需求。"
          },
          {
            "type": "paragraph",
            "content": "我也尝试过给会计师和簿记员发冷邮件。效果不是特别好，但它帮助我理解目标用户、他们的语言和他们真正关心的问题。"
          },
          {
            "type": "paragraph",
            "content": "后来，我开始做内容营销。围绕银行流水转换、会计工作流、PDF 转电子表格等主题写页面和文章。搜索流量慢慢积累起来后，获客成本开始下降。"
          }
        ]
      },
      {
        "heading": "现在收入怎么样",
        "blocks": [
          {
            "type": "paragraph",
            "content": "现在这个网站每月经常性收入大约是 1.1 万美元。"
          },
          {
            "type": "paragraph",
            "content": "收入主要来自订阅。用户可以按月付费，也可以按年付费。"
          },
          {
            "type": "paragraph",
            "content": "运营成本不高。主要成本是服务器、转换处理、支付费用和广告费用。因为产品很聚焦，所以不需要大团队。"
          }
        ]
      },
      {
        "heading": "每天需要做多少工作",
        "blocks": [
          {
            "type": "paragraph",
            "content": "现在我每周大概花 10 小时在这个业务上。"
          },
          {
            "type": "paragraph",
            "content": "大部分时间花在客服、修小问题、改进转换质量、更新内容和观察广告表现上。"
          },
          {
            "type": "paragraph",
            "content": "这个产品不需要每天大量人工介入。用户可以自己上传文件、完成转换、下载结果，也可以自己完成付费。"
          }
        ]
      },
      {
        "heading": "遇到过哪些困难",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最大的困难是不同银行的 PDF 格式差异很大。即使都是银行流水，版式、表格结构、日期格式和金额格式也可能完全不同。"
          },
          {
            "type": "paragraph",
            "content": "为了提高转换准确率，我需要不断处理新格式、修复边缘情况，并根据用户上传的样本改进解析逻辑。"
          },
          {
            "type": "paragraph",
            "content": "另一个困难是信任。用户上传的是财务文件，所以页面必须清楚说明安全性、隐私和文件处理方式。"
          }
        ]
      },
      {
        "heading": "定价是怎么确定的",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最开始的价格比较低，因为我还不确定用户愿意付多少钱。后来随着产品变稳定，我逐渐调整价格。"
          },
          {
            "type": "paragraph",
            "content": "这个工具帮用户节省的是时间。如果一个会计师每周都要处理很多银行流水，手动录入可能要花几个小时。只要工具能把这部分时间省下来，订阅价格就有价值。"
          },
          {
            "type": "paragraph",
            "content": "我学到的一点是，不要只按技术复杂度定价，而要按用户节省的时间和减少的麻烦定价。"
          }
        ]
      },
      {
        "heading": "如果重新开始，会做什么不同",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果重新开始，我会更早做内容营销。广告可以快速验证需求，但长期来看，搜索内容会带来更稳定、更便宜的用户。"
          },
          {
            "type": "paragraph",
            "content": "我也会更早和用户交流。真实用户会告诉你哪些格式最重要、哪些功能只是看起来有用、哪些问题会影响他们付费。"
          },
          {
            "type": "paragraph",
            "content": "早期不要做太多功能。先把核心转换做好，让用户得到可靠结果，比做很多周边功能更重要。"
          }
        ]
      },
      {
        "heading": "给其他创始人的建议",
        "blocks": [
          {
            "type": "paragraph",
            "content": "找一个很具体的问题。越具体越好。"
          },
          {
            "type": "paragraph",
            "content": "不要害怕产品看起来简单。简单产品也可以赚钱，只要它解决的是一个真实、重复、愿意付费的问题。"
          },
          {
            "type": "paragraph",
            "content": "尽快发布，尽快验证，尽快和用户交流。不要等到产品完美。"
          },
          {
            "type": "paragraph",
            "content": "如果一个产品可以自己获客、自己注册、自己付费、自己完成核心任务，它就更适合一个人长期经营。"
          }
        ]
      }
    ]
  },
  {
    "id": "llama-life-700-paying-customers-solo-founder",
    "sourceUrl": "https://www.indiehackers.com/post/bootstrapped-my-productivity-app-to-700-paying-customers-ama-23909bf748",
    "translationMode": "fullTranslation",
    "title": "Llama Life：单人创始人把生产力网站做到 700 个付费用户",
    "originalTitle": "Bootstrapped my productivity app to 700 paying customers! AMA.",
    "notice": "",
    "showSourceAddress": true,
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "700 个付费用户，欢迎提问",
        "blocks": [
          {
            "type": "paragraph",
            "content": "大家好，我是 Marie。"
          },
          {
            "type": "paragraph",
            "content": "我在品牌和广告行业工作了 10 年。从一行 HTML 都不会写，到一年内写代码并发布自己的第一个产品。"
          },
          {
            "type": "paragraph",
            "content": "说明一下：不是说做这件事一定要学会写代码，但对我来说，学会写代码是我给自己设定的个人目标。结果发现，我真的很喜欢它。"
          },
          {
            "type": "paragraph",
            "content": "后来，我把自己的生产力应用 Llama Life 做到了 700 多个付费用户。最近，它还被 LAUNCH Accelerator 录取，这个加速器由 Jason Calacanis 支持。"
          },
          {
            "type": "paragraph",
            "content": "这个网站是 https://llamalife.co。"
          },
          {
            "type": "paragraph",
            "content": "关于这段经历，欢迎随便提问。说实话，这一路非常辛苦，但我很高兴自己做了这件事。"
          }
        ]
      },
      {
        "heading": "最早的用户从哪里来",
        "blocks": [
          {
            "type": "paragraph",
            "content": "最早的 10 个用户应该还是家人和朋友，所以不太能算。"
          },
          {
            "type": "paragraph",
            "content": "再往后，我想应该是来自 Product Hunt。之后的用户主要来自 Twitter、Reddit 和口碑传播。"
          },
          {
            "type": "paragraph",
            "content": "到目前为止，我还没有花营销预算。不过之后我确实想做一点付费营销。"
          }
        ]
      },
      {
        "heading": "如何安排产品和营销",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我没有固定日程。我听说有些创始人会一天做营销，一天写代码；也有人一周做产品，一周做增长。"
          },
          {
            "type": "paragraph",
            "content": "这可能也取决于产品处在哪个阶段。对我来说，因为 Llama Life 还处在早期阶段，我会尽量专注于自己认为能带来某种增长的事情。"
          },
          {
            "type": "paragraph",
            "content": "不过这很难，因为我喜欢写代码。我们大概都喜欢发布代码。"
          },
          {
            "type": "paragraph",
            "content": "一种折中的办法是，我做了几个小副项目，比如 fidgetpage.com 和 shhhnoise.com。它们让我可以继续写代码，同时也能作为 Llama Life 的潜在客户获取渠道。"
          }
        ]
      },
      {
        "heading": "品牌和产品定位",
        "blocks": [
          {
            "type": "paragraph",
            "content": "对于早期公司，我认为认真思考品牌是重要的。它不需要花很多时间，因为你的产品可能会变化，受众也可能会变化。"
          },
          {
            "type": "paragraph",
            "content": "但你至少应该花几个小时思考：你希望产品给人什么样的感觉和氛围。"
          },
          {
            "type": "paragraph",
            "content": "我以前做品牌工作时，会为大品牌做这件事。我们会列出品牌属性，然后确保所有对外沟通，也就是营销，都保持一致。"
          },
          {
            "type": "paragraph",
            "content": "例如，我会这样写 Llama Life：帮助我一次专注一件事；帮助我的一天更有结构；让我感觉高效但平静；使用起来有趣；带着一点好的古怪感；低压力，不让人不知所措。"
          },
          {
            "type": "paragraph",
            "content": "有了这样的清单，当你开始做营销时，就很容易检查产品传达出来的感觉是否一致。"
          },
          {
            "type": "paragraph",
            "content": "它也能在你收到新功能请求时帮助你判断要不要做。当我收到请求时，我会对照品牌属性，看看这个请求是否真的符合产品想达到的目标。"
          }
        ]
      },
      {
        "heading": "如何处理功能请求",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这确实有助于处理功能请求。你必须在倾听用户想要什么和坚持产品初衷之间保持平衡。"
          },
          {
            "type": "paragraph",
            "content": "有时候，用户需求会以好的方式塑造产品，并改变方向。"
          },
          {
            "type": "paragraph",
            "content": "但 Llama Life 刚开始时，我收到很多功能请求，如果照着做，产品基本会变成类似 Toggl 的时间追踪工具。"
          },
          {
            "type": "paragraph",
            "content": "但那不是我想解决的问题。所以那份品牌属性清单帮我保持了方向。"
          }
        ]
      },
      {
        "heading": "公开构建",
        "blocks": [
          {
            "type": "paragraph",
            "content": "我很早就加入了 Twitter，但直到大概一年前才真正开始认真使用它。"
          },
          {
            "type": "paragraph",
            "content": "公开构建对我来说非常有帮助，因为它让我保持责任感。作为单人创始人，它也让我从独立创作者社区获得了很多支持。"
          },
          {
            "type": "paragraph",
            "content": "每个人风格不同。我通常会像和朋友聊天一样发推，分享自己觉得有趣的东西，或者分享自己做到的阶段性进展。"
          },
          {
            "type": "paragraph",
            "content": "我一般不发长串内容，也不会提前排期发布。对我来说，它更像是当下发生了什么就说什么。"
          },
          {
            "type": "paragraph",
            "content": "我还给自己定了一条规则：如果我写一条推文超过两分钟，我就不发了，因为那说明我想太多了。"
          },
          {
            "type": "paragraph",
            "content": "少发一点，多参与对话。就像现实生活一样，如果你在一个大组织里工作，你会和同事聊天，而不是只对着大家喊话，然后期待别人回应。它是双向的。"
          }
        ]
      },
      {
        "heading": "年经常性收入和客户沟通",
        "blocks": [
          {
            "type": "paragraph",
            "content": "目前年经常性收入大约是 1 万美元。"
          },
          {
            "type": "paragraph",
            "content": "我只是用 Twitter 私信和邮件与客户沟通。"
          },
          {
            "type": "paragraph",
            "content": "Jason 团队注意到我，是因为我一直在 Twitter 上公开构建。"
          }
        ]
      },
      {
        "heading": "为什么是这个产品",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Llama Life 一开始只是我为自己做的东西。"
          },
          {
            "type": "paragraph",
            "content": "当我在 Twitter 上分享它，并得到一些很好的反馈后，我才有信心把它作为产品发布。"
          },
          {
            "type": "paragraph",
            "content": "另外，对我来说，它也有一部分是学习练习。所以一开始成功压力没那么大，因为我在心里把它定义成：只要学到了东西，就是赢。"
          },
          {
            "type": "paragraph",
            "content": "我们经常谈产品和市场匹配，但我也相信问题和创始人之间也有匹配。"
          },
          {
            "type": "paragraph",
            "content": "对我来说，我已经为自己尝试解决这个问题很久了，而且总是会回到它。所以从某种意义上说，这就是我应该做的东西。"
          },
          {
            "type": "paragraph",
            "content": "我之前也做过几个产品，当时我还是非技术创始人，但它们都失败了。"
          }
        ]
      },
      {
        "heading": "实际网页案例",
        "blocks": [
          {
            "type": "paragraph",
            "content": "主产品：Llama Life，网址是 https://llamalife.co。"
          },
          {
            "type": "paragraph",
            "content": "相关小网站：Fidget Page，网址是 http://www.fidgetpage.com。"
          },
          {
            "type": "paragraph",
            "content": "相关小网站：Shhh Noise，网址是 http://www.shhhnoise.com。"
          }
        ]
      }
    ]
  },
  {
    "id": "agents-md-open-format-coding-agents",
    "sourceUrl": "https://github.com/agentsmd/agents.md",
    "translationMode": "guidedTranslation",
    "title": "AGENTS.md 实操指南：给编程智能体写清项目规则",
    "originalTitle": "AGENTS.md",
    "notice": "",
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "sections": [
      {
        "heading": "AGENTS.md 是什么",
        "blocks": [
          {
            "type": "paragraph",
            "content": "AGENTS.md 是放在项目根目录里的说明文件，专门写给编程智能体阅读。它的作用类似 README，但读者不是人类协作者，而是 Codex、Claude Code、Cursor Agent 这类会读取、修改、运行项目代码的工具。"
          },
          {
            "type": "paragraph",
            "content": "README 通常讲项目给人看：项目是什么、怎么安装、怎么使用。AGENTS.md 则更关注智能体执行任务时必须知道的规则：应该看哪些文件，不能碰哪些模块，用什么命令验证，提交前要检查什么，遇到不确定时如何处理。"
          },
          {
            "type": "paragraph",
            "content": "它最重要的价值不是让提示词变长，而是把反复要说的项目规则固定下来。每次开启新任务时，智能体都能先从同一个位置拿到上下文，减少猜测和误改。"
          }
        ]
      },
      {
        "heading": "AGENTS.md 能解决什么问题",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一个问题是项目上下文丢失。没有 AGENTS.md 时，每次开始新对话，都要重新解释项目技术栈、目录结构、运行方式和注意事项。解释少了，智能体会猜；解释多了，又会浪费大量上下文。"
          },
          {
            "type": "paragraph",
            "content": "第二个问题是修改范围失控。很多 AI 编程失败不是因为代码不会写，而是因为它顺手重构了无关文件、修改了公共组件、碰到了支付、登录、数据库这类高风险逻辑。AGENTS.md 可以提前写清楚：默认只改任务相关文件，禁止无关重构，关键业务逻辑必须得到明确要求才允许修改。"
          },
          {
            "type": "paragraph",
            "content": "第三个问题是验证不稳定。不同项目的验证方式不一样，有的用 npm，有的用 pnpm，有的要跑 lint，有的只跑某个包的测试。如果不写清楚，智能体可能运行错误命令，或者改完代码不做验证。"
          },
          {
            "type": "paragraph",
            "content": "第四个问题是团队习惯无法复用。一个团队可能有固定的分支命名、提交格式、PR 标题、设计系统规则、测试要求和代码审查习惯。AGENTS.md 可以把这些约定变成智能体每次都能读取的项目规则。"
          }
        ]
      },
      {
        "heading": "它适合写哪些内容",
        "blocks": [
          {
            "type": "paragraph",
            "content": "AGENTS.md 不适合写成百科全书。它应该只放智能体执行任务时最容易用到、最容易出错、最需要遵守的内容。重点是短、准、可执行。"
          },
          {
            "type": "paragraph",
            "content": "第一类是项目概况：项目是什么，主要用户是谁，核心流程是什么，哪些模块最关键。不要写市场宣传语，要写能帮助智能体判断代码边界的信息。"
          },
          {
            "type": "paragraph",
            "content": "第二类是目录说明：页面在哪里，组件在哪里，样式在哪里，数据在哪里，测试在哪里。尤其是大型仓库和多包项目，目录说明能明显减少无效搜索。"
          },
          {
            "type": "paragraph",
            "content": "第三类是开发命令：如何安装依赖，如何启动本地服务，如何构建，如何跑测试，如何只验证某个包或某个页面。命令越具体，智能体越不容易乱试。"
          },
          {
            "type": "paragraph",
            "content": "第四类是禁止事项：不要删除文件，不要重命名路由，不要改数据库结构，不要碰支付回调，不要大范围格式化，不要引入新依赖，除非任务明确要求。"
          },
          {
            "type": "paragraph",
            "content": "第五类是交付标准：改完必须运行什么命令，失败时如何处理，最终要总结哪些文件、哪些风险、哪些没有验证。"
          }
        ]
      },
      {
        "heading": "最小可用版本",
        "blocks": [
          {
            "type": "paragraph",
            "content": "刚开始不需要写很长。一份最小可用的 AGENTS.md，只要能让智能体知道项目是什么、怎么运行、怎么验证、不能乱动什么，就已经有价值。"
          },
          {
            "type": "code",
            "label": "最小 AGENTS.md 模板",
            "content": "# AGENTS.md\n\n## 项目概况\n\n这是一个 [项目类型] 项目，用于 [核心用途]。\n\n主要技术栈：\n- 前端：[例如 React、Vue、Next.js]\n- 后端：[例如 Node.js、Python、Supabase]\n- 样式：[例如 CSS、Tailwind、设计系统]\n\n## 常用命令\n\n- 安装依赖：`npm install`\n- 启动开发服务：`npm run dev`\n- 构建项目：`npm run build`\n- 运行测试：`npm test`\n\n## 工作规则\n\n- 默认只修改和当前任务直接相关的文件。\n- 不要删除、移动或重命名文件，除非任务明确要求。\n- 不要重构无关代码。\n- 不要引入新依赖，除非先说明原因。\n- 修改完成后必须说明改了哪些文件、为什么改、是否完成验证。\n\n## 高风险区域\n\n以下区域不要主动修改，除非任务明确要求：\n- 登录和权限\n- 支付和回调\n- 数据库结构\n- 生产环境配置\n- 用户数据迁移"
          }
        ]
      },
      {
        "heading": "如何创建自己的 AGENTS.md",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一步，先从真实项目反推规则。不要凭空写一份很完美的文档，而是看智能体最容易在哪些地方犯错：找错目录、跑错命令、乱改样式、误碰支付、忘记测试。把这些问题写进 AGENTS.md。"
          },
          {
            "type": "paragraph",
            "content": "第二步，只写会影响执行的规则。比如“保持代码优雅”太抽象，不如写成“不要在页面文件里新增硬编码颜色，颜色必须引用设计变量”。"
          },
          {
            "type": "paragraph",
            "content": "第三步，把命令写完整。不要只写“运行测试”，而要写清楚运行哪个命令、在哪个目录运行、什么情况算通过。如果项目很大，还要写局部验证命令。"
          },
          {
            "type": "paragraph",
            "content": "第四步，按任务迭代。第一次可以只写 30 行。后面每次发现智能体犯了重复错误，就把对应规则补进去。AGENTS.md 应该随着项目一起进化。"
          }
        ]
      },
      {
        "heading": "适合 AI 编程项目的完整模板",
        "blocks": [
          {
            "type": "code",
            "label": "完整 AGENTS.md 模板",
            "content": "# AGENTS.md\n\n## 项目背景\n\n[项目名称] 是一个 [项目类型]，面向 [目标用户]，核心目标是 [核心价值]。\n\n核心用户流程：\n1. [用户第一步]\n2. [用户第二步]\n3. [用户完成的关键结果]\n\n## 技术栈\n\n- 前端：\n- 后端：\n- 数据库：\n- 部署：\n- 样式系统：\n- 测试框架：\n\n## 目录结构\n\n- `src/pages`：页面入口\n- `src/components`：通用组件\n- `src/styles`：全局样式和设计变量\n- `src/data`：静态数据或数据配置\n- `src/lib`：工具函数和外部服务封装\n- `tests`：测试文件\n\n请优先阅读和当前任务相关的文件，不要无目的扫描整个项目。\n\n## 常用命令\n\n- 安装依赖：`npm install`\n- 本地开发：`npm run dev`\n- 构建：`npm run build`\n- 测试：`npm test`\n- 代码检查：`npm run lint`\n\n如果命令失败，请先阅读错误信息，优先修复和当前任务相关的问题。\n\n## 修改范围\n\n- 默认只修改当前任务直接相关的文件。\n- 不要顺手重构无关模块。\n- 不要大范围格式化文件。\n- 不要删除用户已有内容。\n- 不要修改和任务无关的文案、数据、样式或路由。\n\n## 高风险规则\n\n以下内容只有在任务明确要求时才能修改：\n- 登录、权限、会话\n- 支付、订单、回调\n- 数据库结构和迁移\n- 生产环境配置\n- 用户隐私和安全逻辑\n- 第三方密钥和环境变量\n\n## 设计规则\n\n- 复用已有组件和样式变量。\n- 不要随意新增颜色、阴影、圆角和间距。\n- 不要让按钮、标签、卡片风格和已有页面不一致。\n- 移动端必须可读，文字不能被截断或重叠。\n- 图片缺失时页面也要正常排版。\n\n## 测试和验证\n\n完成修改后，至少运行：\n- `npm run build`\n\n如果修改了核心逻辑，还需要运行：\n- `npm test`\n- `npm run lint`\n\n如果无法运行某个命令，请说明原因和风险。\n\n## 交付说明\n\n每次完成任务后，请总结：\n1. 修改了哪些文件\n2. 每个文件改了什么\n3. 运行了哪些验证命令\n4. 是否有未验证风险\n5. 是否有需要人工确认的地方"
          },
          {
            "type": "paragraph",
            "content": "这个模板不要一次性全部照抄。更好的方式是先复制结构，再删掉和当前项目无关的部分，然后把命令、目录、风险区域改成项目真实情况。"
          }
        ]
      },
      {
        "heading": "AGENTS.md 写得差会带来什么问题",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一种问题是写得太泛。比如“请写高质量代码”“请保持简洁”，这类话没有操作性，智能体无法判断具体怎么做。"
          },
          {
            "type": "paragraph",
            "content": "第二种问题是写得太长。把所有产品背景、会议纪要、路线图都塞进去，会让真正重要的规则被淹没。AGENTS.md 不是知识库，应该更像任务执行手册。"
          },
          {
            "type": "paragraph",
            "content": "第三种问题是不更新。项目命令变了、目录变了、测试方式变了，但 AGENTS.md 还停留在旧版本，智能体会按照错误规则执行。"
          },
          {
            "type": "paragraph",
            "content": "第四种问题是只有禁止，没有路径。只写“不要乱改”不够，还要写“应该改哪里”“如何验证”“不确定时先做什么”。"
          }
        ]
      },
      {
        "heading": "什么时候应该更新 AGENTS.md",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当项目新增关键目录时，应该更新。比如新增了支付模块、后台管理、设计系统、内容导入脚本，都应该说明位置和风险。"
          },
          {
            "type": "paragraph",
            "content": "当智能体连续犯同一类错误时，应该更新。比如总是忘记构建、总是误改全局样式、总是读错数据文件，这些都说明规则还不够具体。"
          },
          {
            "type": "paragraph",
            "content": "当验证命令变化时，应该更新。尤其是从 npm 切到 pnpm、从单体项目变成多包项目、从手动测试变成持续集成后，命令必须同步。"
          },
          {
            "type": "paragraph",
            "content": "当团队协作规则变化时，也应该更新。比如 PR 标题格式、分支命名、发布检查、代码审查清单，这些都可以沉淀进去。"
          }
        ]
      },
      {
        "heading": "推荐工作流",
        "blocks": [
          {
            "type": "paragraph",
            "content": "先创建一份最小 AGENTS.md，只写项目概况、常用命令、修改范围和验证规则。不要一开始追求完整。"
          },
          {
            "type": "paragraph",
            "content": "接着用它跑 3 到 5 个真实任务，观察智能体是否还会误解项目。如果它总是问同样的问题，说明这部分规则应该写进去。"
          },
          {
            "type": "paragraph",
            "content": "然后把高频任务沉淀成更具体的规则，比如页面开发规则、设计系统规则、内容导入规则、测试规则。"
          },
          {
            "type": "paragraph",
            "content": "最后把 AGENTS.md 纳入代码审查。每次项目结构或命令变化，都像维护 README 一样维护它。"
          }
        ]
      }
    ]
  },
  {
    "id": "openai-codex-cli-readme-full-translation",
    "sourceUrl": "https://github.com/openai/codex",
    "translationMode": "fullTranslation",
    "title": "Codex CLI",
    "originalTitle": "Codex CLI",
    "notice": "",
    "hideSourceNoticeLink": true,
    "hideArticleSiteLink": true,
    "hideLead": true,
    "sections": [
      {
        "heading": "Codex CLI",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex CLI 是 OpenAI 的编程智能体，可以在你的电脑本地运行。"
          },
          {
            "type": "paragraph",
            "content": "如果想在代码编辑器中使用 Codex，例如 VS Code、Cursor、Windsurf，请在集成开发环境中安装。"
          },
          {
            "type": "paragraph",
            "content": "如果想使用桌面应用体验，请运行 `codex app`，或访问 Codex 应用页面。"
          },
          {
            "type": "paragraph",
            "content": "如果正在寻找 OpenAI 的云端智能体，也就是 Codex 网页版，请访问 chatgpt.com/codex。"
          }
        ]
      },
      {
        "heading": "快速开始",
        "blocks": [
          {
            "type": "paragraph",
            "content": "安装和运行 Codex CLI。"
          }
        ]
      },
      {
        "heading": "安装并运行 Codex CLI",
        "blocks": [
          {
            "type": "paragraph",
            "content": "在 Mac 或 Linux 上运行下面的命令来安装 Codex CLI："
          },
          {
            "type": "code",
            "label": "Mac 或 Linux 安装命令",
            "content": "curl -fsSL https://chatgpt.com/codex/install.sh | sh"
          },
          {
            "type": "paragraph",
            "content": "在 Windows 上运行下面的命令来安装 Codex CLI："
          },
          {
            "type": "code",
            "label": "Windows 安装命令",
            "content": "powershell -ExecutionPolicy ByPass -c \"irm https://chatgpt.com/codex/install.ps1 | iex\""
          },
          {
            "type": "paragraph",
            "content": "也可以通过下面这些包管理器安装 Codex CLI。"
          },
          {
            "type": "code",
            "label": "使用 npm 安装",
            "content": "# 使用 npm 安装\nnpm install -g @openai/codex"
          },
          {
            "type": "code",
            "label": "使用 Homebrew 安装",
            "content": "# 使用 Homebrew 安装\nbrew install --cask codex"
          },
          {
            "type": "paragraph",
            "content": "然后直接运行 `codex` 即可开始使用。"
          }
        ]
      },
      {
        "heading": "也可以下载适合平台的二进制文件",
        "blocks": [
          {
            "type": "paragraph",
            "content": "也可以前往最新的 GitHub 发布页，下载适合你所在平台的二进制文件。"
          },
          {
            "type": "paragraph",
            "content": "每个 GitHub 发布版本都包含多个可执行文件，但实际使用时，通常需要下面这些文件之一。"
          },
          {
            "type": "paragraph",
            "content": "macOS：Apple Silicon / arm64 使用 `codex-aarch64-apple-darwin.tar.gz`；x86_64，也就是较旧的 Mac 硬件，使用 `codex-x86_64-apple-darwin.tar.gz`。"
          },
          {
            "type": "paragraph",
            "content": "Linux：x86_64 使用 `codex-x86_64-unknown-linux-musl.tar.gz`；arm64 使用 `codex-aarch64-unknown-linux-musl.tar.gz`。"
          },
          {
            "type": "paragraph",
            "content": "每个压缩包都只包含一个条目，并且平台名称会写进文件名，例如 `codex-x86_64-unknown-linux-musl`。因此，解压后通常需要把它重命名为 `codex`。"
          }
        ]
      },
      {
        "heading": "使用 ChatGPT 计划运行 Codex",
        "blocks": [
          {
            "type": "paragraph",
            "content": "运行 `codex`，然后选择“使用 ChatGPT 登录”。推荐登录 ChatGPT 账号，把 Codex 作为 Plus、Pro、Business、Edu 或 Enterprise 计划的一部分来使用。"
          },
          {
            "type": "paragraph",
            "content": "也可以使用 API 密钥运行 Codex，但这需要额外配置。"
          }
        ]
      },
      {
        "heading": "文档",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 文档：https://developers.openai.com/codex"
          },
          {
            "type": "paragraph",
            "content": "贡献说明：./docs/contributing.md"
          },
          {
            "type": "paragraph",
            "content": "安装与构建：./docs/install.md"
          },
          {
            "type": "paragraph",
            "content": "开源基金：./docs/open-source-fund.md"
          },
          {
            "type": "paragraph",
            "content": "这个仓库使用 Apache-2.0 许可证授权。"
          }
        ]
      }
    ]
  }
];
