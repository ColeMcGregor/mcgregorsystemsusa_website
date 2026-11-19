
/**
 * Builds the two conceptual application windows in the homepage hero.
 * Styling and border movement are controlled by home.css and animations.css.
 * Replace this illustration when approved project images are available.
 */

export function initializeHeroShowcase() {
    const mount = document.getElementById("hero-showcase");

    if (!mount || mount.dataset.initialized === "true") {
        return;
    }

    // Both windows are decorative. Their figures are examples, not client data.
    mount.setAttribute("role", "img");
    mount.setAttribute(
        "aria-label",
        "Conceptual illustrations of a business website and an internal software dashboard"
    );

    mount.innerHTML = `
        <div class="showcase-glow" aria-hidden="true"></div>

        <div class="border-orbit orbit-back" aria-hidden="true">
            <div class="showcase-app-window">
                <div class="showcase-window-chrome">
                    <span class="showcase-dots">● ● ●</span>
                    <span>OPERATIONS / DASHBOARD</span>
                </div>
                <div class="showcase-app-layout">
                    <aside>
                        <div class="app-aside-head">WORKSPACE</div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </aside>
                    <div class="app-area">
                        <small>Operations overview</small>
                        <div class="app-statrow">
                            <b><i>Active</i>24</b>
                            <b><i>Complete</i>112</b>
                            <b><i>Pending</i>08</b>
                        </div>
                        <div class="app-chart">
                            <svg viewBox="0 0 320 64" width="100%" height="44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                                <defs>
                                    <linearGradient id="msllc-hero-chart" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stop-color="#95cdb5" />
                                        <stop offset="100%" stop-color="#3d837b" />
                                    </linearGradient>
                                </defs>
                                <rect x="0" y="38" width="30" height="26" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="42" y="27" width="30" height="37" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="84" y="34" width="30" height="30" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="126" y="15" width="30" height="49" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="168" y="23" width="30" height="41" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="210" y="8" width="30" height="56" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="252" y="18" width="30" height="46" rx="2" fill="url(#msllc-hero-chart)" />
                                <rect x="294" y="3" width="26" height="61" rx="2" fill="url(#msllc-hero-chart)" />
                            </svg>
                        </div>
                        <div class="app-list"><i></i><i></i><i></i></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="border-orbit orbit-front" aria-hidden="true">
            <div class="showcase-site-window">
                <div class="showcase-window-chrome light">
                    <span class="showcase-dots">● ● ●</span>
                    <span>PUBLIC / WEBSITE</span>
                </div>
                <div class="site-window-body">
                    <div class="site-mini-nav">
                        <strong>YOUR BUSINESS</strong>
                        <span>Services &nbsp; About &nbsp; Contact</span>
                    </div>
                    <div class="site-mini-hero">
                        <div>
                            <small>LOCAL SERVICE · DEMO</small>
                            <h3>A clear place<br>to begin.</h3>
                            <p>Services people understand. A simple path to get in touch.</p>
                            <span class="site-cta">Contact us ↗</span>
                        </div>
                        <div class="site-mini-photo">
                            <div class="photo-shape photo-1"></div>
                            <div class="photo-shape photo-2"></div>
                            <div class="photo-shape photo-3"></div>
                        </div>
                    </div>
                    <div class="site-mini-cards">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="showcase-note" aria-hidden="true">
            <i></i>
            <span>Two examples of what we build</span>
            <small>Illustrative interfaces, not client screenshots</small>
        </div>
    `;

    mount.dataset.initialized = "true";
}
