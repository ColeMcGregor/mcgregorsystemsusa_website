
export function initializeScrollCue() {
    const cue = document.querySelector(".scroll-cue");

    if (!cue) {
        return;
    }

    const updateVisibility = () => {
        const isHidden = window.scrollY >= 300;

        cue.classList.toggle("is-hidden", isHidden);
        cue.setAttribute("aria-hidden", String(isHidden));
        cue.tabIndex = isHidden ? -1 : 0;
    };

    window.addEventListener("scroll", updateVisibility, {
        passive: true
    });

    updateVisibility();
}
