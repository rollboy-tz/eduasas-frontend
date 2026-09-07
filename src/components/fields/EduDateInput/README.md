# DateInput

Refactor kamili ya `EduModernDateInputV4` - light mode tu, popover haizuiwi na
overflow ya wazazi, validation halisi, na output format inayopangwa na wewe.
Framer-motion imeondolewa (nafasi yake CSS animation ndogo) ili iwe nyepesi zaidi.

## Files

```
date-input/
├── date-utils.ts        # format tokens, validation, calendar-grid math
├── usePopoverPosition.ts # portal positioning (overflow-safe)
├── Calendar.tsx
├── MonthPicker.tsx
├── YearPicker.tsx
├── DateInput.tsx         # main component
└── index.ts
```

Weka folder hii mahali unapoweka components zako (mfano `src/components/date-input`),
kisha hakikisha `@/lib/utils/helper` (function `cn`) ipo kwenye project yako -
tayari ipo kwa mujibu wa faili ulizoshare.

## Kwa nini haizuiwi na overflow

Popover inatolewa kupitia `createPortal(..., document.body)` na `position: fixed`
inayokokotolewa kutoka `getBoundingClientRect()` ya trigger. Hii inamaanisha
popover haipo tena ndani ya DOM tree ya parent yako - hivyo `overflow: hidden`
au `overflow: auto` kwenye modal, card, au table hairusiwi tena kuikata.
Pia inageuka juu (`top`) kiotomatiki kama hakuna nafasi ya kutosha chini,
na inabana upana isizidi ukingo wa dirisha.

## Matumizi ya kawaida

```tsx
import { DateInput } from "@/components/date-input";
import { useState } from "react";

function Example() {
  const [dob, setDob] = useState<string>("");

  return (
    <DateInput
      label="Date of birth"
      value={dob}
      onChange={(value) => setDob(value)}
      required
      max={new Date()} // hairuhusu tarehe za mbeleni
    />
  );
}
```

## Kupanga output format (ISO, custom pattern, au Date)

`onChange` daima inarudisha vitu viwili: `(value: string, date: Date | null)`.
`value` inafuata `outputFormat` uliyopanga; `date` ni JS `Date` halisi - tumia
chochote kinachokufaa.

```tsx
// 1) Default - ISO (YYYY-MM-DD) - SALAMA, hakuna timezone shift
<DateInput label="Start date" value={value} onChange={(v) => setValue(v)} />

// 2) Pattern maalum - pia salama, haitumii toISOString
<DateInput
  label="Start date"
  outputFormat="DD/MM/YYYY"
  value={value}
  onChange={(v) => setValue(v)} // "22/08/2026"
/>

// 4) Usijali format kabisa - tumia Date moja kwa moja
<DateInput
  label="Start date"
  value={value}
  onChange={(_, date) => setNativeDate(date)}
/>
```

> ⚠️ **USITUMIE `date.toISOString()` kwenye `outputFormat` kwa date-only
> values.** `.toISOString()` inabadilisha `Date` kuwa UTC - kwa timezone
> yoyote iliyo mbele ya UTC (mfano Tanzania, UTC+3), saa 00:00 ya "tarehe
> 2" saa za mtaa inakuwa 21:00 "tarehe 1" UTC - **tarehe inayoonekana
> kwenye string inakuwa ya NYUMA moja kuliko uliyochagua**. Hii ni bug ya
> kawaida sana kwenye date pickers, si tatizo la component hii, lakini
> `outputFormat` ikikuruhusu kuandika function yoyote, ni rahisi
> kuingia kwenye mtego huu bila kujua.
>
> - Kama unahitaji tu tarehe (bila muda), tumia default (`"iso"`) au
>   pattern string - zote mbili zinatumia tarehe ya MTAA moja kwa moja,
>   hazipitii UTC kabisa.
> - Kama LAZIMA uwe na full timestamp (saa+tarehe), jenga instant yako
>   mwenyewe kwa uwazi badala ya kutegemea `.toISOString()` ya default
>   (mfano midnight UTC ya tarehe hiyo hiyo): <br>
>   `outputFormat={(date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString()}`

## Validation halisi

Required/min/max zinafanya kazi otomatiki. Kwa validation yako mwenyewe:

```tsx
<DateInput
  label="Appointment"
  value={value}
  onChange={(v) => setValue(v)}
  validate={(date) => {
    if (date && date.getDay() === 0) return "Hatufanyi kazi Jumapili";
  }}
/>
```

Ukitaka kubadilisha matini (i18n) - Kiswahili, Kifaransa, chochote:

```tsx
<DateInput
  label="Tarehe ya kuzaliwa"
  messages={{
    required: "Sehemu hii inahitajika",
    tooEarly: "Tarehe ni ya nyuma sana",
    today: "Leo",
    clear: "Futa",
  }}
  value={value}
  onChange={(v) => setValue(v)}
/>
```

## Modes

```tsx
<DateInput mode="date" ... />   // default
<DateInput mode="month" ... />  // -> "2026-08"
<DateInput mode="year" ... />   // -> "2026"
```

`displayFormat` (matini inayoonekana kwenye trigger) sasa inafuata `mode`
kiotomatiki - hakuna haja ya kuipitisha wewe mwenyewe:
- `mode="year"` → inaonyesha `"2026"` tu (si tarehe kamili)
- `mode="month"` → inaonyesha `"August 2026"`
- `mode="date"` → inaonyesha `"23 Aug 2026"`

Bado unaweza ku-override kwa pattern yako mwenyewe (`displayFormat="MMM YYYY"` n.k) ikiwa unataka muonekano tofauti.

## Customization ya kina

```tsx
<DateInput
  size="lg"
  classNames={{
    trigger: "shadow-sm",
    popover: "border-blue-100",
  }}
  clearable={false}
  showSuccess
  successMessage="Tarehe imekubalika"
/>
```

## Nini kimebadilika kutoka toleo la awali

- **Light mode tu** - `bg-muted-950`, `text-white` n.k. zimeondolewa; sasa
  `bg-white`, `text-gray-900`, borders nyepesi.
- **Overflow-safe** - portal + `position: fixed` badala ya `absolute` ndani
  ya wrapper (suluhisho la zamani lingekatwa na `overflow: hidden`).
- **Validation halisi** - `validateDate()` inaweza kutumika hata nje ya UI,
  inasupport `required`, `min`, `max`, na `validate` yako mwenyewe.
- **Output format** - unachagua ISO, pattern string, au function; `onChange`
  daima inatoa Date halisi pia.
- **Nyepesi zaidi** - framer-motion imeondolewa, CSS keyframes ndogo badala
  yake.
- **Accessibility** - `role="combobox"`, `aria-expanded`, `aria-controls`,
  keyboard support (Enter/Space/ArrowDown kufungua, Escape kufunga),
  `role="grid"` kwenye calendar, `aria-selected`/`aria-current` kwenye siku.
- **Form-friendly** - `name` prop inaweka hidden input kwa native form submit.