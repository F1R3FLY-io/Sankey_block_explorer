// Demo page component
import DemoLayout from '../layouts/DemoLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Typography from '../components/ui/Typography';
import BlockCard from '../components/BlockCard';
import SankeyDiagram from '../components/SankeyDiagram';
import {
  mockBlock,
  mockBlock650,
  mockBlock651,
  mockDeploys,
  mockDeploysWithPattern,
  mockDeploysWithInternalConsumption,
  mockDeploysWithMixedPatterns
} from '../test/mocks';

// Button Demo Section
const ButtonsSection = () => (
  <div className="flex flex-col gap-8">
    <div>
      <Typography variant="h3" className="mb-4 text-white">Button Variants</Typography>
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>
    </div>

    <div>
      <Typography variant="h3" className="mb-4 text-white">Button Sizes</Typography>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>

    <div>
      <Typography variant="h3" className="mb-4 text-white">Button States</Typography>
      <div className="flex flex-wrap gap-4">
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button isGradient>Gradient</Button>
        <Button leftIcon={<span>👈</span>}>With Left Icon</Button>
        <Button rightIcon={<span>👉</span>}>With Right Icon</Button>
      </div>
    </div>
  </div>
);

// Typography Demo Section
const TypographySection = () => (
  <div className="flex flex-col gap-6">
    <Typography variant="h1" className="text-white">Heading 1</Typography>
    <Typography variant="h2" className="text-white">Heading 2</Typography>
    <Typography variant="h3" className="text-white">Heading 3</Typography>
    <Typography variant="h4" className="text-white">Heading 4</Typography>
    <Typography variant="body" className="text-neutral-400">Body text - This is regular paragraph text.</Typography>
    <Typography variant="body-sm" className="text-neutral-400">Small body text - This is smaller paragraph text.</Typography>
    <Typography variant="caption" className="text-neutral-400">Caption text - This is caption text usually used for supplementary information.</Typography>
    <Typography variant="h2" isGradient>Gradient Heading</Typography>
  </div>
);

// BlockCard Demo Section
const BlockCardSection = () => {
  const handleNavigate = (direction: string) => {
    console.log(`Navigation: ${direction}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <Typography variant="h3" className="mb-4 text-white">BlockCard - Standard View</Typography>
      <div className="max-w-[1000px]">
        <BlockCard
          block={mockBlock}
          deploys={mockDeploys}
          currentBlock={2}
          totalBlocks={5}
          onNavigate={handleNavigate}
        />
      </div>

      <Typography variant="h3" className="mb-4 text-white">BlockCard - With Transfer Patterns</Typography>
      <div className="max-w-[1000px]">
        <BlockCard
          block={mockBlock}
          deploys={mockDeploysWithPattern}
          currentBlock={3}
          totalBlocks={5}
          onNavigate={handleNavigate}
        />
      </div>

      <Typography variant="h3" className="mb-4 text-white">
        BlockCard - Block #650 - Internal Phlo Consumption
      </Typography>
      <Typography variant="body" className="mb-4 text-yellow-500 italic">
        This block demonstrates internal Phlo consumption with Rholang code execution. This visualization shows flow from input nodes (left)
        through a processing pipeline to output nodes (right), exactly matching the specification.
      </Typography>
      <div className="max-w-[1000px]">
        <BlockCard
          block={mockBlock650}
          deploys={mockDeploysWithInternalConsumption}
          currentBlock={650}
          totalBlocks={700}
          onNavigate={handleNavigate}
          hasInternalConsumption={true}
        />
      </div>

      <Typography variant="h3" className="mb-4 text-white">
        BlockCard - Block #651 - Mixed (Internal + External)
      </Typography>
      <Typography variant="body" className="mb-4 text-yellow-500 italic">
        This block demonstrates both internal Phlo consumption AND external transfers.
        Note both regular links and the orange self-referential link for internal consumption.
      </Typography>
      <div className="max-w-[1000px]">
        <BlockCard
          block={mockBlock651}
          deploys={mockDeploysWithMixedPatterns}
          currentBlock={651}
          totalBlocks={700}
          onNavigate={handleNavigate}
          hasInternalConsumption={true}
        />
      </div>

      <Typography variant="h3" className="mb-4 text-white">BlockCard - First Block</Typography>
      <div className="max-w-[1000px]">
        <BlockCard
          block={mockBlock}
          deploys={mockDeploys}
          currentBlock={1}
          totalBlocks={5}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

// SankeyDiagram Demo Section
const SankeyDiagramSection = () => {
  // Simple example nodes and links
  const nodes = [
    { id: 'node1', name: 'Node 1', value: 100, color: '#ff5c5c' },
    { id: 'node2', name: 'Node 2', value: 200, color: '#5c5cff' },
    { id: 'node3', name: 'Node 3', value: 150, color: '#5cff5c' },
    { id: 'node4', name: 'Node 4', value: 80, color: '#ffff5c' }
  ];

  const simpleLinks = [
    { source: 'node1', target: 'node2', value: 100, color: '#ff5c5c', details: 'Link from Node 1 to Node 2' },
    { source: 'node2', target: 'node3', value: 80, color: '#5c5cff', details: 'Link from Node 2 to Node 3' },
    { source: 'node1', target: 'node4', value: 30, color: '#ff5c5c', details: 'Link from Node 1 to Node 4' }
  ];

  const parallelLinks = [
    { source: 'node1', target: 'node1', value: 100, color: '#ff5c5c', details: 'Self-referencing link for Node 1' },
    { source: 'node2', target: 'node2', value: 200, color: '#5c5cff', details: 'Self-referencing link for Node 2' },
    { source: 'node3', target: 'node3', value: 150, color: '#5cff5c', details: 'Self-referencing link for Node 3' }
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Typography variant="h3" className="mb-4 text-white">SankeyDiagram - Basic Example</Typography>
        <Card className="h-[400px]">
          <SankeyDiagram
            nodes={nodes}
            links={simpleLinks}
            options={{
              node: { opacity: 0.8 },
              link: { opacity: 0.5 }
            }}
          />
        </Card>
      </div>

      <div>
        <Typography variant="h3" className="mb-4 text-white">SankeyDiagram - Parallel Links</Typography>
        <Card className="h-[400px]">
          <SankeyDiagram
            nodes={nodes}
            links={parallelLinks}
            options={{
              node: { opacity: 1 },
              link: { opacity: 0.3 }
            }}
          />
        </Card>
      </div>
    </div>
  );
};

// Main Demo Page Component
const Demo = () => {
  const sections = [
    { id: 'buttons', title: 'Buttons', component: <ButtonsSection /> },
    { id: 'typography', title: 'Typography', component: <TypographySection /> },
    { id: 'blockcard', title: 'Block Card', component: <BlockCardSection /> },
    { id: 'sankeydiagram', title: 'Sankey Diagram', component: <SankeyDiagramSection /> },
  ];

  return <DemoLayout sections={sections} />;
};

export default Demo;
