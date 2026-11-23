
/**
 * Homepage project planner.
 * Generates the controls, updates the starting price, and copies selections
 * into the existing Formspree inquiry form without submitting the form.
 */

import {
    PROJECT_TYPES,
    PROJECT_SIZES,
    OPTIONAL_FEATURES,
    getStartingPrice,
    getPackageDescription
} from "./scope-options.js";

const formatCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

function makeChoices(items, selectedId) {
    return items.map((item) => `
        <button
            class="scope-choice${item.id === selectedId ? " selected" : ""}"
            type="button"
            data-value="${item.id}"
            aria-pressed="${item.id === selectedId}"
        >
            ${item.label}
            ${item.caption ? `<small>${item.caption}</small>` : ""}
        </button>
    `).join("");
}

function makeOptionalFeatures() {
    return OPTIONAL_FEATURES.map((feature) => `
        <label>
            <input type="checkbox" value="${feature.id}">
            <span>${feature.label}</span>
        </label>
    `).join("");
}

function getExtraLabels(selectedExtras) {
    return OPTIONAL_FEATURES
        .filter((feature) => selectedExtras.has(feature.id))
        .map((feature) => feature.label);
}

function buildInquirySummary(state) {
    const extras = getExtraLabels(state.extras);

    return [
        "[Project planner summary]",
        `Project type: ${PROJECT_TYPES.find((item) => item.id === state.kind).summary}`,
        `Package: ${getPackageDescription(state.kind, state.size)}`,
        `Starting price: ${formatCurrency.format(getStartingPrice(state.kind, state.size))}`,
        `Additional features: ${extras.length ? extras.join(", ") : "None selected"}`,
        "Pricing notice: This figure is preliminary and nonbinding. Additional requirements, project complexity, and technical review may affect final pricing. Actual pricing and deliverables are established through a separately accepted written proposal or agreement.",
        "[/Project planner summary]"
    ].join("\n");
}

function copyScopeToInquiry(state) {
    const contactSection = document.getElementById("contact");
    const form = document.getElementById("project-inquiry");
    const details = form?.querySelector('[name="project_details"]');
    const service = form?.querySelector('[name="service"]');

    if (!contactSection || !form || !details) {
        return;
    }

    const serviceName = state.kind === "website"
        ? "Custom website"
        : state.kind === "app"
            ? "Custom software"
            : "Website and custom software";

    if (service) {
        if (![...service.options].some((option) => option.value === serviceName)) {
            service.add(new Option(serviceName, serviceName));
        }

        service.value = serviceName;
    }

    // Remove only the summary we generated previously; preserve the visitor's writing.
    const previousSummary = details.dataset.scopeSummary;
    let visitorText = details.value;

    if (previousSummary && visitorText.startsWith(previousSummary)) {
        visitorText = visitorText.slice(previousSummary.length).trimStart();
    }

    const summary = buildInquirySummary(state);

    details.value = visitorText.trim()
        ? `${summary}\n\n${visitorText}`
        : `${summary}\n\n`;

    details.dataset.scopeSummary = summary;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    contactSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
    });

    details.focus({ preventScroll: true });

    details.setSelectionRange(
        details.value.length,
        details.value.length
    );
}

