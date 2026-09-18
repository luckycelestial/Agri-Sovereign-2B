import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'Agri-Sovereign 2B | Uzhavan-Sahayak (உழவன் சகாயக்)',
  description: 'Authoritative Tamil Agronomic SLM with TNAU/ICAR Grounding, CIBRC Safety Validation, and Neonize WhatsApp Integration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ta" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('agri_theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[var(--accent-primary)] selection:text-white bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
