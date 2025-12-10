import { Scene } from 'phaser';
import { createAnimations } from '../helpers/Animations';

// Escena que se encarga de cargar todos los assets del juego
export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        console.log('Preloader: preload() started');

        // =========================
        // REGISTRY: VOLUMEN POR DEFECTO
        // =========================
        // Si es la primera vez que arrancamos el juego, dejo unos valores
        // por defecto en el registry para el volumen
        if (this.registry.get('masterVolume') === undefined) {
            this.registry.set('masterVolume', 1);      // volumen global
        }

        if (this.registry.get('musicVolume') === undefined) {
            this.registry.set('musicVolume', 0.6);     // música
        }

        if (this.registry.get('sfxVolume') === undefined) {
            this.registry.set('sfxVolume', 0.9);       // efectos
        }

        // Aplico el volumen maestro al SoundManager desde el inicio
        this.sound.volume = this.registry.get('masterVolume');

        // =========================
        // FONDOS / UI BÁSICA
        // =========================
        // Imagen principal del menú / portada
        this.load.image('title_screen', '/assets/title_screen.jpg');

        // Fondos de cada emoción/nivel
        this.load.image('bg_sad', '/assets/backgrounds/bg_sad.png');
        this.load.image('bg_fear', '/assets/backgrounds/bg_fear.png');
        this.load.image('bg_anger', '/assets/backgrounds/bg_anger.png');
        this.load.image('bg_hope', '/assets/backgrounds/bg_hope.png');

        // Plataforma “orgánica” que reutilizo en varios niveles
        this.load.image('platform', '/assets/platform.png');

        // =========================
        // SPRITES DEL JUGADOR (HADA)
        // =========================
        // Cada animación está hecha con imágenes sueltas (no spritesheet),
        // así que aquí cargo frame a frame.

        // Animación Idle
        for (let i = 0; i <= 4; i++) {
            this.load.image(
                `fairy_idle_${i}`,
                `/assets/sprites/player/fairy/1_IDLE_00${i}.png`
            );
        }

        // Animación Walk
        for (let i = 0; i <= 4; i++) {
            this.load.image(
                `fairy_walk_${i}`,
                `/assets/sprites/player/fairy/2_WALK_00${i}.png`
            );
        }

        // Animación Fly
        for (let i = 0; i <= 4; i++) {
            this.load.image(
                `fairy_fly_${i}`,
                `/assets/sprites/player/fairy/3_FLY_00${i}.png`
            );
        }

        // Animación Jump
        for (let i = 0; i <= 4; i++) {
            this.load.image(
                `fairy_jump_${i}`,
                `/assets/sprites/player/fairy/5_JUMP_00${i}.png`
            );
        }

        // Attack (frames no secuenciales en el sprite original)
        const attackFrames = ['000', '003', '005', '008', '009'];
        attackFrames.forEach((frame, index) => {
            this.load.image(
                `fairy_attack_${index}`,
                `/assets/sprites/player/fairy/6_ATTACK_${frame}.png`
            );
        });

        // Animación de daño (hurt)
        for (let i = 0; i <= 4; i++) {
            this.load.image(
                `fairy_hurt_${i}`,
                `/assets/sprites/player/fairy/7_HURT_00${i}.png`
            );
        }

        // Animación de muerte (solo frames impares del sprite original)
        const dieFrames = ['001', '003', '005', '007', '009'];
        dieFrames.forEach((frame, index) => {
            this.load.image(
                `fairy_die_${index}`,
                `/assets/sprites/player/fairy/8_DIE_${frame}.png`
            );
        });

        // =========================
        // ENEMIGOS
        // =========================

        // Cuervo (enemigo volador) con un montón de frames para el vuelo
        for (let i = 1; i <= 25; i++) {
            const num = i.toString().padStart(4, '0');
            this.load.image(
                `raven_fly_${i - 1}`,
                `/assets/sprites/enemy/raven/raven-black${num}.png`
            );
        }

        // Troll (enemigo terrestre) con varias acciones básicas
        const trollActions = ['IDLE', 'WALK', 'ATTAK', 'DIE', 'HURT', 'JUMP', 'RUN'];
        trollActions.forEach(action => {
            for (let i = 0; i <= 6; i++) {
                this.load.image(
                    `troll_${action.toLowerCase()}_${i}`,
                    `/assets/sprites/enemy/troll/${action}/${action}_00${i}.png`
                );
            }
        });

        // =========================
        // PROYECTILES (agua animada)
        // =========================
        // Frames sueltos de un proyectil de agua, para poder animarlo si hace falta
        for (let i = 0; i < 5; i++) {
            const num = (i + 1).toString().padStart(2, '0'); // 01..05
            this.load.image(
                `projectile_water_${i}`,
                `/assets/sprites/projectile/Projectile_01/Water__${num}.png`
            );
        }

        // =========================
        // AUDIO
        // =========================

        // Música de diferentes escenas y niveles
        this.load.audio('music_menu', '/assets/audio/music/menu.mp3');
        this.load.audio('music_level1', '/assets/audio/music/level1_sad.ogg');
        this.load.audio('music_level2', '/assets/audio/music/level2_fear.ogg');
        this.load.audio('music_level4', '/assets/audio/music/level4_hope.ogg');
        this.load.audio('awake_lumina', '/assets/audio/music/awake_lumina.mp3');

        // Efectos de sonido
        this.load.audio('sfx_jump', '/assets/audio/sfx/jump.ogg');
        this.load.audio('sfx_collect', '/assets/audio/sfx/collect.flac');

        // =========================
        // GRÁFICOS PROCEDURALES
        // =========================
        // Estos sprites se generan por código en vez de venir de un archivo.
        try {
            this.createPortalGraphic();    // portal final
            this.createFragmentGraphic();  // fragmento de luz / estrella
            this.createFireflyGraphic();   // sprite base 'firefly' para partículillas
            this.createStoneGraphic();     // proyectil de piedra “orgánico”
            this.createShadowGraphic();    // enemigo "sombra"
        } catch (e) {
            console.error('Error creating procedural graphics:', e);
        }

        console.log('Preloader: assets queued for loading');
    }

    create() {
        console.log('Preloader: create() called, starting LoadingScreen');

        // Cuando todos los assets han terminado de cargar, creo las animaciones
        // globales del juego (jugador, enemigos, etc.)
        createAnimations(this);

        // Paso a la pantalla de carga bonita (LoadingScreen)
        this.scene.start('LoadingScreen');
    }

    // =====================================================
    // A PARTIR DE AQUÍ: SOLO FUNCIONES PROCEDURALES ÚTILES
    // =====================================================

    // Dibuja una “sombra” con ojos rojos y genera la textura 'shadow'
    createShadowGraphic() {
        const graphics = this.add.graphics();

        // Cuerpo principal
        graphics.fillStyle(0x2a3a2a, 1);
        graphics.fillEllipse(16, 22, 16, 20);

        // Brazos / bultos laterales
        graphics.fillStyle(0x243424, 1);
        graphics.fillEllipse(6, 20, 6, 10);
        graphics.fillEllipse(26, 20, 6, 10);

        // “Patas” inferiores
        graphics.fillEllipse(11, 28, 5, 8);
        graphics.fillEllipse(21, 28, 5, 8);

        // Cabeza
        graphics.fillStyle(0x2a3a2a, 1);
        graphics.fillCircle(16, 12, 9);

        // Ojeras / volumen alrededor de los ojos
        graphics.fillCircle(12, 10, 3);
        graphics.fillCircle(20, 10, 3);

        graphics.fillStyle(0x243424, 1);
        graphics.fillCircle(8, 12, 3);
        graphics.fillCircle(24, 12, 3);

        // Ojos rojos
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(12, 11, 2);
        graphics.fillCircle(20, 11, 2);
        graphics.fillStyle(0xff6666, 1);
        graphics.fillCircle(11.5, 10.5, 1);
        graphics.fillCircle(19.5, 10.5, 1);

        // Boca / gesto
        graphics.lineStyle(1.5, 0x1a0a0a, 1);
        graphics.beginPath();
        graphics.moveTo(12, 15);
        graphics.lineTo(16, 16);
        graphics.lineTo(20, 15);
        graphics.strokePath();

        // Sombra alrededor para que parezca más “oscuro”
        graphics.fillStyle(0x1a0a1a, 0.3);
        graphics.fillCircle(16, 18, 18);

        graphics.generateTexture('shadow', 32, 32);
        graphics.destroy();
    }

    // Dibuja un portal mágico circular y genera la textura 'portal'
    createPortalGraphic() {
        const graphics = this.add.graphics();

        // Círculo exterior
        graphics.lineStyle(8, 0x88ddff, 0.8);
        graphics.strokeCircle(32, 32, 28);

        // Círculo interior
        graphics.lineStyle(4, 0xaaeeff, 1);
        graphics.strokeCircle(32, 32, 20);

        // Núcleo luminoso
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillCircle(32, 32, 12);

        // Pequeños puntos de luz alrededor
        graphics.fillStyle(0xddffff, 0.8);
        graphics.fillCircle(32, 10, 3);
        graphics.fillCircle(54, 32, 3);
        graphics.fillCircle(32, 54, 3);
        graphics.fillCircle(10, 32, 3);

        graphics.generateTexture('portal', 64, 64);
        graphics.destroy();
    }

    // Dibuja una especie de estrella / cristal de luz y genera 'fragment'
    createFragmentGraphic() {
        const graphics = this.add.graphics();

        // Halo suave alrededor
        graphics.fillStyle(0xffff88, 0.15);
        graphics.fillCircle(16, 16, 14);

        // Puntos de la estrella
        const points = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? 16 : 3;
            points.push({
                x: 16 + Math.cos(angle) * radius,
                y: 16 + Math.sin(angle) * radius
            });
        }

        // Estrella principal
        graphics.fillStyle(0xffffdd, 1);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.fillPath();

        // Brillo central
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 3);
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillCircle(16, 16, 4);

        graphics.generateTexture('fragment', 32, 32);
        graphics.destroy();
    }

    // Dibuja una luciérnaga sencilla y genera la textura 'firefly'
    createFireflyGraphic() {
        const graphics = this.add.graphics();

        // Halo exterior
        graphics.fillStyle(0xddddff, 0.3);
        graphics.fillCircle(16, 16, 18);

        // Cuerpo
        graphics.fillStyle(0xffffff, 1);
        graphics.fillEllipse(16, 18, 3, 10);
        graphics.fillCircle(16, 11, 3.5);

        // Patitas / detalles
        graphics.lineStyle(1.5, 0xffffff, 1);
        graphics.lineBetween(13, 15, 10, 17);
        graphics.lineBetween(19, 15, 22, 17);
        graphics.lineBetween(15, 22, 14, 26);
        graphics.lineBetween(17, 22, 18, 26);

        // Alas
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillEllipse(8, 14, 8, 10);
        graphics.fillEllipse(24, 14, 8, 10);

        // Volumen inferior
        graphics.fillStyle(0xffffff, 0.7);
        graphics.fillEllipse(10, 20, 5, 7);
        graphics.fillEllipse(22, 20, 5, 7);

        // Detalles de contorno
        graphics.lineStyle(0.5, 0xaaaaff, 0.9);
        graphics.strokeCircle(10, 14, 4);
        graphics.strokeCircle(22, 14, 4);

        // Punto de luz extra
        graphics.fillStyle(0xffffdd, 1);
        graphics.fillCircle(16, 9, 1.5);

        graphics.generateTexture('firefly', 32, 32);
        graphics.destroy();
    }

    // Dibuja una piedra “orgánica” y genera la textura 'stone'
    createStoneGraphic() {
        const graphics = this.add.graphics();

        // Volumen principal de la roca (varios círculos solapados)
        graphics.fillStyle(0x665555, 1);
        graphics.fillCircle(16, 16, 10);
        graphics.fillCircle(10, 14, 8);
        graphics.fillCircle(22, 18, 7);
        graphics.fillCircle(14, 8, 7);
        graphics.fillCircle(18, 24, 6);

        // Zonas un poco más claras para dar sensación de relieve
        graphics.fillStyle(0x887777, 1);
        graphics.fillEllipse(14, 10, 8, 4);
        graphics.fillEllipse(20, 15, 6, 3);

        // Grieta principal de la roca
        graphics.lineStyle(2, 0x443333, 0.8);
        graphics.beginPath();
        graphics.arc(16, 16, 12, 0.1, 1.5, false);
        graphics.strokePath();

        // Musgo / detalles verdes
        graphics.fillStyle(0x4a6a4a, 0.7);
        graphics.fillCircle(12, 18, 3);
        graphics.fillCircle(20, 10, 2);

        graphics.generateTexture('stone', 32, 32);
        graphics.destroy();
    }
}
