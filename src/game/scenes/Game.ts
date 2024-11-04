import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { MapOne } from './maps/livir/MapOne';
import { MapTwo } from './maps/livir/MapTwo';

import { loadAssets } from './components/LoadAssets';
import { createGameScene } from './components/createGameScene';
import { updateGameScene } from './components/updateGameScene';

export class Game extends Scene {
    monsterFactory: MonsterFactory;

    mapType: 'MapOne' | 'MapTwo' = 'MapOne';
    attackKey: Phaser.Input.Keyboard.Key; // Add this property
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Phaser.GameObjects.Sprite;
    floor: Phaser.GameObjects.Graphics;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    isJumping: boolean = false;
    jumpVelocity: number = 0;
    gravity: number = 0.5;
    mapWidth: number = 2000; // Width of the map
    mapHeight: number = 1024; // Height of the map
    map: MapOne | MapTwo; // Map variable to hold either MapOne or MapTwo instance

    // Default spawn position
    spawnPosition = { x: 100, y: 600 };

    constructor() {
        super('Game');
    }

    init(data: { spawnPosition?: { x: number, y: number }, mapType?: 'MapOne' | 'MapTwo' }) {
        if (data.spawnPosition) {
            this.spawnPosition = data.spawnPosition;
        }
        if (data.mapType) {
            this.mapType = data.mapType;
        }
    }
    
    preload() {
        loadAssets(this); // Use the imported function to load assets
    }

    create() {
        const { camera, player, map, gameText, cursors, attackKey, monsterFactory } = createGameScene(this, this.spawnPosition, this.mapType);
        this.camera = camera;
        this.player = player;
        this.map = map;
        this.gameText = gameText;
        this.cursors = cursors;
        this.attackKey = attackKey;
        this.monsterFactory = monsterFactory; // Save reference to monsterFactory
        }
    

    update(time: number, delta: number) {
        updateGameScene(this, this.player, this.cursors, this.map, this.attackKey, delta, this.monsterFactory);
    }
}
