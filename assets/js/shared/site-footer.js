
/**
 * Shared footer content and links.
 * Presentation is defined in assets/css/components/footer.css.
 */

const exploreLinks = [
    { label: "Services", path: "services.html" },
    { label: "Scope builder", path: "index.html#scope" },
    { label: "Selected work", path: "work.html" },
    { label: "Our process", path: "process.html" },
    { label: "About", path: "about.html" }
];

const contactLinks = [
    { label: "Project inquiry", path: "contact.html" },
    { label: "Government & subcontracting", path: "government.html" },
    { label: "Contact", path: "contact.html" }
];

const legalLinks = [
    { label: "Privacy Policy", path: "legal.html#privacy" },
    { label: "Website Terms", path: "legal.html#terms" },
    { label: "Credits & Attributions", path: "legal.html#credits" }
];

export function renderSiteFooter(siteRoot) {
    const placeholder = document.getElementById("site-footer");

    if (!placeholder) {
        return null;
    }

    const resolve = (path) => new URL(path, siteRoot).href;
    const companyLogo = resolve("assets/images/branding/LogoMcGregorSystems.png");
    const certificationLogo = resolve("assets/images/branding/NYS-Certified-Logo.png");

    const makeLinks = (items) => items.map(({ label, path }) =>
        `<li><a href="${resolve(path)}">${label}</a></li>`
    ).join("");

    const makeLegalLinks = (items) => items.map(({ label, path }, index) => `
        ${index > 0 ? '<span class="footer-legal-separator" aria-hidden="true">·</span>' : ""}
        <a href="${resolve(path)}">${label}</a>
    `).join("");

    const template = document.createElement("template");

    template.innerHTML = `
        <footer class="footer">
            <div class="shell">
                <div class="footer-grid">
                    <div class="footer-column footer-column--brand">
                        <div class="brand">
                            <span class="brand-mark">
                                <img src="${companyLogo}" alt="" loading="lazy">
                            </span>
                            <div>
                                <div class="brand-name">McGregor Systems</div>
                                <div class="brand-sub">Software Engineering · LLC</div>
                            </div>
                        </div>
                        <p>
                            Custom software, software modernization,
                            systems integration, and custom websites.
                        </p>
                    </div>

                    <div class="footer-column footer-column--explore">
                        <h4>Explore</h4>
                        <ul>${makeLinks(exploreLinks)}</ul>
                    </div>

                    <div class="footer-column footer-column--contact">
                        <h4>Work with us</h4>
                        <ul>${makeLinks(contactLinks)}</ul>
                        <p>
                            <a href="mailto:mcgregorsystemsllc@gmail.com">
                                mcgregorsystemsllc@gmail.com
                            </a>
                        </p>
                    </div>

                    <div class="footer-column footer-column--certification">
                        <h4>Certification</h4>
                        <img
                            class="footer-certification-logo"
                            src="${certificationLogo}"
                            width="94"
                            alt="New York State-certified Service-Disabled Veteran-Owned Business"
                            loading="lazy"
                        >
                        <p>
                            NYS-Certified Service-Disabled
                            Veteran-Owned Business
                        </p>
                        <p>Albany, New York</p>
                    </div>
                </div>

                <div class="footbottom">
                    <span class="footer-copyright">
                        © ${new Date().getFullYear()} McGregor Systems LLC.
                        All rights reserved.
                    </span>

                    <nav
                        class="footer-legal-links"
                        aria-label="Legal information"
                    >
                        ${makeLegalLinks(legalLinks)}
                    </nav>
                </div>
            </div>
        </footer>
    `;

    const footer = template.content.querySelector("footer");
    placeholder.replaceWith(template.content);

    return footer;
}
