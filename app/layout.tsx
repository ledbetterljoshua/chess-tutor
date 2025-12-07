import './globals.css';

export const metadata = {
  title: 'Chess Tutor — Learn with Claude',
  description: 'An interactive chess board that syncs with Claude Code for real-time teaching',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
