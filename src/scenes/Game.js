import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { EnemyProjectile } from '../objects/EnemyProjectile';
import { HUD } from '../objects/HUD';
import { LevelEnvironment } from '../utils/LevelEnvironment';

// Escena del nivel 1 (Tristeza)
export class Game extends Scene {
    constructor() {
        // Nombre interno de la escena
        super('Game');
    }

    create() {
        // Por si venimos de otra escena con música, paro todo
        this.sound.stopAll();

        // ================== MÚSICA Y SONIDOS ==================
        // Música de fondo del nivel 1
        this.bgMusic = this.sound.add('music_level1', {
            volume: 0.5,
            loop: true
        });
        this.bgMusic.play();

        // Sonido al recoger fragmentos de luz
        this.sfxCollect = this.sound.add('sfx_collect', {
            volume: 0.9
        });

        // (Opcional: para usar más adelante en el salto del jugador)
        this.sfxJump = this.sound.add('sfx_jump', {
            volume: 0.8
        });

        // ================== LUCES Y ENTORNO ==================
        // Activo el sistema de luces 2D con un color ambiente oscuro
        this.lights.enable().setAmbientColor(0x111111);

        // Fondo dinámico y partículas del nivel de tristeza
        new LevelEnvironment(this, 'sadness');

        // Imagen de fondo del bosque triste
        const bg = this.add.image(0, 0, 'bg_sad').setOrigin(0, 0);
        bg.displayWidth = 3000;
        bg.displayHeight = 2000;
        bg.setScrollFactor(0.2); // Parallax para que se mueva más despacio que el jugador
        bg.setAlpha(0.6);
        bg.setDepth(-1); // Que quede por detrás de todo

        // ================== TEXTO DEL NIVEL (UI FIJA) ==================
        this.add.text(100, 50, 'Level 1: The Weeping Depths', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        })
            .setScrollFactor(0) // Que no se mueva con la cámara
            .setDepth(9000);

        // ================== GRUPOS DE FÍSICAS ==================
        // Plataformas estáticas
        this.platforms = this.physics.add.staticGroup();
        // Fragmentos de luz estáticos
        this.fragments = this.physics.add.staticGroup();
        // Sombras (enemigos) estáticas
        this.shadows = this.physics.add.staticGroup();
        // Proyectiles enemigos
        this.projectiles = this.physics.add.group({
            classType: EnemyProjectile,
            runChildUpdate: true // Llama al update() de cada proyectil
        });

        // ================== DISEÑO DEL NIVEL (PLATAFORMAS) ==================
        // Primera zona
        this.createPlatform(200, 1000, 10);
        this.createPlatform(450, 900, 3);
        this.createPlatform(700, 800, 3);
        this.createPlatform(950, 700, 3);

        // Zona central
        this.createPlatform(1200, 600, 4);
        this.createShadow(1200, 570);
        this.createPlatform(1000, 500, 3);
        this.createPlatform(800, 400, 3);

        this.createPlatform(1100, 350, 2);
        this.createPlatform(1350, 320, 3);
        this.createPlatform(1600, 300, 3);

        // Zona final
        this.createPlatform(1900, 380, 6);
        this.createShadow(1800, 350);
        this.createShadow(2000, 350);

        this.createPlatform(2200, 320, 3);
        this.createPlatform(2450, 260, 3);

        // ================== FRAGMENTOS DE LUZ (5 EN TOTAL) ==================
        this.createFragment(950, 650);
        this.createFragment(800, 350);
        this.createFragment(1350, 270);
        this.createFragment(1900, 330);
        this.createFragment(2450, 210);

        // ================== PORTAL / META DEL NIVEL ==================
        this.goal = this.physics.add.image(2450, 200, 'portal');
        this.goal.setPipeline('Light2D');
        this.goal.body.allowGravity = false;
        this.goal.body.immovable = true;

        // Partículas que rodean al portal para darle más vida
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

