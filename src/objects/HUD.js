// HUD: interfaz del jugador (barra de energía + contador de estrellas)
export class HUD {
    constructor(scene, totalFragments) {
        // Guardo la escena donde voy a dibujar el HUD
        this.scene = scene;

        // Número total de fragmentos/estrellas del nivel
        this.totalFragments = totalFragments;

        // Contador de fragmentos recogidos
        this.collectedFragments = 0;

        // Flag para saber si ya estoy haciendo el parpadeo de poca energía
        this.pulsing = false;

        // Creo todos los elementos visuales del HUD
        this.create();
    }

    /**
     * Método principal que coloca los elementos del HUD en pantalla:
     * - Barra de energía a la izquierda
     * - Contador de estrellas a la derecha
     */
    create() {
        const padding = 100;
        const topY = 100; // Lo bajo un poco para dejar hueco al título del nivel

        // === BARRA DE ENERGÍA (Izquierda) ===
        // La muevo un pelín a la derecha para que no quede pegada al borde
        this.createEnergyBar(padding + 40, topY);

        // === CONTADOR DE ESTRELLAS (Derecha) ===
        this.createStarCounter(1100, topY);
    }

    /**
     * Crea la barra de energía del jugador en la posición (x, y).
     */
    createEnergyBar(x, y) {
        // Guardo posición y tamaño para reutilizarlos al redibujar la barra
        this.energyBarX = x;
        this.energyBarY = y;
        this.energyBarWidth = 200;
        this.energyBarHeight = 20;

        // Fondo oscuro detrás de la barra (para que resalte sobre el fondo del juego)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.5);
        bg.fillRoundedRect(
            x - 5,
            y - 5,
            this.energyBarWidth + 10,
            this.energyBarHeight + 10,
            10
        );
        bg.setScrollFactor(0).setDepth(10000);
        this.bgGraphics = bg; // Me lo guardo para poder mostrar/ocultar el HUD

        // Icono de Energía (un círculo amarillo brillante)
        const icon = this.scene.add.circle(x - 20, y + 10, 15, 0xffff00);
        icon.setStrokeStyle(2, 0xffaa00);
        icon.setScrollFactor(0).setDepth(10001);
        this.energyIcon = icon; // También lo guardo para el setVisible y los efectos

        // Gráfico donde voy a dibujar la barra en sí
        this.energyBar = this.scene.add.graphics();
        this.energyBar.setScrollFactor(0).setDepth(10001);

        // Texto con el porcentaje de energía (ej. "100%")
        this.energyText = this.scene.add.text(
            x + this.energyBarWidth + 15,
            y,
            '100%',
            {
                fontFamily: 'Cinzel',
                fontSize: '18px',
                color: '#ffff00',
                fontStyle: 'bold'
            }
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10001);
    }

    /**
     * Crea el contador de estrellas/fragmentos recogidos en la posición (x, y).
     */
    createStarCounter(x, y) {
        // Fondo oscuro para que el contador se vea bien
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.5);
        bg.fillRoundedRect(x - 40, y - 15, 120, 40, 10);
        bg.setScrollFactor(0).setDepth(10000);
        this.starBgGraphics = bg; // Lo guardo para poder ocultarlo/mostrarlo

        // Icono de Estrella dibujado a mano con gráficos
        const starGraphics = this.scene.add.graphics();
        starGraphics.fillStyle(0xffd700, 1); // Dorado
        this.drawStar(starGraphics, x - 20, y + 5, 5, 12, 6);
        starGraphics.setScrollFactor(0).setDepth(10001);
        this.starIcon = starGraphics; // También lo guardo

