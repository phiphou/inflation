import { QueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import FetchExample from '../FetchExample'

describe('FetchExample', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('renders loading state initially', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<FetchExample client={queryClient} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('renders posts table after successful fetch', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const mockPosts = [
      { id: 1, title: 'First Post', body: 'First body' },
      { id: 2, title: 'Second Post', body: 'Second body' },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    } as unknown as Response)

    render(<FetchExample client={queryClient} />)

    await waitFor(() => {
      expect(screen.getByText('first post')).toBeInTheDocument()
    })

    expect(screen.getByText('second post')).toBeInTheDocument()
  })

  test('renders error state when fetch fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<FetchExample client={queryClient} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
    })
  })

  test('calls correct API endpoint', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as unknown as Response)

    render(<FetchExample client={queryClient} />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts?_limit=5',
      )
    })
  })
})
