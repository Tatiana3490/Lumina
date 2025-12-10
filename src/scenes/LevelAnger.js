import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { EnemyProjectile } from '../objects/EnemyProjectile';
import { HUD } from '../objects/HUD';
import { LevelEnvironment } from '../utils/LevelEnvironment';

// Escena del nivel 3 (Ira / Anger)
export class LevelAnger extends Scene {
    constructor() {
        super('LevelAnger');
    }

    create() {
        // ================== LUCES Y ENTORNO ==================
        // Luz ambiental tirando a rojo para dar sensación de ira
        this.lights.enable().setAmbientColor(0x220000);

        // Niebla / partículas propias del nivel de ira
        new LevelEnvironment(this, 'anger');

        // Fondo principal del nivel
        const bg = this.add.image(0, 0, 'bg_anger').setOrigin(0, 0);
        bg.displayWidth = 5000;
        bg.displayHeight = 2000;
        bg.setScrollFactor(0.2);
        bg.setAlpha(0.6);
        bg.setDepth(-1);

        // Título del nivel (UI fija)
        this.add.text(100, 50, 'Level 3: The Crimson Rush', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 6,
            fontStyle: 'bold'
        })
            .setScrollFactor(0)
            .setDepth(9000);

        // ================== GRUPOS FÍSICOS ==================
        this.platforms = this.physics.add.staticGroup();
        this.fragments = this.physics.add.staticGroup();

        // Sombras que pueden moverse pero no tienen gravedad
        this.shadows = this.physics.add.group({ allowGravity: false, immovable: true });

        // Enemigos voladores (cuervos)
        this.flyingEnemies = this.physics.add.group({ allowGravity: false, immovable: true });

        // Proyectiles enemigos
        this.projectiles = this.physics.add.group({
            classType: EnemyProjectile,
            runChildUpdate: true
        });

        // SUELO INVISIBLE de seguridad (por si se cuela el jugador entre plataformas)
        this.ground = this.physics.add.staticImage(2500, 1130, 'platform');
        this.ground.setDisplaySize(5000, 40);
        this.ground.refreshBody();
        this.ground.setVisible(false);

        // ================== DISEÑO DEL NIVEL (SCROLL HORIZONTAL) ==================
        for (let x = 0; x < 5000; x += 400) {
            // Plataforma inferior “suelo” a lo largo de todo el nivel
            this.createPlatform(x, 1100, 8);

            // Plataformas medias con sombras que suben y bajan
            if (x % 800 === 0) {
                this.createPlatform(x + 200, 800, 4);
                this.createMovingShadow(x + 250, 770, 100, 1200);
            }

            // Plataformas altas con fragmentos (genero algunos extra)
            if (x % 1200 === 0 && x > 1000) {
                this.createPlatform(x + 100, 600, 3);
                this.createFragment(x + 150, 550);
            }
        }

        // Sombras extra a nivel de suelo
        this.createMovingShadow(1500, 1070, 150, 1000);
        this.createMovingShadow(2500, 1070, 200, 800);
        this.createMovingShadow(3500, 1070, 150, 1000);

        // Enemigos voladores horizontales repartidos por el nivel
        this.createFlyingEnemy(800, 400, 200, 1500);
        this.createFlyingEnemy(1600, 600, 250, 1800);
        this.createFlyingEnemy(2400, 500, 200, 1600);
        this.createFlyingEnemy(3200, 700, 300, 2000);
        this.createFlyingEnemy(4000, 450, 200, 1400);

        // Fragmentos extra colocados a mano (hasta tener 8 en total)
        this.createFragment(1500, 500);
        this.createFragment(2000, 700);
        this.createFragment(3000, 600);
        this.createFragment(4000, 800);

        // ================== PORTAL FINAL ==================
        this.goal = this.physics.add.image(4700, 1000, 'portal');
        this.goal.setPipeline('Light2D');
        this.goal.setTint(0xff0000);
        this.goal.body.allowGravity = false;
        this.goal.body.immovable = true;

