# TimeInput

Muendelezo wa family ile ile (date-input, select-input, text-input) -
underline uniform, overflow-safe portal, validation halisi, i18n-ready.

## Files

```
time-input/
├── time-utils.ts         # parsing, formatting, validation
├── usePopoverPosition.ts # portal positioning (overflow-safe)
├── TimeColumn.tsx        # column moja inayoscroll (reusable)
├── TimeInput.tsx         # main component
└── index.ts
```

## Muundo wa UI

Columns zinazoscroll (Saa | Dakika | [Sekunde] | [AM/PM]) - standard ya
enterprise time pickers (Ant Design, Google Calendar). Kila column
inajiweka kwenye selection unapofungua, na "Now"/"Done" chini.

## Matumizi ya kawaida

```tsx
import { TimeInput } from "@/components/time-input";
import { useState } from "react";

function Example() {
  const [time, setTime] = useState<string>("");

  return (
    <TimeInput
      label="Class start time"
      value={time}
      onChange={(v) => setTime(v)}
      required
    />
  );
}
```

## 12h na AM/PM

```tsx
<TimeInput label="Appointment time" format="12h" value={time} onChange={(v) => setTime(v)} />
// -> "02:30 PM"
```

## Sekunde (kwa matumizi yanayohitaji usahihi wa juu)

```tsx
<TimeInput label="Exact time" withSeconds value={time} onChange={(v) => setTime(v)} />
```

## Hatua ya dakika (minuteStep)

Default ni dakika 5 (orodha fupi zaidi, rahisi kuscroll). Kwa usahihi wa
dakika moja moja:

```tsx
<TimeInput label="Precise time" minuteStep={1} value={time} onChange={(v) => setTime(v)} />
```

## Min/Max (mfano saa za kazi)

```tsx
<TimeInput
  label="Meeting time"
  min="08:00"
  max="17:00"
  value={time}
  onChange={(v) => setTime(v)}
/>
```
Saa/dakika zilizo nje ya range zinazuiwa (grey-out) moja kwa moja kwenye
columns - hakuna kusubiri error toast.

## Kupanga output format

```tsx
// Default - "HH:mm" (24h)
<TimeInput value={time} onChange={(v) => setTime(v)} />

// 12h string
<TimeInput outputFormat="12h" value={time} onChange={(v) => setTime(v)} /> // "02:30 PM"

// Function - udhibiti kamili, au tumia TimeValue moja kwa moja
<TimeInput
  value={time}
  onChange={(_, t) => setHoursMinutes(t?.hours, t?.minutes)}
/>
```

> Kama unahitaji ku-combine na tarehe (Date + Time full timestamp),
> tumia `time-utils`' `TimeValue` pamoja na `DateInput`'s Date, kisha
> `date.setHours(time.hours, time.minutes, time.seconds)` - epuka
> `.toISOString()` moja kwa moja kwa sababu ile ile ya timezone
> iliyoelezwa kwenye README ya date-input.

## Validation na i18n

```tsx
<TimeInput
  label="Muda"
  required
  messages={{ required: "Sehemu hii inahitajika", tooEarly: "Muda ni wa mapema mno" }}
  value={time}
  onChange={(v) => setTime(v)}
/>
```