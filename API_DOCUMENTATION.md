# Careerswarm Public API Documentation

**Version**: 1.0.0  
**Base URL**: `https://api.careerswarm.app/v1`  
**Authentication**: Bearer token

## Overview

The Careerswarm API allows partners to integrate career intelligence into their platforms. Use cases include:
- Job boards adding "Career Match" scores to listings
- ATS systems suggesting candidates based on achievement data
- Career coaching platforms accessing trajectory predictions
- Educational institutions tracking alumni career outcomes

## Authentication

All API requests require an API key passed in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.careerswarm.app/v1/trajectory/predict
```

Get your API key from the [Developer Dashboard](https://careerswarm.app/developers).

## Rate Limits

- **Free Tier**: 100 requests/day
- **Starter**: 1,000 requests/day
- **Professional**: 10,000 requests/day
- **Enterprise**: Custom limits

## Endpoints

### Career Trajectory

#### POST /trajectory/predict

Predict career match percentage for a target role.

**Request Body:**
```json
{
  "user_id": "string",
  "target_role": "Senior Software Engineer",
  "target_company": "Google",
  "job_description": "Optional full JD text"
}
```

**Response:**
```json
{
  "match_percentage": 78,
  "strengths": [
    "5+ years Python experience",
    "Led team of 8 engineers",
    "AWS infrastructure expertise"
  ],
  "gaps": [
    "Kubernetes experience",
    "Machine learning background"
  ],
  "recommendations": [
    "Highlight 'Migrated legacy system to microservices' achievement",
    "Emphasize 'Reduced infrastructure costs by 40%' story"
  ],
  "trajectory_score": 85
}
```

### Achievement Analysis

#### POST /achievements/transform

Transform STAR-format achievement into Google XYZ format.

**Request Body:**
```json
{
  "situation": "Legacy monolithic application causing deployment delays",
  "task": "Modernize architecture to enable faster releases",
  "action": "Led migration to microservices using Docker and Kubernetes",
  "result": "Reduced deployment time from 2 hours to 15 minutes"
}
```

**Response:**
```json
{
  "xyz_accomplishment": "Reduced deployment time by 87.5% (from 2 hours to 15 minutes) by leading migration to microservices architecture using Docker and Kubernetes, enabling the team to ship features 8x faster",
  "impact_score": 88,
  "power_verbs_used": ["Reduced", "Led"],
  "metrics_detected": ["87.5%", "2 hours", "15 minutes", "8x"]
}
```

#### GET /achievements/templates

Get achievement templates by role.

**Query Parameters:**
- `role`: string (required) - e.g., "software_engineer", "product_manager"

**Response:**
```json
{
  "templates": [
    {
      "id": "cost_reduction",
      "title": "Cost Reduction",
      "situation": "Infrastructure costs were growing unsustainably...",
      "task": "Identify and implement cost optimization strategies...",
      "action": "Analyzed AWS spending patterns and...",
      "result": "Reduced monthly costs by X%..."
    }
  ]
}
```

### Job Description Analysis

#### POST /jobs/analyze

Extract structured data from job description text.

**Request Body:**
```json
{
  "job_description_text": "We're looking for a Senior Engineer with 5+ years..."
}
```

**Response:**
```json
{
  "required_skills": ["Python", "AWS", "System Design"],
  "preferred_skills": ["Kubernetes", "Machine Learning"],
  "key_responsibilities": [
    "Design and implement scalable systems",
    "Mentor junior engineers"
  ],
  "experience_level": "Senior (5-8 years)",
  "estimated_salary_range": {
    "min": 150000,
    "max": 200000,
    "currency": "USD"
  }
}
```

### Resume Generation

#### POST /resumes/generate

Generate tailored resume for a specific job.

**Request Body:**
```json
{
  "user_id": "string",
  "job_description_id": "string",
  "format": "markdown" | "pdf"
}
```

**Response:**
```json
{
  "resume_url": "https://cdn.careerswarm.app/resumes/abc123.pdf",
  "selected_achievements": [
    {
      "id": "ach_123",
      "relevance_score": 92,
      "reason": "Directly addresses 'system scalability' requirement"
    }
  ]
}
```

### B2B Talent Search (Enterprise Only)

#### POST /talent/search

Search candidates by achievements.

**Request Body:**
```json
{
  "query": "engineers who reduced infrastructure costs",
  "filters": {
    "skills": ["Python", "AWS"],
    "years_experience": [5, 10],
    "verified_only": true
  },
  "limit": 20
}
```

**Response:**
```json
{
  "matches": [
    {
      "candidate_id": "anon_abc123",
      "match_score": 92,
      "achievements": [
        {
          "title": "Reduced infrastructure costs by 45%",
          "verified": true,
          "skills": ["AWS", "Cost Optimization"],
          "impact_score": 88
        }
      ],
      "trajectory_score": 85,
      "contact_available": true
    }
  ],
  "total": 47
}
```

## Webhooks

Subscribe to events via webhooks:

### Available Events

- `achievement.created` - User adds new achievement
- `resume.generated` - Resume created for job
- `trajectory.calculated` - Career match computed
- `verification.completed` - Achievement verified by colleague

### Webhook Payload

```json
{
  "event": "achievement.created",
  "timestamp": "2026-01-21T18:30:00Z",
  "data": {
    "user_id": "user_123",
    "achievement_id": "ach_456",
    "impact_score": 85
  }
}
```

## SDKs

Official SDKs available:
- **JavaScript/TypeScript**: `npm install @careerswarm/sdk`
- **Python**: `pip install careerswarm`
- **Ruby**: `gem install careerswarm`

### Example (JavaScript)

```javascript
import { Careerswarm } from '@careerswarm/sdk';

const client = new Careerswarm({ apiKey: 'YOUR_API_KEY' });

const prediction = await client.trajectory.predict({
  userId: 'user_123',
  targetRole: 'Senior Engineer',
  targetCompany: 'Google'
});

console.log(`Match: ${prediction.matchPercentage}%`);
```

## Error Handling

Standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

Error response format:
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required parameter: target_role",
    "details": {}
  }
}
```

## Support

- **Documentation**: https://docs.careerswarm.app
- **API Status**: https://status.careerswarm.app
- **Support Email**: api@careerswarm.app
- **Discord Community**: https://discord.gg/careerswarm

## Changelog

### v1.0.0 (2026-01-21)
- Initial public release
- Career trajectory prediction
- Achievement transformation
- Job description analysis
- Resume generation
- B2B talent search (Enterprise)
