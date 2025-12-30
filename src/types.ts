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

export interface Answer {
  id: number
  questionId: number
  content: string
  author: string
  votes: number
  timestamp: string
  isAccepted?: boolean
}
