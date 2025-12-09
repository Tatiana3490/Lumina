export const createAnimations = (scene) => {
    // --- PLAYER (FAIRY) ---
    scene.anims.create({
        key: 'fairy_idle',
        frames: [
            { key: 'fairy_idle_0' },
            { key: 'fairy_idle_1' },
            { key: 'fairy_idle_2' },
            { key: 'fairy_idle_3' },
            { key: 'fairy_idle_4' }
        ],
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'fairy_walk',
        frames: [
            { key: 'fairy_walk_0' },
            { key: 'fairy_walk_1' },
            { key: 'fairy_walk_2' },
            { key: 'fairy_walk_3' },
            { key: 'fairy_walk_4' }
        ],
        frameRate: 12,
        repeat: -1
    });

    scene.anims.create({
        key: 'fairy_fly',
        frames: [
            { key: 'fairy_fly_0' },
            { key: 'fairy_fly_1' },
            { key: 'fairy_fly_2' },
            { key: 'fairy_fly_3' },
            { key: 'fairy_fly_4' }
        ],
        frameRate: 12,
        repeat: -1
    });

    scene.anims.create({
        key: 'fairy_jump',
        frames: [
            { key: 'fairy_jump_0' },
            { key: 'fairy_jump_1' },
            { key: 'fairy_jump_2' },
            { key: 'fairy_jump_3' },
            { key: 'fairy_jump_4' }
        ],
        frameRate: 12,
        repeat: 0
    });

    scene.anims.create({
        key: 'fairy_attack',
        frames: [
            { key: 'fairy_attack_0' },
            { key: 'fairy_attack_1' },
            { key: 'fairy_attack_2' },
            { key: 'fairy_attack_3' },
            { key: 'fairy_attack_4' }
        ],
        frameRate: 15,
        repeat: 0
    });

    scene.anims.create({
        key: 'fairy_hurt',
        frames: [
            { key: 'fairy_hurt_0' },
            { key: 'fairy_hurt_1' },
            { key: 'fairy_hurt_2' },
            { key: 'fairy_hurt_3' },
            { key: 'fairy_hurt_4' }
        ],
        frameRate: 12,
        repeat: 0
    });

    scene.anims.create({
        key: 'fairy_die',
        frames: [
            { key: 'fairy_die_0' },
            { key: 'fairy_die_1' },
            { key: 'fairy_die_2' },
            { key: 'fairy_die_3' },
            { key: 'fairy_die_4' }
        ],
        frameRate: 8,
        repeat: 0
    });

    // --- ENEMIES ---

    // Raven (Flying)
    const ravenFrames = [];
    for (let i = 0; i < 25; i++) {
        ravenFrames.push({ key: `raven_fly_${i}` });
    }
    scene.anims.create({
        key: 'raven_fly',
        frames: ravenFrames,
        frameRate: 30, // Smooth 60fps or 30fps depending on source
        repeat: -1
    });

    // Troll
    const trollActions = ['idle', 'walk', 'attak', 'die', 'hurt', 'jump', 'run'];
    trollActions.forEach(action => {
        const frames = [];
        for (let i = 0; i <= 6; i++) {
            frames.push({ key: `troll_${action}_${i}` });
        }
        // Correct key name (attak -> attack)
        const keyName = action === 'attak' ? 'troll_attack' : `troll_${action}`;

        scene.anims.create({
            key: keyName,
            frames: frames,
            frameRate: 10,
            repeat: (action === 'die' || action === 'hurt' || action === 'jump') ? 0 : -1
        });
    });

    // --- PROJECTILES ---
    const waterFrames = [];
    for (let i = 0; i < 5; i++) {
        waterFrames.push({ key: `projectile_water_${i}` });
    }
    scene.anims.create({
        key: 'projectile_water',
        frames: waterFrames,
        frameRate: 15,
        repeat: -1
    });
};
