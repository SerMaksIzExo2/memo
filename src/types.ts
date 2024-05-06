export type Position = {
  x: number,
  y: number,
  delay?: number,
  callback?: () => void
}

export type Level = {
  level: number,
  rows: number,
  cols: number,
  timeout: number,
  cards: number[],
}

export type Sound = {
  cardMusic: Phaser.Sound.BaseSound,
  complete: Phaser.Sound.BaseSound,
  success: Phaser.Sound.BaseSound,
  theme: Phaser.Sound.BaseSound,
  timeout: Phaser.Sound.BaseSound,
}