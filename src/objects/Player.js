import { Physics, Input } from 'phaser';

// Estados posibles del jugador (para controlar la lógica según la fase del juego)
export const PlayerState = {
    NORMAL: 'NORMAL',       // estado normal: caminar, saltar, planear
    CINEMATIC: 'CINEMATIC', // estado cinemático: sin control de movimiento
    FLYING: 'FLYING'        // estado de vuelo libre (nivel final)
};

export class Player extends Physics.Arcade.Sprite {
    constructor(scene, x, y, totalStars = 0) {
        // Uso uno de los sprites de idle como textura base
        super(scene, x, y, 'fairy_idle_0');

        // =========================
        // REGISTRO EN LA ESCENA Y FÍSICAS
        // =========================
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // El hada no puede salir del mundo
        this.setCollideWorldBounds(true);

        // Un poco de fricción horizontal para que frene rápido al soltar
        this.setDragX(600);

        // =========================
        // CUERPO DE COLISIÓN
        // =========================
        // El sprite original es muy grande (476x442),
        // así que ajusto el cuerpo para que sea más pequeño
        // y centrado en la parte baja (zona "pies").
        this.setBodySize(150, 260);
        this.setOffset(163, 182);

        // Escala visual del sprite (no afecta al body de Arcade)
        this.baseScale = 0.15;
        this.setScale(this.baseScale);

        // Que el jugador se vea afectado por las luces 2D
        // y se pinte por encima de plataformas y otros elementos
        this.setPipeline('Light2D');
        this.setDepth(50);

        // =========================
        // MÁQUINA DE ESTADOS DEL JUGADOR
        // =========================
        this.currentState = PlayerState.NORMAL;
        this.canFly = false;           // por defecto no puede volar
        this.isInvulnerable = false;   // flag de invulnerabilidad temporal

        // =========================
        // SISTEMA DE LUZ / VIDA
        // =========================
        this.maxLight = 180;           // "vida" máxima en forma de luz
        this.currentLight = 180;       // empieza con la luz llena
        this.hits = 0;
        this.maxHits = 3;

        // Luz principal que rodea al hada (su energía)
        this.light = scene.lights.addLight(x, y, 180, 0xffdd00, 1.5);

        // Luz secundaria dorada que uso para el modo "evolucionada"
        this.goldenHalo = scene.lights.addLight(x, y, 60, 0xffd700, 0);

        // =========================
        // INPUT (TECLAS)
        // =========================
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.jumpKey = scene.input.keyboard.addKey('SPACE');
        this.wKey = scene.input.keyboard.addKey('W');
        this.aKey = scene.input.keyboard.addKey('A');
        this.sKey = scene.input.keyboard.addKey('S');
        this.dKey = scene.input.keyboard.addKey('D');

        // Sonido de salto
        this.jumpSound = scene.sound.add('sfx_jump', { volume: 0.6 });

        // =========================
        // ESTRELLAS / PROGRESO
        // =========================
        this.starsCollected = 0;       // cuántas estrellas ha recogido en este nivel
        this.totalStars = totalStars;  // estrellas totales del nivel
        this.isGoldenLumina = false;   // si ya está en modo "Lumina dorada"

        // =========================
        // PARTÍCULAS DE AURA
        // =========================
        // Partículas que rodean al hada (las activo según progreso)
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
        this.auraParticles.stop(); // Inicio con el aura desactivada

        // =========================
        // SALTOS (DOBLE SALTO)
        // =========================
        this.maxJumps = 2;   // 1 salto desde suelo + 1 salto extra en el aire
        this.jumpsLeft = 2;  // contador de saltos disponibles
    }

    // =========================
    // GETTERS / UTILIDADES
    // =========================

    // Porcentaje de energía (0..1) para usarlo en efectos visuales o HUD
    getEnergyPercentage() {
        return this.currentLight / this.maxLight;
    }

    // =========================
    // CICLO DE VIDA (preUpdate)
    // =========================

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Sincronizo las luces con la posición actual del hada
        this.light.x = this.x;
        this.light.y = this.y;
        this.goldenHalo.x = this.x;
        this.goldenHalo.y = this.y;

        // Actualizo el aspecto de la luz según la energía
        this.updateLightVisuals(time);

