/**
 * Google Identity Services (GIS) OAuth 2.0 Integration
 * WedPlan Wedding Planning Platform
 */

export interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
}

export interface GoogleAuthResult {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  accessToken?: string;
  idToken?: string;
  role?: string;
}

/**
 * Retrieve the Google OAuth Client ID from environment variables
 */
export const getGoogleClientId = (): string => {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
};

/**
 * Dynamically load Google Identity Services script if not already present
 */
export const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    if ((window as any).google?.accounts?.oauth2) {
      return resolve();
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services'))
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
};

/**
 * Launch the official Google OAuth 2.0 Token Client popup
 */
export const requestGoogleToken = async (
  clientId: string
): Promise<{ accessToken: string; profile: GoogleUserProfile }> => {
  await loadGoogleIdentityServices();

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK is not available.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.error) {
            reject(
              new Error(
                response.error_description ||
                  response.error ||
                  'Google authorization was cancelled or encountered an error.'
              )
            );
            return;
          }

          if (!response.access_token) {
            reject(new Error('No access token returned by Google.'));
            return;
          }

          try {
            // Fetch verified user identity directly from Google's OAuth2 v3 API
            const userInfoRes = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              }
            );

            if (!userInfoRes.ok) {
              throw new Error(
                `Google userinfo request failed with status ${userInfoRes.status}`
              );
            }

            const profile: GoogleUserProfile = await userInfoRes.json();
            resolve({
              accessToken: response.access_token,
              profile,
            });
          } catch (fetchErr: any) {
            reject(
              new Error(
                fetchErr.message || 'Failed to fetch user profile from Google.'
              )
            );
          }
        },
      });

      // Trigger the official Google sign-in account popup
      client.requestAccessToken();
    } catch (initErr: any) {
      reject(
        new Error(
          initErr.message || 'Failed to initialize Google OAuth Token Client.'
        )
      );
    }
  });
};
