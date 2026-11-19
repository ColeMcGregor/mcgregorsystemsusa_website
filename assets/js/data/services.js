
/**
 * Published service packages and prices.
 * This module owns prices and package descriptions, not page layout or HTML.
 * The scope builder and service listings should import from this file.
 */

export const SERVICE_PRICES = Object.freeze({
    website: Object.freeze({
        small: 400,
        medium: 960,
        large: 2000,
        ecommerceStartingAt: 1440
    }),

    app: Object.freeze({
        small: 800,
        medium: 2000,
        large: 4800
    }),

    maintenanceHourly: 80,

    aiAutomation: Object.freeze({
        basicChatbot: 600,
        advancedChatbot: 1200,
        workflowAutomation: 2000,
        basicChatbotMonthly: 40,
        advancedChatbotMonthly: 60,
        automationToolsMonthlyRange: Object.freeze([40, 80])
    }),

    branding: Object.freeze({
        logoDesign: 240,
        brandKit: 600
    })
});

export const SERVICE_PACKAGES = Object.freeze({
    website: Object.freeze({
        small: Object.freeze({
            id: "single-page-website",
            label: "Single-page website",
            description: "A focused landing page for an organization, service, event, or campaign.",
            price: SERVICE_PRICES.website.small
        }),

        medium: Object.freeze({
            id: "essential-business-website",
            label: "Essential business website",
            description: "A multi-page website with clear navigation, a service overview, and a way for visitors to contact your business.",
            price: SERVICE_PRICES.website.medium
        }),

        large: Object.freeze({
            id: "professional-website",
            label: "Professional website",
            description: "A more involved website with additional content, page designs, and integrations agreed during project scoping.",
            price: SERVICE_PRICES.website.large
        })
    }),

    app: Object.freeze({
        small: Object.freeze({
            id: "starter-software-tool",
            label: "Starter software tool",
            description: "A small, clearly defined application or tool that addresses one operational need.",
            price: SERVICE_PRICES.app.small
        }),

        medium: Object.freeze({
            id: "custom-application",
            label: "Custom application",
            description: "An application with multiple functions, data handling, or external connections. Requirements determine the final quote.",
            price: SERVICE_PRICES.app.medium
        }),

        large: Object.freeze({
            id: "full-application",
            label: "Full application",
            description: "A larger system with several related features, users, or integration needs.",
            price: SERVICE_PRICES.app.large
        })
    })
});

export const SERVICE_CATEGORIES = Object.freeze([
    Object.freeze({
        id: "website",
        anchorId: "websites",
        title: "Business websites",
        description: "Public-facing websites, responsive layouts, contact paths, and the features a business actually needs."
    }),

    Object.freeze({
        id: "app",
        anchorId: "software",
        title: "Custom software",
        description: "Internal applications, data systems, and web-based tools for workflows that general-purpose products do not fit."
    })
]);

export const MAINTENANCE_SERVICE = Object.freeze({
    id: "support",
    anchorId: "support",
    title: "Maintenance, repair, and integration",
    description: "Work may include correcting defects, improving reports, connecting APIs, updating existing pages, reviewing data flow, or documenting software behavior.",
    hourlyRate: SERVICE_PRICES.maintenanceHourly,
    capabilities: Object.freeze([
        "Application troubleshooting and improvements",
        "Reporting and PDF-generation workflows",
        "Database, API, and service integration",
        "Technical review and system documentation"
    ])
});

export function getServicePackage(projectType, projectSize) {
    return SERVICE_PACKAGES[projectType]?.[projectSize] ?? null;
}

export function getStartingPrice(projectType, projectSize) {
    if (projectType === "both") {
        return getStartingPrice("website", projectSize) +
            getStartingPrice("app", projectSize);
    }

    const servicePackage = getServicePackage(projectType, projectSize);

    if (!servicePackage) {
        throw new Error(`Unknown service package: ${projectType}/${projectSize}`);
    }

    return servicePackage.price;
}

export function getPackageDescription(projectType, projectSize) {
    if (projectType === "both") {
        return `${getPackageDescription("website", projectSize)} + ` +
            getPackageDescription("app", projectSize);
    }

    const servicePackage = getServicePackage(projectType, projectSize);

    if (!servicePackage) {
        throw new Error(`Unknown service package: ${projectType}/${projectSize}`);
    }

    return servicePackage.label;
}

export function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(amount);
}
