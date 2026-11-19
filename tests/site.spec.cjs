const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * McGregor Systems LLC site-wide regression suite.
 * Place at tests/site.spec.cjs, with playwright.config.cjs at the site root.
 * All Formspree requests in submission tests are intercepted; no real email is sent.
 */

const PAGES = [
    { file: 'index.html', title: /McGregor Systems LLC/i },
    { file: 'services.html', title: /Services/i },
    { file: 'work.html', title: /Selected Work/i },
    { file: 'contact.html', title: /Contact/i },
    { file: 'process.html', title: /Process/i },
    { file: 'government.html', title: /Government/i },
    { file: 'about.html', title: /About/i },
    { file: 'privacy.html', title: /Privacy/i },
    { file: '404.html', title: /Page Not Found/i }
];

const MENU_ITEMS = [
    { label: 'Services', file: 'services.html' },
    { label: 'Scope builder', file: 'index.html', hash: 'scope' },
    { label: 'Work', file: 'work.html' },
    { label: 'Process', file: 'process.html' },
    { label: 'Government', file: 'government.html' },
    { label: 'About', file: 'about.html' }
];

const CASE_STUDIES = [
    { id: 'ras-systems', label: /commercial contract/i },
    { id: 'eldvatten', label: /independent/i },
    { id: 'healthcare-scheduler', label: /academic/i }
];

const PROJECT_TYPES = ['website', 'app', 'both'];
const PROJECT_SIZES = ['small', 'medium', 'large'];
const EXTRAS = [
    { value: 'booking', label: 'Booking or scheduling' },
    { value: 'roles', label: 'User accounts & roles' },
    { value: 'integration', label: 'External system integration' },
    { value: 'reporting', label: 'Reports and exports' },
    { value: 'payments', label: 'Online payments' },
    { value: 'automation', label: 'Workflow automation' }
];

const FORM_PAGES = [
    {
        path: '/index.html#contact',
        fields: {
            first: '#first-name',
            last: '#last-name',
            email: '#email',
            phone: '#phone',
            service: '#service-interest',
            details: '#project-details'
        }
    },
    {
        path: '/contact.html',
        fields: {
            first: '#contact-first-name',
            last: '#contact-last-name',
            email: '#contact-email',
            phone: '#contact-phone',
            service: '#contact-service',
            details: '#contact-project-details'
        }
    }
];

const formatUSD = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
}).format(amount);

async function publishedPriceData(page) {
    return page.evaluate(async () => {
        const { SERVICE_PACKAGES, SERVICE_PRICES } = await import('/assets/js/data/services.js');
        return {
            packages: {
                website: Object.fromEntries(
                    ['small', 'medium', 'large'].map((size) => [size, SERVICE_PACKAGES.website[size].price])
                ),
                app: Object.fromEntries(
                    ['small', 'medium', 'large'].map((size) => [size, SERVICE_PACKAGES.app[size].price])
                )
            },
            hourly: SERVICE_PRICES.maintenanceHourly,
            ecommerce: SERVICE_PRICES.website.ecommerceStartingAt,
            aiAutomation: SERVICE_PRICES.aiAutomation,
            branding: SERVICE_PRICES.branding
        };
    });
}

async function chooseScope(page, group, value) {
    const choice = page.locator(`[data-scope-group="${group}"] button[data-value="${value}"]`);
    await choice.click();
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    await expect(choice).toHaveClass(/selected/);
}

async function fillInquiry(page, fields, details = 'Please review this test inquiry.') {
    await page.locator(fields.first).fill('Browser');
    await page.locator(fields.last).fill('Test');
    await page.locator(fields.email).fill('browser.test@example.com');
    await page.locator(fields.details).fill(details);
}

async function mockFormspree(page, handler) {
    await page.route('https://formspree.io/**', handler);
}

function inquiryForm(page) {
    return page.locator('form#project-inquiry');
}

async function horizontalOverflow(page) {
    return page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
    }));
}

// -----------------------------------------------------------------------------
// Shared document quality, asset loading, and internal-link integrity.
// -----------------------------------------------------------------------------

