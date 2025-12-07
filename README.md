# Chess Tutor

An interactive chess board that syncs with Claude Code for real-time teaching.

## The Idea

A chess board saves its state to a local file. Claude Code reads that file to see the position, and writes to it to make moves or set up positions. No API, no complexity—just a shared file.

The result: genuinely interactive chess teaching where Claude sees exactly what you see and can respond in real-time.

## Quick Start

```bash
npm install
npm run dev
```

Open [localhost:3002](http://localhost:3002)

## How It Works

1. **You move pieces** on the board (drag or click)
2. **State saves** automatically to `board.json`
3. **Ask Claude** about the position in Claude Code
4. **Claude responds** with analysis, can make moves by editing `board.json`
5. **Click Sync** to load Claude's changes

## The File

Everything syncs through `board.json`:

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "history": [],
  "pgn": "",
  "turn": "white",
  "lastMove": null,
  "notes": ""
}
```

Claude reads this to understand the position. Claude writes to it to make moves or set up puzzles.

## Features

- Interactive chessboard with move validation
- Auto-saves state on each move
- PGN import for loading games
- Captured pieces display
- Undo, reset, flip board

## Teaching Modes

- **Position analysis** — Make moves, ask Claude to evaluate
- **Guided games** — Play against Claude with explanations
- **Puzzle training** — Claude sets up tactical puzzles
- **Master game study** — Load PGNs and analyze together

## Learning Plan

See [LEARNING_PLAN.md](./LEARNING_PLAN.md) for the personalized curriculum.

---

Built for learning chess with [Claude Code](https://claude.com/claude-code).
