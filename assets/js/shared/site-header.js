
/**
 * Shared header content and navigation links.
 * Presentation is defined in assets/css/components/header.css.
 */

const navigationItems = [
    { label: "Services", path: "services.html", page: "services.html" },
    { label: "Scope builder", path: "index.html#scope" },
    { label: "Work", path: "work.html", page: "work.html" },
    { label: "Process", path: "process.html", page: "process.html" },
    { label: "Government", path: "government.html", page: "government.html" },
    { label: "About", path: "about.html", page: "about.html" }
];

export function renderSiteHeader(siteRoot) {
    const placeholder = document.getElementById("site-header");

    if (!placeholder) {
        return null;
    }

    const resolve = (path) => new URL(path, siteRoot).href;
    const currentPath = window.location.pathname;
    const companyLogo = resolve("assets/images/branding/LogoMcGregorSystemsSmall.png");

    const links = navigationItems.map(({ label, path, page }) => {
        const isCurrentPage = page &&
            new URL(page, siteRoot).pathname === currentPath;
        const currentAttribute = isCurrentPage ? ' aria-current="page"' : "";

        return `<a href="${resolve(path)}"${currentAttribute}>${label}</a>`;
    }).join("");

    const template = document.createElement("template");

    template.innerHTML = `
        <div class="topline">
            <div class="shell">
                <span class="topline-summary">
                    <strong>NYS-CERTIFIED SDVOB</strong> · Software engineering &amp; systems design
                </span>
                <span class="topline-location">
                    Albany, New York · Remote project work available
                </span>
            </div>
        </div>

        <header class="nav" id="navbar">
            <div class="shell">
                <a class="brand" href="${resolve("index.html")}">
                    <span class="brand-mark">
                        <img src="${companyLogo}" width="32" height="32" alt="">
                    </span>
                    <div>
                        <div class="brand-name">McGregor Systems</div>
                        <div class="brand-sub">Software Engineering · LLC</div>
                    </div>
                </a>

                <nav class="nav-links" id="navlinks" aria-label="Primary navigation">
                    ${links}
                </nav>

                <a class="btn btn-dark site-header-cta" href="${resolve("contact.html")}">
                    Discuss a project <span aria-hidden="true">↗</span>
                </a>

                <button
                    class="mobile-menu"
                    id="mobileMenu"
                    type="button"
                    aria-label="Open navigation menu"
                    aria-controls="navlinks"
                    aria-expanded="false"
                >
                    <span aria-hidden="true">☰</span>
                </button>
            </div>
        </header>
    `;

    const navigation = template.content.querySelector("#navbar");
    placeholder.replaceWith(template.content);

    return navigation;
}
