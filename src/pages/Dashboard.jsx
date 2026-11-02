import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { money, supabase } from '../lib/supabase'
import { useStore } from '../store'

const tabs = [['profile', 'Profile'], ['orders', 'Orders'], ['wishlist', 'Wishlist'], ['password', 'Password']]
const steps = ['pending', 'processing', 'shipped', 'delivered']

function Profile() {
  const { user, profile, setProfile, toast } = useStore()
  const [f, setF] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', address: profile?.address || '' })
  const save = async (e) => {
    e.preventDefault()
    if (f.full_name.trim().length < 2) return toast('Enter your full name')
    const { data, error } = await supabase.from('profiles').update(f).eq('id', user.id).select().single()
    if (error) return toast(error.message)
    setProfile(data); toast('Profile saved')
  }
  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <label className="block"><span className="mb-1 block text-sm font-semibold">Email</span><input value={user.email} disabled className="input bg-neutral-100" /></label>
      {[['full_name', 'Full name'], ['phone', 'Phone'], ['address', 'Delivery address']].map(([k, l]) => (
        <label key={k} className="block"><span className="mb-1 block text-sm font-semibold">{l}</span><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input" /></label>
      ))}
      <button className="btn-dark">Save changes</button>
    </form>
  )
}

function Password() {
  const { toast } = useStore()
  const [p, setP] = useState({ a: '', b: '' })
  const save = async (e) => {
    e.preventDefault()
    if (p.a.length < 8 || !/\d/.test(p.a) || !/[a-zA-Z]/.test(p.a)) return toast('Use at least 8 characters with letters and numbers')
    if (p.a !== p.b) return toast('Passwords do not match')
    const { error } = await supabase.auth.updateUser({ password: p.a })
    toast(error ? error.message : 'Password updated'); if (!error) setP({ a: '', b: '' })
  }
  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <input type="password" value={p.a} onChange={(e) => setP({ ...p, a: e.target.value })} placeholder="New password" aria-label="New password" autoComplete="new-password" className="input" />
      <input type="password" value={p.b} onChange={(e) => setP({ ...p, b: e.target.value })} placeholder="Confirm new password" aria-label="Confirm new password" autoComplete="new-password" className="input" />
      <button className="btn-dark">Change password</button>
    </form>
  )
}

function Orders() {
  const { user } = useStore()
  const [orders, setOrders] = useState(null)
  useEffect(() => { supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data || [])) }, [])
  if (!orders) return <p className="text-neutral-500">Loading…</p>
  if (!orders.length) return <p className="text-neutral-500">No orders yet. Your orders will show up here.</p>
  return (
    <div className="space-y-6">
      {orders.map((o) => {
        const at = steps.indexOf(o.status)
        return (
          <div key={o.id} className="rounded-2xl border border-neutral-200 p-5">
            <div className="flex flex-wrap justify-between gap-2 text-sm"><p className="font-bold">Order #{o.id.slice(0, 8)}</p><p>{new Date(o.created_at).toLocaleDateString()} · {money(o.total)}</p></div>
            {o.status === 'cancelled' ? <p className="mt-4 font-bold">Cancelled</p> : (
              <ol className="mt-4 grid grid-cols-4 gap-2 text-center text-xs capitalize">
                {steps.map((s, i) => <li key={s}><div className={`mb-1 h-1.5 rounded-full transition ${i <= at ? 'bg-black' : 'bg-neutral-200'}`} />{s}</li>)}
              </ol>
            )}
            <ul className="mt-4 space-y-3">
              {o.order_items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 text-sm">
                  <img src={i.image} alt="" className="h-14 w-14 rounded-xl bg-neutral-100 object-cover" />
                  <span className="flex-1">{i.name}<br /><span className="text-neutral-500">Size {i.size} · {i.color} · Qty {i.quantity}</span></span><span>{money(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function Wishlist() {
  const { user, wish } = useStore()
  const [items, setItems] = useState([])
  useEffect(() => { supabase.from('wishlists').select('product:products(*)').eq('user_id', user.id).then(({ data }) => setItems((data || []).map((r) => r.product).filter(Boolean))) }, [wish.length])
  if (!items.length) return <p className="text-neutral-500">Your wishlist is empty. Tap the heart on any shoe to save it.</p>
  return <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
}

export default function Dashboard() {
  const { profile, logout } = useStore()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') || 'profile'
  const View = { profile: Profile, orders: Orders, wishlist: Wishlist, password: Password }[tab] || Profile
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight">Hi, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
        <button onClick={async () => { await logout(); nav('/') }} className="btn-light">Log out</button>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">{tabs.map(([k, l]) => <button key={k} onClick={() => setSp({ tab: k })} className={`chip whitespace-nowrap ${tab === k ? 'chip-on' : ''}`}>{l}</button>)}</div>
      <View />
    </section>
  )
}
