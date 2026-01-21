// Careerswarm Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Careerswarm extension installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeJob') {
    // Forward to Careerswarm API
    fetch('https://3000-i9gyfqjd276sbiyfs99wv-0795b75c.us2.manus.computer/api/trpc/intelligence.predictTrajectory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request.data)
    })
    .then(response => response.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep channel open for async response
  }
});
