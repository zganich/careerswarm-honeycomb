# Changelog

All notable changes to CareerSwarm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Auto-trigger Pivot Analysis for cross-industry applications
- Export Career Transition Report as PDF
- Analytics dashboard showing success rate trends
- Keyboard shortcuts for navigation (Cmd+K, number keys)
- Mobile navigation optimization with swipe gestures

---

## [1.4.1] - 2026-02-04

### Fixed
- **Production E2E Tests**: Fixed 12 failing tests with correct UI selectors
  - Logout test: Fixed URL matching logic for post-logout redirect
  - Onboarding tests: Fixed `isAttached()` → `count()` for Playwright locators
  - Onboarding tests: Added ES module support for `__dirname` 
  - Dashboard test: Made locators resilient with spinner wait and flexible content detection
  - Core features tests: Added onboarding redirect handling for new users
  - Resume Roast test: Changed from file upload to textarea (matches actual UI)
  - Pricing test: Fixed button text matchers ("Start Pro Trial" vs "upgrade")

### Tests
- **Production E2E**: 18/18 passing
- **Production Smoke**: 22/22 passing (desktop + mobile)
- All public pages verified: Homepage, Login, Roast, Pricing, FAQ, Privacy, Terms, Recruiters

---

## [1.4.0] - 2026-02-02

### Added
- **Master Profile Sections**: Languages, volunteer experiences, projects, publications, security clearances, licenses, portfolio URLs
- **DB Function Aliases**: `createLanguage`, `createVolunteerExperience`, `createProject`, `createPublication`, `createSecurityClearance`
- **GTM/JD Builder Stubs**: Placeholder functions for B2B features

### Fixed
- **37 TypeScript Errors**: Resolved all type errors across codebase
- **Migration 0015 Idempotent**: Safe to re-run with `IF NOT EXISTS` checks
- **Test Environment**: Vitest now loads `.env` file for tests
- **Graceful Test Skipping**: Tests skip when env vars/API keys missing
- **Portfolio URLs Type**: Handles both `string[]` and `{label, url}[]` formats

### Changed
- Improved error handling in resume parser (distinguishes DB vs LLM errors)
- Archived 45 outdated handoff/testing documents to `.archive/`
- Streamlined documentation structure

### Tests
- 129 passing, 42 skipped (env-dependent)
- Added test user setup/teardown in profile-sections.test.ts

---

## [1.3.0] - 2026-01-25

### Added
- **Auth Bypass for E2E Tests**: Implemented `bypassLogin()` utility to inject mock session cookies, eliminating OAuth redirect flakiness in Playwright tests
- **Test Suite Optimization**: Restricted Playwright to chromium-only with video recording enabled for all tests
- **Navigation Modernization**: Added active route highlighting in sidebar and PageHeader component with contextual back buttons
- **Navigation Hotfix**: Fixed dead ends on `/jobs` and other pages by ensuring DashboardLayout wraps all internal routes

### Changed
- Updated Playwright configuration to record videos for all test runs (`video: 'on'`)
- Commented out webkit and mobile browser projects in Playwright config to avoid browser installation failures
- Improved test reliability: 20/22 tests passing (2 skipped for external dependencies)

### Fixed
- Strict mode violation in auth test (multiple "Sign In" buttons)
- Achievement button test failure (selector and wait logic improved)
- Navigation dead ends across all internal pages

---

## [1.2.0] - 2026-01-21

### Added
- **Pivot Analyzer (Phase 11)**: Implemented Career Path Intelligence with Bridge Skills logic to help users pivot careers
  - Identifies 3-5 transferable skills (e.g., Sales → Strategy)
  - Provides strategic framing for each bridge skill
  - Enforces "no fluff words" constraint
  - Added Career Path tab to ApplicationDetailModal
