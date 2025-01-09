import { defaultProfile } from "constants/defaultProfile";
import { ProfileType } from "types/profile.type";

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

    public set(profile: ProfileType): Promise<void> {
        return chrome.storage.sync.set({ [this.STORAGE_KEY]: profile });
    }

    public async get(): Promise<ProfileType> {
        return chrome.storage.sync.get(this.STORAGE_KEY).then(result => {
            const profile = result[this.STORAGE_KEY];
            if (!profile) {
                this.set(defaultProfile);
                return defaultProfile;
            }

            return profile;
        });
    }
}
