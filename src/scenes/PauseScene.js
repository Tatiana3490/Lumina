import { Scene } from 'phaser';
import { i18n } from '../i18n';

export class PauseScene extends Scene {
    constructor() {
        super('PauseScene');
    }

    create(data) {
        this.activeSceneName = data.activeScene || 'Game';

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo oscuro opaco (Solid background to cover the game)
        // Using same color as Settings.js for consistency
        this.add.rectangle(0, 0, width, height, 0x151525, 1).setOrigin(0, 0);

        // Title
        this.add.text(width / 2, 80, i18n.t('pause_title') || 'PAUSA', {
            fontFamily: 'Cinzel',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center',
            stroke: '#4444ff',
            strokeThickness: 2 // Reduced to match Settings
        }).setOrigin(0.5).setResolution(2);

        // Subtitle
        this.add.text(width / 2, 140, i18n.t('pause_subtitle') || 'Tu luz también necesita descansar', {
            fontFamily: 'Cinzel',
            fontSize: '20px',
            color: '#aaaadd', // Matched Settings subtitle color
            align: 'center'
        }).setOrigin(0.5).setResolution(2);

        // Buttons
        const buttonY = 250;
        const buttonSpacing = 90;

        // Resume button
        const resumeBtn = this.createGlowButton(width / 2, buttonY, i18n.t('resume') || 'Reanudar', 0x44ff88);
        resumeBtn.on('pointerdown', () => this.resumeGame());

        // Restart button
        const restartBtn = this.createGlowButton(width / 2, buttonY + buttonSpacing, i18n.t('restart') || 'Comenzar Juego', 0xffaa44);
        restartBtn.on('pointerdown', () => this.restartGame());

        // Settings button
        const settingsBtn = this.createGlowButton(width / 2, buttonY + buttonSpacing * 2, i18n.t('settings') || 'Ajustes', 0x4488ff);
        settingsBtn.on('pointerdown', () => this.openSettings());

        // Exit button
        const exitBtn = this.createGlowButton(width / 2, buttonY + buttonSpacing * 3, i18n.t('exit_to_menu') || 'Salir', 0xff4488);
        exitBtn.on('pointerdown', () => this.exitToMenu());

        // ESC key to resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
    }

    createGlowButton(x, y, text, glowColor) {
        const container = this.add.container(x, y);

        // Aura de brillo
        const glow = this.add.circle(0, 0, 80, glowColor, 0.15);

        // Fondo del botón
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.9);
        bg.fillRoundedRect(-90, -30, 180, 60, 15);
        bg.lineStyle(3, glowColor, 0.8);
        bg.strokeRoundedRect(-90, -30, 180, 60, 15);

        // Texto
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Cinzel',
            fontSize: 26,
            color: '#ffffff',
            stroke: glowColor,
            strokeThickness: 1
        }).setOrigin(0.5).setResolution(2);

        container.add([glow, bg, buttonText]);
        container.setSize(180, 60);
        container.setInteractive();

        // Animación de pulso
        this.tweens.add({
            targets: glow,
            alpha: 0.3,
            scale: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Efectos hover
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

    resumeGame() {
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.resume();
        }
        this.scene.stop();
    }

    restartGame() {
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.restart();
        }
        this.scene.stop();
    }

    openSettings() {
        // Stop pause scene first to prevent transparency bleed-through
        this.scene.stop();
        // Pass info to Settings so it can return here
        this.scene.start('Settings', {
            returnTo: 'PauseScene',
            returnData: { activeScene: this.activeSceneName }
        });
    }

    exitToMenu() {
        // Stop pause scene and active game scene
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.stop();
        }
        this.scene.stop();
        // Go to main menu
        this.scene.start('MainMenu');
    }
}
