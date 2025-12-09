export class SettingsManager {
    constructor() {
        this.defaultSettings = {
            musicVolume: 0.5,
            sfxVolume: 0.8,
            language: 'es'
        };
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('lumina_settings');
        if (saved) {
            return { ...this.defaultSettings, ...JSON.parse(saved) };
        }
        return { ...this.defaultSettings };
    }

    saveSettings() {
        localStorage.setItem('lumina_settings', JSON.stringify(this.settings));
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    applyToScene(scene) {
        // Apply volume
        if (scene.sound) {
            // Assuming we have music and sfx channels or global volume
            // Phaser global volume:
            // scene.sound.volume = this.settings.musicVolume; 
            // Better to manage specific sounds if possible, but global is okay for now
        }

        // Apply Language (if using i18n)
        if (window.i18n) {
            window.i18n.locale = this.settings.language;
        }
    }
}

export const settingsManager = new SettingsManager();
