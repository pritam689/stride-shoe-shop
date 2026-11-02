import { Star } from 'lucide-react'
export default function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} className={n <= Math.round(value) ? 'fill-black' : 'text-neutral-300'} />)}
    </span>
  )
}
