import { Scene } from 'phaser';
import { i18n } from '../i18n';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // --- MÚSICA DEL MENÚ ---
        // Parar cualquier música que venga de escenas anteriores
        this.sound.stopAll(); // por si venimos de un nivel

        this.bgMusic = this.sound.add('music_menu', {
            volume: 0.6,
            loop: true
        });

        // Truco Phaser para las políticas de autoplay del navegador
        if (this.sound.locked) {
            // El sonido está "bloqueado" hasta que el usuario interactúe
            this.sound.once('unlocked', () => {
                this.bgMusic.play();
            });
        } else {
            // Ya está desbloqueado (por una interacción anterior)
            this.bgMusic.play();
        }

        // --- FONDO ---
        this.add.rectangle(640, 360, 1280, 720, 0x0a0a1a).setOrigin(0.5);

        // Imagen de título - ajustar para que se vea completa (sin recortar)
        const titleImage = this.add.image(640, 300, 'title_screen');

        // Escalar para que quepa completa dentro de la pantalla
        const scaleX = 1280 / titleImage.width;
        const scaleY = 500 / titleImage.height; // Dejar espacio para botones
        const scale = Math.min(scaleX, scaleY);
        titleImage.setScale(scale);

        // --- BOTONES ---
        const buttonY = 580;
        const buttonSpacing = 220;

        // Botón START (verde brillante)
        const startButton = this.createGlowButton(
            640 - buttonSpacing,
            buttonY,
            i18n.t('start'),
            0x44ff88
        );
        startButton.on('pointerdown', () => {
            if (this.bgMusic) this.bgMusic.stop();
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('Game');
            });
        });

        // Botón SETTINGS (azul brillante)
        const settingsButton = this.createGlowButton(
            640,
            buttonY,
            i18n.t('settings'),
            0x4488ff
        );
        settingsButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('Settings');
            });
        });

        // Botón EXIT (rojo brillante)
        const exitButton = this.createGlowButton(
            640 + buttonSpacing,
            buttonY,
            i18n.t('exit'),
            0xff4488
        );
        exitButton.on('pointerdown', () => {
            const goodbye = this.add.text(640, 360, i18n.t('goodbye'), {
                fontFamily: 'Cinzel',
                fontSize: 32,
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: goodbye,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                    this.time.delayedCall(2000, () => {
                        this.cameras.main.fadeOut(2000, 0, 0, 0);
                    });
                }
            });
        });
    }

    createGlowButton(x, y, text, glowColor) {
        const container = this.add.container(x, y);

        // Aura de brillo exterior (grande)
        const outerGlow = this.add.circle(0, 0, 100, glowColor, 0.1);

        // Aura de brillo medio
        const middleGlow = this.add.circle(0, 0, 70, glowColor, 0.2);

        // Fondo del botón
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.9);
        bg.fillRoundedRect(-90, -30, 180, 60, 15);

        // Borde brillante
        bg.lineStyle(3, glowColor, 0.8);
        bg.strokeRoundedRect(-90, -30, 180, 60, 15);

        // Reflejo interior
        const highlight = this.add.graphics();
        highlight.fillStyle(0xffffff, 0.1);
        highlight.fillRoundedRect(-85, -25, 170, 25, 12);

        // Texto
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Cinzel',
            fontSize: 26,
            color: '#ffffff',
            stroke: glowColor,
            strokeThickness: 1
        }).setOrigin(0.5);

        container.add([outerGlow, middleGlow, bg, highlight, buttonText]);
        container.setSize(180, 60);
        container.setInteractive();

        // Pulso constante
        this.tweens.add({
            targets: [outerGlow, middleGlow],
            alpha: 0.3,
            scale: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hover
        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.15,
                duration: 200,
                ease: 'Back.easeOut'
            });

            bg.clear();
            bg.fillStyle(0x2a2a5a, 1);
            bg.fillRoundedRect(-90, -30, 180, 60, 15);
            bg.lineStyle(4, glowColor, 1);
            bg.strokeRoundedRect(-90, -30, 180, 60, 15);

            const particles = this.add.particles(x, y, 'firefly', {
                speed: { min: 50, max: 100 },
                scale: { start: 0.4, end: 0 },
                blendMode: 'ADD',
                lifespan: 600,
                quantity: 5,
                tint: glowColor
            });

            this.time.delayedCall(600, () => particles.destroy());
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
}
