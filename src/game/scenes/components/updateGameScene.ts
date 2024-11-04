// src/components/updateGameScene.ts

import { Scene, GameObjects, Math as PhaserMath, Input } from 'phaser';
import { MapOne } from '../maps/livir/MapOne';
import { MapTwo } from '../maps/livir/MapTwo';

export function updateGameScene(
    scene: Scene,
    player: GameObjects.Sprite,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    map: MapOne | MapTwo,
    attackKey: Input.Keyboard.Key, // Add attackKey as a parameter
    delta: number // Ensure delta is a parameter
) {
    // Initialize custom properties if not already set
    if (!scene['isJumping']) scene['isJumping'] = false;
    if (!scene['jumpVelocity']) scene['jumpVelocity'] = 0;
    if (!scene['gravity']) scene['gravity'] = 0.5;
    if (!scene['isAttacking']) scene['isAttacking'] = false; // Initialize attack state

    if (typeof map.updateMonsters === 'function') {
        map.updateMonsters();
    }
    // Handle left and right movement
    let isMoving = false;

    if (cursors.left.isDown) {
        player.x -= 5;
        player.setFlipX(false);
        isMoving = true;
    }

    if (cursors.right.isDown) {
        player.x += 5;
        player.setFlipX(true);
        isMoving = true;
    }

    if (Phaser.Input.Keyboard.JustDown(attackKey) && !scene['isAttacking'] && !scene['isJumping']) {
        scene['isAttacking'] = true;
        player.play('attack');
        
        // Define attack hitbox (e.g., in front of the player)
        const attackRange = -40; // Adjust as needed
        const attackWidth = 30;
        const attackHeight = 80;
        const attackX = player.flipX ? player.x - attackRange : player.x + attackRange;
        const attackY = player.y;
        
        // Create an invisible rectangle with physics enabled for overlap detection
        const attackArea = scene.add.rectangle(attackX, attackY, attackWidth, attackHeight, 0xff0000, 0.5);
        scene.physics.add.existing(attackArea);
        (attackArea.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        
        // Remove the attack area after a short delay
        scene.time.delayedCall(100, () => {
            attackArea.destroy();
        });
    
        // Check if the map has monsters before attempting to detect collisions
        if (map instanceof MapTwo) {
            // Check for collisions with the monster group using physics overlap
            scene.physics.overlap(attackArea, map.monsterSpawner.monsterGroup, (attackArea, monster) => {
                if (monster.getData('isMonster')) {
                    map.monsterSpawner.handleMonsterHit(monster as Phaser.GameObjects.Sprite);
                }
            });
        }
    }
    


    // Decide on walking animation if moving and not jumping or attacking
    if (isMoving && !scene['isJumping'] && !scene['isAttacking']) {
        if (player.anims.getName() !== 'walk') {
            player.play('walk');
        }
    } else if (!isMoving && !scene['isJumping'] && !scene['isAttacking']) {
        // If not moving and not jumping or attacking, play idle animation
        if (player.anims.getName() !== 'idle') {
            player.play('idle');
        }
    }

    // Handle jumping
    if (cursors.up.isDown && !scene['isJumping'] && !scene['isAttacking']) { // Prevent jumping while attacking
        scene['isJumping'] = true;
        scene['jumpVelocity'] = -10;
        player.play('jump');
    }

    if (scene['isJumping']) {
        player.y += scene['jumpVelocity'];
        scene['jumpVelocity'] += scene['gravity'];

        // Check if the player has landed on a platform
        if (map.detectPlayerOnPlatform(player, scene['isJumping'])) {
            scene['isJumping'] = false;
            // Decide next animation based on movement
            if (isMoving) {
                player.play('walk');
            } else {
                player.play('idle');
            }
        }

        // Ensure the player doesn't fall below ground level
        if (player.y >= 600) { // Assuming 600 is the ground level
            player.y = 600;
            scene['isJumping'] = false;
            // Decide next animation based on movement
            if (isMoving) {
                player.play('walk');
            } else {
                player.play('idle');
            }
        }
    } else {
        // If not jumping and not on a platform, initiate falling
        if (!map.detectPlayerOnPlatform(player, scene['isJumping']) && player.y < 600) {
            scene['isJumping'] = true;
            scene['jumpVelocity'] = 0;
        }
    }

    // Handle attack animation completion
    if (scene['isAttacking'] && player.anims.getName() === 'attack') {
        if (!player.anims.isPlaying) { // Animation finished
            scene['isAttacking'] = false;
            // Return to idle or walk based on movement
            if (isMoving) {
                player.play('walk');
            } else {
                player.play('idle');
            }
        }
    }

    // Teleportation logic with spawn points
    if (cursors.down.isDown && map.detectPlayerOnTeleporter(player)) {
        if (map instanceof MapOne) {
            scene.scene.start('Game', { spawnPosition: { x: 1500, y: 600 }, mapType: 'MapTwo' });
        } else if (map instanceof MapTwo) {
            scene.scene.start('Game', { spawnPosition: { x: 100, y: 600 }, mapType: 'MapOne' });
        }
    }

    // Prevent player from moving out of bounds
    player.x = PhaserMath.Clamp(player.x, 0, map.mapWidth);
}
