const guidedNotice =
  '本文为 UIcoding 基于外部资料整理的中文学习笔记，不是原文全文翻译。请访问原始来源查看完整内容。';

export const learningContent = [
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
