import './globals.css';

export const metadata = {
  title: 'Zorako Lab 3D Engine',
  description: 'Interactive Scientific & Battery Simulation Environment',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
