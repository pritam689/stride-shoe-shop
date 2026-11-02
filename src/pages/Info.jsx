import { Link, useParams } from 'react-router-dom'

const pages = {
  about: ['About Us', 'STRIDE started with a simple idea: good shoes should look sharp, feel great and be easy to buy. We stock performance, street and everyday styles from brands we trust, and we test what we sell.'],
  contact: ['Contact Us', 'Questions about an order or a fit? Email support@stride.example or call +44 000 000 0000, Monday to Friday, 9am to 5pm.'],
  privacy: ['Privacy Policy', 'We collect only what we need to process your orders: your name, email, address and order history. We never sell your data. You can edit your details or ask us to delete your account at any time.'],
  terms: ['Terms and Conditions', 'By placing an order you agree to pay the listed price and provide accurate delivery details. Prices and stock can change. Replace this sample text with your own legal terms before launch.'],
  shipping: ['Shipping Information', 'Standard delivery takes 3 to 5 working days and is free on orders over $100. Express delivery takes 1 to 2 working days. Unworn shoes can be returned within 30 days.'],
}

export default function Info() {
  const [title, body] = pages[useParams().slug] || ['Page not found', 'We could not find that page.']
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>
      <p className="mt-6 leading-relaxed text-neutral-700">{body}</p>
      <Link to="/shop" className="btn-dark mt-8">Continue shopping</Link>
    </section>
  )
}
