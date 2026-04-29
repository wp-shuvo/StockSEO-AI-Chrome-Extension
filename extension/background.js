const BACKEND_URL = 'http://localhost:5000'; // Replace with your actual backend URL

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    handleGoogleLogin().then(sendResponse);
    return true; // Keep channel open
  }
});

async function handleGoogleLogin() {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();
    console.log('Your Redirect URI is:', redirectUrl);
    const clientId = '909672702752-1c6jc7bgbu4v4s19tn9jqol704c35hpf.apps.googleusercontent.com';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=openid%20email%20profile&nonce=${Math.random().toString(36).substring(2)}`;

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });

    const params = new URLSearchParams(new URL(responseUrl).hash.substring(1));
    const idToken = params.get('id_token');

    if (!idToken) throw new Error('No ID token found');

    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await backendResponse.json();
    if (data.token) {
      await chrome.storage.local.set({ token: data.token, user: data.user });
      return { success: true, user: data.user };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}
