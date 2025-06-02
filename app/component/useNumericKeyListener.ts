import { useEffect } from "react";

export function useNumericKeyListener(modalId: string, callback: (key: string) => void) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const modal = document.getElementById(modalId) as HTMLDialogElement;
            const isOpen = modal?.open;

            if (!isOpen) return;

            if (/^[0-9.]$/.test(e.key)) {
                callback(e.key);
            }

            if (e.key === "Backspace") {
                callback("back");
            }

            if (e.key === "Enter") {
                callback("enter");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [modalId, callback]);
}
