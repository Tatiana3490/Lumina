import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { EnemyProjectile } from '../objects/EnemyProjectile';
import { HUD } from '../objects/HUD';
import { LevelEnvironment } from '../utils/LevelEnvironment';

// Escena del nivel 2 (Miedo / Fear)
export class LevelFear extends Scene {
    constructor() {
        super('LevelFear');
    }

    create() {
        // ================== MÚSICA DE FONDO ==================
        // Por si venimos de otra escena con música, la paro primero
        this.sound.stopAll();

        this.bgMusic = this.sound.add('music_level2', {
            volume: 0.5,
            loop: true
        });
        this.bgMusic.play();

        // ================== LUCES Y ENTORNO ==================
        // Luz ambiental muy oscura y verdosa para dar sensación de miedo
        this.lights.enable().setAmbientColor(0x030803);

        // Entorno: niebla / partículas específicas del nivel de miedo
        new LevelEnvironment(this, 'fear');

        // Fondo del bosque del miedo
        const bg = this.add.image(0, 0, 'bg_fear').setOrigin(0, 0);
        bg.displayWidth = 2500;
        bg.displayHeight = 800;
        bg.setScrollFactor(0.2);
        bg.setAlpha(0.5);
        bg.setDepth(-1);

        // Título del nivel (UI fija)
        this.add.text(20, 50, 'Level 2: The Whispering Maze', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        })
            .setScrollFactor(0)
            .setDepth(9000);

        // ================== GRUPOS DE FÍSICAS ==================
        // Paredes del laberinto
        this.walls = this.physics.add.staticGroup();
        // Fragmentos de luz del nivel
        this.fragments = this.physics.add.staticGroup();
        // Sombras enemigas que se mueven pero no tienen gravedad
        this.shadows = this.physics.add.group({ allowGravity: false, immovable: true });
        // Proyectiles que disparan las sombras
        this.projectiles = this.physics.add.group({
            classType: EnemyProjectile,
            runChildUpdate: true
        });

        // ================== LABERINTO (MISMAS COORDENADAS, NUEVO ASPECTO) ==================

        // Paredes exteriores del laberinto
        this.createWall(0, 0, 2500, 50);   // techo
        // this.createWall(0, 750, 2500, 50);  // suelo (ahora usamos ground visible)
        this.createWall(0, 0, 50, 800);    // pared izquierda
        this.createWall(2450, 0, 50, 800); // pared derecha

        // ===== SUELO VISIBLE EN LA PARTE INFERIOR =====
        // Suelo largo que recorre todo el nivel y que el jugador puede ver
        this.ground = this.physics.add.staticSprite(1250, 740, 'ground');
        //           centroX, altura (ajusta 740 si quieres más alto o más bajo)
        this.ground.setDisplaySize(2500, 80);
        this.ground.refreshBody();
        this.ground.setPipeline('Light2D');
        this.ground.setTint(0x222222); // un poco más oscuro para encajar con el fondo
        // this.ground.setAlpha(0.9);  // opcional, por si lo quieres casi fundido con el escenario

        // ------------- ZONA 1 -------------
        this.createWall(200, 200, 50, 400);
        this.createWall(200, 200, 400, 50);
        this.createWall(350, 350, 50, 300);
        this.createMovingShadow(250, 400, 80);

        // ------------- ZONA 2: pasillo estrecho -------------
        this.createWall(500, 100, 50, 600);
        this.createWall(650, 300, 50, 400);
        this.createMovingShadow(575, 450, 60);

        // ------------- ZONA 3: sala con múltiples sombras -------------
        this.createWall(800, 200, 50, 500);
        this.createWall(800, 200, 300, 50);
        this.createWall(1050, 200, 50, 300);
        this.createMovingShadow(900, 350, 100);
        this.createMovingShadow(900, 500, 80);

        // ------------- ZONA 4: corredor en zigzag -------------
        this.createWall(1200, 100, 50, 400);
        this.createWall(1350, 300, 50, 500);
        this.createWall(1200, 700, 200, 50);
        this.createMovingShadow(1275, 500, 60);

        // ------------- ZONA 5: laberinto dentro del laberinto -------------
        this.createWall(1500, 200, 50, 300);
        this.createWall(1500, 200, 300, 50);
        this.createWall(1750, 200, 50, 400);
        this.createWall(1650, 350, 50, 250);
        this.createMovingShadow(1575, 400, 70);
        this.createMovingShadow(1700, 300, 50);

