# Careerswarm Email Integration

Forward recruiter emails to get instant career match analysis.

## How It Works

1. **Get Your Personal Email Address**: Each user gets a unique forwarding address: `{username}@jobs.careerswarm.app`

2. **Forward Recruiter Emails**: When you receive a job opportunity via email, forward it to your Careerswarm address

3. **Instant Analysis**: Our AI extracts the job description, analyzes your match, and emails you back with:
   - Career match percentage
   - Strengths and gaps
   - Recommended achievements to highlight
   - Link to generate tailored resume

## Setup

### For Users

1. Log in to Careerswarm
2. Go to Settings → Email Integration
3. Copy your personal forwarding address
4. Add it to your contacts for easy forwarding

### For Developers

Email integration requires:

- Email parsing service (e.g., SendGrid Inbound Parse, Mailgun Routes, AWS SES)
- Webhook endpoint to receive parsed emails
- Job description extraction from email body
- Career trajectory analysis
- Email response generation

## Implementation

The system uses webhooks to receive forwarded emails:

```
POST /api/email/inbound
{
  "from": "recruiter@company.com",
  "to": "user123@jobs.careerswarm.app",
  "subject": "Exciting opportunity at TechCorp",
  "text": "Full email body with job description...",
  "html": "<html>...</html>"
}
```

Processing flow:

1. Verify recipient email matches a Careerswarm user
2. Extract job description from email body using AI
3. Run career trajectory prediction
4. Generate analysis report
5. Send response email with results

## Email Template

```
Subject: Your Career Match for {Job Title} at {Company}

Hi {Name},

We analyzed the job opportunity you forwarded:

🎯 Career Match: 78%

✅ Your Strengths:
• 5+ years Python experience (Required)
• Led team of 8 engineers (Preferred)
• AWS infrastructure expertise (Required)

⚠️ Potential Gaps:
• Kubernetes experience (Preferred)
• Machine learning background (Nice-to-have)

💡 Recommendations:
1. Highlight your "Migrated legacy system to microservices" achievement
2. Emphasize your "Reduced infrastructure costs by 40%" story
3. Consider adding a Kubernetes certification to your profile

[Generate Tailored Resume] [View Full Analysis]

---
Careerswarm - Transform Your Achievements Into Powerful Resumes
```

## Privacy & Security

- Emails are processed in real-time and not stored permanently
- Only job-related content is extracted
- Personal information is never shared
- Users can disable email integration anytime

## Future Enhancements

- Auto-reply to recruiters with availability
- Schedule follow-up reminders
- Track application status via email
- Integration with email clients (Gmail, Outlook plugins)
