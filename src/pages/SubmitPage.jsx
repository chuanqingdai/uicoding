import { useState } from 'react';
import { Container } from '../components/Layout.jsx';
import { Button, Card } from '../components/UI.jsx';

const initialFormData = {
  title: '',
  websiteUrl: '',
  category: '',
  tools: [],
  description: '',
  buildProcess: '',
  learningPoints: '',
  screenshotUrl: '',
  submitterName: '',
  role: '',
  email: '',
  wechat: '',
  douyin: '',
  xiaohongshu: '',
};

const categories = ['Dashboard', 'Landing Page', 'CRM', 'Prompt Tool', 'SaaS'];
const toolOptions = ['Codex', 'Cursor', 'Claude Code', 'Lovable', 'v0', 'Bolt', 'Replit', 'Trae'];

export default function SubmitPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const toggleTool = (tool) => {
    setFormData((current) => {
      const hasTool = current.tools.includes(tool);
      const tools = hasTool
        ? current.tools.filter((item) => item !== tool)
        : [...current.tools, tool];

      return { ...current, tools };
    });
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError('请填写作品名称。');
      return;
    }

    if (!formData.category) {
      setError('请选择作品类型。');
      return;
    }

    if (formData.tools.length === 0) {
      setError('请选择至少一个使用工具。');
      return;
    }

    if (!formData.description.trim()) {
      setError('请填写作品简介。');
      return;
    }

    if (!formData.submitterName.trim()) {
      setError('请填写你的名称。');
      return;
    }

    localStorage.setItem('uicoding_submit_draft', JSON.stringify(formData));
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="submit-page">
        <Container>
          <div className="submit-shell">
            <Card className="submit-success">
              <h1>已收到你的作品信息</h1>
              <p>当前为前端演示版本，真实提交功能将在后续开放。</p>
              <Button href="/">返回首页</Button>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="submit-page">
      <Container>
        <div className="submit-shell">
          <div className="submit-copy">
            <h1>提交你的 AI Coding 作品</h1>
            <p>
              分享你用 Codex、Cursor、Claude Code、Lovable、v0 等工具完成的作品，帮助更多人学习真实的 AI Coding 构建过程。
            </p>
            <p>当前为前端演示版本，提交内容暂不会发送到服务器。</p>
          </div>

          <Card className="submit-card">
            <form className="submit-form" onSubmit={handleSubmit}>
              <section className="submit-group">
                <h2>作品信息</h2>
                <div className="submit-grid">
                  <label className="submit-field">
                    <span>作品名称</span>
                    <input
                      name="title"
                      onChange={(event) => updateField('title', event.target.value)}
                      placeholder="例如：FlowPilot 数据看板"
                      required
                      type="text"
                      value={formData.title}
                    />
                  </label>
                  <label className="submit-field">
                    <span>作品链接</span>
                    <input
                      name="websiteUrl"
                      onChange={(event) => updateField('websiteUrl', event.target.value)}
                      placeholder="https://example.com/"
                      type="url"
                      value={formData.websiteUrl}
                    />
                  </label>
                  <label className="submit-field">
                    <span>作品类型</span>
                    <select
                      name="category"
                      onChange={(event) => updateField('category', event.target.value)}
                      required
                      value={formData.category}
                    >
                      <option value="">请选择作品类型</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="submit-field">
                    <span>使用工具</span>
                    <div className="submit-checkboxes">
                      {toolOptions.map((tool) => (
                        <label key={tool}>
                          <input
                            checked={formData.tools.includes(tool)}
                            onChange={() => toggleTool(tool)}
                            type="checkbox"
                          />
                          <span>{tool}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="submit-field">
                    <span>作品简介</span>
                    <textarea
                      maxLength={200}
                      name="description"
                      onChange={(event) => updateField('description', event.target.value)}
                      placeholder="简单介绍这个作品解决什么问题、主要功能是什么"
                      required
                      value={formData.description}
                    />
                  </label>
                </div>
              </section>

              <section className="submit-group">
                <h2>案例说明</h2>
                <div className="submit-grid">
                  <label className="submit-field">
                    <span>构建过程</span>
                    <textarea
                      name="buildProcess"
                      onChange={(event) => updateField('buildProcess', event.target.value)}
                      placeholder="简单描述你如何用 AI Coding 完成这个作品"
                      value={formData.buildProcess}
                    />
                  </label>
                  <label className="submit-field">
                    <span>可以学习什么</span>
                    <textarea
                      name="learningPoints"
                      onChange={(event) => updateField('learningPoints', event.target.value)}
                      placeholder="例如：组件拆分、提示词设计、页面结构、视觉优化"
                      value={formData.learningPoints}
                    />
                  </label>
                  <label className="submit-field">
                    <span>截图链接</span>
                    <input
                      name="screenshotUrl"
                      onChange={(event) => updateField('screenshotUrl', event.target.value)}
                      placeholder="可填写作品截图链接，后续会支持上传"
                      type="url"
                      value={formData.screenshotUrl}
                    />
                  </label>
                </div>
                <p className="submit-note">当前不要实现真实图片上传，只保留截图链接输入框。</p>
              </section>

              <section className="submit-group">
                <h2>提交者信息</h2>
                <div className="submit-grid">
                  {[
                    ['submitterName', '你的名称', '例如：David', 'text', true],
                    ['role', '身份介绍', '例如：独立开发者 / 设计师 / 产品经理', 'text', false],
                    ['email', '邮箱', 'hello@example.com', 'email', false],
                    ['wechat', '微信', '可选', 'text', false],
                    ['douyin', '抖音账号', '可选', 'text', false],
                    ['xiaohongshu', '小红书账号', '可选', 'text', false],
                  ].map(([name, label, placeholder, type, required]) => (
                    <label className="submit-field" key={name}>
                      <span>{label}</span>
                      <input
                        name={name}
                        onChange={(event) => updateField(name, event.target.value)}
                        placeholder={placeholder}
                        required={required}
                        type={type}
                        value={formData[name]}
                      />
                    </label>
                  ))}
                </div>
              </section>

              {error && <p className="submit-error">{error}</p>}
              <Button type="submit">提交作品</Button>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
