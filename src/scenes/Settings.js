import { Scene } from 'phaser';
import { i18n } from '../i18n';

export class Settings extends Scene {
    constructor() {
        super('Settings');
    }

    init(data) {
        this.returnTo = data.returnTo || 'MainMenu';
        this.returnData = data.returnData || {};
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // ========= VALORES DE VOLUMEN DESDE EL REGISTRY =========
        this.masterVolume = this.registry.get('masterVolume') ?? 1;
        this.musicVolume = this.registry.get('musicVolume') ?? 0.6;
        this.sfxVolume = this.registry.get('sfxVolume') ?? 0.9;

        // Aplicar al SoundManager actual
        this.sound.volume = this.masterVolume;
        this.applyMusicVolume(this.musicVolume);
        this.applySfxVolume(this.sfxVolume);

        // ========= FONDO =========
        this.add
            .rectangle(0, 0, width, height, 0x151525, 1)
            .setOrigin(0, 0);

        // ========= TÍTULO =========
        const titleText = this.add.text(width / 2, 80, i18n.t('settingsTitle'), {
            fontFamily: 'Cinzel',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#88aaff',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        // ========= LABELS VOLUMEN =========
        const volumeLabel1 = this.add.text(300, 200, i18n.t('masterVolume'), {
            fontFamily: 'Cinzel',
            fontSize: 28,
            color: '#aaaadd'
        }).setResolution(2);

        const volumeLabel2 = this.add.text(300, 320, i18n.t('musicVolume'), {
            fontFamily: 'Cinzel',
            fontSize: 28,
            color: '#aaaadd'
        }).setResolution(2);

        const volumeLabel3 = this.add.text(300, 440, i18n.t('sfxVolume'), {
            fontFamily: 'Cinzel',
            fontSize: 28,
            color: '#aaaadd'
        }).setResolution(2);

        // ========= SLIDERS DE VOLUMEN =========
        this.createVolumeSlider(
            300,
            250,
            this.masterVolume,
            (value) => this.setMasterVolume(value)
        );

        this.createVolumeSlider(
            300,
            370,
            this.musicVolume,
            (value) => this.setMusicVolume(value)
        );

        this.createVolumeSlider(
            300,
            490,
            this.sfxVolume,
            (value) => this.setSfxVolume(value)
        );

        // ========= BOTÓN VOLVER =========
        const backButton = this.createGlowButton(width / 2, 600, i18n.t('back'), 0x88aaff);
        const backText = backButton.getByName('label'); // texto interno del botón

        backButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                if (this.returnTo === 'PauseScene') {
                    this.scene.start('PauseScene', this.returnData);
                } else {
                    this.scene.start(this.returnTo);
                }
            });
        });

        // ========= IDIOMA =========
        const languageLabel = this.add.text(700, 200, i18n.t('language'), {
            fontFamily: 'Cinzel',
            fontSize: 28,
            color: '#aaaadd'
        }).setResolution(2);

        const languages = [
            { code: 'es', name: 'Español' },
            { code: 'en', name: 'English' }
        ];

        let currentLangIndex = languages.findIndex(l => l.code === i18n.currentLanguage);
        if (currentLangIndex === -1) currentLangIndex = 0;

        const langButton = this.add.container(800, 300);

        const langBg = this.add.graphics();
        langBg.fillStyle(0x2a2a5a, 0.9);
        langBg.fillRoundedRect(-80, -25, 160, 50, 10);
        langBg.lineStyle(2, 0x88aaff, 0.8);
        langBg.strokeRoundedRect(-80, -25, 160, 50, 10);

        const langText = this.add.text(0, 0, languages[currentLangIndex].name, {
            fontFamily: 'Cinzel',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5).setResolution(2);

        langButton.add([langBg, langText]);
        langButton.setSize(160, 50);
        langButton.setInteractive();

        langButton.on('pointerdown', () => {
            currentLangIndex = (currentLangIndex + 1) % languages.length;
            const newLang = languages[currentLangIndex];
            langText.setText(newLang.name);

            // Cambiar idioma globalmente
            i18n.setLanguage(newLang.code);

            // Actualizar textos en pantalla
            titleText.setText(i18n.t('settingsTitle'));
            volumeLabel1.setText(i18n.t('masterVolume'));
            volumeLabel2.setText(i18n.t('musicVolume'));
            volumeLabel3.setText(i18n.t('sfxVolume'));
            languageLabel.setText(i18n.t('language'));
            backText.setText(i18n.t('back'));
        });

        langButton.on('pointerover', () => {
            langButton.setScale(1.1);
            langBg.clear();
            langBg.fillStyle(0x3a3a7a, 1);
            langBg.fillRoundedRect(-80, -25, 160, 50, 10);
            langBg.lineStyle(3, 0xaaccff, 1);
            langBg.strokeRoundedRect(-80, -25, 160, 50, 10);
        });

        langButton.on('pointerout', () => {
            langButton.setScale(1);
            langBg.clear();
            langBg.fillStyle(0x2a2a5a, 0.9);
            langBg.fillRoundedRect(-80, -25, 160, 50, 10);
            langBg.lineStyle(2, 0x88aaff, 0.8);
            langBg.strokeRoundedRect(-80, -25, 160, 50, 10);
        });
    }

    // ==========================
    // BOTÓN CON BRILLO
    // ==========================
    createGlowButton(x, y, text, glowColor) {
        const container = this.add.container(x, y);

        const glow = this.add.circle(0, 0, 80, glowColor, 0.15);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.9);
        bg.fillRoundedRect(-90, -30, 180, 60, 15);
        bg.lineStyle(3, glowColor, 0.8);
        bg.strokeRoundedRect(-90, -30, 180, 60, 15);

        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Cinzel',
            fontSize: 26,
            color: '#ffffff',
            stroke: glowColor,
            strokeThickness: 1
        }).setOrigin(0.5).setResolution(2);

        // Nombre para poder encontrarlo luego
        buttonText.name = 'label';

        container.add([glow, bg, buttonText]);
        container.setSize(180, 60);
        container.setInteractive();

        this.tweens.add({
            targets: glow,
            alpha: 0.3,
            scale: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 200
            });
            bg.clear();
            bg.fillStyle(0x2a2a5a, 1);
            bg.fillRoundedRect(-90, -30, 180, 60, 15);
            bg.lineStyle(4, glowColor, 1);
            bg.strokeRoundedRect(-90, -30, 180, 60, 15);
        });

        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 200
            });
            bg.clear();
            bg.fillStyle(0x1a1a3a, 0.9);
            bg.fillRoundedRect(-90, -30, 180, 60, 15);
            bg.lineStyle(3, glowColor, 0.8);
            bg.strokeRoundedRect(-90, -30, 180, 60, 15);
        });

        return container;
    }

    // ==========================
    // SLIDER DE VOLUMEN
    // ==========================
    createVolumeSlider(x, y, initialValue, onChange) {
        const sliderWidth = 400;
        const sliderHeight = 20;

        // Fondo del slider
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.8);
        bg.fillRoundedRect(x, y, sliderWidth, sliderHeight, 10);

        bg.lineStyle(2, 0x4488ff, 0.5);
        bg.strokeRoundedRect(x, y, sliderWidth, sliderHeight, 10);

        // Posición inicial según el valor (0..1)
        const initialX = x + sliderWidth * initialValue;

        // Barra de progreso
        const bar = this.add.graphics();
        bar.fillStyle(0x4488ff, 1);
        bar.fillRoundedRect(x, y, sliderWidth * initialValue, sliderHeight, 10);

        // Handle con brillo
        const handleGlow = this.add.circle(initialX, y + sliderHeight / 2, 20, 0x88aaff, 0.3);
        const handle = this.add.circle(initialX, y + sliderHeight / 2, 15, 0xffffff);
        handle.setInteractive({ draggable: true });
        this.input.setDraggable(handle);

        // Pulso
        this.tweens.add({
            targets: handleGlow,
            scale: 1.3,
            alpha: 0.1,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Drag
        handle.on('drag', (pointer) => {
            const newX = Math.min(x + sliderWidth, Math.max(x, pointer.x));
            handle.x = newX;
            handleGlow.x = newX;

            const volume = (newX - x) / sliderWidth;
            bar.clear();
            bar.fillStyle(0x4488ff, 1);
            bar.fillRoundedRect(x, y, (newX - x), sliderHeight, 10);

            if (onChange) {
                onChange(volume);
            }
        });

        handle.on('pointerover', () => {
            handle.setScale(1.2);
            handleGlow.setScale(1.5);
        });

        handle.on('pointerout', () => {
            handle.setScale(1);
        });
    }

    // ==========================
    //  ACTUALIZAR VOLUMEN
    // ==========================
    setMasterVolume(value) {
        const v = Math.min(1, Math.max(0, value));
        this.masterVolume = v;
        this.registry.set('masterVolume', v);
        this.sound.volume = v;
    }

    setMusicVolume(value) {
        const v = Math.min(1, Math.max(0, value));
        this.musicVolume = v;
        this.registry.set('musicVolume', v);
        this.applyMusicVolume(v);
    }

    setSfxVolume(value) {
        const v = Math.min(1, Math.max(0, value));
        this.sfxVolume = v;
        this.registry.set('sfxVolume', v);
        this.applySfxVolume(v);
    }

    applyMusicVolume(v) {
        this.sound.sounds.forEach(sound => {
            if (sound.key && sound.key.startsWith('music_')) {
                sound.setVolume(v);
            }
        });
    }

    applySfxVolume(v) {
        this.sound.sounds.forEach(sound => {
            if (sound.key && sound.key.startsWith('sfx_')) {
                sound.setVolume(v);
            }
        });
    }
}
