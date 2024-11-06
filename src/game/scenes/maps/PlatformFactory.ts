// src/components/PlatformFactory.ts
import { Scene, Physics } from 'phaser';

export class PlatformFactory {
    scene: Scene;
    platforms: Phaser.Physics.Arcade.StaticGroup; // Use StaticGroup for immovable platforms
    mapWidth: number;

    constructor(scene: Scene, mapWidth: number = 2000) {
        this.scene = scene;
        this.platforms = this.scene.physics.add.staticGroup(); // StaticGroup ensures platforms don’t move
        this.mapWidth = mapWidth;
    }

    createPlatform(x: number, y: number, width: number) {
        // Create a rectangle to represent the platform
        const platform = this.scene.add.graphics();
        platform.lineStyle(4, 0xffffff, 1);
        platform.strokeRect(x, y, width, 4);
        platform.setData('width', width);
        platform.setData('x', x);
        platform.setData('y', y);

        this.platforms.add(platform);
    }

    createFloor() {
        // Create a floor platform across the entire map width
        const floor = this.scene.add.rectangle(this.mapWidth / 2, 640, this.mapWidth, 1, 0xffffff);
        this.scene.physics.add.existing(floor, true); // Add physics body (true = immovable)

        this.platforms.add(floor);
    }

    getPlatforms() {
        return this.platforms;
    }
}
