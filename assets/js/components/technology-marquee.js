
/**
 * Shared technology marquee.
 *
 * Supports continuous automatic movement, mouse dragging,
 * trackpad scrolling, touchscreen swiping, and keyboard access.
 *
 * Technology icons are stored locally.
 */

const technologies = [
    {
        name: "JavaScript",
        icon: "javascript-original.svg",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    },
    {
        name: "Python",
        icon: "python-original.svg",
        url: "https://docs.python.org/3/"
    },
    {
        name: "Java",
        icon: "java-original.svg",
        url: "https://docs.oracle.com/en/java/"
    },
    {
        name: "C#",
        icon: "csharp-original.svg",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/"
    },
    {
        name: "C++",
        icon: "cplusplus-original.svg",
        url: "https://en.cppreference.com/w/cpp"
    },
    {
        name: "Kotlin",
        icon: "kotlin-original.svg",
        url: "https://kotlinlang.org/docs/home.html"
    },
    {
        name: "HTML5",
        icon: "html5-original.svg",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML"
    },
    {
        name: "CSS3",
        icon: "css3-original.svg",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS"
    },
    {
        name: "Django",
        icon: "django-plain.svg",
        url: "https://docs.djangoproject.com/"
    },
    {
        name: "FastAPI",
        icon: "fastapi-original.svg",
        url: "https://fastapi.tiangolo.com/"
    },
    {
        name: "PostgreSQL",
        icon: "postgresql-original.svg",
        url: "https://www.postgresql.org/docs/"
    },
    {
        name: "SQLite",
        icon: "sqlite-original.svg",
        url: "https://www.sqlite.org/docs.html"
    },
    {
        name: "Docker",
        icon: "docker-original.svg",
        url: "https://docs.docker.com/"
    },
    {
        name: "Git",
        icon: "git-original.svg",
        url: "https://git-scm.com/doc"
    },
    {
        name: "AWS",
        icon: "amazonwebservices-original.svg",
        url: "https://docs.aws.amazon.com/"
    },
    {
        name: "Android",
        icon: "android-original.svg",
        url: "https://developer.android.com/docs"
    },
    {
        name: "Firebase",
        icon: "firebase-original.svg",
        url: "https://firebase.google.com/docs"
    },
    {
        name: "Unreal Engine",
        icon: "unrealengine-original.svg",
        url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/"
    },
    {
        name: "Unity",
        icon: "unity-original.svg",
        url: "https://docs.unity3d.com/"
    },
    {
        name: "Perforce (P4V)",
        icon: "perforce-p4.svg",
        url: "https://help.perforce.com/helix-core/server-apps/p4v/current/index.html"
    }
];

const SCROLL_SPEED = 40;
const DRAG_THRESHOLD = 6;

const ICON_DIRECTORY = new URL(
    "../../images/technologies/",
    import.meta.url
);

function createTechnologyItem(technology, isDuplicate = false) {
    const item = document.createElement("li");
    item.className = "technology-marquee-item";

    const link = document.createElement("a");
    link.className = "technology-marquee-link";
    link.href = technology.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.setAttribute(
        "aria-label",
        `${technology.name} documentation (opens in a new tab)`
    );

    if (isDuplicate) {
        link.tabIndex = -1;
    }

    const image = document.createElement("img");

    image.src = new URL(
        technology.icon,
        ICON_DIRECTORY
    ).href;

    image.alt = "";
    image.width = 40;
    image.height = 40;
    image.loading = "eager";
    image.decoding = "async";
    image.draggable = false;

    image.addEventListener("error", () => {
        image.hidden = true;

        item.classList.add(
            "technology-marquee-item--text-only"
        );
    });

    const label = document.createElement("span");
    label.textContent = technology.name;

    link.append(image, label);
    item.appendChild(link);

    return item;
}

function createTechnologyList(isDuplicate = false) {
    const list = document.createElement("ul");
    list.className = "technology-marquee-list";

    if (isDuplicate) {
        list.setAttribute("aria-hidden", "true");
    }

    for (const technology of technologies) {
        list.appendChild(
            createTechnologyItem(technology, isDuplicate)
        );
    }

    return list;
}