        // Texto del tipo "0/4", "3/8", etc.
        this.starText = this.scene.add.text(
            x + 10,
            y - 5,
            `0/${this.totalFragments}`,
            {
                fontFamily: 'Cinzel',
                fontSize: '24px',
                color: '#ffd700',
                fontStyle: 'bold'
            }
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10001);
    }

    /**
     * Función auxiliar para dibujar una estrella con gráficos.
     * La uso para el icono del contador de fragmentos.
     */
    drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        graphics.beginPath();
        graphics.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            // Punto exterior
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            graphics.lineTo(x, y);
            rot += step;

            // Punto interior
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            graphics.lineTo(x, y);
            rot += step;
        }

        graphics.lineTo(cx, cy - outerRadius);
        graphics.closePath();
        graphics.fillPath();
    }

    /**
     * Dibuja la barra de energía en función del porcentaje (0..1).
     * Cambia el color según si la energía es alta, media o baja.
     */
    updateEnergyBar(x, y, width, height, percentage) {
        // Limpio el gráfico antes de dibujar la nueva barra
        this.energyBar.clear();

        const currentWidth = width * percentage;

        // Selecciono un color MUY brillante según el nivel de energía
        let color;
        if (percentage > 0.6) {
            color = 0x00ff00; // Verde brillante
        } else if (percentage > 0.3) {
            color = 0xffaa00; // Naranja brillante
        } else {
            color = 0xff0000; // Rojo brillante
        }

        // Barra sólida
        this.energyBar.fillStyle(color, 1);
        this.energyBar.fillRoundedRect(x, y, currentWidth, height, 8);

        // Pequeño brillo en el borde si todavía queda energía
        if (percentage > 0) {
            this.energyBar.fillStyle(0xffffff, 1);
            this.energyBar.fillCircle(x + currentWidth, y + height / 2, 8);
        }
    }

    /**
     * Actualiza la energía del jugador en pantalla.
     * Recibe la energía actual y la máxima, y recalcula el porcentaje.
     */
    updateEnergy(currentEnergy, maxEnergy) {
        const percentage = Math.max(0, currentEnergy / maxEnergy);

        // Redibujo la barra con el nuevo porcentaje
        this.updateEnergyBar(
            this.energyBarX,
            this.energyBarY,
            this.energyBarWidth,
            this.energyBarHeight,
            percentage
        );

        // Actualizo el texto de porcentaje (ej: "75%")
        this.energyText.setText(`${Math.round(percentage * 100)}%`);
    }

    /**
     * Actualiza el contador de estrellas/fragmentos recogidos.
     */
    updateStars(collected, total) {
        this.collectedFragments = collected;
        this.starText.setText(`${collected}/${total}`);

        // Efecto de "pop" en el texto cuando recojo una estrella
        this.scene.tweens.add({
            targets: this.starText,
            scale: 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Empieza el parpadeo de baja energía en el icono y el texto.
     */
    startLowEnergyPulse() {
        // Si ya estoy parpadeando, no hago nada
        if (this.pulsing) return;

        this.pulsing = true;

        this.scene.tweens.add({
            targets: [this.energyIcon, this.energyText],
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Detiene el parpadeo de baja energía y restaura el alpha normal.
     */
    stopLowEnergyPulse() {
        this.pulsing = false;

        this.energyIcon.setAlpha(1);
        this.energyText.setAlpha(1);

        // Mato los tweens que estaban animando estos elementos
        this.scene.tweens.killTweensOf([this.energyIcon, this.energyText]);
    }

    /**
     * Muestra u oculta todos los elementos del HUD.
     * Lo uso por ejemplo en las intros cinemáticas o en la pausa.
     */
    setVisible(visible) {
        this.energyBar.setVisible(visible);
        this.energyText.setVisible(visible);
        this.starText.setVisible(visible);

        if (this.bgGraphics) this.bgGraphics.setVisible(visible);
        if (this.energyIcon) this.energyIcon.setVisible(visible);
        if (this.starBgGraphics) this.starBgGraphics.setVisible(visible);
        if (this.starIcon) this.starIcon.setVisible(visible);
    }

    /**
     * Método de limpieza por si en el futuro quiero destruir
     * manualmente elementos del HUD. De momento no hago nada
     * porque Phaser limpia la escena completa al cambiar de escena.
     */
    destroy() {
        // De momento lo dejo vacío a propósito
    }
}