export function initializeScopeBuilder() {
    const mount = document.getElementById("scope-builder");

    if (!mount || mount.dataset.initialized === "true") {
        return;
    }

    const state = {
        kind: "website",
        size: "medium",
        extras: new Set()
    };

    // These classes are defined in assets/css/features/scope-builder.css.
    mount.innerHTML = `
        <div class="scope-layout">
            <div class="scope-controls">

                <fieldset class="scope-group">
                    <legend>
                        <span class="scope-step">01</span>
                        What are we building?
                    </legend>

                    <div
                        class="scope-choice-row"
                        data-scope-group="kind"
                    >
                        ${makeChoices(PROJECT_TYPES, state.kind)}
                    </div>
                </fieldset>

                <fieldset class="scope-group">
                    <legend>
                        <span class="scope-step">02</span>
                        How involved is it?
                    </legend>

                    <div
                        class="scope-choice-row"
                        data-scope-group="size"
                    >
                        ${makeChoices(PROJECT_SIZES, state.size)}
                    </div>
                </fieldset>

                <fieldset class="scope-group">
                    <legend>
                        <span class="scope-step">03</span>
                        What else might it need?
                    </legend>

                    <div class="scope-checks">
                        ${makeOptionalFeatures()}
                    </div>
                </fieldset>

            </div>

            <aside
                class="scope-output"
                aria-label="Project pricing summary"
            >
                <div class="scope-output-head">
                    <span>YOUR PROJECT SNAPSHOT</span>

                    <span class="live-indicator">
                        <i aria-hidden="true"></i>
                        Updates live
                    </span>
                </div>

                <div class="scope-description">
                    <span class="caps">Starting at</span>

                    <div
                        class="scope-number"
                        id="scopeTotal"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                    ></div>

                    <p class="scope-disclaimer">
                        This is a preliminary, nonbinding starting
                        estimate, not a final quote. Software projects
                        vary in complexity, requirements, and scope.
                        Final pricing is established through a
                        separately accepted written agreement.
                        <a href="legal.html#terms">
                            Read our pricing terms.
                        </a>
                    </p>
                </div>

                <div class="scope-breakdown">
                    <div>
                        <span>Project type</span>
                        <strong id="scopeKind"></strong>
                    </div>

                    <div>
                        <span>Project size</span>
                        <strong id="scopeSize"></strong>
                    </div>

                    <div>
                        <span>Extra needs</span>
                        <strong id="scopeAddons"></strong>
                    </div>
                </div>

                <div class="scope-output-tip">
                    <b id="scopeSummary"></b>

                    <p>
                        Selected extras are not priced automatically.
                        Technical requirements, added features,
                        and project constraints may affect the
                        final scope and price.
                    </p>
                </div>

                <button
                    class="btn btn-white scope-contact"
                    id="useScope"
                    type="button"
                >
                    Include this in my inquiry
                    <span aria-hidden="true">↗</span>
                </button>

                <span class="scope-note">
                    No information is sent until you submit
                    the contact form.
                </span>
            </aside>
        </div>
    `;

    const total = mount.querySelector("#scopeTotal");
    const kind = mount.querySelector("#scopeKind");
    const size = mount.querySelector("#scopeSize");
    const extras = mount.querySelector("#scopeAddons");
    const summary = mount.querySelector("#scopeSummary");

    function updateSummary() {
        const projectType = PROJECT_TYPES.find(
            (item) => item.id === state.kind
        );

        const projectSize = PROJECT_SIZES.find(
            (item) => item.id === state.size
        );

        const extraLabels = getExtraLabels(state.extras);

        total.textContent = formatCurrency.format(
            getStartingPrice(state.kind, state.size)
        );

        kind.textContent = projectType.summary;
        size.textContent = projectSize.label;

        extras.textContent = extraLabels.length
            ? extraLabels.join(", ")
            : "None selected";

        summary.textContent = getPackageDescription(
            state.kind,
            state.size
        );
    }

    for (const group of mount.querySelectorAll("[data-scope-group]")) {
        group.addEventListener("click", (event) => {
            const button = event.target.closest(
                "button.scope-choice"
            );

            if (!button || !group.contains(button)) {
                return;
            }

            const setting = group.dataset.scopeGroup;
            state[setting] = button.dataset.value;

            for (const choice of group.querySelectorAll(".scope-choice")) {
                const selected = choice === button;

                choice.classList.toggle("selected", selected);
                choice.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            }

            updateSummary();
        });
    }

    mount.querySelector(".scope-checks").addEventListener(
        "change",
        (event) => {
            const checkbox = event.target;

            if (
                !(checkbox instanceof HTMLInputElement) ||
                checkbox.type !== "checkbox"
            ) {
                return;
            }

            if (checkbox.checked) {
                state.extras.add(checkbox.value);
            } else {
                state.extras.delete(checkbox.value);
            }

            updateSummary();
        }
    );

    mount.querySelector("#useScope").addEventListener(
        "click",
        () => copyScopeToInquiry(state)
    );

    updateSummary();
    mount.dataset.initialized = "true";
}