test.describe('Every page: structure, links, resources, and accessibility', () => {
    for (const { file, title } of PAGES) {
        test(`${file}: loads with the correct document structure`, async ({ page }) => {
            const response = await page.goto(`/${file}`);
            expect(response?.status()).toBe(200);
            await expect(page).toHaveTitle(title);
            await expect(page.locator('#main-content')).toBeVisible();
            await expect(page.locator('#navbar')).toBeVisible();
            await expect(page.locator('#navlinks')).toHaveCount(1);
            await expect(page.locator('footer.footer')).toBeVisible();
            await expect(page.locator('main h1')).toHaveCount(1);
            await expect(page.locator('html')).toHaveAttribute('lang', 'en');
            await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
            const description = await page.locator('meta[name="description"]').getAttribute('content');
            expect(description?.trim().length).toBeGreaterThan(30);
        });

        test(`${file}: shared entry point and stylesheets are included once`, async ({ page }) => {
            await page.goto(`/${file}`);
            await expect(page.locator('script[type="module"][src$="assets/js/main.js"]')).toHaveCount(1);
            await expect(page.locator('link[rel="stylesheet"][href$="assets/css/site.css"]')).toHaveCount(1);
            await expect(page.locator('link[rel="stylesheet"][href*="assets/css/pages/"]')).toHaveCount(1);
            const expectedPricing = ['index.html', 'services.html'].includes(file) ? 1 : 0;
            await expect(page.locator('script[type="module"][src$="features/service-pricing.js"]'))
                .toHaveCount(expectedPricing);
        });

        test(`${file}: IDs are unique and visible form fields have labels`, async ({ page }) => {
            await page.goto(`/${file}`);
            const violations = await page.evaluate(() => {
                const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
                const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
                const unlabeled = [...document.querySelectorAll('input, select, textarea')]
                    .filter((node) => node.type !== 'hidden' && !node.hidden && node.getAttribute('aria-hidden') !== 'true')
                    .filter((node) => !node.labels?.length && !node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby'))
                    .map((node) => node.outerHTML.slice(0, 180));
                return { duplicateIds, unlabeled };
            });
            expect(violations.duplicateIds).toEqual([]);
            expect(violations.unlabeled).toEqual([]);
        });

        test(`${file}: no internal links point to missing pages or anchors`, async ({ page }) => {
            await page.goto(`/${file}`);
            const failures = await page.evaluate(async () => {
                const destinationCache = new Map();
                const errors = [];
                const links = [...document.querySelectorAll('a[href]')];

                for (const link of links) {
                    const raw = link.getAttribute('href');
                    if (!raw?.trim() || raw.trim() === '#') {
                        errors.push(`Empty link: ${link.outerHTML.slice(0, 160)}`);
                        continue;
                    }

                    const url = new URL(raw, location.href);
                    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) {
                        continue;
                    }

                    const resource = `${url.pathname}${url.search}`;
                    let target = destinationCache.get(resource);
                    if (!target) {
                        try {
                            const response = await fetch(resource, { credentials: 'same-origin' });
                            const text = await response.text();
                            target = {
                                ok: response.ok,
                                status: response.status,
                                document: new DOMParser().parseFromString(text, 'text/html')
                            };
                        } catch (error) {
                            target = { ok: false, status: String(error), document: null };
                        }
                        destinationCache.set(resource, target);
                    }

                    if (!target.ok) {
                        errors.push(`${raw} returned ${target.status}`);
                        continue;
                    }

                    if (url.hash) {
                        const fragment = decodeURIComponent(url.hash.slice(1));
                        if (fragment && !target.document.getElementById(fragment) &&
                            !target.document.querySelector(`[name="${CSS.escape(fragment)}"]`)) {
                            errors.push(`${raw} has no matching target #${fragment}`);
                        }
                    }
                }

                return errors;
            });
            expect(failures).toEqual([]);
        });

        test(`${file}: local CSS, JavaScript, favicon, and images load`, async ({ page }) => {
            const brokenResources = [];
            page.on('response', (response) => {
                if (new URL(response.url()).origin ===
                    new URL(process.env.SITE_URL || 'http://127.0.0.1:4173').origin) {
                    if (response.status() >= 400) brokenResources.push(`${response.status()} ${response.url()}`);
                }
            });

            await page.goto(`/${file}`);
            await expect(page.locator('#navbar')).toBeVisible();
            await page.locator('footer').scrollIntoViewIfNeeded();
            const images = await page.locator('img').evaluateAll(async (nodes) => {
                return Promise.all(nodes.map(async (img) => {
                    img.loading = 'eager';
                    try { await img.decode(); } catch { /* We report its URL below. */ }
                    return { src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 };
                }));
            });
            expect(images.filter((item) => !item.loaded)).toEqual([]);

            const favicon = await page.evaluate(async () => {
                const icon = document.querySelector('link[rel="icon"]');
                if (!icon) return { found: false, status: 0 };
                const response = await fetch(icon.href);
                return { found: true, status: response.status };
            });
            expect(favicon).toEqual({ found: true, status: 200 });
            expect(brokenResources).toEqual([]);

            const styleSheetCount = await page.evaluate(() => [...document.styleSheets]
                .filter((sheet) => sheet.href && new URL(sheet.href).origin === location.origin).length);
            expect(styleSheetCount).toBeGreaterThanOrEqual(2);
        });

        test(`${file}: no unexpected JavaScript errors on load`, async ({ page }) => {
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            page.on('console', (message) => {
                if (message.type() === 'error') errors.push(message.text());
            });
            await page.goto(`/${file}`);
            await expect(page.locator('#navbar')).toBeVisible();
            await expect(page.locator('footer .footbottom')).toBeVisible();
            expect(errors).toEqual([]);
        });

        test(`${file}: WCAG A/AA automated audit`, async ({ page }) => {
            await page.goto(`/${file}`);
            await expect(page.locator('#navbar')).toBeVisible();
            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                .analyze();
            expect(results.violations).toEqual([]);
        });
    }
});

// -----------------------------------------------------------------------------
// Global header, footer, and active navigation.
// -----------------------------------------------------------------------------

