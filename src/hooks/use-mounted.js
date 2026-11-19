"use client";

import * as React from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true once the component has mounted on the client.
 * Uses useSyncExternalStore to avoid SSR hydration mismatches
 * and prevent cascading effect render warnings.
 */
export function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client snapshot
    () => false  // Server snapshot
  );
}
