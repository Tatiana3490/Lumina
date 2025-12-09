import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { HUD } from '../objects/HUD';
import { LevelEnvironment } from '../utils/LevelEnvironment';

export class LevelHope extends Scene {
    constructor() {
        super('LevelHope');
    }

    create() {
        // === LUCES ===
        this.lights.enable().setAmbientColor(0x886644); // dorado cálido

        // --- MÚSICA DEL NIVEL ---
        this.sound.stopAll();
        this.bgMusic = this.sound.add('music_level4', {
            volume: 0.5,
            loop: true
        });
        this.bgMusic.play();

        // Niebla / partículas del nivel
        new LevelEnvironment(this, 'hope');

        // Fondo
        const bg = this.add.image(0, 0, 'bg_hope').setOrigin(0, 0);
        bg.displayWidth = 2000;
        bg.displayHeight = 3000;
        bg.setScrollFactor(0.2);
        bg.setAlpha(0.8);

        // Título de nivel
        this.add.text(100, 50, 'Level 3: The Radiant Ascension', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#ffaa00',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(9000);

        // === GRUPOS ===
        this.lightPath = this.physics.add.staticGroup();  // camino de luz (plataformas fijas)
        this.fragments = this.physics.add.staticGroup();
        this.movingPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.bombs = this.physics.add.group();

        // === CAMINO ASCENDENTE ===
        const pathPoints = [
            { x: 200, y: 2800 },
            { x: 500, y: 2600 },
            { x: 300, y: 2400 },
            { x: 600, y: 2200 },
            { x: 400, y: 2000 },
            { x: 700, y: 1800 },
            { x: 500, y: 1600 },
            { x: 800, y: 1400 },
            { x: 600, y: 1200 },
            { x: 900, y: 1000 },
            { x: 700, y: 800 },
            { x: 1000, y: 600 },
            { x: 800, y: 400 },
            { x: 1100, y: 200 }
        ];

        pathPoints.forEach((point, index) => {
            // plataforma principal de luz
            this.createLightPath(point.x, point.y, 5, index);

            // plataformas móviles extra
            if (index % 4 === 0 && index > 0) {
                this.createMovingPlatform(point.x + 200, point.y - 100, 4);
            }

            // fragmentos
            if (index % 3 === 0) {
                this.createFragment(point.x, point.y - 60);
            }
        });

        // Partículas ascendentes de fondo
        this.add.particles(0, 3000, 'firefly', {
            x: { min: 0, max: 2000 },
            y: 3000,
            speedY: { min: -200, max: -100 },
            speedX: { min: -30, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 6000,
            frequency: 100,
            tint: 0xffdd88
        });

        // Portal en la cima
        // this.goal = this.physics.add.image(1100, 100, 'portal');
        // this.goal.setPipeline('Light2D');
        // this.goal.setTint(0xffee00);
        // this.goal.setScale(1.5);
        // this.goal.body.allowGravity = false;

        // Jugador (inicio abajo del todo) – 5 fragmentos en total
        this.player = new Player(this, 200, 2750, 5);

        // “Jefe” – gran sombra en la parte alta
        this.createBoss(1000, 150);

        // HUD
        this.hud = new HUD(this, 5);
        this.hud.updateEnergy(this.player.currentLight, this.player.maxLight);

        // CÁMARA Y MUNDO
        this.cameras.main.setBounds(0, 0, 2000, 3000);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Sin colisión inferior para que caerse sea muerte
        this.physics.world.setBounds(0, 0, 2000, 3000, true, true, true, false);

        // COLISIONES
        this.physics.add.collider(this.player, this.lightPath);
        this.physics.add.collider(this.player, this.movingPlatforms);
        this.physics.add.overlap(this.player, this.fragments, this.collectFragment, null, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);
        //this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
        this.physics.add.overlap(this.bombs, this.lightPath, (bomb) => bomb.destroy());
        this.physics.add.overlap(this.bombs, this.movingPlatforms, (bomb) => bomb.destroy());

        // Intro poética
        this.showIntro('La esperanza es el sueño del que está despierto.');

        // Pausa
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { activeScene: 'LevelHope' });
        });

