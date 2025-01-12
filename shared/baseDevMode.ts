import { logObject } from "types/logObject.type";

abstract class BaseDevMode {
    protected static enabled: boolean = true;

    public static log(msg: string | null = null, obj?: logObject): void {
        if (this.enabled) {
            console.log(JSON.stringify({ message: msg, timestamp: Date.now(), ...obj }));
        }
    }
}

export default BaseDevMode;
