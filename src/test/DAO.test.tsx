import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DAO from '../pages/DAO'

describe('DAO Page', () => {
  it('renders the coming soon message', () => {
    render(<DAO />)
    expect(screen.getByText('ChainOverflow DAO is Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('DAO Governance')).toBeInTheDocument()
    expect(screen.getByText('Phase 1: Token Distribution in Progress')).toBeInTheDocument()
  })
})
