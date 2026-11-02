import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const pages = [['About Us', 'about'], ['Contact Us', 'contact'], ['Privacy Policy', 'privacy'], ['Terms and Conditions', 'terms'], ['Shipping Information', 'shipping']]
const socials = [[Instagram, 'Instagram'], [Facebook, 'Facebook'], [Twitter, 'Twitter'], [Youtube, 'YouTube']]

export default function Footer() {
  return (
    <footer className="mt-24 bg-black text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-2xl font-black tracking-tighter text-white" style={{ fontStretch: '125%' }}>STRIDE</p>
          <p className="mt-3 max-w-xs text-sm">Shoes for every step: sport, street and everything in between.</p>
          <div className="mt-5 flex gap-3">
            {socials.map(([Icon, n]) => <a key={n} href="#" aria-label={n} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-700 transition hover:bg-white hover:text-black"><Icon size={18} /></a>)}
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="font-bold text-white">Help</li>
          {pages.map(([t, s]) => <li key={s}><Link to={`/info/${s}`} className="transition hover:text-white">{t}</Link></li>)}
        </ul>
        <ul className="space-y-2 text-sm">
          <li className="font-bold text-white">Shop</li>
          <li><Link to="/shop" className="hover:text-white">All shoes</Link></li>
          <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
          <li><Link to="/dashboard" className="hover:text-white">My account</Link></li>
        </ul>
      </div>
      <p className="border-t border-neutral-800 py-5 text-center text-xs">© {new Date().getFullYear()} STRIDE. All rights reserved.</p>
    </footer>
  )
}
