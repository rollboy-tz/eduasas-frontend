/**
 * COLLECTION HELPER - EDUASAS SYSTEM
 * Inatoa njia rahisi za kuchuja na kuchagua vitu kutoka kwenye list/array.
 */
export class CollectionHelper {
  
    /**
     * Angalia kama index ni ya 'even' (0, 2, 4...)
     */
    static isEven(index: number): boolean {
      return index % 2 === 0;
    }
  
    /**
     * Angalia kama index ni ya 'odd' (1, 3, 5...)
     */
    static isOdd(index: number): boolean {
      return index % 2 !== 0;
    }
  
    /**
     * Pata kitu cha mwisho kwenye list
     */
    static isLast<T>(list: T[], index: number): boolean {
      return index === list.length - 1;
    }
  
    /**
     * Pata kitu cha kwanza kwenye list
     */
    static isFirst(index: number): boolean {
      return index === 0;
    }
  
    /**
     * Pata kitu kilichopo katikati (Dynamic midpoint)
     */
    static isMiddle<T>(list: T[], index: number): boolean {
      const middle = Math.floor(list.length / 2);
      return index === middle;
    }
  }