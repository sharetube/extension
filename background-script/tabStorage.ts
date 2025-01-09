export class TabStorage {
    private static instance: TabStorage;
    private readonly PRIMARY_TAB_STORAGE_KEY = "st-primary-tab";
    private tabs: Set<number>;

    constructor() {
        this.tabs = new Set();
    }

    public static getInstance(): TabStorage {
        return (TabStorage.instance ??= new TabStorage());
    }

    public addTab(tabId: number): void {
        if (!this.tabs.has(tabId)) this.tabs.add(tabId);
    }

    public removeTab(tabId: number): void {
        this.tabs.delete(tabId);
    }

    public tabExists(tabId: number): boolean {
        return this.tabs.has(tabId);
    }

    public getTabs(): Set<number> {
        return this.tabs;
    }

    public setPrimaryTab(tabId: number): Promise<void> {
        console.log("Setting primary tab", tabId);
        return chrome.storage.local.set({ [this.PRIMARY_TAB_STORAGE_KEY]: tabId });
    }

    public async getPrimaryTab(): Promise<number | null> {
        const primaryTabId =
            (await chrome.storage.local.get(this.PRIMARY_TAB_STORAGE_KEY))[
                this.PRIMARY_TAB_STORAGE_KEY
            ] || null;
        if (!primaryTabId) return null;

        return primaryTabId;
    }

    public async unsetPrimaryTab(): Promise<void> {
        const primaryTabId = await this.getPrimaryTab();
        if (!primaryTabId) return;

        return chrome.storage.local.remove(this.PRIMARY_TAB_STORAGE_KEY);
    }
}
