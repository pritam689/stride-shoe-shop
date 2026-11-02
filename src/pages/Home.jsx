import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import Stars from '../components/Stars'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'

const cats = [
  ["Men's Shoes", 'mens', 'photo-1460353581641-37baddab0fa2'],
  ["Women's Shoes", 'womens', 'photo-1600185365926-3a2ce3cdb9eb'],
  ['Sports Shoes', 'sports', 'photo-1542291026-7eec264c27ff'],
  ['Sneakers', 'sneakers', 'photo-1549298916-b41d501d3772'],
  ['Casual Shoes', 'casual', 'photo-1491553895911-0055eca6402d'],
]
const reviews = [
  ['Amira K.', 'The Aero Runners felt great from the first run. Delivery took two days and the size guide was spot on.'],
  ['Daniel R.', 'Clean designs and honest prices. I have bought three pairs and the quality has been the same each time.'],
  ['Sofia M.', 'Easy returns and friendly support. My Cloud Steps are now my everyday shoes.'],
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [email, setEmail] = useState('')
  const { toast } = useStore()
  useEffect(() => { supabase.from('products').select('*').then(({ data }) => setProducts(data || [])) }, [])

  const subscribe = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Enter a valid email address')
    const { error } = await supabase.from('newsletter_subscribers').insert({ email })
    toast(error ? (error.code === '23505' ? 'You are already subscribed' : error.message) : 'Thanks for subscribing!')
    if (!error) setEmail('')
  }

  return (
    <>
      <section className="overflow-hidden bg-neutral-100">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <h1 className="text-6xl font-black leading-[0.9] tracking-tighter sm:text-7xl lg:text-8xl" style={{ fontStretch: '125%' }}>STEP INTO STYLE</h1>
            <p className="mt-6 max-w-md text-lg text-neutral-600">Discover the perfect shoes for every step.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="btn-dark">Shop Now</Link>
              <Link to="/shop?category=sneakers" className="btn-light">Sneakers</Link>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85" alt="Red running shoe" className="mx-auto w-full max-w-xl animate-float mix-blend-multiply" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm font-semibold sm:grid-cols-3 sm:px-6">
        {[[Truck, 'Free delivery over $100'], [RotateCcw, '30-day returns'], [ShieldCheck, 'Secure checkout']].map(([I, t]) => <p key={t} className="flex items-center gap-3"><I size={20} />{t}</p>)}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-3xl font-black tracking-tight">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {cats.map(([n, s, img]) => (
            <Link key={s} to={`/shop?category=${s}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200">
              <img src={`https://images.unsplash.com/${img}?w=600&q=80`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 font-bold text-white">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      {[['Featured', 'featured'], ['Best sellers', 'best_seller']].map(([title, key]) => (
        <section key={key} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-end justify-between"><h2 className="text-3xl font-black tracking-tight">{title}</h2><Link to="/shop" className="text-sm font-semibold underline">View all</Link></div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">{products.filter((p) => p[key]).slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      ))}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-3xl font-black tracking-tight">What customers say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map(([n, t]) => (
            <figure key={n} className="rounded-2xl bg-neutral-100 p-6 transition hover:-translate-y-1">
              <Stars value={5} /><blockquote className="mt-3 text-neutral-700">{t}</blockquote><figcaption className="mt-4 font-bold">{n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-black px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-black tracking-tight">Get 10% off your first order</h2>
          <p className="mt-2 text-neutral-400">Join our newsletter for new drops and offers.</p>
          <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" aria-label="Email address" className="input flex-1 !rounded-full text-black" />
            <button className="btn bg-white text-black hover:bg-neutral-300">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  )
}
