import { DebugModeStorage } from "./debugModeStorage";
import Logger from "shared/logger";

export class BgLogger extends Logger {
    private static instance: BgLogger;

    constructor() {
        super();
        DebugModeStorage.getInstance()
            .get()
            .then(debugMode => {
                this.setEnabled(debugMode);
            });
    }

    public static getInstance(): BgLogger {
        return (BgLogger.instance ??= new BgLogger());
    }
}
