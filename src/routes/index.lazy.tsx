import { createLazyFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FetchExample from '../components/FetchExample'
import { useCounterStore } from '../store/counterStore'
function CounterCard() {
  const { count, increment, reset } = useCounterStore()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-5xl font-bold text-center tabular-nums">{count}</p>
        <div className="flex gap-3">
          <Button onClick={increment}>Increment</Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CounterDisplay() {
  const count = useCounterStore((state) => state.count)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared State</CardTitle>
        <CardDescription>
          This component reads from the same Zustand store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-bold text-center tabular-nums text-green-600 dark:text-green-400">
          {count}
        </p>
      </CardContent>
    </Card>
  )
}

export const Route = createLazyFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome to Shadcn UI! 🎉
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <CounterCard />
          <CounterDisplay />
        </div>
        <FetchExample />

        <p className="text-xs text-center text-muted-foreground mt-4">
          💡 To add more components:{' '}
          <code className="bg-muted px-1 py-0.5 rounded">
            npx shadcn@latest add dialog
          </code>
        </p>
      </div>
    </div>
  )
}
