import { Position } from "./types";

export class Card extends Phaser.GameObjects.Sprite {
  opened = false;
  value: number;
  position!: Position;

  constructor(scene: Phaser.Scene, value: number) {
    super(scene, 0, 0, 'card');
    this.scene = scene;
    this.value = value
    this.scene.add.existing(this);
    this.setInteractive()


  }

  init(position: Position) {
    this.position = position;
    this.close();
    this.setPosition(-this.width, -this.height)
  }


  move(params: Position) {
    this.scene.tweens.add({
      targets: this,
      x: params.x,
      y: params.y,
      delay: params.delay,
      ease: 'Linear',
      duration: 250,
      onComplete: () => {
        if (params.callback) {
          params.callback();
        }
      }
    })

  }

  flip(callback?: () => void) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: 'Linear',
      duration: 150,
      onComplete: () => {
        this.show(callback);
      }
    })
  }

  show(callback?: () => void) {
    const texture = this.opened ? 'card' + this.value : 'card';
    this.setTexture(texture)

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      ease: 'Linear',
      duration: 150,
      onComplete: () => {
        if (callback) {
          callback();
        }
      }
    })
  }

  open(callback?: () => void) {
    if (!this.opened) {

      this.opened = true;
      this.flip(callback);
    }
  }

  close() {
    if (this.opened) {
      this.opened = false;
      this.flip();
    }
  }

}