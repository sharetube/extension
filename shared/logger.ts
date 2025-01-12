import { logObject } from "types/logObject.type";

class Logger {
    private enabled: boolean = true;

    public log(msg: string, obj?: logObject): void {
        if (this.enabled) {
            console.log(JSON.stringify({ message: msg, timestamp: Date.now(), ...obj }));
        }
    }

    public getEnabled(): boolean {
        return this.enabled;
    }

    public setEnabled(value: boolean): void {
        console.log("Debug mode:", value);
        this.enabled = value;
    }
}

export default Logger;
