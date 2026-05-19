import './globals.css'

export const metadata = {
  title: 'ThriftIQ — AI Resale Scanner',
  description: 'Snap a photo of any thrifted item and know exactly what it\'s worth.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