        // Flags de fase final
        this.awakeningStarted = false;
        this.ascensionPhase = false;
    }

    // ================== DESPERTAR DE LUMINA ==================

    startLuminaAwakening() {
        if (this.awakeningStarted) return;
        this.awakeningStarted = true;
        // Cortar (o hacer fade out) de la música del nivel
        if (this.bgMusic) {
            this.tweens.add({
                targets: this.bgMusic,
                volume: 0,
                duration: 1500,
                onComplete: () => {
                    this.bgMusic.stop();
                }
            });
        }

        this.awakeMusic = this.sound.add('awake_lumina', {
            volume: 0.7,
            loop: false
        });
        this.awakeMusic.play();


        // Fase cinemática
        this.player.setCinematicState();
        this.time.timeScale = 0.5;
        this.cameras.main.zoomTo(1.5, 2000, 'Sine.easeInOut');

        // Transformación visual
        this.time.delayedCall(500, () => {
            this.player.awakeLumina();
        });

        // Paso a modo vuelo / ascensión
        this.time.delayedCall(3000, () => {
            this.time.timeScale = 1.0;
            this.cameras.main.zoomTo(1.0, 1000, 'Sine.easeOut');

            this.player.startFlying();
            this.ascensionPhase = true;

            this.showAscensionTexts();

            // ⚡ Después de unos segundos de vuelo, disparar el final
            this.time.delayedCall(8000, () => {
                this.finishGame();
            });
        });
    }


    showAscensionTexts() {
        const phrases = [
            'La tristeza no desaparece...',
            'El miedo no se esfuma...',
            'Pero la luz aprende a caminar con ellos.'
        ];

        phrases.forEach((text, i) => {
            this.time.delayedCall(i * 3000, () => {
                this.displayOverlayText(text);
            });
        });
    }

    displayOverlayText(text) {
        const t = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            text,
            {
                fontSize: '32px',
                fontFamily: 'Cinzel',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setAlpha(0)
            .setDepth(10000);

        this.tweens.add({
            targets: t,
            alpha: 1,
            y: '-=50',
            duration: 1000,
            hold: 2000,
            yoyo: true,
            onComplete: () => t.destroy()
        });
    }

    // ================== INTRO ==================

    showIntro(quote) {
        this.isIntro = true;
        this.hud.setVisible(false);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add
            .rectangle(width / 2, height / 2, width, height, 0x000000)
            .setScrollFactor(0)
            .setDepth(10000);

        const firefly = this.add
            .circle(width / 2, height / 2, 5, 0xffffaa, 1)
            .setScrollFactor(0)
            .setDepth(10002);

        const glow = this.add
            .circle(width / 2, height / 2, 20, 0xffffaa, 0.3)
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

    // ================== UPDATE ==================

    update() {
        if (this.isIntro) return;

        // Si se cae demasiado por debajo de la cámara -> muerte
        if (this.player.y > this.cameras.main.scrollY + this.cameras.main.height + 100) {
            this.scene.restart();
        }

        // Lógica del “boss”
        if (this.boss && !this.awakeningStarted) {
            if (this.boss.x <= 200) this.boss.setVelocityX(200);
            if (this.boss.x >= 1800) this.boss.setVelocityX(-200);

            // El boss sigue la parte alta de la cámara
            this.boss.y = this.cameras.main.scrollY + 150;

            // Disparar bombas de vez en cuando
            if (Phaser.Math.Between(0, 100) < 2) {
                this.shootBomb();
            }
        } else if (this.awakeningStarted && this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
    }

    // ================== BOSS Y BOMBAS ==================

    createBoss(x, y) {
        this.boss = this.physics.add.sprite(x, y, 'shadow');
        this.boss.setPipeline('Light2D');
        this.boss.setScale(3);
        this.boss.setTint(0x440044);
        this.boss.body.allowGravity = false;
        this.boss.setVelocityX(200);

        this.lights.addLight(x, y, 300, 0xff00ff, 2);
    }

    shootBomb() {
        if (this.awakeningStarted) return;

        const bomb = this.bombs.create(this.boss.x, this.boss.y + 50, 'shadow');
        bomb.setScale(0.8);
        bomb.setTint(0xff0000);
        bomb.setPipeline('Light2D');
        bomb.setVelocityY(300);
        bomb.setVelocityX(Phaser.Math.Between(-100, 100));

        const particles = this.add.particles(0, 0, 'firefly', {
            speed: 50,
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            tint: 0xff4444
        });
        particles.startFollow(bomb);
    }

    hitBomb(player, bomb) {
        if (this.awakeningStarted) return; // invulnerable durante el despertar

        bomb.destroy();
        const isDead = player.damage(60);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        this.cameras.main.shake(200, 0.01);

        if (isDead) {
            this.scene.restart();
        }
    }

    // ================== PLATAFORMAS / FRAGMENTOS ==================

    // Camino de luz usando platform.png (tamaño coherente con otros niveles)
    createLightPath(x, y, widthScale, index) {
        const BLOCK_W = 64;
        const BLOCK_H = 24;

        const platform = this.lightPath.create(x, y, 'platform');
        platform.setDisplaySize(BLOCK_W * widthScale, BLOCK_H);
        platform.refreshBody();
        platform.setPipeline('Light2D');
        platform.setTint(0x553311);

        // Brillo
        this.tweens.add({
            targets: platform,
            alpha: { from: 1, to: 0.6 },
            tint: 0xffffcc,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Movimiento alternado
        const direction = index % 2 === 0 ? 1 : -1;
        const distance = 100;

        this.tweens.add({
            targets: platform,
            x: x + distance * direction,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMovingPlatform(x, y, widthScale) {
        const BLOCK_W = 64;
        const BLOCK_H = 24;

        const platform = this.movingPlatforms.create(x, y, 'platform');
        platform.setDisplaySize(BLOCK_W * widthScale, BLOCK_H);
        platform.setPipeline('Light2D');
        platform.setTint(0x884422);
        platform.setAlpha(1);
        platform.body.allowGravity = false;
        platform.body.immovable = true;

        this.tweens.add({
            targets: platform,
            x: x + 150,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createFragment(x, y) {
        const f = this.fragments.create(x, y, 'fragment');
        f.setPipeline('Light2D');
        f.setTint(0xffffdd);
        f.setScale(1.4);

        this.lights.addLight(x, y, 180, 0xffee00, 3.0);

        const particles = this.add.particles(x, y, 'firefly', {
            speed: { min: 15, max: 40 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1200,
            frequency: 80,
            tint: 0xffffaa
        });
        particles.setDepth(f.depth - 1);

        this.tweens.add({
            targets: f,
            y: y - 20,
            scale: 1.6,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: f,
            alpha: { from: 1, to: 0.6 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ================== FRAGMENTOS Y FINAL ==================

    collectFragment(player, fragment) {
        if (this.awakeningStarted) return;

        fragment.disableBody(true, true);
        this.sound.play('sfx_collect', { volume: 0.8 });
        player.heal(60);

        const collected = 5 - this.fragments.countActive(true);
        this.hud.updateStars(collected, 5);
        this.hud.updateEnergy(player.currentLight, player.maxLight);

        const burst = this.add.particles(fragment.x, fragment.y, 'firefly', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 15,
            tint: 0xffffaa
        });
        this.time.delayedCall(1000, () => burst.destroy());

        // Último fragmento -> despertar
        if (this.fragments.countActive(true) === 0) {
            this.startLuminaAwakening();
        }
    }

    finishGame() {
        // Escena final
        this.physics.pause();
        this.player.setCinematicState();

        const finalBurst = this.add.particles(this.player.x, this.player.y, 'firefly', {
            speed: { min: 200, max: 800 },
            scale: { start: 2, end: 0 },
            blendMode: 'ADD',
            lifespan: 4000,
            quantity: 100,
            tint: 0xffffff
        });

        const titleText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'LUMINA: ECHOES OF THE SOUL',
            {
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#ffaa00',
                strokeThickness: 8,
                fontStyle: 'bold'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setAlpha(0)
            .setDepth(20000);

        const subText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 60,
            'Reconnected with the Inner Light',
            {
                fontSize: '24px',
                fill: '#ffffaa',
                fontStyle: 'italic'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setAlpha(0)
            .setDepth(20000);

        this.cameras.main.flash(3000, 255, 255, 255);

        this.tweens.add({
            targets: [titleText, subText],
            alpha: 1,
            delay: 1000,
            duration: 2000,
            onComplete: () => {
                this.time.delayedCall(5000, () => {
                    this.scene.start('MainMenu');
                });
            }
        });
    }

}
