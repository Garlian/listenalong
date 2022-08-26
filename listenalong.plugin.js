/**
 * @name ListenAlong
 * @author Garlian
 * @authorId 718760221706551337
 * @version 1.0.2
 * @description Enables Spotify Listen Along feature on Discord without Premium
 * @source https://github.com/Garlian/listenalong
 * @updateUrl https://github.com/Garlian/listenalong/main/listenalong.plugin.js
 */

module.exports = (_ => {
    const config = {
        "info": {
            "name": "ListenAlong",
            "authors": [{
                "name": "Garlian",
                "discord_id": "718760221706551337",
                "github_username": "Garlian",
            }],
            "version": "1.0.2",
            "description": "Enables Spotify Listen Along feature on Discord without Premium",
            "github": "https://github.com/Garlian/listenalong",
            "github_raw": "https://raw.githubusercontent.com/Garlian/listenalong/main/listenalong.plugin.js"
        },
        "changelog": [
            {
                "title": "Initial Release",
                "items": [
                    "This is the initial release of the plugin :)"
                ]
            }
        ],
        "main": "index.js"
    };
    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal(
                "Library plugin is needed",
                [`The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`], 
                {
                    confirmText: "Download",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) {
                                return BdApi.showConfirmationModal("Error Downloading",
                                    [
                                        "Library plugin download failed. Manually install plugin library from the link below.",
                                        BdApi.React.createElement("a", { href: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", target: "_blank" }, "Plugin Link")
                                    ],
                                );
                            }
                            await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }
            );
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
            const { DiscordModules, Patcher, WebpackModules } = Library;
            return class SpotifyListenAlong extends Plugin {
                constructor() {
                    super();
                }

                start() {
                    Patcher.instead(DiscordModules.DeviceStore, 'getProfile', ( _, [id, t] ) =>
                        DiscordModules.Dispatcher.dispatch({
                            type: "SPOTIFY_PROFILE_UPDATE",
                            accountId: id,
                            isPremium: true
                        })
                    )
                    Patcher.instead(WebpackModules.getByProps("isSpotifyPremium"), 'isSpotifyPremium', () => true)
                }

                stop() {
                    Patcher.unpatchAll()
                }
            };
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
