import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { money, supabase, unitPrice } from '../lib/supabase'
import { useStore } from '../store'

export default function Cart() {
  const { user, profile, cart, subtotal, setQty, removeItem, loadCart, toast } = useStore()
  const nav = useNavigate()
  const [address, setAddress] = useState(profile?.address || '')
  const [busy, setBusy] = useState(false)
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 6.99

  const checkout = async () => {
    if (!user) return nav('/login', { state: { from: '/cart' } })
    if (address.trim().length < 8) return toast('Enter your delivery address')
    setBusy(true)
    const { error } = await supabase.rpc('place_order', { p_address: address.trim() })
    setBusy(false)
    if (error) return toast(error.message)
    await loadCart(user.id)
    toast('Order placed! Track it in your account')
    nav('/dashboard?tab=orders')
  }

  if (cart.length === 0) return (
    <section className="py-32 text-center"><h1 className="text-3xl font-black">Your cart is empty</h1><p className="mt-2 text-neutral-500">Find your next pair and add it here.</p><Link to="/shop" className="btn-dark mt-6">Shop shoes</Link></section>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl font-black tracking-tight">Your cart</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-neutral-200">
          {cart.map((i, k) => (
            <li key={i.id || k} className="flex gap-4 py-5">
              <Link to={`/product/${i.product.id}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-100"><img src={i.product.images[0]} alt="" className="h-full w-full object-cover mix-blend-multiply" /></Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2"><h2 className="font-bold">{i.product.name}</h2><p className="font-bold">{money(unitPrice(i.product) * i.quantity)}</p></div>
                <p className="text-sm text-neutral-500">Size {i.size} · {i.color} · {money(unitPrice(i.product))} each</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-neutral-300">
                    <button aria-label="Decrease" className="grid h-9 w-9 place-items-center" onClick={() => setQty(i, i.quantity - 1)}><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-bold">{i.quantity}</span>
                    <button aria-label="Increase" className="grid h-9 w-9 place-items-center" onClick={() => setQty(i, i.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(i)} className="flex items-center gap-1 text-sm text-neutral-500 transition hover:text-black"><Trash2 size={16} />Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-4 rounded-3xl bg-neutral-100 p-6">
          <h2 className="text-xl font-black">Order summary</h2>
          <p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></p>
          <p className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></p>
          <p className="flex justify-between border-t border-neutral-300 pt-4 text-lg font-black"><span>Total</span><span>{money(subtotal + shipping)}</span></p>
          {user && <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Delivery address" aria-label="Delivery address" className="input" />}
          <button disabled={busy} onClick={checkout} className="btn-dark w-full">{user ? (busy ? 'Placing order…' : 'Checkout') : 'Log in to check out'}</button>
          <p className="text-xs text-neutral-500">Final prices and stock are confirmed on our server when you check out. Online payment is not connected yet.</p>
        </aside>
      </div>
    </section>
  )
}
