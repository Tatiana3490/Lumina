export class LevelEnvironment {
    constructor(scene, levelId) {
        this.scene = scene;
        this.levelId = levelId;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;

        this.init();
    }

    init() {
        this.createParallax();
        this.createParticles();
    }

    createParallax() {
        // Since we don't have separate assets, we'll simulate parallax with procedural graphics or reusing the bg
        // Layer 1: Far Background (Already created in Scene, usually)
        // We will add a "Midground" layer here

        const midground = this.scene.add.graphics();
        midground.fillStyle(0x000000, 0.3);

        // Draw some procedural shapes based on level
        if (this.levelId === 'sadness') {
            // Trees silhouettes
            for (let i = 0; i < 20; i++) {
                midground.fillTriangle(
                    i * 200, 2000,
                    i * 200 + 50, 1500 + Math.random() * 200,
                    i * 200 + 100, 2000
                );
            }
        } else if (this.levelId === 'fear') {
            // Spikes/Walls
            for (let i = 0; i < 20; i++) {
                midground.fillRect(i * 300, 0, 50, 1000 + Math.random() * 500);
            }
        } else if (this.levelId === 'anger') {
            // Jagged rocks
            for (let i = 0; i < 30; i++) {
                midground.fillTriangle(
                    i * 150, 2000,
                    i * 150 + 75, 1800 + Math.random() * 100,
                    i * 150 + 150, 2000
                );
            }
        } else if (this.levelId === 'hope') {
            // Clouds
            midground.fillStyle(0xffffff, 0.1);
            for (let i = 0; i < 10; i++) {
                midground.fillCircle(Math.random() * 2000, Math.random() * 3000, 100 + Math.random() * 100);
            }
        }

        midground.generateTexture('midground_' + this.levelId, 3000, 2000);
        midground.destroy();

        // Add the sprite with scroll factor
        const mgSprite = this.scene.add.tileSprite(0, 0, this.scene.physics.world.bounds.width, this.scene.physics.world.bounds.height, 'midground_' + this.levelId);
        mgSprite.setOrigin(0, 0);
        mgSprite.setScrollFactor(0.5); // Moves slower than foreground (1) but faster than bg (0.2)
        mgSprite.setDepth(0); // Behind gameplay
    }

    createParticles() {
        let config = {};

        if (this.levelId === 'sadness') {
            // Rain / Blue drops - Screen Relative
            config = {
                x: { min: 0, max: this.width }, // Use camera width
                y: -50, // Start above screen
                speedY: { min: 300, max: 500 },
                speedX: { min: -10, max: 10 },
                lifespan: 2000,
                scale: { start: 0.5, end: 0 },
                quantity: 4,
                frequency: 20,
                tint: 0x88aaff,
                blendMode: 'ADD'
            };
        } else if (this.levelId === 'fear') {
            // Dark shadows/smoke
            config = {
                x: { min: 0, max: this.scene.physics.world.bounds.width },
                y: { min: 0, max: this.scene.physics.world.bounds.height },
                speedX: { min: -50, max: 50 },
                speedY: { min: -50, max: 50 },
                lifespan: 3000,
                scale: { start: 1, end: 2 },
                alpha: { start: 0.2, end: 0 },
                quantity: 1,
                frequency: 200,
                tint: 0x110022,
                blendMode: 'MULTIPLY' // Darken
            };
        } else if (this.levelId === 'anger') {
            // Sparks / Ash
            config = {
                x: { min: 0, max: this.scene.physics.world.bounds.width },
                y: this.scene.physics.world.bounds.height,
                speedY: { min: -100, max: -300 },
                speedX: { min: -50, max: 50 },
                lifespan: 1500,
                scale: { start: 0.4, end: 0 },
                quantity: 4,
                frequency: 20,
                tint: [0xffaa00, 0xff4400],
                blendMode: 'ADD'
            };
        } else if (this.levelId === 'hope') {
            // Ascending lights
            config = {
                x: { min: 0, max: this.scene.physics.world.bounds.width },
                y: this.scene.physics.world.bounds.height,
                speedY: { min: -50, max: -150 },
                lifespan: 4000,
                scale: { start: 0.2, end: 1 },
                alpha: { start: 0, end: 0.5 },
                quantity: 1,
                frequency: 100,
                tint: 0xffffaa,
                blendMode: 'ADD'
            };
        }

        // Create particle emitter
        // We use 'firefly' texture as a generic particle base
        const particles = this.scene.add.particles(0, 0, 'firefly', config);
        particles.setDepth(1);

        if (this.levelId === 'sadness') {
            particles.setScrollFactor(0); // Rain moves with camera
        }
    }
}
