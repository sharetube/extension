import { logObject } from "types/logObject.type";

class Logger {
    private enabled: boolean = true;

    public log(msg: string, obj?: logObject): void {
        if (this.enabled) {
            console.log(JSON.stringify({ timestamp: Date.now(), message: msg, ...obj }));
        }
    }

    public getEnabled(): boolean {
        return this.enabled;
    }

    public setEnabled(value: boolean): void {
        this.enabled = value;
    }
}

export default Logger;
