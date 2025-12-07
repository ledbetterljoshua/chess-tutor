import Link from 'next/link';

export default function HowItWorks() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <span style={styles.arrow}>←</span> Back to Board
        </Link>
      </header>

      <main style={styles.main}>
        <article style={styles.article}>
          <h1 style={styles.title}>How It Works</h1>
          <p style={styles.subtitle}>
            A chess board that syncs with Claude Code for interactive teaching
          </p>

          {/* The Concept */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>The Concept</h2>
            <p style={styles.paragraph}>
              This is a simple idea: a chess board that saves its state to a local file.
              Claude Code can read that file to see the position, and write to it to make moves
              or set up positions. No API calls, no complex infrastructure—just a shared file.
            </p>
            <p style={styles.paragraph}>
              The result is genuinely interactive chess teaching. Claude sees exactly what you see,
              can respond to your moves in real-time, set up puzzles, demonstrate ideas, and guide
              you through games move by move.
            </p>
          </section>

          {/* How to Use */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Using It with Claude Code</h2>

            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Start the app</h3>
                <code style={styles.codeBlock}>
                  cd chess-tutor && npm run dev
                </code>
                <p style={styles.stepText}>
                  Open <code style={styles.inlineCode}>localhost:3002</code> in your browser
                </p>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Make moves on the board</h3>
                <p style={styles.stepText}>
                  Drag pieces or click to select and move. Every move automatically saves to
                  <code style={styles.inlineCode}>board.json</code>
                </p>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Ask Claude about the position</h3>
                <p style={styles.stepText}>
                  In Claude Code, just ask. Claude can read the board state at any time:
                </p>
                <code style={styles.codeBlock}>
                  "I just played e4. What are Black's main options here?"
                </code>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Claude can make moves too</h3>
                <p style={styles.stepText}>
                  Claude can write to <code style={styles.inlineCode}>board.json</code> to play moves,
                  set up positions, or demonstrate ideas. Click <strong>Sync</strong> in the app to
                  load Claude's changes.
                </p>
              </div>
            </div>
          </section>

          {/* What Claude Sees */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>What Claude Sees</h2>
            <p style={styles.paragraph}>
              The <code style={styles.inlineCode}>board.json</code> file contains:
            </p>
            <pre style={styles.jsonBlock}>{`{
  "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  "history": ["e4", "e5"],
  "pgn": "1. e4 e5",
  "turn": "white",
  "lastMove": "e5",
  "notes": ""
}`}</pre>
            <p style={styles.paragraph}>
              Claude reads this to understand the current position, move history, whose turn it is,
              and what the last move was. Full context for intelligent analysis.
            </p>
          </section>

          {/* Teaching Modes */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Teaching Modes</h2>

            <div style={styles.mode}>
              <h3 style={styles.modeTitle}>Position Analysis</h3>
              <p style={styles.modeText}>
                Make moves and ask Claude to evaluate. "What should I play here?" "Why is this
                move bad?" "What's the key idea in this position?"
              </p>
            </div>

            <div style={styles.mode}>
              <h3 style={styles.modeTitle}>Guided Games</h3>
              <p style={styles.modeText}>
                Play against Claude. Ask it to play as Black while you learn as White. Get
                explanations for each move and understand the reasoning.
              </p>
            </div>

            <div style={styles.mode}>
              <h3 style={styles.modeTitle}>Puzzle Training</h3>
              <p style={styles.modeText}>
                Ask Claude to set up tactical puzzles. "Give me a checkmate in 2 puzzle."
                Claude writes the position to <code style={styles.inlineCode}>board.json</code>,
                you solve it, then discuss.
              </p>
            </div>

            <div style={styles.mode}>
              <h3 style={styles.modeTitle}>Master Game Study</h3>
              <p style={styles.modeText}>
                Paste a PGN into the app to load a famous game. Walk through it with Claude,
                pausing at critical moments to analyze decisions.
              </p>
            </div>
          </section>

          {/* The File */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>The File</h2>
            <p style={styles.paragraph}>
              Everything syncs through <code style={styles.inlineCode}>chess-tutor/board.json</code>.
              That's it. No database, no server state, no complexity.
            </p>
            <p style={styles.paragraph}>
              The app writes to it when you move. Claude reads it to see the position. Claude
              writes to it to make moves. You click Sync to load changes.
            </p>
            <p style={styles.paragraph} style={{ ...styles.paragraph, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Simple interfaces enable powerful interactions.
            </p>
          </section>
        </article>
      </main>

      <footer style={styles.footer}>
        <Link href="/" style={styles.footerLink}>Start Learning →</Link>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    padding: '24px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  arrow: {
    fontSize: 16,
  },
  main: {
    flex: 1,
    padding: '48px 0',
  },
  article: {},
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    fontWeight: 500,
    margin: 0,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: 'var(--text-secondary)',
    marginTop: 12,
    marginBottom: 48,
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--accent-amber)',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
    marginBottom: 16,
  },
  step: {
    display: 'flex',
    gap: 20,
    marginBottom: 28,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--accent-amber-dim)',
    color: 'var(--accent-amber)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 500,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  codeBlock: {
    display: 'block',
    padding: '12px 16px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--accent-teal)',
    marginBottom: 12,
    overflow: 'auto',
  },
  jsonBlock: {
    display: 'block',
    padding: '16px 20px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 12,
    color: 'var(--text-secondary)',
    marginBottom: 16,
    overflow: 'auto',
    lineHeight: 1.6,
  },
  inlineCode: {
    padding: '2px 6px',
    background: 'var(--bg-raised)',
    borderRadius: 4,
    fontSize: '0.9em',
    color: 'var(--accent-amber)',
  },
  mode: {
    padding: 20,
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 10,
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 8,
    color: 'var(--text-primary)',
  },
  modeText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    margin: 0,
  },
  footer: {
    padding: '24px 0',
    borderTop: '1px solid var(--border-subtle)',
    textAlign: 'center',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    background: 'var(--accent-teal-dim)',
    border: '1px solid var(--accent-teal)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
};
