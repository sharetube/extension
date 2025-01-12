import { logger } from "./logging/logger";
import { ProfileStorage } from "./profileStorage";
import { TabStorage } from "./tabStorage";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(details => {
    logger.log("onInstalled", details);
    TabStorage.getInstance().unsetPrimaryTab();
    ProfileStorage.getInstance().get();

    //? browser.action?.openPopup();
});