test.describe('Shared navigation and footer', () => {
    test('brand logo links home from a different page', async ({ page }) => {
        await page.goto('/government.html');
        await page.locator('#navbar a.brand').click();
        await expect(page).toHaveURL(/\/index\.html$/);
        await expect(page.locator('#home')).toBeVisible();
    });

    for (const item of MENU_ITEMS) {
        test(`header ${item.label} link reaches the intended page`, async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('#navlinks').getByRole('link', { name: item.label, exact: true }).click();
            const suffix = item.hash ? `#${item.hash}` : '';
            await expect(page).toHaveURL(new RegExp(`/${item.file.replace('.', '\\.')}${suffix}$`));
            if (item.hash) await expect(page.locator(`#${item.hash}`)).toBeVisible();
        });
    }

    for (const item of MENU_ITEMS.filter((item) => !item.hash)) {
        test(`${item.file} shows only its navigation entry as current`, async ({ page }) => {
            await page.goto(`/${item.file}`);
            const current = page.locator('#navlinks [aria-current="page"]');
            await expect(current).toHaveCount(1);
            await expect(current).toHaveText(item.label);
        });
    }

    const footerTargets = [
        { label: 'Our process', path: '/process.html' },
        { label: 'About', path: '/about.html' },
        { label: 'Government & subcontracting', path: '/government.html' },
        { label: 'Project inquiry', path: '/contact.html' },
        { label: 'Privacy Policy', path: '/privacy.html' }
    ];
    for (const target of footerTargets) {
        test(`footer ${target.label} link works`, async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('footer').getByRole('link', { name: target.label, exact: true }).click();
            await expect(page).toHaveURL(new RegExp(`${target.path.replace('.', '\\.')}$`));
        });
    }

    test('all pages use the same primary navigation labels in the same order', async ({ page }) => {
        for (const { file } of PAGES) {
            await page.goto(`/${file}`);
            await expect(page.locator('#navlinks a')).toHaveText(MENU_ITEMS.map((item) => item.label));
        }
    });

    test('footer uses the configured email address and a current-year copyright', async ({ page }) => {
        await page.goto('/index.html');
        await expect(page.locator('footer a[href="mailto:mcgregorsystemsllc@gmail.com"]')).toBeVisible();
        await expect(page.locator('footer .footbottom'))
            .toContainText(String(new Date().getFullYear()));
    });

    test('desktop menu button is not visible and nav links remain accessible', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await page.goto('/index.html');
        await expect(page.locator('#mobileMenu')).toBeHidden();
        await expect(page.locator('#navlinks')).toBeVisible();
    });
});

// -----------------------------------------------------------------------------
// Homepage: navigation, illustrations, and project cards.
// -----------------------------------------------------------------------------

test.describe('Homepage features', () => {
    test('hero and both service illustrations initialize once', async ({ page }) => {
        await page.goto('/index.html');
        for (const selector of [
            '#hero-showcase',
            '[data-component="website-service-visual"]',
            '[data-component="software-service-visual"]'
        ]) {
            await expect(page.locator(selector)).toHaveAttribute('data-initialized', 'true');
            await expect(page.locator(selector)).toHaveAttribute('role', 'img');
            await expect(page.locator(selector)).toHaveAttribute('aria-label', /concept/i);
        }
        await expect(page.locator('.showcase-app-window')).toHaveCount(1);
        await expect(page.locator('.showcase-site-window')).toHaveCount(1);
        await expect(page.locator('.web-demo')).toHaveCount(1);
        await expect(page.locator('.sys-demo')).toHaveCount(1);
    });

    test('hero inquiry button moves to the homepage contact form', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('.hero-actions a[href="#contact"]').click();
        await expect(page).toHaveURL(/#contact$/);
        await expect(page.locator('#project-inquiry')).toBeVisible();
    });

    test('hero scope button moves to the interactive planner', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('.hero-actions a[href="#scope"]').click();
        await expect(page).toHaveURL(/#scope$/);
        await expect(page.locator('#scope-builder[data-initialized="true"]')).toBeVisible();
    });

    for (const item of [
        { href: 'services.html#websites', id: 'websites' },
        { href: 'services.html#software', id: 'software' }
    ]) {
        test(`homepage service link opens ${item.id} section`, async ({ page }) => {
            await page.goto('/index.html');
            await page.locator(`.dual-services a[href="${item.href}"]`).click();
            await expect(page).toHaveURL(new RegExp(`/services\\.html#${item.id}$`));
            await expect(page.locator(`#${item.id}`)).toBeVisible();
        });
    }

    for (const study of CASE_STUDIES) {
        test(`homepage ${study.id} card links to the matching study`, async ({ page }) => {
            await page.goto('/index.html');
            const link = page.locator(`.work-grid a[href="work.html#${study.id}"]`);
            await expect(link).toHaveCount(1);
            await link.click();
            await expect(page).toHaveURL(new RegExp(`/work\\.html#${study.id}$`));
            await expect(page.locator(`section#${study.id}`)).toBeVisible();
        });
    }

    test('homepage government inquiry button goes to its contact section', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('#government a[href="#contact"]').click();
        await expect(page).toHaveURL(/#contact$/);
        await expect(page.locator('#project-inquiry')).toBeVisible();
    });
});

// -----------------------------------------------------------------------------
// Services and published pricing: values derive from services.js.
// -----------------------------------------------------------------------------

