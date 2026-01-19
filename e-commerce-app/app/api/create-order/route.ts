import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentIntentId,
    } = await request.json();

    // Generate order number
    const orderNumber = `JESS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: paymentMethod === 'stripe' ? 'processing' : 'pending',
          payment_method: paymentMethod,
          stripe_payment_intent_id: paymentIntentId || null,
          shipping_address: shippingAddress,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      success: true,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
