#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const dataPath = path.join(rootDir, 'src/data.js');
const contentPath = path.join(rootDir, 'src/content/learningContent.js');

const defaultQueries = [
  'Codex tutorial best practices AI coding workflow',
  'Claude Code tutorial best practices agentic coding',
  'AI coding real world workflow Codex Claude Code case study',
];

const allowedTopics = [
  'codex',
  'claude code',
  'ai coding',
  'agentic coding',
  'coding agent',
  'ai software development',
];

const seedCandidates = [
  {
    title: 'Best practices - Codex',
    url: 'https://developers.openai.com/codex/learn/best-practices',
    snippet: 'OpenAI Codex best practices for planning, prompting, AGENTS.md, MCP, skills and workflows.',
    provider: 'seed',
  },
  {
    title: 'Prompting Codex',
    url: 'https://developers.openai.com/codex/prompting',
    snippet: 'OpenAI guidance on writing clear tasks, constraints and validation instructions for Codex.',
    provider: 'seed',
  },
  {
    title: 'openai/codex README',
    url: 'https://github.com/openai/codex',
    snippet: 'Official Codex CLI repository with installation, quickstart and local coding agent workflow.',
    provider: 'seed',
  },
  {
    title: 'Claude Code: Best practices for agentic coding',
    url: 'https://www.anthropic.com/engineering/claude-code-best-practices',
    snippet: 'Anthropic engineering article on using Claude Code for real codebases and agentic coding.',
    provider: 'seed',
  },
  {
    title: 'Claude Code common workflows',
    url: 'https://docs.anthropic.com/en/docs/claude-code/common-workflows',
    snippet: 'Common Claude Code workflows for understanding projects, making changes and validating results.',
    provider: 'seed',
  },
  {
    title: 'Claude Code memory',
    url: 'https://docs.anthropic.com/en/docs/claude-code/memory',
    snippet: 'How Claude Code remembers project context and stores durable project rules.',
    provider: 'seed',
  },
  {
    title: 'Context engineering for coding agents',
    url: 'https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html',
    snippet: 'Martin Fowler article on context engineering for coding agents and real AI coding workflows.',
    provider: 'seed',
  },
  {
    title: 'OpenAI Codex CLI Tutorial',
    url: 'https://www.datacamp.com/tutorial/open-ai-codex-cli-tutorial',
    snippet: 'DataCamp beginner tutorial for installing and using OpenAI Codex CLI.',
    provider: 'seed',
  },
];

const guidedNotice =
  '本文为 UIcoding 基于外部资料整理的中文学习稿，不是原文逐字全文翻译。请访问原始来源查看完整内容。';

const strictNotice =
  '本文为 UIcoding 基于已确认许可来源整理的中文翻译稿，尽量保留原文结构和内容。请访问原始来源查看完整内容。';

function printUsage() {
  console.log(`Usage:
  npm run learning:discover -- --query "Codex tutorial"
  npm run learning:import -- --url https://example.com/article --write
  npm run learning:auto -- --query "Claude Code best practices" --write

Commands:
  search       Find candidate articles.
  extract      Fetch and parse one URL, then print article structure.
  import       Fetch one URL, generate Chinese learning detail data, optionally write files.
  auto         Search, pick the highest-scored candidate, then import it.

Options:
  --query <text>            Search query. Can be repeated.
  --url <url>               Source article URL for extract/import.
  --write                   Write to src/data.js and src/content/learningContent.js.
  --translation <mode>      guided or strict. Default: guided.
  --license <value>         permitted, unknown, or a license name. Strict mode requires permitted.
  --model <model>           OpenAI model. Defaults to OPENAI_MODEL or gpt-5-mini.
  --max-results <number>    Search result count. Default: 8.
  --no-llm                  For extract/search testing only; import requires an LLM.

Environment:
  OPENAI_API_KEY            Required for import/auto generation.
  OPENAI_MODEL              Optional model override.
  BRAVE_SEARCH_API_KEY      Optional search provider.
  BING_SEARCH_API_KEY       Optional search provider.

Copyright guard:
  guided mode preserves source heading order and meaning, but writes a Chinese learning稿.
  strict full translation is blocked unless --license permitted is provided.`);
}

