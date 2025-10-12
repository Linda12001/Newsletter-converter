"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Download, Eye, Code2, Mail, Copy, Check } from "lucide-react"

const defaultNewsletter = `<mjml>
  <mj-head>
    <mj-title>Harbor Freight - Bauer 6-Tool Combo Kit</mj-title>
    <mj-preview>Claim your Bauer 6-Tool Combo Kit today!</mj-preview>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-text font-size="16px" line-height="24px" color="#000000" />
    </mj-attributes>
  </mj-head>

  <mj-body background-color="#ffffff">

    <!-- HEADER (RED) -->
    <mj-section background-color="#d52b1e" padding="20px">
      <mj-column>
        <mj-text align="center" font-size="14px" color="#ffffff">
          - Survey About -
        </mj-text>
        <mj-text align="center" font-size="28px" font-weight="bold" color="#ffffff">
          Harbor Freight
        </mj-text>
        <mj-text align="center" font-size="24px" font-weight="bold" color="#ffffff" padding-top="10px">
          CONGRATULATIONS!
        </mj-text>
        <mj-text align="center" font-size="20px" font-weight="bold" color="#ffffff">
          CLAIM YOUR BAUER 6-TOOL COMBO KIT TODAY
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- BODY (WHITE) -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text align="center" font-size="20px" font-weight="bold" color="#000000" padding-bottom="10px">
          Your Bauer 6-Tool Combo Kit Awaits!
        </mj-text>
        <mj-text align="center" font-size="16px" color="#000000">
          We're thrilled to announce that you've been selected as a winner!  
          To show our appreciation, we're gifting you a brand-new Bauer 6-Tool Combo Kit.
        </mj-text>
        <mj-button background-color="#0047ab" color="#ffffff" font-size="16px" font-weight="bold" href="#">
          CLAIM YOUR REWARD
        </mj-button>
      </mj-column>
    </mj-section>

    <!-- FOOTER -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-divider border-color="#e0e0e0" />
        <mj-text font-size="12px" color="#777777" align="center">
          If you no longer wish to receive these emails, you may unsubscribe by clicking 
          <a href="#" style="color:#0047ab;">here</a>.
        </mj-text>
        <mj-text font-size="12px" color="#555555" align="center">
          <strong>Affordable Refund Guidance</strong> - 3164 21st St Long Island City, NY 11106 United States <br/>
          If you don't want to receive this type of message, you can 
          <a href="#" style="color:#0047ab;">unsubscribe</a> from this list.
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>`

export function NewsletterCreator() {
  const [mjmlCode, setMjmlCode] = useState(defaultNewsletter)
  const [htmlOutput, setHtmlOutput] = useState("")
  const [error, setError] = useState("")
  const [warnings, setWarnings] = useState<string[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview")
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const convertMjml = useCallback(async () => {
    if (!mjmlCode.trim()) {
      setError("Please enter MJML code")
      return
    }

    if (!mounted) return

    setIsConverting(true)
    setError("")
    setWarnings([])

    try {
      console.log("[v0] Converting MJML with dynamic import")

      const [{ default: mjml2html }, { default: beautify }] = await Promise.all([
        import("mjml-browser"),
        import("js-beautify"),
      ])

      const result = mjml2html(mjmlCode, {
        validationLevel: "soft",
        fonts: {
          "Open Sans": "https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700",
          "Droid Sans": "https://fonts.googleapis.com/css?family=Droid+Sans:300,400,500,700",
        },
      })

      if (result.errors.length) {
        console.log("[v0] Conversion warnings:", result.errors)
        setWarnings(result.errors.map((e) => e.message))
      }

      let formattedHtml = result.html
      try {
        formattedHtml = beautify.html(result.html, {
          indent_size: 2,
          max_preserve_newlines: 1,
          preserve_newlines: true,
          end_with_newline: false,
        })
      } catch (beautifyError) {
        console.log("[v0] Beautify failed, using raw HTML:", beautifyError)
      }

      console.log("[v0] Conversion successful")
      setHtmlOutput(formattedHtml)
    } catch (err) {
      console.log("[v0] Conversion error:", err)
      setError(err instanceof Error ? err.message : "Failed to convert MJML")
      setHtmlOutput("")
    } finally {
      setIsConverting(false)
    }
  }, [mjmlCode, mounted])

  const downloadHtml = () => {
    if (!htmlOutput || !mounted) return
    const blob = new Blob([htmlOutput], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "newsletter.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    if (!htmlOutput || !mounted) return
    try {
      await navigator.clipboard.writeText(htmlOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  useEffect(() => {
    if (mjmlCode.trim() && mounted) {
      const timeoutId = setTimeout(() => {
        convertMjml()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [mjmlCode, convertMjml, mounted])

  useEffect(() => {
    if (mounted) {
      convertMjml()
    }
  }, [mounted, convertMjml])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground">Loading Newsletter Creator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Newsletter Creator</h1>
              <p className="text-muted-foreground text-sm">Create responsive newsletters from MJML code</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <Card className="flex flex-col bg-editor-bg border-editor-border">
            <div className="flex items-center justify-between p-4 border-b border-editor-border">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Newsletter Input (MJML)</span>
              </div>
              <Button
                onClick={convertMjml}
                disabled={isConverting}
                size="sm"
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {isConverting ? "Converting..." : "Convert"}
              </Button>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={mjmlCode}
                onChange={(e) => setMjmlCode(e.target.value)}
                placeholder="Write or paste your MJML newsletter code..."
                className="w-full h-full resize-none font-mono text-sm bg-code-bg border-editor-border focus:ring-1 focus:ring-primary"
              />
            </div>
            {error && (
              <div className="p-4 border-t border-editor-border">
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
              </div>
            )}
            {warnings.length > 0 && (
              <div className="p-4 border-t border-editor-border">
                {warnings.map((w, i) => (
                  <div key={i} className="text-sm text-warning bg-warning/10 p-3 rounded-md mb-2">
                    {w}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="flex flex-col bg-editor-bg border-editor-border">
            <div className="flex items-center justify-between p-4 border-b border-editor-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Newsletter Output (HTML)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted rounded-md p-1">
                  <Button
                    variant={viewMode === "preview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("preview")}
                    className="h-7 px-3 text-xs"
                  >
                    Preview
                  </Button>
                  <Button
                    variant={viewMode === "code" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("code")}
                    className="h-7 px-3 text-xs"
                  >
                    Code
                  </Button>
                </div>
                <Button
                  onClick={copyToClipboard}
                  disabled={!htmlOutput}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 bg-transparent"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={downloadHtml}
                  disabled={!htmlOutput}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 bg-transparent"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              {htmlOutput ? (
                viewMode === "preview" ? (
                  <div className="w-full h-full border border-editor-border rounded-md overflow-auto bg-white">
                    <iframe
                      srcDoc={htmlOutput}
                      className="w-full h-full"
                      title="Newsletter Preview"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                ) : (
                  <Textarea
                    value={htmlOutput}
                    readOnly
                    className="w-full h-full resize-none font-mono text-xs bg-code-bg border-editor-border"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Your generated newsletter HTML will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Created By Aymane Bouhantit CMH</p>
        </div>
      </div>
    </div>
  )
}