test.describe('Services and shared published pricing', () => {
    for (const type of ['website', 'app']) {
        for (const size of PROJECT_SIZES) {
            test(`Services shows ${type}/${size} starting price from services.js`, async ({ page }) => {
                await page.goto('/services.html');
                const prices = await publishedPriceData(page);
                await expect(page.locator(
                    `[data-starting-price="${type}"][data-package-size="${size}"]`
                )).toHaveText(`Starting at ${formatUSD(prices.packages[type][size])}`);
            });
        }
    }

    test('Services shows the configured hourly maintenance rate', async ({ page }) => {
        await page.goto('/services.html');
        const prices = await publishedPriceData(page);
        await expect(page.locator('[data-hourly-rate]'))
            .toHaveText(`Hourly support: ${formatUSD(prices.hourly)}/hour`);
    });

    test('homepage and Services show identical small-package prices', async ({ page }) => {
        await page.goto('/index.html');
        const prices = await publishedPriceData(page);
        for (const type of ['website', 'app']) {
            await expect(page.locator(
                `[data-starting-price="${type}"][data-package-size="small"]`
            )).toHaveText(`Starting at ${formatUSD(prices.packages[type].small)}`);
        }
        await page.goto('/services.html');
        for (const type of ['website', 'app']) {
            await expect(page.locator(
                `[data-starting-price="${type}"][data-package-size="small"]`
            )).toHaveText(`Starting at ${formatUSD(prices.packages[type].small)}`);
        }
    });

    test('services.js exports complete, finite, positive prices', async ({ page }) => {
        await page.goto('/services.html');
        const data = await publishedPriceData(page);
        const amounts = [
            ...Object.values(data.packages.website),
            ...Object.values(data.packages.app),
            data.hourly, data.ecommerce,
            data.aiAutomation.basicChatbot,
            data.aiAutomation.advancedChatbot,
            data.aiAutomation.workflowAutomation,
            data.aiAutomation.basicChatbotMonthly,
            data.aiAutomation.advancedChatbotMonthly,
            ...data.aiAutomation.automationToolsMonthlyRange,
            data.branding.logoDesign,
            data.branding.brandKit
        ];
        expect(amounts.every((amount) => Number.isFinite(amount) && amount > 0)).toBe(true);
    });

    test('all six package cards and the support card remain present', async ({ page }) => {
        await page.goto('/services.html');
        await expect(page.locator('#websites .service-plan-card')).toHaveCount(3);
        await expect(page.locator('#software .service-plan-card')).toHaveCount(3);
        await expect(page.locator('#support .service-support-card')).toHaveCount(1);
    });

    test('Services project planner action opens the homepage planner', async ({ page }) => {
        await page.goto('/services.html');
        await page.getByRole('link', { name: /Open the project planner/ }).click();
        await expect(page).toHaveURL(/\/index\.html#scope$/);
        await expect(page.locator('#scopeTotal')).toBeVisible();
    });

    test('Services contact actions open the contact page', async ({ page }) => {
        await page.goto('/services.html');
        await page.locator('.services-cta a[href="contact.html"]').click();
        await expect(page).toHaveURL(/\/contact\.html$/);
        await expect(inquiryForm(page)).toBeVisible();
    });
});

// -----------------------------------------------------------------------------
// Project scope builder: all 3 x 3 packages and all optional features.
// -----------------------------------------------------------------------------

test.describe('Project planner', () => {
    test('initial state has website / standard selected and correct summary', async ({ page }) => {
        await page.goto('/index.html#scope');
        const prices = await publishedPriceData(page);
        await expect(page.locator('#scope-builder')).toHaveAttribute('data-initialized', 'true');
        await expect(page.locator('#scopeTotal')).toHaveText(formatUSD(prices.packages.website.medium));
        await expect(page.locator('#scopeKind')).toHaveText('Business website');
        await expect(page.locator('#scopeSize')).toHaveText('Standard');
        await expect(page.locator('#scopeAddons')).toHaveText('None selected');
        await expect(page.locator('[data-scope-group="kind"] [aria-pressed="true"]')).toHaveCount(1);
        await expect(page.locator('[data-scope-group="size"] [aria-pressed="true"]')).toHaveCount(1);
    });

    for (const kind of PROJECT_TYPES) {
        for (const size of PROJECT_SIZES) {
            test(`${kind}/${size}: total, controls, and package summary update`, async ({ page }) => {
                await page.goto('/index.html#scope');
                const data = await publishedPriceData(page);
                await chooseScope(page, 'kind', kind);
                await chooseScope(page, 'size', size);
                const amount = kind === 'both'
                    ? data.packages.website[size] + data.packages.app[size]
                    : data.packages[kind][size];
                await expect(page.locator('#scopeTotal')).toHaveText(formatUSD(amount));
                await expect(page.locator('#scopeSummary')).not.toBeEmpty();
                await expect(page.locator('#scopeTotal')).not.toContainText('NaN');
                await expect(page.locator('[data-scope-group="kind"] [aria-pressed="true"]')).toHaveCount(1);
                await expect(page.locator('[data-scope-group="size"] [aria-pressed="true"]')).toHaveCount(1);
            });
        }
    }

    for (const extra of EXTRAS) {
        test(`${extra.label}: selection updates extras but not the quoted starting price`, async ({ page }) => {
            await page.goto('/index.html#scope');
            const before = await page.locator('#scopeTotal').textContent();
            const box = page.locator(`.scope-checks input[value="${extra.value}"]`);
            await box.check();
            await expect(box).toBeChecked();
            await expect(page.locator('#scopeAddons')).toContainText(extra.label);
            await expect(page.locator('#scopeTotal')).toHaveText(before);
            await box.uncheck();
            await expect(page.locator('#scopeAddons')).toHaveText('None selected');
            await expect(page.locator('#scopeTotal')).toHaveText(before);
        });
    }

    test('multiple extras display in a stable order and can all be cleared', async ({ page }) => {
        await page.goto('/index.html#scope');
        for (const extra of [...EXTRAS].reverse()) {
            await page.locator(`.scope-checks input[value="${extra.value}"]`).check();
        }
        await expect(page.locator('#scopeAddons')).toHaveText(EXTRAS.map((extra) => extra.label).join(', '));
        for (const extra of EXTRAS) {
            await page.locator(`.scope-checks input[value="${extra.value}"]`).uncheck();
        }
        await expect(page.locator('#scopeAddons')).toHaveText('None selected');
    });

    for (const [kind, expectedValue] of [
        ['website', 'Business website'],
        ['app', 'Custom software'],
        ['both', 'Website and custom software']
    ]) {
        test(`including ${kind} scope selects the correct contact service`, async ({ page }) => {
            let submissions = 0;
            await mockFormspree(page, async (route) => { submissions += 1; await route.abort(); });
            await page.goto('/index.html#scope');
            await chooseScope(page, 'kind', kind);
            await page.locator('#useScope').click();
            await expect(page.locator('#service-interest')).toHaveValue(expectedValue);
            await expect(page.locator('#project-details')).toHaveValue(/\[Project planner summary\]/);
            await expect(page.locator('#project-details')).toHaveValue(/Starting price:/);
            await expect(page.locator('#project-details')).toBeFocused();
            expect(submissions).toBe(0);
        });
    }

    test('scope insertion preserves visitor text, includes extras, and stays idempotent', async ({ page }) => {
        await page.goto('/index.html#scope');
        await page.locator('#project-details').fill('The old software must stay online.');
        await chooseScope(page, 'kind', 'app');
        await page.locator('.scope-checks input[value="integration"]').check();
        await page.locator('#useScope').click();
        await expect(page.locator('#project-details')).toHaveValue(/External system integration/);
        await expect(page.locator('#project-details')).toHaveValue(/The old software must stay online\./);
        await page.locator('#useScope').click();
        const value = await page.locator('#project-details').inputValue();
        expect(value.match(/\[Project planner summary\]/g)).toHaveLength(1);
        expect(value.match(/The old software must stay online\./g)).toHaveLength(1);
    });

    test('updated planner selections replace only the previous generated summary', async ({ page }) => {
        await page.goto('/index.html#scope');
        await page.locator('#project-details').fill('Do not lose this line.');
        await page.locator('#useScope').click();
        await chooseScope(page, 'kind', 'both');
        await chooseScope(page, 'size', 'large');
        await page.locator('#useScope').click();
        const text = await page.locator('#project-details').inputValue();
        expect(text.match(/\[Project planner summary\]/g)).toHaveLength(1);
        expect(text).toContain('Website + custom software');
        expect(text).toContain('Do not lose this line.');
        expect(text).toContain('Full application');
    });

    test('planner selection is reset after a new page load', async ({ page }) => {
        await page.goto('/index.html#scope');
        await chooseScope(page, 'kind', 'both');
        await chooseScope(page, 'size', 'large');
        await page.locator('.scope-checks input[value="payments"]').check();
        await page.reload();
        await expect(page.locator('#scopeKind')).toHaveText('Business website');
        await expect(page.locator('#scopeSize')).toHaveText('Standard');
        await expect(page.locator('#scopeAddons')).toHaveText('None selected');
    });
});

// -----------------------------------------------------------------------------
// Work, process, government, about, privacy, and the explicit 404 document.
// -----------------------------------------------------------------------------

test.describe('Selected Work page', () => {
    test('the three project categories are identified accurately', async ({ page }) => {
        await page.goto('/work.html');
        for (const study of CASE_STUDIES) {
            const section = page.locator(`#${study.id}`);
            await expect(section).toBeVisible();
            await expect(section.locator('.caps')).toContainText(study.label);
        }
    });

    for (const study of CASE_STUDIES) {
        test(`${study.id}: native technical-details disclosure opens and closes`, async ({ page }) => {
            await page.goto(`/work.html#${study.id}`);
            const details = page.locator(`#${study.id} details.case-study__details`);
            await expect(details).toHaveCount(1);
            await expect(details).not.toHaveAttribute('open', '');
            await details.locator('summary').click();
            await expect(details).toHaveAttribute('open', '');
            await expect(details.locator('.case-study__details-body')).toBeVisible();
            await details.locator('summary').click();
            await expect(details).not.toHaveAttribute('open', '');
        });
    }

    test('disclosure is keyboard operable without custom JavaScript', async ({ page }) => {
        await page.goto('/work.html#eldvatten');
        const details = page.locator('#eldvatten details');
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(details).toHaveAttribute('open', '');
        await page.keyboard.press('Space');
        await expect(details).not.toHaveAttribute('open', '');
    });

    test('removed standalone case-study pages are not linked anywhere on Work', async ({ page }) => {
        await page.goto('/work.html');
        await expect(page.locator('a[href^="work/"]')).toHaveCount(0);
        await expect(page.locator('a[href$="ras-systems.html"], a[href$="eldvatten.html"], a[href$="healthcare-scheduler.html"]'))
            .toHaveCount(0);
    });

    test('Work call-to-action opens Contact', async ({ page }) => {
        await page.goto('/work.html');
        await page.locator('.work-page-cta a[href="contact.html"]').click();
        await expect(page).toHaveURL(/\/contact\.html$/);
    });
});

test.describe('Process page', () => {
    test('four process stages and their outputs are present', async ({ page }) => {
        await page.goto('/process.html');
        await expect(page.locator('.process-stage')).toHaveCount(4);
        await expect(page.locator('.process-stage-number')).toHaveText(['01', '02', '03', '04']);
        await expect(page.locator('.process-stage-result')).toHaveCount(4);
        await expect(page.locator('.process-work-card')).toHaveCount(3);
    });

    test('intro stage action resolves the stages anchor', async ({ page }) => {
        await page.goto('/process.html');
        await page.locator('a[href="#stages"]').click();
        await expect(page).toHaveURL(/#stages$/);
        await expect(page.locator('#stages')).toBeVisible();
    });

    test('scope action links to Services', async ({ page }) => {
        await page.goto('/process.html');
        await page.locator('a[href="services.html"]').click();
        await expect(page).toHaveURL(/\/services\.html$/);
    });
});

test.describe('Government page', () => {
    test('certification panel and four technical capability cards appear', async ({ page }) => {
        await page.goto('/government.html');
        await expect(page.locator('.government-certification')).toContainText(/SDVOB/i);
        await expect(page.locator('.government-capability-card')).toHaveCount(4);
        await expect(page.locator('.government-certification-logo')).toHaveAttribute('alt', /Service-Disabled Veteran/i);
    });

    test('capability anchor and business inquiry actions work', async ({ page }) => {
        await page.goto('/government.html');
        await page.locator('a[href="#capabilities"]').click();
        await expect(page).toHaveURL(/#capabilities$/);
        await page.locator('.government-contact a[href="contact.html"]').click();
        await expect(page).toHaveURL(/\/contact\.html$/);
    });

    test('project experience link reaches Work', async ({ page }) => {
        await page.goto('/government.html');
        await page.locator('a[href="work.html"]').click();
        await expect(page).toHaveURL(/\/work\.html$/);
    });
});

test.describe('About page', () => {
    test('four capabilities and three experience categories render', async ({ page }) => {
        await page.goto('/about.html');
        await expect(page.locator('.about-capability-card')).toHaveCount(4);
        await expect(page.locator('.about-experience-item')).toHaveCount(3);
        await expect(page.locator('.about-background-note')).toContainText(/Service-Disabled Veteran/i);
    });

    test('About links to work, government information, and contact', async ({ page }) => {
        await page.goto('/about.html');
        await expect(page.locator('main a[href="work.html"]')).toHaveCount(2);
        await expect(page.locator('main a[href="government.html"]')).toHaveCount(1);
        await expect(page.locator('main a[href="contact.html"]')).toHaveCount(2);
    });
});

test.describe('Privacy and 404 documents', () => {
    test('Privacy has readable policy sections and a contact address', async ({ page }) => {
        await page.goto('/privacy.html');
        await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible();
        await expect(page.locator('.utility-legal-section')).toHaveCount(11);
        await expect(page.locator('main')).toContainText(/Formspree/);
        await expect(page.locator('main a[href="mailto:mcgregorsystemsllc@gmail.com"]')).toHaveCount(2);
        await expect(page.locator('.utility-meta')).toContainText(/Last updated:/i);
    });

    test('explicit 404 document has noindex and useful return links', async ({ page }) => {
        const response = await page.goto('/404.html');
        expect(response?.status()).toBe(200); // Direct file, not a missing URL.
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
        await expect(page.locator('.utility-error-code')).toContainText('404');
        for (const path of ['/index.html', '/contact.html', '/work.html', '/about.html']) {
            await expect(page.locator(`main a[href="${path}"]`)).toHaveCount(1);
        }
    });

    test('host returns custom 404 for missing URL (opt-in deployment check)', async ({ page }) => {
        test.skip(process.env.CHECK_HOST_404 !== '1', 'Set CHECK_HOST_404=1 only when your host is configured to serve the custom 404.');
        const response = await page.goto(`/not-a-real-page-${Date.now()}.html`);
        expect(response?.status()).toBe(404);
        await expect(page.getByRole('heading', { name: /page could not be found/i })).toBeVisible();
    });
});

// -----------------------------------------------------------------------------
// HTML forms: valid/invalid submission, requests, success, error, retry, and busy.
// -----------------------------------------------------------------------------

test.describe('Contact forms (network intercepted; never sends a real email)', () => {
    for (const formPage of FORM_PAGES) {
        const pageLabel = formPage.path.startsWith('/contact') ? 'Contact page' : 'Homepage';
        const fields = formPage.fields;

        test(`${pageLabel}: form has expected required fields and hidden bot trap`, async ({ page }) => {
            await page.goto(formPage.path);
            const form = inquiryForm(page);
            await expect(form).toHaveAttribute('method', /post/i);
            await expect(form).toHaveAttribute('action', /https:\/\/formspree\.io\/f\//);
            for (const key of ['first', 'last', 'email', 'details']) {
                await expect(page.locator(fields[key])).toHaveAttribute('required', '');
            }
            await expect(page.locator(fields.email)).toHaveAttribute('type', 'email');
            await expect(page.locator(fields.phone)).not.toHaveAttribute('required', '');
            await expect(form.locator('[name="_gotcha"]')).toBeHidden();
            await expect(form.locator('[name="_subject"]')).toHaveAttribute('type', 'hidden');
            await expect(form).toHaveAttribute('data-initialized', 'true');
        });

        test(`${pageLabel}: missing required fields block network submission`, async ({ page }) => {
            let calls = 0;
            await mockFormspree(page, async (route) => { calls += 1; await route.abort(); });
            await page.goto(formPage.path);
            await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
            const result = await inquiryForm(page).evaluate((form) => ({
                valid: form.checkValidity(),
                invalid: [...form.querySelectorAll(':invalid')].map((node) => node.name)
            }));
            expect(result.valid).toBe(false);
            for (const name of ['first_name', 'last_name', 'email', 'project_details']) {
                expect(result.invalid).toContain(name);
            }
            expect(calls).toBe(0);
        });

        test(`${pageLabel}: invalid email blocks network submission`, async ({ page }) => {
            let calls = 0;
            await mockFormspree(page, async (route) => { calls += 1; await route.abort(); });
            await page.goto(formPage.path);
            await fillInquiry(page, fields);
            await page.locator(fields.email).fill('not-an-email');
            expect(await page.locator(fields.email).evaluate((node) => node.validity.typeMismatch)).toBe(true);
            await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
            expect(calls).toBe(0);
        });

        test(`${pageLabel}: service select and optional phone can be submitted`, async ({ page }) => {
            const posts = [];
            await mockFormspree(page, async (route) => {
                posts.push(route.request().postData() || '');
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    headers: { 'access-control-allow-origin': '*' },
                    body: '{"ok":true}'
                });
            });
            await page.goto(formPage.path);
            await fillInquiry(page, fields, 'A request with a phone number and category.');
            await page.locator(fields.phone).fill('555-0100');
            await page.locator(fields.service).selectOption('Maintenance or repair');
            await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
            await expect(inquiryForm(page).locator('.form-feedback')).toContainText('Your inquiry was sent');
            expect(posts).toHaveLength(1);
            expect(posts[0]).toContain('browser.test@example.com');
            expect(posts[0]).toContain('Maintenance or repair');
            expect(posts[0]).toContain('555-0100');
            expect(posts[0]).toContain('A request with a phone number and category.');
        });

        test(`${pageLabel}: successful submission resets fields and restores button state`, async ({ page }) => {
            let requests = 0;
            await mockFormspree(page, async (route) => {
                requests += 1;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    headers: { 'access-control-allow-origin': '*' },
                    body: '{"ok":true}'
                });
            });
            await page.goto(formPage.path);
            await fillInquiry(page, fields);
            await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
            await expect(inquiryForm(page).locator('.form-feedback')).toHaveAttribute('data-state', 'success');
            await expect(inquiryForm(page).locator('.form-feedback')).toBeVisible();
            await expect(page.locator(fields.first)).toHaveValue('');
            await expect(page.locator(fields.email)).toHaveValue('');
            await expect(page.locator(fields.details)).toHaveValue('');
            await expect(inquiryForm(page)).not.toHaveAttribute('aria-busy', 'true');
            await expect(inquiryForm(page).getByRole('button', { name: /Send inquiry/ })).toBeEnabled();
            expect(requests).toBe(1);
        });

        for (const status of [400, 500]) {
            test(`${pageLabel}: HTTP ${status} shows a useful error and preserves the form`, async ({ page }) => {
                await mockFormspree(page, async (route) => {
                    await route.fulfill({
                        status,
                        contentType: 'application/json',
                        headers: { 'access-control-allow-origin': '*' },
                        body: '{"ok":false}'
                    });
                });
                await page.goto(formPage.path);
                await fillInquiry(page, fields);
                await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
                await expect(inquiryForm(page).locator('.form-feedback')).toHaveAttribute('data-state', 'error');
                await expect(inquiryForm(page).locator('.form-feedback')).toContainText(/could not be confirmed/i);
                await expect(page.locator(fields.details)).toHaveValue('Please review this test inquiry.');
                await expect(inquiryForm(page).getByRole('button', { name: /Send inquiry/ })).toBeEnabled();
            });
        }

        test(`${pageLabel}: offline/network error does not lose the entered text`, async ({ page }) => {
            await mockFormspree(page, async (route) => { await route.abort('failed'); });
            await page.goto(formPage.path);
            await fillInquiry(page, fields);
            await inquiryForm(page).getByRole('button', { name: /Send inquiry/ }).click();
            await expect(inquiryForm(page).locator('.form-feedback')).toHaveAttribute('data-state', 'error');
            await expect(page.locator(fields.details)).toHaveValue('Please review this test inquiry.');
        });

        test(`${pageLabel}: failed request can be retried successfully`, async ({ page }) => {
            let attempts = 0;
            await mockFormspree(page, async (route) => {
                attempts += 1;
                await route.fulfill({
                    status: attempts === 1 ? 500 : 200,
                    contentType: 'application/json',
                    headers: { 'access-control-allow-origin': '*' },
                    body: attempts === 1 ? '{"ok":false}' : '{"ok":true}'
                });
            });
            await page.goto(formPage.path);
            await fillInquiry(page, fields);
            const submit = inquiryForm(page).getByRole('button', { name: /Send inquiry/ });
            await submit.click();
            await expect(inquiryForm(page).locator('.form-feedback')).toHaveAttribute('data-state', 'error');
            await submit.click();
            await expect(inquiryForm(page).locator('.form-feedback')).toHaveAttribute('data-state', 'success');
            expect(attempts).toBe(2);
        });

        test(`${pageLabel}: pending submission disables the button and blocks duplicates`, async ({ page }) => {
            let releaseRequest;
            const gate = new Promise((resolve) => { releaseRequest = resolve; });
            let requests = 0;
            await mockFormspree(page, async (route) => {
                requests += 1;
                await gate;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    headers: { 'access-control-allow-origin': '*' },
                    body: '{"ok":true}'
                });
            });
            await page.goto(formPage.path);
            await fillInquiry(page, fields);
            const form = inquiryForm(page);
            const button = form.getByRole('button', { name: /Send inquiry/ });
            try {
                await button.click();
                await expect(form).toHaveAttribute('aria-busy', 'true');
                await expect(button).toBeDisabled();
                await form.evaluate((node) => node.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
                await expect.poll(() => requests).toBe(1);
            } finally {
                releaseRequest();
            }
            await expect(form.locator('.form-feedback')).toHaveAttribute('data-state', 'success');
            await expect(button).toBeEnabled();
            expect(requests).toBe(1);
        });
    }

    test('Contact page has a link back to the homepage planner', async ({ page }) => {
        await page.goto('/contact.html');
        await page.locator('.contact-page-next a[href="index.html#scope"]').click();
        await expect(page).toHaveURL(/\/index\.html#scope$/);
        await expect(page.locator('#scopeTotal')).toBeVisible();
    });
});

