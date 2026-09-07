export const restrictors = {
  none(value: string) {
    return value;
  },

  /**
   * BUG ILIYOREKEBISHWA: ilikuwa `/[^A-Za-z ]/g` - inafuta herufi zenye
   * accents (é, ñ, ü n.k) KABLA hata normalizer ya jina haijazipata, ilhali
   * normalizer ya "name"/"fullname" INAZIRUHUSU (\u00C0-\u00FF). Matokeo:
   * mtu mwenye jina kama "José" hakuweza kuandika accent hata kidogo.
   */
  letters(value: string) {
    return value.replace(/[^A-Za-zÀ-ÿ' -]/g, "");
  },

  numbers(value: string) {
    return value.replace(/\D/g, "");
  },

  alphanumeric(value: string) {
    return value.replace(/[^A-Za-z0-9 ]/g, "");
  },
};