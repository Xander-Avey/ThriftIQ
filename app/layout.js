import './globals.css'

export const metadata = {
  title: 'ThriftIQ — AI Resale Scanner',
  description: 'Snap a photo of any thrifted item and know exactly what it\'s worth.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-K4M4PGVEVD"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K4M4PGVEVD');
        `}} />
      </head>
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
