# Careerswarm Browser Extension

Analyze any job posting and see your career trajectory match instantly.

## Features

- **Universal Job Analysis**: Works on LinkedIn, Indeed, Glassdoor, ZipRecruiter, and more
- **Instant Career Match**: See your match percentage in real-time
- **Gap Analysis**: Identify missing skills and experience
- **Smart Recommendations**: Get AI-powered suggestions to improve your match
- **One-Click Resume Generation**: Create tailored resumes directly from job postings

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension/chrome` directory
5. The Careerswarm icon should appear in your extensions toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from `browser-extension/firefox` directory
4. The extension will be loaded temporarily (until Firefox restarts)

## Usage

1. Navigate to any job posting on supported sites
2. Click the Careerswarm extension icon
3. Click "Analyze This Page"
4. View your career match percentage and recommendations
5. Click "Generate Resume" to create a tailored resume

## Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- ZipRecruiter
- Monster
- CareerBuilder
- Greenhouse
- Lever
- Workday
- iCIMS

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `content.js`: Injected script that analyzes job pages
- `content.css`: Styling for the floating widget
- `popup.html/js`: Extension popup interface
- `background.js`: Service worker for API communication

## Privacy

The extension only analyzes job postings when you explicitly click "Analyze". No data is collected or sent without your action.

## Support

For issues or feature requests, visit https://careerswarm.app/support
