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
            label: codeLanguage ? `${codeLanguage} prompt` : '可复制内容',
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
      label: codeLanguage ? `${codeLanguage} prompt` : '可复制内容',
      content: codeLines.join('\n').trimEnd(),
    });
  }

  commitSection();

  return sections;
}

const uicodingSkillArticleMarkdown = "# 我如何用 Codex + Impeccable Skill 做出 UIcoding.ai\n\n最近我用 Codex 搭了一个新站：UIcoding.ai。\n\n这个网站的定位很简单：整理 AI Coding 案例、学习资料、工具介绍，帮助设计师、产品经理、独立开发者更快学会用 Codex、Claude Code、Cursor 这类工具做真实产品。\n\n但真正做下来，我发现一个问题：\n\nCodex 写代码很快，但默认设计能力不稳定。\n\n它可以很快创建页面、组件、路由、数据结构，也能修构建错误。但当我说“页面更高级一点”“更像编辑精选站”“减少模板感”的时候，Codex 经常会走偏。\n\n比如它会加很多卡片。\n加很多背景块。\n加很重的阴影。\n加渐变。\n加发光边框。\n按钮越来越黑。\n标签越来越抢眼。\n最后页面不是更高级，而是更像 AI 自动生成的网站。\n\n后面我开始配合使用一个前端设计 Skill：Impeccable。\n\n我自己的理解是：\n\nCodex 负责写代码。\nImpeccable 负责做设计审查。\n\n它不是直接替你变出一个完美网站，而是帮你发现页面为什么不高级、哪里像模板、哪里排版不舒服、哪里组件太重、哪里视觉层级混乱。\n\n这篇文章复盘一下，我是怎么用 Codex + Impeccable Skill 搭建 UIcoding.ai 的。\n\n文中的代码块都可以直接复制到 Codex 输入框里，根据你的项目名称做少量替换就能用。\n\n---\n\n## 1. 为什么要给 Codex 配 Impeccable\n\n只用 Codex 写代码时，它非常适合完成明确的工程任务。\n\n比如：\n\n创建页面。\n新增组件。\n调整路由。\n补静态数据。\n修构建错误。\n优化移动端。\n整理页面结构。\n\n这些事情只要你描述清楚，Codex 基本都能完成。\n\n但设计不一样。\n\n设计不是简单地“多写几行样式”。\n\n很多时候页面不高级，不是因为缺少效果，而是因为东西太多了。\n\n我在做 UIcoding.ai 的时候，遇到过很多这种问题：\n\n首页 Hero 区域信息太满。\n案例卡片像普通组件库默认样式。\n学习资料页面没有文章阅读感。\n工具页 icon 白底太突兀。\n按钮颜色太重，抢了内容注意力。\n标签太多，视觉上比标题还突出。\n卡片 hover 太夸张，页面像模板站。\n灰色占位图太默认，没有编辑感。\n\n如果我只对 Codex 说：\n\n```text\n页面不够高级，帮我优化一下。\n```\n\n它很容易继续堆效果。\n\n但 Impeccable 更适合做“设计审查”。\n\n我会让它先审查页面，再只挑最影响质感的几个问题改。\n\n这样比一次性大改稳定很多。\n\n---\n\n## 2. 一键安装 Impeccable：直接复制给 Codex\n\n如果你想在 Codex 项目里使用 Impeccable，最简单的方式不是自己去研究一堆命令，而是直接让 Codex 帮你检查、安装、初始化。\n\n我会把安装任务也写得很明确。\n\n不要让 Codex 一边安装，一边顺手改项目代码。\n\n可以直接复制这段：\n\n```text\n请帮我在当前项目中一键安装并初始化 Impeccable Skill。\n\n要求：\n1. 先确认当前目录是否是项目根目录。\n2. 检查 package.json 是否存在。\n3. 不要修改业务代码。\n4. 不要修改页面组件。\n5. 不要修改 CSS 文件。\n6. 只执行 Impeccable 的安装和初始化相关步骤。\n7. 如果需要执行命令，请先说明命令用途，然后再执行。\n8. 安装完成后，告诉我如何在 Codex 中调用 Impeccable。\n\n请执行：\n- npx impeccable install\n- 按项目级安装优先\n- 安装后提示我重启 Codex 或重新加载技能\n- 然后指导我运行 /impeccable init\n\n如果 Codex 中看不到 /impeccable，请告诉我如何通过 /skills 或 $ 检查技能是否已加载。\n```\n\n这段的重点是：\n\n只安装 Skill。\n不要改页面。\n不要改 CSS。\n不要顺手优化 UI。\n\n安装工具和修改项目要分开。\n\n这是我踩过的坑。\n\n有时候你只是想安装一个 Skill，Codex 会顺手开始“优化项目结构”。这种非常没必要。\n\n所以安装阶段一定要写清楚：只安装，不改业务代码。\n\n---\n\n## 3. 初始化 Impeccable：先告诉它 UIcoding.ai 是什么\n\n安装之后，不要马上让它改页面。\n\n先初始化项目上下文。\n\nImpeccable 需要知道这个网站是什么类型、面向谁、视觉方向是什么、不要像什么。\n\nUIcoding.ai 不是一个传统 SaaS 工具站。\n\n它更像一个 AI Coding 案例和学习内容站。\n\n所以我不会只说“现代、简洁、高级”。\n\n这种词太泛了。\n\n我会这样描述：\n\n```text\n请使用 /impeccable init 初始化当前项目的设计上下文。\n\n这是 UIcoding.ai，一个 AI Coding 案例和学习内容站。\n\n项目定位：\n- 面向设计师、产品经理、独立开发者、一人公司\n- 帮助用户学习如何使用 Codex、Claude Code、Cursor 等 AI Coding 工具\n- 展示优秀 AI Coding 案例、教程、工具和实战经验\n\n网站气质：\n- 编辑感\n- 可信\n- 简洁\n- 有审美\n- 像高质量内容精选站\n- 不要像普通 SaaS 模板\n- 不要像组件库 demo\n- 不要像自动生成的 AI 工具站\n\n视觉参考：\n- 高质量编辑型内容站\n- 设计案例精选站\n- 干净的产品手册页面\n- 有留白、有节奏、有明确层级\n\n反向要求：\n- 不要重渐变\n- 不要重阴影\n- 不要发光边框\n- 不要多层卡片嵌套\n- 不要满屏黑色按钮\n- 不要让标签比标题更抢眼\n- 不要把所有内容都放进背景块\n\n初始化完成后，请总结 Impeccable 记录了哪些项目上下文。\n不要修改页面代码。\n```\n\n这一步很重要。\n\n因为如果没有项目上下文，Impeccable 也只能给出比较通用的设计建议。\n\n我希望它理解：\n\nUIcoding.ai 是内容站，不是后台系统。\n是编辑精选站，不是普通工具站。\n是给 AI Coding 学习者看的，不是给企业采购看的。\n\n上下文越清楚，后面的设计审查越准确。\n\n---\n\n## 4. 先做能跑起来的项目，不要一开始追求完美\n\nUIcoding.ai 一开始不是直接做完整网站。\n\n我先让 Codex 创建一个最小可运行版本。\n\n技术上也没有搞复杂：\n\nReact。\nVite。\nnpm。\n普通 CSS。\n静态数据。\n\n页面也先只做首页：\n\nHeader。\nHero。\n精选案例。\n学习资料。\n常用工具。\nFooter。\n\n这个阶段最重要的不是设计多漂亮，而是项目能跑、结构清晰、文件不要拆太碎。\n\n可以直接复制：\n\n```text\n从零开始创建一个 React + Vite 前端项目。\n\n技术栈：\n- React\n- Vite\n- npm\n- 普通 CSS\n- 静态数据\n\n当前只做首页。\n不要做后端。\n不要做登录。\n不要做数据库。\n不要接 API。\n不要引入复杂组件库。\n\n文件结构保持简单：\n- src/main.jsx\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/\n\n样式文件可以按规范拆分，但不要过度复杂：\n- tokens\n- base\n- layout\n- components\n- pages\n\n首页包含：\n1. Header\n2. Hero\n3. 精选案例\n4. 学习资料\n5. 常用工具\n6. Footer\n\n完成后运行：\nnpm install\nnpm run build\n\n构建成功后停止，不要继续扩展新功能。\n```\n\n这里有个坑。\n\n如果一开始就说“帮我做完整网站”，Codex 很容易把项目拆得很复杂。\n\n路由、状态、组件、样式文件、数据文件全部一起上。\n\n看起来很专业，但后面非常难控。\n\n我现在更倾向于：\n\n先简单跑起来。\n再逐页迭代。\n再用 Impeccable 审查。\n最后把规范沉淀到固定样式文件里。\n\n---\n\n## 5. 设计规范不要只写进 MD，要沉淀成固定 CSS 规范\n\n这里我后来也调整过一次。\n\n一开始我以为，把设计规则写进 AGENTS.md 或 DESIGN.md 就够了。\n\n比如告诉 Codex：\n\n页面要高级。\n按钮不要太重。\n卡片不要太模板。\n不要使用重渐变。\n标签不要太抢眼。\n\n但实际开发下来发现，只写在 MD 文件里不够。\n\nMD 文件更适合做上下文说明和工作规则。\n\n真正决定网站质感的，是固定的 CSS 规范。\n\n我的理解是：\n\nAGENTS.md 管 Codex 的行为。\nPRODUCT.md / DESIGN.md 管设计上下文。\n固定 CSS 文件管真正的视觉系统。\nImpeccable 负责审查页面有没有偏离规范。\n\n所以 UIcoding.ai 的样式不应该散落在每个页面里，也不应该每次让 Codex 重新写一套样式。\n\n更合理的方式是建立固定样式结构：\n\n```text\nsrc/styles/\n  tokens.css\n  base.css\n  layout.css\n  components.css\n  pages.css\n```\n\n这里不展开 CSS 代码，只说每个文件的作用。\n\ntokens.css：放颜色、字体、字号、间距、圆角、阴影、容器宽度。\nbase.css：放 body、标题、段落、链接、图片等基础样式。\nlayout.css：放 Container、Section、Grid、页面宽度、响应式布局。\ncomponents.css：放 Button、Card、Badge、Nav、Footer 等通用组件样式。\npages.css：放首页、案例页、详情页等页面级样式。\n\n这样做的好处是：\n\n颜色不会每个页面乱写。\n按钮不会每个页面长得不一样。\n卡片圆角和间距会统一。\n页面布局有固定节奏。\nCodex 不会每次重新发明一套视觉系统。\n\n可以直接复制这个 prompt：\n\n```text\n请为当前项目建立一套固定 CSS 设计规范，但不要输出具体 CSS 代码给我解释。\n\n目标：\n把 UIcoding.ai 的视觉规范沉淀到固定样式文件中，而不是只写进 AGENTS.md 或 DESIGN.md。\n\n请整理或创建这些文件：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n要求：\n1. tokens.css 只负责设计变量，比如颜色、字体、字号、间距、圆角、阴影、容器宽度。\n2. base.css 只负责全站基础样式，比如 body、标题、段落、链接、图片。\n3. layout.css 只负责布局规则，比如 Container、Section、Grid、响应式。\n4. components.css 只负责通用组件，比如 Button、Card、Badge、Nav、Footer。\n5. pages.css 只负责页面级样式，比如首页、案例页、详情页。\n6. 不要把页面专属样式写进 tokens。\n7. 不要在页面文件里随机新增颜色、阴影、圆角和间距。\n8. 不要引入新的 UI 组件库。\n9. 不要重构业务逻辑。\n10. 不要修改页面内容结构，除非样式引用必须调整。\n\n视觉方向：\n- 编辑感\n- 干净\n- 高级\n- 可信\n- 不要像默认组件库\n- 不要重渐变\n- 不要重阴影\n- 不要多层卡片嵌套\n- 标签不要抢过标题\n- 按钮不要太重\n\n完成后运行 npm run build，并总结：\n1. 创建或修改了哪些样式文件\n2. 每个样式文件负责什么\n3. 哪些页面或组件引用了这些样式\n4. 是否存在需要后续清理的重复样式\n```\n\n这个比“把设计规则写进 AGENTS.md”更有效。\n\nAGENTS.md 可以提醒 Codex 不要乱改设计系统。\n\n但真正的设计系统，必须落到固定 CSS 文件里。\n\n---\n\n## 6. 把大任务拆成单页任务\n\nAI Coding 最容易失控的地方，就是一次性要求它做完整站点。\n\nUIcoding.ai 我后面拆成了几个页面：\n\n首页。\n案例列表页。\n案例详情页。\n学习资料页。\n工具索引页。\n工具详情页。\n提交作品页。\n登录页。\n404 页面。\n\n每次只做一个页面。\n\n比如做案例页，我不会说“把案例系统做完整”。\n\n我会这样写：\n\n```text\n继续开发当前项目。\n\n本次任务只实现一个页面：/cases。\n\n不要创建后端。\n不要创建登录。\n不要接数据库。\n不要重构目录。\n不要引入复杂路由方案。\n不要修改首页视觉风格。\n不要修改设计 tokens。\n\n允许新增：\n- src/pages/CasesPage.jsx\n\n允许修改：\n- src/App.jsx\n- src/data.js\n- src/components/\n- src/styles/pages.css\n\n页面必须复用已有组件和样式规范：\n- Container\n- Section\n- Button\n- Badge\n- Card\n- CaseCard\n\n页面内容：\n1. 页面标题\n2. 简短说明\n3. 分类筛选\n4. 案例卡片列表\n5. 空状态\n\n完成后运行：\nnpm run build\n\n如果构建成功就停止。\n```\n\n这种写法看起来啰嗦，但非常有用。\n\n因为它限制了 Codex 的修改范围。\n\n我之前踩过的坑是：只想做一个页面，它顺手把全站样式也改了。\n\n所以现在我会明确写：\n\n允许新增什么。\n允许修改什么。\n禁止修改什么。\n必须复用什么。\n完成后跑什么命令。\n\n这样出问题也容易定位。\n\n---\n\n## 7. 用 Impeccable 做第一次设计审查\n\n页面能跑起来之后，不要马上继续加功能。\n\n先让 Impeccable 做设计审查。\n\n这里一定不要说“帮我改好看一点”。\n\n要让它先审查，不要直接改代码。\n\n可以复制：\n\n```text\n请使用 Impeccable Skill 走查当前首页。\n\n目标：\n- 高级\n- 编辑感\n- 可信\n- 像高质量 AI Coding 内容站\n- 不要像默认组件库模板\n- 不要像 AI 自动生成的 SaaS 页面\n\n请重点检查：\n1. 信息层级是否清楚\n2. Hero 是否太满\n3. 字体和字号是否有节奏\n4. 按钮是否太重\n5. 卡片是否太像模板\n6. 标签是否太抢眼\n7. 图片占位是否太默认\n8. 移动端是否拥挤\n9. 页面是否复用 src/styles 下的设计规范\n10. 是否存在页面里随机新增颜色、阴影、圆角和间距\n\n不要直接大改代码。\n先只指出最影响质感的 3 个问题。\n\n每个问题请包含：\n- 具体问题\n- 为什么影响质感\n- 建议怎么改\n- 可能涉及哪些样式文件或组件\n```\n\n这一步很关键。\n\n我不让它马上改代码，而是先让它审查。\n\n因为很多时候 Codex 直接改，会一次性改太多。\n\n先让 Impeccable 给出问题清单，再挑前三个改，效果会稳定很多。\n\n---\n\n## 8. 只修前三个最影响质感的问题\n\nImpeccable 走查后，通常会指出很多问题。\n\n但不要一次性全改。\n\n我一般只挑最重要的 3 个。\n\n比如它指出：\n\n按钮太重。\n卡片信息太挤。\n图片占位太默认。\n\n那这一轮就只改这三个。\n\n可以这样写：\n\n```text\n根据刚才 Impeccable 的设计走查结果，本轮只修复最影响质感的 3 个问题。\n\n只允许调整：\n- 颜色引用\n- 字体层级\n- 间距\n- 卡片样式\n- 按钮样式\n- 图片占位样式\n- 移动端布局细节\n\n优先修改：\n- src/styles/tokens.css\n- src/styles/base.css\n- src/styles/layout.css\n- src/styles/components.css\n- src/styles/pages.css\n\n不要新增页面。\n不要修改数据结构。\n不要重构组件。\n不要改路由。\n不要引入新依赖。\n不要做动画大改。\n不要在页面文件中写散乱样式。\n\n修复目标：\n1. 降低按钮的视觉重量\n2. 让卡片信息更舒展\n3. 让图片占位更像真实内容站，而不是灰色默认块\n\n完成后运行 npm run build，并总结修改了哪些文件。\n```\n\n这个方式比“帮我整体提升设计”稳定很多。\n\n因为它不是凭感觉改，而是基于设计审查结果改。\n\n---\n\n## 9. Impeccable 真正有用的地方：反模板感\n\n我觉得 Impeccable 最大的价值，不是让页面突然变成世界顶级设计。\n\n而是帮你避免 AI 页面常见问题。\n\n比如：\n\n卡片太多。\n按钮太黑。\n标签太抢眼。\n阴影太模板。\n渐变太重。\n页面到处都是圆角卡片。\n图标都放在圆角方块里。\n灰色文字放在浅色背景上，可读性很差。\nHero 区域堆太多信息，像 AI 生成的 SaaS 模板。\n\n这些问题非常常见。\n\nCodex 默认很容易做出这种页面，因为它学到的很多前端模式就是这种。\n\nImpeccable 的好处是，它会提醒你：\n\n不要再堆卡片了。\n不要再加渐变了。\n不要让标签比标题还抢眼。\n不要用组件库默认审美。\n不要把所有内容都装进背景块里。\n不要让 hover 效果变成炫技。\n\n这对 UIcoding.ai 很有帮助。\n\n因为我希望它更像一个编辑精选站，而不是一个普通 AI 工具站。\n\n---\n\n## 10. 自动设计审查：让 Impeccable 每轮都检查\n\n后面我更常用的是一个固定循环：\n\nCodex 完成页面。\nImpeccable 审查。\n只修前三个问题。\n重新构建。\n再检查页面。\n\n可以把这个流程写成固定提示词：\n\n```text\n请对当前页面执行一次 Impeccable 自动设计审查循环。\n\n流程：\n1. 读取当前页面和相关样式文件。\n2. 从视觉品质角度审查页面。\n3. 检查页面是否符合 src/styles 下的固定 CSS 规范。\n4. 只列出最影响质感的 3 个问题。\n5. 不要提出超过 3 个问题。\n6. 不要大改结构。\n7. 只针对这 3 个问题做最小修改。\n8. 修改后运行 npm run build。\n9. 最后总结修改文件、修改内容和剩余问题。\n\n审查标准：\n- 是否像真实内容站\n- 是否有编辑感\n- 是否有清晰层级\n- 是否避免组件库默认感\n- 是否避免 AI 模板感\n- 是否移动端可读\n- 是否复用 tokens、layout、components 的样式规范\n- 是否存在随机颜色、随机圆角、随机阴影、随机间距\n\n不要新增页面。\n不要新增功能。\n不要修改业务逻辑。\n不要引入新依赖。\n```\n\n这个提示词我觉得很适合零基础用户。\n\n因为你不需要懂太多设计术语。\n\n只要让 Impeccable 先审查，再让 Codex 只改前三个问题，就能稳定提升页面质感。\n\n---\n\n## 11. 更严格一点：用 detect 做反模式检查\n\n除了让 Impeccable 在 Codex 里审查页面，也可以让它做更偏自动化的反模式检查。\n\n我会把它理解成：\n\n不是审美打分。\n而是检查页面里有没有明显的 AI 设计坏味道。\n\n比如：\n\n重渐变。\n发光边框。\n过度阴影。\n模板化色彩。\n不必要的视觉装饰。\n\n可以直接复制：\n\n```text\n请为当前项目执行一次 Impeccable 反模式检测。\n\n要求：\n1. 运行 npx impeccable detect src/\n2. 如果检测失败，请不要马上大改。\n3. 先总结检测到了哪些问题。\n4. 按严重程度排序。\n5. 只选择最影响页面质感的 3 个问题。\n6. 说明每个问题可能影响哪些页面或组件。\n7. 等我确认后再修改。\n\n不要修改业务逻辑。\n不要新增依赖。\n不要改路由。\n不要重构组件结构。\n```\n\n我建议不要让它检测完就自动大改。\n\n先让它列问题。\n\n因为有些检测结果可能不是当前最重要的问题。\n\n设计优化不是越多越好。\n\n每次只改最重要的 3 个，反而更稳。\n\n---\n\n## 12. 页面验证不要省\n\n很多问题不是看代码能发现的。\n\n而是在浏览器里才看得出来。\n\n我做 UIcoding.ai 的时候，遇到过这些问题：\n\n卡片底部有一条白线。\n图标白底太大。\nHero 图片被裁剪。\n详情页正文宽度太宽。\n标签在移动端换行很乱。\n某个卡片 hover 后会撑开布局。\n图片加载失败后占位很丑。\n页面出现横向滚动条。\n\n所以每次修改后，我都会要求 Codex 做验证。\n\n```text\n修改完成后请执行以下验证：\n\n1. 运行 npm run build。\n2. 打开本地页面。\n3. 检查是否有横向溢出。\n4. 检查移动端布局是否拥挤。\n5. 如果页面包含图片，检查图片是否加载成功、是否被裁剪。\n6. 如果页面包含卡片，检查 hover、按钮、标签、标题和描述是否对齐。\n7. 如果页面包含长文本，检查正文宽度和行高是否适合阅读。\n8. 检查页面是否继续复用 src/styles 下的固定样式规范。\n\n只汇报验证结果。\n不要继续扩展新功能。\n```\n\n这里的关键是最后一句：\n\n不要继续扩展新功能。\n\nCodex 有时候很容易顺手做更多事情。\n\n你必须让它停在当前任务。\n\n---\n\n## 13. AGENTS.md 应该写什么\n\n设计规范不应该只写进 AGENTS.md。\n\n但 AGENTS.md 仍然有用。\n\n它应该写工作规则，而不是承载完整设计系统。\n\n我会这样写：\n\n```text\n请更新 AGENTS.md，只加入必要的工作规则。\n\n不要把完整设计规范写进 AGENTS.md。\n真正的设计规范在 src/styles/ 下的固定 CSS 文件中。\n\nAGENTS.md 只需要说明：\n1. 不要删除、移动、重命名文件，除非明确要求。\n2. 不要重构无关代码。\n3. 不要修改业务逻辑，除非当前任务要求。\n4. UI 修改必须优先复用 src/styles 下的规范。\n5. 不要在页面文件里随机新增颜色、阴影、圆角、间距。\n6. 不要随便修改 tokens，除非任务明确要求调整设计系统。\n7. 每次 UI 修改后，优先使用 Impeccable 做设计审查。\n8. 每轮只修最重要的 3 个视觉问题。\n9. 修改完成后必须运行 npm run build。\n10. 最后总结修改了哪些文件。\n\n保持简洁，不要写成长文档。\n```\n\n这样更合理。\n\nAGENTS.md 负责提醒 Codex：\n\n设计系统已经在 CSS 里了。\n不要每次重新发明样式。\n不要乱改 tokens。\n不要把页面样式写散。\n\n而 Impeccable 负责审查页面有没有偏离规范。\n\n---\n\n## 14. Impeccable 帮我具体改出了哪些方向\n\nUIcoding.ai 后面的视觉方向，就是这样一点点收敛出来的。\n\n一开始页面比较像普通组件站。\n\n后来慢慢改成：\n\n品牌色从纯黑转向更有温度的棕色。\n按钮变轻，不再满屏黑色按钮。\n卡片 hover 只做轻微反馈。\n学习详情页更像文章阅读，不再用很多背景块。\n工具页统一真实产品 icon，而不是随机图标。\n案例详情页减少模块堆叠，重点展示图片和作者信息。\n列表页标签降低视觉权重，让标题和封面更突出。\nFooter 和导航更克制，不抢主内容。\n\n这些不是一次性做出来的。\n\n而是每次审查一点，修改一点，再验证一点。\n\n这也是我现在觉得最适合 AI Coding 的方式：\n\n不要追求一次生成完美页面。\n而是让 AI 帮你持续迭代。\n\n---\n\n## 15. 给零基础用户的建议\n\n如果你是零基础用户，不要把 AI Coding 理解成“一句话生成完整网站”。\n\n这种方式很容易失控。\n\n更稳定的方式是：\n\n先做一个能运行的版本。\n再逐页拆任务。\n每次只改一个页面。\n每次只解决 3 个设计问题。\n每次修改后都构建验证。\n最后把规则沉淀到固定 CSS 规范里。\n\nImpeccable 最适合用在这种场景：\n\n你觉得页面不对劲。\n但你说不清哪里不对。\n\n这时候不要直接让 Codex “优化一下”。\n\n而是让 Impeccable 先审查。\n\n比如：\n\n```text\n请用 Impeccable 审查这个页面。\n只指出最影响质感的 3 个问题。\n不要直接改代码。\n```\n\n然后再让 Codex 按这 3 个问题修改。\n\n这样做慢一点，但更稳。\n\n也更接近真实产品开发流程。\n\n---\n\n## 总结\n\n这次做 UIcoding.ai，我最大的感受是：\n\nCodex 适合执行。\nImpeccable 适合审查。\n\nCodex 能很快把页面写出来，但它不一定知道页面为什么不高级。\n\nImpeccable 的价值，就是帮你把“感觉不对”变成更具体的问题。\n\n比如：\n\n按钮太重。\n标签太抢眼。\n卡片太模板。\n图片像占位。\n间距没有节奏。\n页面信息太满。\n移动端阅读压力太大。\n\n有了这些判断，再让 Codex 修改，效率会高很多。\n\n我现在的工作流基本是：\n\n```text\nCodex 搭页面\n↓\n固定 CSS 规范约束视觉\n↓\nImpeccable 做设计审查\n↓\n只改最重要的 3 个问题\n↓\nnpm run build\n↓\n浏览器验证\n↓\n把稳定规则沉淀到项目结构里\n```\n\n这套流程不复杂，但很适合独立开发者。\n\n尤其是你不想只做一个“能跑”的网站，而是希望页面真的有一点质感。\n\nUIcoding.ai 就是这样一点点做出来的。";

