# Careerswarm Talent Intelligence (B2B)

**For Recruiters & Hiring Managers**: Access aggregated career evidence data to find better candidates faster.

## Value Proposition

Traditional recruiting relies on resumes - static documents that don't reveal the full story. Careerswarm provides access to **structured achievement data** from thousands of candidates who've documented their career evidence using our platform.

### What You Get

1. **Skills-Based Search**: Find candidates by proven achievements, not just keywords
   - "Show me engineers who reduced infrastructure costs by >30%"
   - "Find PMs who launched products with 1M+ users"

2. **Achievement Verification**: See which accomplishments are verified by colleagues/managers

3. **Career Trajectory Insights**: Understand candidate growth patterns and potential

4. **Gap Analysis**: Identify candidates who are 80% matches but trainable for the remaining 20%

5. **Benchmark Data**: Compare candidate achievements against industry standards

## Privacy & Ethics

- **Opt-in Only**: Candidates explicitly choose to make their profiles searchable
- **Anonymized by Default**: Initial search results show achievements without names
- **Candidate Control**: Users can hide specific achievements or go fully private anytime
- **No Scraping**: All data comes from users who voluntarily created Master Profiles

## Pricing Tiers

### Starter - $299/month
- 50 candidate profile views/month
- Basic achievement search
- Email support

### Professional - $799/month
- 200 candidate profile views/month
- Advanced filters (verified achievements, trajectory scoring)
- Skills gap analysis
- Priority support

### Enterprise - Custom
- Unlimited profile views
- API access
- Custom integrations (ATS, HRIS)
- Dedicated account manager
- White-label options

## Use Cases

### Tech Recruiting
"Find senior engineers who've scaled systems to handle 10M+ requests/day"

### Sales Hiring
"Show me sales reps who exceeded quota by >150% for 3+ consecutive years"

### Executive Search
"Find leaders who've built teams from 0 to 50+ people"

### Diversity Hiring
"Identify high-potential candidates from underrepresented backgrounds with proven track records"

## Dashboard Features

### Search Interface
- Natural language queries powered by AI
- Filter by skills, industries, companies, achievement types
- Save searches and get alerts for new matches

### Candidate Profiles
- Achievement timeline with context (company, role, dates)
- Skills proven through evidence, not self-reported
- Verification badges from colleagues
- Career trajectory score and growth potential

### Analytics
- Talent market insights (e.g., "Average Python engineer has 3.2 years experience")
- Salary benchmarking based on achievement quality
- Skills gap trends across industries

### Integration
- Export candidates to your ATS
- API for programmatic access
- Webhook notifications for new matches

## Getting Started

1. **Sign Up**: Create a recruiter account at careerswarm.app/recruiters
2. **Verify Company**: Confirm your employer email address
3. **Start Searching**: Use natural language to find candidates
4. **Contact Candidates**: Reach out through our platform (candidates control visibility)

## API Access (Enterprise Only)

```bash
POST /api/v1/talent/search
Authorization: Bearer {api_key}

{
  "query": "engineers who reduced costs",
  "filters": {
    "skills": ["Python", "AWS"],
    "years_experience": [5, 10],
    "verified_only": true
  },
  "limit": 20
}
```

Response:
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
  ]
}
```

## Roadmap

- **Q1 2026**: Launch beta with 100 recruiters
- **Q2 2026**: ATS integrations (Greenhouse, Lever, Workday)
- **Q3 2026**: Predictive hiring (AI suggests candidates before you search)
- **Q4 2026**: Skills marketplace (candidates offer consulting based on achievements)

## Support

- Email: recruiters@careerswarm.app
- Demo: https://careerswarm.app/demo
- Documentation: https://docs.careerswarm.app/b2b
