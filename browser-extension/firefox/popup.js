// Careerswarm Extension Popup Script

const API_BASE = "https://careerswarm.com";

// Check login status
async function checkLoginStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/trpc/auth.me`, {
      credentials: "include",
    });
    const data = await response.json();

    if (data.result.data) {
      document.getElementById("status-text").textContent =
        `Logged in as ${data.result.data.name || data.result.data.email}`;
      document.getElementById("status").style.background = "#d1fae5";
      document.getElementById("status").style.color = "#065f46";
    } else {
      document.getElementById("status-text").textContent = "Not logged in";
      document.getElementById("status").style.background = "#fee2e2";
      document.getElementById("status").style.color = "#991b1b";
    }
  } catch (error) {
    document.getElementById("status-text").textContent = "Unable to connect";
  }
}

// Analyze current page
document.getElementById("analyze").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (
    !tab.url.includes("linkedin.com") &&
    !tab.url.includes("indeed.com") &&
    !tab.url.includes("glassdoor.com") &&
    !tab.url.includes("ziprecruiter.com")
  ) {
    alert(
      "Please navigate to a job posting on LinkedIn, Indeed, Glassdoor, or other job sites."
    );
    return;
  }

  // Inject content script if not already injected
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content.css"],
    });
  } catch (error) {
    console.log("Content script already injected or error:", error);
  }

  window.close();
});

// Open dashboard
document.getElementById("dashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/dashboard` });
});

// Initialize
checkLoginStatus();
