import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '../components/Sidebar'
import { useStore } from '../store/useStore'
import React from 'react'

describe('Sidebar', () => {
  beforeEach(() => {
    useStore.setState({
      questions: [
        {
          id: 1,
          title: 'Clean Bounty',
          content: '...',
          tags: ['test'],
          author: 'user1',
          votes: 10,
          answers: 2,
          bounty: '1000000000000000', // 0.001 ETH in Wei
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Dirty Bounty',
          content: '...',
          tags: ['test'],
          author: 'user2',
          votes: 5,
          answers: 1,
          bounty: '0.002 ETH', // Malformed string that caused the crash
          timestamp: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Garbage Bounty',
          content: '...',
          tags: ['test'],
          author: 'user3',
          votes: 2,
          answers: 0,
          bounty: 'random text',
          timestamp: new Date().toISOString()
        }
      ]
    })
  })

  it('renders without crashing even with malformed bounty data', () => {
    render(<Sidebar />)
    expect(screen.getByText('🔥 Hot Bounties')).toBeDefined()
    // Should show the clean bounty
    expect(screen.getByText('Clean Bounty')).toBeDefined()
    // Dirty bounty should be handled by safeBigInt (though it might show 0 or something else depending on formatting)
    // The key is that it doesn't THROW.
  })

  it('shows no active bounties if only garbage data exists', () => {
    useStore.setState({
      questions: [
        {
          id: 3,
          title: 'Garbage Bounty',
          content: '...',
          tags: ['test'],
          author: 'user3',
          votes: 2,
          answers: 0,
          bounty: 'abc',
          timestamp: new Date().toISOString()
        }
      ]
    })
    render(<Sidebar />)
    expect(screen.getByText('No active bounties')).toBeDefined()
  })
})
