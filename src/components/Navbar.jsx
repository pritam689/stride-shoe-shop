import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useStore } from '../store'

const links = [['Shop', '/shop'], ["Men's", '/shop?category=mens'], ["Women's", '/shop?category=womens'], ['Sports', '/shop?category=sports'], ['Sneakers', '/shop?category=sneakers']]

function SearchBox({ className = '', onDone }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form role="search" className={`relative ${className}`} onSubmit={(e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q.trim())}`); onDone?.() }}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shoes" aria-label="Search shoes" className="w-full rounded-full bg-neutral-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-neutral-200" />
    </form>
  )
}

export default function Navbar() {
  const { user, profile, count, wish } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <Link to="/" className="text-lg font-black tracking-tight whitespace-nowrap">PRITAM BRANDY SHOES</Link>
        <nav className="hidden gap-6 text-sm font-semibold md:flex">
          {links.map(([t, to]) => <NavLink key={t} to={to} className="transition hover:text-neutral-500">{t}</NavLink>)}
        </nav>
        <SearchBox className="ml-auto hidden w-56 lg:block" />
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link to={user ? '/dashboard?tab=wishlist' : '/login'} aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100">
            <Heart size={20} />{wish.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-black" />}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100">
            <ShoppingBag size={20} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] font-bold text-white">{count}</span>}
          </Link>
          {user ? (
            <Link to="/dashboard" className="ml-1 flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition hover:bg-neutral-100"><User size={20} /><span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] || 'Account'}</span></Link>
          ) : (
            <Link to="/login" className="btn-dark ml-1 !px-5 !py-2">Log in</Link>
          )}
          {profile?.role === 'admin' && <Link to="/admin" className="btn-light ml-1 hidden !px-4 !py-2 sm:inline-flex">Admin</Link>}
        </div>
      </div>
      {open && (
        <div className="space-y-4 border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          <SearchBox onDone={() => setOpen(false)} />
          {links.map(([t, to]) => <NavLink key={t} to={to} onClick={() => setOpen(false)} className="block text-lg font-bold">{t}</NavLink>)}
        </div>
      )}
    </header>
  )
}
