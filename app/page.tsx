'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';

interface BoardState {
  fen: string;
  history: string[];
  pgn: string;
  turn: string;
  lastMove: string | null;
  notes: string;
}

export default function ChessTutor() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, React.CSSProperties>>({});
  const [pgnInput, setPgnInput] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    try {
      const res = await fetch('/api/board');
      const data: BoardState = await res.json();
      const newGame = new Chess();
      newGame.load(data.fen);
      setGame(newGame);
      setStatus('Board synchronized');
      setLastSaved(new Date());
    } catch {
      setStatus('Connection failed');
    }
  };

  const saveBoard = useCallback(async (g: Chess, lastMove: string | null = null) => {
    const state: BoardState = {
      fen: g.fen(),
      history: g.history(),
      pgn: g.pgn(),
      turn: g.turn() === 'w' ? 'white' : 'black',
      lastMove,
      notes: '',
    };
    try {
      await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      setStatus('State saved');
      setLastSaved(new Date());
    } catch {
      setStatus('Save failed');
    }
  }, []);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setSelectedSquare(null);
        setHighlightedSquares({});
        saveBoard(gameCopy, result.san);
        return result;
      }
    } catch {
      return null;
    }
    return null;
  }, [game, saveBoard]);

  const onDrop = ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false;
    const result = makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    return result !== null;
  };

  const onSquareClick = ({ square }: { piece: unknown; square: string }) => {
    if (selectedSquare) {
      const result = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (result) return;
    }

    const piece = game.get(square as Parameters<typeof game.get>[0]);
    if (piece) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Parameters<typeof game.moves>[0]['square'], verbose: true });
      const highlights: Record<string, React.CSSProperties> = {
        [square]: { backgroundColor: 'rgba(212, 165, 74, 0.4)' }
      };
      moves.forEach(m => {
        highlights[m.to] = {
          backgroundColor: game.get(m.to as Parameters<typeof game.get>[0])
            ? 'rgba(196, 92, 74, 0.5)'
            : 'rgba(74, 157, 148, 0.35)'
        };
      });
      setHighlightedSquares(highlights);
    } else {
      setSelectedSquare(null);
      setHighlightedSquares({});
    }
  };

  const reset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setHighlightedSquares({});
    setSelectedSquare(null);
    saveBoard(newGame);
  };

  const undo = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo();
    setGame(gameCopy);
    saveBoard(gameCopy);
  };

  const loadPgn = () => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnInput);
      setGame(newGame);
      saveBoard(newGame);
      setPgnInput('');
      setStatus('PGN loaded successfully');
    } catch {
      setStatus('Invalid PGN format');
    }
  };

  const gameStatus = () => {
    if (game.isCheckmate()) return { text: `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`, type: 'danger' };
    if (game.isDraw()) return { text: 'Draw', type: 'muted' };
    if (game.isCheck()) return { text: `${game.turn() === 'w' ? 'White' : 'Black'} in check`, type: 'warning' };
    return { text: `${game.turn() === 'w' ? 'White' : 'Black'} to move`, type: 'normal' };
  };

  // Calculate captured pieces from FEN
  const getCapturedPieces = () => {
    const startingPieces = { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1, P: 8, R: 2, N: 2, B: 2, Q: 1, K: 1 };
    const currentPieces: Record<string, number> = {};
    const fen = game.fen().split(' ')[0];

    for (const char of fen) {
      if (/[prnbqkPRNBQK]/.test(char)) {
        currentPieces[char] = (currentPieces[char] || 0) + 1;
      }
    }

    const whiteCaptured: string[] = []; // black pieces that white captured
    const blackCaptured: string[] = []; // white pieces that black captured

    for (const [piece, count] of Object.entries(startingPieces)) {
      const remaining = currentPieces[piece] || 0;
      const captured = count - remaining;
      for (let i = 0; i < captured; i++) {
        if (piece === piece.toLowerCase()) {
          // lowercase = black piece, captured by white
          whiteCaptured.push(piece);
        } else {
          // uppercase = white piece, captured by black
          blackCaptured.push(piece);
        }
      }
    }

    return { whiteCaptured, blackCaptured };
  };

  const pieceToSymbol = (piece: string) => {
    const symbols: Record<string, string> = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
      'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
    };
    return symbols[piece] || piece;
  };

  const statusInfo = gameStatus();
  const { whiteCaptured, blackCaptured } = getCapturedPieces();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark} />
          <div>
            <h1 style={styles.title}>Chess Tutor</h1>
            <p style={styles.subtitle}>Interactive learning with Claude</p>
          </div>
        </div>
        <nav style={styles.nav}>
          <Link href="/how-it-works" style={styles.navLink}>How It Works</Link>
        </nav>
      </header>

      <main style={styles.main}>
        {/* Board Section */}
        <section style={styles.boardSection}>
          {/* Chess Board */}
          <div style={styles.boardWrapper}>
            <div style={styles.boardFrame}>
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: onDrop,
                  onSquareClick: onSquareClick,
                  boardOrientation: boardOrientation,
                  squareStyles: highlightedSquares,
                  darkSquareStyle: { backgroundColor: '#2a3530' },
                  lightSquareStyle: { backgroundColor: '#3d4a44' },
                  boardStyle: { borderRadius: 0 },
                }}
              />
            </div>
          </div>

          {/* Captured Pieces */}
          <div style={styles.capturedRow}>
            <div style={styles.capturedSide}>
              <span style={styles.capturedLabel}>White captured:</span>
              <span style={styles.capturedPieces}>
                {whiteCaptured.length > 0 ? whiteCaptured.map((p, i) => (
                  <span key={i} style={styles.capturedPiece}>{pieceToSymbol(p)}</span>
                )) : <span style={styles.noneCapture}>—</span>}
              </span>
            </div>
            <div style={styles.capturedSide}>
              <span style={styles.capturedLabel}>Black captured:</span>
              <span style={styles.capturedPieces}>
                {blackCaptured.length > 0 ? blackCaptured.map((p, i) => (
                  <span key={i} style={styles.capturedPiece}>{pieceToSymbol(p)}</span>
                )) : <span style={styles.noneCapture}>—</span>}
              </span>
            </div>
          </div>

          {/* Game Status */}
          <div style={{
            ...styles.gameStatus,
            color: statusInfo.type === 'danger' ? 'var(--danger)' :
                   statusInfo.type === 'warning' ? 'var(--accent-amber)' :
                   statusInfo.type === 'muted' ? 'var(--text-muted)' :
                   'var(--text-primary)'
          }}>
            {statusInfo.text}
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <button onClick={reset} style={styles.btn}>Reset</button>
            <button onClick={undo} style={styles.btn}>Undo</button>
            <button onClick={() => setBoardOrientation(o => o === 'white' ? 'black' : 'white')} style={styles.btn}>Flip</button>
            <button onClick={loadBoard} style={{ ...styles.btn, ...styles.btnAccent }}>Sync</button>
          </div>
        </section>

        {/* Panel Section */}
        <aside style={styles.panel}>
          {/* Status Bar */}
          <div style={styles.statusBar}>
            <div style={styles.statusIndicator}>
              <span style={styles.statusDot} />
              <span style={styles.statusText}>{status}</span>
            </div>
            <div style={styles.timestamp}>
              {lastSaved && `Last sync: ${lastSaved.toLocaleTimeString()}`}
            </div>
          </div>

          {/* Move Log */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span style={styles.panelLabel}>Move Log</span>
              <span style={styles.panelBadge}>{game.history().length}</span>
            </div>
            <div style={styles.moveLog}>
              {game.history().length > 0 ? (
                formatMoves(game.history())
              ) : (
                <span style={styles.emptyState}>No moves recorded</span>
              )}
            </div>
          </div>

          {/* PGN Loader */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span style={styles.panelLabel}>Load Game</span>
            </div>
            <textarea
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              placeholder="Paste PGN notation..."
              style={styles.textarea}
            />
            <button onClick={loadPgn} style={{ ...styles.btn, width: '100%', marginTop: 8 }}>
              Import PGN
            </button>
          </div>

          {/* FEN Display */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span style={styles.panelLabel}>Position (FEN)</span>
            </div>
            <code style={styles.fenDisplay}>{game.fen()}</code>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>Board state syncs to <code style={styles.inlineCode}>board.json</code></span>
        <span style={styles.footerDivider}>·</span>
        <span>Claude reads & writes moves in real-time</span>
      </footer>
    </div>
  );
}

function formatMoves(history: string[]) {
  const pairs: React.ReactNode[] = [];
  for (let i = 0; i < history.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    pairs.push(
      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)', minWidth: 24 }}>{moveNum}.</span>
        <span style={{ minWidth: 48 }}>{history[i]}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{history[i + 1] || ''}</span>
      </div>
    );
  }
  return pairs;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logoMark: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, var(--accent-amber) 0%, var(--accent-amber-dim) 100%)',
    borderRadius: 8,
    position: 'relative',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 500,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-muted)',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: 24,
  },
  navLink: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 32,
    padding: '32px 0',
  },
  boardSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg-panel)',
    borderRadius: 8,
    border: '1px solid var(--border-subtle)',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--success)',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  timestamp: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  boardWrapper: {
    aspectRatio: '1',
    maxWidth: 800,
  },
  boardFrame: {
    padding: 12,
    background: 'var(--bg-panel)',
    borderRadius: 12,
    border: '1px solid var(--border)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  gameStatus: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    textAlign: 'center',
    padding: '8px 0',
  },
  controls: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    padding: '10px 20px',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnAccent: {
    background: 'var(--accent-teal-dim)',
    borderColor: 'var(--accent-teal)',
    color: 'var(--text-primary)',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  panelSection: {
    background: 'var(--bg-panel)',
    borderRadius: 10,
    border: '1px solid var(--border-subtle)',
    padding: 16,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  panelBadge: {
    fontSize: 11,
    padding: '2px 8px',
    background: 'var(--bg-raised)',
    borderRadius: 10,
    color: 'var(--accent-amber)',
  },
  moveLog: {
    maxHeight: 180,
    overflowY: 'auto',
    fontSize: 13,
    lineHeight: 1.6,
  },
  emptyState: {
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    fontSize: 12,
  },
  textarea: {
    width: '100%',
    height: 80,
    padding: 12,
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    resize: 'none',
  },
  fenDisplay: {
    display: 'block',
    fontSize: 10,
    padding: 10,
    background: 'var(--bg-raised)',
    borderRadius: 6,
    color: 'var(--text-secondary)',
    wordBreak: 'break-all',
    lineHeight: 1.5,
  },
  footer: {
    padding: '20px 0',
    borderTop: '1px solid var(--border-subtle)',
    fontSize: 12,
    color: 'var(--text-muted)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerDivider: {
    color: 'var(--border)',
  },
  inlineCode: {
    padding: '2px 6px',
    background: 'var(--bg-raised)',
    borderRadius: 4,
    fontSize: 11,
    color: 'var(--accent-amber)',
  },
  capturedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    padding: '12px 16px',
    background: 'var(--bg-panel)',
    borderRadius: 8,
    border: '1px solid var(--border-subtle)',
  },
  capturedSide: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  capturedLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  capturedPieces: {
    display: 'flex',
    gap: 2,
  },
  capturedPiece: {
    fontSize: 20,
    lineHeight: 1,
  },
  noneCapture: {
    color: 'var(--text-muted)',
    fontSize: 13,
  },
};
