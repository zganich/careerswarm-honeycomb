// Careerswarm Browser Extension - Content Script
// Injects career intelligence into job posting pages

(function() {
  'use strict';

  const API_BASE = 'https://3000-i9gyfqjd276sbiyfs99wv-0795b75c.us2.manus.computer/api/trpc';
  
  // Extract job description from current page
  function extractJobDescription() {
    const url = window.location.href;
    let title = '';
    let company = '';
    let description = '';

    // LinkedIn
    if (url.includes('linkedin.com')) {
      title = document.querySelector('.top-card-layout__title, h1.topcard__title')?.textContent?.trim() || '';
      company = document.querySelector('.topcard__org-name-link, .topcard__flavor')?.textContent?.trim() || '';
      description = document.querySelector('.description__text, .show-more-less-html__markup')?.textContent?.trim() || '';
    }
    // Indeed
    else if (url.includes('indeed.com')) {
      title = document.querySelector('.jobsearch-JobInfoHeader-title, h1')?.textContent?.trim() || '';
      company = document.querySelector('.icl-u-lg-mr--sm, .jobsearch-InlineCompanyRating-companyHeader a')?.textContent?.trim() || '';
      description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.textContent?.trim() || '';
    }
    // Generic fallback
    else {
      title = document.querySelector('h1')?.textContent?.trim() || '';
      company = document.querySelector('[class*="company"], [class*="Company"]')?.textContent?.trim() || '';
      description = document.querySelector('main, [role="main"], article')?.textContent?.trim() || document.body.textContent.trim();
    }

    return {
      url,
      title,
      company,
      description: description.replace(/\s+/g, ' ').trim()
    };
  }

  // Create floating widget
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'careerswarm-widget';
    widget.innerHTML = `
      <div class="cs-widget-header">
        <div class="cs-logo">🎯 Careerswarm</div>
        <button class="cs-close" title="Close">&times;</button>
      </div>
      <div class="cs-widget-body">
        <div class="cs-loading">Analyzing job posting...</div>
        <div class="cs-content" style="display: none;">
          <div class="cs-match-score">
            <div class="cs-score-label">Career Match</div>
            <div class="cs-score-value">--</div>
          </div>
          <div class="cs-details">
            <div class="cs-section">
              <h4>✅ Strengths</h4>
              <ul class="cs-list cs-strengths"></ul>
            </div>
            <div class="cs-section">
              <h4>⚠️ Gaps</h4>
              <ul class="cs-list cs-gaps"></ul>
            </div>
            <div class="cs-section">
              <h4>💡 Recommendations</h4>
              <ul class="cs-list cs-recommendations"></ul>
            </div>
          </div>
          <div class="cs-actions">
            <button class="cs-btn cs-btn-primary">Generate Resume</button>
            <button class="cs-btn cs-btn-secondary">View Full Analysis</button>
          </div>
        </div>
        <div class="cs-error" style="display: none;">
          <p>Please log in to Careerswarm to see your career match.</p>
          <button class="cs-btn cs-btn-primary cs-login">Log In</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);

    // Event listeners
    widget.querySelector('.cs-close').addEventListener('click', () => {
      widget.style.display = 'none';
    });

    widget.querySelector('.cs-login')?.addEventListener('click', () => {
      window.open('https://3000-i9gyfqjd276sbiyfs99wv-0795b75c.us2.manus.computer', '_blank');
    });

    widget.querySelector('.cs-btn-primary')?.addEventListener('click', () => {
      chrome.storage.local.get(['jobData'], (result) => {
        if (result.jobData) {
          window.open(`https://3000-i9gyfqjd276sbiyfs99wv-0795b75c.us2.manus.computer/resumes?job=${encodeURIComponent(result.jobData.title)}`, '_blank');
        }
      });
    });

    widget.querySelector('.cs-btn-secondary')?.addEventListener('click', () => {
      window.open('https://3000-i9gyfqjd276sbiyfs99wv-0795b75c.us2.manus.computer/dashboard', '_blank');
    });

    return widget;
  }

  // Analyze job and update widget
  async function analyzeJob() {
    const jobData = extractJobDescription();
    
    if (!jobData.description || jobData.description.length < 100) {
      console.log('[Careerswarm] Job description too short or not found');
      return;
    }

    // Store job data
    chrome.storage.local.set({ jobData });

    const widget = createWidget();
    
    try {
      // Call trajectory prediction API
      const response = await fetch(`${API_BASE}/intelligence.predictTrajectory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          targetRole: jobData.title,
          targetCompany: jobData.company,
        })
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      const result = data.result.data;

      // Update widget with results
      widget.querySelector('.cs-loading').style.display = 'none';
      widget.querySelector('.cs-content').style.display = 'block';
      
      widget.querySelector('.cs-score-value').textContent = `${result.matchPercentage}%`;
      widget.querySelector('.cs-score-value').style.color = 
        result.matchPercentage >= 70 ? '#10b981' : result.matchPercentage >= 50 ? '#f59e0b' : '#ef4444';

      const strengthsList = widget.querySelector('.cs-strengths');
      result.strengths.slice(0, 3).forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
      });

      const gapsList = widget.querySelector('.cs-gaps');
      result.gaps.slice(0, 3).forEach(gap => {
        const li = document.createElement('li');
        li.textContent = gap;
        gapsList.appendChild(li);
      });

      const recsList = widget.querySelector('.cs-recommendations');
      result.recommendations.slice(0, 2).forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recsList.appendChild(li);
      });

    } catch (error) {
      console.error('[Careerswarm] Analysis failed:', error);
      widget.querySelector('.cs-loading').style.display = 'none';
      widget.querySelector('.cs-error').style.display = 'block';
    }
  }

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeJob);
  } else {
    analyzeJob();
  }

})();
