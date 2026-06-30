"use client";

import { createContext, useContext } from "react";

export type LoaderPhase = "loading" | "transitioning" | "revealed";

type LoaderTransitionValue = {
    phase: LoaderPhase;
    /** Hero skips typing `whoami` when the loader already ran the boot sequence */
    skipHeroTypewriter: boolean;
};

export const LoaderTransitionContext = createContext<LoaderTransitionValue>({
    phase: "revealed",
    skipHeroTypewriter: false,
});

export function useLoaderTransition() {
    return useContext(LoaderTransitionContext);
}
