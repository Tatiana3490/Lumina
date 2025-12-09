import { Physics, Input } from 'phaser';

export const PlayerState = {
    NORMAL: 'NORMAL',
    CINEMATIC: 'CINEMATIC',
    FLYING: 'FLYING'
};

export class Player extends Physics.Arcade.Sprite {
    constructor(scene, x, y, totalStars = 0) {
        super(scene, x, y, 'fairy_idle_0');

        // === REGISTRO EN LA ESCENA Y FÍSICAS ===
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDragX(600); // frena rápido al soltar movimiento

        // === TAMAÑO DEL CUERPO DE COLISIÓN ===
        // Sprite original: 476x442.
        // Ajustamos el cuerpo para que sea más pequeño que el sprite
        // y quede centrado en la parte inferior (zona de los pies).
        this.setBodySize(150, 260);
        this.setOffset(163, 182);

        // Escala visual (el cuerpo de físicas no cambia con la escala)
        this.baseScale = 0.15;
        this.setScale(this.baseScale);

        // Que le afecten las luces y se dibuje por delante de plataformas
        this.setPipeline('Light2D'); // ★
        this.setDepth(50);          // ★

        // === MÁQUINA DE ESTADOS DEL JUGADOR ===
        this.currentState = PlayerState.NORMAL;

        // === SISTEMA DE LUZ/VIDA ===
        this.maxLight = 180;
        this.currentLight = 180;
        this.hits = 0;
        this.maxHits = 3;

        // Luz principal (energía)
        this.light = scene.lights.addLight(x, y, 180, 0xffdd00, 1.5);

        // Halo dorado para “evolución” al recoger estrellas
        this.goldenHalo = scene.lights.addLight(x, y, 60, 0xffd700, 0);

        // === INPUT ===
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.jumpKey = scene.input.keyboard.addKey('SPACE');
        this.wKey = scene.input.keyboard.addKey('W');
        this.aKey = scene.input.keyboard.addKey('A');
        this.sKey = scene.input.keyboard.addKey('S');
        this.dKey = scene.input.keyboard.addKey('D');

        // ---- SFX ----
        this.jumpSound = scene.sound.add('sfx_jump', { volume: 0.6 });


        // === ESTRELLAS / PROGRESO ===
        this.starsCollected = 0;
        this.totalStars = totalStars;
        this.isGoldenLumina = false;

        // Vuelo
        this.canFly = false;

        // === PARTÍCULAS DE AURA (APAGADAS AL INICIO) ===
        this.auraParticles = scene.add.particles(0, 0, 'firefly', {
            speed: { min: 20, max: 40 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            frequency: 200,
            tint: 0x88ff88,
            quantity: 0
        });
        this.auraParticles.startFollow(this);
        this.auraParticles.stop();

        // === SALTOS (DOBLE SALTO) ===
        this.maxJumps = 2;   // 1 salto + 1 salto extra en el aire
        this.jumpsLeft = 2;
    }

    // Porcentaje de energía (0–1)
    getEnergyPercentage() {
        return this.currentLight / this.maxLight;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Sincronizar luces con la posición del jugador
        this.light.x = this.x;
        this.light.y = this.y;
        this.goldenHalo.x = this.x;
        this.goldenHalo.y = this.y;

        // Efecto visual de la luz según energía
        this.updateLightVisuals(time);

        // Lógica según el estado actual
        if (this.currentState === PlayerState.NORMAL) {
            this.handleNormalMovement();
        } else if (this.currentState === PlayerState.FLYING) {
            this.handleFlyingMovement();
        } else if (this.currentState === PlayerState.CINEMATIC) {
            // En modo cinemático se congela al personaje
            this.setVelocity(0, 0);
            this.body.allowGravity = false;
        }
    }

    // Ajusta radio e intensidad de la luz en función de la energía
    updateLightVisuals(time) {
        const energyPct = this.getEnergyPercentage();

        // Radio base en función de la energía (50–180)
        let targetRadius = 50 + (130 * energyPct);
        let targetIntensity = 1.5;

        // Parpadeo cuando la energía es baja
        if (energyPct < 0.25) {
            targetIntensity = 1.0 + (Math.random() * 0.5);
            targetRadius += Math.sin(time * 0.02) * 10;
        }

        // Interpolación suave
        this.light.radius += (targetRadius - this.light.radius) * 0.1;
        this.light.intensity += (targetIntensity - this.light.intensity) * 0.1;
    }

    // === MOVIMIENTO NORMAL (SUELO + DOBLE SALTO + PLANE0) ===
    handleNormalMovement() {
        const body = this.body;
        // onFloor() ya comprueba colisión con suelo, pero añadimos blocked/touching por si acaso
        const onGround = body.onFloor() || body.blocked.down || body.touching.down;

        // Horizontal
        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(true);
            if (onGround) this.anims.play('fairy_walk', true);
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.setVelocityX(200);
            this.setFlipX(false);
            if (onGround) this.anims.play('fairy_walk', true);
        } else {
            this.setAccelerationX(0);
            if (onGround) this.anims.play('fairy_idle', true);
        }

        // Reset de saltos cuando toca suelo
        if (onGround) {
            this.jumpsLeft = this.maxJumps;
        }

        // Saltar (doble salto)
        const wantJump =
            Input.Keyboard.JustDown(this.jumpKey) ||
            Input.Keyboard.JustDown(this.cursors.up) ||
            Input.Keyboard.JustDown(this.wKey);

        if (wantJump && this.jumpsLeft > 0) {
            this.setVelocityY(-350);
            this.anims.play('fairy_jump', true);
            this.jumpsLeft--;   // gastamos 1 salto (suelo o aire)

            if (this.jumpSound) {
                this.jumpSound.play();
            }
        }


        // Planeo
        if (
            this.body.velocity.y > 0 &&
            (this.jumpKey.isDown || this.cursors.up.isDown || this.wKey.isDown)
        ) {
            this.body.gravity.y = -300;
        } else {
            this.body.gravity.y = 0;
        }
    }



