// src/components/PlayerAnimations.ts
import { Scene } from 'phaser';

export function createPlayerAnimations(scene: Scene) {
    // Define idle animation
    scene.anims.create({
        key: 'idle',
        frames: [{ key: 'idle_1' }, { key: 'idle_2' }, { key: 'idle_3' }, { key: 'idle_4' }, { key: 'idle_5' }],
        frameRate: 5,
        repeat: -1
    });

    // Define walk animation
    scene.anims.create({
        key: 'walk',
        frames: [{ key: 'walk_1' }, { key: 'walk_2' }, { key: 'walk_3' }, { key: 'walk_4' }],
        frameRate: 5,
        repeat: -1
    });

    // Define jump animation (single frame)
    scene.anims.create({
        key: 'jump',
        frames: [{ key: 'jump' }],
        frameRate: 1,
        repeat: 0
    });

    // Define attack animation
    scene.anims.create({
        key: 'attack',
        frames: [{ key: 'attack_1' }, { key: 'attack_2' }],
        frameRate: 8,
        repeat: 0
    });
}
