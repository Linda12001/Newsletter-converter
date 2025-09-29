import { NewsletterCreator } from "@/components/mjml-converter"

export const metadata = {
  title: "Newsletter Builder",
  description: "Create responsive emails",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NewsletterCreator />
    </main>
  )
}