        // ------------- ZONA 6: pasillo final trampa -------------
        this.createWall(1900, 100, 50, 250); // parte alta
        this.createWall(1900, 500, 50, 300); // parte baja
        this.createWall(2050, 400, 50, 600);
        this.createMovingShadow(1975, 600, 60);
        this.createMovingShadow(1975, 300, 80);

        // Fragmentos escondidos por el laberinto (4 en total)
        this.createFragment(300, 350);
        this.createFragment(925, 400);
        this.createFragment(1275, 600);
        this.createFragment(1700, 450);

        // ================== PORTAL (META) ==================
        this.goal = this.physics.add.image(2400, 200, 'portal');
        this.goal.setPipeline('Light2D');
        this.goal.setTint(0x00ff00);
        this.goal.body.allowGravity = false;
        this.goal.body.immovable = true;

        // Partículas verdes que rodean el portal de salida
        const particles = this.add.particles(0, 0, 'firefly', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: -100,
            quantity: 2,
            emitting: true,
            tint: 0x55ff55
        });
        particles.startFollow(this.goal);

        // Plataforma inicial donde aparece el jugador
        this.createWall(50, 700, 200, 50);

        // ================== JUGADOR ==================
        // En este nivel empezamos con 4 “estrellas” de luz
        this.player = new Player(this, 100, 650, 4);

        // ================== COLISIONES ==================
        // Paredes del laberinto: al tocarlas, reseteo los saltos dobles
        this.physics.add.collider(this.player, this.walls, (player, wall) => {
            player.jumpsLeft = player.maxJumps;
        });

        // Suelo visible: también resetea los saltos
        this.physics.add.collider(this.player, this.ground, (player, ground) => {
            player.jumpsLeft = player.maxJumps;
        });

        // Recoger fragmentos
        this.physics.add.overlap(this.player, this.fragments, this.collectFragment, null, this);

        // Daño por sombras
        this.physics.add.overlap(this.player, this.shadows, this.hitShadow, null, this);

        // Llegar al portal
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Proyectiles chocan contra paredes del laberinto
        this.physics.add.collider(
            this.projectiles,
            this.walls,
            (projectile) => {
                if (projectile && typeof projectile.destroyProjectile === 'function') {
                    projectile.destroyProjectile();
                } else if (projectile && projectile.destroy) {
                    projectile.destroy();
                }
            }
        );

        // Proyectiles impactan al jugador
        this.physics.add.overlap(this.player, this.projectiles, this.hitProjectile, null, this);

        // ================== CÁMARA Y MUNDO ==================
        this.cameras.main.setBounds(0, 0, 2500, 800);
        this.physics.world.setBounds(0, 0, 2500, 800);

        // ================== HUD ==================
        this.hud = new HUD(this, 4);
        this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

        // ================== SOMBRAS VISIBLES ==================
        // Les doy un tinte rojo, luz y una animación para que se vean bien peligrosas
        this.shadows.children.iterate((shadow) => {
            if (!shadow) return;
            shadow.setTint(0xff0000);
            this.lights.addLight(shadow.x, shadow.y, 100, 0xff0000, 1.5);
            this.tweens.add({
                targets: shadow,
                scale: 1.2,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        });

        // ================== DISPAROS DE SOMBRAS ==================
        this.time.addEvent({
            delay: 2500,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // ================== INTRO POÉTICA ==================
        this.showIntro('El coraje no es la ausencia de miedo, sino el triunfo sobre él.');

        // ================== PAUSA ==================
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { activeScene: 'LevelFear' });
        });
    }

    // ================== DISPAROS ENEMIGOS ==================

    enemyShoot() {
        // Mientras está la intro, que no disparen
        if (this.isIntro) return;

        this.shadows.children.iterate((shadow) => {
            if (!shadow || !shadow.active) return;

            const distance = Phaser.Math.Distance.Between(
                shadow.x, shadow.y,
                this.player.x, this.player.y
            );

            // Solo disparan si el jugador está relativamente cerca
            if (distance < 600) {
                const projectile = this.projectiles.get(shadow.x, shadow.y, 'stone');
                if (projectile) {
                    projectile.fire(shadow.x, shadow.y, this.player.x, this.player.y);
                }
            }
        });
    }

    // Cuando un proyectil impacta al jugador
    hitProjectile(player, projectile) {
        projectile.destroyProjectile();

        const isDead = player.damage(20);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        // Pequeña sacudida para dar sensación de impacto
        this.cameras.main.shake(100, 0.005);

        if (isDead) {
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(500, () => this.scene.restart());
        }
    }

    // ================== UPDATE (SCROLL FORZADO) ==================

    update() {
        if (this.isIntro) return;

        // Scroll automático del laberinto hacia la derecha
        const scrollSpeed = 0.8;
        this.cameras.main.scrollX += scrollSpeed;

        // Seguimiento vertical suave hacia la posición del jugador
        const targetY = this.player.y - this.cameras.main.height / 2;
        this.cameras.main.scrollY += (targetY - this.cameras.main.scrollY) * 0.1;
        this.cameras.main.scrollY = Phaser.Math.Clamp(
            this.cameras.main.scrollY,
            0,
            800 - this.cameras.main.height
        );

        // Si la cámara “se come” al jugador por la izquierda -> daño por presión
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

    // ================== PAREDES (USANDO platform.png) ==================
    // Construyo las paredes como muchos bloques pequeños de platform.png
    // para evitar que se vea una “super caja” fea.

    createWall(x, y, width, height) {
        const BLOCK_W = 64; // ancho base del sprite de plataforma
        const BLOCK_H = 24; // grosor de la plataforma

        if (width >= height) {
            // --- TRAMO HORIZONTAL ---
            const blocks = Math.ceil(width / BLOCK_W);
            const centerY = y + height / 2;

            for (let i = 0; i < blocks; i++) {
                const px = x + BLOCK_W / 2 + i * BLOCK_W;
                const wallPiece = this.walls.create(px, centerY, 'platform');
                wallPiece.setDisplaySize(BLOCK_W, BLOCK_H); // largo horizontal
                wallPiece.refreshBody();
                wallPiece.setPipeline('Light2D');
            }
        } else {
            // --- TRAMO VERTICAL ---
            const blocks = Math.ceil(height / BLOCK_H);
            const centerX = x + width / 2;

            for (let i = 0; i < blocks; i++) {
                const py = y + BLOCK_H / 2 + i * BLOCK_H;
                const wallPiece = this.walls.create(centerX, py, 'platform');
                // Piezas apiladas en vertical: estrechas y altas
                wallPiece.setDisplaySize(BLOCK_H, BLOCK_W);
                wallPiece.refreshBody();
                wallPiece.setPipeline('Light2D');
            }
        }
    }

    // ================== FRAGMENTOS Y SOMBRAS ==================

    // Fragmento de luz verdoso, con partículas y pequeñas animaciones
    createFragment(x, y) {
        const f = this.fragments.create(x, y, 'fragment');
        f.setPipeline('Light2D');
        f.setScale(1.3);

        this.lights.addLight(x, y, 150, 0xaaffaa, 2.5);

        const particles = this.add.particles(x, y, 'firefly', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            frequency: 100,
            tint: 0xaaffaa
        });
        particles.setDepth(f.depth - 1);

        // Movimiento flotante
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
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Pulso de escala
        this.tweens.add({
            targets: f,
            scale: { from: 1.3, to: 1.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Sombras que se mueven en vertical arriba/abajo
    createMovingShadow(x, y, distance) {
        const s = this.shadows.create(x, y, 'shadow');
        s.setPipeline('Light2D');

        this.tweens.add({
            targets: s,
            y: y + distance,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ================== COLISIONES Y META ==================

    // Cuando el jugador recoge un fragmento
    collectFragment(player, fragment) {
        fragment.disableBody(true, true);
        this.sound.play('sfx_collect', { volume: 0.8 });

        player.heal(60);
        player.onStarCollected();

        const collected = 4 - this.fragments.countActive(true);
        this.hud.updateStars(collected, 4);
        this.hud.updateEnergy(player.currentLight, player.maxLight);
    }

    // Daño por colisión directa con sombra
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

    // Llegar al portal de salida del laberinto
    reachGoal(player, goal) {
        // Si aún quedan fragmentos, no dejo escapar al jugador
        if (this.fragments.countActive(true) > 0) {
            const remaining = this.fragments.countActive(true);
            const msg = this.add.text(
                player.x,
                player.y - 50,
                `Collect ${remaining} more lights!`,
                {
                    fontSize: '20px',
                    fill: '#88ffaa',
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

        // Si ya tiene todos, escena de escape
        this.physics.pause();

        // Centro el texto un poco más hacia la derecha para que se vea mejor con el scroll
        const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2 + 300;

        this.add.text(centerX, player.y - 100, 'You Escaped!', {
            fontSize: '48px',
            fill: '#88ffaa',
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