function parseArgs(argv) {
  const args = {
    command: 'search',
    queries: [],
    maxResults: 8,
    translation: 'guided',
    license: 'unknown',
    write: false,
    noLlm: false,
  };

  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      args.help = true;
    } else if (token === '--query' || token === '-q') {
      args.queries.push(argv[++index]);
    } else if (token === '--url') {
      args.url = argv[++index];
    } else if (token === '--write') {
      args.write = true;
    } else if (token === '--translation') {
      args.translation = argv[++index] || 'guided';
    } else if (token === '--license') {
      args.license = argv[++index] || 'unknown';
    } else if (token === '--model') {
      args.model = argv[++index];
    } else if (token === '--max-results') {
      args.maxResults = Number(argv[++index] || 8);
    } else if (token === '--no-llm') {
      args.noLlm = true;
    } else if (token.startsWith('--')) {
      throw new Error(`Unknown option: ${token}`);
    } else {
      positional.push(token);
    }
  }

  if (positional[0]) {
    args.command = positional[0];
  }

  if (args.queries.length === 0) {
    args.queries = defaultQueries;
  }

  return args;
}

function decodeEntities(value = '') {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => named[name.toLowerCase()] ?? `&${name};`);
}

function stripTags(html = '') {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  );
}

function cleanText(value = '') {
  return decodeEntities(value)
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || `article-${Date.now()}`;
}

function absolutizeUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function uniqBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.7',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }

  return response.text();
}

function scoreCandidate(candidate) {
  const haystack = `${candidate.title || ''} ${candidate.snippet || ''} ${candidate.url || ''}`.toLowerCase();
  const query = (candidate.query || '').toLowerCase();
  let score = 0;

  const queryTerms = query
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4 && !['best', 'real'].includes(term));
  for (const term of queryTerms) {
    if (haystack.includes(term)) score += 6;
  }

  if (query.includes('claude') && !haystack.includes('claude')) score -= 30;
  if (query.includes('codex') && !haystack.includes('codex')) score -= 30;
  if (query.includes('cursor') && !haystack.includes('cursor')) score -= 30;
  if (query.includes('cli') && !haystack.includes('cli')) score -= 10;
  if (query.includes('workflow') && haystack.includes('workflow')) score += 8;
  if (query.includes('tutorial') && haystack.includes('tutorial')) score += 8;

  for (const topic of allowedTopics) {
    if (haystack.includes(topic)) score += 18;
  }

  for (const word of ['tutorial', 'guide', 'best practices', 'workflow', 'case study', 'real world', 'hands-on']) {
    if (haystack.includes(word)) score += 10;
  }

  for (const trusted of [
    'developers.openai.com',
    'github.com/openai',
    'anthropic.com',
    'docs.anthropic.com',
    'martinfowler.com',
  ]) {
    if ((candidate.url || '').includes(trusted)) score += 8;
  }

  if (/\/tag\/|\/category\/|\/author\/|\/search/.test(candidate.url || '')) {
    score -= 16;
  }

  return score;
}

function normalizeDuckDuckGoUrl(url) {
  try {
    const parsed = new URL(decodeEntities(url));
    const uddg = parsed.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : parsed.toString();
  } catch {
    return decodeEntities(url);
  }
}

async function searchDuckDuckGo(query, maxResults) {
  const html = await fetchText(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
  const results = [];
  const regex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) && results.length < maxResults) {
    results.push({
      title: stripTags(match[2]),
      url: normalizeDuckDuckGoUrl(match[1]),
      snippet: stripTags(match[3]),
      provider: 'duckduckgo',
    });
  }

  if (results.length === 0) {
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{20,220}?)<\/a>/gi;
    while ((match = linkRegex.exec(html)) && results.length < maxResults) {
      const url = normalizeDuckDuckGoUrl(match[1]);
      if (!/^https?:\/\//.test(url)) continue;
      results.push({
        title: stripTags(match[2]),
        url,
        snippet: '',
        provider: 'duckduckgo',
      });
    }
  }

  return results;
}