        // ================== JUGADOR ==================
        // El 5 es la luz máxima inicial del jugador
        this.player = new Player(this, 100, 900, 5);

        // ================== COLISIONES ==================
        // Jugador con plataformas
        this.physics.add.collider(this.player, this.platforms);

        // Sombras apoyadas en las plataformas
        this.physics.add.collider(this.shadows, this.platforms);

        // Jugador recoge fragmentos
        this.physics.add.overlap(this.player, this.fragments, this.collectFragment, null, this);

        // Jugador choca con las sombras (daño cuerpo a cuerpo)
        this.physics.add.overlap(this.player, this.shadows, this.hitShadow, null, this);

        // Jugador llega al portal (meta)
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Proyectiles enemigos chocan contra plataformas
        this.physics.add.collider(
            this.projectiles,
            this.platforms,
            (projectile, platform) => {
                // Compruebo si el proyectil tiene el método custom destroyProjectile()
                if (projectile && typeof projectile.destroyProjectile === 'function') {
                    projectile.destroyProjectile();
                } else if (projectile && projectile.destroy) {
                    // Por si acaso, uso el destroy normal de Phaser
                    projectile.destroy();
                }
            }
        );

        // Jugador recibe daño al tocar un proyectil
        this.physics.add.overlap(this.player, this.projectiles, this.hitProjectile, null, this);

        // ================== CÁMARA Y MUNDO ==================
        this.cameras.main.setBounds(0, 0, 3000, 2000);
        this.physics.world.setBounds(0, 0, 3000, 2000, true, true, true, false);

        // La cámara sigue al jugador suavemente
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // ================== HUD ==================
        this.hud = new HUD(this, 5);
        this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

