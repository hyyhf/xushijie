import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Share2, Star, ChevronRight, Minus, Plus, X, MessageCircle, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { Product, getProductById } from '../src/services/productService';
import { addToCart, getCartCount } from '../src/services/cartService';

interface ProductDetailScreenProps {
    productId: string;
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ productId, onNavigate }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showSpecPicker, setShowSpecPicker] = useState(false);
    const [specAction, setSpecAction] = useState<'cart' | 'buy'>('cart');
    const [quantity, setQuantity] = useState(1);
    const [addedToast, setAddedToast] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const p = await getProductById(productId);
            setProduct(p);
            setLoading(false);
            const count = await getCartCount();
            setCartCount(count);
        };
        load();
    }, [productId]);

    const images = product?.images?.length
        ? product.images
        : product ? [product.image_url, product.image_url, product.image_url] : [];

    const handleAddToCart = async () => {
        if (!product) return;
        await addToCart(product.id, quantity, {}, {
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            stock: product.stock,
        });
        const count = await getCartCount();
        setCartCount(count);
        setShowSpecPicker(false);
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
    };

    const handleBuyNow = async () => {
        if (!product) return;
        await addToCart(product.id, quantity, {}, {
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            stock: product.stock,
        });
        const count = await getCartCount();
        setCartCount(count);
        setShowSpecPicker(false);
        onNavigate(AppScreen.CART);
    };

    const openSpecPicker = (action: 'cart' | 'buy') => {
        setSpecAction(action);
        setQuantity(1);
        setShowSpecPicker(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-slate-400">商品不存在</p>
                <button onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)} className="text-primary-500 text-sm">返回商品列表</button>
            </div>
        );
    }

    const originalPrice = product.original_price || Math.round(product.price * 1.3);
    const discount = Math.round((1 - product.price / originalPrice) * 100);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top bar */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition-transform">
                    <ArrowLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-700">商品详情</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate(AppScreen.CART)} className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                        <ShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount > 99 ? '99+' : cartCount}</span>
                        )}
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div className="pt-14">
                {/* Image carousel */}
                <div className="relative bg-white aspect-square overflow-hidden">
                    <div className="flex transition-transform duration-300 h-full" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                        {images.map((img, i) => (
                            <img key={i} src={img} alt={product.title} className="w-full h-full object-cover flex-shrink-0" />
                        ))}
                    </div>
                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button key={i} onClick={() => setCurrentImage(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-primary-500 w-4' : 'bg-white/60'}`}
                            />
                        ))}
                    </div>
                    {/* Swipe areas */}
                    <button className="absolute left-0 top-0 w-1/3 h-full" onClick={() => setCurrentImage(Math.max(0, currentImage - 1))} />
                    <button className="absolute right-0 top-0 w-1/3 h-full" onClick={() => setCurrentImage(Math.min(images.length - 1, currentImage + 1))} />
                    {product.tag && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">{product.tag}</span>
                    )}
                </div>

                {/* Price section */}
                <div className="bg-white px-4 py-3 mt-0">
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-red-500 text-sm font-bold">¥</span>
                        <span className="text-red-500 text-3xl font-bold">{product.price}</span>
                        <span className="line-through text-gray-400 text-sm mb-0.5">¥{originalPrice}</span>
                        <span className="bg-red-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded mb-0.5">-{discount}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                        <span>已售 {product.sales}+</span>
                        <span>|</span>
                        <div className="flex items-center gap-0.5">
                            <Star size={10} className="text-orange-400 fill-current" />
                            <span>{product.rating}</span>
                        </div>
                        <span>|</span>
                        <span>库存 {product.stock || 999}</span>
                    </div>
                    <h1 className="text-base font-medium text-slate-800 leading-snug">{product.title}</h1>
                </div>

                {/* Coupon bar */}
                <div className="bg-white px-4 py-2.5 mt-2 flex items-center gap-2">
                    <span className="border border-red-400 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">满199减20</span>
                    <span className="border border-red-400 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">新人专享</span>
                    <span className="border border-orange-400 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded">直播间专属</span>
                </div>

                {/* Specs selection */}
                <button
                    onClick={() => openSpecPicker('cart')}
                    className="bg-white px-4 py-3 mt-2 flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">选择</span>
                        <span className="text-sm text-slate-700">规格 / 颜色 / 尺码</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </button>

                {/* Shipping */}
                <div className="bg-white px-4 py-3 mt-2 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">配送</span>
                        <span className="text-slate-700">顺丰包邮</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">保障</span>
                        <span className="text-slate-700">7天无理由退换</span>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white px-4 py-4 mt-2">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">商品详情</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {product.description || `${product.title}，品质保障，官方直营正品。精选优质材料，匠心工艺打造。支持7天无理由退换货，顺丰包邮，让您购物无忧。直播间款式，限时特惠中，数量有限先到先得。`}
                    </p>
                    {/* Repeat images as detail images */}
                    <div className="mt-3 space-y-2">
                        <img src={product.image_url} alt="" className="w-full rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-2 flex items-center gap-3 z-40">
                <button className="flex flex-col items-center gap-0.5 px-2" onClick={() => { }}>
                    <MessageCircle size={20} className="text-gray-500" />
                    <span className="text-[10px] text-gray-500">客服</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-2" onClick={() => setIsFavorited(!isFavorited)}>
                    <Heart size={20} className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'} />
                    <span className="text-[10px] text-gray-500">收藏</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-2 relative" onClick={() => onNavigate(AppScreen.CART)}>
                    <ShoppingCart size={20} className="text-gray-500" />
                    <span className="text-[10px] text-gray-500">购物车</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                </button>
                <button onClick={() => openSpecPicker('cart')} className="flex-1 h-10 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-transform">
                    加入购物车
                </button>
                <button onClick={() => openSpecPicker('buy')} className="flex-1 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-transform">
                    立即购买
                </button>
            </div>

            {/* Spec picker modal */}
            {showSpecPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowSpecPicker(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-t-2xl px-4 pb-6 pt-4 animate-slide-up">
                        <button onClick={() => setShowSpecPicker(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                            <X size={16} />
                        </button>

                        <div className="flex gap-3 mb-4">
                            <img src={product.image_url} className="w-20 h-20 rounded-lg object-cover" />
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-red-500 text-sm font-bold">¥</span>
                                    <span className="text-red-500 text-xl font-bold">{product.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">库存 {product.stock || 999} 件</p>
                            </div>
                        </div>

                        {/* Mock specs */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">颜色分类</p>
                            <div className="flex flex-wrap gap-2">
                                {['默认', '经典款', '限定款'].map((s, i) => (
                                    <button key={i} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${i === 0 ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-medium text-slate-700">数量</span>
                            <div className="flex items-center gap-3 border border-gray-200 rounded-lg overflow-hidden">
                                <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                                <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => setQuantity(quantity + 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={specAction === 'cart' ? handleAddToCart : handleBuyNow}
                            className={`w-full h-11 rounded-full text-white font-medium text-sm active:scale-[0.98] transition-transform ${specAction === 'cart' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                        >
                            {specAction === 'cart' ? '加入购物车' : '立即购买'}
                        </button>
                    </div>
                </div>
            )}

            {/* Added toast */}
            {addedToast && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 text-white px-6 py-3 rounded-lg text-sm font-medium">
                    已加入购物车
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ProductDetailScreen;
