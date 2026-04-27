import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

type Post = {
  id: number
  title: string
  body: string
}

const defaultQueryClient = new QueryClient()

export function FetchExampleInner() {
  const {
    data: posts,
    isPending,
    isError,
  } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () =>
      fetch('https://jsonplaceholder.typicode.com/posts?_limit=5').then((res) =>
        res.json(),
      ),
  })

  if (isPending) {
    return (
      <p className="text-center text-muted-foreground py-4 text-sm">Loading</p>
    )
  }

  if (isError) {
    return (
      <p className="text-center text-destructive py-4 text-sm">
        Failed to fetch data
      </p>
    )
  }

  if (!posts?.length) return null

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Content</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="text-muted-foreground">{post.id}</TableCell>
              <TableCell className="font-medium capitalize">
                {post.title}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-xs">
                {post.body}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function FetchExample({ client }: { client?: QueryClient } = {}) {
  return (
    <QueryClientProvider client={client || defaultQueryClient}>
      <FetchExampleInner />
    </QueryClientProvider>
  )
}

export default FetchExample
