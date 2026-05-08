import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Hero from '../components/Hero'

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock useAuth
vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: null, profile: null }),
}))

describe('Hero', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    )
  })

  it('renders the heading', () => {
    expect(screen.getByText(/Học tập/i)).toBeInTheDocument()
  })

  it('renders CTA buttons', () => {
    expect(screen.getByText('🚀 Bắt đầu ngay')).toBeInTheDocument()
    expect(screen.getByText('Khám phá phòng')).toBeInTheDocument()
  })

  it('renders stats', () => {
    expect(screen.getByText('12+')).toBeInTheDocument()
    expect(screen.getByText('200+')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
