import { validators } from "./validators";

/**
 * BUG KUBWA ILIYOREKEBISHWA: `password: null` na `confirm: null` - licha ya
 * `validators.password` (nguvu ya password) na `validators.confirm`
 * (kulinganisha password) kuwa zimeandikwa KAMILI kwenye validators.ts,
 * registry ilikuwa haziunganishi kabisa. Kwenye useInputEngine.validate():
 *
 *   const validator = type ? validatorRegistry[type] : undefined;
 *   if (validator) { ... }
 *
 * `null` ni falsy, hivyo `if (validator)` ilikuwa ikiruka kabisa - type
 * "password" na "confirm" HAZIKUWAHI kuthibitishwa. Mtu angeweza kuweka
 * password ya herufi moja tu, au confirm-password isiyofanana kabisa,
 * bila error yoyote kuonekana. Sasa zimeunganishwa.
 */
export const validatorRegistry = {
  text: null,
  email: validators.email,
  phone: validators.phone,
  contact: validators.contact,
  password: validators.password,
  confirm: validators.confirm,
  number: validators.number,
  url: validators.url,
  name: validators.name,
  fullname: validators.fullName,
  id: validators.id,
};