        // ================== SOMBRAS (DECORACIÓN Y LUZ) ==================
        // Recorro todas las sombras para destacar visualmente cuáles son peligrosas
        this.shadows.children.iterate((shadow) => {
            if (shadow) {
                shadow.setTint(0xff0000);
                // Luz roja intensa alrededor de la sombra
                this.lights.addLight(shadow.x, shadow.y, 120, 0xff0000, 1.5);
                // Pequeña animación de "bombeo" para que no estén quietas
                this.tweens.add({
                    targets: shadow,
                    scale: 1.2,
                    duration: 600,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // ================== LÓGICA DE DISPARO ENEMIGO ==================
        // Cada cierto tiempo las sombras disparan proyectiles al jugador
        this.time.addEvent({
            delay: 2000,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // ================== INTRO POÉTICA DEL NIVEL ==================
        this.showIntro('Las lágrimas riegan el jardín del alma.');

        // ================== PAUSA CON ESC ==================
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { activeScene: 'Game' });
        });
    }

    // ================== LÓGICA DE ENEMIGOS ==================

    enemyShoot() {
        // Mientras se está mostrando la intro, no disparo
        if (this.isIntro) return;

        // Recorro cada sombra para ver si puede disparar
        this.shadows.children.iterate((shadow) => {
            if (!shadow || !shadow.active) return;

            // Solo dispara si la sombra está dentro del área visible de la cámara (+ margen)
            const camera = this.cameras.main;
            const inView =
                shadow.x > camera.scrollX - 100 &&
                shadow.x < camera.scrollX + camera.width + 100 &&
                shadow.y > camera.scrollY - 100 &&
                shadow.y < camera.scrollY + camera.height + 100;

            if (!inView) return;

            // TODO: si quiero que cada sombra use un tipo de proyectil diferente, aquí podría cambiar la textura
            const texture = 'stone';
            const projectile = this.projectiles.get(shadow.x, shadow.y, texture);

            if (projectile) {
                // Disparo el proyectil hacia la posición actual del jugador
                projectile.fire(shadow.x, shadow.y, this.player.x, this.player.y);
            }
        });
    }

    // Jugador recibe daño por proyectil enemigo
    hitProjectile(player, projectile) {
        projectile.destroyProjectile();

        const isDead = player.damage(20);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        // Pequeña sacudida para dar feedback de impacto
        this.cameras.main.shake(100, 0.005);

        if (isDead) {
            // Sacudida más fuerte si el jugador muere
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        }
    }

    update() {
        // Mientras se está mostrando la intro, no actualizo nada del gameplay
        if (this.isIntro) return;

        // TODO: aquí podría llamar a this.player.update() si el Player tuviera lógica de actualización
    }

    // ================== CREACIÓN DE ELEMENTOS DEL NIVEL ==================

    // Crea una plataforma de "blocks" bloques de ancho
    createPlatform(x, y, blocks = 1) {
        const BLOCK_WIDTH = 64;
        const BLOCK_HEIGHT = 24;
        const width = BLOCK_WIDTH * blocks;

        const p = this.platforms.create(x, y, 'platform');
        p.setDisplaySize(width, BLOCK_HEIGHT);
        p.refreshBody();
        p.setPipeline('Light2D');
    }

    // Crea un fragmento de luz con efectos visuales
    createFragment(x, y) {
        const f = this.fragments.create(x, y, 'fragment');
        f.setPipeline('Light2D');
        f.setScale(1.3);

        // Luz amarilla intensa alrededor del fragmento
        this.lights.addLight(x, y, 150, 0xffdd00, 2.5);

        // Partículas de luciérnagas alrededor del fragmento
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

        // Animación flotante suave
        this.tweens.add({
            targets: f,
            y: y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Animación de pulso para que parezca que respira
        this.tweens.add({
            targets: f,
            scale: { from: 1.3, to: 1.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Crea una sombra enemiga básica
    createShadow(x, y) {
        const s = this.shadows.create(x, y, 'shadow');
        s.setPipeline('Light2D');
    }

    // ================== LÓGICA DE COLISIONES Y META ==================

    // Jugador recoge un fragmento de luz
    collectFragment(player, fragment) {
        fragment.disableBody(true, true);

        // Sonido de recoger fragmento
        if (this.sfxCollect) {
            this.sfxCollect.play();
        }

        // El fragmento cura bastante la luz del jugador
        player.heal(60);
        player.onStarCollected();

        // Calculo cuántos fragmentos lleva ya
        const collected = 5 - this.fragments.countActive(true);
        this.hud.updateStars(collected, 5);
        this.hud.updateEnergy(player.currentLight, player.maxLight);
    }

    // Golpe directo con una sombra
    hitShadow(player, shadow) {
        const isDead = player.damage(60);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        } else {
            // Pequeño "knockback" para separar al jugador de la sombra
            player.setVelocityX(player.x < shadow.x ? -300 : 300);
            player.setVelocityY(-300);
        }
    }

    // Jugador llega al portal del nivel
    reachGoal(player, goal) {
        // Si aún faltan fragmentos por recoger, no dejo terminar el nivel
        if (this.fragments.countActive(true) > 0) {
            return;
        }

        // Pauso las físicas para hacer la escena de victoria
        this.physics.pause();

        this.add.text(player.x, player.y - 100, 'Level Complete!', {
            fontSize: '48px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Pequeña animación de giro celebrando
        this.tweens.add({
            targets: player,
            angle: 360,
            duration: 1000,
            onComplete: () => {
                if (this.bgMusic) this.bgMusic.stop();
                // Paso al siguiente nivel después de un pequeño delay
                this.time.delayedCall(2000, () => {
                    this.scene.start('LevelFear');
                });
            }
        });
    }

    // ================== INTRO POÉTICA ==================

    showIntro(quote) {
        this.isIntro = true;
        this.hud.setVisible(false);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo negro por encima de todo
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

        // Movimiento suave de la luciérnaga por la pantalla
        this.tweens.add({
            targets: [firefly, glow],
            x: '+=30',
            y: '-=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Texto con frase poética del nivel
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

        // Hago aparecer el texto, lo dejo un momento y luego desvanezco todo
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
