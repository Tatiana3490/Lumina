import { Scene } from 'phaser';

// Escena que se muestra al terminar el juego
export class EndingScreen extends Scene {
    constructor() {
        // Nombre de la escena para poder llamarla desde otras
        super('EndingScreen');
    }

    create() {
        // Guardo ancho y alto de la cámara para reutilizarlo
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // ==== FONDO RADIANTE ====
        // Dibujo un fondo con degradado de colores relacionados con los niveles
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000044, 0x440000, 0x444400, 0x004444, 1);
        bg.fillRect(0, 0, width, height);

        // ==== PARTÍCULAS DE LUZ EN EL CENTRO ====
        // Partículas tipo luciérnaga que dan sensación de energía en el centro
        const particles = this.add.particles(width / 2, height / 2, 'firefly', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 5,
            // Colores inspirados en los distintos niveles del juego
            tint: [0x4488ff, 0xff4444, 0xffff44, 0xffffff]
        });

        // ==== LUZ CENTRAL PULSANTE ====
        // Círculo de luz que hace de “corazón” de la escena
        const light = this.add.circle(width / 2, height / 2, 50, 0xffffff, 1);
        this.tweens.add({
            targets: light,
            scale: 1.5,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1 // Se repite para que la luz no deje de latir
        });

        // ==== TEXTO FINAL POÉTICO ====
        const message = "Has recorrido la oscuridad y abrazado tus sombras.\nAhora, tu luz brilla completa.\n\nLumina: Echoes of the Soul";

        // Texto centrado con una pequeña animación de aparición
        const text = this.add.text(width / 2, height / 2 + 100, message, {
            fontFamily: 'Cinzel',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            shadow: { blur: 10, color: '#ffffff', fill: true }
        })
            .setOrigin(0.5)
            .setAlpha(0);

        // Hago que el texto vaya apareciendo poco a poco
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 3000,
            delay: 1000
        });

        // ==== REINICIAR DESDE LA PANTALLA FINAL ====
        // Después de unos segundos muestro el texto para reiniciar
        this.time.delayedCall(5000, () => {
            const restartText = this.add.text(width / 2, height - 50, 'Click to Restart', {
                fontFamily: 'Cinzel',
                fontSize: '20px',
                color: '#aaaaaa'
            })
                .setOrigin(0.5)
                .setAlpha(0);

            // Pequeño parpadeo para llamar la atención al jugador
            this.tweens.add({
                targets: restartText,
                alpha: 1,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            // Si el jugador hace clic, vuelve al menú principal
            this.input.on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
        });
    }
}
