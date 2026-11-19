
/**
 * Creates the two service-card illustrations on the homepage.
 * All appearance, layout, and rotating-border animation remain in CSS.
 * The examples are not screenshots of completed client applications.
 */

const websiteIllustration = `
    <div class="small-orbit">
        <div class="web-demo">
            <div class="web-demo-top">
                <b>THE FRONT DOOR</b>
                <span>ABOUT &nbsp; SERVICES &nbsp; CONTACT</span>
            </div>
            <div class="web-demo-main">
                <span class="micro-label">BUSINESS WEBSITE / CONCEPT</span>
                <h3>Your work,<br>made clear.</h3>
                <span class="web-demo-button">Get in touch ↗</span>
            </div>
            <div class="web-demo-foot"><i></i><i></i><i></i></div>
        </div>
    </div>
    <span class="art-corner-label">01 / WEBSITES</span>
`;

const softwareIllustration = `
    <div class="small-orbit alt">
        <div class="sys-demo">
            <div class="sys-demo-menu">
                <b>WORKFLOW</b>
                <span>Overview</span>
                <span>People</span>
                <span>Records</span>
                <span>Reports</span>
            </div>
            <div class="sys-demo-body">
                <div class="sys-title">
                    Activity overview <small>CONCEPT</small>
                </div>
                <div class="sys-stats">
                    <span>128<small>Records</small></span>
                    <span>42<small>Open</small></span>
                </div>
                <div class="sys-row"><i></i><em>Request received</em><b>New</b></div>
                <div class="sys-row"><i></i><em>Review complete</em><b>Done</b></div>
                <div class="sys-row"><i></i><em>Report created</em><b>Done</b></div>
            </div>
        </div>
    </div>
    <span class="art-corner-label">02 / SOFTWARE</span>
`;

export function initializeServiceVisuals() {
    const illustrations = [
        {
            selector: '[data-component="website-service-visual"]',
            markup: websiteIllustration,
            description: "Conceptual example of a business website"
        },
        {
            selector: '[data-component="software-service-visual"]',
            markup: softwareIllustration,
            description: "Conceptual example of an internal software dashboard"
        }
    ];

    for (const illustration of illustrations) {
        const mount = document.querySelector(illustration.selector);

        if (!mount || mount.dataset.initialized === "true") {
            continue;
        }

        mount.setAttribute("role", "img");
        mount.setAttribute("aria-label", illustration.description);
        mount.innerHTML = illustration.markup;
        mount.dataset.initialized = "true";
    }
}
