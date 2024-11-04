// src/components/LoadAssets.ts
import { Scene } from 'phaser';

export function loadAssets(scene: Scene) {
    // Load background and player animations
    scene.load.image('background', 'path/to/background.png');
    
    // Load idle animation frames
    scene.load.image('idle_1', 'assets/player/idle/idle_1.png');
    scene.load.image('idle_2', 'assets/player/idle/idle_2.png');
    scene.load.image('idle_3', 'assets/player/idle/idle_3.png');
    scene.load.image('idle_4', 'assets/player/idle/idle_4.png');
    scene.load.image('idle_5', 'assets/player/idle/idle_5.png');

    // Load walking animation frames
    scene.load.image('walk_1', 'assets/player/walk/walk_1.png');
    scene.load.image('walk_2', 'assets/player/walk/walk_2.png');
    scene.load.image('walk_3', 'assets/player/walk/walk_3.png');
    scene.load.image('walk_4', 'assets/player/walk/walk_4.png');

    // Load Attack animation frame
    console.log('Loading attack animation frames');
    scene.load.image('attack_1', 'assets/player/attack/attack_1.png');
    scene.load.image('attack_2', 'assets/player/attack/attack_2.png');
   

    // Load jump animation frame
    scene.load.image('jump', 'assets/player/jump/jump.png');

    // Load monster idle animation frames
    scene.load.image('stand1', 'assets/monster/snake/stand1.png');
    scene.load.image('stand2', 'assets/monster/snake/stand2.png');
    scene.load.image('stand3', 'assets/monster/snake/stand3.png');

    // Load monster move animation frames
    scene.load.image('move1', 'assets/monster/snake/move1.png');
    scene.load.image('move2', 'assets/monster/snake/move2.png');
    scene.load.image('move3', 'assets/monster/snake/move3.png');

    // Load monster hit animation frame
    scene.load.image('hit', 'assets/monster/snake/hit.png');

    // Load monster die animation frames
    scene.load.image('die1', 'assets/monster/snake/die1.png');
    scene.load.image('die2', 'assets/monster/snake/die2.png');
    scene.load.image('die3', 'assets/monster/snake/die3.png');
    
}
