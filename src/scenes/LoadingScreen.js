import { Scene } from 'phaser';

// Pantalla de carga / transición antes del menú principal
export class LoadingScreen extends Scene {
    constructor() {
        super('LoadingScreen');
    }

    create() {
        // Tamaño “fijo” que estoy usando para el layout
        const width = 1280;
        const height = 720;

        // ================== FONDO Y VIÑETA ==================

        // Fondo usando la ilustración de la pantalla de título
        const bg = this.add.image(width / 2, height / 2, 'title_screen');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Capa oscura encima para que la barra se vea mejor
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

        // Graphics “dummy” para la viñeta (luego realmente uso un canvas)
        const vignette = this.add.graphics();

        // Genero una textura de tipo canvas con un gradiente radial
        // para simular los bordes oscurecidos (viñeta)
        const texture = this.textures.createCanvas('vignette', width, height);
        const ctx = texture.getContext();
        const grd = ctx.createRadialGradient(
            width / 2, height / 2, height / 3,   // círculo interior (zona limpia)
            width / 2, height / 2, height        // círculo exterior (bordes oscuros)
        );
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, 'rgba(0,0,0,0.9)');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        texture.refresh();

        // Imagen con la textura de viñeta encima del fondo
        this.add.image(width / 2, height / 2, 'vignette').setScrollFactor(0);

        // ================== TEXTOS SUPERIORES ==================

        // Título del juego en pequeño
        this.add.text(width / 2, 150, 'LUMINA', {
            fontFamily: 'Cinzel',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#88aaff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Texto inicial de “cargando”
        const loadingText = this.add.text(
            width / 2,
            height / 2 - 80,
            'Reconectando con tu luz interior...',
            {
                fontFamily: 'Cinzel',
                fontSize: 24,
                color: '#aaaadd',
                align: 'center',
                wordWrap: { width: 800 }
            }
        ).setOrigin(0.5);

        // ================== BARRA DE CARGA ==================

        const barWidth = 600;
        const barHeight = 30;
        const barX = width / 2;
        const barY = height / 2;

        // Marco exterior con un poco de brillo
        const barOutline = this.add.graphics();
        barOutline.lineStyle(3, 0x88aaff, 0.8);
        barOutline.strokeRoundedRect(
            barX - barWidth / 2 - 5,
            barY - barHeight / 2 - 5,
            barWidth + 10,
            barHeight + 10,
            15
        );

        // Fondo de la barra
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1a1a3a, 0.8);
        barBg.fillRoundedRect(
            barX - barWidth / 2,
            barY - barHeight / 2,
            barWidth,
            barHeight,
            10
        );

        // Graphics donde voy a ir dibujando el progreso
        const progressBar = this.add.graphics();

        // ================== PARTÍCULAS ALREDEDOR DE LA BARRA ==================

        const particles = this.add.particles(0, 0, 'firefly', {
            x: { min: barX - barWidth / 2, max: barX + barWidth / 2 },
            y: barY,
            speedY: { min: -50, max: -100 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1500,
            frequency: 100,
            tint: 0xaaddff
        });

        // Porcentaje numérico encima de la barra
        const percentText = this.add.text(barX, barY, '0%', {
            fontFamily: 'Cinzel',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // ================== FRASES MOTIVADORAS ==================

        const quotes = [
            '"Incluso en la oscuridad más profunda, una sola chispa puede encender la esperanza."',
            '"El miedo es solo una sombra; la luz siempre prevalece."',
            '"Cada paso hacia adelante deja atrás la oscuridad."',
            '"Tu luz interior es más fuerte que cualquier obstáculo."',
            '"No temas a las sombras, solo significan que hay luz cerca."',
            '"La ira nubla la mente, pero la calma ilumina el camino."',
            '"Sigue brillando, el mundo necesita tu luz."'
        ];

        // ================== ANIMACIÓN DE CARGA ==================

        let progress = 0;

        const loadingTimer = this.time.addEvent({
            delay: 30,        // intervalo entre “ticks” de carga
            callback: () => {
                progress += 2; // incremento rápido para que no se haga eterno

                // Limpio y vuelvo a pintar la barra
                progressBar.clear();
                const currentWidth = (barWidth * progress) / 100;

                // “Falso gradiente” dividiendo la barra en segmentos
                const segments = 50;
                for (let i = 0; i < segments; i++) {
                    const segmentProgress = i / segments;
                    const segmentWidth = currentWidth / segments;

                    let color;
                    if (segmentProgress < 0.33) {
                        color = 0x4488ff; // Azul
                    } else if (segmentProgress < 0.66) {
                        color = 0x8844ff; // Violeta
                    } else {
                        color = 0xffaa44; // Dorado
                    }

                    progressBar.fillStyle(color, 0.9);
                    progressBar.fillRoundedRect(
                        barX - barWidth / 2 + i * segmentWidth,
                        barY - barHeight / 2,
                        segmentWidth + 1,
                        barHeight,
                        10
                    );
                }

                // Actualizo el texto del porcentaje
                percentText.setText(`${Math.floor(progress)}%`);

                // Pequeño destello en el borde de la barra para que parezca más “vivo”
                if (progress > 0) {
                    const glowX = barX - barWidth / 2 + currentWidth;
                    const glow = this.add.circle(glowX, barY, 15, 0xffffff, 0.6);
                    this.tweens.add({
                        targets: glow,
                        alpha: 0,
                        scale: 2,
                        duration: 500,
                        onComplete: () => glow.destroy()
                    });
                }

                // Cambio de frase cada 20% aproximadamente
                if (Math.floor(progress) % 20 === 0 && Math.floor(progress) > 0) {
                    const quote = Phaser.Utils.Array.GetRandom(quotes);
                    loadingText.setText(quote);

                    // Hago un pequeño fade para que no cambie “a lo bruto”
                    this.tweens.add({
                        targets: loadingText,
                        alpha: { from: 0, to: 1 },
                        duration: 500
                    });
                }

                // Cuando llega al 100%, cierro la pantalla de carga
                if (progress >= 100) {
                    loadingTimer.remove();
                    particles.stop();

                    this.cameras.main.fadeOut(800, 0, 0, 0);

                    this.time.delayedCall(800, () => {
                        this.scene.start('MainMenu');
                    });
                }
            },
            loop: true
        });
    }
}
