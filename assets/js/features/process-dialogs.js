
/* Shared Process page dialogs.
   Explanation content is maintained in assets/js/data/process-dialogs.json.
   Native dialogs provide modal focus handling and Escape-key support. */

const dialog = document.getElementById("process-info-dialog");
const dialogTitle = document.getElementById("process-dialog-heading");
const dialogCategory = document.getElementById("process-dialog-category");
const dialogContent = document.getElementById("process-dialog-content");
const triggers = document.querySelectorAll("[data-process-dialog]");

const contentUrl = new URL("../data/process-dialogs.json", import.meta.url);

let contentPromise = null;
let activeTrigger = null;

function loadContent() {
    if (!contentPromise) {
        contentPromise = fetch(contentUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load process explanations (${response.status}).`
                    );
                }

                return response.json();
            })
            .catch((error) => {
                contentPromise = null;
                throw error;
            });
    }

    return contentPromise;
}

function addParagraphs(parent, value) {
    const paragraphs = Array.isArray(value) ? value : [value];

    paragraphs.forEach((text) => {
        if (typeof text !== "string" || !text.trim()) {
            return;
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        parent.append(paragraph);
    });
}

function addSection(parent, heading, paragraphs, items, className = "") {
    const section = document.createElement("section");

    if (className) {
        section.className = className;
    }

    const title = document.createElement("h3");
    title.textContent = heading;
    section.append(title);

    if (paragraphs) {
        addParagraphs(section, paragraphs);
    }

    if (Array.isArray(items) && items.length) {
        const list = document.createElement("ul");

        items.forEach((item) => {
            if (typeof item !== "string") {
                return;
            }

            const listItem = document.createElement("li");
            listItem.textContent = item;
            list.append(listItem);
        });

        section.append(list);
    }

    parent.append(section);
}

function findEntry(data, id) {
    for (const group of ["scoping", "deliverables", "engagements"]) {
        const entries = data[group];

        if (!Array.isArray(entries)) {
            continue;
        }

        const entry = entries.find((item) => item.id === id);

        if (entry) {
            return { group, entry };
        }
    }

    return null;
}

function renderDialog(group, entry) {
    dialogTitle.textContent = entry.title;
    dialogContent.replaceChildren();

    if (group === "scoping") {
        dialogCategory.textContent = "Scoping guide";

        addSection(
            dialogContent,
            "What this means",
            entry.meaning
        );

        addSection(
            dialogContent,
            "Why it matters",
            entry.importance
        );

        addSection(
            dialogContent,
            "Examples",
            null,
            entry.examples
        );

        addSection(
            dialogContent,
            "What you can tell us",
            entry.questions,
            null,
            "process-scope-dialog-prompt"
        );
    } else if (group === "deliverables") {
        dialogCategory.textContent = "Documentation and deliverables";

        addSection(
            dialogContent,
            "What this is",
            entry.meaning
        );

        addSection(
            dialogContent,
            entry.contentsHeading || "What it typically includes",
            null,
            entry.includes
        );

        addSection(
            dialogContent,
            "When you receive it",
            entry.timing,
            null,
            "process-scope-dialog-prompt"
        );
    } else if (group === "engagements") {
        dialogCategory.textContent = "Different kinds of work";

        addSection(
            dialogContent,
            "What this means",
            entry.meaning
        );

        addSection(
            dialogContent,
            "Examples",
            null,
            entry.examples
        );

        addSection(
            dialogContent,
            "This is probably what you're looking for if…",
            entry.recognition,
            null,
            "process-scope-dialog-prompt"
        );

        addSection(
            dialogContent,
            "What happens next",
            entry.nextSteps
        );
    }
}

function clearErrors() {
    document.querySelectorAll(".process-dialog-error").forEach((item) => {
        item.remove();
    });
}

function showError(trigger) {
    clearErrors();

    const message = document.createElement("p");
    message.className = "process-dialog-error";
    message.setAttribute("role", "alert");
    message.textContent =
        "This explanation is temporarily unavailable. Please try again.";

    // Keep error text adjacent to the control without changing the button.
    if (trigger.closest(".process-scope-interactive-list")) {
        trigger.closest("li").append(message);
    } else {
        trigger.after(message);
    }
}

if (dialog instanceof HTMLDialogElement) {
    const closeButton = dialog.querySelector(".process-scope-close");
    const scrollContainer = dialog.querySelector(
        ".process-scope-dialog-content"
    );

    dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
        button.addEventListener("click", () => {
            dialog.close();
        });
    });

    dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) {
            return;
        }

        const bounds = dialog.getBoundingClientRect();

        const clickedInside =
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom;

        if (!clickedInside) {
            dialog.close();
        }
    });

    dialog.addEventListener("close", () => {
        activeTrigger?.focus();
        activeTrigger = null;
    });

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", async () => {
            try {
                const data = await loadContent();
                const id = trigger.dataset.processDialog;
                const match = findEntry(data, id);

                if (!match) {
                    throw new Error(`Missing process dialog content: ${id}`);
                }

                clearErrors();
                renderDialog(match.group, match.entry);

                activeTrigger = trigger;
                scrollContainer.scrollTop = 0;

                dialog.showModal();
                closeButton?.focus();
            } catch (error) {
                console.error(error);
                showError(trigger);
            }
        });
    });

    // Load once so repeated clicks do not trigger repeated JSON requests.
    loadContent().catch((error) => {
        console.error(
            "Process dialog content could not be loaded:",
            error
        );
    });
}
