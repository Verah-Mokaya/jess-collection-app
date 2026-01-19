'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'so';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    clothing: 'Clothing',
    shoes: 'Shoes',
    jewelry: 'Jewelry',
    handbags: 'Handbags',
    cart: 'Cart',
    account: 'Account',
    admin: 'Admin',
    logout: 'Logout',
    language: 'Language',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    country: 'Country',
    signupButton: 'Create Account',
    loginButton: 'Sign In',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    forgotPassword: 'Forgot Password?',
    
    // Store
    products: 'Products',
    featured: 'Featured Products',
    newArrivals: 'New Arrivals',
    allProducts: 'All Products',
    price: 'Price',
    addToCart: 'Add to Cart',
    quantity: 'Quantity',
    viewDetails: 'View Details',
    description: 'Description',
    reviews: 'Reviews',
    rating: 'Rating',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    
    // Cart
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    total: 'Total',
    continueShop: 'Continue Shopping',
    checkout: 'Proceed to Checkout',
    removeItem: 'Remove',
    updateCart: 'Update Cart',
    
    // Checkout
    checkoutTitle: 'Checkout',
    shippingAddress: 'Shipping Address',
    billingAddress: 'Billing Address',
    paymentMethod: 'Payment Method',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    paymentOptions: 'Payment Options',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    stripe: 'Stripe',
    paypal: 'PayPal',
    bankTransfer: 'Bank Transfer',
    contactVia: 'Or contact us via:',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    email: 'Email',
    
    // Orders
    orders: 'My Orders',
    orderNumber: 'Order #',
    orderDate: 'Order Date',
    orderStatus: 'Status',
    trackOrder: 'Track Order',
    orderDetails: 'Order Details',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    estimatedDelivery: 'Estimated Delivery',
    trackingNumber: 'Tracking Number',
    
    // Reviews
    writeReview: 'Write a Review',
    yourRating: 'Your Rating',
    yourReview: 'Your Review',
    submitReview: 'Submit Review',
    averageRating: 'Average Rating',
    viewAllReviews: 'View All Reviews',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',
    verified: 'Verified Purchase',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    analytics: 'Analytics',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    category: 'Category',
    price: 'Price',
    stock: 'Stock',
    image: 'Image',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    
    // Messages
    successMessage: 'Success!',
    errorMessage: 'Something went wrong. Please try again.',
    confirmDelete: 'Are you sure you want to delete this item?',
    itemAdded: 'Item added to cart',
    itemRemoved: 'Item removed from cart',
    orderPlaced: 'Order placed successfully',
    reviewSubmitted: 'Review submitted successfully',
    loginRequired: 'Please login to continue',
    
    // Footer
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    followUs: 'Follow Us',
    copyright: '© 2025 Jess Collection. All rights reserved.',
  },
  so: {
    // Navigation
    home: 'Guuraaga',
    shop: 'Suuq',
    clothing: 'Dhawr',
    shoes: 'Kabab',
    jewelry: 'Dahab iyo Lacag',
    handbags: 'Bags',
    cart: 'Garigga',
    account: 'Akoonka',
    admin: 'Maamulaha',
    logout: 'Ka bixi',
    language: 'Luuqada',
    
    // Auth
    login: 'Gal',
    signup: 'Saxiib',
    email: 'Email',
    password: 'Shaac-xasilinta',
    confirmPassword: 'Xaqiiji Shaac-xasilinta',
    name: 'Magaca Buuqa',
    phone: 'Lambarka Telifoonka',
    address: 'Cinwaanka',
    city: 'Magaalada',
    country: 'Dalkuba',
    signupButton: 'Abuur Akoonka',
    loginButton: 'Gal Akoonka',
    haveAccount: 'Ma leedahay akoonka?',
    noAccount: 'Akoonka ma leedahid?',
    forgotPassword: 'Shaac-xasilinta Illoobay?',
    
    // Store
    products: 'Alaabta',
    featured: 'Alaabta Caanka Leh',
    newArrivals: 'Alaabta Cusub',
    allProducts: 'Dhammaan Alaabta',
    price: 'Qiimaha',
    addToCart: 'Garigga Ku Dar',
    quantity: 'Tirada',
    viewDetails: 'Arag Faahfaahintu',
    description: 'Sharraxaad',
    reviews: 'Doodaha',
    rating: 'Takdir',
    inStock: 'Kayga Jirta',
    outOfStock: 'Ka Baxday Kayga',
    
    // Cart
    yourCart: 'Garigga Ku Jirta',
    emptyCart: 'Garigga waa madhan',
    subtotal: 'Ugu dambeeya',
    shipping: 'Soo cellinta',
    tax: 'Calaacal',
    total: 'Guud ahaan',
    continueShop: 'Sii Suuqi',
    checkout: 'U gudu Waxbarashada',
    removeItem: 'Ka buur',
    updateCart: 'Cusboon Gari',
    
    // Checkout
    checkoutTitle: 'Waxbarashada',
    shippingAddress: 'Cinwaanka Soo Cellinta',
    billingAddress: 'Cinwaanka Lacagta',
    paymentMethod: 'Habka Lacagta',
    orderSummary: 'Risaalada Ogsoonaan',
    placeOrder: 'Dhig Ogsoonaan',
    paymentOptions: 'Habka Lacagta',
    creditCard: 'Kaarka Lacag',
    debitCard: 'Kaarka Debit',
    stripe: 'Stripe',
    paypal: 'PayPal',
    bankTransfer: 'Lacag Bankiga',
    contactVia: 'Ama Naxaasqo:',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    email: 'Email',
    
    // Orders
    orders: 'Ogsoonnyadda Ku Jira',
    orderNumber: 'Ogsoonaan #',
    orderDate: 'Taariikhda Ogsoonaan',
    orderStatus: 'Heerka',
    trackOrder: 'Raadi Ogsoonaan',
    orderDetails: 'Faahfaahintu Ogsoonaan',
    pending: 'Sugnaanta',
    processing: 'Wax Iska Galay',
    shipped: 'Soo Celiyay',
    delivered: 'Gaadhay',
    cancelled: 'Joogay',
    estimatedDelivery: 'Wakhti Lagu Qeexay Gadhka',
    trackingNumber: 'Lambarka Raadida',
    
    // Reviews
    writeReview: 'Qor Dood',
    yourRating: 'Takdirgaagu',
    yourReview: 'Doodaagu',
    submitReview: 'Tusi Dood',
    averageRating: 'Takdir Caadiga Ah',
    viewAllReviews: 'Arag Dhammaan Doodaha',
    helpful: 'Caawi',
    notHelpful: 'Ma Caawiye',
    verified: 'Suuq Waxbarashad',
    
    // Admin
    adminDashboard: 'Maamulaha Dashboard',
    products: 'Alaabta',
    orders: 'Ogsoonnyadda',
    customers: 'Custummerka',
    analytics: 'Tilmaamaha',
    addProduct: 'Ku Dar Alaab',
    editProduct: 'Wax Ka Bedel Alaab',
    deleteProduct: 'Tirtir Alaab',
    productName: 'Magaca Alaabta',
    category: 'Category',
    price: 'Qiimaha',
    stock: 'Kayga',
    image: 'Sawir',
    save: 'Kaydi',
    cancel: 'Joog',
    delete: 'Tirtir',
    edit: 'Wax Ka Bedel',
    search: 'Raadi',
    filter: 'Sareensareeh',
    
    // Messages
    successMessage: 'Guul!',
    errorMessage: 'Wax buu dhacdey. Fadlan isku day dib.',
    confirmDelete: 'Ma hubtaa inaad tirtirtid item-kan?',
    itemAdded: 'Alaabta waa lagu daray gariga',
    itemRemoved: 'Alaabta waa laga saaray gariga',
    orderPlaced: 'Ogsoonaan waa la dhigay si guul ah',
    reviewSubmitted: 'Dood waa la dhigay si guul ah',
    loginRequired: 'Fadlan gal akoonka si aad u sii jeedto',
    
    // Footer
    aboutUs: 'Naga Oo Ah',
    contactUs: 'Naxaasqo',
    privacyPolicy: 'Siyaasadda Sirineed',
    termsConditions: 'Sharciga iyo Walaaca',
    followUs: 'Raac',
    copyright: '© 2025 Jess Collection. Dhammaan xuquuqdu waa dhowrsan.',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
