// Hii inaruhusu TypeScript kutambua path zote za object (mfano: "student.name")
export type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]-?: `${Exclude<K, symbol>}${"" | `.${DeepKeys<T[K]>}`}`;
    }[keyof T]
  : "";