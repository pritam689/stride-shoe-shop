import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'

const Field = ({ label, error, children }) => (
  <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span>{children}{error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}</label>
)

export default function Auth({ mode }) {
  const nav = useNavigate(), loc = useLocation(), { toast } = useStore()
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '', remember: true })
  const [err, setErr] = useState({})
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const validate = () => {
    const e = {}
    if (mode === 'register' && v.name.trim().length < 2) e.name = 'Enter your full name'
    if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address'
    if (!forgot) {
      if (mode === 'login' && !v.password) e.password = 'Enter your password'
      if (mode !== 'login') {
        if (v.password.length < 8 || !/\d/.test(v.password) || !/[a-zA-Z]/.test(v.password)) e.password = 'Use at least 8 characters with letters and numbers'
        if (v.confirm !== v.password) e.confirm = 'Passwords do not match'
      }
    }
    setErr(e); return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault(); setMsg('')
    if (!validate()) return
    setBusy(true)
    let error
    if (forgot) {
      ;({ error } = await supabase.auth.resetPasswordForEmail(v.email, { redirectTo: `${window.location.origin}/reset` }))
      if (!error) setMsg('Check your email for a link to reset your password.')
    } else if (mode === 'login') {
      ;({ error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password }))
      if (!error) {
        if (v.remember) localStorage.removeItem('no_remember'); else { localStorage.setItem('no_remember', '1'); sessionStorage.setItem('alive', '1') }
        nav(loc.state?.from || '/dashboard')
      }
    } else if (mode === 'register') {
      const r = await supabase.auth.signUp({ email: v.email, password: v.password, options: { data: { full_name: v.name.trim() } } })
      error = r.error
      if (!error) { if (r.data.session) nav('/dashboard'); else setMsg('Account created. Confirm your email, then log in.') }
    } else {
      ;({ error } = await supabase.auth.updateUser({ password: v.password }))
      if (!error) { toast('Password updated'); nav('/dashboard') }
    }
    if (error) setErr({ form: error.message })
    setBusy(false)
  }

  const google = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
  const title = forgot ? 'Reset password' : { login: 'Welcome back', register: 'Create account', reset: 'Choose a new password' }[mode]
  const pwInput = (key, label, autoComplete) => (
    <Field label={label} error={err[key]}>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={v[key]} onChange={set(key)} autoComplete={autoComplete} className="input pr-12" />
        <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </Field>
  )

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>
      <form onSubmit={submit} noValidate className="mt-8 space-y-4 animate-fade-up">
        {err.form && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err.form}</p>}
        {msg && <p role="status" className="rounded-xl bg-neutral-100 p-3 text-sm">{msg}</p>}
        {mode === 'register' && <Field label="Full name" error={err.name}><input value={v.name} onChange={set('name')} autoComplete="name" className="input" /></Field>}
        {mode !== 'reset' && <Field label="Email address" error={err.email}><input type="email" value={v.email} onChange={set('email')} autoComplete="email" className="input" /></Field>}
        {!forgot && pwInput('password', mode === 'reset' ? 'New password' : 'Password', mode === 'login' ? 'current-password' : 'new-password')}
        {!forgot && mode !== 'login' && pwInput('confirm', 'Confirm password', 'new-password')}
        {mode === 'login' && !forgot && (
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={v.remember} onChange={set('remember')} className="accent-black" />Remember me</label>
            <button type="button" onClick={() => { setForgot(true); setErr({}) }} className="font-semibold underline">Forgot password?</button>
          </div>
        )}
        <button disabled={busy} className="btn-dark w-full">{busy ? 'Please wait…' : forgot ? 'Send reset link' : { login: 'Log in', register: 'Create Account', reset: 'Update password' }[mode]}</button>
      </form>
      {mode !== 'reset' && !forgot && (
        <>
          <button onClick={google} className="btn-light mt-4 w-full">Continue with Google</button>
          <p className="mt-6 text-center text-sm">
            {mode === 'login' ? <>New to STRIDE? <Link to="/register" className="font-bold underline">Create an account</Link></> : <>Already have an account? <Link to="/login" className="font-bold underline">Log in</Link></>}
          </p>
        </>
      )}
      {forgot && <button onClick={() => setForgot(false)} className="mt-6 block w-full text-center text-sm font-bold underline">Back to log in</button>}
    </section>
  )
}
