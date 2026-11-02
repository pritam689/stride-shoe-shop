import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, Plus } from 'lucide-react'
import Stars from '../components/Stars'
import { money, supabase } from '../lib/supabase'
import { useStore } from '../store'

export default function Product() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, profile, addToCart, wish, toggleWish, toast } = useStore()
  const [p, setP] = useState(null)
  const [reviews, setReviews] = useState([])
  const [img, setImg] = useState(0)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [qty, setQty] = useState(1)
  const [r, setR] = useState({ rating: 5, comment: '' })

  const loadReviews = () => supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }).then(({ data }) => setReviews(data || []))
  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => { setP(data); setColor(data?.colors?.[0] || null) })
    loadReviews()
  }, [id])

  if (!p) return <p className="py-32 text-center text-neutral-500">Loading…</p>
  const pct = p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0

  const add = async (go) => {
    if (!size) return toast('Please select a size')
    await addToCart(p, size, color, qty)
    if (go) nav('/cart')
  }
  const submitReview = async (e) => {
    e.preventDefault()
    if (r.comment.trim().length < 3) return toast('Write a short review first')
    const { error } = await supabase.from('reviews').insert({ product_id: id, user_id: user.id, author: profile?.full_name || 'Customer', rating: +r.rating, comment: r.comment.trim() })
    if (error) return toast(error.message)
    setR({ rating: 5, comment: '' }); loadReviews(); toast('Thanks for your review!')
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-neutral-100"><img src={p.images[img]} alt={p.name} className="aspect-square w-full object-cover mix-blend-multiply" /></div>
          <div className="mt-3 flex gap-3">
            {p.images.map((src, i) => <button key={src} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-neutral-100 transition ${i === img ? 'border-black' : 'border-transparent hover:border-neutral-400'}`}><img src={src} alt="" className="h-full w-full object-cover mix-blend-multiply" /></button>)}
          </div>
        </div>
        <div>
          <p className="text-sm text-neutral-500">{p.brand}</p>
          <h1 className="text-4xl font-black tracking-tight">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2"><Stars value={p.rating} size={16} /><span className="text-sm text-neutral-500">{p.rating} ({reviews.length} reviews)</span></div>
          <p className="mt-4 text-2xl">
            <span className="font-black">{money(p.discount_price ?? p.price)}</span>
            {pct > 0 && <><span className="ml-3 text-neutral-400 line-through">{money(p.price)}</span><span className="ml-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">Save {pct}%</span></>}
          </p>
          <p className="mt-4 text-neutral-700">{p.description}</p>

          <h2 className="mt-6 mb-2 text-sm font-bold">Colour: {color}</h2>
          <div className="flex flex-wrap gap-2">{p.colors.map((c) => <button key={c} onClick={() => setColor(c)} className={`chip ${c === color ? 'chip-on' : ''}`}>{c}</button>)}</div>
          <h2 className="mt-6 mb-2 text-sm font-bold">Size</h2>
          <div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`chip min-w-12 ${s === size ? 'chip-on' : ''}`}>{s}</button>)}</div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-neutral-300">
              <button aria-label="Decrease" className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button aria-label="Increase" className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus size={16} /></button>
            </div>
            <span className="text-sm text-neutral-500">{p.stock > 0 ? (p.stock < 10 ? `Only ${p.stock} left` : 'In stock') : 'Sold out'}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={p.stock < 1} onClick={() => add(false)} className="btn-dark flex-1">Add to Cart</button>
            <button disabled={p.stock < 1} onClick={() => add(true)} className="btn-light flex-1">Buy Now</button>
            <button aria-label="Toggle wishlist" onClick={() => toggleWish(p)} className="btn-light !px-4"><Heart size={18} className={wish.includes(p.id) ? 'fill-black' : ''} /></button>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-black tracking-tight">Customer reviews</h2>
        {reviews.length === 0 && <p className="mt-3 text-neutral-500">No reviews yet. Be the first to review this shoe.</p>}
        <div className="mt-4 space-y-4">{reviews.map((v) => <div key={v.id} className="rounded-2xl bg-neutral-100 p-5"><Stars value={v.rating} /><p className="mt-2">{v.comment}</p><p className="mt-2 text-sm font-bold">{v.author}</p></div>)}</div>
        {user ? (
          <form onSubmit={submitReview} className="mt-6 space-y-3">
            <select value={r.rating} onChange={(e) => setR({ ...r, rating: e.target.value })} aria-label="Rating" className="input !w-auto">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
            <textarea value={r.comment} onChange={(e) => setR({ ...r, comment: e.target.value })} rows={3} placeholder="How did they fit and feel?" className="input" />
            <button className="btn-dark">Post review</button>
          </form>
        ) : <p className="mt-6 text-sm text-neutral-500">Log in to write a review.</p>}
      </div>
    </section>
  )
}
