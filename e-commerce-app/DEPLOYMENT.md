# Jess Collection E-Commerce App - Deployment Guide

## Overview
Jess Collection is a full-stack Islamic women's fashion e-commerce platform built with Next.js, Supabase, and Stripe.

## Prerequisites

### Required Integrations
1. **Supabase** - Database and Authentication
2. **Stripe** - Payment Processing

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Redirect URLs (for development)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## Setup Instructions

### 1. Database Setup

The database schema has been created with the following tables:
- `users` - User profiles and admin flags
- `products` - Product catalog (clothing, shoes, jewellery, handbags)
- `cart` - Shopping cart items
- `orders` - Order records
- `order_items` - Individual items in orders
- `reviews` - Product ratings and reviews

All tables have Row Level Security (RLS) policies configured.

### 2. Authentication Setup

1. Enable Supabase Auth in your Supabase dashboard
2. Create an admin user through the Supabase dashboard
3. Update the `is_admin` flag for admin users in the `users` table

### 3. Stripe Configuration

#### Setting Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up your product catalog in Stripe (optional, for advanced features)

#### Payment Methods Supported

- **Stripe** (Credit/Debit Cards) - Fully integrated
- **PayPal** - Ready for integration
- **Bank Transfer** - Manual processing option
- **Social Media Checkout** - WhatsApp, Instagram, Facebook links

#### Configuring Multiple Payment Methods

Edit `/app/checkout/page.tsx` to customize payment options:

```tsx
const [paymentMethod, setPaymentMethod] = useState('stripe');
// Add or remove payment methods from the radio button group
```

### 4. Deployment

#### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Deploy with `vercel deploy`

#### Configure Social Media Links

Update the social media checkout links in `/app/checkout/page.tsx`:

```tsx
// Update WhatsApp number
href="https://wa.me/YOUR_PHONE_NUMBER?text=..."

// Update Instagram/Facebook business pages
href="https://instagram.com/YOUR_BUSINESS"
href="https://facebook.com/YOUR_BUSINESS"
```

## Features

### Customer Features
- ✅ Product browsing by category (Clothing, Shoes, Jewellery, Handbags)
- ✅ Size selection for shoes (5-11) and dresses (XS-2XL)
- ✅ Shopping cart with quantity adjustment (+/- buttons)
- ✅ Multiple checkout options (Stripe, PayPal, Bank Transfer, Social Media)
- ✅ Order tracking with real-time status updates
- ✅ Product reviews and ratings system
- ✅ Bilingual support (English & Somali)
- ✅ User authentication and profiles

### Admin Features
- ✅ Product management (CRUD operations)
- ✅ Order management and status tracking
- ✅ Customer management
- ✅ Review moderation
- ✅ Inventory management

### Design
- Primary Color: #E11594 (Elegant Magenta)
- Secondary Color: #FFFFFF (White)
- Professional Islamic fashion aesthetic
- Mobile-responsive design

## Payment Processing

### Stripe Integration

The app uses Stripe for credit/debit card payments:

1. Payment intents are created via `/api/create-payment-intent`
2. Orders are created via `/api/create-order`
3. Stripe webhook support (can be added for real-time updates)

### Alternative Payment Methods

For non-Stripe payments:
- **PayPal**: Can be integrated using PayPal SDK
- **Bank Transfer**: Manual processing with order status updates
- **Social Media**: Direct contact via WhatsApp, Instagram, Facebook Messenger

## Database Structure

### Products Table
```sql
- id (UUID)
- name (TEXT)
- description (TEXT)
- category (TEXT) - 'clothing', 'shoes', 'jewellery', 'handbags'
- price (DECIMAL)
- image_url (TEXT)
- stock_quantity (INTEGER)
```

### Orders Table
```sql
- id (UUID)
- order_number (TEXT) - Unique order reference
- user_id (UUID)
- total_amount (DECIMAL)
- status (TEXT) - 'pending', 'processing', 'shipped', 'delivered'
- payment_method (TEXT)
- stripe_payment_intent_id (TEXT)
- tracking_number (TEXT)
- shipping_address (TEXT)
```

## Testing

### Create a Test Admin User

```sql
-- After creating a user through auth, run:
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';
```

### Test Product Creation

1. Log in as admin
2. Navigate to `/admin/products`
3. Click "Add Product"
4. Fill in product details and submit

### Test Checkout Flow

1. Add products to cart
2. Go to checkout
3. For Stripe testing, use test card: `4242 4242 4242 4242`
4. Track order in order tracking page

## Language Support

The app supports bilingual content:
- English (default)
- Somali

Language switching is available in the header component. Add translations in `/lib/language-context.tsx`.

## Security Considerations

- Row Level Security (RLS) enabled on all database tables
- Admin operations protected with RLS policies
- User data isolated by user ID
- Stripe API keys stored server-side only
- HTTPS enforced in production

## Troubleshooting

### Payment Intent Fails
- Check Stripe API keys are correct
- Ensure Stripe keys are set in environment variables
- Verify amount is in correct currency format (cents for USD)

### Database Queries Fail
- Verify Supabase URL and keys are correct
- Check RLS policies allow the operation
- Ensure user is authenticated for protected operations

### Images Not Loading
- Use HTTPS URLs for image_url field
- Check image URLs are accessible
- Consider using Vercel Blob for image hosting

## Support

For issues or questions:
1. Check the code comments for implementation details
2. Review Supabase documentation: https://supabase.com/docs
3. Review Stripe documentation: https://stripe.com/docs
4. Check Next.js documentation: https://nextjs.org/docs
