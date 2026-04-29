const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('login-view');
  const mainView = document.getElementById('main-view');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userName = document.getElementById('user-name');
  const usageCount = document.getElementById('usage-count');

  const { token, user, lastResult } = await chrome.storage.local.get(['token', 'user', 'lastResult']);

  if (token) {
    showMainView(user);
    if (lastResult) renderResult(lastResult);
  } else {
    showLoginView();
  }

  loginBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'login' }, (response) => {
      if (response && response.success) {
        showMainView(response.user);
      } else {
        alert('Login failed: ' + (response ? response.error : 'Unknown error'));
      }
    });
  });

  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.clear();
    showLoginView();
  });

  // Listen for new results from content script
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.lastResult) {
      renderResult(changes.lastResult.newValue);
    }
  });

  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const seoTitle = document.getElementById('seo-title');
  const seoKeywords = document.getElementById('seo-keywords');
  const resultsContainer = document.getElementById('results-container');

  copyBtn.addEventListener('click', () => {
    const text = `Title: ${seoTitle.value}\nKeywords: ${seoKeywords.value}`;
    navigator.clipboard.writeText(text);
    const originalText = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    setTimeout(() => copyBtn.innerText = originalText, 2000);
  });

  downloadBtn.addEventListener('click', () => {
    const title = seoTitle.value;
    const keywords = seoKeywords.value.split(',').map(k => k.trim());
    const csvContent = formatCSV(title, keywords);
    downloadFile(`stock-seo-${Date.now()}.csv`, csvContent);
  });

  function showLoginView() {
    loginView.classList.remove('hidden');
    mainView.classList.add('hidden');
  }

  const detectBtn = document.getElementById('detect-btn');
  const detectionBox = document.getElementById('detection-box');

  detectBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('adobe.com')) {
      alert('Please use this on an Adobe Stock page.');
      return;
    }

    detectBtn.innerText = 'Searching...';
    detectBtn.disabled = true;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Find the selected image on the contributor page
        const selectedImage = document.querySelector('.media-item.selected img, .thumbnail-card.selected img, .is-selected img, .selected img, [class*="selected"] img');
        if (selectedImage) return selectedImage.src;
        
        // Fallback to first major image if none selected
        const firstImage = document.querySelector('.thumb-frame img, .media-item img, .item-card img');
        return firstImage ? firstImage.src : null;
      }
    }, (results) => {
      detectBtn.innerText = 'Auto-Detect & Generate';
      detectBtn.disabled = false;

      if (results && results[0] && results[0].result) {
        startGeneration(results[0].result);
      } else {
        alert('Could not detect any image on the page. Please select an image first.');
      }
    });
  });

  async function startGeneration(imageUrl) {
    const { token } = await chrome.storage.local.get('token');
    if (!token) {
      alert('Please login first.');
      return;
    }

    resultsContainer.classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    detectionBox.classList.add('hidden');

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();
      if (response.ok) {
        await chrome.storage.local.set({ lastResult: data });
        renderResult(data);
      } else {
        alert(data.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Check if backend is running.');
    } finally {
      document.getElementById('loading').classList.add('hidden');
      detectionBox.classList.remove('hidden');
    }
  }

  function renderResult(result) {
    if (!result) return;
    resultsContainer.classList.remove('hidden');
    detectionBox.classList.add('hidden'); // Hide detection when results are shown
    seoTitle.value = result.title || '';
    seoKeywords.value = (result.keywords || []).join(', ');
  }
});
