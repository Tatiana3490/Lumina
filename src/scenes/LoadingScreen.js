import { Scene } from 'phaser';

export class LoadingScreen extends Scene {
    constructor() {
        super('LoadingScreen');
    }

    create() {
        const width = 1280;
        const height = 720;

        // Fondo con imagen de título
        const bg = this.add.image(width / 2, height / 2, 'title_screen');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Overlay oscuro para que se vea la barra
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

        // Vignette effect (Bordes difuminados oscuros)
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 1);
        vignette.fillRect(0, 0, width, height);

        // Crear máscara de transparencia radial para el vignette
        const maskImage = this.make.image({
            x: width / 2,
            y: height / 2,
            key: 'title_screen', // Usamos cualquier imagen como base, no importa
            add: false
        });

        // Crear un canvas texture para el gradiente radial (máscara)
        const maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillCircle(width / 2, height / 2, height * 0.6); // Círculo central visible

        // Aplicar máscara inversa es complejo en Phaser simple, así que usaremos un overlay de imagen "vignette" si tuviéramos,
        // o simplemente dibujaremos bordes oscuros con gradiente manual (más costoso pero efectivo).
        // Alternativa simple: Overlay negro con alpha bajo en bordes? No, el usuario quiere bordes difuminados.
        // Mejor aproximación procedural:

        vignette.clear();
        // Dibujar múltiples rectángulos con opacidad creciente hacia afuera
        // Esto simula un vignette sin shaders complejos
        /*
        const maxDist = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
        for (let y = 0; y < height; y+=10) {
            for (let x = 0; x < width; x+=10) {
                // ... muy costoso para JS puro en loop.
            }
        }
        */

        // Usaremos una imagen de gradiente radial generada proceduralmente
        const texture = this.textures.createCanvas('vignette', width, height);
        const ctx = texture.getContext();
        const grd = ctx.createRadialGradient(width / 2, height / 2, height / 3, width / 2, height / 2, height);
        grd.addColorStop(0, "rgba(0,0,0,0)");
        grd.addColorStop(1, "rgba(0,0,0,0.9)");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        texture.refresh();

        this.add.image(width / 2, height / 2, 'vignette').setScrollFactor(0);


        // Título pequeño arriba
        this.add.text(width / 2, 150, 'LUMINA', {
            fontFamily: 'Cinzel',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#88aaff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Texto "Cargando..." inicial
        const loadingText = this.add.text(width / 2, height / 2 - 80, 'Reconectando con tu luz interior...', {
            fontFamily: 'Cinzel',
            fontSize: 24,
            color: '#aaaadd',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        // Barra de carga - fondo
        const barWidth = 600;
        const barHeight = 30;
        const barX = width / 2;
        const barY = height / 2;

        // Marco exterior con brillo
        const barOutline = this.add.graphics();
        barOutline.lineStyle(3, 0x88aaff, 0.8);
        barOutline.strokeRoundedRect(barX - barWidth / 2 - 5, barY - barHeight / 2 - 5, barWidth + 10, barHeight + 10, 15);

        // Fondo de la barra
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1a1a3a, 0.8);
        barBg.fillRoundedRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 10);

        // Barra de progreso (gradiente simulado con múltiples rectángulos)
        const progressBar = this.add.graphics();

        // Partículas de luz alrededor de la barra
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

        // Texto de porcentaje
        const percentText = this.add.text(barX, barY, '0%', {
            fontFamily: 'Cinzel',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Frases motivadoras
        const quotes = [
            '"Incluso en la oscuridad más profunda, una sola chispa puede encender la esperanza."',
            '"El miedo es solo una sombra; la luz siempre prevalece."',
            '"Cada paso hacia adelante deja atrás la oscuridad."',
            '"Tu luz interior es más fuerte que cualquier obstáculo."',
            '"No temas a las sombras, solo significan que hay luz cerca."',
            '"La ira nubla la mente, pero la calma ilumina el camino."',
            '"Sigue brillando, el mundo necesita tu luz."'
        ];

        // Animación de carga
        let progress = 0;
        const loadingTimer = this.time.addEvent({
            delay: 30, // Más rápido
            callback: () => {
                progress += 2; // Carga mucho más rápida

                // Dibujar barra de progreso con gradiente
                progressBar.clear();
                const currentWidth = (barWidth * progress) / 100;

                // Gradiente de colores (azul -> violeta -> dorado)
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
                        barX - barWidth / 2 + (i * segmentWidth),
                        barY - barHeight / 2,
                        segmentWidth + 1,
                        barHeight,
                        10
                    );
                }

                // Actualizar texto
                percentText.setText(`${Math.floor(progress)}%`);

                // Brillo en el borde de la barra
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

                // Cambiar frase cada 20%
                if (Math.floor(progress) % 20 === 0 && Math.floor(progress) > 0) {
                    const quote = Phaser.Utils.Array.GetRandom(quotes);
                    loadingText.setText(quote);
                    // Efecto de fade en el texto
                    this.tweens.add({
                        targets: loadingText,
                        alpha: { from: 0, to: 1 },
                        duration: 500
                    });
                }

                // Completado
                if (progress >= 100) {
                    loadingTimer.remove();
                    particles.stop();

                    // Fade out y transición
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