async function searchBrave(query, maxResults) {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];

  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
    {
      headers: {
        accept: 'application/json',
        'x-subscription-token': key,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Brave search failed ${response.status}`);
  }

  const json = await response.json();
  return (json.web?.results || []).map((item) => ({
    title: cleanText(item.title || ''),
    url: item.url,
    snippet: cleanText(item.description || ''),
    provider: 'brave',
  }));
}

async function searchBing(query, maxResults) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return [];

  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
    {
      headers: {
        accept: 'application/json',
        'Ocp-Apim-Subscription-Key': key,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Bing search failed ${response.status}`);
  }

  const json = await response.json();
  return (json.webPages?.value || []).map((item) => ({
    title: cleanText(item.name || ''),
    url: item.url,
    snippet: cleanText(item.snippet || ''),
    provider: 'bing',
  }));
}

async function searchArticles(queries, maxResults) {
  const allResults = [];
  for (const query of queries) {
    const providerResults = [
      ...(await searchBrave(query, maxResults).catch(() => [])),
      ...(await searchBing(query, maxResults).catch(() => [])),
    ];

    if (providerResults.length === 0) {
      providerResults.push(...(await searchDuckDuckGo(query, maxResults).catch(() => [])));
    }

    allResults.push(...providerResults.map((item) => ({ ...item, query })));
  }

  const sourceResults = allResults.length > 0
    ? allResults
    : seedCandidates.flatMap((item) =>
        queries.map((query) => ({
          ...item,
          query,
        })),
      );

  return uniqBy(sourceResults, (item) => item.url)
    .map((item) => ({
      ...item,
      score: scoreCandidate(item),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

function pickMeta(html, selectors) {
  for (const selector of selectors) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexes = [
      new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
    ];
    for (const regex of regexes) {
      const match = html.match(regex);
      if (match?.[1]) return cleanText(match[1]);
    }
  }

  return '';
}

function pickTag(html, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match ? stripTags(match[1]) : '';
}

function pickAttr(html, selectorRegex, attrName) {
  const match = html.match(selectorRegex);
  if (!match?.[0]) return '';
  const attrRegex = new RegExp(`${attrName}=["']([^"']+)["']`, 'i');
  return cleanText(match[0].match(attrRegex)?.[1] || '');
}

function extractMainHtml(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(nav|footer|aside|form|button)[\s\S]*?<\/\1>/gi, '');

  for (const tag of ['article', 'main']) {
    const match = cleaned.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'i'));
    if (match?.[0]) return match[0];
  }

  const body = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body?.[1] || cleaned;
}

function detectLicense(html, explicitLicense) {
  if (explicitLicense && explicitLicense !== 'unknown') return explicitLicense;

  const licenseMeta = pickMeta(html, ['license', 'dc.rights', 'rights']);
  const text = cleanText(stripTags(html)).slice(0, 12000).toLowerCase();
  const permissiveHints = [
    'creative commons',
    'cc by',
    'cc-by',
    'apache license',
    'apache-2.0',
    'mit license',
    'public domain',
  ];

  if (licenseMeta) return licenseMeta;
  if (permissiveHints.some((hint) => text.includes(hint))) return 'possible-permissive';

  return '未确认';
}

