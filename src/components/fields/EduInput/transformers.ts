export const transformers = {
  uppercase(value: string) {
    return value.toUpperCase();
  },

  lowercase(value: string) {
    return value.toLowerCase();
  },

  capitalize(value: string) {
    return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  },
};