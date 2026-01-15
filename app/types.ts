export interface GameConfig {
  speed: number // updates per second
}

export enum GameState {
  STOPPED,
  RUNNING,
  PAUSED,
}

export interface Stats {
  generation: number
}
