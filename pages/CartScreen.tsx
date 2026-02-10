import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { CartItem, getCartItems, updateCartQuantity, removeFromCart, toggleCartItemSelected, toggleAllSelected, getCartCount } from '../src/services/cartService';

interface CartScreenProps {
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ onNavigate }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const loadCart = useCallback(async () => {
        setLoading(true);
        let cartItems = await getCartItems();

        // Enrich local cart items with product data
        if (cartItems.some(i => !i.title)) {
            // Lazy import to avoid issues
            const { getProductById } = await import('../src/services/productService');
            const enriched = await Promise.all(
                cartItems.map(async (item) => {
                    if (!item.title) {
                        const product = await getProductById(item.product_id);
                        if (product) {
                            return {
                                ...item,
                                title: product.title,
                                price: product.price,
                                image_url: product.image_url,
                                stock: product.stock || 999,
                            };
                        }
                    }
                    return item;
                })
            );
            cartItems = enriched;
        }

        setItems(cartItems);
        setLoading(false);
    }, []);

    useEffect(() => { loadCart(); }, [loadCart]);

    const handleQuantityChange = async (itemId: string, delta: number) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + delta);
        await updateCartQuantity(itemId, newQty);
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
    };

    const handleRemove = async (itemId: string) => {
        await removeFromCart(itemId);
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const handleToggleSelect = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        await toggleCartItemSelected(itemId, !item.selected);
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, selected: !i.selected } : i));
    };

    const handleToggleAll = async () => {
        const allSelected = items.every(i => i.selected);
        await toggleAllSelected(!allSelected);
        setItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
    };

    const selectedItems = items.filter(i => i.selected);
    const totalPrice = selectedItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const totalCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
    const allSelected = items.length > 0 && items.every(i => i.selected);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-base font-medium">购物车 ({items.length})</span>
                <button onClick={() => setEditMode(!editMode)} className="text-sm text-primary-500 font-medium">
                    {editMode ? '完成' : '管理'}
                </button>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <ShoppingBag size={64} className="text-gray-200" />
                    <p className="text-gray-400 text-sm">购物车空空如也</p>
                    <button onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)} className="px-6 py-2 bg-primary-500 text-white rounded-full text-sm font-medium">
                        去逛逛
                    </button>
                </div>
            ) : (
                <div className="p-3 space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl p-3 flex gap-3 items-start relative overflow-hidden">
                            {/* Checkbox */}
                            <button onClick={() => handleToggleSelect(item.id)} className="mt-6 flex-shrink-0">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.selected ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                    {item.selected && <span className="text-white text-xs font-bold">&#10003;</span>}
                                </div>
                            </button>

                            {/* Image */}
                            <button
                                onClick={() => onNavigate(AppScreen.PRODUCT_DETAIL, { productId: item.product_id })}
                                className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                            >
                                <img src={item.image_url || ''} alt="" className="w-full h-full object-cover" />
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm text-slate-700 font-medium line-clamp-2 leading-tight mb-2">{item.title || '商品'}</h3>
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded">默认</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-red-500 text-xs font-bold">¥</span>
                                        <span className="text-red-500 text-base font-bold">{item.price || 0}</span>
                                    </div>

                                    {editMode ? (
                                        <button onClick={() => handleRemove(item.id)} className="text-red-500 text-xs flex items-center gap-1">
                                            <Trash2 size={12} />删除
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                                            <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => handleQuantityChange(item.id, -1)}>
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                                            <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => handleQuantityChange(item.id, 1)}>
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom bar */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 z-40">
                    <button onClick={handleToggleAll} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${allSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                            {allSelected && <span className="text-white text-xs font-bold">&#10003;</span>}
                        </div>
                        <span className="text-sm text-gray-600">全选</span>
                    </button>

                    <div className="flex-1 text-right">
                        <span className="text-sm text-gray-600">合计: </span>
                        <span className="text-red-500 text-sm font-bold">¥</span>
                        <span className="text-red-500 text-lg font-bold">{totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (selectedItems.length > 0) {
                                onNavigate(AppScreen.CHECKOUT, { items: selectedItems });
                            }
                        }}
                        disabled={selectedItems.length === 0}
                        className={`px-6 h-10 rounded-full text-sm font-medium transition-all ${selectedItems.length > 0 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white active:scale-[0.98]' : 'bg-gray-200 text-gray-400'}`}
                    >
                        结算 ({totalCount})
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
