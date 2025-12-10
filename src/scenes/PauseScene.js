import { Scene } from 'phaser';
import { i18n } from '../i18n';

// Escena que se muestra cuando el jugador pausa el juego
export class PauseScene extends Scene {
    constructor() {
        super('PauseScene');
    }

    create(data) {
        // Guardo qué escena estaba pausada para poder retomarla luego
        this.activeSceneName = data.activeScene || 'Game';

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo oscuro opaco para tapar por completo lo que hay detrás
        // Uso el mismo color que en Settings para que todo se vea coherente
        this.add
            .rectangle(0, 0, width, height, 0x151525, 1)
            .setOrigin(0, 0);

        // Título principal de la pantalla de pausa
        this.add.text(
            width / 2,
            80,
            i18n.t('pause_title') || 'PAUSA',
            {
                fontFamily: 'Cinzel',
                fontSize: '48px',
                color: '#ffffff',
                align: 'center',
                stroke: '#4444ff',
                strokeThickness: 2 // mismo grosor que en Settings
            }
        )
            .setOrigin(0.5)
            .setResolution(2);

        // Subtítulo con frase temática
        this.add.text(
            width / 2,
            140,
            i18n.t('pause_subtitle') || 'Tu luz también necesita descansar',
            {
                fontFamily: 'Cinzel',
                fontSize: '20px',
                color: '#aaaadd', // mismo color que el subtítulo de Settings
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setResolution(2);

        // Configuración base de los botones
        const buttonY = 250;
        const buttonSpacing = 90;

        // Botón para reanudar la partida
        const resumeBtn = this.createGlowButton(
            width / 2,
            buttonY,
            i18n.t('resume') || 'Reanudar',
            0x44ff88
        );
        resumeBtn.on('pointerdown', () => this.resumeGame());

        // Botón para reiniciar el nivel actual
        const restartBtn = this.createGlowButton(
            width / 2,
            buttonY + buttonSpacing,
            i18n.t('restart') || 'Comenzar Juego',
            0xffaa44
        );
        restartBtn.on('pointerdown', () => this.restartGame());

        // Botón para abrir los ajustes desde la pausa
        const settingsBtn = this.createGlowButton(
            width / 2,
            buttonY + buttonSpacing * 2,
            i18n.t('settings') || 'Ajustes',
            0x4488ff
        );
        settingsBtn.on('pointerdown', () => this.openSettings());

        // Botón para salir al menú principal
        const exitBtn = this.createGlowButton(
            width / 2,
            buttonY + buttonSpacing * 3,
            i18n.t('exit_to_menu') || 'Salir',
            0xff4488
        );
        exitBtn.on('pointerdown', () => this.exitToMenu());

        // Pulsar ESC hace lo mismo que “Reanudar”
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
    }

    // Crea un botón con un ligero brillo y animación de pulso
    createGlowButton(x, y, text, glowColor) {
        const container = this.add.container(x, y);

        // Círculo de brillo por detrás del botón
        const glow = this.add.circle(0, 0, 80, glowColor, 0.15);

        // Fondo rectangular del botón
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a3a, 0.9);
        bg.fillRoundedRect(-90, -30, 180, 60, 15);
        bg.lineStyle(3, glowColor, 0.8);
        bg.strokeRoundedRect(-90, -30, 180, 60, 15);

        // Texto centrado del botón
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Cinzel',
            fontSize: 26,
            color: '#ffffff',
            stroke: glowColor,
            strokeThickness: 1
        })
            .setOrigin(0.5)
            .setResolution(2);

        // Agrupo todo dentro del container
        container.add([glow, bg, buttonText]);
        container.setSize(180, 60);
        container.setInteractive();

        // Pequeña animación de “respirar” del brillo
        this.tweens.add({
            targets: glow,
            alpha: 0.3,
            scale: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Efecto al pasar el ratón por encima
        container.on('pointerover', () => {
            // Escalo un poco el botón para que parezca más “vivo”
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 200
            });

            // Cambio el fondo para que parezca estado activo
            bg.clear();
            bg.fillStyle(0x2a2a5a, 1);
            bg.fillRoundedRect(-90, -30, 180, 60, 15);
            bg.lineStyle(4, glowColor, 1);
            bg.strokeRoundedRect(-90, -30, 180, 60, 15);
        });

        // Al salir con el ratón, vuelvo al estado normal
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

    // Reanuda la escena que estaba pausada y cierra la escena de pausa
    resumeGame() {
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.resume();
        }
        this.scene.stop();
    }

    // Reinicia la escena activa (nivel) y sale de la pausa
    restartGame() {
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.restart();
        }
        this.scene.stop();
    }

    // Abre la escena de ajustes desde la pausa
    openSettings() {
        // Cierro la escena de pausa para que no queden fondos superpuestos
        this.scene.stop();

        // Le digo a Settings a qué escena tiene que volver y con qué datos
        this.scene.start('Settings', {
            returnTo: 'PauseScene',
            returnData: { activeScene: this.activeSceneName }
        });
    }

    // Detiene el nivel actual y vuelve al menú principal
    exitToMenu() {
        const activeScene = this.scene.get(this.activeSceneName);
        if (activeScene) {
            activeScene.scene.stop();
        }

        this.scene.stop();
        this.scene.start('MainMenu');
    }
}
