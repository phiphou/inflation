import { createLazyFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createLazyFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            App bootstrapped with template generator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
