export const COPILOT_OPEN_EVENT = "open-sr-copilot";
export const COPILOT_COACHMARK_KEY = "sr-copilot-coachmark-seen";

export function openCopilot() {
    window.dispatchEvent(
        new CustomEvent(COPILOT_OPEN_EVENT, { detail: { immediate: true } })
    );
}

export function hasSeenCopilotCoachmark() {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(COPILOT_COACHMARK_KEY) === "1";
}

export function dismissCopilotCoachmark() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COPILOT_COACHMARK_KEY, "1");
}
