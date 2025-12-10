import { Physics } from 'phaser';

export class EnemyProjectile extends Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // Lo registramos en la escena y en el sistema de físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Que reciba luces 2D
        this.setPipeline('Light2D');

        // Escala visual y hitbox circular
        this.setScale(1);
        // radio = 10, offset (6,6) para centrar bien el círculo
        this.setCircle(10, 6, 6);

        // Un proyectil no tiene gravedad ni colisión con límites de mundo
        this.body.allowGravity = false;
        this.setCollideWorldBounds(false);

        // Configuración base
        this.baseSpeed = 250;   // velocidad lineal del proyectil
        this.damageAmount = 20; // daño potencial (si lo quieres usar)

        // Vida (en ms)
        this.baseLifespan = 3000;
        this.lifespan = this.baseLifespan;

        // Luz asociada (se crea en fire)
        this.light = null;
    }

    /**
     * Dispara el proyectil desde (x, y) hacia (targetX, targetY)
     */
    fire(x, y, targetX, targetY) {
        // Recolocamos y reactivamos
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        // Reiniciamos vida
        this.lifespan = this.baseLifespan;

        // Vector hacia el objetivo
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);

        // Velocidad en esa dirección
        this.setVelocity(
            Math.cos(angle) * this.baseSpeed,
            Math.sin(angle) * this.baseSpeed
        );

        // Rotación continua (spin) para que se vea vivo
        const spin = 100 + Math.random() * 200; // 100–300
        this.setAngularVelocity(spin);

        // Luz asociada al proyectil
        if (!this.light) {
            this.light = this.scene.lights.addLight(this.x, this.y, 50, 0xffaa00, 1);
        } else {
            this.light.x = this.x;
            this.light.y = this.y;
            this.light.color = 0xffaa00;
            this.light.intensity = 1;
        }

        // Si existe la animación, la reproducimos
        if (this.anims && this.scene.anims && this.scene.anims.exists('projectile_water')) {
            this.anims.play('projectile_water', true);
        }
    }

    /**
     * Se ejecuta automáticamente si el grupo tiene `runChildUpdate: true`.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.active) return;

        // Reducimos vida
        this.lifespan -= delta;

        // Sincronizamos la luz con la posición del proyectil
        if (this.light) {
            this.light.x = this.x;
            this.light.y = this.y;
        }

        // Si se acaba el tiempo de vida, lo destruimos
        if (this.lifespan <= 0) {
            this.destroyProjectile();
        }
    }

    /**
     * Limpia la luz, hace un pequeño "puff" y destruye el proyectil.
     * Úsalo SIEMPRE que el proyectil muera (colisión, tiempo, etc.)
     */
    destroyProjectile() {
        // Quitar la luz
        if (this.light) {
            this.scene.lights.removeLight(this.light);
            this.light = null;
        }

        // Efecto de desaparición
        if (this.active) {
            const puff = this.scene.add.particles(this.x, this.y, 'firefly', {
                speed: 50,
                scale: { start: 0.2, end: 0 },
                lifespan: 300,
                quantity: 5,
                tint: 0x888888,
                blendMode: 'ADD'
            }).setDepth(this.depth + 1);

            this.scene.time.delayedCall(400, () => puff.destroy());
        }

        // Desactivar físicamente el proyectil…
        this.setActive(false);
        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
        }

        // …y destruir el objeto (no lo reutilizamos)
        this.destroy();
    }
}
