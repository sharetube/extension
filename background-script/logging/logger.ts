import { DebugModeStorage } from "./debugModeStorage";
import Logger from "shared/logger";

const logger = new Logger();

DebugModeStorage.getInstance()
    .get()
    .then(debugMode => {
        logger.setEnabled(debugMode);
    });

export { logger };