// -----------------------------------------------------------------------------
// Small screens, tablet transitions, reduced motion, and keyboard behavior.
// -----------------------------------------------------------------------------

test.describe('Responsive pages and mobile navigation', () => {
    for (const width of [320, 390, 768, 1440]) {
        for (const { file } of PAGES) {
            test(`${file}: no page-wide horizontal overflow at ${width}px`, async ({ page }) => {
                await page.setViewportSize({ width, height: 900 });
                await page.goto(`/${file}`);
                await expect(page.locator('#main-content')).toBeVisible();
                const dimensions = await horizontalOverflow(page);
                expect(dimensions.content, `${file} at ${width}px: document scroll width`)
                    .toBeLessThanOrEqual(dimensions.viewport + 1);
                expect(dimensions.body, `${file} at ${width}px: body scroll width`)
                    .toBeLessThanOrEqual(dimensions.viewport + 1);
            });
        }
    }

    test.describe('Mobile menu at 390px', () => {
        test.use({ viewport: { width: 390, height: 844 } });

        test('toggle opens and closes the menu with the correct accessible state', async ({ page }) => {
            await page.goto('/index.html');
            const button = page.locator('#mobileMenu');
            await expect(button).toBeVisible();
            await expect(button).toHaveAttribute('aria-expanded', 'false');
            await button.click();
            await expect(button).toHaveAttribute('aria-expanded', 'true');
            await expect(button).toHaveAttribute('aria-label', 'Close navigation menu');
            await expect(page.locator('#navlinks')).toBeVisible();
            await button.click();
            await expect(button).toHaveAttribute('aria-expanded', 'false');
            await expect(page.locator('#navlinks')).toBeHidden();
        });

        test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('#mobileMenu').click();
            await page.locator('#navlinks a').first().focus();
            await page.keyboard.press('Escape');
            await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded', 'false');
            await expect(page.locator('#mobileMenu')).toBeFocused();
        });

        test('clicking outside closes the menu', async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('#mobileMenu').click();
            await page.mouse.click(10, 810);
            await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded', 'false');
        });

        test('choosing a mobile navigation link reaches that page', async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('#mobileMenu').click();
            await page.locator('#navlinks').getByRole('link', { name: 'About' }).click();
            await expect(page).toHaveURL(/\/about\.html$/);
            await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded', 'false');
        });

        test('switching to desktop closes the mobile navigation', async ({ page }) => {
            await page.goto('/index.html');
            await page.locator('#mobileMenu').click();
            await page.setViewportSize({ width: 1280, height: 900 });
            await expect(page.locator('#navbar')).not.toHaveClass(/\bopen\b/);
            await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded', 'false');
            await expect(page.locator('#navlinks')).toBeVisible();
        });

        test('menu can be opened and closed by keyboard', async ({ page }) => {
            await page.goto('/index.html');
            const button = page.locator('#mobileMenu');
            await button.focus();
            await page.keyboard.press('Enter');
            await expect(button).toHaveAttribute('aria-expanded', 'true');
            await page.keyboard.press('Escape');
            await expect(button).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test('reduced-motion setting disables the Work document rotation', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/work.html');
        const transform = await page.locator('#ras-systems .document-preview')
            .evaluate((node) => getComputedStyle(node).transform);
        expect(transform).toBe('none');
    });
});

