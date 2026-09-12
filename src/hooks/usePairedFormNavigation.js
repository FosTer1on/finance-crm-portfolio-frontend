import { useCallback } from "react";

export function usePairedFormNavigation({
  leftNavigation,
  rightNavigation,
  pairs,
}) {
  const findPair = useCallback(
    (side, fieldName) => {
      return pairs.find((pair) => pair[side] === fieldName);
    },
    [pairs]
  );

  const moveToOpposite = useCallback(
    (side, fieldName) => {
      const pair = findPair(side, fieldName);

      if (!pair) {
        return false;
      }

      if (side === "left") {
        return rightNavigation.focusField(pair.right);
      }

      return leftNavigation.focusField(pair.left);
    },
    [findPair, leftNavigation, rightNavigation]
  );

  const getFieldKeyDown = useCallback(
    ({ side, fieldName, onEnterKeyDown }) =>
      (event) => {
        if (event.key === "Tab") {
          const pair = findPair(side, fieldName);

          if (!pair) {
            return;
          }

          event.preventDefault();

          moveToOpposite(side, fieldName);

          return;
        }

        onEnterKeyDown?.(event);
      },
    [findPair, moveToOpposite]
  );

  return {
    moveToOpposite,
    getFieldKeyDown,
  };
}
