import { Physics } from 'phaser';

export class EnemyProjectile extends Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // Añadir al sistema de juego y de físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Que le afecten las luces 2D
        this.setPipeline('Light2D');

        // Tamaño visual y cuerpo de colisión circular
        this.setScale(1);
        this.setCircle(10, 6, 6);   // radio 10, pequeño offset para centrar

        // Físicas: un proyectil no debería tener gravedad ni límites de mundo
        this.body.allowGravity = false;
        this.setCollideWorldBounds(false);

        // Configuración base
        this.baseSpeed = 250;       // velocidad del proyectil
        this.damageAmount = 20;     // daño por impacto

        // Vida del proyectil (en ms)
        this.baseLifespan = 3000;   // 3 segundos
        this.lifespan = this.baseLifespan;

        // Referencia a la luz asociada (se creará en fire)
        this.light = null;
    }

    /**
     * Dispara el proyectil desde (x, y) hacia (targetX, targetY)
     */
    fire(x, y, targetX, targetY) {
        // Colocamos y reactivamos el proyectil
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        // Reiniciar vida cada vez que se reutiliza
        this.lifespan = this.baseLifespan;

        // Calcular ángulo hacia el objetivo con trigonometría básica
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);

        // Asignar velocidad en dirección al objetivo
        this.setVelocity(
            Math.cos(angle) * this.baseSpeed,
            Math.sin(angle) * this.baseSpeed
        );

        // Darle un giro aleatorio (spin)
        const spin = 100 + Math.random() * 200; // 100–300
        this.setAngularVelocity(spin);

        // Crear (o reusar) la luz asociada al proyectil
        if (!this.light) {
            this.light = this.scene.lights.addLight(this.x, this.y, 50, 0xffaa00, 1);
        } else {
            this.light.x = this.x;
            this.light.y = this.y;
            this.light.color = 0xffaa00;
            this.light.intensity = 1;
        }

        // Reproducir animación si existe
        if (this.anims && this.scene.anims && this.scene.anims.exists('projectile_water')) {
            this.anims.play('projectile_water', true);
        }
    }

    /**
     * Se ejecuta automáticamente cuando el grupo tiene `runChildUpdate: true`.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Si el proyectil ya no está activo, no hacemos nada
        if (!this.active) return;

        // Reducir vida según el tiempo transcurrido
        this.lifespan -= delta;

        // Sincronizar la posición de la luz con el proyectil
        if (this.light) {
            this.light.x = this.x;
            this.light.y = this.y;
        }

        // Cuando se acaba la vida, se destruye el proyectil
        if (this.lifespan <= 0) {
            this.destroyProjectile();
        }
    }

    /**
     * Limpia luz, genera un pequeño efecto de humo y destruye el proyectil.
     * Úsalo SIEMPRE que "muere": colisión con pared, suelo, etc.
     */
    destroyProjectile() {
        // Eliminar luz asociada del sistema de luces
        if (this.light) {
            this.scene.lights.removeLight(this.light);
            this.light = null;
        }

        // Pequeño efecto de "puff" al desaparecer
        if (this.active) {
            const puff = this.scene.add.particles(this.x, this.y, 'firefly', {
                speed: 50,
                scale: { start: 0.2, end: 0 },
                lifespan: 300,
                quantity: 5,
                tint: 0x888888,
                blendMode: 'ADD'
            }).setDepth(this.depth + 1);

            // Limpiar las partículas tras un pequeño tiempo
            this.scene.time.delayedCall(400, () => puff.destroy());
        }

        // Desactivar físicamente el proyectil
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        // Si prefirieras reciclar, podrías omitir destroy()
        this.destroy();
    }
}
