import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casa Segura Pro',
  description: 'Plataforma de trabalho para profissionais - Casa Segura',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-pro-primary text-pro-text">
        {children}
      </body>
    </html>
  );
}
