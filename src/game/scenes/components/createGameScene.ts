// src/components/createGameScene.ts
import { Scene } from 'phaser';
import { MapOne } from '../maps/livir/MapOne';
import { MapTwo } from '../maps/livir/MapTwo';

import { createPlayerAnimations } from './PlayerAnimations';
import { EventBus } from '../../EventBus';

export function createGameScene(scene: Scene, spawnPosition: { x: number; y: number }, mapType: 'MapOne' | 'MapTwo') {
    // Initialize camera
    const camera = scene.cameras.main;

    // Initialize MapOne and add platforms to the game scene
    const map = mapType === 'MapOne' ? new MapOne(scene) : new MapTwo(scene);
    scene.add.existing(map);

    // Add game text
    const gameText = scene.add.text(500, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5).setDepth(100);

    // Create animations and player setup
    createPlayerAnimations(scene);
    const spawn = spawnPosition || map.getSpawnPoint();
    const player = scene.add.sprite(spawn.x, spawn.y, 'idle_1');
    player.play('idle');

    // Camera and floor setup
    camera.setBounds(0, -100, map.mapWidth, map.mapHeight);
    camera.startFollow(player, true, 0.1, 0.1);

    const cursors = scene.input.keyboard.createCursorKeys();
   // Define the attack key (e.g., Spacebar)
   const attackKey = scene.input.keyboard.addKey('SPACE');
   EventBus.emit('current-scene-ready', scene);

    // Return references for use in the main Game class
    return { camera, player, map, gameText, cursors, attackKey };
}
