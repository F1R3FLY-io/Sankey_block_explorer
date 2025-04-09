// Site navigation metadata
export interface NavItem {
  name: string;
  path: string;
  icon?: string;
}

export const mainNavigation: NavItem[] = [
  //TODO ask Diana about 'header' or main navigation, will we have something?
  {
    name: 'Home',
    path: '/',
    icon: 'home',
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: 'Explore',
    path: '/explore',
    icon: 'explore',
  },
  {
    name: 'About',
    path: '/about',
    icon: 'info',
  },
  {
    name: 'Contact',
    path: '/contact',
    icon: 'email',
  },
];

export const siteConfig = {
  name: 'Sankey Block Explorer',
  description: 'A Sankey diagram block explorer for energy flows',
  logo: '/src/assets/f1r3fly-io-logo-bg.png',
  apiUrl: '/api',
  branding: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    accentColor: '#28a745',
    errorColor: '#dc3545',
    warningColor: '#FFA500',
  },
  socialLinks: {
    twitter: 'https://twitter.com/example',
    github: 'https://github.com/example',
    linkedin: 'https://linkedin.com/example',
  },
};
