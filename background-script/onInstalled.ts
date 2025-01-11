import { ProfileStorage } from "./profileStorage";
import { TabStorage } from "./tabStorage";

chrome.runtime.onInstalled.addListener(details => {
    console.log("onInstalled", details);
    TabStorage.getInstance().unsetPrimaryTab();
    ProfileStorage.getInstance().get();
    chrome.action.openPopup();
});
