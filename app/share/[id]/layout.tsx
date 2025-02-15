// app/share/[id]/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>; // Render only the children without a navbar
  }
  