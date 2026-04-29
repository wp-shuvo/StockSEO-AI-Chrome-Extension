const BACKEND_URL = 'http://localhost:5000';

// Observer to watch for image cards in Adobe Stock
const observer = new MutationObserver(() => {
  injectButtons();
});

observer.observe(document.body, { childList: true, subtree: true });

function injectButtons() {
  // Broad selectors for Adobe Stock contributor and search pages
  const imageCards = document.querySelectorAll('.thumb-frame, .contributor-item, .search-result-cell, .thumbnail-card, .thumbnail-wrapper, .media-item, .item-card, [class*="thumbnail"]'); 

  imageCards.forEach(card => {
    if (card.querySelector('.stock-seo-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'stock-seo-btn';
    btn.innerText = 'Generate SEO';
    btn.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      pointer-events: auto;
    `;

    btn.onmouseover = () => {
      btn.style.transform = 'translateX(-50%) translateY(-2px)';
      btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'translateX(-50%)';
      btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
    };

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const img = card.querySelector('img');
      const imageUrl = img ? img.src : '';

      if (!imageUrl) {
        alert('Could not find image URL');
        return;
      }

      handleGeneration(imageUrl, btn);
    });

    card.style.position = 'relative';
    card.appendChild(btn);
  });
}

async function handleGeneration(imageUrl, btn) {
  const { token } = await chrome.storage.local.get('token');

  if (!token) {
    alert('Please login via the extension popup first.');
    return;
  }

  const originalText = btn.innerText;
  btn.innerText = 'Generating...';
  btn.disabled = true;

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
      alert('SEO Metadata Generated! Open the extension popup to view and copy results.');
    } else {
      alert(data.message || 'Generation failed');
    }
  } catch (error) {
    console.error('Generation error:', error);
    alert('Network error. Check console.');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}
