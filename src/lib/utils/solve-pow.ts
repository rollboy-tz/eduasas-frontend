/**
 * @fileoverview Browser-Compatible Proof-of-Work (PoW) Solver Utility
 * Uses Native Web Crypto API for lightning-fast SHA-256 hashing in the browser.
 */

/**
 * Muundo wa majibu ya challenge kutoka kwenye Server API.
 */
export type PowChallengeResponse = {
  /** Kitambulisho cha kipekee cha challenge */
  challengeId: string;
  /** String ya nasibu inayotumiwa kutengeneza hash */
  seed: string;
  /** Idadi ya sifuri za mwanzo zinazotakiwa kwenye hash (mfano: 4) */
  difficulty: number;
};

/**
 * Muundo wa matokeo ya PoW baada ya CPU kumaliza kusaga hesabu.
 */
export type PowResult = {
  /** Data ya challenge iliyotumika */
  challenge: PowChallengeResponse;
  /** Jibu lililopatikana baada ya solver kumaliza kazi */
  solution: {
    /** Namba iliyopatikana inayokidhi vigezo */
    nonce: number;
    /** Matokeo ya mwisho ya SHA-256 Hash */
    hash: string;
  };
};

/**
 * Inafanya SHA-256 hash kwa kutumia Native Web Crypto API ya Browser.
 * Inaendesha kwa kasi kubwa sana kwenye CPU ya mteja.
 */
async function computeSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Inaomba PoW Challenge kutoka Server na kutafuta Jibu (Nonce) kwa kutumia CPU brute-force.
 * 
 * @param {string} [apiUrl] - URL ya endpoint inayotoa challenge.
 * @returns {Promise<PowResult>} Inarudisha Promise yenye data ya challenge pamoja na solution.
 */
export async function solvePow(
  apiUrl: string = import.meta.env.VITE_API_URL || "https://api.eduasas.co.tz"
): Promise<PowResult> {
  // 1. Chukua challenge kutoka kwenye server
  const response = await fetch(`${apiUrl}/main/pow-challenge`);

  if (!response.ok) {
    throw new Error(`Failed to fetch PoW challenge. HTTP Status: ${response.status}`);
  }

  const challenge: PowChallengeResponse = await response.json();
  const targetPrefix = "0".repeat(challenge.difficulty);

  let nonce = 0;

  /**
   * 2. CPU Brute-force Loop kutafuta Nonce sahihi
   * Tumetumia async/await kwenye crypto.subtle ili kuzuia browser isifunge ukurasa (Main thread freezing).
   */
  while (true) {
    const textToHash = `${challenge.seed}${nonce}`;
    const hash = await computeSha256(textToHash);

    if (hash.startsWith(targetPrefix)) {
      return {
        challenge,
        solution: {
          nonce,
          hash,
        },
      };
    }

    nonce++;
  }
}