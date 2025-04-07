import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from './MainLayout';

interface DemoSection {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface DemoLayoutProps {
  sections: DemoSection[];
}

const DemoLayout: React.FC<DemoLayoutProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  return (
    <MainLayout>
      <div className="block-container">
        <div className="block-content">
          <div style={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            <nav style={{ 
              display: 'flex',
              overflowX: 'auto',
              gap: '8px',
              paddingBottom: '8px'
            }}>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    padding: '8px 16px',
                    background: activeSection === section.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                    color: activeSection === section.id ? 'rgb(0, 122, 255)' : 'rgb(157, 167, 177)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '14px'
                  }}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ padding: '0 8px' }}>
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: activeSection === section.id ? 1 : 0,
                  y: activeSection === section.id ? 0 : 20,
                  display: activeSection === section.id ? 'block' : 'none',
                }}
                transition={{ duration: 0.3 }}
              >
                {section.component}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoLayout;