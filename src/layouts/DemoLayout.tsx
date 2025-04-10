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
          <div className="border-b border-white/10 pb-4 mb-6">
            <nav className="flex overflow-x-auto gap-2 pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    py-2 px-4 
                    border-none rounded-md cursor-pointer whitespace-nowrap text-sm
                    ${activeSection === section.id 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-transparent text-neutral-400 hover:text-blue-400'}
                  `}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-2">
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