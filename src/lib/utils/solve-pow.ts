import crypto from 'crypto';

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
 * Inaomba PoW Challenge kutoka Server na kutafuta Jibu (Nonce) kwa kutumia CPU brute-force.
 *
 * Function hii inafaa kutumiwa na Client Scripts (kama vile Node.js au Python wrappers)
 * au Frontend Clients kabla ya kutuma maombi ya usajili au kazi nzito kwenye API.
 *
 * @param {string} [apiUrl="httsp://api.eduasas.co.tz"] - URL ya endpoint inayotoa challenge.
 * @returns {Promise<PowResult>} Inarudisha Promise yenye data ya challenge pamoja na solution iliyopatikana.
 * 
 * @throws {Error} Inatupa Error ikiwa SERVER itashindwa kutoa challenge au ikirudisha HTTP status isiyo OK.
 *
 * @example
 * ```typescript
 * try {
 *   const { challenge, solution } = await solvePow();
 *   console.log(`Imepata solution! Nonce: ${solution.nonce}`);
 *   
 *   // Tuma maombi kwenda kwenye API registration
 *   await registerUser({
 *     challengeId: challenge.challengeId,
 *     nonce: solution.nonce
 *   });
 * } catch (error) {
 *   console.error("PoW Failed:", error);
 * }
 * ```
 */
export async function solvePow(
  apiUrl: string = import.meta.env.VITE_API_URL ||  "https://api.eduasas.co.tz"
): Promise<PowResult> {
  // 1. Chukua challenge kutoka kwenye server
  const response = await fetch(`${apiUrl}/main/pow-challenge`);

  if (!response.ok) {
    throw new Error(`Failed to fetch PoW challenge. HTTP Status: ${response.status}`);
  }

  const challenge: PowChallengeResponse = await response.json();
  const targetPrefix = "0".repeat(challenge.difficulty);

  let nonce = 0;

  // 2. CPU Brute-force Loop kutafuta Nonce sahihi
  while (true) {
    const hash = crypto
      .createHash("sha256")
      .update(`${challenge.seed}${nonce}`)
      .digest("hex");

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