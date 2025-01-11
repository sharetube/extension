import manifest from "./manifest.json";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import tsconfigPaths from "vite-tsconfig-paths";

function fixManifestOut(buildDir: string, browser: string) {
    return {
        name: "out-manifest-fix",
        closeBundle() {
            const extPath = resolve(__dirname, buildDir);
            const manifestPath = `${extPath}/manifest.json`;
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

            // fix world:MAIN scripts
            for (let i = 0; i < manifest.content_scripts.length; i++) {
                const contentScript = manifest.content_scripts[i];
                if (contentScript.world == "MAIN") {
                    for (let j = 0; j < contentScript.js.length; j++) {
                        const loaderFilePath = contentScript.js[j];
                        const loader = fs.readFileSync(`${extPath}/${loaderFilePath}`, "utf-8");

                        const contentScriptPathRegex = /chrome\.runtime\.getURL\("([^"]+)"\)/;
                        const match = loader.match(contentScriptPathRegex);

                        const contentScriptPath = match[1];
                        manifest.content_scripts[i].js[j] = contentScriptPath;
                        fs.unlinkSync(`${extPath}/${loaderFilePath}`);
                    }
                }
            }

            switch (browser) {
                case "firefox":
                    // fix manifest
                    delete manifest.version_name;
                    delete manifest.minimum_chrome_version;
                    manifest.background.scripts = [manifest.background.service_worker];
                    delete manifest.background.service_worker;

                    manifest.web_accessible_resources.forEach(elem => {
                        delete elem.use_dynamic_url;
                    });
                    break;
                case "chrome":
                    delete manifest.browser_specific_settings;
                    break;
            }
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        },
    };
}

const baseOutDir = "dist";

export default defineConfig(({}) => {
    const browser: string = process.env.BROWSER || "chrome";
    const outDir = `${baseOutDir}/${browser}`;

    return {
        plugins: [
            createHtmlPlugin({
                minify: true,
            }),
            react(),
            crx({ manifest }),
            tsconfigPaths(),
            { ...fixManifestOut(outDir, browser), enforce: "post" },
        ],
        resolve: {
            alias: {
                "@app": "/content-script/app/",
                "@shared": "/content-script/shared",
                "@widgets": "/content-script/widgets",
                "@entities": "/content-script/entities",
                "@tabs": "/content-script/tabs",
                "@player": "/content-script/player",
                scripts: "/scripts/",
                constants: "/constants",
                types: "/types",
                config: "config.ts",
            },
        },
        assetsInclude: ["**/*.png"],
        build: {
            outDir: outDir,
        },
    };
});