        // Lógica según el estado actual del jugador
        if (this.currentState === PlayerState.NORMAL) {
            this.handleNormalMovement();
        } else if (this.currentState === PlayerState.FLYING) {
            this.handleFlyingMovement();
        } else if (this.currentState === PlayerState.CINEMATIC) {
            // En modo cinemático, congelo al personaje (sin movimiento ni gravedad)
            this.setVelocity(0, 0);
            this.body.allowGravity = false;
        }
    }

    // Ajusta radio e intensidad de la luz en función de la energía
    updateLightVisuals(time) {
        const energyPct = this.getEnergyPercentage();

        // Radio base en función de la energía (entre 50 y 180 aprox.)
        let targetRadius = 50 + (130 * energyPct);
        let targetIntensity = 1.5;

        // Si la energía es baja, hago que la luz parpadee un poco
        if (energyPct < 0.25) {
            targetIntensity = 1.0 + (Math.random() * 0.5);
            targetRadius += Math.sin(time * 0.02) * 10;
        }

        // Interpolación suave para no cambiar el radio de golpe
        this.light.radius += (targetRadius - this.light.radius) * 0.1;
        this.light.intensity += (targetIntensity - this.light.intensity) * 0.1;
    }

    // =========================
    // MOVIMIENTO NORMAL (SUELO + DOBLE SALTO + PLANE0)
    // =========================

    handleNormalMovement() {
        const body = this.body;

        // onFloor() comprueba si toca el suelo; añado blocked/touching por seguridad
        const onGround =
            body.onFloor() ||
            body.blocked.down ||
            body.touching.down;

        // --------- Movimiento horizontal ---------
        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(true);
            if (onGround) this.anims.play('fairy_walk', true);
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.setVelocityX(200);
            this.setFlipX(false);
            if (onGround) this.anims.play('fairy_walk', true);
        } else {
            // Si no toco nada, dejo de acelerar en X
            this.setAccelerationX(0);
            if (onGround) this.anims.play('fairy_idle', true);
        }

        // --------- Reset de saltos ---------
        if (onGround) {
            // Si toca el suelo, recupera todos los saltos
            this.jumpsLeft = this.maxJumps;
        }

        // --------- Saltar (doble salto) ---------
        const wantJump =
            Input.Keyboard.JustDown(this.jumpKey) ||
            Input.Keyboard.JustDown(this.cursors.up) ||
            Input.Keyboard.JustDown(this.wKey);

        if (wantJump && this.jumpsLeft > 0) {
            // Salto hacia arriba
            this.setVelocityY(-350);
            this.anims.play('fairy_jump', true);
            this.jumpsLeft--;   // gasto un salto (ya sea el primero o el doble)

            if (this.jumpSound) {
                this.jumpSound.play();
            }
        }

        // --------- Planeo ---------
        // Si voy cayendo y mantengo la tecla de salto, reduzco la gravedad
        if (
            this.body.velocity.y > 0 &&
            (this.jumpKey.isDown || this.cursors.up.isDown || this.wKey.isDown)
        ) {
            this.body.gravity.y = -300;
        } else {
            // Vuelvo a la gravedad normal (en este caso la estoy gestionando a mano)
            this.body.gravity.y = 0;
        }
    }

    // =========================
    // MOVIMIENTO EN MODO VUELO
    // =========================

    handleFlyingMovement() {
        // En este modo no quiero que la gravedad le afecte
        this.body.setAllowGravity(false);
        const speed = 250;

        // Movimiento vertical
        if (this.cursors.up.isDown || this.wKey.isDown) {
            this.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
            this.setVelocityY(speed);
        } else {
            this.setVelocityY(0);
        }

        // Animación de vuelo
        this.anims.play('fairy_fly', true);

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.setVelocityX(-speed);
            this.setFlipX(true);
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.setVelocityX(speed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // Cuando está volando, activo una estela de partículas más intensa
        this.auraParticles.setFrequency(20);
        this.auraParticles.setQuantity(4);
    }

    // =========================
    // CAMBIO DE ESTADOS
    // =========================

    // Lo uso en escenas cinemáticas para congelar al personaje
    setCinematicState() {
        this.currentState = PlayerState.CINEMATIC;
        this.setVelocity(0, 0);
        this.body.setAllowGravity(false);
    }

    // Transformación a Lumina “dorada” (fase final del juego)
    awakeLumina() {
        const colors = [0x0000ff, 0x00ff00, 0xff0000, 0xffd700];

        // 1) Partículas que vienen desde fuera hacia el hada
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

        // 2) Flash de cámara para enfatizar la transformación
        this.scene.cameras.main.flash(1000, 255, 255, 255);

        // 3) Cambio de estado visual y de energía
        this.isGoldenLumina = true;
        this.setTint(0xffffff);

        // Expansión del halo dorado
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

        // Le doy energía "a tope" (prácticamente infinita para esta fase)
        this.currentLight = this.maxLight * 10;
        this.heal(9999);
    }

    // Comienza el modo vuelo libre
    startFlying() {
        this.currentState = PlayerState.FLYING;
        this.canFly = true;

        // Activo aura más intensa
        this.auraParticles.setFrequency(20);
        this.auraParticles.setQuantity(4);
        this.auraParticles.start();
        // pipeline y depth ya se configuraron en el constructor
    }

    // =========================
    // VIDA / DAÑO / CURACIÓN
    // =========================

    // Curación de luz/vida
    heal(amount) {
        // Aumento la energía sin pasarme del máximo
        this.currentLight = Math.min(this.maxLight, this.currentLight + amount);

        // Hago que la luz crezca un poco al curarse
        this.light.radius += amount;
        this.light.intensity += 0.2;

        // Pequeño "flash" rápido para indicar curación
        this.scene.tweens.add({
            targets: this.light,
            intensity: 4,
            duration: 100,
            yoyo: true
        });
    }

    // Aplica daño. Devuelve true si "muere" (se queda sin luz).
    damage(amount) {
        // Si es invulnerable o está en modo vuelo/cinemática, ignoro el daño
        if (
            this.isInvulnerable ||
            this.currentState === PlayerState.FLYING ||
            this.currentState === PlayerState.CINEMATIC
        ) {
            return false;
        }

        // Bajo la luz actual
        this.currentLight = Math.max(0, this.currentLight - amount);
        this.light.radius -= amount;
        this.light.intensity -= 0.5;

        // Animación de daño
        this.anims.play('fairy_hurt', true);

        // Invulnerabilidad temporal tras recibir golpe
        this.isInvulnerable = true;
        this.setTint(0xff0000);

        this.scene.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            if (this.isGoldenLumina) {
                this.setTint(0xffffff);
            } else {
                this.clearTint();
            }
        });

        // Si el radio de la luz llega a 0 o menos, consideramos que "muere"
        return this.light.radius <= 0;
    }

    // =========================
    // RESET AL EMPEZAR UN NIVEL
    // =========================

    initializeLevel(totalStars) {
        // Datos de progreso de estrellas
        this.starsCollected = 0;
        this.totalStars = totalStars;
        this.isGoldenLumina = false;

        // Reset del halo dorado
        this.goldenHalo.radius = 60;
        this.goldenHalo.intensity = 0.8;

        // Vuelve al estado normal y con gravedad activada
        this.currentState = PlayerState.NORMAL;
        this.body.setAllowGravity(true); // por si venía de CINEMATIC o FLYING
    }

    // =========================
    // ESTRELLAS / AURA
    // =========================

    // Llamo a esto cada vez que recojo una estrella
    onStarCollected() {
        this.starsCollected++;
        this.updateAura();
    }

    // Actualiza la intensidad del aura y del halo según el progreso de estrellas
    updateAura() {
        const progress =
            this.totalStars > 0
                ? this.starsCollected / this.totalStars
                : 0;

        // Si no hay progreso (0 estrellas), no hago nada
        if (progress === 0) return;

        // Si aún no estaba emitiendo partículas, las activo
        if (!this.auraParticles.emitting) {
            this.auraParticles.start();
        }

        // Cuanto más progreso, más partículas y más frecuentemente
        const frequency = Math.max(50, 200 - (progress * 150));
        const quantity = Math.floor(1 + (progress * 4));

        this.auraParticles.setFrequency(frequency);
        this.auraParticles.setQuantity(quantity);

        // El halo dorado crece y brilla más según el progreso
        this.goldenHalo.setIntensity(progress * 3);
        this.goldenHalo.setRadius(60 + (progress * 140));
    }
}