function initializeScrolling(section) {
    const viewport = section.querySelector(
        ".technology-marquee-viewport"
    );

    const middleList = section.querySelector(
        ".technology-marquee-list:not([aria-hidden])"
    );

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let listWidth = 0;
    let hovered = false;

    let pointerDown = false;
    let dragging = false;
    let activePointerId = null;

    let dragStartX = 0;
    let previousPointerX = 0;
    let suppressClickUntil = 0;

    let previousFrameTime = null;
    let remainingMovement = 0;

    let animationFrameId = null;
    let normalizing = false;

    function normalizeScroll() {
        if (
            reducedMotion.matches ||
            listWidth <= 0 ||
            normalizing
        ) {
            return;
        }

        const current = viewport.scrollLeft;
        let normalized = current;

        // Keep the viewport centered on one of the three
        // identical copies, allowing movement in either direction.
        if (current < listWidth || current >= listWidth * 2) {
            normalized =
                listWidth +
                ((((current - listWidth) % listWidth) +
                    listWidth) % listWidth);
        }

        if (Math.abs(normalized - current) < 0.01) {
            return;
        }

        normalizing = true;
        viewport.scrollLeft = normalized;
        normalizing = false;
    }

    function measure() {
        const newWidth = middleList.getBoundingClientRect().width;

        if (newWidth <= 0) {
            return;
        }

        const previousWidth = listWidth;
        const previousPosition = viewport.scrollLeft;

        listWidth = newWidth;

        if (reducedMotion.matches) {
            viewport.scrollLeft = 0;
            return;
        }

        if (previousWidth <= 0) {
            viewport.scrollLeft = listWidth;
            return;
        }

        const relativePosition =
            (previousPosition - previousWidth) /
            previousWidth;

        viewport.scrollLeft =
            listWidth * (1 + relativePosition);

        normalizeScroll();
    }

    function keyboardIsInteracting() {
        return section.querySelector(":focus-visible") !== null;
    }

    function shouldPause() {
        return (
            reducedMotion.matches ||
            hovered ||
            pointerDown ||
            keyboardIsInteracting() ||
            document.hidden
        );
    }

    function animate(time) {
        if (previousFrameTime !== null && !shouldPause()) {
            const seconds = Math.min(
                (time - previousFrameTime) / 1000,
                0.05
            );

            // Accumulate fractional movement separately.
            // This works even when the browser rounds
            // scrollLeft to whole pixels.
            remainingMovement += SCROLL_SPEED * seconds;

            const pixels = Math.floor(remainingMovement);

            if (pixels > 0 && listWidth > 0) {
                remainingMovement -= pixels;

                viewport.scrollLeft += pixels;
                normalizeScroll();
            }
        }

        previousFrameTime = time;

        animationFrameId = window.requestAnimationFrame(
            animate
        );
    }

    function finishDrag(event) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        const pointerId = activePointerId;
        const wasDragging = dragging;

        pointerDown = false;
        dragging = false;
        activePointerId = null;

        section.classList.remove(
            "technology-marquee--dragging"
        );

        if (wasDragging) {
            suppressClickUntil = performance.now() + 500;
        }

        if (viewport.hasPointerCapture(pointerId)) {
            viewport.releasePointerCapture(pointerId);
        }

        normalizeScroll();
    }

    viewport.addEventListener("pointerenter", (event) => {
        if (
            event.pointerType === "mouse" ||
            event.pointerType === "pen"
        ) {
            hovered = true;
        }
    });

    viewport.addEventListener("pointerleave", (event) => {
        if (
            event.pointerType === "mouse" ||
            event.pointerType === "pen"
        ) {
            hovered = false;
        }
    });

    viewport.addEventListener("pointerdown", (event) => {
        if (
            event.pointerType !== "mouse" &&
            event.pointerType !== "pen"
        ) {
            return;
        }

        if (event.button !== 0) {
            return;
        }

        pointerDown = true;
        dragging = false;
        activePointerId = event.pointerId;

        dragStartX = event.clientX;
        previousPointerX = event.clientX;

        remainingMovement = 0;
    });

    viewport.addEventListener("pointermove", (event) => {
        if (
            !pointerDown ||
            event.pointerId !== activePointerId
        ) {
            return;
        }

        const totalDistance = event.clientX - dragStartX;
        const movement = event.clientX - previousPointerX;

        if (
            !dragging &&
            Math.abs(totalDistance) >= DRAG_THRESHOLD
        ) {
            dragging = true;

            section.classList.add(
                "technology-marquee--dragging"
            );

            viewport.setPointerCapture(activePointerId);
        }

        if (dragging) {
            event.preventDefault();

            viewport.scrollLeft -= movement;
            normalizeScroll();
        }

        previousPointerX = event.clientX;
    });

    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);

    viewport.addEventListener(
        "lostpointercapture",
        (event) => {
            if (activePointerId === event.pointerId) {
                finishDrag(event);
            }
        }
    );

    // Prevent a completed drag from opening documentation.
    // Ordinary clicks on technology links are unaffected.
    viewport.addEventListener(
        "click",
        (event) => {
            if (performance.now() <= suppressClickUntil) {
                event.preventDefault();
                event.stopPropagation();

                suppressClickUntil = 0;
            }
        },
        true
    );

    viewport.addEventListener(
        "dragstart",
        (event) => event.preventDefault()
    );

    // Native horizontal trackpad and touch scrolling.
    viewport.addEventListener(
        "scroll",
        () => {
            normalizeScroll();
        },
        { passive: true }
    );

    // Shift + mouse wheel scrolls the marquee horizontally.
    // Ordinary vertical page scrolling remains unchanged.
    viewport.addEventListener(
        "wheel",
        (event) => {
            if (
                !event.shiftKey ||
                Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ) {
                return;
            }

            event.preventDefault();

            let distance = event.deltaY;

            if (event.deltaMode === 1) {
                distance *= 16;
            } else if (event.deltaMode === 2) {
                distance *= viewport.clientWidth;
            }

            viewport.scrollLeft += distance;
            normalizeScroll();
        },
        { passive: false }
    );

    // Arrow keys scroll the focused marquee.
    viewport.addEventListener("keydown", (event) => {
        if (
            event.target !== viewport ||
            (event.key !== "ArrowLeft" &&
                event.key !== "ArrowRight")
        ) {
            return;
        }

        event.preventDefault();

        const direction =
            event.key === "ArrowRight" ? 1 : -1;

        viewport.scrollLeft += direction * 80;
        normalizeScroll();
    });

    function onMotionPreferenceChange() {
        remainingMovement = 0;
        previousFrameTime = null;
        measure();
    }

    reducedMotion.addEventListener(
        "change",
        onMotionPreferenceChange
    );

    // Recalculate when fonts or responsive styles alter widths.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(middleList);

    window.addEventListener("resize", measure);

    measure();

    animationFrameId = window.requestAnimationFrame(
        animate
    );

    return () => {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId);
        }

        resizeObserver.disconnect();

        window.removeEventListener("resize", measure);

        reducedMotion.removeEventListener(
            "change",
            onMotionPreferenceChange
        );
    };
}

