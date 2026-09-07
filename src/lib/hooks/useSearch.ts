import { useMemo } from 'react';
import { useDebounce } from './useBounce'; // Hakikisha path ni sahihi
import { functionSearch as universalSearch } from '@/lib/utils'; // Weka kwenye utils/search

/**
 * `useSearch` - Custom hook inayotoa uwezo wa kutafuta (filter) data yoyote 
 * iliyo kwenye array kwa kutumia njia ya Recursion na Debounce.
 *
 * @template T - Aina ya object ya data (mfano: Staff, Student, School).
 * * @param {T[]} data - Array ya data original unayotaka kutafutia.
 * @param {string} searchTerm - Neno linalochapwa na mtumiaji kwenye search input.
 * @param {number} [delay=300] - Muda wa kusubiri (debounce) kwa milliseconds.
 * - Tumia muda mrefu (mfano: 500ms) kama array ina data nyingi sana (CPU intensive).
 * - Tumia muda mfupi (mfano: 150ms-200ms) kama data ni ndogo kwa ajili ya "snappy" feel.
 * * @returns {T[]} - Array ya matokeo yaliyochujwa kulingana na neno lililotafutwa.
 * * @example
 * // Mfano wa jinsi ya kutumia kwenye Component:
 * const data = [
 * { id: 1, name: "John" },
 * { id: 2, name: "Jane" },
 * { id: 3, name: "Bob" },
 * ];
 * const [term, setTerm] = useState("");
 * const searchedData = useSearch(data || [], term, 300);
 * * return (
 * <input onChange={(e) => setTerm(e.target.value)} />
 * {searchedData.map(item => <DataCard key={item.id} {...item} />)}
 * );
 */

export const useSearch = <T>(
    data: T[],
    searchTerm: string,
    delay: number = 300
): T[] => {
    // 1. Debounce ina-manage timing ya input
    const debouncedSearchTerm = useDebounce(searchTerm, delay);

    // 2. Memoization inazuia search logic isijirudie bila sababu
    return useMemo(() => {
        if (!debouncedSearchTerm.trim()) return data;
        return universalSearch(data, debouncedSearchTerm);
    }, [data, debouncedSearchTerm]);
};