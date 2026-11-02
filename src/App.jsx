import { Outlet, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useStore } from './store'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Info from './pages/Info'

function Protected({ admin, children }) {
  const { user, profile, loading } = useStore()
  const loc = useLocation()
  if (loading) return <div className="py-32 text-center text-neutral-500">Loading…</div>
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (admin && profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Layout() {
  const { pathname } = useLocation()
  const { note } = useStore()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <div aria-live="polite" className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-xl transition duration-300 ${note ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>{note}</div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="reset" element={<Auth mode="reset" />} />
        <Route path="info/:slug" element={<Info />} />
        <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="admin" element={<Protected admin><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
