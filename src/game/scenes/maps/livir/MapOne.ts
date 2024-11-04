// src/scenes/MapOne.ts
import { Scene } from 'phaser';
import { PlatformFactory } from '../PlatformFactory';

export class MapOne {
    scene: Scene;
    platforms: Phaser.GameObjects.Group;
    platformFactory: PlatformFactory;
    mapWidth: number = 2000;
    mapHeight: number = 1024;
    teleporter: Phaser.GameObjects.Rectangle;
    spawnPoint: Phaser.GameObjects.Rectangle;
    spawnPoints: { x: number; y: number }[] = [
        { x: 300, y: 700 },
        { x: 800, y: 450 },
        { x: 1200, y: 620 }
    ];

    constructor(scene: Scene) {
        this.scene = scene;
        this.platformFactory = new PlatformFactory(this.scene, this.mapWidth);
        this.createPlatforms(); // Create unique platforms for MapOne
        this.platformFactory.createFloor();
        this.platforms = this.platformFactory.getPlatforms();

        // Define the spawn point for the player
        this.spawnPoint = this.scene.add.rectangle(600, 600, 50, 50, 0x0000ff).setOrigin(0.5);
        this.spawnPoint.setVisible(false); // Hide spawn point visual

        // Create the teleporter area
        this.teleporter = this.scene.add.rectangle(400, 640, 200, 20, 0x00ff00).setOrigin(0.5);
        this.teleporter.setData('isTeleporter', true); // Mark it as teleporter
    }

    createPlatforms() {
        // Create platforms unique to MapOne
        this.platformFactory.createPlatform(400, 550, 200);
        this.platformFactory.createPlatform(450, 450, 200);
        this.platformFactory.createPlatform(1200, 550, 200);
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
