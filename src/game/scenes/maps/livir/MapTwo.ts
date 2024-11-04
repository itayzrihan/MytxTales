// src/scenes/MapTwo.ts
import { Scene } from 'phaser';
import { PlatformFactory } from '../PlatformFactory';
import { MonsterSpawner } from '../MonsterSpawner';

export class MapTwo {
    scene: Scene;
    platforms: Phaser.Physics.Arcade.Group;
    platformFactory: PlatformFactory;
    mapWidth: number = 2000;
    mapHeight: number = 1024;
    teleporter: Phaser.GameObjects.Rectangle;
    spawnPoint: Phaser.GameObjects.Rectangle;
    monsterSpawner: MonsterSpawner;
    spawnPoints: { x: number; y: number }[] = [
        { x: 300, y: 700 },
        { x: 800, y: 450 },
        { x: 1200, y: 620 }
    ];

    constructor(scene: Scene) {
        this.scene = scene;
        this.platformFactory = new PlatformFactory(this.scene, this.mapWidth);
        this.createPlatforms();
        this.platformFactory.createFloor();
        this.platforms = this.platformFactory.getPlatforms();

        // Ensure each platform has a physics body and is immovable
        this.platforms.getChildren().forEach(platform => {
            if (!platform.body) {
                this.scene.physics.add.existing(platform, true); // true makes it immovable
                platform.body.setAllowGravity(false); // Platform should not fall
            }
        });

        // Instantiate MonsterSpawner and spawn monsters
        this.monsterSpawner = new MonsterSpawner(this.scene);
        this.spawnMonsters();

        // Define the spawn point for the player
        this.spawnPoint = this.scene.add.rectangle(1500, 600, 50, 50, 0x0000ff).setOrigin(0.5);
        this.spawnPoint.setVisible(false);

        // Create the teleporter area
        this.teleporter = this.scene.add.rectangle(100, 640, 200, 20, 0x00ff00).setOrigin(0.5);
        this.teleporter.setData('isTeleporter', true);

        // Ensure monsters collide with platforms
        this.scene.physics.add.collider(this.monsterSpawner.getMonsters(), this.platforms);
    }

    createPlatforms() {
        this.platformFactory.createPlatform(600, 500, 200);
        this.platformFactory.createPlatform(800, 400, 200);
        this.platformFactory.createPlatform(1400, 500, 200);
    }

    spawnMonsters() {
        const monsterPositions = [
            { x: 1000, y: 350 },
            { x: 1300, y: 350 },
            { x: 1600, y: 350 }
        ];
        this.monsterSpawner.spawnMonsters(monsterPositions);
    }

    updateMonsters() {
        this.monsterSpawner.updateMonsters();
    }

    getSpawnPoint(): { x: number; y: number } {
        return { x: this.spawnPoint.x, y: this.spawnPoint.y };
    }

    detectPlayerOnTeleporter(player: Phaser.GameObjects.Sprite): boolean {
        const teleporterBounds = this.teleporter.getBounds();
        return Phaser.Geom.Rectangle.ContainsPoint(teleporterBounds, new Phaser.Geom.Point(player.x, player.y + player.height / 2));
    }

    detectPlayerOnPlatform(player: Phaser.GameObjects.Sprite, isJumping: boolean): boolean {
        let onPlatform = false;
        this.platforms.getChildren().forEach((platform: Phaser.GameObjects.Graphics) => {
            const platformX = platform.getData('x');
            const platformY = platform.getData('y');
            const platformWidth = platform.getData('width');

            if (
                player.y + player.height / 2 >= platformY - 5 &&
                player.y + player.height / 2 <= platformY + 5 &&
                player.x >= platformX &&
                player.x <= platformX + platformWidth
            ) {
                player.y = platformY - player.height / 2;
                onPlatform = true;
            }
        });
        return onPlatform;
    }
}
