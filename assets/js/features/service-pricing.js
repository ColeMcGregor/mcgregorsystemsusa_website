
/**
 * Display published prices from the shared service data.
 * This module does not define or store price amounts.
 */

import {
    getServicePackage,
    SERVICE_PRICES,
    formatPrice
} from "../data/services.js";

const PRICING_NOTICE =
    "Preliminary pricing only. Final pricing depends on project scope and written agreement.";

function addPricingNotice(element) {
    let notice = element.nextElementSibling;

    if (!notice || !notice.classList.contains("service-pricing-notice")) {
        notice = document.createElement("small");
        notice.className = "service-pricing-notice";

        notice.style.display = "block";
        notice.style.marginTop = "6px";
        notice.style.fontSize = "11px";
        notice.style.lineHeight = "1.6";
        notice.style.fontWeight = "400";

        element.insertAdjacentElement("afterend", notice);
    }

    notice.replaceChildren();

    notice.append(document.createTextNode(`${PRICING_NOTICE} `));

    const link = document.createElement("a");
    link.href = new URL("legal.html#terms", document.baseURI).href;
    link.textContent = "Pricing terms";
    link.style.textDecoration = "underline";
    link.style.textUnderlineOffset = "2px";

    notice.append(link);
}

export function renderServicePrices(root = document) {
    root.querySelectorAll("[data-starting-price]").forEach((element) => {
        const serviceType = element.dataset.startingPrice;
        const packageSize = element.dataset.packageSize;
        const servicePackage = getServicePackage(serviceType, packageSize);

        if (!servicePackage) {
            console.error(
                `Unknown service package: ${serviceType}/${packageSize}`
            );
            return;
        }

        element.textContent =
            `Starting at ${formatPrice(servicePackage.price)}`;

        addPricingNotice(element);
    });

    root.querySelectorAll("[data-hourly-rate]").forEach((element) => {
        element.textContent =
            `Hourly support: ${formatPrice(SERVICE_PRICES.maintenanceHourly)}/hour`;

        addPricingNotice(element);
    });
}

renderServicePrices();
