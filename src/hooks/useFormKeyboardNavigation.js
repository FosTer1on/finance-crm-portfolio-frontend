import { useCallback, useRef } from "react";

function resolveFocusable(node) {
  if (!node) {
    return null;
  }

  if (typeof node.focus === "function") {
    return node;
  }

  return (
    node.querySelector?.(
      [
        "input:not([disabled])",
        "textarea:not([disabled])",
        "button:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",")
    ) ?? null
  );
}

export function useFormKeyboardNavigation({ fields, onSubmit }) {
  const fieldRefs = useRef(new Map());

  const registerField = useCallback(
    (fieldName) => (node) => {
      if (node) {
        fieldRefs.current.set(fieldName, node);
      } else {
        fieldRefs.current.delete(fieldName);
      }
    },
    []
  );

  const focusField = useCallback((fieldName) => {
    const node = fieldRefs.current.get(fieldName);

    const focusable = resolveFocusable(node);

    if (!focusable) {
      return false;
    }

    focusable.focus();

    return true;
  }, []);

  const focusFirst = useCallback(() => {
    for (const field of fields) {
      if (focusField(field)) {
        return true;
      }
    }

    return false;
  }, [fields, focusField]);

  const focusLast = useCallback(() => {
    for (let index = fields.length - 1; index >= 0; index -= 1) {
      if (focusField(fields[index])) {
        return true;
      }
    }

    return false;
  }, [fields, focusField]);

  const focusNext = useCallback(
    (fieldName) => {
      const currentIndex = fields.indexOf(fieldName);

      if (currentIndex === -1) {
        return false;
      }

      for (let index = currentIndex + 1; index < fields.length; index += 1) {
        if (focusField(fields[index])) {
          return true;
        }
      }

      return false;
    },
    [fields, focusField]
  );

  const focusPrevious = useCallback(
    (fieldName) => {
      const currentIndex = fields.indexOf(fieldName);

      if (currentIndex === -1) {
        return false;
      }

      for (let index = currentIndex - 1; index >= 0; index -= 1) {
        if (focusField(fields[index])) {
          return true;
        }
      }

      return false;
    },
    [fields, focusField]
  );

  const getEnterKeyDown = useCallback(
    (fieldName, { submitOnEnter = false, multiline = false } = {}) =>
      (event) => {
        if (event.key !== "Enter") {
          return;
        }

        if (event.nativeEvent?.isComposing) {
          return;
        }

        //
        // В TextArea:
        // Shift+Enter = newline.
        //
        if (multiline && event.shiftKey) {
          return;
        }

        event.preventDefault();

        if (submitOnEnter) {
          onSubmit?.();
          return;
        }

        focusNext(fieldName);
      },
    [focusNext, onSubmit]
  );

  return {
    registerField,
    focusField,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getEnterKeyDown,
  };
}
