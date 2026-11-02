import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Stars from './Stars'
import { useStore } from '../store'
import { money } from '../lib/supabase'

export default function ProductCard({ p }) {
  const { wish, toggleWish, addToCart } = useStore()
  const pct = p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0
  return (
    <article className="group animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
        <Link to={`/product/${p.id}`}>
          <img src={p.images?.[0]} alt={p.name} loading="lazy" className="aspect-square w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-110" />
        </Link>
        {pct > 0 && <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">-{pct}%</span>}
        {p.stock < 1 && <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold">Sold out</span>}
        <button aria-label="Toggle wishlist" onClick={() => toggleWish(p)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow transition hover:scale-110">
          <Heart size={18} className={wish.includes(p.id) ? 'fill-black' : ''} />
        </button>
        <button disabled={p.stock < 1} onClick={() => addToCart(p, p.sizes?.[0], p.colors?.[0], 1)} className="absolute inset-x-3 bottom-3 rounded-full bg-black py-3 text-sm font-bold text-white transition duration-300 hover:bg-neutral-700 md:translate-y-16 md:group-hover:translate-y-0">
          Add to Cart
        </button>
      </div>
      <Link to={`/product/${p.id}`} className="mt-3 block">
        <p className="text-xs text-neutral-500">{p.brand}</p>
        <h3 className="font-bold">{p.name}</h3>
        <div className="mt-1 flex items-center gap-2"><Stars value={p.rating} /><span className="text-xs text-neutral-500">{p.rating}</span></div>
        <p className="mt-1 text-sm">
          <span className="font-bold">{money(p.discount_price ?? p.price)}</span>
          {pct > 0 && <span className="ml-2 text-neutral-400 line-through">{money(p.price)}</span>}
        </p>
      </Link>
    </article>
  )
}
