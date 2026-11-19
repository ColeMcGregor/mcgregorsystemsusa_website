
/**
 * Project planner choices and package references.
 * Published prices and package descriptions are defined in ../data/services.js.
 * Optional features have no automatic price until a scope has been reviewed.
 */

import {
    SERVICE_PRICES,
    SERVICE_PACKAGES
} from "../data/services.js";

// Preserve the existing pricing API for any code still using these names.
// The amounts themselves are defined only in services.js.
export const PRICING = Object.freeze({
    websites: Object.freeze({
        singlePage: SERVICE_PRICES.website.small,
        essential: SERVICE_PRICES.website.medium,
        professional: SERVICE_PRICES.website.large,
        ecommerceStartingAt: SERVICE_PRICES.website.ecommerceStartingAt
    }),

    software: Object.freeze({
        starterTool: SERVICE_PRICES.app.small,
        customApplication: SERVICE_PRICES.app.medium,
        fullApplication: SERVICE_PRICES.app.large,
        hourlySupport: SERVICE_PRICES.maintenanceHourly
    }),

    aiAutomation: SERVICE_PRICES.aiAutomation,
    branding: SERVICE_PRICES.branding
});

export const PACKAGES = SERVICE_PACKAGES;

export const PROJECT_TYPES = Object.freeze([
    Object.freeze({
        id: "website",
        label: "A website",
        summary: "Business website"
    }),

    Object.freeze({
        id: "app",
        label: "Custom software",
        summary: "Custom software"
    }),

    Object.freeze({
        id: "both",
        label: "Both",
        summary: "Website + custom software"
    })
]);

export const PROJECT_SIZES = Object.freeze([
    Object.freeze({
        id: "small",
        label: "Focused",
        caption: "A few key features"
    }),

    Object.freeze({
        id: "medium",
        label: "Standard",
        caption: "Several features"
    }),

    Object.freeze({
        id: "large",
        label: "Complex",
        caption: "Many moving parts"
    })
]);

export const OPTIONAL_FEATURES = Object.freeze([
    Object.freeze({
        id: "booking",
        label: "Booking or scheduling"
    }),

    Object.freeze({
        id: "roles",
        label: "User accounts & roles"
    }),

    Object.freeze({
        id: "integration",
        label: "External system integration"
    }),

    Object.freeze({
        id: "reporting",
        label: "Reports and exports"
    }),

    Object.freeze({
        id: "payments",
        label: "Online payments"
    }),

    Object.freeze({
        id: "automation",
        label: "Workflow automation"
    })
]);

// Re-export the existing functions so scope-builder.js needs no changes.
export {
    getStartingPrice,
    getPackageDescription
} from "../data/services.js";
