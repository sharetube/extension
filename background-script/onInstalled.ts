import { BgLogger } from "./logging/logger";
import { ProfileStorage } from "./profileStorage";
import { TabStorage } from "./tabStorage";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(details => {
    BgLogger.getInstance().log("onInstalled", details);
    TabStorage.getInstance().unsetPrimaryTab();
    ProfileStorage.getInstance().get();

    //? browser.action?.openPopup();
});
