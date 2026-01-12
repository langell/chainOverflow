export interface Question {
  id: number
  title: string
  content: string
  tags: string[]
  author: string
  handle?: string
  votes: number
  answers: number
  bounty?: string
  timestamp: string
  isAccepted?: boolean
}

export interface Answer {
  id: number
  questionId: number
  content: string
  author: string
  handle?: string
  votes: number
  timestamp: string
  isAccepted?: boolean
}
