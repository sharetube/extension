import { defaultProfile } from "constants/defaultProfile";
import { ProfileType } from "types/profile.type";
import browser from "webextension-polyfill";

export class ProfileStorage {
    private static _instance: ProfileStorage;
    private readonly STORAGE_KEY = "st-profile";

    private constructor() {}

    public static getInstance(): ProfileStorage {
        if (!ProfileStorage._instance) {
            ProfileStorage._instance = new ProfileStorage();
        }
        return ProfileStorage._instance;
    }

    public async set(profile: ProfileType): Promise<void> {
        return browser.storage.sync.set({ [this.STORAGE_KEY]: profile });
    }

    public async get(): Promise<ProfileType> {
        const result = await browser.storage.sync.get(this.STORAGE_KEY);
        const profile = result[this.STORAGE_KEY] as ProfileType | undefined;

        if (!profile) {
            await this.set(defaultProfile);
            return defaultProfile;
        }

        return profile;
    }
}