        // Partículas que rodean al portal
        const portalParticles = this.add.particles(0, 0, 'firefly', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: -100,
            quantity: 2,
            emitting: true,
            tint: 0xffaa00
        });
        portalParticles.startFollow(this.goal);

        // ================== JUGADOR ==================
        // En este nivel empezamos con 8 “estrellas” de luz
        this.player = new Player(this, 200, 1000, 8);

        // ================== COLISIONES ==================
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.ground); // suelo invisible de emergencia

        // Recogida de fragmentos
        this.physics.add.overlap(this.player, this.fragments, this.collectFragment, null, this);

        // Daño por sombras en el suelo y cuervos verticales
        this.physics.add.overlap(this.player, this.shadows, this.hitShadow, null, this);

        // Daño por cuervos voladores
        this.physics.add.overlap(this.player, this.flyingEnemies, this.hitShadow, null, this);

        // Llegar al portal
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Proyectiles chocan contra plataformas
        this.physics.add.collider(
            this.projectiles,
            this.platforms,
            (projectile, platform) => {
                // Normalmente 'projectile' será EnemyProjectile
                if (projectile && typeof projectile.destroyProjectile === 'function') {
                    projectile.destroyProjectile();
                } else if (projectile && projectile.destroy) {
                    // Fallback por si por lo que sea no es EnemyProjectile
                    projectile.destroy();
                }
            }
        );

        // Proyectiles chocan contra el suelo invisible
        this.physics.add.collider(
            this.projectiles,
            this.ground,
            (projectile, ground) => {
                // Me aseguro de no romper si el proyectil no tiene destroyProjectile
                if (projectile && typeof projectile.destroyProjectile === 'function') {
                    projectile.destroyProjectile();
                } else if (projectile && projectile.destroy) {
                    projectile.destroy();
                }
            }
        );

        // Proyectiles impactan al jugador
        this.physics.add.overlap(this.player, this.projectiles, this.hitProjectile, null, this);

        // ================== MUNDO Y CÁMARA ==================
        this.cameras.main.setBounds(0, 0, 5000, 2000);
        this.physics.world.setBounds(0, 0, 5000, 2000);

        // Nota: aquí no usamos startFollow, la cámara se mueve a mano en update()

        // ================== HUD ==================
        this.hud = new HUD(this, 8);
        this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

        // ================== EFECTOS CLIMÁTICOS (LLUVIA Y RAYOS) ==================
        // Lluvia en primer plano
        const rain = this.add.particles(0, 0, 'firefly', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: -50, max: 0 },
            speedY: { min: 400, max: 600 },
            speedX: { min: -30, max: 30 },
            scale: { start: 0.08, end: 0.05 },
            alpha: { start: 0.6, end: 0.3 },
            lifespan: 3000,
            frequency: 15,
            tint: 0xaaaaff,
            blendMode: 'NORMAL'
        });
        rain.setScrollFactor(0);
        rain.setDepth(8000);

        // Timer aleatorio de rayos (destellos blancos)
        this.lightningTimer = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: () => {
                const cam = this.cameras.main;
                const flash = this.add.rectangle(
                    cam.width / 2,
                    cam.height / 2,
                    cam.width,
                    cam.height,
                    0xffffff,
                    0.7
                );
                flash.setScrollFactor(0).setDepth(9999);

                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 150,
                    ease: 'Cubic.easeOut',
                    onComplete: () => flash.destroy()
                });

                // Recalculo el siguiente rayo
                this.lightningTimer.delay = Phaser.Math.Between(3000, 6000);
            },
            loop: true
        });

        // ================== SOMBRAS Y ENEMIGOS VISIBLES ==================
        // Destaco las sombras con luz y un pequeño “bombeo”
        this.shadows.children.iterate((shadow) => {
            if (!shadow) return;
            shadow.setTint(0xff0000);
            this.lights.addLight(shadow.x, shadow.y, 120, 0xff0000, 1.5);
            this.tweens.add({
                targets: shadow,
                scale: 1.2,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        });

        // Enemigos voladores también con luz roja
        this.flyingEnemies.children.iterate((bird) => {
            if (!bird) return;
            bird.setTint(0xff0000);
            this.lights.addLight(bird.x, bird.y, 100, 0xff0000, 1.5);
        });

        // ================== DISPAROS ENEMIGOS ==================
        // Timer algo más agresivo que en otros niveles
        this.time.addEvent({
            delay: 1500,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // ================== INTRO POÉTICA ==================
        this.showIntro('La ira es un fuego que quema, pero también ilumina.');

        // ================== PAUSA ==================
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { activeScene: 'LevelAnger' });
        });
    }

    // ================== DISPAROS ENEMIGOS ==================

    enemyShoot() {
        // Mientras está la intro no disparamos
        if (this.isIntro) return;

        // Sombras estáticas / verticales
        this.shadows.children.iterate((shadow) => this.tryShoot(shadow));
        // Enemigos voladores
        this.flyingEnemies.children.iterate((enemy) => this.tryShoot(enemy));
    }

    // Lógica compartida para todos los enemigos que pueden disparar
    tryShoot(enemy) {
        if (!enemy || !enemy.active) return;

        const distance = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        // Solo dispara si el jugador está relativamente cerca
        if (distance < 800) {
            const projectile = this.projectiles.get(enemy.x, enemy.y, 'stone');
            if (projectile) {
                const isFlying = this.flyingEnemies.contains(enemy);

                // Si viene de un cuervo volador, lo tiño un poco para distinguirlo
                if (isFlying) {
                    projectile.setTint(0xff8888);
                }

                projectile.fire(enemy.x, enemy.y, this.player.x, this.player.y);
            }
        }
    }

    // Golpe por proyectil enemigo
    hitProjectile(player, projectile) {
        projectile.destroyProjectile();

        const isDead = player.damage(20);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        // Pequeña sacudida para feedback del impacto
        this.cameras.main.shake(100, 0.005);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => this.scene.restart());
        }
    }

    // ================== UPDATE (SCROLL FORZADO) ==================

    update() {
        if (this.isIntro) return;

        // Scroll automático horizontal del nivel
        const scrollSpeed = 0.8;
        this.cameras.main.scrollX += scrollSpeed;

        // Seguimiento vertical suave hacia la posición del jugador
        const targetY = this.player.y - this.cameras.main.height / 2;
        this.cameras.main.scrollY += (targetY - this.cameras.main.scrollY) * 0.1;
        this.cameras.main.scrollY = Phaser.Math.Clamp(
            this.cameras.main.scrollY,
            0,
            2000 - this.cameras.main.height
        );

        // Si la cámara “alcanza” al jugador por la izquierda, daño por presión
        if (this.player.x < this.cameras.main.scrollX + 50) {
            this.player.x = this.cameras.main.scrollX + 50;
            const isDead = this.player.damage(60);
            this.cameras.main.shake(100, 0.01);
            this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

            if (isDead) {
                this.cameras.main.shake(500, 0.02);
                this.time.delayedCall(500, () => this.scene.restart());
            }
        }
    }

    // ================== CONSTRUCCIÓN ELEMENTOS ==================

    // Plataformas usando platform.png, igual que en el nivel 1 pero con tinte rojizo
    createPlatform(x, y, widthScale) {
        const BLOCK_W = 64;
        const BLOCK_H = 24;

        const p = this.platforms.create(x, y, 'platform');
        p.setDisplaySize(BLOCK_W * widthScale, BLOCK_H);
        p.refreshBody();
        p.setPipeline('Light2D');
        p.setTint(0x884444);
    }

    // Fragmentos de luz anaranjados, con animaciones y partículas
    createFragment(x, y) {
        const f = this.fragments.create(x, y, 'fragment');
        f.setPipeline('Light2D');
        f.setScale(1.3);

        this.lights.addLight(x, y, 150, 0xffaa00, 2.5);

        const particles = this.add.particles(x, y, 'firefly', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            frequency: 100,
            tint: 0xffaa00
        });
        particles.setDepth(f.depth - 1);

        // Flotando un poco hacia arriba y abajo
        this.tweens.add({
            targets: f,
            y: y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Parpadeo de alpha
        this.tweens.add({
            targets: f,
            alpha: { from: 1, to: 0.6 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Pequeño pulso de escala
        this.tweens.add({
            targets: f,
            scale: { from: 1.3, to: 1.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ================== CUERVOS VERTICALES (SUBEN Y BAJAN) ==================
    createMovingShadow(x, y, distance, duration) {
        // Cuervo que se mueve en vertical
        const raven = this.shadows.create(x, y, 'raven_fly_0');
        console.log('RAVEN VERTICAL', x, y);

        // Más pequeño para que encaje mejor con el nivel
        raven.setScale(0.05);

        raven.setPipeline('Light2D');
        raven.setDepth(20);

        // Ajusto el hitbox para que no sea tan grande como el sprite
        raven.body.setSize(
            raven.width * 0.5,
            raven.height * 0.5,
            true
        );

        // Movimiento vertical
        this.tweens.add({
            targets: raven,
            y: y + distance,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ================== CUERVOS HORIZONTALES (VUELAN IZQ ↔ DCHA) ==================
    createFlyingEnemy(x, y, amplitude, duration) {
        const bird = this.flyingEnemies.create(x, y, 'raven_fly_0');
        console.log('RAVEN HORIZONTAL', x, y);

        // Mismo tamaño que los cuervos verticales
        bird.setScale(0.10);

        bird.setPipeline('Light2D');
        bird.setDepth(20);
        bird.body.allowGravity = false;
        bird.body.immovable = true;

        // Ajusto hitbox un poco más pequeño
        bird.body.setSize(
            bird.width * 0.6,
            bird.height * 0.6,
            true
        );

        if (bird.anims) {
            bird.anims.play('raven_fly', true);
        }

        // Movimiento izquierda–derecha
        this.tweens.add({
            targets: bird,
            x: x + amplitude,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ================== COLISIONES Y META ==================

    collectFragment(player, fragment) {
        fragment.disableBody(true, true);
        // Sonido de recoger fragmento
        this.sound.play('sfx_collect', { volume: 0.8 });

        player.heal(60);
        player.onStarCollected();

        const totalStars = 8;
        const remaining = this.fragments.countActive(true);
        const collected = totalStars - remaining;

        this.hud.updateStars(collected, totalStars);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        if (remaining === 0) {
            console.log('All Level 3 stars collected!');
        }
    }

    // Daño por colisión directa con sombra / cuervo
    hitShadow(player, shadow) {
        const isDead = player.damage(60);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => this.scene.restart());
        } else {
            // Knockback: empujo al jugador lejos de la sombra
            player.setVelocityX(player.x < shadow.x ? -300 : 300);
            player.setVelocityY(-300);
        }
    }

    // Cuando el jugador llega al portal del final
    reachGoal(player, goal) {
        // Si faltan fragmentos, no dejo terminar el nivel
        if (this.fragments.countActive(true) > 0) {
            const remaining = this.fragments.countActive(true);
            const msg = this.add.text(
                player.x,
                player.y - 50,
                `Collect ${remaining} more lights!`,
                {
                    fontSize: '20px',
                    fill: '#ff8888',
                    stroke: '#000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            this.tweens.add({
                targets: msg,
                y: player.y - 80,
                alpha: 0,
                duration: 1500,
                onComplete: () => msg.destroy()
            });
            return;
        }

        // Si ya tiene todas, escena de nivel completado
        this.physics.pause();
        this.add.text(player.x, player.y - 100, 'Level Complete!', {
            fontSize: '48px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: player,
            angle: 360,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.scene.start('LevelHope');
                });
            }
        });
    }

    // ================== INTRO ==================

    showIntro(quote) {
        this.isIntro = true;
        this.hud.setVisible(false);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Capa negra encima de todo
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000)
            .setScrollFactor(0)
            .setDepth(10000);

        // Luciérnaga central
        const firefly = this.add.circle(width / 2, height / 2, 5, 0xffffaa, 1)
            .setScrollFactor(0)
            .setDepth(10002);

        // Brillo alrededor de la luciérnaga
        const glow = this.add.circle(width / 2, height / 2, 20, 0xffffaa, 0.3)
            .setScrollFactor(0)
            .setDepth(10002);

        // Animación de respiración de la luz
        this.tweens.add({
            targets: [firefly, glow],
            scale: { from: 1, to: 1.5 },
            alpha: { from: 1, to: 0.5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Movimiento suave de la luciérnaga
        this.tweens.add({
            targets: [firefly, glow],
            x: '+=30',
            y: '-=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Frase poética del nivel
        const text = this.add.text(width / 2, height / 2 + 50, quote, {
            fontFamily: 'Cinzel',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        })
            .setOrigin(0.5)
            .setAlpha(0)
            .setScrollFactor(0)
            .setDepth(10001);

        // Hago aparecer el texto y luego lo desvanezco junto con la capa
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: [text, overlay, firefly, glow],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            this.isIntro = false;
                            this.hud.setVisible(true);
                            overlay.destroy();
                            text.destroy();
                            firefly.destroy();
                            glow.destroy();
                        }
                    });
                });
            }
        });
    }
}
