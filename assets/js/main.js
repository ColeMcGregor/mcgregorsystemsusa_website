
/**
 * Shared entry point for all pages.
 * Each feature checks for the element it needs before it starts.
 */

import { renderSiteHeader } from "./shared/site-header.js";
import { renderSiteFooter } from "./shared/site-footer.js";
import { initializeMobileNavigation } from "./shared/mobile-navigation.js";
import { initializeScopeBuilder } from "./features/scope-builder.js";
import { initializeHeroShowcase } from "./features/hero-showcase.js";
import { initializeServiceVisuals } from "./features/service-visuals.js";
import { initializeContactForms } from "./features/contact-form.js";

const siteRoot = new URL("../../", import.meta.url);

function initializeSite() {
    const navigation = renderSiteHeader(siteRoot);
    renderSiteFooter(siteRoot);

    if (navigation) {
        initializeMobileNavigation(navigation);
    }

    initializeHeroShowcase();
    initializeServiceVisuals();
    initializeScopeBuilder();
    initializeContactForms();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
} else {
    initializeSite();
}
