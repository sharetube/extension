import browser from "webextension-polyfill";

const checkbox = document.querySelector("input#devmode");

browser.runtime.sendMessage({ type: "GET_DEVMODE" }).then(value => {
    if (checkbox) {
        checkbox.checked = value;
    }
});

checkbox.addEventListener("change", () => {
    const isChecked = checkbox.checked;
    browser.runtime.sendMessage({ type: "SET_DEVMODE", payload: isChecked });
});
