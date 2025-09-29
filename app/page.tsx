import { NewsletterCreator } from "@/components/mjml-converter"

export const metadata = {
  title: "Newsletter Builder - My App",
  description: "Create responsive emails with MJML.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NewsletterCreator />
    </main>
  )
}