export function initializeTechnologyMarquee(root = document) {
    const mount = root.querySelector(
        "[data-technology-marquee]"
    );

    if (!mount || mount.dataset.initialized === "true") {
        return;
    }

    const section = document.createElement("section");

    section.className = "technology-marquee";

    section.setAttribute(
        "aria-labelledby",
        "technology-marquee-heading"
    );

    section.innerHTML = `
        <div class="shell">
            <div class="technology-marquee-heading">
                <div class="technology-marquee-heading-copy">
                    <div class="caps subtle">
                        Tools &amp; Technologies
                    </div>

                    <h2 id="technology-marquee-heading">
                        Experience across the
                        <em>software stack.</em>
                    </h2>
                </div>
            </div>
        </div>

        <div
            class="technology-marquee-viewport"
            tabindex="0"
            role="region"
            aria-label="Scrollable technology logos"
        >
            <div class="technology-marquee-track"></div>
        </div>

        <div class="shell">
            <p class="technology-marquee-caption">
                Languages, frameworks, databases, engines,
                and platforms used across commercial,
                independent, and academic development.
            </p>
        </div>
    `;

    const track = section.querySelector(
        ".technology-marquee-track"
    );

    // Three copies provide enough content to wrap in both
    // directions. Only the middle copy is keyboard-accessible.
    track.append(
        createTechnologyList(true),
        createTechnologyList(),
        createTechnologyList(true)
    );

    mount.replaceChildren(section);
    mount.dataset.initialized = "true";

    initializeScrolling(section);
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => initializeTechnologyMarquee(),
        { once: true }
    );
} else {
    initializeTechnologyMarquee();
}