const knowlensCodexTipsMarkdown = "# 20 亿 Token 后，我用 Codex 开发 KnowLens.ai 的 8 个技巧\n\n过去两周，我基本都在用 Codex 开发 KnowLens.ai。\n\n累计差不多花了 20 亿 token。\n\n说实话，这里面至少 50% 都浪费在重构、修 bug、恢复错误改动上。\n\n不是 Codex 不行，而是我一开始太乐观了。我以为只要不停把需求丢给它，它就能一路把产品做出来。结果真正做下来才发现，如果前期没有设计好产品工作流，Codex 会很努力地写代码，也会很努力地把项目改乱。\n\nKnowLens.ai 最开始只是一个很简单的想法：\n\n用户输入一段文本，AI 自动生成一张专业的信息可视化图片。\n\n比如科普内容、新闻热点、财报摘要、历史知识、流程说明，都可以变成一张更适合传播的 infographic。\n\n但真正做起来之后，功能很快就变多了。\n\nGoogle 登录要做。\n积分要做。\nStripe 支付要做。\n生成记录要保存。\n图片要能下载。\nSEO 页面要批量做。\n博客页、案例页、错误页、loading 状态都要补。\nVercel 环境变量、数据库、图片存储、支付回调也都要处理。\n\n一开始如果没有主线，后面就会不断重构。\n\n我前期最大的问题就是：想到哪里做到哪里。\n\n今天让 Codex 改生成流程，明天让它改登录，后天让它接 Stripe，再后面又让它做 SEO 页面。页面、组件、API、数据库、支付逻辑全部混在一起改，很快项目就开始变乱。\n\n后面我才慢慢总结出一套比较稳定的使用方式。\n\n下面是我用 Codex 开发 KnowLens.ai 后，总结出来的 8 个技巧。顺序是由浅入深，从最基础的任务拆分，到后面更容易出问题的登录、支付、部署链路。\n\n---\n\n## 1. 先写产品主流程，不要一上来就让 Codex 写功能\n\n这是我踩的第一个坑。\n\n我一开始太想快速看到效果了。\n\n想到一个功能，就直接丢给 Codex 做。\n\n比如：\n\n```text\n帮我做一个 AI infographic generator。\n```\n\n然后又继续加：\n\n```text\n增加登录。\n增加支付。\n增加积分。\n增加生成历史。\n增加 SEO 页面。\n增加博客页面。\n增加案例页面。\n```\n\n看起来每天都在推进，但其实项目越来越乱。\n\n因为我没有先定义清楚 KnowLens.ai 的核心工作流。\n\n后面我重新收敛了一下，发现真正最核心的流程其实就这一条：\n\n```text\n用户输入文本\n↓\nAI 理解内容\n↓\n生成 infographic prompt\n↓\n调用图像模型\n↓\n生成图片\n↓\n保存生成记录\n↓\n扣除积分\n↓\n用户下载图片\n```\n\n这条主流程稳定之前，不应该同时做太多分支。\n\n我后来会先把这个主流程发给 Codex：\n\n```text\n这是 KnowLens.ai 当前最核心的产品流程：\n\n用户输入文本\n↓\nAI 理解内容\n↓\n生成 infographic prompt\n↓\n调用图像模型\n↓\n生成图片\n↓\n保存生成记录\n↓\n扣除积分\n↓\n用户下载图片\n\n后续所有功能都围绕这个流程做。\n不要新增复杂分支。\n不要提前做 PPT、视频、博客、案例库等功能。\n先保证文本生成 infographic 的主链路稳定。\n```\n\n这样 Codex 执行起来会稳定很多。\n\n我现在的感受是，Codex 不怕写代码，它怕你没有主线。\n\n你不给它主线，它就会按自己的理解扩展。最后功能可能做了很多，但产品会越来越散。\n\n---\n\n## 2. 每次只让 Codex 做一个小任务\n\n第二个坑，是我一开始特别喜欢一次性给大需求。\n\n比如我会说：\n\n```text\n帮我整体优化一下网站，看起来更高级一点，顺便把移动端、SEO、交互、组件都处理下。\n```\n\n这种需求看起来很省事，但结果基本都会失控。\n\nCodex 可能会同时改首页、组件、全局样式、layout、SEO、按钮、卡片，甚至还会顺手改一些和当前任务没关系的逻辑。\n\n我遇到过很多次这种情况：\n\n我只是想优化一个页面的视觉，结果它改了公共组件。\n我只是想调整一个按钮，结果它动了全局 CSS。\n我只是想做一个 SEO 页面，结果它顺手改了路由结构。\n\n后面排查起来非常浪费时间。\n\n现在我基本只让 Codex 一次做一个很小的任务。\n\n比如只优化首页 Hero：\n\n```text\n只优化首页 Hero 区域。\n不要改其他页面。\n不要改全局样式。\n不要动登录、支付、积分、数据库逻辑。\n\n目标：\n1. H1 更清晰\n2. 按钮更统一\n3. 留白更舒服\n4. 移动端不要拥挤\n\n完成后告诉我改了哪些文件。\n```\n\n如果我要做一个完整页面，也会拆成几轮：\n\n第一轮：只做页面结构。\n第二轮：只优化视觉。\n第三轮：只做移动端。\n第四轮：只补 SEO metadata。\n第五轮：只补 loading / error 状态。\n\n这样看起来慢一点，但实际更快。\n\n因为你不需要反复返工。\n\nCodex 最怕的不是任务复杂，而是边界不清楚。\n\n---\n\n## 3. 需求要写验收标准，不要只写感觉\n\n这是做 UI 时最容易踩的坑。\n\n我之前经常会说：\n\n```text\n这个页面不够高级，帮我优化一下。\n```\n\n结果 Codex 很容易理解成：多加一点设计元素。\n\n然后页面上就会出现：\n\n渐变背景。\n大阴影。\n发光边框。\n多层卡片。\n很多小图标。\n一堆装饰线。\n\n最后页面更复杂了，但不一定更高级。\n\n我发现，Codex 对“高级”“精致”“有质感”这种词理解不稳定。它会努力做设计，但很容易做成那种 AI 模板站。\n\n后面我就不只说感觉，而是写具体验收标准。\n\n比如：\n\n```text\n只优化首页 Hero 区域。\n\n验收标准：\n- H1 桌面端 64px，移动端 40px\n- H1 最多 2 行\n- 副标题最大宽度 640px\n- 主按钮高度 48px\n- 按钮圆角 999px\n- 不要新增渐变背景\n- 不要新增装饰图标\n- 不要使用多层卡片嵌套\n- 移动端改成上下结构\n```\n\n这种效果会好很多。\n\n因为 Codex 终于知道什么叫“完成”。\n\n我现在做视觉优化，一般都会直接写：\n\n```text\n不要加复杂背景。\n不要堆装饰元素。\n不要使用多层卡片嵌套。\n不要把页面做得很重。\n保持干净、清晰、留白充足。\n```\n\n如果有具体参数，我会直接写参数。\n\n比如字号、间距、按钮高度、圆角、最大宽度、移动端布局。\n\n对 Codex 来说，“高级”太抽象，具体参数才是约束。\n\n---\n\n## 4. 一定要写 AGENTS.md\n\n这个是我后面才开始重视的。\n\nAGENTS.md 可以理解成写给 Codex 的项目规则。\n\n它不是写给用户看的，也不是普通说明文档，而是告诉 AI coding agent：\n\n这个项目是什么。\n哪些东西不能乱动。\n哪些逻辑不能随便改。\n遇到任务应该怎么读文件。\n改完以后怎么总结。\n\n我前期没有 AGENTS.md，Codex 经常会做一些让我很崩溃的事情。\n\n比如：\n\n让它改一个页面，它全项目搜索。\n让它修一个样式，它动了公共组件。\n让它新增一个页面，它顺手重构了 layout。\n让它优化视觉，它把全局样式也改了。\n\n后面我给项目加了 AGENTS.md，情况明显好了很多。\n\n可以直接让 Codex 创建：\n\n```text\n在项目根目录创建 AGENTS.md。\n\n要求：\n- 项目是 Next.js + TypeScript\n- 产品是 KnowLens.ai，一个 AI infographic generator\n- 不要删除、移动、重命名文件\n- 不要重构无关代码\n- 不要全项目乱搜\n- 不要修改登录、支付、积分、数据库、部署逻辑，除非我明确要求\n- UI 保持简洁、高级、干净，不要做成很重的 AI 模板风格\n- 每次修改后总结改了哪些文件\n```\n\n生成出来可以类似这样：\n\n````md\n# AGENTS.md\n\n## Project\n\nKnowLens.ai is a Next.js + TypeScript product for generating AI infographics from text.\n\nThe product includes:\n- Landing pages\n- AI infographic generation workflow\n- Google login\n- Stripe payment\n- User credits\n- SEO pages\n- Blog and example pages\n\n## Working Rules\n\n- Do not delete, move, or rename files unless explicitly requested.\n- Do not refactor unrelated code.\n- Do not rewrite the whole project.\n- Do not run broad project-wide searches unless necessary.\n- Read only the files related to the current task.\n- Keep changes small and easy to review.\n- If the task is large, split it into smaller steps.\n- Always explain which files were changed.\n\n## UI Rules\n\n- Keep the UI clean, premium, and simple.\n- Avoid heavy gradients, too many background blocks, and nested cards.\n- Use clear typography, spacing, and hierarchy.\n- Prefer mobile-readable layouts.\n- Do not add random decorative elements.\n- Do not make the site look like a generic AI template.\n\n## Product Rules\n\n- Do not change login, payment, credit, database, or deployment logic unless requested.\n- Keep the generation flow simple.\n- Preserve existing routes and user flows.\n- For SEO pages, keep metadata, H1, FAQ, internal links, and CTA sections.\n- For generation tasks, keep the flow stable: input → prompt → image generation → save result → deduct credits → download.\n\n## Commands\n\nUse the package manager already used by the project.\n\nCommon commands:\n\n```bash\npnpm install\npnpm dev\npnpm lint\npnpm build\n````\n\nIf pnpm is not available, check package.json before using npm.\n\n## After Changes\n\nAfter every task, summarize:\n\n* Files changed\n* What changed\n* Any risk or follow-up needed\n\n````\n\nAGENTS.md 不需要写很长。\n\n我之前试过写特别复杂的规则，结果效果反而不好。\n\n太长了，Codex 也抓不住重点。\n\n核心就是几句话：\n\n```text\n不要乱删文件。\n不要乱重构。\n不要改无关代码。\n不要碰关键业务逻辑。\n只做当前任务。\n````\n\n这几个规则比长篇大论更有用。\n\n---\n\n## 5. 登录、支付、积分、数据库要单独保护\n\n这是我觉得最重要的经验之一。\n\n页面坏了，一眼能看出来。\n\n但登录、支付、积分、数据库逻辑坏了，可能线上跑一段时间才发现。\n\n我在开发 KnowLens.ai 的时候，就发现这些模块一定不能让 Codex 随便碰。\n\n比如：\n\n用户支付成功了，但积分没加。\n图片生成失败了，但积分没退。\n用户没登录，却能访问不该访问的页面。\nStripe webhook 被改坏了，但当时没发现。\n数据库字段被改了，结果旧数据读不出来。\n\n这些问题都比 UI 问题严重。\n\n所以我现在只要做页面任务，都会加一句：\n\n```text\n不要修改 Google 登录逻辑。\n不要修改 Stripe webhook。\n不要修改积分扣除逻辑。\n不要修改数据库 schema。\n只做当前页面展示。\n```\n\n比如优化 pricing 页面，我会这样写：\n\n```text\n只优化 pricing section 的前端展示。\n\n不要修改 Stripe API。\n不要修改 webhook。\n不要修改环境变量。\n不要修改数据库。\n不要修改积分逻辑。\n\n只调整页面展示、文案、布局和按钮样式。\n```\n\n这个非常重要。\n\nCodex 有时候太热心了。\n\n你只是让它优化 pricing，它可能顺手帮你“优化”支付逻辑。\n\n你只是让它改登录页面文案，它可能顺手动 auth 逻辑。\n\n这种都很危险。\n\n我的建议是：凡是涉及钱、账号、积分、数据库的地方，一定要单独开任务。\n\n不要和 UI 优化混在一起。\n\n---\n\n## 6. 不要让 Codex 一直全项目搜索\n\nCodex 卡顿，很多时候不是代码写不出来，而是它一直在搜索。\n\n项目小的时候无所谓。\n\n但项目一大，文件一多，它可能为了改一个按钮，把整个项目翻一遍。\n\n我遇到过很典型的情况：\n\n只是让它改首页 Hero，它去读支付文件。\n只是让它改登录页，它去看生成接口。\n只是让它做 SEO 页面，它去扫数据库逻辑。\n\n然后它就一直读文件、分析、搜索，最后非常慢。\n\n后面我会直接限制它的读取范围。\n\n比如改首页：\n\n```text\n只查看首页文件和首页用到的组件。\n不要读取支付、数据库、API 相关文件。\n不要扫描整个项目。\n```\n\n比如改登录页：\n\n```text\n只查看 login 页面、auth button 组件和相关路由。\n不要读取 Stripe、credit、generation 相关代码。\n```\n\n比如改 pricing：\n\n```text\n只查看 pricing 组件和页面文件。\n不要读取 Stripe webhook。\n不要读取数据库文件。\n不要修改支付 API。\n```\n\n这个技巧非常实用。\n\nCodex 不是不能搜索，而是不要无目的搜索。\n\n越大的项目，越要限制它读哪些文件。\n\n否则 token 会消耗很快，效率也会变低。\n\n---\n\n## 7. GitHub 和 Vercel 要形成固定开发节奏\n\nCodex 改代码很快，但也正因为快，所以更需要版本管理。\n\n我前期有个问题，就是连续让 Codex 改很多需求，最后才看整体效果。\n\n结果一旦出问题，很难知道是哪一步改坏的。\n\n现在我会用更固定的节奏：\n\n```text\n一个小任务\n↓\n看修改文件\n↓\n本地运行\n↓\n提交 GitHub\n↓\nVercel 自动部署\n↓\n线上检查\n↓\n再做下一个任务\n```\n\n每次也会要求 Codex 总结：\n\n```text\n完成后告诉我：\n1. 修改了哪些文件\n2. 每个文件改了什么\n3. 有没有影响登录、支付、数据库、生成流程\n4. 有没有需要我手动配置的环境变量\n```\n\n这个习惯能帮你及时发现问题。\n\n尤其是 Vercel 部署时，最容易出问题的是环境变量。\n\n比如：\n\nGoogle OAuth Client ID。\nGoogle OAuth Secret。\nStripe Secret Key。\nStripe Webhook Secret。\nDatabase URL。\n图像模型 API Key。\n图片存储 Token。\n\n这些东西本地和线上都要配置对。\n\n我的坑是，本地跑通了，不代表线上没问题。\n\n有时候 Vercel 报错，不是代码问题，而是环境变量没配，或者 callback URL 不一致。\n\n所以涉及 Vercel、Google、Stripe 的任务，我都会让 Codex 最后列出：\n\n```text\n需要检查哪些环境变量？\n本地和线上分别要配置什么？\n有没有需要手动在 Vercel 后台设置的地方？\n```\n\n不要让 Codex 猜你的线上配置。\n\n它只能帮你检查和提醒，真正的密钥和后台配置还是要自己确认。\n\n---\n\n## 8. Google、Stripe 这类外部服务要分阶段接，不要一次全做\n\n这是更深一点的坑。\n\n独立开发者很容易一上来就想把所有东西接完。\n\nGoogle 登录。\nStripe 支付。\n积分。\n数据库。\n生成记录。\n用户中心。\nSEO。\n邮件通知。\n\n但这些东西耦合起来之后，Bug 会很难排查。\n\n我前期就遇到过这种问题：\n\n登录还没完全稳定，就开始做积分。\n积分逻辑还没完全稳定，又去接 Stripe。\nStripe 还没完全验证，又去做 pricing 页面和 SEO 页面。\n\n结果一旦出问题，不知道到底是登录状态问题、支付 webhook 问题、数据库问题，还是环境变量问题。\n\n现在我会分阶段做。\n\n第一阶段，只做核心生成：\n\n```text\n输入文本 → 生成图片 → 下载\n```\n\n第二阶段，加 Google 登录：\n\n```text\n登录 → 生成 → 保存记录\n```\n\n第三阶段，加积分：\n\n```text\n登录用户 → 检查积分 → 生成成功扣积分 → 失败退积分\n```\n\n第四阶段，加 Stripe：\n\n```text\n积分不足 → 跳转 Stripe → 支付成功 → webhook 加积分\n```\n\n第五阶段，再做 SEO 和增长页面：\n\n```text\nSEO 页面 → 引导用户进入生成流程\n```\n\n每一阶段都单独验证。\n\n比如接 Google 登录时，我会这样给 Codex：\n\n```text\n这次只接 Google 登录。\n不要接 Stripe。\n不要做积分。\n不要修改生成逻辑。\n\n完成后只验证：\n1. 用户可以点击 Google 登录\n2. 登录后能看到用户状态\n3. 退出登录正常\n```\n\n接 Stripe 时，我会单独开任务：\n\n```text\n这次只接 Stripe checkout 和 webhook。\n不要修改 UI 页面之外的其他功能。\n不要修改 Google 登录。\n不要修改生成 prompt。\n\n完成后说明：\n1. 支付成功后如何加积分\n2. webhook 如何验证\n3. 需要配置哪些环境变量\n4. 本地和 Vercel 分别要检查什么\n```\n\n外部服务一定要分阶段接。\n\n不要为了快，把所有东西一次性塞给 Codex。\n\n这不是效率高，这是给后面挖坑。\n\n---\n\n## 总结\n\n这两周用 Codex 做 KnowLens.ai，我最大的感受是：\n\nCodex 很强，但不要让它自由发挥。\n\n你越具体，它越好用。\n\n你越模糊，它越容易把项目改乱。\n\n我花了差不多 20 亿 token，其中至少一半都浪费在重构、修 bug、恢复错误改动上。\n\n现在回头看，最大的问题不是 Codex 能力不够，而是我前期没有把产品流程和任务边界设计清楚。\n\n如果重新来一次，我会一开始就做这几件事：\n\n```text\n先写主流程。\n每次只做一个小任务。\n需求写验收标准。\n提前创建 AGENTS.md。\n保护登录、支付、积分、数据库。\n限制 Codex 全项目搜索。\n用 GitHub 和 Vercel 固定开发节奏。\nGoogle、Stripe 这类外部服务分阶段接入。\n```\n\nAI Coding 不是让你不用思考产品和架构了。\n\n恰恰相反，它会放大产品架构的重要性。\n\n以前你自己写代码，可能慢一点，但你知道自己改了哪里。\n\n现在 Codex 写得很快，但如果你没有规则，它也会很快地把项目搞乱。\n\n所以我的结论很简单：\n\nCodex 可以帮你写代码。\n但你要负责把产品流程、代码边界和验收标准讲清楚。\n\n否则它确实能帮你生成很多代码，也会帮你制造很多返工。";

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
    "sections": parseLearningMarkdown(knowlensCodexTipsMarkdown)
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
            "content": "这篇官方资料适合两类人：一类是刚开始使用 Codex 的新手，另一类是已经能让 Codex 改代码，但经常遇到“改动太大、上下文说不清、验证不稳定、反复返工”的使用者。它真正讨论的不是某个单一命令，而是如何把 Codex 当成一个可以规划、执行、验证、沉淀经验的 coding agent 来协作。"
          },
          {
            "type": "paragraph",
            "content": "你可以把它理解成一套从输入到交付的工作流：先说清楚任务，再让 Codex 规划，再限定修改范围，然后通过构建、测试、预览和人工检查完成验收。等流程稳定后，把项目规则写进 AGENTS.md，把重复流程沉淀成 Skill，把外部系统接入 MCP 或连接器，最后再考虑自动化。"
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
            "content": "这也意味着，你给它的不是一句“帮我优化一下”，而是一份小型任务说明。任务说明越像真实工程协作，Codex 越稳定：目标是什么，为什么要做，允许改哪里，不能碰哪里，成功标准是什么，完成后如何验证。"
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
            "content": "官方最佳实践里非常重要的一点，是先讨论计划。复杂任务不要一开始就让 Codex 修改文件，而是先让它读代码、提出方案、列出可能修改的文件和风险。你确认计划后，再让它执行。"
          },
          {
            "type": "paragraph",
            "content": "Plan mode 的价值不是拖慢速度，而是让方向提前暴露。比如你只想调整详情页内容，但 Codex 的计划里出现了重构路由、拆分组件库、换 CSS 架构，这时你就能在动手前纠正它。对真实项目来说，前面多花一分钟，后面少返工半小时。"
          },
          {
            "type": "code",
            "label": "先计划提示词",
            "content": "请先进入计划模式，不要修改文件。\n\n任务：我想优化当前学习详情页。\n请先完成：\n1. 读取相关页面、数据和样式文件。\n2. 判断最小修改范围。\n3. 列出你准备修改的文件。\n4. 说明可能的风险和验证方式。\n\n等我确认后再执行。"
          }
        ]
      },
      {
        "heading": "让 Codex 先采访你",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当需求还模糊时，不要假装自己已经想清楚。可以直接让 Codex 先问问题。好的问题会把任务从“感觉上要优化”拉回到可执行层面：目标用户是谁，当前问题是什么，必须保留哪些内容，哪些文件不能动，最后用什么方式验收。"
          },
          {
            "type": "paragraph",
            "content": "这对非工程背景用户尤其有用。你不需要一上来就写出完美技术描述，可以先用自然语言讲大概方向，再让 Codex 帮你把它整理成任务边界。"
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
            "content": "如果某些约束会反复出现，就不要每次都写在 prompt 里。官方资料强调，可以把项目级规则写进 AGENTS.md。这个文件相当于项目里的协作说明，Codex 在处理代码时会参考它。"
          },
          {
            "type": "paragraph",
            "content": "AGENTS.md 适合写稳定规则，而不是临时任务。例如项目使用什么技术栈，构建命令是什么，哪些目录不能随便动，UI 修改要复用哪些样式文件，完成后必须跑什么检查。临时需求仍然写在当前对话里。"
          },
          {
            "type": "code",
            "label": "AGENTS.md 示例",
            "content": "# Project Rules\n\n- This project uses React, Vite and npm.\n- Keep UI changes consistent with src/styles.css.\n- Do not add backend, database, auth or upload features unless requested.\n- Do not introduce new dependencies without explaining why.\n- Keep each task scoped to the files named in the prompt when possible.\n- After code changes, run npm run build and report the result.\n- For visual changes, check desktop and mobile layouts before finishing."
          }
        ]
      },
      {
        "heading": "用配置控制 Codex 的工作方式",
        "blocks": [
          {
            "type": "paragraph",
            "content": "除了 AGENTS.md，Codex 还可以通过配置来调整默认行为。对于普通使用者来说，最重要的不是记住所有配置项，而是理解配置和 prompt 的区别：prompt 适合当前任务，AGENTS.md 适合项目规则，配置适合更底层的默认行为。"
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
            "content": "验证闭环还包括看 diff。diff 能告诉你 Codex 到底改了哪些文件。新手不需要完全看懂每一行代码，但至少要判断：文件数量是否合理，是否修改了不相关页面，是否新增了奇怪依赖，是否动了配置或数据结构。"
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
            "content": "当任务只发生在代码库里，Codex 读取本地文件就足够了。但真实工作经常需要外部上下文：GitHub issue、设计文档、内部知识库、数据库、浏览器页面、项目管理工具。MCP 和连接器的价值，就是把这些上下文接进来，让 Codex 不用只凭你复制粘贴的信息工作。"
          },
          {
            "type": "paragraph",
            "content": "不过，外部工具越多，越需要明确边界。不要为了“看起来高级”就接一堆工具。先问：这个任务是否真的需要外部数据？Codex 需要读还是需要写？是否涉及隐私和权限？有没有更安全的只读方式？"
          },
          {
            "type": "paragraph",
            "content": "对学习者来说，可以先从 GitHub、浏览器预览和官方文档这类低风险上下文开始。等你熟悉审批和验证之后，再接入更敏感的系统。"
          }
        ]
      },
      {
        "heading": "把重复流程沉淀成 Skill",
        "blocks": [
          {
            "type": "paragraph",
            "content": "当你发现自己反复让 Codex 做同一类事，就可以考虑把流程写成 Skill。Skill 不是一段神奇 prompt，而是一套可复用的工作说明：什么时候使用，先读什么文件，按什么步骤检查，修改后如何验证。"
          },
          {
            "type": "paragraph",
            "content": "例如这个网站里，学习文章整理、案例详情页补全、前端设计审查、构建后浏览器检查，都可以变成 Skill。这样每次执行时，Codex 不需要重新猜你的标准，而是按固定流程走。"
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
            "content": "自动化适合那些会定期发生、流程清楚、验收方式明确的任务。例如每天检查依赖更新、定期扫描构建失败、每周整理未处理 issue、在 PR 有新反馈后提醒你。"
          },
          {
            "type": "paragraph",
            "content": "但自动化不应该过早使用。如果一个任务你还不知道怎么人工跑通，就不要马上让它自动执行。先把手动流程跑稳定：输入是什么，输出是什么，失败怎么办，需要你批准哪些动作。流程清楚后，再让 Codex 定期唤醒或排队执行。"
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
            "content": "第一个坑，是把任务说得太大。比如“帮我优化网站”“重构这个项目”“做一个完整应用”。这类指令会让 Codex 自己填补太多空白，结果可能改动很大，却不一定符合你的真实目标。"
          },
          {
            "type": "paragraph",
            "content": "第二个坑，是没有限制修改范围。你只想改一个页面，却没有说明不能改全局样式、路由和依赖，Codex 可能会为了完成目标顺手改更多东西。"
          },
          {
            "type": "paragraph",
            "content": "第三个坑，是没有验收。Codex 说完成了，不等于项目真的可用。构建失败、移动端溢出、图片路径错误、按钮不可点击、内容没有进入正确页面，这些都需要检查。"
          },
          {
            "type": "paragraph",
            "content": "第四个坑，是把所有规则都堆进同一个 prompt。更好的方式是分层：当前任务写在 prompt，长期项目约束写在 AGENTS.md，稳定重复流程写成 Skill，外部数据通过 MCP 或连接器接入。"
          }
        ]
      },
      {
        "heading": "推荐的新手练习路径",
        "blocks": [
          {
            "type": "paragraph",
            "content": "第一步，只读项目。让 Codex 解释项目结构、入口文件、样式文件、运行方式，不要修改任何文件。第二步，让它针对一个很小的需求写计划，例如修改一个来源提示、调整一个按钮文案或补一段静态内容。第三步，你确认计划后再让它执行。"
          },
          {
            "type": "paragraph",
            "content": "第四步，看 diff，让 Codex 解释它改了什么。第五步，运行构建。第六步，打开页面检查视觉和交互。第七步，把你觉得以后会重复出现的规则写进 AGENTS.md。"
          },
          {
            "type": "paragraph",
            "content": "这套路径看起来慢，但它能帮你建立判断力。AI Coding 的关键不是一次生成多大，而是每一轮都知道自己为什么这样改、改了哪里、怎么证明它真的完成了。"
          }
        ]
      },
      {
        "heading": "这篇官方最佳实践的核心结论",
        "blocks": [
          {
            "type": "paragraph",
            "content": "Codex 最值得学习的地方，不是某个单一技巧，而是一整套协作方式：先给清楚上下文，再规划，再小步执行，再验证，再沉淀规则。"
          },
          {
            "type": "paragraph",
            "content": "如果你是设计师、产品经理或独立开发者，最应该先掌握的是任务边界和验收方式。你不需要变成专业工程师才能使用 Codex，但你需要学会像一个清楚的协作者那样描述目标。"
          },
          {
            "type": "paragraph",
            "content": "真正把 Codex 用好，不是让它替你一次性做完所有决定，而是让它在清晰规则下持续推进。越是复杂的任务，越要拆小；越是长期的项目，越要沉淀规则；越是自动化，越要先有可靠验证。"
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
            "content": "这篇文章讨论的是：当我们开始构建真正可用的 AI Agent 时，重点不再只是写一个漂亮的 prompt，而是持续管理 Agent 能看到、能调用、能记住、能反馈的信息。Anthropic 把这种能力称为 context engineering，也就是上下文工程。"
          },
          {
            "type": "paragraph",
            "content": "对 AI Coding 来说，这个概念非常关键。Codex、Claude Code 或其他 coding agent 的表现，往往不是由一句提示词决定，而是由完整上下文决定：项目目标、相关文件、代码约束、工具权限、历史决策、测试结果、错误日志、用户反馈，以及 Agent 自己在执行过程中收集到的新信息。"
          },
          {
            "type": "paragraph",
            "content": "如果只把 Agent 当成“会写代码的聊天框”，你会不断遇到跑偏、忘记约束、改动过大、验证不足的问题。上下文工程的目标，是让 Agent 在每一步都看到正确的信息，并能随着任务推进不断调整这些信息。"
          }
        ]
      },
      {
        "heading": "Context engineering vs. prompt engineering",
        "blocks": [
          {
            "type": "paragraph",
            "content": "文章首先区分了 prompt engineering 和 context engineering。Prompt engineering 更像是在单次输入里写清楚指令，让模型按照预期输出。它仍然重要，但对复杂 Agent 来说远远不够。"
          },
          {
            "type": "paragraph",
            "content": "Context engineering 关注的是整个系统给模型提供了什么上下文。这里的上下文不只是用户输入的一句话，还包括系统提示词、工具说明、检索结果、文件内容、对话历史、外部状态、工作记忆和执行反馈。"
          },
          {
            "type": "paragraph",
            "content": "用 AI Coding 的例子理解：prompt engineering 是你告诉 Codex“修复这个 bug”；context engineering 是你让它看到 bug 复现步骤、相关文件、测试命令、项目规则、历史修改原因，以及哪些文件不能动。前者是请求，后者是工作环境。"
          }
        ],
        "image": "/learn-images/context-engineering-prompt-vs-context.png",
        "imageAlt": "原文配图：Prompt engineering 与 context engineering 的对比"
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
            "content": "放到代码场景里，这意味着 Agent 不应该只读你点名的一个文件。它应该能根据错误信息追踪调用链，根据组件名查找样式文件，根据测试失败定位相关实现，根据文档链接确认 API 用法。"
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
            "content": "文章的核心启发是：长任务不是靠更长的 prompt 解决，而是靠持续更新上下文解决。好的 Agent 工作流应该像真实工程协作一样，有阶段、有反馈、有记录、有验收。"
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
            "content": "对 AI Coding 学习者来说，这篇文章最值得带走的不是某个具体模板，而是一种工作方式：把需求、代码、规则、工具、记忆、反馈和验证组织成一个闭环。这样 Agent 才能从“帮你写一段代码”升级为“协助你推进一个真实项目”。"
          },
          {
            "type": "paragraph",
            "content": "如果你正在用 Codex 或 Claude Code，可以先从最小动作开始实践：每次任务前说明目标和边界，每次任务中让 Agent 主动找相关上下文，每次任务后把构建结果、截图反馈和人工判断继续喂回下一轮。"
          }
        ]
      },
      {
        "heading": "Acknowledgements",
        "blocks": [
          {
            "type": "paragraph",
            "content": "原文最后感谢了参与讨论和反馈的相关人员。对读者来说，这也提醒我们：Agent 工作流不是单人闭门写 prompt，而是需要在真实项目、真实反馈和团队经验中不断打磨。"
          }
        ]
      }
    ]
  },
  {
    "id": "codex-cli-first-days-terminal-workflow",
    "sourceUrl": "https://amanhimself.dev/blog/first-few-days-with-codex-cli/",
    "translationMode": "guidedTranslation",
    "title": "Codex CLI 初体验：把 AI Agent 放进你的终端工作流",
    "originalTitle": "First few days with Codex CLI",
    "notice": "本文为 UIcoding 基于 Aman Mittal 英文文章整理的中文学习稿，不是原文逐字全文翻译。原文配图已保存到本地并用于辅助理解，请访问原文查看完整上下文。",
    "sections": [
      {
        "heading": "原文地址与这篇文章的重点",
        "blocks": [
          {
            "type": "paragraph",
            "content": "英文原文地址：https://amanhimself.dev/blog/first-few-days-with-codex-cli/"
          },
          {
            "type": "paragraph",
            "content": "这篇文章很适合把 Codex CLI 当成“终端里的本地 AI Agent”来理解。作者最初长期使用 Cursor 写代码，但在处理 Obsidian 笔记时遇到一个问题：如果所有笔记本来就是本地 Markdown 文件，为什么还要把它们搬进另一个编辑器里，才能让 AI 帮忙整理？"
          },
          {
            "type": "paragraph",
            "content": "Codex CLI 的价值就在这里：它运行在终端中，天然可以进入某个目录，读取那里的文件，按照你的规则修改、整理或生成内容。换句话说，它不只是写代码，也可以帮你处理任何以文件形式存在的工作流。"
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
            "content": "Codex CLI 是 OpenAI 的本地 coding agent，运行在终端里。你可以用自然语言和它对话，让它读取文件、修改文件、运行命令，并通过 MCP 连接本机上的外部工具。"
          },
          {
            "type": "paragraph",
            "content": "原文里最重要的洞察是：终端本来就能访问你电脑上的文件。像 Obsidian 这样的工具，本质上把笔记保存在本地 Markdown 文件里。只要进入对应目录，Codex CLI 就能直接处理这些笔记，不需要额外插件，也不一定需要把整个笔记库塞进某个代码编辑器。"
          },
          {
            "type": "paragraph",
            "content": "这也是 AI Coding 工具的一个延展方向：不只帮你写代码，而是帮你处理本地文件系统里的真实工作。代码、笔记、会议记录、任务清单、文章草稿，都可以变成 Agent 能理解和整理的材料。"
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
            "content": "这和普通聊天工具最大的区别是：上下文不只是留在某个对话窗口里，而是变成了项目的一部分。你可以把写作风格、目录规则、输出格式、禁止事项写进 AGENTS.md，让 Codex 每次进入这个目录时都知道该怎么工作。"
          },
          {
            "type": "paragraph",
            "content": "对于长期项目来说，这比反复复制粘贴聊天记录更稳定。尤其是你有多个文件夹、多个工作流时，每个目录都可以拥有自己的规则。"
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
            "content": "如果你是零基础用户，可以先把这一步理解成：终端需要一个运行环境，Codex CLI 通过 npm 安装到你的电脑上。安装完成后，你就能在任意项目目录或笔记目录中启动它。"
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
            "content": "进入 Codex 之后，你可以直接用自然语言描述任务。新手第一次不要急着让它大改项目，可以先让它解释当前目录、读取某个文件，或者帮你总结一份笔记。"
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
            "content": "如果你退出了 Codex，但后来发现任务还没做完，可以通过 session ID 恢复上一次会话。退出时，Codex 会显示一个 session ID，复制它再运行 resume 命令即可。"
          },
          {
            "type": "paragraph",
            "content": "这个能力对长任务很重要。比如你正在整理一个 Obsidian 笔记库、同步 Linear 任务，或者让 Codex 多轮修改一篇文章，恢复会话能让上下文更连续。"
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
            "content": "这些命令看起来像小功能，但对长期使用很重要。你需要知道 Codex 当前处于什么权限、是否能执行命令、是否能改文件，以及它正在消耗多少上下文。"
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
            "content": "Codex 支持用 @filename 的方式引用当前目录里的具体文件。这样你可以让它只读某一篇草稿、某个会议记录或某个索引文件，而不是让它扫描整个笔记库。"
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
            "content": "他直接让 Codex 创建索引文件，并链接所有会议笔记。几十秒后，一个格式正确、链接可用的 index 文件就生成了。这个任务不是写代码，但非常适合终端 Agent：读取文件列表，理解命名，生成 Markdown。"
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
            "content": "如果自然语言指令不能执行，需要检查当前项目目录的 approval 模式。原文提到可以通过 /approval 选择 Agent 相关权限。这里的关键是：Codex 能做事，但你需要清楚它当前被允许做什么。"
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
            "content": "这个限制非常真实。很多 Agent 看起来能“控制浏览器”，但如果没有合适的浏览器工具，它只能做很有限的动作。要让 Codex 更可靠地处理网页，就需要 MCP server。"
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
            "content": "MCP 是一种让 AI 模型连接外部工具的开放标准。你可以把它理解成通用适配器：通过 MCP，Codex 可以和浏览器、Figma、文档站点、内部工具等系统交互。"
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
            "content": "Playwright MCP Bridge 是 Chrome 和 Edge 的扩展。它可以让 AI Agent 使用你已有的浏览器 profile。这样访问 Linear、内部系统或需要登录的网站时，不必重新登录。"
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
            "content": "这个流程很像真实办公自动化：从一个网页工具读取任务，再同步到本地笔记。关键是你要告诉 Codex 输出文件放在哪里，以及要保存成什么格式。"
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
            "content": "如果你每次都要让 Codex 打开 Linear、读取 Todo、写入 Obsidian，那就不应该每次重新写提示词。把流程固化成 Skill 后，Codex 就能按固定步骤执行，减少遗漏和返工。"
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
            "content": "这篇文章展示的工作流只是起点。一旦理解 Skills，就可以把许多重复流程自动化：读取文件、修改文件、创建文件、同步外部任务、整理笔记、生成索引。"
          },
          {
            "type": "paragraph",
            "content": "对 AI Coding 学习者来说，这篇文章最重要的启发是：2025 年的 Agent 不只是用来做 toy apps，而是开始进入日常工作流。Codex CLI 的价值，正是在那些无聊、重复、但每天消耗时间的任务里体现出来。"
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
            "content": "这篇官方资料不是单纯教你输入几个命令，而是在讲怎样把 Claude Code 用成一个可靠的 coding agent。它覆盖了验证、计划、上下文、项目记忆、权限、CLI 工具、MCP、Hooks、Skills、子代理、会话管理和自动化等完整工作流。"
          },
          {
            "type": "paragraph",
            "content": "如果你已经会让 Claude Code 改代码，但经常遇到“它没看对文件、改动太大、忘记约束、验证不完整、长任务跑偏”，这篇文章非常值得系统读一遍。它真正要解决的是：如何让 AI 编程从一次性对话，变成可重复、可验证、可扩展的工程协作流程。"
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
            "content": "官方建议不要一上来就让 Claude 直接改代码。更稳的流程是：先让它探索代码库，理解相关文件和约束；然后让它提出计划；你确认方向之后，再让它执行。"
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
            "content": "Claude Code 很依赖上下文。你不能只说“优化一下”，而要告诉它为什么优化、面向谁、允许改哪里、不能碰哪里、完成后怎样验收。越具体，Agent 越不容易自由发挥。"
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
            "content": "这类文件的价值是长期记忆。你不需要每次都重新告诉 Claude“不要乱改路由”“不要碰支付逻辑”“样式要复用 tokens”“构建命令是 npm run build”。把稳定规则写进去，后续任务就更容易保持一致。"
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
            "content": "在小练习项目里，你可以给 Agent 更高自由度；在生产项目、支付系统、数据库迁移或大规模重构里，就应该更谨慎。审批、沙盒和权限边界能让你在效率和安全之间取得平衡。"
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
            "content": "但工具越多，越需要规则。你要告诉 Agent 什么时候该用搜索，什么时候该读文档，什么时候该跑测试，什么时候应该停下来问你，而不是无限制地探索。"
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
            "content": "官方也强调让 Claude 反过来询问你。很多需求一开始并不清楚，与其让 Agent 猜，不如让它先问三五个关键问题：目标用户是谁、边界在哪里、是否要兼容旧行为、完成后怎么验收。"
          },
          {
            "type": "paragraph",
            "content": "这也是 AI Coding 和传统写 prompt 的区别。你不是一次性把完美需求写出来，而是在一个协作过程中持续校准方向。"
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
            "content": "对日常使用来说，一句简单的“请先总结当前状态，再继续下一步”就很有用。它能帮 Agent 重新整理任务边界，也方便你判断它有没有跑偏。"
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
            "content": "当你开始能预判 Claude 在什么情况下会犯错，就说明你正在形成自己的 Agentic Coding 直觉。这个直觉比记住某个提示词模板更重要。"
          }
        ]
      },
      {
        "heading": "总结：把 Claude Code 当成工程协作者",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这篇官方最佳实践的核心可以概括为一句话：不要把 Claude Code 当成一个“自动写代码按钮”，而要把它当成一个需要上下文、工具、规则、反馈和验证的工程协作者。"
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
