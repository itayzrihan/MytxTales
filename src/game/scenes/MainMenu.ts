import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    background: GameObjects.Image | null = null;
    logo: GameObjects.Image | null = null;
    title: GameObjects.Text | null = null;
    playButton: GameObjects.Text | null = null;
    logoTween: Phaser.Tweens.Tween | null = null;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.createUIElements();

        // Add click event for the Play button
        if (this.playButton) {
            this.playButton.on('pointerdown', () => {
                this.changeScene();
            });
        }

        // Listen for resize events to adjust UI with a debounce
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            setTimeout(() => this.resizeUIElements(gameSize), 100); // Add a slight delay to allow resizing
        });

        // Initial resizing
        this.resizeUIElements(this.scale.gameSize);

        EventBus.emit('current-scene-ready', this);
    }

    createUIElements() {
        // Set initial positions based on a standard screen size
        const { width, height } = this.scale.gameSize;

        this.background = this.add.image(width / 2, height / 2, 'background').setOrigin(0.5);
        this.logo = this.add.image(width / 2, height * 0.4, 'logo').setDepth(100).setOrigin(0.5);
        this.title = this.add.text(width / 2, height * 0.6, 'Main Menu', {
            fontFamily: 'Arial Black',
            fontSize: '10vw', // Use viewport width units for text size
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.playButton = this.add.text(width / 2, height * 0.75, 'Play', {
            fontFamily: 'Arial Black',
            fontSize: '8vw', // Use viewport width units for text size
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(100).setInteractive();
    }

    resizeUIElements(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        // Ensure all elements are defined before attempting to resize
        if (!this.background || !this.logo || !this.title || !this.playButton) {
            console.warn("Elements are not fully initialized yet. Skipping resize.");
            return;
        }

        // Adjust the positions and sizes of the UI elements dynamically
        this.background.setPosition(width / 2, height / 2);
        this.background.setDisplaySize(width, height);

        this.logo.setPosition(width / 2, height * 0.3);
        this.title.setPosition(width / 2, height * 0.5);

        this.playButton.setPosition(width / 2, height * 0.7);

        // Adjust the sizes (font size dynamically)
        const titleFontSize = Math.max(32, Math.round(height * 0.05)); // Minimum of 32px or dynamic based on height
        const buttonFontSize = Math.max(24, Math.round(height * 0.04)); // Minimum of 24px or dynamic based on height

        this.title.setFontSize(titleFontSize);
        this.playButton.setFontSize(buttonFontSize);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.scene.start('Game');
    }

    moveLogo(reactCallback: ({ x, y }: { x: number, y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (this.logo && reactCallback) {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
