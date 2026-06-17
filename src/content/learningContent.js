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
        "heading": "为什么这篇资料值得收录",
        "paragraphs": [
          "很多人使用 Claude Code 或 Codex 时，习惯直接输入一句“帮我做这个功能”。这当然能跑起来，但越到真实项目，越容易出现三个问题：AI 没弄清需求就开始写、没有验证标准、改完之后不知道有没有影响其它模块。",
          "Claude Wizard 这类资料的价值在于，它把 AI Coding 从“写代码”变成了一条工程链路：先理解需求，再探索代码，然后写测试或验证标准，接着最小实现，最后运行验证、自我审查和总结交付。",
          "Addy Osmani 关于好 Spec 的文章强调，给 AI Agent 的说明应该包含目标、上下文、约束、验收标准和失败边界。OpenAI Codex 官方提示词建议也强调，要写清楚任务范围、测试方式和期望输出。三者合在一起，就能形成一套稳定、可复制的工作流。"
        ]
      },
      {
        "heading": "适合什么时候使用",
        "paragraphs": [
          "这套提示词适合中等以上复杂度的任务，比如新增一个页面、重构一个组件、接入一个 API、修复一个线上问题、优化一段核心流程，或者让 AI 帮你完成一轮带测试的功能开发。",
          "如果只是改一句文案，没必要套完整流程。真正需要它的场景是：你担心 AI 改太多文件、担心它凭空假设、担心它不跑验证、担心它动到登录、支付、数据库这类高风险逻辑。",
          "你可以把它理解成给 Claude Code / Codex 的“开发纪律”：不是限制它能力，而是让它先想清楚、再下手。对独立开发者尤其有用，因为你没有完整工程团队帮你做 Code Review，AI 自己的审查流程就更重要。"
        ]
      },
      {
        "heading": "一套完整链路提示词",
        "paragraphs": [
          "下面这段可以直接复制到 Claude Code、Codex 或 Cursor Agent 中使用。建议在一个具体任务开始前粘贴，然后把“本次任务”替换成你真正要做的事情。",
          "如果你的项目有 AGENTS.md、CLAUDE.md、README 或内部开发规范，一定要让 AI 先读这些文件。这样它不会只凭当前对话猜项目结构。"
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
          "AI 很容易过度热心。你只是让它修一个按钮，它可能顺手重构样式；你只是让它接一个字段，它可能顺手改数据结构。所以实现阶段一定要写边界。",
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
        "heading": "第五阶段：让 AI 自己做一次 Code Review",
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
        "heading": "第六阶段：交付总结要能帮你复盘",
        "paragraphs": [
          "最后的总结不是形式主义。它能帮你快速判断 AI 有没有改到不该改的地方，也方便你之后提交 Git、写 PR 或回滚。",
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
        "heading": "把这套流程变成你的固定工作法",
        "paragraphs": [
          "这套提示词最适合沉淀到项目规则里。你可以把完整链路放进 AGENTS.md、CLAUDE.md 或团队的工作流文档里，让 AI 每次进入项目时都按同一套节奏工作。",
          "真正的变化不是提示词更长，而是你开始用工程流程管理 AI：需求先变成 Spec，代码先经过探索，修改先有边界，结果必须验证，最后必须自审。",
          "当你用这套方式工作一段时间，会发现 AI Coding 的体验会稳定很多。AI 依然可以很快，但它不再是自由发挥，而是在一条清楚的产品和工程链路里加速你。"
        ]
      }
    ]
  },
  {
    "id": "claude-code-official-prompt-library-copyable-workflows",
    "sourceUrl": "https://code.claude.com/docs/en/prompt-library",
    "translationMode": "guidedTranslation",
    "title": "Claude Code 官方提示词库：从探索代码到验证结果的可复制 Prompt",
    "originalTitle": "Claude Code Prompt Library / Common Workflows",
    "notice": "本文为 Uicoding.ai 基于 Claude Code 官方 Prompt Library 和 Common Workflows 整理的中文学习笔记，不是原文全文翻译。主要参考：https://code.claude.com/docs/en/prompt-library 和 https://docs.anthropic.com/en/docs/claude-code/common-workflows。",
    "sections": [
      {
        "heading": "这篇不是提示词片段，而是完整工作提示词",
        "paragraphs": [
          "Claude Code 官方 Prompt Library 的重点不是教你写一句万能咒语，而是把任务说清楚：让 Agent 先理解上下文，再按目标修改，最后给出可验证结果。Common Workflows 也强调从理解代码库、查找相关代码、修 Bug、写测试到提交总结的一整套流程。",
          "所以这篇资料不整理成零散句子，而是把官方推荐的模式改写成可以直接复制的完整中文 Prompt。每个代码块都可以单独复制到 Claude Code，也可以改一下工具名后用于 Codex、Cursor Agent 或其它 AI Coding 工具。",
          "使用时只需要替换方括号里的内容，例如页面路径、Bug 描述、验收标准、允许修改范围。其它约束建议保留，因为这些约束能减少 AI 误改、过度重构和没有验证就结束的情况。"
        ]
      },
      {
        "heading": "完整总控 Prompt：从探索代码到验证结果",
        "paragraphs": [
          "如果你只想复制一段最完整的 Prompt，就用下面这一段。它适合中等复杂度任务：新增页面、修复问题、优化组件、补测试、调整工作流。",
          "这段 Prompt 的核心是：先探索，不急着改；先定义验收标准，再实现；实现后必须验证；最后要输出风险和检查项。"
        ],
        "code": {
          "label": "完整总控 Prompt",
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
        "heading": "探索代码库 Prompt：先弄清楚项目再动手",
        "paragraphs": [
          "这是最适合新项目、新页面、新需求开始前使用的 Prompt。它不会要求 AI 立刻改代码，而是先让它建立代码地图。",
          "如果你经常遇到 AI 改错文件、找不到真实入口、凭空假设组件存在，先运行这一段会稳很多。"
        ],
        "code": {
          "label": "探索代码库 Prompt",
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
        "heading": "修 Bug Prompt：带复现、范围和验证",
        "paragraphs": [
          "修 Bug 最怕的问题是 AI 只根据报错文字猜原因。更稳的方式是把现象、复现步骤、期望结果、限制范围和验证方式都写进去。",
          "下面这段适合 UI Bug、交互 Bug、接口 Bug 和构建报错。你可以把截图描述、终端报错或浏览器控制台报错粘到对应位置。"
        ],
        "code": {
          "label": "修 Bug 完整 Prompt",
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
        "heading": "安全重构 Prompt：保持行为不变",
        "paragraphs": [
          "重构时要特别强调“行为不变”。如果不写清楚，AI 可能把重构理解成重新设计功能，最后改出新 Bug。",
          "这段 Prompt 适合整理重复代码、拆组件、移动样式、命名清理、抽工具函数。"
        ],
        "code": {
          "label": "安全重构 Prompt",
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
        "heading": "补测试 Prompt：让 AI 先定义测试目标",
        "paragraphs": [
          "官方工作流里经常会把测试作为任务的一部分。重点不是让 AI 随便补几个测试，而是先说明测试要保护什么行为。",
          "这段适合已有测试框架的项目。如果项目暂时没有测试，也可以让 AI 输出手动验证清单。"
        ],
        "code": {
          "label": "补测试 Prompt",
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
        "heading": "验证交付 Prompt：不要让任务停在“我改完了”",
        "paragraphs": [
          "很多 AI Coding 的问题发生在最后一步：代码改了，但没有说明怎么验，也没有告诉你风险在哪里。",
          "这段适合每次改完后复制使用。它会强制 AI 把验证、浏览器检查、风险和后续动作讲清楚。"
        ],
        "code": {
          "label": "验证交付 Prompt",
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
        "heading": "如何把这些 Prompt 用在真实项目里",
        "paragraphs": [
          "最稳的用法不是每次都把所有 Prompt 全部复制一遍，而是按任务阶段选择。刚进入项目时用“探索代码库 Prompt”，遇到问题时用“修 Bug Prompt”，想整理代码时用“安全重构 Prompt”，改完以后用“验证交付 Prompt”。",
          "如果你希望团队长期复用，可以把这些 Prompt 放进 CLAUDE.md、AGENTS.md 或项目内部文档。更进一步，还可以把它们拆成 Claude Code slash commands，比如 /explore-task、/fix-bug、/verify-change。",
          "真正重要的是让 AI 形成固定节奏：先理解，再计划，再改动，再验证，再交付。只要这个节奏稳定，Claude Code 和 Codex 都会比“想到什么说什么”的使用方式可靠很多。"
        ]
      }
    ]
  },
  {
    "id": "codex-official-workflows-copyable-prompts",
    "sourceUrl": "https://developers.openai.com/codex/workflows",
    "translationMode": "guidedTranslation",
    "title": "Codex 官方工作流：7 个可直接复制的实战 Prompt",
    "originalTitle": "Workflows",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex 官方 Workflows 整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/workflows。",
    "sections": [
      {
        "heading": "为什么这篇适合做 Codex 实战学习页",
        "paragraphs": [
          "OpenAI Codex 官方 Workflows 不是只讲“提示词怎么写”，而是把 Codex 放到真实开发任务里：理解代码、修 Bug、写测试、根据截图做原型、迭代 UI、做本地 code review，以及在 GitHub PR 上做 review。",
          "这几个场景基本覆盖了独立开发者每天会遇到的工作：先弄懂项目，再动手改；改完要验证；提交前要审查；别人提 PR 时，也可以让 Codex 先帮你看一轮。",
          "下面每个代码块都是完整 Prompt。你可以直接复制到 Codex 里使用，只需要替换方括号中的页面路径、Bug 描述、截图信息或 PR 信息。"
        ]
      },
      {
        "heading": "1. 解释代码流：先让 Codex 讲清楚系统怎么跑",
        "paragraphs": [
          "这个 Prompt 适合接手新项目、理解一个页面、读接口链路或梳理某个功能的执行路径。重点是让 Codex 先解释，而不是马上修改。",
          "如果你是零基础用户，这也是最安全的第一步：先知道文件在哪里、数据怎么走、用户操作会触发哪些代码。"
        ],
        "code": {
          "label": "解释代码流 Prompt",
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
          "修 Bug 时，最重要的是不要只给一句“这里坏了”。你需要告诉 Codex：现象是什么、如何复现、期望结果是什么、哪些模块不能碰。",
          "下面这段适合 UI Bug、构建错误、状态错误和数据展示错误。"
        ],
        "code": {
          "label": "修 Bug Prompt",
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
          "这段 Prompt 适合给核心函数、组件状态、表单逻辑、接口处理和回归 Bug 补测试。"
        ],
        "code": {
          "label": "写测试 Prompt",
          "content": `请为当前功能补充测试。先制定测试计划，不要马上写代码。

要测试的功能：
[描述功能，例如：学习资料详情页可以正确渲染代码块，并且复制按钮能复制完整 Prompt。]

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
          "Codex Workflows 里一个很实用的场景，是基于截图快速做原型。这里的关键不是“照着做一个差不多的页面”，而是写清楚还原范围、交互、响应式和不允许新增的复杂度。",
          "如果你给 Codex 截图，最好同时描述：这是哪个页面、哪些元素必须还原、哪些只是参考、移动端怎么处理。"
        ],
        "code": {
          "label": "根据截图做原型 Prompt",
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
          "这段 Prompt 适合你已经有页面，但觉得层级、留白、卡片、按钮或移动端不够好时使用。"
        ],
        "code": {
          "label": "UI 迭代 Prompt",
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
        "heading": "6. 本地 Code Review：提交前让 Codex 先审一轮",
        "paragraphs": [
          "Codex 支持本地审查工作流。你可以在提交前让它检查当前 diff，重点看 bug、回归风险、测试缺口和无关改动。",
          "这段 Prompt 适合在你已经改完代码、准备提交之前使用。"
        ],
        "code": {
          "label": "本地 Code Review Prompt",
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
        "heading": "7. PR Review：让 Codex 帮你读 Pull Request",
        "paragraphs": [
          "当团队协作时，Codex 可以用于 PR Review：总结改动、找风险、检查测试、提出问题。重点是不要只让它“看看”，而是明确审查维度。",
          "如果你使用 GitHub，可以把 PR 链接、diff 摘要、测试结果或 CI 报错一起给 Codex。"
        ],
        "code": {
          "label": "PR Review Prompt",
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
        "heading": "怎么选择这 7 个 Prompt",
        "paragraphs": [
          "如果你刚进入项目，用“解释代码流”。如果线上或页面出问题，用“修 Bug”。如果要避免回归，用“写测试”。如果从截图开始做页面，用“根据截图做原型”。如果页面已经有了但不够好，用“UI 迭代”。如果准备提交，用“本地 Code Review”。如果团队有人开 PR，用“PR Review”。",
          "这 7 个 Prompt 的共同点是：都要求 Codex 先理解上下文，再明确范围，然后执行，最后验证。它们不是为了让提示词显得复杂，而是为了让 AI Coding 更接近真实工程流程。",
          "你也可以把它们沉淀成自己的常用命令，比如 /explain-flow、/fix-bug、/write-tests、/prototype-from-screenshot、/ui-iterate、/local-review、/pr-review。每次复用同一套结构，项目会稳定很多。"
        ]
      }
    ]
  },
  {
    "id": "codex-real-webpage-prompt-case-library",
    "sourceUrl": "https://developers.openai.com/codex/use-cases",
    "translationMode": "guidedTranslation",
    "title": "Codex 真实网页案例 Prompt 库：从网页拆解到验证套件",
    "originalTitle": "Codex prompt examples and real web workflow cases",
    "notice": "本文为 Uicoding.ai 基于公开资料整理的中文学习笔记，不是原文全文翻译。参考来源包括 OpenAI Codex Use Cases：https://developers.openai.com/codex/use-cases，OpenAI Codex Figma to code 用例：https://developers.openai.com/codex/use-cases/figma-designs-to-code，以及 Jose Casanova Codex Prompts：https://www.josecasanova.com/prompts/for/codex。",
    "sections": [
      {
        "heading": "这篇资料解决什么问题",
        "paragraphs": [
          "很多 AI Coding 教程只讲“写清楚需求”，但真实做产品时，你经常面对的是一个真实网页、一个截图、一个竞品页面、一个 Figma 设计、一个已经上线但有问题的页面。你需要 Codex 不只是写代码，而是先拆解网页，再做实现计划，最后用验证套件检查结果。",
          "这篇把几个真实网页来源组合起来：OpenAI Codex 官方 Use Cases 提供真实用例方向，Figma to code 用例说明如何把设计转成代码，Jose Casanova 的 Codex Prompts 则偏向验证、执行计划和提交前检查。",
          "下面所有 Prompt 都是完整可复制版本。你可以把真实网页 URL、截图描述、目标页面路径和验收标准填进去，然后直接交给 Codex 执行。"
        ]
      },
      {
        "heading": "可以用来练习的真实网页来源",
        "paragraphs": [
          "网页案例一：OpenAI Codex Use Cases，地址：https://developers.openai.com/codex/use-cases。这个页面适合学习 Codex 在 PR review、Figma to code、数据分析、反馈整理等真实任务中的应用方向。",
          "网页案例二：OpenAI Codex Figma designs to code，地址：https://developers.openai.com/codex/use-cases/figma-designs-to-code。这个案例适合练习“从设计稿或截图到可运行页面”的工作流。",
          "网页案例三：Jose Casanova Codex Prompts，地址：https://www.josecasanova.com/prompts/for/codex。这个页面适合学习把验证套件、执行计划、Git commit 分析、跨 Agent Review 这类任务做成可复用 Prompt。"
        ]
      },
      {
        "heading": "Prompt 1：真实网页拆解，先把网页变成实现清单",
        "paragraphs": [
          "当你看到一个好网页，不要马上让 Codex“仿一个”。更稳的方式是先让它拆解页面：信息架构、布局、组件、视觉层级、交互状态、移动端策略。",
          "这段 Prompt 适合输入一个真实网页 URL，或者你已经打开网页后，把页面结构描述给 Codex。"
        ],
        "code": {
          "label": "真实网页拆解 Prompt",
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
        "heading": "Prompt 2：从真实网页或截图复刻一个原型页面",
        "paragraphs": [
          "网页复刻最怕两个极端：要么只抄表面，要么过度设计。这个 Prompt 会要求 Codex 先还原结构和层级，再实现可运行原型，并明确哪些地方可以简化。",
          "适合练习 OpenAI 的 Figma to code 思路，也适合你把竞品网页、截图、设计稿转成项目里的一个新页面。"
        ],
        "code": {
          "label": "真实网页/截图复刻 Prompt",
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
        "heading": "Prompt 3：执行计划 Prompt，把拆解结果变成可落地任务",
        "paragraphs": [
          "网页拆解之后，不要一次性让 Codex 全部实现。更稳的是把它拆成可执行任务：先页面结构，再内容数据，再样式，再移动端，再验证。",
          "这个 Prompt 适合把上一段拆解结果变成任务清单，也适合在真实项目里控制 Codex 的修改范围。"
        ],
        "code": {
          "label": "执行计划 Prompt",
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
        "heading": "Prompt 4：验证套件 Prompt，检查页面不是只做到表面相似",
        "paragraphs": [
          "页面做完以后，最容易出现的问题是：桌面端看起来还行，移动端溢出；标题能显示，但按钮被遮挡；代码块能出现，但复制不完整。",
          "这段 Prompt 参考验证套件的思路，把视觉、内容、交互、响应式、性能和无关改动都纳入检查。"
        ],
        "code": {
          "label": "验证套件 Prompt",
          "content": `请为刚才实现的页面执行一轮验证套件检查。

目标页面：
[填写页面 URL 或路由。]

参考网页或目标效果：
[填写参考网页 URL、截图说明或验收标准。]

请按以下维度检查：

1. 内容完整性
- 标题、副标题、正文、来源链接是否完整；
- 代码块或 Prompt 是否完整显示；
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
- 长标题、长 URL、长 Prompt 是否会撑破布局；
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
        "heading": "Prompt 5：Git Commit 分析 Prompt，提交前确认改动范围",
        "paragraphs": [
          "当一个页面做完以后，不要立刻提交。先让 Codex 看一遍 diff，确认改动范围、风险和验证结果，再决定是否提交。",
          "这个 Prompt 适合准备 commit 前使用，尤其是你让 Codex 连续做了几轮页面和内容改动之后。"
        ],
        "code": {
          "label": "Git Commit 分析 Prompt",
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
        "heading": "这套案例 Prompt 怎么用",
        "paragraphs": [
          "如果你要学习一个真实网页，先用“真实网页拆解 Prompt”。如果你要把网页或截图做成页面，用“真实网页/截图复刻 Prompt”。如果页面较复杂，用“执行计划 Prompt”拆阶段。做完以后，用“验证套件 Prompt”检查。准备提交前，用“Git Commit 分析 Prompt”。",
          "这套流程的重点是：真实网页不是让你照抄，而是帮助你拆解产品表达、页面结构和工程实现。Codex 最适合做的不是凭空生成，而是在你给出真实参考和明确验收标准后，把页面落地出来。",
          "你也可以把这些 Prompt 做成自己的项目 Skill，例如 /analyze-webpage、/prototype-page、/plan-implementation、/verify-page、/commit-analysis。这样以后每次看到一个好网页，都能稳定地从参考变成可实现任务。"
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
        "heading": "这篇最佳实践真正讲的是什么",
        "paragraphs": [
          "Codex 很强，但它不是读心工具。官方最佳实践的核心不是“写更长的 Prompt”，而是把任务讲成一个可执行工程任务：目标是什么、上下文在哪里、不能改什么、做到什么算完成。",
          "对复杂任务，官方建议先让 Codex 制定计划，甚至反问澄清问题，而不是一上来就改代码。对长期项目，则应该把常用规则沉淀到 AGENTS.md，让 Codex 每次进入项目都知道项目习惯。",
          "这篇把官方思路整理成 5 个可以直接复制的模板：任务总模板、Plan first 模板、AGENTS.md 模板、验证清单模板和交付 review 模板。"
        ]
      },
      {
        "heading": "Prompt 1：Codex 任务总模板",
        "paragraphs": [
          "这是最通用的一段。适合新增功能、修 Bug、优化页面、补内容、重构小模块。你只需要替换方括号里的信息。",
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
        "heading": "Prompt 2：Plan first，让 Codex 先计划再动手",
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
          "下面这个模板适合前端内容站、产品原型站、案例库、学习资料站。可以复制到项目根目录的 AGENTS.md，再根据你的项目改。"
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
- Use existing design tokens and page patterns where possible.

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
        "heading": "Prompt 4：可验证交付清单",
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
        "heading": "Prompt 5：交付前 Review",
        "paragraphs": [
          "Codex 官方最佳实践也强调验证和 review。这个模板适合任务完成后使用：让 Codex 站在 reviewer 视角检查自己刚才的改动。",
          "它不会替代人工 review，但可以帮你提前发现无关改动、测试缺口、边界问题和风险模块。"
        ],
        "code": {
          "label": "交付前 Review Prompt",
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
          "如果你只是做一个小改动，用“任务总模板”就够了。如果任务有点复杂，先用“Plan first 模板”。如果这是长期项目，把 AGENTS.md 模板放进项目根目录。实现前用 Done criteria 模板，完成后用交付前 Review。",
          "这套流程看起来比一句“帮我做一下”麻烦，但它能减少返工。你给 Codex 的不是一段愿望，而是一张带边界、验证和交付标准的任务卡。",
          "最好的 Codex 使用方式，不是让它自由发挥，而是把它放进稳定工程流程里：先计划、再修改、再验证、再 review。这样它会更像靠谱的协作者，而不是随机生成代码的工具。"
        ]
      }
    ]
  },
  {
    "id": "codex-agent-skills-reusable-workflow-templates",
    "sourceUrl": "https://developers.openai.com/codex/skills",
    "translationMode": "guidedTranslation",
    "title": "Codex Agent Skills：把高频 Prompt 封装成可靠工作流",
    "originalTitle": "Agent Skills",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Agent Skills 官方文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/skills。",
    "sections": [
      {
        "heading": "为什么 Codex 也需要 Skills",
        "paragraphs": [
          "当你已经积累了很多好 Prompt，下一步不是继续复制粘贴，而是把它们沉淀成可复用 Skill。Codex Agent Skills 的思路就是：把一套稳定工作流写进 `SKILL.md`，让 Codex 在合适任务里自动或按名称调用。",
          "这非常适合高频任务：页面走查、内容导入、真实网页案例整理、本地 review、交付验证、PR 摘要。它们每次都差不多，但如果每次手写 Prompt，很容易漏掉边界、验证或禁止修改范围。",
          "你可以把 Skill 理解成“给 Codex 的专业操作手册”。普通 Prompt 是这次对话有效，AGENTS.md 是项目长期规则，Skill 则是某一类任务的可复用流程。"
        ]
      },
      {
        "heading": "推荐目录结构",
        "paragraphs": [
          "项目级 Skill 适合放在仓库里，让团队一起复用。对内容站、案例库、工具站来说，建议把页面走查、内容写入、验证交付这几类任务都 Skill 化。",
          "下面是一个适合前端内容项目的目录结构。你可以直接复制目录名，也可以按自己的项目改。"
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
          "它会要求 Codex 保留来源、避免全文搬运、生成中文解读，并且给出可复制 Prompt。"
        ],
        "code": {
          "label": "webpage-case-importer/SKILL.md",
          "content": `---
name: webpage-case-importer
description: Use this skill when the user asks Codex to turn a real webpage, article, official doc, or prompt library into a structured learning detail page.
---

# Webpage Case Importer

Use this skill to create a learning page from a real external source.

## Source Rules

- Prefer official docs, open source repositories, or clearly attributed public articles.
- Always preserve the original source URL.
- Do not copy a full copyrighted article verbatim.
- Summarize and explain in Chinese.
- Keep original structure only when the user explicitly asks for translation and rights allow it.
- If the source includes useful prompts, convert them into complete copyable prompt blocks.

## Workflow

1. Read the source page or repository.
2. Identify the core learning value.
3. Extract real use cases, prompt examples, workflows, screenshots, or code templates.
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
- Complete copyable prompt or template blocks
- How to use the prompts in a real project
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
          "如果你经常遇到页面文字截断、卡片高度不稳、图片缺失、移动端拥挤，就可以沉淀这个 Skill。"
        ],
        "code": {
          "label": "ui-polish-review/SKILL.md",
          "content": `---
name: ui-polish-review
description: Use this skill when the user asks Codex to review or polish a frontend page for layout, typography, responsive behavior, and content readability.
---

# UI Polish Review

Use this skill for frontend pages, cards, detail pages, content pages, dashboards, or tool interfaces.

## Review Focus

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

## Workflow

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

## Workflow

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
- Copyable prompt blocks are complete.
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
          "如果你经常让 Codex 连续加多篇内容或做多轮 UI 修改，这个 Skill 可以帮你在最后收口。"
        ],
        "code": {
          "label": "local-code-review/SKILL.md",
          "content": `---
name: local-code-review
description: Use this skill when the user asks Codex to review local changes before commit, PR, deployment, or handoff.
---

# Local Code Review

Use this skill to review current local changes.

## Review Priorities

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

## Workflow

1. Inspect git status.
2. Inspect the diff.
3. Identify changed files by category.
4. Check whether changes match the user request.
5. Check for suspicious unrelated edits.
6. Check whether tests/build were run.
7. Review content routes, ids, images, and source URLs when relevant.
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
          "不要一开始就把所有 Prompt 都做成 Skill。Skill 的价值在于复用，不在于数量。只要某个任务你会反复做三次以上，它就值得被沉淀。",
          "对 UIcoding.ai 这种内容型网站来说，最推荐的顺序是：先做 `webpage-case-importer` 管内容导入，再做 `verify-delivery` 管交付，最后做 `ui-polish-review` 和 `local-code-review` 管质量。"
        ]
      }
    ]
  },
  {
    "id": "codex-slack-team-workflow-prompts",
    "sourceUrl": "https://developers.openai.com/codex/integrations/slack",
    "translationMode": "guidedTranslation",
    "title": "Slack 里调用 Codex：把团队反馈变成可执行任务 Prompt",
    "originalTitle": "Use Codex in Slack",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Slack 官方集成文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/integrations/slack。",
    "sections": [
      {
        "heading": "为什么 Slack 场景很适合 Codex",
        "paragraphs": [
          "很多真实需求不是从 issue 开始的，而是从 Slack 里的几句话开始：用户说页面坏了，设计师说按钮不对，产品说这个文案要改，工程师说这个 PR 需要再看一眼。",
          "Codex 的 Slack 集成价值在于：你可以在频道或线程里直接 `@Codex`，让它把上下文转成一个云端编码任务。它可以利用线程里的讨论，但你最好在最后一条消息里把目标、仓库、环境、约束和完成标准说清楚。",
          "这篇不讲安装步骤，而是整理一组可以直接复制到 Slack 线程里的 Prompt。你可以把它们当成团队协作模板：Bug 反馈、UI 反馈、PR Review、发布前检查、把讨论整理成 issue。"
        ]
      },
      {
        "heading": "Slack Prompt 的基本结构",
        "paragraphs": [
          "在 Slack 里给 Codex 的 Prompt 要比普通对话更明确，因为它可能从一段很长的线程里接任务。最稳的结构是：先说明仓库和环境，再总结线程结论，然后写清楚任务目标、限制范围和验收标准。",
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
        "heading": "Prompt 1：把用户 Bug 反馈变成修复任务",
        "paragraphs": [
          "用户反馈经常很模糊：打不开、错位、按钮没反应、数据显示不对。你需要在 Slack 里帮 Codex 把反馈补成可复现任务。",
          "这段 Prompt 适合客服、产品、运营把用户反馈直接转交给 Codex。"
        ],
        "code": {
          "label": "Slack Bug 修复 Prompt",
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
        "heading": "Prompt 2：把设计反馈变成 UI 迭代任务",
        "paragraphs": [
          "设计反馈最容易变成“优化一下”。在 Slack 里交给 Codex 时，一定要明确页面、问题、视觉目标、禁止项和验收方式。",
          "这段适合设计师或产品经理在评审线程里直接发给 Codex。"
        ],
        "code": {
          "label": "Slack UI 迭代 Prompt",
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
        "heading": "Prompt 3：把 PR 线程变成 Codex Review",
        "paragraphs": [
          "团队里常见场景是：有人在 Slack 贴了一个 PR，让大家帮忙看。你可以直接让 Codex 先做一轮结构化 Review，找风险、测试缺口和无关改动。",
          "注意：这不是让 Codex 自动合并，而是让它先给 reviewer 一份清晰检查清单。"
        ],
        "code": {
          "label": "Slack PR Review Prompt",
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
        "heading": "Prompt 4：发布前检查",
        "paragraphs": [
          "发布前检查非常适合交给 Codex 做第一轮。它可以从代码角度看构建、路由、环境变量、静态资源、关键页面和风险模块。",
          "这段适合在准备上线、发版、部署 preview 之前发到 Slack 发布线程。"
        ],
        "code": {
          "label": "Slack 发布前检查 Prompt",
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
        "heading": "Prompt 5：把 Slack 讨论整理成 Issue",
        "paragraphs": [
          "并不是每个 Slack 讨论都应该马上让 Codex 改代码。有时更好的做法是先整理成一个清晰 issue，等产品或工程确认后再执行。",
          "这段 Prompt 适合需求还没定、多人意见分散、线程很长的时候。"
        ],
        "code": {
          "label": "Slack 讨论转 Issue Prompt",
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
    "title": "Codex 高保真网站复现 Prompt：从参考网页到像素级验证",
    "originalTitle": "Turn Figma designs into code",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Figma-to-code 官方用例整理的中文学习笔记，不是原文全文翻译。原文地址：https://developers.openai.com/codex/use-cases/figma-designs-to-code。请仅用于自己的设计稿、授权页面、学习临摹或内部原型；不要直接复制第三方品牌页面并冒充上线。",
    "sections": [
      {
        "heading": "高保真复现不是一句“照着做”",
        "paragraphs": [
          "很多人让 Codex 复现网站时，会直接说“帮我做一个和这个网站一样的页面”。这种提示词很容易失败：Codex 不知道你要复现哪些部分，也不知道哪些可以简化，更不知道完成后怎么判断像不像。",
          "更稳定的方式是把复现拆成五步：先拆解参考页面，再收集资产和约束，然后实现页面，接着做响应式和交互，最后用截图对比继续迭代。",
          "OpenAI Codex 的 Figma-to-code 用例也强调了类似思路：给 Codex 足够的设计上下文和资产，实现后通过浏览器截图检查，再迭代修正。下面这组 Prompt 就是把这个流程改写成可以直接复制的中文版本。"
        ]
      },
      {
        "heading": "Prompt 1：复现前拆解参考网页",
        "paragraphs": [
          "不要一开始就写代码。先让 Codex 拆解参考页面：布局、字号、间距、颜色、图片、动效、响应式、交互状态。拆得越清楚，后面实现越稳定。",
          "如果你有 URL，就粘 URL；如果只有截图，就用文字描述截图，或者把截图提供给 Codex。"
        ],
        "code": {
          "label": "参考网页拆解 Prompt",
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
        "heading": "Prompt 2：高保真实现页面",
        "paragraphs": [
          "拆解完成后，再让 Codex 实现页面。这个 Prompt 会明确目标路由、允许简化项、禁止项和验收标准，避免它一边复现一边重构整个项目。",
          "如果你已经有项目设计系统，要强调复用现有组件和样式变量；如果是空项目，要让 Codex 先建立最小可运行页面。"
        ],
        "code": {
          "label": "高保真实现 Prompt",
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
        "heading": "Prompt 3：专门做响应式复现",
        "paragraphs": [
          "很多页面桌面端看起来像，移动端就崩了。高保真复现必须单独处理响应式：导航、Hero、图片比例、卡片列数、长文本和按钮换行都要检查。",
          "这段 Prompt 适合页面初版完成后单独运行一轮。"
        ],
        "code": {
          "label": "响应式复现 Prompt",
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
        "heading": "Prompt 4：Playwright 截图对比验证",
        "paragraphs": [
          "要逼近“完美复现”，不能只靠肉眼一句“差不多”。最实用的方式是让 Codex 用浏览器打开页面，截桌面和移动端截图，和参考截图逐项比较。",
          "如果项目里已经能用 Playwright 或浏览器工具，这段 Prompt 很适合做视觉 QA。"
        ],
        "code": {
          "label": "截图对比验证 Prompt",
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
        "heading": "Prompt 5：按截图差异继续迭代",
        "paragraphs": [
          "第一版复现通常不会一次到位。更好的做法是每轮只修最影响相似度的 3 个问题，修完再截图对比。",
          "这个 Prompt 适合你已经有截图对比结果，想让 Codex 继续微调页面。"
        ],
        "code": {
          "label": "高保真迭代 Prompt",
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
        "heading": "Prompt 6：复现交付检查",
        "paragraphs": [
          "当你觉得页面已经很像了，最后要做一次交付检查：版权素材是否替换、移动端是否可用、链接是否正常、构建是否通过、是否误改其它页面。",
          "这一步能避免“看起来像，但不能上线”的问题。"
        ],
        "code": {
          "label": "复现交付检查 Prompt",
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
        "heading": "怎么用这套 Prompt 才稳定",
        "paragraphs": [
          "不要把 6 段 Prompt 一次性全丢给 Codex。最稳的顺序是：先拆解，再实现，再响应式，再截图对比，再小步迭代，最后交付检查。",
          "如果你有 Figma 或截图，效果通常比只给 URL 更稳定。因为截图能提供明确视觉目标，Codex 可以用浏览器截图反复对比。URL 适合拆解结构，截图适合校准视觉。",
          "最后再强调一次：高保真复现适合学习、内部原型、授权项目和自己的设计稿。真正上线时，要替换第三方品牌、图片和专有文案，保留参考里的结构思路，而不是照搬别人的商业页面。"
        ]
      }
    ]
  },
  {
    "id": "codex-cinematic-web-effects-prompts",
    "sourceUrl": "https://developers.openai.com/codex/use-cases/figma-designs-to-code",
    "translationMode": "guidedTranslation",
    "title": "Codex 酷炫网页效果 Prompt：3D、滚动叙事和高级动效",
    "originalTitle": "Build cinematic web experiences with Codex",
    "notice": "本文为 Uicoding.ai 基于 OpenAI Codex Figma-to-code 用例、Three.js 官方文档和 GSAP ScrollTrigger 官方资料整理的中文学习笔记，不是原文全文翻译。参考来源：https://developers.openai.com/codex/use-cases/figma-designs-to-code、https://threejs.org/docs/、https://gsap.com/docs/v3/Plugins/ScrollTrigger/。",
    "sections": [
      {
        "heading": "酷炫网页效果最怕一句话乱做",
        "paragraphs": [
          "让 Codex 做酷炫网页时，最危险的提示词就是“做得炫一点”。它可能会堆渐变、发光、粒子、动效、阴影和随机装饰，最后页面确实动起来了，但不高级、不稳定，也不一定能在手机上正常运行。",
          "更好的方式是把酷炫效果拆成可实现模块：沉浸式 Hero、3D 背景、滚动叙事、粒子动效、微交互、性能降级和浏览器验证。每个模块都要写清楚视觉目标、技术约束、响应式策略和验收标准。",
          "下面这组 Prompt 适合给 Codex、Claude Code 或 Cursor Agent 使用。你可以复制完整代码块，把项目名称、目标页面、视觉参考和技术栈替换掉。"
        ]
      },
      {
        "heading": "Prompt 1：酷炫网页效果总控 Prompt",
        "paragraphs": [
          "如果你只想复制一段完整 Prompt，就用这一段。它适合从零做一个带视觉冲击力的页面，也适合重做一个普通首页。",
          "它会约束 Codex：先做计划，不要堆装饰；优先保证可读、可用和性能；最后必须验证。"
        ],
        "code": {
          "label": "酷炫网页效果总控 Prompt",
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
        "heading": "Prompt 2：沉浸式 Hero + 3D 背景",
        "paragraphs": [
          "酷炫网页最重要的是首屏。首屏要有记忆点，但不能牺牲标题可读性。这个 Prompt 适合做 Three.js 背景、粒子场、动态网格、漂浮几何或光线效果。",
          "如果项目没有 Three.js，可以让 Codex 先用 CSS + Canvas 做轻量版。"
        ],
        "code": {
          "label": "沉浸式 Hero Prompt",
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
        "heading": "Prompt 3：滚动叙事和视差转场",
        "paragraphs": [
          "很多高级网站的酷，不是元素一直乱动，而是滚动时有节奏：标题出现、图片推进、卡片错位、背景层慢慢切换。",
          "这个 Prompt 适合用 GSAP ScrollTrigger、IntersectionObserver 或轻量 CSS 动画实现滚动叙事。"
        ],
        "code": {
          "label": "滚动叙事 Prompt",
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
        "heading": "Prompt 4：粒子、流体和动态网格效果",
        "paragraphs": [
          "粒子和流体效果很容易变土。关键是少而准：数量可控、色彩克制、运动慢、不要挡住内容、移动端降级。",
          "这段适合做背景氛围、产品展示区或创意工具的视觉记忆点。"
        ],
        "code": {
          "label": "粒子/动态网格 Prompt",
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
        "heading": "Prompt 5：高级微交互和按钮动效",
        "paragraphs": [
          "酷炫网页不一定都靠大背景。有时按钮、卡片、导航、输入框这些小交互更能让页面有质感。",
          "这个 Prompt 适合在页面结构已经完成后，单独加一轮微交互。"
        ],
        "code": {
          "label": "微交互 Prompt",
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
        "heading": "Prompt 6：酷炫效果 QA 和性能验证",
        "paragraphs": [
          "高级动效做完以后，一定要单独 QA。酷炫页面最常见的问题是：手机卡、文字被挡、滚动抖、截图空白、Canvas 没 fallback、动画影响点击。",
          "这段 Prompt 适合最后一轮检查。"
        ],
        "code": {
          "label": "酷炫效果 QA Prompt",
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
    "title": "Codex 设计规范一致性 Prompt：从 Tokens 到组件治理",
    "originalTitle": "Design systems and design tokens consistency workflows",
    "notice": "本文为 Uicoding.ai 基于公开设计系统资料整理的中文学习笔记，不是原文全文翻译。参考来源包括 Material Design Tokens：https://m3.material.io/foundations/design-tokens，Figma Design Systems：https://www.figma.com/design-systems/，W3C Design Tokens Community Group：https://www.w3.org/community/design-tokens/。",
    "sections": [
      {
        "heading": "为什么网站越做越不一致",
        "paragraphs": [
          "很多网站一开始看起来还不错，但页面越多越乱：按钮高度不一样、卡片圆角不一样、标题字号随手写、颜色越来越多、间距没有节奏、移动端每个页面都靠临时修补。",
          "这不是单纯审美问题，而是设计规范没有沉淀成可执行系统。设计系统资料里经常强调 tokens、组件、样式规则和复用模式，本质上都是为了让产品在增长时仍然保持一致。",
          "Codex 很适合做这类治理工作，但不能只说“统一一下设计”。你要让它先审计，再收敛 tokens，再统一组件，最后做页面级 QA。下面这组 Prompt 可以直接复制使用。"
        ]
      },
      {
        "heading": "Prompt 1：设计系统一致性审计",
        "paragraphs": [
          "第一步不是改代码，而是审计。让 Codex 找出颜色、字号、间距、圆角、阴影、按钮、卡片、表单和页面节奏里的不一致。",
          "这个 Prompt 适合项目已经有多个页面、多个 CSS 文件、多个组件之后使用。"
        ],
        "code": {
          "label": "设计系统一致性审计 Prompt",
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
        "heading": "Prompt 2：收敛 Design Tokens",
        "paragraphs": [
          "设计一致性最核心的是 tokens。颜色、字体、字号、间距、圆角、阴影和容器宽度不要散落在页面里，而应该进入统一变量。",
          "这段 Prompt 适合在审计之后使用，让 Codex 把散乱值收敛到已有 tokens 或新增少量必要 tokens。"
        ],
        "code": {
          "label": "Design Tokens 收敛 Prompt",
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
        "heading": "Prompt 3：统一按钮、卡片和标签组件",
        "paragraphs": [
          "按钮、卡片和标签是最容易暴露不一致的地方。一个网站如果有 5 种按钮高度、6 种卡片圆角、4 种标签样式，很快就会显得像拼出来的。",
          "这段 Prompt 适合统一核心组件，但不要求 Codex 重写所有页面。"
        ],
        "code": {
          "label": "核心组件一致性 Prompt",
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
        "heading": "Prompt 4：统一页面节奏和布局规范",
        "paragraphs": [
          "设计一致性不只是组件长得一样，还包括页面节奏：容器宽度、section 间距、标题和正文关系、列表密度、详情页阅读宽度。",
          "这段 Prompt 适合内容站、案例站、学习资料站，能让页面像同一个产品，而不是不同页面拼在一起。"
        ],
        "code": {
          "label": "页面节奏统一 Prompt",
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
        "heading": "Prompt 5：清理散乱 CSS 和临时样式",
        "paragraphs": [
          "长期项目里经常会出现一次性 class、重复选择器、页面专属 hack、同一个颜色写十几次。清理这些东西能显著提升一致性。",
          "这个 Prompt 要求 Codex 小步清理，避免它为了“整洁”大规模重构。"
        ],
        "code": {
          "label": "散乱 CSS 清理 Prompt",
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
        "heading": "Prompt 6：设计一致性 QA",
        "paragraphs": [
          "治理之后要做 QA，不然很容易以为统一了，实际页面上仍然有截断、溢出、按钮不一致、移动端变形。",
          "这段 Prompt 适合每次设计系统治理后运行。"
        ],
        "code": {
          "label": "设计一致性 QA Prompt",
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
    "id": "claude-code-skills-reusable-prompt-workflows",
    "sourceUrl": "https://docs.anthropic.com/en/docs/claude-code/skills",
    "translationMode": "guidedTranslation",
    "title": "Claude Code Skills 官方指南：把一次性 Prompt 沉淀成可复用工作流",
    "originalTitle": "Claude Code Skills",
    "notice": "本文为 Uicoding.ai 基于 Anthropic Claude Code Skills 官方文档整理的中文学习笔记，不是原文全文翻译。原文地址：https://docs.anthropic.com/en/docs/claude-code/skills。",
    "sections": [
      {
        "heading": "为什么要把 Prompt 沉淀成 Skill",
        "paragraphs": [
          "一次性 Prompt 适合临时任务，但真实项目里有很多动作会反复出现：总结当前改动、修复 issue、生成 PR 摘要、做提交前检查、审查 UI 改动。如果每次都重新写一遍，不仅浪费时间，还容易漏掉验证步骤。",
          "Claude Code Skills 的价值，就是把这些高频工作流写进一个固定的 SKILL.md 文件。以后你只需要调用对应 Skill，Claude Code 就会按同一套步骤执行。",
          "官方文档里也强调，Skills 可以把任务说明、约束、允许工具和动态上下文组织在一起。旧的 slash commands 仍然可用，但官方更推荐把复杂工作流迁移到 Skills。"
        ]
      },
      {
        "heading": "一个 Skill 最小长什么样",
        "paragraphs": [
          "一个 Skill 通常就是一个文件夹，里面放一个 SKILL.md。文件开头是元数据，下面是具体工作流说明。你可以把它理解成：一份专门写给 Claude Code 的可复用操作手册。",
          "下面这个是最小模板。复制后，把 name、description 和正文替换成你的工作流即可。"
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

## Workflow

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
          "如果是项目专属 Skill，建议放在当前项目的 .claude/skills/ 目录下。这样它跟项目一起走，适合团队共享。如果是个人通用 Skill，可以放在你的用户级 Claude Code 配置目录里。",
          "调用时通常可以用 slash command 形式，例如 /summarize-changes、/fix-issue、/pr-summary。具体是否立即生效，取决于你的 Claude Code 版本和当前会话是否重新加载了 Skills。"
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
          "你可以把它做成 /summarize-changes，在提交 Git 或发给别人 review 前运行。"
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

## Workflow

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

## Workflow

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
        "heading": "Skill 3：pr-summary，生成 PR 摘要和 Review 说明",
        "paragraphs": [
          "这个 Skill 适合准备提交 PR 时使用。它会把当前改动整理成 reviewer 容易读的结构：背景、改动、验证、风险、截图或检查方式。",
          "如果你的团队经常要求 PR 描述清楚，这个模板会非常省时间。"
        ],
        "code": {
          "label": "pr-summary/SKILL.md",
          "content": `---
name: pr-summary
description: Use this skill when the user asks to draft a pull request summary, release note, or review handoff from local changes.
---

# PR Summary

Use this skill when code changes are ready to be described for review.

## Workflow

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

## Review Checklist

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
          "很多 AI Coding 的问题不是不会写代码，而是写完后没有验证。你可以把验证流程单独做成 Skill，每次改完都跑一遍。",
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

## Workflow

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
        "heading": "什么时候用 Skill，什么时候只用 Prompt",
        "paragraphs": [
          "如果某个任务只会做一次，用普通 Prompt 就够了。比如临时解释一段代码、一次性改一段文案、问一个概念问题，没有必要做成 Skill。",
          "如果某个任务会反复出现，而且你希望每次都按同样流程执行，就应该做成 Skill。比如 summarize-changes、fix-issue、pr-summary、verify-change、ui-review、release-note 这类任务。",
          "判断标准很简单：只要你发现自己第三次复制同一段提示词，就应该考虑把它沉淀成 Skill。这样 Claude Code 不再依赖你每次把规则说完整，而是自动按项目约定工作。"
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
  },
  {
    "id": "copyable-prompts-for-stunning-ai-websites",
    "sourceUrl": "https://developers.openai.com/showcase",
    "translationMode": "guidedTranslation",
    "title": "5 个带可复制 Prompt 的酷炫网页案例：照着还原首页",
    "originalTitle": "Copyable prompts for stunning AI websites",
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附官网链接、官方 Prompt 页面，以及适合直接拿去还原网页的中文提示词。",
    "sections": [
      {
        "heading": "先怎么用这篇文章",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这篇不是单纯列链接，而是把 5 个明确带有官方 Prompt 页面、并且首页视觉足够惊艳的 AI 生成网站整理成一套可练习素材。建议先选一个案例，只还原首页第一屏和主视觉；做出气质之后，再补动效、滚动和响应式。"
          },
          {
            "type": "paragraph",
            "content": "每个案例下面我都放了两个可直接复制的 Prompt。第一个负责把结构和画面气质先搭准，第二个负责补视觉、交互和收尾。你可以直接丢给 Codex，也可以按自己的技术栈稍作改写。"
          },
          {
            "type": "code",
            "label": "通用使用方法",
            "content": "使用方式建议：\n1. 先打开案例官网，观察首屏结构、字体、主视觉、按钮位置和滚动节奏。\n2. 先复制 Prompt 1，让 Codex 只把首页骨架和视觉方向做出来。\n3. 构建成功后，再复制 Prompt 2，补动画、质感和响应式。\n4. 每一轮都要求它运行 npm run build，并在成功后停止。\n5. 如果页面开始变成普通 SaaS 模板，就提醒它：不要卡片堆叠、不要默认功能区块、不要模板化卖点布局。"
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
            "content": "这是一个非常适合练 3D 品牌首页气质的案例。它不是传统电商站那种信息密集的首屏，而是用极少文案、强主视觉、滚动叙事和沉浸式光影，先把品牌氛围打进用户脑子里。"
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
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/forged-in-silence"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先搭首屏骨架",
            "content": "请创建一个 React + Vite 单页网页，还原一个高质感武士刀品牌首页，视觉气质参考 Forged in Silence。\n\n目标：\n- 第一屏就建立强烈的品牌压迫感\n- 页面像奢侈品视觉官网，不像普通 SaaS 模板\n- 以黑色、冷白、金属灰和少量暗金为主\n\n页面要求：\n1. 顶部导航极简，左侧品牌名，右侧少量菜单和一个克制的 CTA。\n2. 首屏中央使用超大标题，文案极少，允许上下分层排版。\n3. 背景必须很深，保留微弱纹理或空气感，不要彩色渐变。\n4. 首屏中心放一个悬浮的主视觉对象占位，后续可替换为 3D 武士刀或高质感金属物件。\n5. 页面整体保留大量留白，不要做功能卡片宫格。\n6. 向下滚动前，首屏必须完整、克制、沉浸。\n\n技术要求：\n- React\n- Vite\n- 普通 CSS\n- 先不要引入 UI 组件库\n- 代码结构清晰，样式集中\n\n完成后运行 npm run build，构建成功后停止。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补 3D 气质和滚动叙事",
            "content": "继续完善当前页面，把它推进到接近 Forged in Silence 的沉浸式品牌首页效果。\n\n本轮目标：\n- 增加 scroll-driven 叙事感\n- 强化主视觉物件的存在感\n- 让页面更像 cinematic landing page\n\n请实现：\n1. 使用 Three.js 或 React Three Fiber 做一个高质感金属主视觉，可先用程序化几何体模拟，不依赖外部 3D 模型也可以。\n2. 首屏到第二屏之间建立滚动联动：主视觉有轻微旋转、位移、镜头推进或光影变化。\n3. 补充 3 到 5 个章节，每个章节只有少量文字，让内容像视觉旁白，不要写成卖点卡片。\n4. 加入更克制的细节效果，例如微粒、暗角、金属反光、极轻的扫描质感，但不要过度炫技。\n5. 移动端保持首屏张力，标题允许换行，但不要破坏中心构图。\n6. 不要引入夸张 hover，不要把后续内容做成普通电商组件堆叠。\n\n最后运行 npm run build；如果构建成功，就停止并总结修改了哪些文件。"
          }
        ]
      },
      {
        "heading": "案例 2：Watchmaker Landing Page",
        "image": "/case-screenshots/watchmaker-home.png",
        "imageAlt": "Watchmaker Landing Page 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这个案例适合练“高奢品牌官网”的克制感。它最迷人的地方不是特效很多，而是版式、留白、数字章节、精密部件展示和高端商品叙事做得非常稳。"
          },
          {
            "type": "paragraph",
            "content": "如果你经常把高端官网做成重营销模板，这个案例很值得反复拆。重点不只是手表图本身，而是标题、序号、图文错位、视差和章节节奏怎么一起工作。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-landing-page-examples.vercel.app/haute-horlogerie"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/watchmaker-landing-page"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做高奢首屏和章节结构",
            "content": "请创建一个 React + Vite 品牌官网首页，主题是一家高端制表品牌，视觉方向参考 Watchmaker Landing Page。\n\n要求：\n- 首屏气质必须高端、克制、精密\n- 不要做成普通产品营销页\n- 排版以大留白、细字体、章节数字和高质量产品图为核心\n\n页面结构：\n1. 极简导航，品牌名左侧，菜单极少。\n2. Hero 区域使用非常大的标题和少量说明文案。\n3. 首屏右侧或中央放精密腕表主视觉，图像要有收藏品质感。\n4. 下方分成多个章节，每个章节像一本奢侈品画册中的段落。\n5. 使用编号章节标题，例如 01、02、03，但样式要克制。\n6. 全站避免默认卡片列表、避免功能卖点图标区。\n\n风格要求：\n- 象牙白、暖灰、深黑、金属银、少量金色点缀\n- 字体优雅，有呼吸感\n- 边框和阴影很轻\n\n完成后运行 npm run build，成功后停止。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补视差、图文错位和精密质感",
            "content": "继续完善这个高端制表品牌首页，让视觉更接近 Watchmaker Landing Page。\n\n请重点增强：\n1. 主视觉腕表或零件图的分层感，可以做 exploded view、部件悬浮或轻微 parallax。\n2. 文本章节与图片之间使用错位布局，让页面更像编辑型叙事，不要整齐排成模板区块。\n3. 加入细微滚动过渡：文字淡入、部件慢速移动、章节切换时的节奏变化。\n4. 调整标题和段落的字重、字号、行距，让画面更像 luxury editorial site。\n5. CTA 数量保持极少，避免强销售感。\n6. 移动端优先保证构图稳定和阅读节奏，不要为了响应式把页面压成普通竖排模块。\n\n不要新增复杂功能，不要引入沉重组件库。最后运行 npm run build。"
          }
        ]
      },
      {
        "heading": "案例 3：Arcade Bar Landing Page",
        "image": "/case-screenshots/arcade-bar-home.png",
        "imageAlt": "Arcade Bar Landing Page 网站首页截图",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果你想练一个风格非常鲜明、又不至于失控的娱乐型首页，这个案例很好用。它把霓虹、暗色背景、活动感和游戏厅气氛结合得很直接，但整体信息还是清楚的。"
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
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/arcade-landing-page"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做霓虹娱乐场所首页",
            "content": "请创建一个 React + Vite 单页 landing page，主题是一家霓虹风格的街机与弹珠酒吧，视觉参考 Arcade Bar Landing Page。\n\n目标：\n- 一眼看出是夜间娱乐场所\n- 页面有很强的品牌气氛，但结构依然清楚\n- 不要做成普通餐厅官网模板\n\n页面要求：\n1. Hero 使用大标题、霓虹风主视觉和一个主要 CTA。\n2. 背景以深色为主，加入紫红、蓝青、橙色等霓虹点缀，但要控制层次。\n3. 首页往下包含活动、饮品、小食、游戏项目、到店信息等模块。\n4. 模块可以有海报感，但不要全部做成同尺寸卡片宫格。\n5. 标题字体和装饰细节需要有 arcade vibe。\n6. 页面第一屏必须足够抓人，像一家真实会想去的潮流场地。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 不做后端\n- 构图优先，不要先堆功能组件\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补霓虹细节和版式控制",
            "content": "继续打磨这个街机酒吧首页，让它更接近 Arcade Bar Landing Page 的完成度。\n\n请增强：\n1. 霓虹招牌感的排版和边缘发光，但发光范围要可控，不要糊成一片。\n2. 不同区块之间建立节奏变化，例如海报区、菜单区、活动区、游戏区可以有不同构图。\n3. 为 CTA、分隔线、图像边框和标签加入街机视觉语言，但保持信息可读。\n4. 为首屏和关键区块加入轻微 hover 或滚动反馈，让页面更有现场感。\n5. 检查配色，避免整页只剩一种紫蓝；要有暖色作为点亮点。\n6. 移动端保持强风格，不要退化成普通白底列表页。\n\n最后运行 npm run build，构建成功后停止。"
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
            "content": "如果你想做更酷一点的作品集首页、游戏活动页、或者可玩的 AI Demo，这种案例特别有参考价值。哪怕你不真的做 FPS，也可以学它的标题、配色、HUD 和开场界面语言。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/fps/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/rift-vox"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做赛博朋克游戏入口页",
            "content": "请创建一个 React + Vite 的游戏网页首页，主题是赛博朋克体素风第一人称射击游戏，视觉参考 Neon FPS。\n\n目标：\n- 首页像可玩的独立游戏入口页\n- 第一眼就有 neon cyberpunk atmosphere\n- 不要做成普通游戏官网营销模板\n\n页面要求：\n1. 使用全屏 hero，带有强烈标题、简短背景设定、开始按钮。\n2. 视觉上要有体素、霓虹、工业感、夜间 megablock 气质。\n3. 页面叠加 HUD 风格元素，例如状态字、小型指示、扫描线、准星感组件，但不要影响阅读。\n4. 可以加入一张主视觉图或 canvas 场景占位，营造游戏世界入口。\n5. 文案保持少而硬朗，像游戏开场界面。\n6. 不要出现常规 SaaS 的 feature cards、pricing 区和团队介绍区。\n\n技术要求：\n- React + Vite\n- 普通 CSS，必要时可加入 canvas 或 WebGL 占位\n- 优先把氛围和构图做对\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补 HUD、光效和可玩气氛",
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
            "content": "如果你想做 AI 生成小游戏、教育交互页、或者带一点产品实验感的首页，这个方向很值得学。它的优秀之处在于复杂规则没有把界面压垮，反而形成了清楚、可探索的体验。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://codextimetofly.com/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/time-to-fly"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做宇宙谜题首页和主玩法区",
            "content": "请创建一个 React + Vite 的网页游戏首页，主题是宇宙重力谜题，视觉和玩法表达参考 Time to Fly。\n\n目标：\n- 首页既像一个可玩的产品，也像一个被精心设计的实验性网页\n- 用户一眼就能理解“拖动行星、调整发射角度、把火箭送到目标”的核心概念\n- 界面轻盈、清楚、带一点太空童话感\n\n页面要求：\n1. 首屏展示标题、简短玩法说明和一个主玩法区域。\n2. 主玩法区域用圆形轨道、行星、火箭、目标点来构成一个 miniature solar system。\n3. 界面信息简洁，不要出现复杂仪表盘。\n4. 用少量发光、轨道线和星空背景表现宇宙感。\n5. 交互区旁边可以有开始按钮、重置按钮和关卡提示。\n6. 不要把页面做成游戏介绍长文页，核心是“马上想点一下试试”。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可以用 SVG、Canvas 或 DOM 实现轨道和星体\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补规则表达、动画和细节",
            "content": "继续完善这个宇宙重力谜题首页，让体验更接近 Time to Fly。\n\n请增强：\n1. 行星、轨道、重力场和火箭路径的视觉表达，让用户不看教程也能理解玩法。\n2. 加入轻量动画，例如星体缓慢漂浮、按钮反馈、发射前后状态切换。\n3. 为界面补充更细腻的太空层次，比如柔和光晕、粒子、遥远星点和颜色深浅变化。\n4. 保持整体简洁，避免加入多余说明卡片。\n5. 如果实现可玩演示，允许用户拖动行星位置、点击发射、立即重试。\n6. 移动端优先保证主玩法区域完整可见，不要被说明文案挤压。\n\n最后运行 npm run build，成功后停止并总结实现了哪些可玩交互。"
          }
        ]
      },
      {
        "heading": "最后一层：怎么让还原结果更像原站",
        "blocks": [
          {
            "type": "paragraph",
            "content": "很多人第一次复制 Prompt 后，页面会“有点像，但还是模板味很重”。通常不是代码能力不够，而是 Prompt 没把气质约束写清楚。真正决定像不像的，往往是构图、留白、内容密度、动效节奏和对“不要什么”的限制。"
          },
          {
            "type": "paragraph",
            "content": "如果你发现 Codex 开始自动加功能卡片、价格区、团队介绍、过多按钮，就说明它退回了常见模板。这个时候最有效的做法不是重来，而是补一轮收尾 Prompt，把不该出现的模式明确排除掉。"
          },
          {
            "type": "code",
            "label": "通用收尾 Prompt",
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
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附真实网址、官方 Prompt 页面，以及适合直接拿去还原网页首页和交互入口的中文提示词。",
    "sections": [
      {
        "heading": "这篇更适合谁看",
        "blocks": [
          {
            "type": "paragraph",
            "content": "如果你已经会让 Codex 生成普通 landing page，但总觉得作品还不够酷、不够有记忆点，这篇会更对路。这里挑的 5 个案例都不是标准产品营销页，而是更强调场景、氛围、可玩性和“第一屏就想点一下”的网页。"
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
            "content": "如果你想练“沉浸式场景首页”，它比普通 3D hero 更有参考价值，因为它不只是摆一个物体，而是让场景和控制面板一起工作。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://petergpt.github.io/london-train/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/london-train"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做可探索 3D 城市首页",
            "content": "请创建一个 React + Vite 的互动网页首页，主题是一个可探索的伦敦城市轨道世界，视觉方向参考 London Dream Railway。\n\n目标：\n- 首页本身就是体验，不是传统介绍页\n- 第一屏就出现城市模型、轨道线路和控制入口\n- 用户进入页面后会立刻想拖动、切换或观察场景\n\n页面要求：\n1. 使用全屏或接近全屏的主场景区域，展示抽象化的伦敦城市与轨道系统。\n2. 保留标题和简短说明，但文字必须克制，不能盖过场景本身。\n3. 场景旁边或上方叠加一个轻量控制面板，包含线路切换、时间、视角或模式控制。\n4. 视觉上要有模型感、交通感、未来演示感，但不要做成企业数据后台。\n5. 页面结构优先围绕“观察和探索”，不要加产品卖点卡片。\n6. 移动端允许弱化控制项，但要保留场景沉浸感。\n\n技术要求：\n- React + Vite\n- 可用 Three.js 或 React Three Fiber\n- 不引入重型 UI 组件库\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补场景控制和导览感",
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
            "content": "它很适合参考“体验型品牌页”和“可视化交互页”的中间形态：既有强视觉主场景，也保留了可操作的仪表感。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-miniapps-examples.vercel.app/bridge-5p5/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/golden-gate-flight-experience"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做飞行体验首屏",
            "content": "请创建一个 React + Vite 的沉浸式网页首页，主题是飞越金门大桥的互动体验，视觉方向参考 Golden Gate Experience。\n\n目标：\n- 第一屏像电影海报和体验入口的结合体\n- 用户一眼看到主场景、标题和开始体验按钮\n- 页面重心是空间感和沉浸感，不是功能说明\n\n页面要求：\n1. Hero 采用大幅场景图或 3D 场景，金门大桥必须成为绝对视觉中心。\n2. 文案要很少，只保留标题、简短副标题和一个开始按钮。\n3. 在场景边缘叠加轻量控制元素或状态信息，让页面有“可操作”暗示。\n4. 颜色以雾蓝、海水灰、桥梁暖红和高光白为主。\n5. 保留大量留白和纵深，不要做模块化卡片拼接。\n6. 页面打开后要像一个体验入口，而不是旅游官网或 SaaS 首页。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补电影感和控制叠层",
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
            "content": "如果你想做游戏风格作品集、策略类 demo、或者有强规则感的网页工具，这种结构非常值得照着拆。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://trpg-demo-codex.vercel.app/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/turn-based-rpg"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做战棋式可玩首页",
            "content": "请创建一个 React + Vite 的网页首页，主题是回合制策略 RPG，视觉和界面组织参考 Ember Tactics。\n\n目标：\n- 首页直接进入战场情境\n- 地图、角色、状态面板和操作按钮同屏出现\n- 用户一眼就知道这是可玩的策略体验，而不是普通游戏官网\n\n页面要求：\n1. 第一屏包含俯视角战场区域，至少有地格、角色单位和目标区域的视觉暗示。\n2. 画面侧边或底部保留一个轻量 HUD，展示角色状态、技能按钮或回合信息。\n3. 顶部可以有标题和一句世界观说明，但不要喧宾夺主。\n4. 配色偏奇幻、战术、略带独立游戏质感，不要做成卡通手游广告页。\n5. 页面必须让人感觉“已经开局”，而不是“准备介绍”。\n6. 不要加入价格、团队、FAQ 这类官网结构。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可以用 CSS Grid、Canvas 或 SVG 模拟地图\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补战场 HUD 和操作反馈",
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
            "content": "它最有价值的地方不是单纯好看，而是入口非常明确。用户不会犹豫下一步做什么，因为所有视觉都在把人往“开始”这件事上推。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/fps/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/rift-vox"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做赛博朋克 FPS 入口页",
            "content": "请创建一个 React + Vite 的网页首页，主题是赛博朋克体素风第一人称射击游戏，视觉方向参考 Neon Voxel Breach。\n\n目标：\n- 第一屏像硬核游戏启动界面\n- 强调 neon、夜景、工业感和即将开战的气氛\n- 用户进入页面后，第一反应是点击开始而不是阅读说明\n\n页面要求：\n1. 使用全屏 hero，背景可以是场景图、插画或轻量 3D/canvas 场景。\n2. 放置巨大标题、极短玩法文案和一个强 CTA。\n3. 叠加少量 HUD 元素，例如状态字、角标、准星感图形或按键提示。\n4. 颜色以黑、蓝青、紫、电光粉为主，但控制对比，不要糊。\n5. 页面要像游戏入口，不要出现普通 feature cards。\n6. 保持强风格，但文字必须仍可读。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补 HUD、光效和战场预热感",
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
            "content": "这个案例更偏复古街机感。它不是靠复杂 3D 或粒子撑场面，而是靠像素场景、月夜屋顶、角色站位和极短信息，把“马上开玩”的信号打得非常干净。"
          },
          {
            "type": "paragraph",
            "content": "如果你想做更轻、更小、更容易完成的游戏网页练习，它是很好的切入口。难度比 3D 场景低，但气质依然鲜明。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-minigames-examples.vercel.app/brick-platformer/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/brick-platformer"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做复古平台跳跃首页",
            "content": "请创建一个 React + Vite 的网页游戏首页，主题是复古像素风平台跳跃，视觉方向参考 Brickbound Climb。\n\n目标：\n- 首页直接呈现关卡开局画面\n- 用户一眼就能理解这是跳跃攀登类玩法\n- 画面轻巧、复古、带一点月夜冒险感\n\n页面要求：\n1. 第一屏使用像素风屋顶、砖块平台、月亮和角色站位构成完整场景。\n2. 顶部或角落保留少量 UI 信息，例如时间、得分、生命或提示键位。\n3. 文案必须极少，按钮可只有一个开始或重试入口。\n4. 不要做成手机游戏广告页或普通独立游戏官网。\n5. 重点是“场景本身就能说明玩法”。\n6. 移动端要优先保持主关卡构图完整。\n\n技术要求：\n- React + Vite\n- 普通 CSS\n- 可用 CSS 像素画、SVG 或 Sprite 风格实现\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补像素 HUD 和开局反馈",
            "content": "继续完善这个复古平台跳跃首页，让它更接近 Brickbound Climb 的完成度。\n\n请重点处理：\n1. 让角色、平台和危险区更像真的可玩关卡，而不是装饰场景。\n2. 为 HUD 加入像素风边框、计时器、分数或简单提示，但保持克制。\n3. 增加轻量动态，例如角色待机、月光闪烁、云层移动或平台高亮。\n4. 标题和按钮要延续复古街机语言，不要变成现代 SaaS 按钮样式。\n5. 保持整个首页干净，不要额外补一堆说明模块。\n6. 如果实现试玩 demo，优先做左右移动和跳跃反馈。\n\n最后运行 npm run build，并总结哪些元素最有效地传达了玩法。"
          }
        ]
      },
      {
        "heading": "最后怎么用这些 Prompt",
        "blocks": [
          {
            "type": "paragraph",
            "content": "这组案例和上一篇最大的区别，是它们更依赖“情境成立”。普通 landing page 可以先搭文字结构再补视觉，但这种游戏感网页如果主场景不成立，后面再怎么补按钮和说明都不会像。"
          },
          {
            "type": "paragraph",
            "content": "所以真正高效的顺序通常是：先让场景成立，再让入口明确，最后才补规则说明。只要第一屏已经像一个体验入口，后面哪怕玩法还没做完，页面也已经有记忆点了。"
          },
          {
            "type": "code",
            "label": "通用收尾 Prompt",
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
    "notice": "本文为 UIcoding 基于 OpenAI Showcase 公开案例整理的中文学习稿。文中配图为各网站真实首页截图；每个案例都附真实网址、官方 Prompt 页面，以及适合直接拿去还原网页首页、工具表面和控制面板的中文提示词。",
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
            "content": "工具型首页的重点是让用户立刻理解三件事：这个工具能产出什么、我怎么操作它、结果会在什么地方出现。所以这篇案例都偏向“首页即工具表面”的方向，适合练生成器、参数控制器、可视化界面和带 3D 场景的交互工具。"
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
            "content": "这是最典型的“首页直接暴露核心工具界面”的案例。用户一进来就能看到程序化城市模型、参数面板和调整结果，而不是先读一堆产品故事。它非常适合学生成器类产品怎么组织第一屏。"
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
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/procedural-city-generator"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做生成器首页骨架",
            "content": "请创建一个 React + Vite 的工具型首页，主题是程序化城市生成器，视觉和信息结构参考 Procedural City Generator。\n\n目标：\n- 首页一打开就像真实工具界面\n- 结果区和控制区必须同屏出现\n- 用户一眼就知道这是“调参数 -> 看城市结果”的产品\n\n页面要求：\n1. 主区域展示一个 3D 城市或程序化城市结果预览，可先用简化几何体占位。\n2. 右侧或左侧放一个参数控制面板，包含密度、高度、街区、道路、灯光等控制项。\n3. 顶部只保留极少量品牌和模式切换，不要做营销型导航。\n4. 结果区必须是第一视线焦点，不能被说明文案压过去。\n5. 页面不要做功能卖点卡片，不要先讲故事再进入工具。\n6. 整体气质偏现代、实验性、带一点模拟器和生成器感觉。\n\n技术要求：\n- React + Vite\n- 可使用 Three.js 或 React Three Fiber\n- 普通 CSS\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补参数反馈和工具质感",
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
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/london-train"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做场景化工具首页",
            "content": "请创建一个 React + Vite 的互动工具首页，主题是一个可探索的伦敦城市轨道系统，视觉方向参考 London Dream Railway。\n\n目标：\n- 首页既像一个小型世界，也像一个可操作工具\n- 城市轨道场景和控制入口必须同时成立\n- 用户进入页面后，会自然想切换线路、调整视角或探索场景\n\n页面要求：\n1. 使用占主导地位的 3D 场景区域，展示抽象化城市、轨道和地标。\n2. 在场景边缘叠加轻量控制面板，例如线路选择、昼夜、速度、视角等。\n3. 文本说明必须非常少，不能破坏探索感。\n4. 页面结构应该围绕“看场景 + 控制场景”展开，而不是常规产品官网结构。\n5. 顶部导航极简，只保留品牌和少量操作入口。\n6. 移动端允许简化控件，但不要失去场景主导地位。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补轨道控制和探索反馈",
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
            "content": "它很适合拿来练“体验型产品界面”而不是纯工具界面。尤其适合做飞行、地图、预览、导览类交互产品。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://openai-miniapps-examples.vercel.app/bridge-5p5/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/golden-gate-flight-experience"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做体验型场景首页",
            "content": "请创建一个 React + Vite 的沉浸式体验首页，主题是飞越金门大桥的可视化场景体验，视觉方向参考 Golden Gate Experience。\n\n目标：\n- 首页以空间感和场景体验为核心\n- 主场景和轻量控制层同时出现\n- 页面像体验入口，而不是普通图文介绍页\n\n页面要求：\n1. 使用大幅主场景作为首屏核心，桥体、海面和纵深空间必须明显。\n2. 保留少量标题、说明和主操作按钮，避免文本过多。\n3. 在场景上叠加轻量控制层，例如模式、视角、状态、信息卡片或开始体验按钮。\n4. 页面整体应该偏 cinematic、导览感、体验感。\n5. 不要加入通用 feature cards，不要做旅游官网结构。\n6. 保持视觉呼吸感，让场景本身说话。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补叠层控件和电影感",
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
            "content": "虽然它看起来更像游戏，但从界面结构上看，它其实也是一个很典型的“首页即操作面板”案例。地图是结果区，侧边和底部 HUD 是控制区，用户无需滚动就能理解系统状态。"
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
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/turn-based-rpg"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做地图 + HUD 工具表面",
            "content": "请创建一个 React + Vite 的高密度工具型首页，主题是回合制战术地图界面，结构参考 Ember Tactics。\n\n目标：\n- 首页直接展示核心地图和状态面板\n- 用户进入页面后立刻理解系统当前状态和可操作入口\n- 页面像真正的操作界面，而不是介绍页\n\n页面要求：\n1. 第一屏包含主地图区域，地图承担结果区角色。\n2. 侧边或底部保留 HUD 区，展示状态、模式、技能或操作信息。\n3. 信息密度可以高，但层级必须清楚，不能乱成一片。\n4. 顶部只保留少量品牌或模式标题，不做营销导航。\n5. 页面整体偏战术、模拟、系统界面感。\n6. 不要加入 FAQ、品牌故事和卖点卡片。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补状态层级和面板反馈",
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
            "content": "对需要同时展示可视化结果和轻量规则的工具来说，这个结构非常有参考价值，比如教育工具、模拟器、实验性产品或可玩式引导页面。"
          },
          {
            "type": "links",
            "items": [
              {
                "label": "网站首页",
                "url": "https://codextimetofly.com/"
              },
              {
                "label": "官方 Prompt 页",
                "url": "https://developers.openai.com/showcase/time-to-fly"
              }
            ]
          },
          {
            "type": "code",
            "label": "Prompt 1 · 先做可视化规则首页",
            "content": "请创建一个 React + Vite 的交互型首页，主题是宇宙重力谜题或轨道模拟体验，结构参考 Time to Fly。\n\n目标：\n- 首页同时展示主场景、规则暗示和控制入口\n- 用户不读长文也能理解这是一个可交互系统\n- 页面像实验性产品或轻量模拟器，而不是普通官网\n\n页面要求：\n1. 第一屏包含太空主场景，轨道、星球、火箭或目标点必须明确。\n2. 右侧或下方放一个轻量控制面板，展示开始、重置、角度、强度或关卡提示。\n3. 文案必须很少，以“引导理解玩法”为主，而不是营销介绍。\n4. 结果区和控制区要有明确分工，但视觉上保持统一。\n5. 整体气质轻盈、未来感、实验性，不要做沉重后台风格。\n6. 不要加入与玩法无关的大段说明区块。\n\n完成后运行 npm run build。"
          },
          {
            "type": "code",
            "label": "Prompt 2 · 补规则表达和控制细节",
            "content": "继续完善这个宇宙规则可视化首页，让它更接近 Time to Fly 的完成度。\n\n请增强：\n1. 轨道、星体、重力场和目标关系要更直观，让用户一眼读懂规则。\n2. 控制面板中的按钮、标签和状态说明要更清楚，像可用产品而不是装饰。\n3. 主场景加入轻量动画，例如漂浮、轨迹、光晕或发射前后状态变化。\n4. 结果区必须保持第一焦点，避免控制区反客为主。\n5. 保持整体简洁，不要往页面里补一堆营销区块。\n6. 移动端优先保证主场景完整和主控制入口可点。\n\n最后运行 npm run build，并总结当前页面最像“实验性工具”的两个细节。"
          }
        ]
      },
      {
        "heading": "最后一条经验：别把工具页做回普通官网",
        "blocks": [
          {
            "type": "paragraph",
            "content": "工具型页面最容易被 AI 自动拉回“标准官网模板”。一旦 Codex 开始给你加卖点卡片、客户评价、FAQ、团队介绍、价格区，就说明它把任务理解成营销首页了。"
          },
          {
            "type": "paragraph",
            "content": "这类页面真正的价值，恰恰是把工具本身提到第一屏。哪怕功能还没全做完，只要结果区、控制区和状态区已经成立，页面就会比普通模板更有说服力。"
          },
          {
            "type": "code",
            "label": "通用收尾 Prompt",
            "content": "请继续优化当前页面，但不要改变它作为工具型首页的核心结构。\n\n本轮只做工具表面收尾：\n1. 强化结果区、控制区和状态区的层级关系。\n2. 删除或弱化营销型网页模块，例如 feature cards、品牌故事、FAQ、价格区。\n3. 确保用户进入页面后，第一眼就知道能操作什么、结果在哪。\n4. 调整按钮、输入控件、标签和面板样式，让它们更像真实工具。\n5. 如果有 3D 或主场景，让它继续保持第一焦点。\n6. 控制颜色和装饰，不要把工具页做成赛博风展示板。\n7. 移动端优先保住主结果区和主操作入口。\n\n完成后运行 npm run build，并总结当前页面最像真实产品界面的 2 个地方。"
          }
        ]
      }
    ]
  }
];
