export const triggerGoogleAuth = (mode: "login" | "register" = "login") => {
  if (typeof window === "undefined") return;

  // 1. CHUKUA ORIGIN YA SASA HIVI (Hapa ndio unyama ulipo!)
  // Hii itakuwa 'https://9000-firebase...' au 'https://app.eduasas.co.tz'
  const cleanOrigin = window.location.origin.replace(/\/$/, ""); // Ondoa / ya mwisho kama ipo
  
  // 2. TENGENEZA REDIRECT URI DYNAMICALLY
  // Lazima ifanane na ile uliyoweka Google Console
  
  const dynamicRedirectUri = `${cleanOrigin}/auth/oauth/google`;
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("returnUrl") || "/home";
  // console.log("DBUG - Hii ndio urls iliopatikana kwenye triger: ", dynamicRedirectUri)
  const state = encodeURIComponent(
    JSON.stringify({
      returnUrl: returnUrl,
      mode: mode,
      backUrl: window.location.href || "/sign-in",
      passedRedirectUri: dynamicRedirectUri,
    })
  );

  const options = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    redirect_uri: dynamicRedirectUri, // Tunatumia ile ya juu hapa
    response_type: "code",
    scope: "openid email profile",
    state: state,
    prompt: "select_account",
  };

  const qs = new URLSearchParams(options).toString();
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
};