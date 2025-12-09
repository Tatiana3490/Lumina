export class HUD {
    constructor(scene, totalFragments) {
        this.scene = scene;
        this.totalFragments = totalFragments;
        this.collectedFragments = 0;

        this.create();
    }

    create() {
        const padding = 100;
        const topY = 100; // Bajado para dejar sitio al título arriba

        // === BARRA DE ENERGÍA (Izquierda) ===
        // Movida un poco a la derecha como pidió el usuario
        this.createEnergyBar(padding + 40, topY);

        // === CONTADOR DE ESTRELLAS (Derecha) ===
        this.createStarCounter(1100, topY);
    }

    createEnergyBar(x, y) {
        this.energyBarX = x;
        this.energyBarY = y;
        this.energyBarWidth = 200;
        this.energyBarHeight = 20;

        // Background Glow
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.5);
        bg.fillRoundedRect(x - 5, y - 5, this.energyBarWidth + 10, this.energyBarHeight + 10, 10);
        bg.setScrollFactor(0).setDepth(10000);
        this.bgGraphics = bg; // Store for visibility toggle

        // Icono de Energía (Círculo brillante)
        const icon = this.scene.add.circle(x - 20, y + 10, 15, 0xffff00);
        icon.setStrokeStyle(2, 0xffaa00);
        icon.setScrollFactor(0).setDepth(10001);
        this.energyIcon = icon; // Store for visibility toggle

        // Barra vacía
        this.energyBar = this.scene.add.graphics();
        this.energyBar.setScrollFactor(0).setDepth(10001);

        // Texto
        this.energyText = this.scene.add.text(x + this.energyBarWidth + 15, y, '100%', {
            fontFamily: 'Cinzel',
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(10001);
    }

    createStarCounter(x, y) {
        // Background Glow
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.5);
        bg.fillRoundedRect(x - 40, y - 15, 120, 40, 10);
        bg.setScrollFactor(0).setDepth(10000);
        this.starBgGraphics = bg; // Store for visibility toggle

        // Icono de Estrella (Dibujado manualmente)
        const starGraphics = this.scene.add.graphics();
        starGraphics.fillStyle(0xffd700, 1);
        this.drawStar(starGraphics, x - 20, y + 5, 5, 12, 6);
        starGraphics.setScrollFactor(0).setDepth(10001);
        this.starIcon = starGraphics; // Store for visibility toggle

        // Texto
        this.starText = this.scene.add.text(x + 10, y - 5, `0/${this.totalFragments}`, {
            fontFamily: 'Cinzel',
            fontSize: '24px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(10001);
    }

    drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        graphics.beginPath();
        graphics.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            graphics.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            graphics.lineTo(x, y);
            rot += step;
        }

        graphics.lineTo(cx, cy - outerRadius);
        graphics.closePath();
        graphics.fillPath();
    }

    startLowEnergyPulse() {
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

    stopLowEnergyPulse() {
        this.pulsing = false;
        this.energyIcon.setAlpha(1);
        this.energyText.setAlpha(1);
        this.scene.tweens.killTweensOf([this.energyIcon, this.energyText]);
    }

    updateEnergyBar(x, y, width, height, percentage) {
        this.energyBar.clear();

        const currentWidth = width * percentage;

        // Colores MUY BRILLANTES
        let color;
        if (percentage > 0.6) {
            color = 0x00ff00; // Verde brillante
        } else if (percentage > 0.3) {
            color = 0xffaa00; // Naranja brillante
        } else {
            color = 0xff0000; // Rojo brillante
        }

        // Barra sólida brillante
        this.energyBar.fillStyle(color, 1);
        this.energyBar.fillRoundedRect(x, y, currentWidth, height, 8);

        // Brillo en el borde
        if (percentage > 0) {
            this.energyBar.fillStyle(0xffffff, 1);
            this.energyBar.fillCircle(x + currentWidth, y + height / 2, 8);
        }
    }

    updateEnergy(currentEnergy, maxEnergy) {
        const percentage = Math.max(0, currentEnergy / maxEnergy);
        this.updateEnergyBar(this.energyBarX, this.energyBarY, this.energyBarWidth, this.energyBarHeight, percentage);
        this.energyText.setText(`${Math.round(percentage * 100)}%`);
    }

    updateStars(collected, total) {
        this.collectedFragments = collected;
        this.starText.setText(`${collected}/${total}`);

        // Efecto de brillo
        this.scene.tweens.add({
            targets: this.starText,
            scale: 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    setVisible(visible) {
        this.energyBar.setVisible(visible);
        this.energyText.setVisible(visible);
        this.starText.setVisible(visible);

        if (this.bgGraphics) this.bgGraphics.setVisible(visible);
        if (this.energyIcon) this.energyIcon.setVisible(visible);
        if (this.starBgGraphics) this.starBgGraphics.setVisible(visible);
        if (this.starIcon) this.starIcon.setVisible(visible);
    }

    destroy() {
        // No hay container, elementos individuales se destruyen con la escena
    }
}
