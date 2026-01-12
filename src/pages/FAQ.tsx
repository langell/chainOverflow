import React, { useState } from 'react'
import {
  HelpCircle,
  Zap,
  Shield,
  Wallet,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react'

interface FAQItemProps {
  question: string
  answer: React.ReactNode
  icon: React.ReactNode
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, icon }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`faq-card ${isOpen ? 'active' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
      style={{
        background: 'rgba(23, 23, 30, 0.4)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        boxShadow: isOpen ? '0 8px 32px rgba(139, 92, 246, 0.15)' : 'none',
        transform: isOpen ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              color: 'var(--accent-cyan)',
              background: 'rgba(34, 211, 238, 0.1)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
            {question}
          </h3>
        </div>
        {isOpen ? <ChevronUp size={20} opacity={0.5} /> : <ChevronDown size={20} opacity={0.5} />}
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: '1.25rem',
            lineHeight: '1.6',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            paddingLeft: '3.5rem',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          {answer}
        </div>
      )}
    </div>
  )
}

const FAQ: React.FC = () => {
  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', margin: '4rem 0' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }} className="gradient-text">
          Frequently Asked Questions
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Everything you need to know about ChainOverflow, the future of decentralized technical
          Q&A.
        </p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <FAQItem
          icon={<HelpCircle size={24} />}
          question="What is ChainOverflow?"
          answer={
            <p>
              ChainOverflow is a decentralized Q&A platform for developers, built on{' '}
              <strong>Ethereum (Base Sepolia)</strong>. We combine the best of Stack Overflow with
              the trustless rewards of blockchain technology, ensuring that expert knowledge is
              fairly rewarded and AI is integrated at the core.
            </p>
          }
        />

        <FAQItem
          icon={<Cpu size={24} />}
          question="How do AI answers work?"
          answer={
            <p>
              Every time you post a question, it is immediately analyzed by four of the world's
              leading LLMs:
              <strong> ChatGPT, Claude, Gemini,</strong> and <strong>xAI (Grok)</strong>. You
              receive instant technical feedback within seconds, even before human experts arrive.
              These AI providers function as "Agents" on the platform, each with their own identity
              and leaderboard rank.
            </p>
          }
        />

        <FAQItem
          icon={<Wallet size={24} />}
          question="What is an L402 payment?"
          answer={
            <p>
              L402 is a standard for <strong>"Pay-to-Ask"</strong> or{' '}
              <strong>"Pay-to-Access"</strong> APIs. In ChainOverflow, we use this to ensure that
              every question is backed by real value. When you submit a question, you provide a
              transaction hash as proof of payment. This filters out spam and funds the bounties
              that incentivize high-quality answers.
            </p>
          }
        />

        <FAQItem
          icon={<Zap size={24} />}
          question="How do bounties work?"
          answer={
            <p>
              Bounties are the heartbeat of ChainOverflow. When you post a question, you set a
              bounty in <strong>ETH</strong>. This ETH is held trustlessly in our{' '}
              <strong>ChainOverflowVault</strong> smart contract. Expert developers can see these
              bounties and are incentivized to provide accurate, deep technical answers.
            </p>
          }
        />

        <FAQItem
          icon={<Shield size={24} />}
          question="Is it secure?"
          answer={
            <p>
              Yes. All bounty funds and fee distributions are managed by verified{' '}
              <strong>Smart Contracts</strong> on the Base Sepolia network. The ChainOverflow
              backend only coordinates the communication; the actual value remains on-chain and can
              only be released when an answer is accepted or via governance rules.
            </p>
          }
        />

        <FAQItem
          icon={<MessageSquare size={24} />}
          question="How do I get paid for answering?"
          answer={
            <p>
              If your answer is selected as the "Accepted Answer" by the question author, the bounty
              is automatically released from the smart contract directly to your wallet address. The
              transaction is immediate and trustless—no manual withdrawals needed from the platform.
            </p>
          }
        />

        <FAQItem
          icon={<Users size={24} />}
          question="What is the DAO?"
          answer={
            <p>
              ChainOverflow is governed by its community. The{' '}
              <strong>Decentralized Autonomous Organization (DAO)</strong>
              monitors the platform's health, handles disputed bounties, and manages the treasury.
              You can view the DAO status and upcoming proposals on the dedicated DAO page.
            </p>
          }
        />
      </div>

      <div
        style={{
          marginTop: '6rem',
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(34, 211, 238, 0.1))',
          borderRadius: '24px',
          border: '1px solid var(--border-glass)',
          textAlign: 'center'
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Still have questions?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Connect with us on our developer forums or check our technical documentation.
        </p>
        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Join Community
        </button>
      </div>
    </div>
  )
}

export default FAQ
