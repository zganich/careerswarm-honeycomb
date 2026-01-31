---
paths:
  - "database.py"
  - "main.py"
---
# Growth Flywheel Logic
- Referrers get 30 days of premium when a referred user completes their first resume ingestion.
- Users earn 10 credits for reporting an "Offer" and 5 for a "Rejection."
- Ensure `UserCredits` are updated atomically to prevent race conditions.