// -----------------------------------------------------------------------------
// No-JavaScript behavior of static pages and HTML-native interactions.
// -----------------------------------------------------------------------------

test.describe('Progressive enhancement without JavaScript', () => {
    test('the homepage still provides content, navigation links, and a native contact form', async ({ browser, baseURL }) => {
        const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
        const page = await context.newPage();
        try {
            await page.goto('/index.html');
            await expect(page.locator('main h1')).toBeVisible();
            await expect(inquiryForm(page)).toHaveAttribute('method', /post/i);
            await expect(page.locator('[data-starting-price="website"]')).toContainText('Contact us for current pricing');
            await expect(page.locator('.work-grid a[href="work.html#ras-systems"]')).toBeVisible();
        } finally {
            await context.close();
        }
    });

    test('the Work details open and close without JavaScript', async ({ browser, baseURL }) => {
        const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
        const page = await context.newPage();
        try {
            await page.goto('/work.html#ras-systems');
            const details = page.locator('#ras-systems details');
            await details.locator('summary').click();
            await expect(details).toHaveAttribute('open', '');
        } finally {
            await context.close();
        }
    });

    test('Services offers readable pricing fallback if scripts fail', async ({ browser, baseURL }) => {
        const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
        const page = await context.newPage();
        try {
            await page.goto('/services.html');
            await expect(page.locator('[data-starting-price]')).toHaveCount(6);
            for (const element of await page.locator('[data-starting-price]').all()) {
                await expect(element).toContainText('Contact us for current pricing');
            }
            await expect(page.locator('[data-hourly-rate]')).toContainText('Contact us for the current hourly rate');
        } finally {
            await context.close();
        }
    });
});
