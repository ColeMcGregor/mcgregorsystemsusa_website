/**
 * Mobile navigation behavior.
 * CSS controls visibility through the .nav.open class. JavaScript only manages state.
 */

export function initializeMobileNavigation(navigation) {
    if (!navigation) return;

    const toggle = navigation.querySelector("#mobileMenu");
    const links = navigation.querySelector("#navlinks");
    if (!toggle || !links) return;

    const setOpen = (open) => {
        navigation.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        toggle.querySelector("span").textContent = open ? "×" : "☰";
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close the menu when the visitor follows a navigation link.
    links.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });

    // Escape closes the menu and returns keyboard focus to its button.
    navigation.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !navigation.classList.contains("open")) return;
        setOpen(false);
        toggle.focus();
    });

    // Clicks outside the navigation also close an open menu.
    document.addEventListener("click", (event) => {
        if (navigation.classList.contains("open") && !navigation.contains(event.target)) {
            setOpen(false);
        }
    });

    // Ensure the mobile state does not persist when switching to desktop layout.
    const desktopLayout = window.matchMedia("(min-width: 721px)");
    desktopLayout.addEventListener("change", (event) => {
        if (event.matches) setOpen(false);
    });
}