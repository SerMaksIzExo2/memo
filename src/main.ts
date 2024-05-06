import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	scale: {
		mode: Phaser.Scale.FIT,
	},
	scene: [HelloWorldScene],
}

export default new Phaser.Game(config)
