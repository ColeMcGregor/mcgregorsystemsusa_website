
/**
 * Adds inline submission feedback to Formspree inquiry forms.
 * Without JavaScript, the form still submits through its HTML action.
 */

export function initializeContactForms() {
    const forms = document.querySelectorAll('form.contact-form[action^="https://formspree.io/"]');

    for (const form of forms) {
        if (form.dataset.initialized === "true") {
            continue;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) {
            continue;
        }

        let feedback = form.querySelector(".form-feedback");

        // The homepage does not have a feedback element yet, so add one there.
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.className = "form-feedback";
            feedback.setAttribute("role", "status");
            feedback.setAttribute("aria-live", "polite");
            feedback.hidden = true;
            form.appendChild(feedback);
        }

        function showFeedback(message, state) {
            feedback.textContent = message;
            feedback.dataset.state = state;
            feedback.hidden = false;
        }

        form.addEventListener("submit", async (event) => {
            // HTML validation runs before a submit event is fired.
            event.preventDefault();

            if (form.getAttribute("aria-busy") === "true") {
                return;
            }

            form.setAttribute("aria-busy", "true");
            submitButton.disabled = true;
            feedback.hidden = true;

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" }
                });

                if (!response.ok) {
                    throw new Error(`Form submission returned HTTP ${response.status}`);
                }

                form.reset();
                showFeedback("Your inquiry was sent. Thank you for contacting McGregor Systems LLC.", "success");
            } catch (error) {
                console.error("Project inquiry submission failed:", error);
                showFeedback(
                    "Your inquiry could not be confirmed as sent. Please try again or email mcgregorsystemsllc@gmail.com.",
                    "error"
                );
            } finally {
                form.removeAttribute("aria-busy");
                submitButton.disabled = false;
            }
        });

        form.dataset.initialized = "true";
    }
}
