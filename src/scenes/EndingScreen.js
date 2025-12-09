import { Scene } from 'phaser';

export class EndingScreen extends Scene {
    constructor() {
        super('EndingScreen');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo radiante (Mezcla de colores)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000044, 0x440000, 0x444400, 0x004444, 1);
        bg.fillRect(0, 0, width, height);

        // Partículas de luz central
        const particles = this.add.particles(width / 2, height / 2, 'firefly', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 5,
            tint: [0x4488ff, 0xff4444, 0xffff44, 0xffffff] // Colores de los niveles
        });

        // Luz central pulsante
        const light = this.add.circle(width / 2, height / 2, 50, 0xffffff, 1);
        this.tweens.add({
            targets: light,
            scale: 1.5,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Texto Poético
        const message = "Has recorrido la oscuridad y abrazado tus sombras.\nAhora, tu luz brilla completa.\n\nLumina: Echoes of the Soul";

        const text = this.add.text(width / 2, height / 2 + 100, message, {
            fontFamily: 'Cinzel',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            shadow: { blur: 10, color: '#ffffff', fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Animación de entrada
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 3000,
            delay: 1000
        });

        // Click to Restart
        this.time.delayedCall(5000, () => {
            const restartText = this.add.text(width / 2, height - 50, 'Click to Restart', {
                fontFamily: 'Cinzel',
                fontSize: '20px',
                color: '#aaaaaa'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: restartText,
                alpha: 1,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            this.input.on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
        });
    }
}
