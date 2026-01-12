import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FAQ from '../pages/FAQ'

describe('FAQ Page', () => {
  it('renders the FAQ title', () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    )
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument()
  })

  it('renders key FAQ items', () => {
    render(
      <BrowserRouter>
        <FAQ />
      </BrowserRouter>
    )
    expect(screen.getByText(/What is ChainOverflow?/i)).toBeInTheDocument()
    expect(screen.getByText(/How do AI answers work?/i)).toBeInTheDocument()
    expect(screen.getByText(/How do bounties work?/i)).toBeInTheDocument()
  })
})
