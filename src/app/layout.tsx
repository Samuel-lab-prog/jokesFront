import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piada de Deploy — desculpa em produção',
  description: 'Gere, edite e guarde sua versão oficial dos fatos do código.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
