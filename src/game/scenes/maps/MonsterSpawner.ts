// src/MonsterSpawner.ts
import { Scene, Physics } from 'phaser';

export class MonsterSpawner {
    scene: Scene;
    monsterGroup: Phaser.Physics.Arcade.Group;
    groundLevel: number; // Define ground level for monsters

    constructor(scene: Scene) {
        this.scene = scene;
        this.groundLevel = 600; // Set ground level for monsters (same as player)

        // Initialize the monster group as a physics group
        this.monsterGroup = this.scene.physics.add.group({
            allowGravity: true,
            immovable: false,
            collideWorldBounds: true // Ensure monsters stay within game bounds
        });

        // Create animations for monster (idle, move, hit, and die)
        this.createMonsterAnimations();
    }

    createMonsterAnimations() {
        // Idle animation
        this.scene.anims.create({
            key: 'monster_idle',
            frames: [
                { key: 'stand1' },
                { key: 'stand2' },
                { key: 'stand3' }
            ],
            frameRate: 3,
            repeat: -1
        });

        // Move animation
        this.scene.anims.create({
            key: 'monster_move',
            frames: [
                { key: 'move1' },
                { key: 'move2' },
                { key: 'move3' }
            ],
            frameRate: 6,
            repeat: -1
        });
        // Hit animation
        this.scene.anims.create({
            key: 'monster_hit',
            frames: [{ key: 'hit' }],
            frameRate: 1,
            repeat: 0
        });

        // Die animation
        this.scene.anims.create({
            key: 'monster_die',
            frames: [
                { key: 'die1' },
                { key: 'die2' },
                { key: 'die3' }
            ],
            frameRate: 4,
            repeat: 0
        });
    }

    spawnMonsters(spawnPoints: { x: number, y: number }[]) {
        spawnPoints.forEach(({ x, y }) => {
            // Create monster sprite instead of triangle
            const monster = this.scene.add.sprite(x, y, 'stand1');

            // Enable physics for monster
            this.scene.physics.add.existing(monster);
            const monsterBody = monster.body as Physics.Arcade.Body;
            monsterBody.setCollideWorldBounds(true);
            monsterBody.setGravityY(300); // Apply gravity to monsters

            monster.setData('isMonster', true)
            .setData('hitsTaken', 0)

                   .setInteractive();

            this.monsterGroup.add(monster);

            // Start with idle animation
            monster.play('monster_idle');
            this.startMonsterMovement(monster);
        });
    }
   // Method to handle when a monster is hit
   handleMonsterHit(monster: Phaser.GameObjects.Sprite) {
    const hitsTaken = monster.getData('hitsTaken') + 1;
    monster.setData('hitsTaken', hitsTaken);
    monster.setData('isHit', true); // Set isHit to true

    if (hitsTaken < 3) {
        monster.play('monster_hit');
    
        if (Phaser.Math.Between(0, 1) === 0) {
            const pushbackDirection = monster.flipX ? 1 : -1;
            const pushbackForce = 200 * pushbackDirection;
            const monsterBody = monster.body as Physics.Arcade.Body;
            monsterBody.setVelocityX(pushbackForce);
        }
    
        monster.once('animationcomplete', () => {
            monster.play('monster_move');
            monster.setData('isHit', false); // Reset isHit after hit animation
        });
    } else {
        monster.play('monster_die');
        monster.setData('isDead', true); // Set the monster as dead
        monster.once('animationcomplete', () => {
            this.monsterGroup.remove(monster, true, true);
        });
    }
    
}

updateMonsters() {
    this.monsterGroup.getChildren().forEach(monster => {
        const direction = monster.getData('walkDirection');
        const monsterBody = monster.body as Physics.Arcade.Body;
         // Ensure monsters don’t fall below ground level
         if (monster.y > this.groundLevel) {
            monster.y = this.groundLevel;
            monsterBody.setVelocityY(0);
        }
        // Skip setting velocity if the monster is in hit state
        if (!monster.getData('isHit')) { 
            if (monster.getData('isWalking')) {
                monsterBody.setVelocityX(50 * direction);
                (monster as Phaser.GameObjects.Sprite).setFlipX(direction === 1);
            } else {
                monsterBody.setVelocityX(0);
            }
        }
    });
}



startMonsterMovement(monster: Phaser.GameObjects.GameObject) {
    const startWalking = () => {
        monster.setData('isWalking', true);
        const newDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        monster.setData('walkDirection', newDirection);

        // Check if monster is a Phaser.Sprite before playing animation
        if (monster instanceof Phaser.GameObjects.Sprite) {
            monster.play('monster_move');
        } else {
            console.warn("Monster is not a Phaser.GameObjects.Sprite:", monster);
        }

        // Schedule the monster to stop walking after a random interval (6-15 seconds)
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(6000, 15000),
            callback: () => {
                stopWalking();
            },
            loop: false
        });
    };

    const stopWalking = () => {
        monster.setData('isWalking', false);
    
        // Check if the monster has died; if so, don't play any animation
        if (!monster.getData('isDead')) { // Check if the monster is dead before playing animations
            if (monster instanceof Phaser.GameObjects.Sprite) {
                monster.play('monster_idle');
            } else {
                console.warn("Monster is not a Phaser.GameObjects.Sprite:", monster);
            }
        }
    
        // Schedule the monster to start walking again after a random interval (1-5 seconds)
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 5000),
            callback: () => {
                if (!monster.getData('isDead')) { // Check if monster is dead before starting to walk again
                    startWalking();
                }
            },
            loop: false
        });
    };

}



    getMonsters(): Phaser.Physics.Arcade.Group {
        return this.monsterGroup;
    }
}
