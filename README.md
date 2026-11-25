# 🍕 Pizza Panic — Pizzeria Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/karwizinudin/pizza-panic/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137/leaderboard)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/karwizinudin/pizza-panic/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

The lunch rush is here. **Pizza Panic** is a fast, complete pizzeria game that runs
offline in a desktop browser from static files — no libraries, no network, just
vanilla HTML/CSS/JS with hand-drawn CSS/SVG art and WebAudio beeps.

## How to play

1. **Build** — click **Dough**, then a **Sauce** (tomato or BBQ), then the **Toppings**
   shown on the order ticket (pepperoni, mushroom, bell pepper, onion, olive, extra cheese).
2. **Bake** — click the **Oven** (6 seconds). Don't let it burn — a burnt pizza goes in the trash!
3. **Slice & Serve** — click **Slice**, then **SERVE** to the matching order ticket.
4. **Score** — correct pizzas earn base points plus a time bonus, multiplied by your
   combo (up to ×5). A wrong pizza costs 50 points and kills the combo. Orders that
   run out of patience walk out angry. The rush speeds up the more you serve!

- Shift length: 150 seconds. Keyboard: `D` dough · `1–8` sauce & toppings · `B` bake · `S` slice · `Enter` serve.
- Sounds: small WebAudio beeps, mutable with the 🔊 button.

## Layout

- `game/index.html` — page layout: HUD, order board, counter, stations
- `game/style.css` — all visuals (CSS-drawn pizza, tickets, oven)
- `game/orders.js` — recipes, order spawning, patience, order matching
- `game/audio.js` — WebAudio sound effects (no audio files)
- `game/game.js` — shift timer, assembly, oven, serving, scoring, rush-hour ramp
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the game in headless Chromium

## Play locally

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

## License

MIT — see [LICENSE](LICENSE).
