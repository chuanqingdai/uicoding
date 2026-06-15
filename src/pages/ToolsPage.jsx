import { tools } from '../data.js';
import { Container, Section } from '../components/Layout.jsx';
import { ToolPill } from '../components/Cards.jsx';

export default function ToolsPage() {
  return (
    <div className="tools-page">
      <section className="tools-hero">
        <Container>
          <h1>AI Coding 工具</h1>
          <p>
            了解常用 AI Coding 工具的定位、适合场景和使用方式，快速找到适合自己的开发工作流。
          </p>
        </Container>
      </section>

      <Section>
        <div className="tools-grid">
          {tools.map((tool) => (
            <ToolPill {...tool} key={tool.id} />
          ))}
        </div>
      </Section>
    </div>
  );
}
