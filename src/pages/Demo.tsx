// Demo page component
import DemoLayout from '../layouts/DemoLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Typography from '../components/ui/Typography';

// Button Demo Section
const ButtonsSection = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div>
      <Typography variant="h3" className="mb-4" style={{ color: 'white' }}>Button Variants</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>
    </div>

    <div>
      <Typography variant="h3" className="mb-4" style={{ color: 'white' }}>Button Sizes</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>

    <div>
      <Typography variant="h3" className="mb-4" style={{ color: 'white' }}>Button States</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <Typography variant="h1" style={{ color: 'white' }}>Heading 1</Typography>
    <Typography variant="h2" style={{ color: 'white' }}>Heading 2</Typography>
    <Typography variant="h3" style={{ color: 'white' }}>Heading 3</Typography>
    <Typography variant="h4" style={{ color: 'white' }}>Heading 4</Typography>
    <Typography variant="body" style={{ color: 'rgb(157, 167, 177)' }}>Body text - This is regular paragraph text.</Typography>
    <Typography variant="body-sm" style={{ color: 'rgb(157, 167, 177)' }}>Small body text - This is smaller paragraph text.</Typography>
    <Typography variant="caption" style={{ color: 'rgb(157, 167, 177)' }}>Caption text - This is caption text usually used for supplementary information.</Typography>
    <Typography variant="h2" isGradient>Gradient Heading</Typography>
  </div>
);

// Card Demo Section
const CardsSection = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <Card title="Basic Card">
        <Typography style={{ color: 'rgb(157, 167, 177)' }}>This is a basic card with a title.</Typography>
      </Card>
      
      <Card isHoverable>
        <Typography variant="h4" style={{ color: 'white', marginBottom: '8px' }}>Hoverable Card</Typography>
        <Typography style={{ color: 'rgb(157, 167, 177)' }}>This card has a hover effect. Try hovering over it!</Typography>
      </Card>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <Card isGradientBorder>
        <Typography variant="h4" style={{ color: 'white', marginBottom: '8px' }}>Gradient Border Card</Typography>
        <Typography style={{ color: 'rgb(157, 167, 177)' }}>This card has a gradient border effect.</Typography>
      </Card>
      
      <Card className="gradient-primary" style={{ background: 'linear-gradient(135deg, rgba(0,122,255,0.1), rgba(0,102,215,0.1))' }}>
        <Typography variant="h4" style={{ color: 'white', marginBottom: '8px' }}>Custom Background Card</Typography>
        <Typography style={{ color: 'rgb(157, 167, 177)' }}>This card has a custom gradient background applied via style.</Typography>
      </Card>
    </div>
  </div>
);

// Main Demo Page Component
const Demo = () => {
  const sections = [
    { id: 'buttons', title: 'Buttons', component: <ButtonsSection /> },
    { id: 'typography', title: 'Typography', component: <TypographySection /> },
    { id: 'cards', title: 'Cards', component: <CardsSection /> },
  ];

  return <DemoLayout sections={sections} />;
};

export default Demo;