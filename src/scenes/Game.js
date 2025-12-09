import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { EnemyProjectile } from '../objects/EnemyProjectile';
import { HUD } from '../objects/HUD';
import { LevelEnvironment } from '../utils/LevelEnvironment';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.sound.stopAll();

        // Música de fondo del nivel 1
        this.bgMusic = this.sound.add('music_level1', {
            volume: 0.5,
            loop: true
        });
        this.bgMusic.play();

        // EFECTOS DE SONIDO DEL NIVEL
        this.sfxCollect = this.sound.add('sfx_collect', {
            volume: 0.9
        });
        // (opcional, por si luego quieres usarlo en salto)
        this.sfxJump = this.sound.add('sfx_jump', {
            volume: 0.8
        });

        // === LUCES GLOBALES ===
        this.lights.enable().setAmbientColor(0x111111);

        // === ENTORNO (PARALLAX + PARTÍCULAS) TRISTEZA ===
        new LevelEnvironment(this, 'sadness');

        // Fondo del bosque
        const bg = this.add.image(0, 0, 'bg_sad').setOrigin(0, 0);
        bg.displayWidth = 3000;
        bg.displayHeight = 2000;
        bg.setScrollFactor(0.2);
        bg.setAlpha(0.6);
        bg.setDepth(-1);

        // Texto de nivel (UI fija)
        this.add.text(100, 50, 'Level 1: The Weeping Depths', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(9000);

        // === GRUPOS DE FÍSICAS ===
        this.platforms = this.physics.add.staticGroup();
        this.fragments = this.physics.add.staticGroup();
        this.shadows = this.physics.add.staticGroup();
        this.projectiles = this.physics.add.group({
            classType: EnemyProjectile,
            runChildUpdate: true
        });

        // === DISEÑO DEL NIVEL (PLATAFORMAS) ===
        this.createPlatform(200, 1000, 10);
        this.createPlatform(450, 900, 3);
        this.createPlatform(700, 800, 3);
        this.createPlatform(950, 700, 3);

        this.createPlatform(1200, 600, 4);
        this.createShadow(1200, 570);
        this.createPlatform(1000, 500, 3);
        this.createPlatform(800, 400, 3);

        this.createPlatform(1100, 350, 2);
        this.createPlatform(1350, 320, 3);
        this.createPlatform(1600, 300, 3);

        this.createPlatform(1900, 380, 6);
        this.createShadow(1800, 350);
        this.createShadow(2000, 350);

        this.createPlatform(2200, 320, 3);
        this.createPlatform(2450, 260, 3);

        // === FRAGMENTOS (5 EN TOTAL) ===
        this.createFragment(950, 650);
        this.createFragment(800, 350);
        this.createFragment(1350, 270);
        this.createFragment(1900, 330);
        this.createFragment(2450, 210);

        // === PORTAL / META ===
        this.goal = this.physics.add.image(2450, 200, 'portal');
        this.goal.setPipeline('Light2D');
        this.goal.body.allowGravity = false;
        this.goal.body.immovable = true;

        const particles = this.add.particles(0, 0, 'firefly', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: -100,
            quantity: 2,
            emitting: true
        });
        particles.startFollow(this.goal);

        // === JUGADOR ===
        this.player = new Player(this, 100, 900, 5);

        // === COLISIONES ===
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.shadows, this.platforms);

        this.physics.add.overlap(this.player, this.fragments, this.collectFragment, null, this);
        this.physics.add.overlap(this.player, this.shadows, this.hitShadow, null, this);
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
        this.physics.add.collider(
            this.projectiles,
            this.platforms,
            (projectile, platform) => {
                if (projectile && typeof projectile.destroyProjectile === 'function') {
                    projectile.destroyProjectile();
                } else if (projectile && projectile.destroy) {
                    projectile.destroy();
                }
            }
        );

        this.physics.add.overlap(this.player, this.projectiles, this.hitProjectile, null, this);

        // === CÁMARA ===
        this.cameras.main.setBounds(0, 0, 3000, 2000);
        this.physics.world.setBounds(0, 0, 3000, 2000, true, true, true, false);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // === HUD ===
        this.hud = new HUD(this, 5);
        this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

        // Sombras más visibles
        this.shadows.children.iterate((shadow) => {
            if (shadow) {
                shadow.setTint(0xff0000);
                this.lights.addLight(shadow.x, shadow.y, 120, 0xff0000, 1.5);
                this.tweens.add({
                    targets: shadow,
                    scale: 1.2,
                    duration: 600,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Disparos periódicos de los enemigos
        this.time.addEvent({
            delay: 2000,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // Intro poética del nivel
        this.showIntro('Las lágrimas riegan el jardín del alma.');

        // Pausa con ESC
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { activeScene: 'Game' });
        });
    }

    // ================== LÓGICA DE ENEMIGOS ==================

    enemyShoot() {
        if (this.isIntro) return;

        this.shadows.children.iterate((shadow) => {
            if (!shadow || !shadow.active) return;

            const camera = this.cameras.main;
            const inView =
                shadow.x > camera.scrollX - 100 &&
                shadow.x < camera.scrollX + camera.width + 100 &&
                shadow.y > camera.scrollY - 100 &&
                shadow.y < camera.scrollY + camera.height + 100;

            if (!inView) return;

            const texture = 'stone';
            const projectile = this.projectiles.get(shadow.x, shadow.y, texture);

            if (projectile) {
                projectile.fire(shadow.x, shadow.y, this.player.x, this.player.y);
            }
        });
    }

    hitProjectile(player, projectile) {
        projectile.destroyProjectile();
        const isDead = player.damage(20);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        this.cameras.main.shake(100, 0.005);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        }
    }

    update() {
        if (this.isIntro) return;
    }

    createPlatform(x, y, blocks = 1) {
        const BLOCK_WIDTH = 64;
        const BLOCK_HEIGHT = 24;
        const width = BLOCK_WIDTH * blocks;

        const p = this.platforms.create(x, y, 'platform');
        p.setDisplaySize(width, BLOCK_HEIGHT);
        p.refreshBody();
        p.setPipeline('Light2D');
    }

    createFragment(x, y) {
        const f = this.fragments.create(x, y, 'fragment');
        f.setPipeline('Light2D');
        f.setScale(1.3);

        this.lights.addLight(x, y, 150, 0xffdd00, 2.5);

        const particles = this.add.particles(x, y, 'firefly', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            frequency: 100,
            tint: 0xffffaa
        });
        particles.setDepth(f.depth - 1);

        this.tweens.add({
            targets: f,
            y: y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: f,
            scale: { from: 1.3, to: 1.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createShadow(x, y) {
        const s = this.shadows.create(x, y, 'shadow');
        s.setPipeline('Light2D');
    }

    // ================== LÓGICA DE COLISIONES Y META ==================

    collectFragment(player, fragment) {
        fragment.disableBody(true, true);

        // 🔊 Sonido de recoger fragmento
        if (this.sfxCollect) {
            this.sfxCollect.play();
        }

        player.heal(60);
        player.onStarCollected();

        const collected = 5 - this.fragments.countActive(true);
        this.hud.updateStars(collected, 5);
        this.hud.updateEnergy(player.currentLight, player.maxLight);
    }

    hitShadow(player, shadow) {
        const isDead = player.damage(60);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        } else {
            player.setVelocityX(player.x < shadow.x ? -300 : 300);
            player.setVelocityY(-300);
        }
    }

    reachGoal(player, goal) {
        // Si aún faltan fragmentos, simplemente no haces nada especial
        if (this.fragments.countActive(true) > 0) {
            return;
        }

        // Si ya los tiene todos, escena de nivel completado
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
                if (this.bgMusic) this.bgMusic.stop();
                this.time.delayedCall(2000, () => {
                    this.scene.start('LevelFear');
                });
            }
        });
    }


    showIntro(quote) {
        this.isIntro = true;
        this.hud.setVisible(false);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000)
            .setScrollFactor(0)
            .setDepth(10000);

        const firefly = this.add.circle(width / 2, height / 2, 5, 0xffffaa, 1)
            .setScrollFactor(0)
            .setDepth(10002);

        const glow = this.add.circle(width / 2, height / 2, 20, 0xffffaa, 0.3)
            .setScrollFactor(0)
            .setDepth(10002);

        this.tweens.add({
            targets: [firefly, glow],
            scale: { from: 1, to: 1.5 },
            alpha: { from: 1, to: 0.5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: [firefly, glow],
            x: '+=30',
            y: '-=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

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
