import BaseDevMode from "shared/baseDevMode";

class DevMode extends BaseDevMode {
    static setEnabled(value: boolean) {
        this.enabled = value;
        this.log("DEVMODE CONTENT SCRIPT", { enabled: value });
    }
}

export default DevMode;
