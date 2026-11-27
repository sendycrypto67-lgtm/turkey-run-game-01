# Gobble Dash — The Great Thanksgiving Escape

[![make.fun bounty](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/sendycrypto67-lgtm/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/sendycrypto67-lgtm/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

Thanksgiving is coming. The farmer has the oven on, the carving knife is out,
and you are the main course. **Gobble Dash** is a side-scrolling turkey escape
game: run 2,400 metres from the farmyard, through the barn and across the
kitchen to the forest gate, and you are free. Stumble three times and dinner
is served.

## How to play

- **SPACE / click** — jump (press again in the air for a double jump)
- **↓ / S** — slide under the hanging lanterns
- **SHIFT** — dash away from the farmer
- **P** pause, **M** sound, **R** restart

Jump the fences, hay bales, crates and ovens. Dodge the falling carving
knives (watch for the red warning marker, then dash). Grab corn for points
and golden feathers for a bonus life. The farmer chases you the whole way:
every stumble brings him closer, every dash puts him back.

## Stages

1. **The Farmyard** — fences, hay bales and puddles at dawn.
2. **The Barn** — crates, pitchforks and low lanterns at dusk.
3. **The Kitchen** — ovens, pots and falling carving knives by firelight.

## Run it

No build step, no network. Serve `game/` with any static server and open
`game/index.html` in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080/
```

All art is drawn in code and all sound is synthesized with WebAudio, so the
game is entirely self-contained. Screenshots are real renders of the game,
staged with `?shot=start|play|kitchen|end` (see `shots.json`).
