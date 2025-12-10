import { Scene } from 'phaser';
import { i18n } from '../i18n';

// Escena del menú principal del juego
export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // ================== MÚSICA DEL MENÚ ==================
        // Paro cualquier música que venga sonando de otras escenas (niveles, ending, etc.)
        this.sound.stopAll();

        // Música propia del menú principal
        this.bgMusic = this.sound.add('music_menu', {
            volume: 0.6,
            loop: true
        });

        // Truco de Phaser para las políticas de autoplay del navegador:
        // hasta que el usuario no haga una interacción, el audio puede estar bloqueado.
        if (this.sound.locked) {
            // El sonido está "bloqueado" hasta que el usuario interactúe (click, tecla, etc.)
            this.sound.once('unlocked', () => {
                this.bgMusic.play();
            });
        } else {
            // Si ya se ha desbloqueado por una interacción anterior, lo reproduzco directamente
            this.bgMusic.play();
        }

        // ================== FONDO ==================
        // Rectángulo base oscuro para asegurarnos de que no se ve el fondo por defecto
        this.add.rectangle(640, 360, 1280, 720, 0x0a0a1a).setOrigin(0.5);

        // Imagen de título centrada. La escalo para que quepa bien en la parte superior.
        const titleImage = this.add.image(640, 300, 'title_screen');

        // Cálculo de escala para que se vea completa, dejando espacio abajo para los botones
        const scaleX = 1280 / titleImage.width;
        const scaleY = 500 / titleImage.height; // 500px de alto reservados para el arte
        const scale = Math.min(scaleX, scaleY);
        titleImage.setScale(scale);

        // ================== BOTONES ==================
        const buttonY = 580;          // altura general donde coloco los botones
        const buttonSpacing = 220;    // separación horizontal entre botones

        // ----- Botón START (verde brillante) -----
        const startButton = this.createGlowButton(
            640 - buttonSpacing,
            buttonY,
            i18n.t('start'), // texto traducido según idioma
            0x44ff88         // color de brillo
        );

        startButton.on('pointerdown', () => {
            // Al empezar partida paro la música del menú
            if (this.bgMusic) this.bgMusic.stop();

            // Pequeño fundido a negro antes de cargar la escena del juego
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('Game');
            });
        });

        // ----- Botón SETTINGS (azul brillante) -----
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

        // ----- Botón EXIT (rojo brillante) -----
        // Nota: en navegador no se puede “cerrar” el juego como tal,
        // pero muestro un mensaje de despedida para darle un cierre bonito.
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
            })
                .setOrigin(0.5)
                .setAlpha(0);

            // Hago aparecer el texto y luego fundido a negro general
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

    /**
     * Crea un botón con efecto de brillo alrededor usando un container.
     * x, y: posición central del botón en pantalla
     * text: texto que se muestra (ya viene traducido con i18n)
     * glowColor: color principal del brillo y el borde
     */
    createGlowButton(x, y, text, glowColor) {
        // Container que agrupa todos los elementos visuales del botón
        const container = this.add.container(x, y);

        // Círculo de brillo exterior grande (aura más suave)
        const outerGlow = this.add.circle(0, 0, 100, glowColor, 0.1);

        // Círculo de brillo medio para reforzar el efecto
        const middleGlow = this.add.circle(0, 0, 70, glowColor, 0.2);

        // Fondo del botón (rectángulo redondeado)
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.9);
        bg.fillRoundedRect(-90, -30, 180, 60, 15);

        // Borde brillante con el mismo color que el glow
        bg.lineStyle(3, glowColor, 0.8);
        bg.strokeRoundedRect(-90, -30, 180, 60, 15);

        // Pequeño “highlight” en la parte superior para efecto de brillo interno
        const highlight = this.add.graphics();
        highlight.fillStyle(0xffffff, 0.1);
        highlight.fillRoundedRect(-85, -25, 170, 25, 12);

        // Texto centrado del botón
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Cinzel',
            fontSize: 26,
            color: '#ffffff',
            stroke: glowColor,
            strokeThickness: 1
        }).setOrigin(0.5);

        // Añado todos los elementos al container
        container.add([outerGlow, middleGlow, bg, highlight, buttonText]);
        container.setSize(180, 60);
        container.setInteractive();

        // ================== ANIMACIÓN BASE (PULSO) ==================
        // Efecto de “respiración” constante en el glow
        this.tweens.add({
            targets: [outerGlow, middleGlow],
            alpha: 0.3,
            scale: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ================== HOVER / INTERACCIÓN ==================

        // Efecto al pasar el ratón por encima del botón
        container.on('pointerover', () => {
            // Escalo el botón ligeramente para que parezca más “vivo”
            this.tweens.add({
                targets: container,
                scale: 1.15,
                duration: 200,
                ease: 'Back.easeOut'
            });

            // Cambio el fondo para que parezca más activo
            bg.clear();
            bg.fillStyle(0x2a2a5a, 1);
            bg.fillRoundedRect(-90, -30, 180, 60, 15);
            bg.lineStyle(4, glowColor, 1);
            bg.strokeRoundedRect(-90, -30, 180, 60, 15);

            // Pequeño chorro de partículas tipo luciérnaga
            const particles = this.add.particles(x, y, 'firefly', {
                speed: { min: 50, max: 100 },
                scale: { start: 0.4, end: 0 },
                blendMode: 'ADD',
                lifespan: 600,
                quantity: 5,
                tint: glowColor
            });

            // Destruyo las partículas tras un rato para no acumularlas
            this.time.delayedCall(600, () => particles.destroy());
        });

        // Cuando el ratón sale del botón, vuelvo al estado normal
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
