import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Profile Sections CRUD', () => {
  const testUserId = 1; // Use existing test user

  describe('Languages', () => {
    it('should insert and retrieve languages', async () => {
      await db.insertLanguage({
        userId: testUserId,
        language: 'Spanish',
        proficiency: 'Fluent',
        isNative: false,
      });

      const languages = await db.getUserLanguages(testUserId);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages[0].language).toBe('Spanish');
      expect(languages[0].proficiency).toBe('Fluent');
    });
  });

  describe('Volunteer Experiences', () => {
    it('should insert and retrieve volunteer experiences', async () => {
      await db.insertVolunteerExperience({
        userId: testUserId,
        organization: 'Red Cross',
        role: 'Volunteer Coordinator',
        startDate: 'Jan 2020',
        endDate: 'Dec 2022',
        description: 'Coordinated disaster relief efforts',
      });

      const experiences = await db.getUserVolunteerExperiences(testUserId);
      expect(experiences.length).toBeGreaterThan(0);
      expect(experiences[0].organization).toBe('Red Cross');
      expect(experiences[0].role).toBe('Volunteer Coordinator');
    });
  });

  describe('Projects', () => {
    it('should insert and retrieve projects', async () => {
      await db.insertProject({
        userId: testUserId,
        name: 'Open Source Contribution',
        description: 'Contributed to React core',
        url: 'https://github.com/facebook/react',
        role: 'Contributor',
        startDate: 'Jan 2023',
        endDate: 'Present',
      });

      const projects = await db.getUserProjects(testUserId);
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0].name).toBe('Open Source Contribution');
      expect(projects[0].url).toBe('https://github.com/facebook/react');
    });
  });

  describe('Publications', () => {
    it('should insert and retrieve publications', async () => {
      await db.insertPublication({
        userId: testUserId,
        title: 'Machine Learning in Production',
        publisherOrVenue: 'IEEE',
        year: 2023,
        url: 'https://ieee.org/paper/123',
        context: 'Conference paper on ML deployment',
      });

      const publications = await db.getUserPublications(testUserId);
      expect(publications.length).toBeGreaterThan(0);
      expect(publications[0].title).toBe('Machine Learning in Production');
      expect(publications[0].year).toBe(2023);
    });
  });

  describe('Security Clearances', () => {
    it('should insert and retrieve security clearances', async () => {
      await db.insertSecurityClearance({
        userId: testUserId,
        clearanceType: 'Top Secret',
        level: 'TS/SCI',
        expiryDate: 'Dec 2025',
      });

      const clearances = await db.getUserSecurityClearances(testUserId);
      expect(clearances.length).toBeGreaterThan(0);
      expect(clearances[0].clearanceType).toBe('Top Secret');
      expect(clearances[0].level).toBe('TS/SCI');
    });
  });
});
