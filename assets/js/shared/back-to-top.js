
export function initializeBackToTop() {
    if (document.getElementById("back-to-top")) {
        return;
    }

    const button = document.createElement("button");

    button.id = "back-to-top";
    button.className = "back-to-top is-hidden";
    button.type = "button";
    button.title = "Back to top";
    button.setAttribute("aria-label", "Back to top");

    button.innerHTML = `
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M12 19V5M6 11l6-6 6 6"/>
        </svg>
    `;

    document.body.append(button);

    const updateVisibility = () => {
        const isHidden = window.scrollY < 300;

        button.classList.toggle("is-hidden", isHidden);
        button.setAttribute("aria-hidden", String(isHidden));
        button.tabIndex = isHidden ? -1 : 0;
    };

    window.addEventListener("scroll", updateVisibility, {
        passive: true
    });

    button.addEventListener("click", () => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "instant" : "smooth"
        });
    });

    updateVisibility();
}
