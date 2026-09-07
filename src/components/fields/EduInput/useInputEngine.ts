import { useState, useCallback, useEffect, useRef, useMemo } from "react";

import { EngineOptions } from "./types";
import { restrictors } from "./restrictors";
import { transformers } from "./transformers";
import { normalizers } from "./normalizers";
import { validators, validateLength } from "./validators";
import { validatorRegistry } from "./registry";
import { createMessages } from "./messages";

export interface UseInputEngineProps extends EngineOptions {
  onChange?: (value: string) => void;
}

export const useInputEngine = ({
  value = "",
  type,
  password,
  required = false,
  transform = "none",
  restrict = "none",
  minValue,
  maxValue,
  messages: messagesOverride,
  onChange,
  onError,
}: UseInputEngineProps) => {
  const [inputValue, setInputValue] = useState(value);

  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);

  const resolvedMessages = useMemo(() => createMessages(messagesOverride), [messagesOverride]);

  const prepareValue = useCallback(
    (raw: string) => {
      let v = restrictors[restrict](raw);

      if (transform !== "none") {
        v = transformers[transform](v);
      }

      const normalizer = type ? normalizers[type as keyof typeof normalizers] : undefined;
      v = normalizer ? normalizer(v) : normalizers.text(v);

      return v;
    },
    [restrict, transform, type]
  );

  // ---- initial mount ------------------------------------------------------
  useEffect(() => {
    setInputValue(prepareValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- BUG ILIYOREKEBISHWA: external value sync ----------------------------
  // Awali effect ya sync ilikuwa na `[]` (inaendesha MARA MOJA tu kwenye
  // mount). Kama parent ni controlled na akafanya `setValue("")` kufuta form
  // (mfano baada ya submit), internal `inputValue` HAIKUWAHI kubadilika -
  // field iliendelea kuonyesha thamani ya zamani ijapokuwa parent state
  // ilikuwa tayari imefutwa. `lastEmitted` ref inatuwezesha kutofautisha
  // "mabadiliko yametoka kwetu" (usije uka-normalize mara mbili/kuvunja
  // cursor position wakati wa kuandika) dhidi ya "mabadiliko yametoka nje".
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    const prepared = prepareValue(value);
    setInputValue(prepared);
    lastEmitted.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ---- validate ---------------------------------------------------------
  const runValidation = useCallback(
    (currentValue: string) => {
      if (required) {
        const requiredResult = validators.required(currentValue, { messages: resolvedMessages });
        if (!requiredResult.valid) {
          setError(requiredResult.error);
          setValid(null);
          onError?.(requiredResult.error);
          return false;
        }
      }

      // Length check - haikuwahi kuunganishwa kabla (ona validators.ts)
      const lengthResult = validateLength(currentValue, minValue, maxValue, { messages: resolvedMessages });
      if (!lengthResult.valid) {
        setError(lengthResult.error);
        setValid(null);
        onError?.(lengthResult.error);
        return false;
      }

      const validator = type ? validatorRegistry[type] : undefined;
      if (validator) {
        const result = validator(currentValue, { password, messages: resolvedMessages });
        if (!result.valid) {
          setError(result.error);
          setValid(null);
          onError?.(result.error);
          return false;
        }
      }

      setError(null);
      setValid(true);
      onError?.(null);
      return true;
    },
    [required, minValue, maxValue, type, password, resolvedMessages, onError]
  );

  // ---- change ---------------------------------------------------------
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const prepared = prepareValue(event.target.value);

      setInputValue(prepared);
      lastEmitted.current = prepared;

      // Validation inafanyika BLUR TU - hapa (change) tunafuta error tu.
      // Hii inazuia mkanganyiko wa aina mbili: (1) error kuonekana kabla
      // mtumiaji hajamaliza kuandika, na (2) error ya zamani "kubaki
      // ikionekana" baada ya mtumiaji kushaibadilisha thamani.
      setError(null);
      setValid(null);
      onError?.(null);

      onChange?.(prepared);
    },
    [prepareValue, onChange, onError]
  );

  const validate = useCallback(() => runValidation(inputValue), [runValidation, inputValue]);

  // ---- blur / focus -------------------------------------------------------
  const handleBlur = useCallback(() => {
    setFocused(false);
    setTouched(true);
    validate();
  }, [validate]);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  // ---- reset / setValue ---------------------------------------------------
  const reset = useCallback(() => {
    setInputValue("");
    lastEmitted.current = "";
    setFocused(false);
    setTouched(false);
    setError(null);
    setValid(null);
  }, []);

  const setValue = useCallback((v: string) => {
    setInputValue(v);
    lastEmitted.current = v;
  }, []);

  const bind = useCallback(
    () => ({
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
    }),
    [handleChange, handleBlur, handleFocus]
  );

  return {
    value: inputValue,
    error,
    valid,
    focused,
    touched,
    handleChange,
    handleBlur,
    handleFocus,
    validate,
    reset,
    setValue,
    bind,
  };
};