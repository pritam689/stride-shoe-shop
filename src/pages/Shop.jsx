import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { supabase, unitPrice } from '../lib/supabase'

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ size: '', color: '', brand: '', max: 300, sort: 'new' })
  const q = sp.get('q') || '', cat = sp.get('category') || ''

  useEffect(() => {
    Promise.all([supabase.from('products').select('*, category:categories(name,slug)'), supabase.from('categories').select('*').order('id')])
      .then(([a, b]) => { setProducts(a.data || []); setCats(b.data || []); setLoading(false) })
  }, [])

  const setParam = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n) }
  const uniq = (arr) => [...new Set(arr)]
  const brands = uniq(products.map((p) => p.brand))
  const sizes = uniq(products.flatMap((p) => p.sizes)).sort((a, b) => a - b)
  const colors = uniq(products.flatMap((p) => p.colors))
  const maxPrice = Math.ceil(Math.max(300, ...products.map((p) => p.price)))

  const list = products
    .filter((p) => (!cat || p.category?.slug === cat)
      && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))
      && (!f.size || p.sizes.includes(+f.size)) && (!f.color || p.colors.includes(f.color))
      && (!f.brand || p.brand === f.brand) && unitPrice(p) <= f.max)
    .sort((a, b) => f.sort === 'low' ? unitPrice(a) - unitPrice(b) : f.sort === 'high' ? unitPrice(b) - unitPrice(a) : new Date(b.created_at) - new Date(a.created_at))

  const clear = () => { setF({ size: '', color: '', brand: '', max: maxPrice, sort: 'new' }); setSp({}) }
  const Group = ({ title, children }) => <div><h3 className="mb-2 text-sm font-bold">{title}</h3><div className="flex flex-wrap gap-2">{children}</div></div>
  const Chip = ({ on, ...p }) => <button {...p} className={`chip ${on ? 'chip-on' : ''}`} />

  const filters = (
    <div className="space-y-6">
      <Group title="Category">
        <Chip on={!cat} onClick={() => setParam('category', '')}>All</Chip>
        {cats.map((c) => <Chip key={c.id} on={cat === c.slug} onClick={() => setParam('category', c.slug)}>{c.name}</Chip>)}
      </Group>
      <Group title="Size">{sizes.map((s) => <Chip key={s} on={+f.size === s} onClick={() => setF({ ...f, size: +f.size === s ? '' : s })}>{s}</Chip>)}</Group>
      <Group title="Colour">{colors.map((c) => <Chip key={c} on={f.color === c} onClick={() => setF({ ...f, color: f.color === c ? '' : c })}>{c}</Chip>)}</Group>
      <Group title="Brand">{brands.map((b) => <Chip key={b} on={f.brand === b} onClick={() => setF({ ...f, brand: f.brand === b ? '' : b })}>{b}</Chip>)}</Group>
      <div>
        <h3 className="mb-2 text-sm font-bold">Max price: ${Math.min(f.max, maxPrice)}</h3>
        <input type="range" min="20" max={maxPrice} value={Math.min(f.max, maxPrice)} onChange={(e) => setF({ ...f, max: +e.target.value })} className="w-full accent-black" aria-label="Maximum price" />
      </div>
      <button onClick={clear} className="btn-light w-full">Clear filters</button>
    </div>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-3xl font-black tracking-tight">{q ? `Results for "${q}"` : cats.find((c) => c.slug === cat)?.name || 'All shoes'}</h1>
        <input value={q} onChange={(e) => setParam('q', e.target.value)} placeholder="Search shoes" aria-label="Search shoes" className="input !w-48 !rounded-full" />
        <select value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} aria-label="Sort" className="input !w-auto !rounded-full">
          <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
        </select>
        <button className="btn-light lg:hidden" onClick={() => setOpen(!open)}><SlidersHorizontal size={16} />Filters</button>
      </div>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className={`${open ? 'block' : 'hidden'} lg:block`}>{filters}</aside>
        <div>
          <p className="mb-4 text-sm text-neutral-500">{list.length} {list.length === 1 ? 'shoe' : 'shoes'}</p>
          {loading ? <p className="py-20 text-center text-neutral-500">Loading…</p> : list.length === 0 ? (
            <div className="py-20 text-center"><p className="font-bold">No shoes match your filters</p><button onClick={clear} className="btn-dark mt-4">Clear filters</button></div>
          ) : <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
        </div>
      </div>
    </section>
  )
}
