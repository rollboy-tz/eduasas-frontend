# Select

Refactor kamili ya `EduModernSelect` - overflow-safe, keyboard-accessible, na
`onChange` contract iliyorekebishwa. Weka folder hii mahali unapoweka
components zako (mfano `src/components/select-input`).

## Bugs za awali zilizorekebishwa

1. **Hakuna overflow protection** - dropdown ilikuwa `absolute` ndani ya
   wrapper, hivyo `overflow: hidden` ya parent yeyote (modal, card, table)
   ingeikata. Sasa inatumia `createPortal` + `position: fixed` (hook ileile
   ya `usePopoverPosition` - overflow-safe, responsive, inageuka juu/chini
   kiotomatiki).

2. **Hakuna keyboard support kabisa** - trigger div haikuwa na `tabIndex`
   wala `onFocus`/`onBlur`, hivyo haikuwezekana kuifikia kwa TAB, na
   `focused` state (iliyotumika kwenye styling) haikuwahi kuwa `true`. Sasa:
   `tabIndex=0`, `onFocus`/`onBlur`, na keyboard navigation kamili -
   ArrowUp/Down kusogea, Home/End, Enter kuchagua, Escape kufunga, na
   typeahead (kuandika herufi kunaruka moja kwa moja kwenye chaguo
   linaloanza na herufi hiyo, wakati `searchable` ni false).

3. **`onChange` ilikuwa inarudisha object nzima `T`, wakati `value` inatarajia
   raw value** - ukijaribu `onChange={(item) => setValue(item)}` halafu
   kupitisha hiyo `value` tena kwenye component, ililinganisha `item[valueKey]
   === value` (object dhidi ya value) - HAIKUWAHI kulingana, uteuzi
   "ulipotea" kimya kimya. Sasa `onChange(value, item)` - `value` ni RAW
   (`T[valueKey]`, au array yake kwa multiple), sawasawa na kile `value` prop
   inachotarajia. `item` bado unapewa kama param ya pili kwa urahisi.

4. **Internal `selected` state + `useEffect` sync** - chanzo cha stale state
   inapowezekana. Sasa uteuzi ni **derived** moja kwa moja kutoka `value` +
   `options` kila render (`useMemo`) - hakuna hatari ya kutofautiana.

## Matumizi ya kawaida

```tsx
import { Select } from "@/components/select-input";
import { useState } from "react";

interface Country { code: string; name: string }

const countries: Country[] = [
  { code: "TZ", name: "Tanzania" },
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
];

function Example() {
  const [country, setCountry] = useState<string | null>(null);

  return (
    <Select
      label="Country"
      options={countries}
      labelKey="name"
      valueKey="code"
      value={country}
      onChange={(value) => setCountry(value as string)}
      searchable
      required
    />
  );
}
```

## Multiple selection

```tsx
const [tags, setTags] = useState<string[]>([]);

<Select
  label="Tags"
  options={tagOptions}
  labelKey="name"
  valueKey="id"
  multiple
  clearable
  value={tags}
  onChange={(values) => setTags(values as string[])}
  formatSelectedSummary={(n) => `${n} tags zimechaguliwa`}
/>
```

## Icons kwenye options

```tsx
<Select
  options={paymentMethods} // kila item ina field `icon: LucideIcon`
  labelKey="label"
  valueKey="id"
  iconKey="icon"
  value={method}
  onChange={(v) => setMethod(v)}
/>
```

## Validation na i18n - sawa na date-input

```tsx
<Select
  label="Idara"
  options={departments}
  labelKey="name"
  valueKey="id"
  required
  value={dept}
  onChange={(v) => setDept(v)}
  messages={{ required: "Sehemu hii inahitajika", noResults: "Hakuna matokeo" }}
/>
```

## Keyboard support

- `Tab` - fika kwenye field
- `Enter` / `Space` / `↓` / `↑` - fungua dropdown
- `↓` / `↑` - songa kwenye chaguo (inazunguka mwisho-mwanzo)
- `Home` / `End` - ruka mwanzo/mwisho
- `Enter` - chagua kilichoangaziwa
- `Escape` - funga na rudisha focus kwenye field
- Kuandika herufi (bila `searchable`) - typeahead, inaruka kwenye chaguo
  linaloanza na herufi hizo