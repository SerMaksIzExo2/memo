import Phaser from 'phaser'
import background from '../../assets/sprites/background.png';
import card from '../../assets/sprites/card.png';
import card1 from '../../assets/sprites/card1.png';
import card2 from '../../assets/sprites/card2.png';
import card3 from '../../assets/sprites/card3.png';
import card4 from '../../assets/sprites/card4.png';
import card5 from '../../assets/sprites/card5.png';
import cardMusic from '../../assets/sounds/cardMusic.mp3'
import complete from '../../assets/sounds/complete.mp3'
import success from '../../assets/sounds/success.mp3'
import theme from '../../assets/sounds/theme.mp3'
import timeout from '../../assets/sounds/timeout.mp3'
import { Position, Sound } from 'types';
import { Card } from '~/Card';
import { levels } from '~/constant';

export default class HelloWorldScene extends Phaser.Scene {
    private positions: Position[] = [];
    private cards: Card[] = [];
    private openedCard?: Card;
    private openedCardCount = 0;
    private timeoutText?: Phaser.GameObjects.Text;
    private levelText?: Phaser.GameObjects.Text;
    private scoreText?: Phaser.GameObjects.Text;
    private timeout = 0;
    private level?: number;
    private id = 0;
    private count = 0;
    private sounds?: Sound;
    private timer!: Phaser.Time.TimerEvent
    private currentLevelIndex = 0;
    private totalScore = 0;
    private consecutivePairs = 0;


    constructor() {
        super('hello-world')
    }

    preload() {
        this.load.image('bg', background);
        this.load.image('card', card);
        this.load.image('card1', card1);
        this.load.image('card2', card2);
        this.load.image('card3', card3);
        this.load.image('card4', card4);
        this.load.image('card5', card5);

        this.load.audio('cardMusic', cardMusic)
        this.load.audio('complete', complete)
        this.load.audio('success', success)
        this.load.audio('theme', theme)
        this.load.audio('timeout', timeout)
    }

    create() {
        this.createSounds()
        this.createTimer();
        this.createBackground();
        this.createText();
        this.start()
    }

    update() {

    }

    onCardMoveComplete() {
        this.count += 1;

        if (this.count >= this.cards.length) {
            this.count = 0;
            this.start();
        }
    }

    goToNextLevel() {
        this.currentLevelIndex += 1;

    }

    restart() {
        this.cards.forEach(card => {
            card.depth = Number(card.position.delay);
            card.move({
                x: Number(this.sys.game.config.width) + card.width,
                y: Number(this.sys.game.config.height) + card.height,
                delay: card.position.delay,
                callback: () => {
                    this.onCardMoveComplete();
                }

            })

        })

    }

    destroyCards() {
        this.cards.forEach(card => {
            card.destroy();
        })
        this.cards = [];
    }

    start() {
        this.destroyCards();
        this.createCards();
        this.timeout = levels[this.currentLevelIndex].timeout;
        this.level = levels[this.currentLevelIndex].level;
        this.levelText?.setText('LVL ' + this.level)
        this.scoreText?.setText('Score:' + this.totalScore);

        this.openedCard = undefined;
        this.sounds?.theme.play({
            volume: 0.05
        })
        this.timer.paused = false;

        this.initCards();
        this.showCards();
    }


    initCards() {

        this.positions = this.getCardPositions();
        this.cards.forEach(card => {
            card.init(this.positions.pop()!)
        })
    }

    showCards() {

        this.cards.forEach(card => {
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay,
            })
        })
    }

    createCards() {
        const { cards } = levels[this.currentLevelIndex]
        for (let value of cards) {
            for (let i = 0; i < 2; i += 1) {
                this.cards.push(new Card(this, value))
            }
        }

        this.input.on("gameobjectdown", this.onCardClicked, this);
    }


    onCardClicked(pointer: Phaser.Input.Pointer, card: Card) {
        if (card.opened) {
            return
        }

        this.sounds?.cardMusic.play()


        if (this.openedCard) {

            if (this.openedCard.value === card.value) {
                this.consecutivePairs += 1;

                const pointsForConsecutivePairs = [100, 250, 500, 1000, 5000];

                if (this.consecutivePairs <= pointsForConsecutivePairs.length) {
                    this.totalScore += pointsForConsecutivePairs[this.consecutivePairs - 1];

                } else {
                    this.totalScore += 5000;
                }

                this.scoreText?.setText('Score:' + this.totalScore);

                this.openedCard = undefined;
                this.openedCardCount += 1;
                this.sounds?.success.play();
            }
            else {
                this.consecutivePairs = 0;

                this.openedCard.close();
                this.openedCard = card;

            }
        }
        else {
            this.openedCard = card

        }

        card.open(() => {
            if (this.openedCardCount === this.cards.length / 2) {
                this.sounds?.complete.play();
                this.openedCardCount = 0;
                this.goToNextLevel();

                this.restart()
            }
        });
    }

    getCardPositions(): Position[] {

        const cardTexture = this.textures.get('card').getSourceImage();
        const cardWidth = cardTexture.width + 4
        const cardHeight = cardTexture.height + 4
        const offsetX = (Number(this.sys.game.config.width) - cardWidth * 5) / 2 + cardWidth / 2;
        const offsetY = (Number(this.sys.game.config.height) - cardHeight * 2) / 2 + cardHeight / 2

        const { rows, cols } = levels[this.currentLevelIndex]

        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < cols; col += 1) {
                this.id += 1
                this.positions.push({
                    delay: this.id * 100,
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight,
                })
            }
        }
        return Phaser.Utils.Array.Shuffle(this.positions);

    }

    createSounds() {
        this.sounds = {
            cardMusic: this.sound.add('cardMusic'),
            complete: this.sound.add('complete'),
            success: this.sound.add('success'),
            theme: this.sound.add('theme'),
            timeout: this.sound.add('timeout'),
        };
    }



    createTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true
        })
    }

    onTimerTick() {
        this.timeoutText?.setText('Time: ' + this.timeout)

        if (this.timeout <= 0) {
            this.timer.paused = true;

            this.sounds?.timeout.play();
            this.restart()
        }
        else {
            this.timeout -= 1;
        }
    }
    createText() {
        this.timeoutText = this.add.text(10, 330, '', {
            font: '25px Arial',
            color: '#ffffff',
        })
        this.levelText = this.add.text(10, 10, '', {
            font: '25px Arial',
            color: '#000',
        })
        this.scoreText = this.add.text(100, 10, '', {
            font: '25px Arial',
            color: '#000',
        })
    }



    createBackground() {
        this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
    }
}