function extractSections(mainHtml, fallbackTitle) {
  const tokenRegex = /<(h[1-3]|p|pre|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  const sections = [];
  let current = { heading: '', blocks: [] };
  let match;

  const commit = () => {
    if (current.heading || current.blocks.length > 0) {
      sections.push(current);
    }
    current = { heading: '', blocks: [] };
  };

  while ((match = tokenRegex.exec(mainHtml))) {
    const tag = match[1].toLowerCase();
    const inner = match[2];

    if (tag.startsWith('h')) {
      const heading = stripTags(inner);
      if (!heading || heading === fallbackTitle) continue;
      commit();
      current.heading = heading;
      continue;
    }

    if (tag === 'pre') {
      const code = stripTags(inner);
      if (code) {
        current.blocks.push({
          type: 'code',
          label: '原文代码片段',
          content: code,
        });
      }
      continue;
    }

    const text = stripTags(inner);
    if (text.length < 20) continue;

    current.blocks.push({
      type: 'paragraph',
      content: text,
    });
  }

  commit();

  if (sections.length === 0) {
    const paragraphs = stripTags(mainHtml)
      .split(/\n{2,}/)
      .map((item) => cleanText(item))
      .filter((item) => item.length > 40)
      .slice(0, 18);

    return [
      {
        heading: fallbackTitle || '文章内容',
        blocks: paragraphs.map((paragraph) => ({
          type: 'paragraph',
          content: paragraph,
        })),
      },
    ];
  }

  return sections.slice(0, 28);
}

async function extractArticle(url, license = 'unknown') {
  const html = await fetchText(url);
  const canonical =
    pickAttr(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, 'href') ||
    pickAttr(html, /<link[^>]+href=["'][^"']+["'][^>]+rel=["']canonical["'][^>]*>/i, 'href') ||
    url;
  const canonicalUrl = absolutizeUrl(canonical, url);
  const title = pickMeta(html, ['og:title', 'twitter:title']) || pickTag(html, 'title');
  const description = pickMeta(html, ['description', 'og:description', 'twitter:description']);
  const siteName = pickMeta(html, ['og:site_name']) || new URL(canonicalUrl).hostname.replace(/^www\./, '');
  const author = pickMeta(html, ['author', 'article:author', 'twitter:creator']);
  const image = pickMeta(html, ['og:image', 'twitter:image']);
  const mainHtml = extractMainHtml(html);
  const sections = extractSections(mainHtml, title);

  return {
    url: canonicalUrl,
    title: cleanText(title),
    description: cleanText(description),
    siteName: cleanText(siteName),
    author: cleanText(author),
    image: image ? absolutizeUrl(image, canonicalUrl) : '',
    license: detectLicense(html, license),
    sections,
    extractedAt: new Date().toISOString(),
  };
}

function compactArticleForModel(article) {
  const maxChars = 24000;
  let used = 0;

  const sections = [];
  for (const section of article.sections) {
    if (used >= maxChars) break;

    const blocks = [];
    for (const block of section.blocks || []) {
      const content = cleanText(block.content || '').slice(0, block.type === 'code' ? 1400 : 2200);
      if (!content) continue;
      if (used + content.length > maxChars) break;
      used += content.length;
      blocks.push({ ...block, content });
    }

    if (section.heading || blocks.length > 0) {
      sections.push({
        heading: section.heading,
        blocks,
      });
    }
  }

  return {
    ...article,
    sections,
  };
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1]);

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error('Model did not return JSON.');
}

async function generateLearningData(article, options) {
  if (options.noLlm) {
    throw new Error('import requires an LLM. Remove --no-llm or use extract/search.');
  }

  const translationMode = options.translation || 'guided';
  if (translationMode === 'strict' && options.license !== 'permitted') {
    throw new Error('Strict full translation requires --license permitted. Use guided mode for unconfirmed sources.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for import/auto generation.');
  }

  const model = options.model || process.env.OPENAI_MODEL || 'gpt-5-mini';
  const collectedAt = new Date().toISOString().slice(0, 10);
  const source = compactArticleForModel(article);

  const prompt = {
    task: 'Create UIcoding.ai learning detail data from an English source article.',
    translationMode,
    copyrightRules:
      translationMode === 'strict'
        ? 'The user says the source is permitted. Translate accurately into professional, easy Chinese. Preserve the original heading structure and content order. Do not add unrelated commentary.'
        : 'The source license is not confirmed. Do not produce a full verbatim translation. Preserve the source heading order and core ideas, but write a professional Chinese learning稿 in UIcoding voice. Keep it faithful, clear, and easy for designers/product managers/indie developers.',
    outputRules: [
      'Return JSON only.',
      'Do not include Markdown outside JSON.',
      'Use Chinese for title, description, notice, section headings, paragraphs, keyTakeaways, tags when appropriate.',
      'Keep originalTitle in English.',
      'Every section should use blocks: [{ type: "paragraph", content }, { type: "code", label, content }].',
      'Preserve the source section order. Do not invent claims not supported by the source.',
      'Add the original source URL to the first section as a paragraph.',
      'Make Chinese professional, readable, and beginner-friendly.',
    ],
    projectDataShape: {
      lesson: {
        id: 'slug id',
        title: 'Chinese title',
        originalTitle: source.title,
        description: 'Chinese summary, 60-110 Chinese chars',
        sourceType: '官方文档 | 官方博客 | 开发者教程 | 开发者文章',
        sourceName: source.siteName,
        sourceUrl: source.url,
        author: source.author || source.siteName,
        license: options.license === 'permitted' ? source.license : '未确认',
        translationMode,
        collectedAt,
        audience: '零基础学习者 | 设计师 | 产品经理 | 独立开发者',
        duration: 'N 分钟',
        category: 'Workflow | Agent | Prompt | UI Design | 上线部署',
        tools: ['Codex or Claude Code or 通用'],
        tags: ['3-4 tags'],
        href: '/learn/<id>',
        image: 'Use source image if meaningful, otherwise one of /learn-covers/codex-best-practices.svg, /learn-covers/codex-cli-basics.svg, /learn-covers/claude-code-workflows.svg',
        imageAlt: 'Chinese alt text',
        publishedAt: collectedAt,
        viewCount: 520,
        likeCount: 35,
        featured: false,
        external: true,
        keyTakeaways: ['3 Chinese takeaways'],
      },
      content: {
        id: 'same as lesson.id',
        sourceUrl: source.url,
        translationMode,
        title: 'same as lesson.title',
        originalTitle: source.title,
        notice: translationMode === 'strict' ? strictNotice : guidedNotice,
        sections: [],
      },
    },
    source,
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a careful Chinese editor for UIcoding.ai. You produce valid JSON data for a React learning page. Follow copyright constraints exactly.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
      max_output_tokens: 9000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed ${response.status}: ${errorText.slice(0, 500)}`);
  }

  const json = await response.json();
  const outputText =
    json.output_text ||
    json.output
      ?.flatMap((item) => item.content || [])
      .map((item) => item.text || '')
      .join('') ||
    '';

  const data = extractJson(outputText);
  return normalizeGeneratedData(data, article, options, collectedAt);
}

function normalizeGeneratedData(data, article, options, collectedAt) {
  const lesson = data.lesson || {};
  const content = data.content || {};
  const id = slugify(lesson.id || lesson.title || article.title);
  const sourceUrl = article.url;
  const tools = Array.isArray(lesson.tools) && lesson.tools.length > 0 ? lesson.tools : inferTools(article);
  const title = lesson.title || `中文学习：${article.title}`;
  const image = lesson.image || chooseCover(tools, article.image);

  return {
    lesson: {
      id,
      title,
      originalTitle: lesson.originalTitle || article.title,
      description: lesson.description || article.description || title,
      sourceType: lesson.sourceType || '开发者文章',
      sourceName: lesson.sourceName || article.siteName,
      sourceUrl,
      author: lesson.author || article.author || article.siteName,
      license: options.license === 'permitted' ? article.license : '未确认',
      translationMode: options.translation,
      collectedAt,
      audience: lesson.audience || '独立开发者',
      duration: lesson.duration || estimateDuration(content.sections),
      category: lesson.category || inferCategory(article),
      tools,
      tags: Array.isArray(lesson.tags) ? lesson.tags.slice(0, 5) : tools,
      href: `/learn/${id}`,
      image,
      imageAlt: lesson.imageAlt || `${title} 封面图`,
      publishedAt: collectedAt,
      viewCount: Number(lesson.viewCount) || randomBetween(520, 920),
      likeCount: Number(lesson.likeCount) || randomBetween(32, 68),
      featured: Boolean(lesson.featured),
      external: true,
      keyTakeaways: Array.isArray(lesson.keyTakeaways)
        ? lesson.keyTakeaways.slice(0, 3)
        : ['理解文章核心方法', '拆成可执行步骤', '用验证闭环落地'],
    },
    content: {
      id,
      sourceUrl,
      translationMode: options.translation,
      title,
      originalTitle: content.originalTitle || article.title,
      notice: content.notice || (options.translation === 'strict' ? strictNotice : guidedNotice),
      sections: Array.isArray(content.sections) ? content.sections : [],
    },
  };
}

function inferTools(article) {
  const text = `${article.title} ${article.description} ${article.url}`.toLowerCase();
  if (text.includes('claude code')) return ['Claude Code'];
  if (text.includes('codex')) return ['Codex'];
  return ['通用'];
}

function inferCategory(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (text.includes('prompt')) return 'Prompt';
  if (text.includes('ui') || text.includes('interface')) return 'UI Design';
  if (text.includes('agent')) return 'Agent';
  return 'Workflow';
}

function chooseCover(tools, sourceImage) {
  if (sourceImage && /^https?:\/\//.test(sourceImage)) return sourceImage;
  if (tools.includes('Claude Code')) return '/learn-covers/claude-code-workflows.svg';
  if (tools.includes('Codex')) return '/learn-covers/codex-best-practices.svg';
  return '/learn-covers/codex-cli-basics.svg';
}

function estimateDuration(sections = []) {
  const chars = JSON.stringify(sections).length;
  const minutes = Math.max(6, Math.min(32, Math.round(chars / 650)));
  return `${minutes} 分钟`;
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function findArrayBounds(text, exportName) {
  const marker = `export const ${exportName} = [`;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error(`Could not find export array ${exportName}`);
  }

  const openIndex = text.indexOf('[', markerIndex);
  let depth = 0;
  let stringQuote = '';
  let escaped = false;

  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];

    if (stringQuote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === stringQuote) {
        stringQuote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      stringQuote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return { openIndex, closeIndex: index };
      }
    }
  }

  throw new Error(`Could not find closing bracket for ${exportName}`);
}

function formatObjectForArray(object) {
  return JSON.stringify(object, null, 2)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
}

async function appendToExportArray(filePath, exportName, object) {
  const text = await fs.readFile(filePath, 'utf8');
  if (text.includes(`"id": "${object.id}"`) || text.includes(`id: '${object.id}'`)) {
    throw new Error(`An item with id "${object.id}" already exists in ${path.basename(filePath)}.`);
  }

  const { closeIndex } = findArrayBounds(text, exportName);
  const before = text.slice(0, closeIndex).trimEnd();
  const after = text.slice(closeIndex);
  const needsComma = before.endsWith('[') ? '' : ',';
  const nextText = `${before}${needsComma}\n${formatObjectForArray(object)}\n${after}`;
  await fs.writeFile(filePath, nextText);
}

async function writeLearningFiles(generated) {
  await appendToExportArray(dataPath, 'lessons', generated.lesson);
  await appendToExportArray(contentPath, 'learningContent', generated.content);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  if (args.command === 'search') {
    const results = await searchArticles(args.queries, args.maxResults);
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (args.command === 'extract') {
    if (!args.url) throw new Error('--url is required for extract');
    const article = await extractArticle(args.url, args.license);
    console.log(JSON.stringify(article, null, 2));
    return;
  }

  if (args.command === 'auto') {
    const results = await searchArticles(args.queries, args.maxResults);
    const candidate = results[0];
    if (!candidate) throw new Error('No suitable candidate found.');
    console.error(`Selected: ${candidate.title} (${candidate.url})`);
    args.url = candidate.url;
  }

  if (args.command === 'import' || args.command === 'auto') {
    if (!args.url) throw new Error('--url is required for import');
    const article = await extractArticle(args.url, args.license);
    const generated = await generateLearningData(article, args);

    if (args.write) {
      await writeLearningFiles(generated);
      console.log(
        JSON.stringify(
          {
            status: 'written',
            href: generated.lesson.href,
            id: generated.lesson.id,
            sourceUrl: generated.lesson.sourceUrl,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(JSON.stringify({ status: 'dry-run', ...generated }, null, 2));
    }
    return;
  }

  throw new Error(`Unknown command: ${args.command}`);
}

run().catch((error) => {
  console.error(`learning import failed: ${error.message}`);
  process.exitCode = 1;
});
