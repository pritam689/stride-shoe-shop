import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, unitPrice } from './lib/supabase'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const guestCart = () => { try { return JSON.parse(localStorage.getItem('guest_cart') || '[]') } catch { return [] } }

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(guestCart)
  const [wish, setWish] = useState([])
  const [note, setNote] = useState('')

  const toast = useCallback((m) => { setNote(m); setTimeout(() => setNote(''), 2600) }, [])

  const loadCart = async (uid) => {
    const { data } = await supabase.from('cart_items').select('id,size,color,quantity,product:products(*)').eq('user_id', uid).order('id')
    setCart((data || []).filter((i) => i.product))
  }

  const init = async (u) => {
    setUser(u)
    if (!u) { setProfile(null); setWish([]); setCart(guestCart()); setLoading(false); return }
    const [{ data: prof }, { data: w }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', u.id).single(),
      supabase.from('wishlists').select('product_id').eq('user_id', u.id),
    ])
    setProfile(prof); setWish((w || []).map((r) => r.product_id))
    // merge a guest cart into the account cart once after login
    const g = guestCart()
    if (g.length) {
      localStorage.removeItem('guest_cart')
      const { data: ex } = await supabase.from('cart_items').select('product_id,size,color,quantity').eq('user_id', u.id)
      for (const i of g) {
        const same = (ex || []).find((e) => e.product_id === i.product.id && e.size === i.size && e.color === i.color)
        await supabase.from('cart_items').upsert(
          { user_id: u.id, product_id: i.product.id, size: i.size, color: i.color, quantity: i.quantity + (same?.quantity || 0) },
          { onConflict: 'user_id,product_id,size,color' })
      }
    }
    await loadCart(u.id)
    setLoading(false)
  }

  useEffect(() => {
    // "Remember me" unticked: end the session when the browser was closed
    if (localStorage.getItem('no_remember') && !sessionStorage.getItem('alive')) {
      localStorage.removeItem('no_remember'); supabase.auth.signOut()
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return
      setTimeout(() => init(session?.user ?? null), 0) // avoid calling supabase inside the auth callback
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (!user) localStorage.setItem('guest_cart', JSON.stringify(cart)) }, [cart, user])

  const addToCart = async (product, size, color, qty = 1) => {
    if (product.stock < 1) return toast('Sorry, this shoe is out of stock')
    const ex = cart.find((i) => i.product.id === product.id && i.size === size && i.color === color)
    const quantity = Math.min((ex?.quantity || 0) + qty, product.stock)
    if (user) {
      const { error } = await supabase.from('cart_items').upsert(
        { user_id: user.id, product_id: product.id, size, color, quantity }, { onConflict: 'user_id,product_id,size,color' })
      if (error) return toast(error.message)
      await loadCart(user.id)
    } else setCart((c) => (ex ? c.map((i) => (i === ex ? { ...i, quantity } : i)) : [...c, { product, size, color, quantity }]))
    toast(`Added ${product.name} (size ${size}) to your cart`)
  }

  const setQty = async (item, q) => {
    if (q < 1) return removeItem(item)
    q = Math.min(q, item.product.stock)
    if (user) { await supabase.from('cart_items').update({ quantity: q }).eq('id', item.id); await loadCart(user.id) }
    else setCart((c) => c.map((i) => (i === item ? { ...i, quantity: q } : i)))
  }

  const removeItem = async (item) => {
    if (user) { await supabase.from('cart_items').delete().eq('id', item.id); await loadCart(user.id) }
    else setCart((c) => c.filter((i) => i !== item))
  }

  const toggleWish = async (p) => {
    if (!user) return toast('Log in to save shoes to your wishlist')
    const on = wish.includes(p.id)
    setWish((w) => (on ? w.filter((x) => x !== p.id) : [...w, p.id]))
    const q = on ? supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', p.id) : supabase.from('wishlists').insert({ user_id: user.id, product_id: p.id })
    const { error } = await q
    if (error) { toast(error.message); setWish((w) => (on ? [...w, p.id] : w.filter((x) => x !== p.id))) }
  }

  const logout = async () => { await supabase.auth.signOut(); toast('You are logged out') }

  const count = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + unitPrice(i.product) * i.quantity, 0)

  return (
    <Ctx.Provider value={{ user, profile, setProfile, loading, cart, count, subtotal, wish, addToCart, setQty, removeItem, toggleWish, loadCart, logout, toast, note }}>
      {children}
    </Ctx.Provider>
  )
}