    // === MOVIMIENTO EN MODO VUELO ===
    handleFlyingMovement() {
        this.body.setAllowGravity(false);
        const speed = 250;

        // Vertical
        if (this.cursors.up.isDown || this.wKey.isDown) {
            this.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
            this.setVelocityY(speed);
        } else {
            this.setVelocityY(0);
        }

        // Horizontal
        this.anims.play('fairy_fly', true);

        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.setVelocityX(-speed);
            this.setFlipX(true);
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.setVelocityX(speed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // Partículas de estela al volar
        this.auraParticles.setFrequency(20);
        this.auraParticles.setQuantity(4);
    }

    setCinematicState() {
        this.currentState = PlayerState.CINEMATIC;
        this.setVelocity(0, 0);
        this.body.setAllowGravity(false);
    }

    // Transformación a Lumina “dorada”
    awakeLumina() {
        const colors = [0x0000ff, 0x00ff00, 0xff0000, 0xffd700];

        // 1. Partículas que convergen hacia la hada
        colors.forEach((color, i) => {
            this.scene.time.addEvent({
                delay: 200 + i * 200,
                repeat: 5,
                callback: () => {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 200;
                    const startX = this.x + Math.cos(angle) * radius;
                    const startY = this.y + Math.sin(angle) * radius;

                    const p = this.scene.add.image(startX, startY, 'firefly')
                        .setScale(0.8)
                        .setTint(color)
                        .setBlendMode('ADD');

                    this.scene.tweens.add({
                        targets: p,
                        x: this.x,
                        y: this.y,
                        scale: 0.2,
                        duration: 800,
                        ease: 'Quad.easeIn',
                        onComplete: () => p.destroy()
                    });
                }
            });
        });

        // 2. Flash de cámara
        this.scene.cameras.main.flash(1000, 255, 255, 255);

        // 3. Cambio de estado visual
        this.isGoldenLumina = true;
        this.setTint(0xffffff);

        // Explosión de halo
        this.scene.tweens.add({
            targets: this.goldenHalo,
            radius: 300,
            intensity: 5,
            duration: 800,
            yoyo: true,
            hold: 500,
            onComplete: () => {
                this.goldenHalo.radius = 120;
                this.goldenHalo.intensity = 2;
            }
        });

        // Energía “infinita”
        this.currentLight = this.maxLight * 10;
        this.heal(9999);
    }

    startFlying() {
        this.currentState = PlayerState.FLYING;
        this.canFly = true;

        this.auraParticles.setFrequency(20);
        this.auraParticles.setQuantity(4);
        this.auraParticles.start();
        // pipeline y depth ya se configuran en el constructor
    }

    // Curación de luz/vida
    heal(amount) {
        this.currentLight = Math.min(this.maxLight, this.currentLight + amount);
        this.light.radius += amount;
        this.light.intensity += 0.2;
        this.scene.tweens.add({
            targets: this.light,
            intensity: 4,
            duration: 100,
            yoyo: true
        });
    }

    // Daño. Devuelve true si “muere”.
    damage(amount) {
        if (
            this.isInvulnerable ||
            this.currentState === PlayerState.FLYING ||
            this.currentState === PlayerState.CINEMATIC
        ) {
            return false;
        }

        this.currentLight = Math.max(0, this.currentLight - amount);
        this.light.radius -= amount;
        this.light.intensity -= 0.5;
        this.anims.play('fairy_hurt', true);

        // Invulnerabilidad temporal
        this.isInvulnerable = true;
        this.setTint(0xff0000);

        this.scene.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            if (this.isGoldenLumina) this.setTint(0xffffff);
            else this.clearTint();
        });

        return this.light.radius <= 0;
    }

    // Reset de estado al empezar un nivel
    initializeLevel(totalStars) {
        this.starsCollected = 0;
        this.totalStars = totalStars;
        this.isGoldenLumina = false;
        this.goldenHalo.radius = 60;
        this.goldenHalo.intensity = 0.8;
        this.currentState = PlayerState.NORMAL;
        this.body.setAllowGravity(true); // ★ por si venía de CINEMATIC/FLYING
    }

    onStarCollected() {
        this.starsCollected++;
        this.updateAura();
    }

    // Aura y halo según progreso de estrellas
    updateAura() {
        const progress = this.totalStars > 0 ? this.starsCollected / this.totalStars : 0;
        if (progress === 0) return;

        if (!this.auraParticles.emitting) this.auraParticles.start();

        const frequency = Math.max(50, 200 - (progress * 150));
        const quantity = Math.floor(1 + (progress * 4));

        this.auraParticles.setFrequency(frequency);
        this.auraParticles.setQuantity(quantity);
        this.goldenHalo.setIntensity(progress * 3);
        this.goldenHalo.setRadius(60 + (progress * 140));
    }
}
