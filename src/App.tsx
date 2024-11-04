import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';

function App() {
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    // References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    // State to track the currently active button
    const [activeButton, setActiveButton] = useState<string | null>(null);

    // Joystick state variables
    const [joystickActive, setJoystickActive] = useState(false);
    const [joystickStartPos, setJoystickStartPos] = useState({ x: 0, y: 0 });
    const [joystickCurrentPos, setJoystickCurrentPos] = useState({ x: 0, y: 0 });
    const [activeJoystickKey, setActiveJoystickKey] = useState<string | null>(null);

    const changeScene = () => {
        if (phaserRef.current) {     
            const scene = phaserRef.current.scene as MainMenu;
            if (scene) {
                scene.changeScene();
            }
        }
    };

    const simulateKeyPress = (key: string, type: 'keydown' | 'keyup') => {
        const keyCodeMap: { [key: string]: number } = {
            ArrowUp: 38,
            ArrowDown: 40,
            ArrowLeft: 37,
            ArrowRight: 39,
            Space: 32, // Added Space Bar key code
        };
        const event = new KeyboardEvent(type, {
            key: key,
            code: key,
            keyCode: keyCodeMap[key],
            which: keyCodeMap[key],
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    };

    const handleMouseDown = (key) => {
        simulateKeyPress(key, 'keydown');
    };

    const handleMouseUp = (key) => {
        simulateKeyPress(key, 'keyup');
    };

    const handleTouchStart = (key) => {
        simulateKeyPress(key, 'keydown');
    };

    const handleTouchEnd = (key) => {
        simulateKeyPress(key, 'keyup');
    };

    const handleJoystickStart = (event) => {
        event.preventDefault();
        setJoystickActive(true);
        const touch = event.touches ? event.touches[0] : event;
        setJoystickStartPos({ x: touch.clientX, y: touch.clientY });
        setJoystickCurrentPos({ x: touch.clientX, y: touch.clientY });
    };

    const handleJoystickMove = (event) => {
        if (!joystickActive) return;
        event.preventDefault();
        const touch = event.touches ? event.touches[0] : event;
        const newPos = { x: touch.clientX, y: touch.clientY };
        setJoystickCurrentPos(newPos);

        const deltaX = newPos.x - joystickStartPos.x;
        const threshold = 20; // pixels

        if (deltaX < -threshold) {
            // Moved left
            if (activeJoystickKey !== 'ArrowLeft') {
                if (activeJoystickKey) {
                    simulateKeyPress(activeJoystickKey, 'keyup');
                }
                simulateKeyPress('ArrowLeft', 'keydown');
                setActiveJoystickKey('ArrowLeft');
            }
        } else if (deltaX > threshold) {
            // Moved right
            if (activeJoystickKey !== 'ArrowRight') {
                if (activeJoystickKey) {
                    simulateKeyPress(activeJoystickKey, 'keyup');
                }
                simulateKeyPress('ArrowRight', 'keydown');
                setActiveJoystickKey('ArrowRight');
            }
        } else {
            // Centered
            if (activeJoystickKey) {
                simulateKeyPress(activeJoystickKey, 'keyup');
                setActiveJoystickKey(null);
            }
        }
    };

    const handleJoystickEnd = (event) => {
        event.preventDefault();
        setJoystickActive(false);
        if (activeJoystickKey) {
            simulateKeyPress(activeJoystickKey, 'keyup');
            setActiveJoystickKey(null);
        }
    };

    const moveSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;
            if (scene && scene.scene.key === 'MainMenu') {
                scene.moveLogo(({ x, y }) => {
                    setSpritePosition({ x, y });
                });
            }
        }
    };

    const addSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene;
            if (scene) {
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
                const star = scene.add.sprite(x, y, 'star');
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    };

    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== 'MainMenu');
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <div>
                    <button
                        className="buttonup"
                        onMouseDown={() => handleMouseDown('ArrowUp')}
                        onMouseUp={() => handleMouseUp('ArrowUp')}
                        onMouseLeave={() => handleMouseUp('ArrowUp')}
                        onTouchStart={() => handleTouchStart('ArrowUp')}
                        onTouchEnd={() => handleTouchEnd('ArrowUp')}
                    ></button>
                    <button
                        className="buttondown"
                        onMouseDown={() => handleMouseDown('ArrowDown')}
                        onMouseUp={() => handleMouseUp('ArrowDown')}
                        onMouseLeave={() => handleMouseUp('ArrowDown')}
                        onTouchStart={() => handleTouchStart('ArrowDown')}
                        onTouchEnd={() => handleTouchEnd('ArrowDown')}
                    ></button>
             <button
                    className={`buttonspace ${activeButton === 'Space' ? 'active' : ''}`}
                    onMouseDown={() => handleMouseDown('Space')}
                    onMouseUp={() => handleMouseUp('Space')}
                    onMouseLeave={() => handleMouseUp('Space')}
                    onTouchStart={() => handleTouchStart('Space')}
                    onTouchEnd={() => handleTouchEnd('Space')}
                >
                    Space
                </button>
                                    <div
                        className="joystick"
                        onTouchStart={handleJoystickStart}
                        onTouchMove={handleJoystickMove}
                        onTouchEnd={handleJoystickEnd}
                        onMouseDown={handleJoystickStart}
                        onMouseMove={handleJoystickMove}
                        onMouseUp={handleJoystickEnd}
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default App;
