# Input Engine (refactor kamili)

Refactor ya `EduModernInputV2` + injini yake nzima (`useInputEngine`,
`validators`, `normalizers`, `restrictors`, `transformers`, `registry`,
`messages`). Weka folder hii kwenye `@/lib/input-engine` (badilisha import
paths kama muundo wako ni tofauti kidogo).

## Bugs halisi zilizogunduliwa na kurekebishwa

### 1. `password`/`confirm` validation HAZIKUWAHI kuendeshwa (bug kubwa zaidi)
`registry.ts` ilikuwa na `password: null, confirm: null` - licha ya
`validators.password` (nguvu ya password: 8+, uppercase, lowercase, namba)
na `validators.confirm` (kulinganisha password) kuandikwa KAMILI kwenye
`validators.ts`. Kwenye `useInputEngine`, `if (validator)` ilikuwa inaruka
kimya kimya kwa sababu `null` ni falsy. **Matokeo halisi: mtu angeweza
kuweka password ya herufi moja, au confirm-password isiyofanana kabisa na
password ya kwanza, bila error yoyote kuonekana.** Imerekebishwa - sasa
zote mbili zimeunganishwa kwenye registry.

### 2. Status icon (success/error) ilikuwa na default-success bug
```tsx
{inputState === "error" ? <AlertCircle /> : <CheckCircle2 />}
```
Kama `inputState` haikupitishwa (ambayo ndiyo default kwa watumiaji wengi),
tawi la "success" lilichaguliwa MOJA KWA MOJA - **alama ya kijani ilionekana
hata kwenye field tupu isiyoguswa bado**. Sasa status inatokana na
validation halisi ya engine (`touched` + `error`/`value`) - haihitaji prop
ya mkono ya kutunza, na haiwezi kutofautiana na ukweli.

### 3. External `value` haikuwahi ku-sync baada ya mount ya kwanza
```ts
useEffect(() => { setInputValue(prepareValue(value)) }, []) // [] tu!
```
Kama parent ni controlled na akafanya `setValue("")` kufuta form (mfano
baada ya submit), field iliendelea kuonyesha thamani ya zamani - internal
state haikuwahi kusikia mabadiliko ya nje baada ya render ya kwanza.
Imerekebishwa na `lastEmitted` ref inayotofautisha "mabadiliko ya ndani"
dhidi ya "mabadiliko ya nje".

### 4. `minValue`/`maxValue`/`invalidLength` zilikuwa dead code
Zote zilikuwepo kwenye `EngineOptions` na `Messages`, lakini hakuna
validator iliyokuwa ikiziita - length haikuwahi kuthibitishwa licha ya
kuonekana kama feature iliyopo. Sasa `validateLength()` imeunganishwa
kwenye `runValidation()`.

### 5. `restrictors.letters` ilikuwa inafuta accented characters
`/[^A-Za-z ]/g` ilifuta é/ñ/ü n.k KABLA hata normalizer ya jina haijazipata,
ilhali normalizer ya "name" INAZIRUHUSU. Mtu mwenye jina kama "José"
hakuweza kuandika accent hata kidogo. Imerekebishwa iendane na normalizer.

### 6. `validators.url` ilikubali "httpxyz" kama scheme halali
`value.startsWith("http")` ilikuwa check dhaifu. Sasa
`/^https?:\/\//i.test(value)`.

### 7. Type mbili tofauti za InputType (component vs engine)
Component ilikuwa na `inputTypeV2` yake (bila "number"), tofauti na
`InputType` ya engine - zingeweza kutofautiana bila TypeScript kukamata.
Sasa chanzo kimoja tu (`types.ts`).

### 8. Hakuna accessibility (label/id/aria-describedby)
Component ya awali haikuwa na `label`, `id`, wala uunganisho wowote wa
`aria-describedby` kati ya input na ujumbe wa error. Sasa vyote vimeongezwa.

### 9. Messages hazikuwa na njia ya i18n/override
`validators.ts` ilikuwa inaita `Messages` moja kwa moja (hardcoded, hakuna
njia ya kubadilisha lugha per-instance). Sasa `messages` prop inapita hadi
kwenye validators kupitia `context.messages`.

## UI - uniform na family (date-input / select-input)

- Windows11-style underline (badala ya border ya pande zote)
- Height fasta (`h-8/10/12`) - haibadiliki kama clear button/status icon/
  password toggle vinatokea au la
- Messages fupi za kisasa (angalia `messages.ts`)

## Matumizi

```tsx
import { Input } from "@/lib/input-engine";
import { useState } from "react";

function SignupForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <>
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={setPassword}
      />

      <Input
        label="Confirm password"
        type="confirm"
        password={password}
        required
        value={confirm}
        onChange={setConfirm}
        // sasa hii KWELI inathibitisha - ilikuwa haifanyi kazi kabla
      />
    </>
  );
}
```

### Length validation (sasa inafanya kazi)

```tsx
<Input
  label="Username"
  minValue={3}
  maxValue={20}
  showValueCount
  value={username}
  onChange={setUsername}
/>
```

### i18n/override ya messages

```tsx
<Input
  label="Barua pepe"
  type="email"
  required
  messages={{ required: "Sehemu hii inahitajika", invalidEmail: "Barua pepe si sahihi" }}
  value={email}
  onChange={setEmail}
/>
```

### ID / namba za usajili (mpya)

`type="id"` - inaruhusu herufi, namba, na `-` `_` `/` pekee (format ya kawaida
kwa NIDA, namba za usajili, vitambulisho). Character nyingine yoyote
inafutwa moja kwa moja unapoandika.

```tsx
<Input
  label="NIDA number"
  type="id"
  required
  minValue={20}
  maxValue={20}
  value={nida}
  onChange={setNida}
/>
```

Ukihitaji format fasta zaidi (mfano NIDA halisi ina muundo maalum wa
makundi ya tarakimu), tumia `minValue`/`maxValue` kwa urefu, au ongeza
`validate` yako mwenyewe kwenye `validators.id` (regex ya sasa ni ya jumla
kwa makusudi - inafaa aina nyingi za ID bila kubana sana).