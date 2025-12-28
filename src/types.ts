export interface Question {
  id: number
  title: string
  content: string
  tags: string[]
  author: string
  votes: number
  answers: number
  bounty?: string
  timestamp: string
  ipfsHash?: string
}
