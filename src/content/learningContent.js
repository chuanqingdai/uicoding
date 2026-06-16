const guidedNotice =
  '本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。';

export const learningContent = [
  {
    id: 'uicoding-skill-coding-process',
    sourceUrl: '',
    translationMode: 'original',
    title: '我如何用 Codex 和 Skill 做出 Uicoding.ai',
    originalTitle: '',
    notice:
      '本文是 UIcoding 的站内原创复盘，记录这个网站从空项目到多页面内容站的 AI Coding 过程。文中的代码块可以直接复制到 Codex 输入框中使用，再根据你的项目名称和目标做少量替换。',
    sections: [
      {
        heading: '为什么要给 Codex 配一个设计 Skill',
        content:
          '只用 Codex 写代码时，它很擅长完成明确的工程任务：创建页面、补数据、修构建错误、调整组件。但当目标变成“更高级”“更像编辑精选站”“减少组件库感”时，问题就不再只是代码，而是设计判断。Uicoding.ai 的搭建过程里，我把 Codex 当成工程执行者，把设计 Skill 当成视觉审稿人：它负责提醒我哪里像模板、哪里层级太乱、哪里按钮过重、哪里图片和文字关系不舒服。',
      },
      {
        heading: '第一步：让 Codex 安装或调用设计 Skill',
        content:
          '如果你的 Codex 环境已经有设计 Skill，可以直接在任务里点名使用。如果没有，可以先让 Codex 检查是否存在，再安装或启用对应 Skill。对零基础用户来说，重点不是记住命令，而是把意图说清楚：我需要一个能帮助走查页面视觉、排版、颜色、组件细节和响应式问题的前端设计 Skill。',
        code: {
          label: '复制到 Codex 输入框',
          content:
            '请检查当前 Codex 环境是否已经有用于前端视觉走查和界面优化的设计 Skill。\n如果有，请告诉我如何调用。\n如果没有，请帮我安装或启用一个适合网页产品设计走查的 Skill。\n我的目标是：提升网站的视觉品质、排版、颜色、卡片、按钮、响应式和整体质感，而不是只修代码报错。',
        },
      },
      {
        heading: '第二步：先建立项目，不要一开始就追求完美',
        content:
          'Uicoding.ai 一开始不是一次性做成完整网站，而是先创建 React + Vite 首页：Header、Hero、案例、学习资料、工具和 Footer。这个阶段最重要的是可运行、结构清晰、文件不要拆太碎。先让项目跑起来，后面才有真实页面可以截图、走查和迭代。',
        code: {
          label: '创建首页的提示词模板',
          content:
            '从零开始创建一个 React + Vite 前端项目。\n技术栈：React、Vite、npm、普通 CSS、静态数据。\n当前只做首页，不做后端、不做登录、不做数据库。\n文件结构保持简单：src/main.jsx、src/App.jsx、src/data.js、src/components、src/styles.css。\n首页包含：Header、Hero、精选案例、学习资料、常用工具、Footer。\n完成后运行 npm install 和 npm run build，构建成功后停止。',
        },
      },
      {
        heading: '第三步：把大任务拆成小任务',
        content:
          'AI Coding 最容易失控的地方，是一次性要求它“做完整站点”。Uicoding.ai 的做法是每次只让 Codex 完成一个清晰模块：案例页、学习页、工具页、详情页、登录页、提交页。每个任务都写清楚允许新增什么文件、允许修改什么文件、禁止做什么、最终需要运行什么命令。这样 Codex 的修改范围更小，也更容易在出错时定位问题。',
        code: {
          label: '单页开发提示词模板',
          content:
            '继续开发当前项目。\n本次任务只实现一个页面：/cases。\n不要创建后端、不要创建登录、不要重构目录、不要拆分 CSS、不要引入复杂路由。\n允许新增：src/pages/CasesPage.jsx。\n允许修改：src/App.jsx、src/data.js、src/components/Cards.jsx、src/styles.css。\n页面必须复用已有 Container、Section、Button、Badge、Card、CaseCard。\n完成后运行 npm run build，如果构建成功就停止。',
        },
      },
      {
        heading: '第四步：用 Skill 做视觉走查，而不是凭感觉说高级',
        content:
          '当首页能跑起来之后，我开始让设计 Skill 走查网站。它给出的反馈不是“好看一点”这种模糊建议，而是更具体的判断：按钮颜色太重、卡片信息太挤、标签视觉过强、灰色占位图像默认组件、Hero 边缘白线像渲染瑕疵、详情页正文不应该用背景块。每次只挑最重要的几个问题改，网站质感会比一次性大改稳定很多。',
        code: {
          label: '视觉走查提示词模板',
          content:
            '请使用前端设计 Skill 走查当前首页。\n目标：高级、编辑感、可信，像高端杂志 / 编辑精选站，但保持简洁。\n不要重构项目，不要新增页面，不要改数据结构。\n只指出最影响质感的 3 个问题，并给出可以直接落地的 CSS / 组件优化方向。\n如果需要修改代码，请保持页面结构不变，只优化颜色、字体、间距、卡片、按钮和图片占位。',
        },
      },
      {
        heading: '第五步：每次修改后都要验证',
        content:
          '这个网站的很多问题不是靠读代码发现的，而是在浏览器里看到的：图标白底太大、卡片底边有白线、详情页图片被裁剪、下拉控件像系统默认样式。我的经验是，每次完成一轮修改，都让 Codex 运行构建；如果是视觉相关改动，再打开本地页面检查关键 DOM、图片加载和横向溢出。这样可以避免页面“代码没报错但视觉坏了”。',
        code: {
          label: '验证提示词模板',
          content:
            '修改完成后请执行以下验证：\n1. 运行 npm run build。\n2. 打开 http://localhost:3000 对应页面。\n3. 检查是否有横向溢出。\n4. 如果页面包含图片，检查图片是否加载成功、是否被裁剪。\n5. 如果页面包含卡片，检查 hover、按钮、标签、标题和描述是否对齐。\n只汇报验证结果，不要继续扩展新功能。',
        },
      },
      {
        heading: '这个 Skill 真正帮到我的地方',
        content:
          '设计 Skill 最大的价值不是替你生成一个“高级风格”，而是持续提醒你不要掉进 AI 页面常见陷阱：卡片太多、按钮太黑、标签太抢眼、阴影太模板、渐变太重、排版没有节奏。Uicoding.ai 后来的方向逐渐清晰：品牌色从纯黑转向更有温度的棕色，字体改成更有编辑感的组合，卡片 hover 保持轻微，学习详情页改成更像文章阅读，工具图标统一真实产品标识。它像一个严格的设计同事，不一定每次都给最终答案，但能把问题说得更准。',
      },
      {
        heading: '给零基础用户的建议',
        content:
          '不要把 AI Coding 理解成一次性生成网站。更好的方式是：先做一个能运行的版本，再不断截图、描述问题、限制范围、让 Codex 修改、重新构建验证。Skill 适合用在每一轮“看起来不对，但说不清哪里不对”的时候。你可以先让它走查，再让 Codex 只改前三个问题。这样做慢一点，但更稳，也更接近真实产品的工作方式。',
      },
    ],
  },
  {
    id: 'datacamp-codex-cli-beginner',
    sourceUrl: 'https://www.datacamp.com/tutorial/open-ai-codex-cli-tutorial',
    translationMode: 'guidedTranslation',
    title: 'Codex CLI 新手入门：从安装到生成页面',
    originalTitle: 'OpenAI Codex CLI Tutorial',
    notice: guidedNotice,
    sections: [
      {
        heading: '这篇教程适合谁',
        content:
          '这篇 DataCamp 教程适合第一次接触 Codex CLI 的学习者。它不是深入讲模型原理，而是从安装、登录、运行命令和审批模式开始，帮助你理解 Codex CLI 如何在本地项目里读取文件、修改代码并等待人工确认。',
        image:
          'https://media.datacamp.com/cms/ad_4nxcr-mjzshqcln3209rd9vvzdth7ixwgu5rz-7fsqtyw5059vbxtxqna00ssclojbdgm6aeazehyeujatxy28tto5i3wl_pp_mpce81hrhwltjl966-p9bct18x7l-uv4at-zqwqga.png',
        imageAlt: 'Codex CLI 教程中的截图输入示例',
      },
      {
        heading: '先理解审批模式',
        content:
          'Codex CLI 的一个关键点是审批模式。新手不要一开始就让工具自动修改所有内容，更稳的方式是先使用默认或受限模式，让它提出修改建议、展示 diff，再由你确认执行。这样可以避免因为任务描述不清导致项目结构被大幅重写。',
        code: {
          label: '终端命令示例',
          content: 'npm install -g @openai/codex\ncodex',
        },
      },
      {
        heading: '用图片输入生成页面原型',
        content:
          '教程中比较适合设计师和产品经理学习的一段，是把截图或界面参考交给 Codex，让它生成网页原型。这里的重点不是复制截图，而是学会描述目标、保留视觉结构、说明技术栈和验收标准。',
      },
      {
        heading: 'UIcoding 解读',
        content:
          '这篇资料的学习价值在于把 Codex CLI 当成一个可控的本地协作者，而不是一次性生成器。新手练习时可以从一个小页面开始：准备截图、写清楚页面目标、限定文件范围，最后通过浏览器截图和构建结果检查输出。',
      },
    ],
  },
  {
    id: 'designer-ai-coding',
    sourceUrl: '',
    translationMode: 'original',
    title: '设计师如何学习 AI Coding',
    originalTitle: '',
    notice: '',
    sections: [
      {
        heading: '从界面判断开始，而不是从代码开始',
        content:
          '设计师学习 AI 编程，第一步不是背语法，而是把自己熟悉的界面判断表达清楚。比如页面目标是什么、用户先看哪里、哪些信息应该弱化、组件之间应该保持怎样的节奏。当这些判断被写成明确约束，AI 才更容易生成接近预期的页面。',
      },
      {
        heading: '把设计稿拆成可执行的组件任务',
        content:
          '不要一次性要求 AI “做一个完整网站”。更稳定的方式是先拆出页面结构，再拆出组件：导航、Hero、卡片、筛选、空状态、Footer。每个任务都说明内容、状态、间距、响应式和禁止事项，这样修改范围更小，也更容易复盘。',
        visualType: 'landing',
        code: {
          label: '提示词示例',
          content:
            '请只优化首页案例卡片：保持现有数据和路由不变。图片区域固定 16:9，标题最多两行，描述统一两行，标签弱化，底部显示浏览量、点赞量和“查看案例”。完成后运行 npm run build。',
        },
      },
      {
        heading: '用截图和验收标准推动下一轮优化',
        content:
          'AI 生成页面后，设计师最有价值的工作是审查结果：文字是否拥挤，层级是否清楚，按钮是否过重，移动端是否溢出。把这些观察转成下一轮提示词，例如“描述统一两行”“标签视觉弱化”“图片保持 16:9”，比笼统说“高级一点”更有效。',
      },
    ],
  },
  {
    id: 'codex-usage-practices',
    sourceUrl: 'https://developers.openai.com/codex/prompting',
    translationMode: 'guidedTranslation',
    title: 'Codex 使用实践：如何把任务交代清楚',
    originalTitle: 'Prompting Codex',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          'Codex 更适合处理边界清楚、可以验证的工程任务。给它任务时，不只是说“帮我优化页面”，而是说明目标、允许修改的范围、不能改变的内容，以及最后如何判断完成。',
      },
      {
        heading: '关键步骤',
        content:
          '先描述用户目标和当前问题，再列出文件范围、交互要求、视觉约束和验收标准。任务完成后，让 Codex 运行构建、测试或静态检查，并把关键结果反馈给你。',
      },
      {
        heading: 'UIcoding 解读',
        content:
          '对设计师和产品经理来说，最重要的是把“感觉不对”转成可执行约束：间距、层级、按钮状态、响应式表现、不要改动的页面结构。这会显著减少 AI 反复重写的问题。',
      },
    ],
  },
  {
    id: 'cursor-agent-workflow',
    sourceUrl: 'https://docs.cursor.com/agent/overview',
    translationMode: 'guidedTranslation',
    title: 'Cursor Agent 工作流：从需求到多文件修改',
    originalTitle: 'Cursor Agent Documentation',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          'Cursor Agent 的价值在于把编辑器上下文、文件修改和自然语言任务连接起来。它适合多文件的小步迭代，而不是一次性把模糊需求交给 AI 自由发挥。',
      },
      {
        heading: '操作步骤',
        content:
          '先让 Agent 读取相关文件并复述理解，再让它提出修改点。确认后执行代码编辑，最后检查 diff、运行结果和页面表现。每轮任务都尽量保持可回退、可验证。',
      },
      {
        heading: '注意事项',
        content:
          '不要把产品策略、视觉审美和技术边界全部压进一个超长提示词。更稳的方法是分轮沟通：先确认结构，再做细节，再做视觉统一和构建验证。',
      },
    ],
  },
  {
    id: 'cursor-rules-project-standards',
    sourceUrl: 'https://docs.cursor.com/context/rules',
    translationMode: 'guidedTranslation',
    title: 'Cursor Rules 项目规范：让 AI 按你的方式写代码',
    originalTitle: 'Cursor Rules Documentation',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          'Rules 可以把重复说明的项目约束沉淀下来，例如技术栈、目录规范、组件写法、设计变量、禁止事项和验证命令。它让 AI 更像在同一个团队里协作。',
      },
      {
        heading: '推荐实践',
        content:
          '把规则写得短、明确、可执行。优先记录“必须遵守”和“不要做”的内容，例如不要重构目录、不要新增路由、按钮必须复用现有组件、改完必须运行构建。',
      },
      {
        heading: 'UIcoding 解读',
        content:
          '设计师可以把视觉规范也写进 Rules：颜色、圆角、间距、阴影、移动端限制和卡片密度。这样每次让 AI 优化界面时，结果会更接近同一套审美。',
      },
    ],
  },
  {
    id: 'claude-code-best-practices',
    sourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices',
    translationMode: 'guidedTranslation',
    title: 'Claude Code 最佳实践：用 Agent 处理真实代码库',
    originalTitle: 'Claude Code: Best practices for agentic coding',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          'Claude Code 的使用重点是建立上下文、保持人工控制、让任务小步推进。它可以处理真实代码库，但复杂修改仍需要开发者确认计划、权限和最终 diff。',
      },
      {
        heading: '关键步骤',
        content:
          '开始前说明项目目标和限制，让 Agent 先探索必要文件。执行阶段要求它说明修改意图，必要时请求确认。完成后运行测试、构建或 lint，并总结风险。',
      },
      {
        heading: '注意事项',
        content:
          '命令行 Agent 的能力很强，也更需要边界。不要让它无限制修改全项目；对删除文件、安装依赖、改构建配置等动作要格外谨慎。',
      },
    ],
  },
  {
    id: 'v0-ui-prompting-method',
    sourceUrl: 'https://v0.app/docs',
    translationMode: 'guidedTranslation',
    title: 'v0 界面生成方法：从页面意图到组件提示词',
    originalTitle: 'v0 Documentation',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          'v0 更适合把页面想法快速变成 React 界面原型。提示词需要描述页面目的、受众、布局、内容密度、组件状态和视觉风格，而不是只给一个页面名称。',
      },
      {
        heading: '操作步骤',
        content:
          '先写清楚页面要解决什么问题，再列出首屏、内容区、卡片、表单、空状态和移动端表现。生成后不要直接当成最终设计，而是继续统一视觉系统和交互细节。',
      },
      {
        heading: 'UIcoding 解读',
        content:
          '对零基础用户来说，v0 的价值是快速拿到可以讨论的界面。真正提升质量的环节在第二轮：减少装饰、校准文案层级、压缩不必要组件，并补齐真实状态。',
      },
    ],
  },
  {
    id: 'context-engineering-coding-agents',
    sourceUrl: 'https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html',
    translationMode: 'guidedTranslation',
    title: 'Coding Agent 的上下文工程：让 AI 看见正确的信息',
    originalTitle: 'Context engineering for coding agents',
    notice: guidedNotice,
    sections: [
      {
        heading: '核心观点',
        content:
          '对 Coding Agent 来说，单次提示词只是入口，真正影响结果的是上下文质量。上下文包括目标、相关文件、现有约束、测试反馈、错误信息和用户对结果的判断。',
      },
      {
        heading: '推荐实践',
        content:
          '给 Agent 的信息要足够但不过量。先指向相关文件和规则，再要求它解释理解；修改后通过构建、测试、截图或人工审查形成反馈，让下一轮上下文更准确。',
      },
      {
        heading: 'UIcoding 解读',
        content:
          '如果把 AI 编程当成“写一句咒语”，结果会很不稳定。更好的方式是把它当作协作流程：需求、规则、文件、反馈和验收标准共同组成上下文。',
      },
    ],
  },
];
