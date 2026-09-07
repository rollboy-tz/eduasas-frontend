import { useState, useMemo } from "react";
import { universalSort } from "@/lib/utils";
import { DeepKeys } from "@/types";

// Helper ya kutoa list ya paths zote (keys)
function getDeepKeys<T extends object>(obj: T, prefix = ""): string[] {
    let keys: string[] = [];
    for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key as keyof T] === "object" && obj[key as keyof T] !== null) {
            keys = [...keys, ...getDeepKeys(obj[key as keyof T] as object, path)];
        } else {
            keys.push(path);
        }
    }
    return keys;
}

/**
 * Hook ya kupanga data (Sorting) kulingana na path ya object (Dot Notation).
 * Inazalisha kiotomatiki orodha ya paths zinazopatikana kwenye data ili kutumika kwenye UI.
 *
 * @template T - Aina ya data (Object) inayopangwa.
 * @param {T[] | undefined} data - Array ya data unayotaka kuipanga.
 * @param {DeepKeys<T>} initialPath - Path ya kwanza ya kuanzia kupanga (mfano: "name" au "parent.email").
 * @param {'asc' | 'desc'} [initialDir='asc'] - Mwelekeo wa kupanga (default: 'asc').
 * * @returns {Object} Inarudisha data iliyopangwa, orodha ya paths, na functions za kubadilisha sort.
 *
 * @example
 * // 1. Matumizi ya msingi kwenye mwanafunzi
 * const { sorted, paths, setPath } = useSort(students, "name");
 * // Result: sorted ni array iliyopangwa kwa jina, paths ni ["name", "parent.email", "indexNumber"]
 *
 * @example
 * // 2. Matumizi kwenye Dropdown ya UI (Dynamic Sorting)
 * <select onChange={(e) => setPath(e.target.value as any)}>
 * {paths.map(p => <option key={p} value={p}>{p}</option>)}
 * </select>
 *
 * @example
 * // 3. Kubadilisha mwelekeo wa sorting (Toggle Asc/Desc)
 * <button onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
 * Sort {dir === 'asc' ? 'Descending' : 'Ascending'}
 * </button>
 */

export function useSort<T extends object>(
    data: T[] | undefined,
    initialPath: DeepKeys<T>,
    initialDir: "asc" | "desc" = "asc"
) {
    const [path, setPath] = useState<DeepKeys<T>>(initialPath);
    const [dir, setDir] = useState<"asc" | "desc">(initialDir);

    const paths = useMemo(() => {
        if (!data || data.length === 0) return [];
        return getDeepKeys(data[0]) as DeepKeys<T>[];
    }, [data]);

    const sorted = useMemo(() => {
        if (!data) return [];
        return universalSort(data, path as string, dir);
    }, [data, path, dir]);

    return { sorted, path, setPath, dir, setDir, paths };
}