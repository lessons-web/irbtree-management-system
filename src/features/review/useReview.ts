import { useContext } from 'react'
import { ReviewContext } from './reviewContext'

export function useReview() {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('ReviewProvider is missing')
  return ctx
}
