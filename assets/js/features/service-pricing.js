
/**
 * Display published prices from the shared service data.
 * This module does not define or store price amounts.
 */

import {
    getServicePackage,
    SERVICE_PRICES,
    formatPrice
} from "../data/services.js";

export function renderServicePrices(root = document) {
    root.querySelectorAll("[data-starting-price]").forEach((element) => {
        const serviceType = element.dataset.startingPrice;
        const packageSize = element.dataset.packageSize;
        const servicePackage = getServicePackage(serviceType, packageSize);

        if (!servicePackage) {
            console.error(`Unknown service package: ${serviceType}/${packageSize}`);
            return;
        }

        element.textContent = `Starting at ${formatPrice(servicePackage.price)}`;
    });

    root.querySelectorAll("[data-hourly-rate]").forEach((element) => {
        element.textContent = `Hourly support: ${formatPrice(SERVICE_PRICES.maintenanceHourly)}/hour`;
    });
}

renderServicePrices();
