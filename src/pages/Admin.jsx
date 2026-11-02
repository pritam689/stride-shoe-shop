import { useEffect, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { money, supabase } from '../lib/supabase'
import { useStore } from '../store'

const empty = { name: '', brand: '', description: '', category_id: '', price: '', discount_price: '', stock: '', sizes: '40,41,42,43,44', colors: 'Black,White', images: [], featured: false, best_seller: false }
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function Products() {
  const { toast } = useStore()
  const [list, setList] = useState([])
  const [cats, setCats] = useState([])
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)
  const load = async () => {
    const [a, b] = await Promise.all([supabase.from('products').select('*').order('created_at', { ascending: false }), supabase.from('categories').select('*')])
    setList(a.data || []); setCats(b.data || [])
  }
  useEffect(() => { load() }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const edit = (p) => setF({ ...p, sizes: p.sizes.join(','), colors: p.colors.join(','), discount_price: p.discount_price ?? '', category_id: p.category_id ?? '' })

  const upload = async (e) => {
    setBusy(true)
    const urls = []
    for (const file of e.target.files) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) { toast(error.message); break }
      urls.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl)
    }
    setF((x) => ({ ...x, images: [...x.images, ...urls] })); setBusy(false)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim() || !f.brand.trim() || !(+f.price > 0)) return toast('Name, brand and a price above 0 are required')
    if (f.discount_price !== '' && +f.discount_price >= +f.price) return toast('Discount price must be lower than the price')
    if (!f.images.length) return toast('Upload at least one image')
    const row = {
      name: f.name.trim(), brand: f.brand.trim(), description: f.description, category_id: +f.category_id || null, price: +f.price,
      discount_price: f.discount_price === '' ? null : +f.discount_price, stock: +f.stock || 0,
      sizes: f.sizes.split(',').map((s) => +s.trim()).filter(Boolean), colors: f.colors.split(',').map((s) => s.trim()).filter(Boolean),
      images: f.images, featured: f.featured, best_seller: f.best_seller,
    }
    setBusy(true)
    const { error } = f.id ? await supabase.from('products').update(row).eq('id', f.id) : await supabase.from('products').insert(row)
    setBusy(false)
    if (error) return toast(error.message)
    toast(f.id ? 'Product updated' : 'Product added'); setF(null); load()
  }

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    toast(error ? error.message : 'Product deleted'); load()
  }

  if (f) return (
    <form onSubmit={save} className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <h2 className="text-xl font-black sm:col-span-2">{f.id ? 'Edit product' : 'Add product'}</h2>
      <input value={f.name} onChange={set('name')} placeholder="Shoe name" aria-label="Shoe name" className="input" />
      <input value={f.brand} onChange={set('brand')} placeholder="Brand" aria-label="Brand" className="input" />
      <select value={f.category_id} onChange={set('category_id')} aria-label="Category" className="input"><option value="">Category</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input type="number" value={f.stock} onChange={set('stock')} placeholder="Stock" aria-label="Stock" min="0" className="input" />
      <input type="number" step="0.01" value={f.price} onChange={set('price')} placeholder="Price" aria-label="Price" className="input" />
      <input type="number" step="0.01" value={f.discount_price} onChange={set('discount_price')} placeholder="Discount price (optional)" aria-label="Discount price" className="input" />
      <input value={f.sizes} onChange={set('sizes')} placeholder="Sizes, comma separated" aria-label="Sizes" className="input" />
      <input value={f.colors} onChange={set('colors')} placeholder="Colours, comma separated" aria-label="Colours" className="input" />
      <textarea value={f.description} onChange={set('description')} rows={3} placeholder="Description" aria-label="Description" className="input sm:col-span-2" />
      <div className="flex gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={set('featured')} className="accent-black" />Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.best_seller} onChange={set('best_seller')} className="accent-black" />Best seller</label>
      </div>
      <div className="sm:col-span-2">
        <label className="btn-light cursor-pointer"><Upload size={16} />Upload images<input type="file" accept="image/*" multiple hidden onChange={upload} /></label>
        <div className="mt-3 flex flex-wrap gap-3">
          {f.images.map((src) => <div key={src} className="relative"><img src={src} alt="" className="h-20 w-20 rounded-xl bg-neutral-100 object-cover" /><button type="button" aria-label="Remove image" onClick={() => setF({ ...f, images: f.images.filter((x) => x !== src) })} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-black text-xs text-white">×</button></div>)}
        </div>
      </div>
      <div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="btn-dark">{busy ? 'Working…' : 'Save product'}</button><button type="button" onClick={() => setF(null)} className="btn-light">Cancel</button></div>
    </form>
  )

  return (
    <>
      <button onClick={() => setF({ ...empty })} className="btn-dark mb-4">Add new shoe</button>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-300 text-neutral-500"><tr><th className="py-2">Product</th><th>Price</th><th>Discount</th><th>Stock</th><th /></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100">
              <td className="flex items-center gap-3 py-3"><img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg bg-neutral-100 object-cover" /><span className="font-semibold">{p.name}<br /><span className="font-normal text-neutral-500">{p.brand}</span></span></td>
              <td>{money(p.price)}</td><td>{p.discount_price ? money(p.discount_price) : '-'}</td><td>{p.stock}</td>
              <td className="space-x-2 text-right"><button onClick={() => edit(p)} className="chip">Edit</button><button aria-label="Delete" onClick={() => del(p)} className="chip"><Trash2 size={14} /></button></td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  )
}

function Orders() {
  const { toast } = useStore()
  const [orders, setOrders] = useState([])
  const load = () => supabase.from('orders').select('*, profile:profiles(full_name,email), order_items(*)').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []))
  useEffect(() => { load() }, [])
  const update = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    toast(error ? error.message : 'Order status updated'); load()
  }
  if (!orders.length) return <p className="text-neutral-500">No orders yet.</p>
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-neutral-200 p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-bold">#{o.id.slice(0, 8)} · {money(o.total)}</p><p className="text-neutral-500">{o.profile?.full_name} ({o.profile?.email}) · {new Date(o.created_at).toLocaleString()}</p></div>
            <select value={o.status} onChange={(e) => update(o.id, e.target.value)} aria-label="Order status" className="input !w-auto capitalize">{statuses.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <p className="mt-2 text-neutral-600">Ship to: {o.shipping_address}</p>
          <ul className="mt-2 list-disc pl-5">{o.order_items.map((i) => <li key={i.id}>{i.quantity} × {i.name} (size {i.size}, {i.color})</li>)}</ul>
        </div>
      ))}
    </div>
  )
}

function Users() {
  const [users, setUsers] = useState([])
  useEffect(() => { supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data || [])) }, [])
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-neutral-300 text-neutral-500"><tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id} className="border-b border-neutral-100"><td className="py-3 font-semibold">{u.full_name || '-'}</td><td>{u.email}</td><td className="capitalize">{u.role}</td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('products')
  const View = { products: Products, orders: Orders, users: Users }[tab]
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight">Admin</h1>
      <div className="my-6 flex gap-2">{['products', 'orders', 'users'].map((t) => <button key={t} onClick={() => setTab(t)} className={`chip capitalize ${tab === t ? 'chip-on' : ''}`}>{t}</button>)}</div>
      <View />
    </section>
  )
}
