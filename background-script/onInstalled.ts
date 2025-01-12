import DevMode from "./devMode";
import { ProfileStorage } from "./profileStorage";
import { TabStorage } from "./tabStorage";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(details => {
    DevMode.log("onInstalled", details);
    TabStorage.getInstance().unsetPrimaryTab();
    ProfileStorage.getInstance().get();

    browser.action?.openPopup();
});
