import { describe, it, expect } from 'vitest';
import { mainNavigation, siteConfig } from '../siteMetadata';

describe('siteMetadata', () => {
  describe('mainNavigation', () => {
    it('contains the correct navigation items', () => {
      expect(mainNavigation).toBeInstanceOf(Array);
      expect(mainNavigation.length).toBeGreaterThan(0);
      
      // Check structure of navigation items
      mainNavigation.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('path');
        expect(typeof item.name).toBe('string');
        expect(typeof item.path).toBe('string');
        // Icon is optional
        if (item.icon) {
          expect(typeof item.icon).toBe('string');
        }
      });
      
      // Check for specific navigation items
      const homeItem = mainNavigation.find(item => item.name === 'Home');
      expect(homeItem).toBeDefined();
      expect(homeItem?.path).toBe('/');
      
      const exploreItem = mainNavigation.find(item => item.name === 'Explore');
      expect(exploreItem).toBeDefined();
      expect(exploreItem?.path).toBe('/explore');
    });
  });
  
  describe('siteConfig', () => {
    it('contains the correct site configuration', () => {
      expect(siteConfig).toBeInstanceOf(Object);
      
      // Check required properties
      expect(siteConfig).toHaveProperty('name');
      expect(siteConfig).toHaveProperty('description');
      expect(siteConfig).toHaveProperty('logo');
      expect(siteConfig).toHaveProperty('apiUrl');
      expect(siteConfig).toHaveProperty('branding');
      expect(siteConfig).toHaveProperty('socialLinks');
      
      // Check branding colors
      expect(siteConfig.branding).toHaveProperty('primaryColor');
      expect(siteConfig.branding).toHaveProperty('secondaryColor');
      expect(siteConfig.branding).toHaveProperty('accentColor');
      expect(siteConfig.branding).toHaveProperty('errorColor');
      
      // Check social links
      expect(siteConfig.socialLinks).toHaveProperty('twitter');
      expect(siteConfig.socialLinks).toHaveProperty('github');
      expect(siteConfig.socialLinks).toHaveProperty('linkedin');
    });
  });
});