- **E2E Testing with Playwright**: Created comprehensive test suite for authentication and achievement flows
  - `tests/auth.spec.ts` - Authentication flows (login, logout, session persistence)
  - `tests/achievements.spec.ts` - STAR wizard, achievement CRUD, Impact Meter
- **Pivot Analyzer Tests**: 7 vitest tests validating bridge skill identification and strategic framing

### Changed
- Updated ApplicationDetailModal with new Career Path tab displaying bridge skills and pivot strategy

---

## [1.1.0] - 2026-01-20

### Added
- **ATS Compatibility Agent (Phase 14)**: Implemented resume scoring for automated system parsing
  - Analyzes formatting issues (columns, tables, graphics)
  - Checks keyword density against job description
  - Verifies standard section headings
  - Provides actionable recommendations
  - Visual ATS score display (0-100) with color coding
- **Intelligence Fleet UI (Phases 10 & 11)**: Added Success Predictor and Skill Gap analysis to Application Detail Modal
  - Success Gauge with circular progress ring
  - Green flags and red flags display
  - Skill Gap analysis with missing skills list
  - Upskilling plan with actionable recommendations
- **ATS Analysis Sidebar**: Integrated ATS Check directly into ResumePreview.tsx with visual gauge, formatting checklist, and keyword badges

### Changed
- Updated `generated_resumes` table schema with `atsAnalysis` JSON column
- Updated `applications` table schema with `analytics` JSON column for Success Predictor and Skill Gap data

### Tests Added
- 13 ATS compatibility tests (formatting, keyword matching, recommendations)
- 9 Intelligence Fleet tests (success prediction, skill gap analysis)

---

## [1.0.0] - 2026-01-15

### Added
- **7-Stage Agent Pipeline**: Complete implementation of Scout → Qualifier → Profiler → Tailor → Scribe → Success Predictor → Skill Gap Analyzer
- **Application Tracker (Swarm Board)**: Kanban-style board with drag-and-drop functionality
- **Resume Generation**: AI-powered resume tailoring based on achievements and job descriptions
- **Resume Roaster**: Public endpoint for resume critique without authentication
- **Achievement Management**: STAR format with Impact Meter and transformation to XYZ format
- **Job Search**: Scout agent scrapes job descriptions from URLs or manual input
- **Database Schema**: 14 tables (users, achievements, jobs, applications, generatedResumes, companies, contacts, skills, etc.)
- **Authentication**: Manus OAuth integration with protected/public procedures
- **Comprehensive Testing**: 127 vitest tests covering all backend procedures

### Infrastructure
- React 19 + Tailwind 4 + tRPC 11 stack
- Express 4 backend with type-safe APIs
- Drizzle ORM with MySQL/TiDB database
- S3 storage integration for file uploads
- Stripe payment integration (test mode)
- Manus built-in Forge API for LLM access

---

## [0.1.0] - Initial Development

### Added
- Project scaffolding with tRPC + Manus Auth + Database template
- Basic authentication flow with Manus OAuth
- Initial database schema design
- Development environment setup

---

## Version History

- **v1.4.0** (749d158) - TypeScript Fixes, Master Profile Sections, Documentation Cleanup
- **v1.3.0** (c2bc14ad) - Auth Bypass & Navigation Fixes
- **v1.2.0** (8ee11914) - Pivot Analyzer & E2E Tests
- **v1.1.0** (6bcb909a) - ATS Agent & Intelligence Fleet UI
- **v1.0.0** (bd7165c9) - Initial Production Release
- **v0.1.0** (b3ca93a6) - Project Initialization

---

## GitHub Repository

https://github.com/zganich/careerswarm-honeycomb

---

## Contributing

When adding new features or fixing bugs:
1. Update todo.md with tasks
2. Implement changes with tests
3. Update this CHANGELOG.md
4. Update CONTEXT_FOR_NEW_CHAT.md if architecture changes
5. Create checkpoint with descriptive message
6. Push to GitHub

---

## License

Proprietary - All Rights Reserved
