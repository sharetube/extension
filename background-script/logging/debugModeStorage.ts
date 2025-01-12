import browser from "webextension-polyfill";

export class DebugModeStorage {
    private static _instance: DebugModeStorage;
    private readonly STORAGE_KEY = "st-debug-mode";

    public static getInstance(): DebugModeStorage {
        if (!DebugModeStorage._instance) {
            DebugModeStorage._instance = new DebugModeStorage();
        }
        return DebugModeStorage._instance;
    }

    public async set(value: boolean): Promise<void> {
        return browser.storage.local.set({ [this.STORAGE_KEY]: value });
    }

    public async get(): Promise<boolean> {
        const result = await browser.storage.local.get(this.STORAGE_KEY);
        const debugMode = result[this.STORAGE_KEY] as boolean | undefined;

        if (!debugMode) {
            await this.set(false);
            return false;
        }

        return debugMode;
    }
}
