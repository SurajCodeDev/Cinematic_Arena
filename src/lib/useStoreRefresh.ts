"use client";

import { useSyncExternalStore } from "react";
import { subscribeStore, getStoreVersion } from "@/lib/store";

export function useStoreRefresh() {
  return useSyncExternalStore(
    subscribeStore,
    getStoreVersion,
    getStoreVersion
  );
}
