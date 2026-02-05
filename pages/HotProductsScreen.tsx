import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, ShoppingCart, Heart, Star, ChevronDown, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { getProducts, getCategories, Product, Category } from '../src/services/productService';

interface HotProductsScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const HotProductsScreen: React.FC<HotProductsScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'sales' | 'price' | 'rating'>('sales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories and products
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ sortBy, sortOrder })
      ]);
      setCategories(cats);
      setProducts(prods);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Reload products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const categoryId = activeCategory === '全部' ? undefined :
        categories.find(c => c.name === activeCategory)?.id;
      const prods = await getProducts({
        categoryId,
        sortBy,
        sortOrder
      });
      setProducts(prods);
      setIsLoading(false);
    };
    if (categories.length > 0) {
      loadProducts();
    }
  }, [activeCategory, sortBy, sortOrder, categories]);

  const handlePriceSort = () => {
    if (sortBy === 'price') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('price');
      setSortOrder('asc');
    }
  };

  // Filter by search query
  const filteredProducts = products.filter(p =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onNavigate(AppScreen.HOME)}
            className="w-8 h-8 flex items-center justify-center -ml-2 text-slate-600 active:scale-95 transition-transform"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜好物..."
              className="w-full bg-gray-100 h-9 rounded-full pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="text-slate-600"><ShoppingCart size={22} /></button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`whitespace-nowrap text-sm px-3 py-1 rounded-full transition-colors font-medium ${activeCategory === cat.name ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white px-4 py-2 border-t border-gray-100 flex justify-between text-xs text-slate-500 sticky top-[100px] z-30">
        <button
          onClick={() => { setSortBy('sales'); setSortOrder('desc'); }}
          className={`flex items-center gap-1 ${sortBy === 'sales' ? 'font-bold text-primary-500' : ''}`}
        >
          综合
        </button>
        <button
          onClick={() => { setSortBy('sales'); setSortOrder('desc'); }}
          className={`flex items-center gap-1 ${sortBy === 'sales' && sortOrder === 'desc' ? 'font-bold text-primary-500' : ''}`}
        >
          销量
        </button>
        <button
          onClick={handlePriceSort}
          className={`flex items-center gap-1 ${sortBy === 'price' ? 'font-bold text-primary-500' : ''}`}
        >
          价格
          <div className="flex flex-col -space-y-1">
            <ChevronDown size={10} className={`rotate-180 ${sortBy === 'price' && sortOrder === 'asc' ? 'text-primary-500' : ''}`} />
            <ChevronDown size={10} className={sortBy === 'price' && sortOrder === 'desc' ? 'text-primary-500' : ''} />
          </div>
        </button>
        <button className="flex items-center gap-1">筛选 <Filter size={12} /></button>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : (
        <main className="p-3 grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative aspect-square bg-gray-200">
                <img src={product.image_url} className="w-full h-full object-cover" alt={product.title} />
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h3 className="text-sm text-slate-800 font-medium line-clamp-2 leading-tight h-10">{product.title}</h3>

                <div className="flex items-center gap-1 mt-1.5 mb-2">
                  <Star size={10} className="text-orange-400 fill-current" />
                  <span className="text-[10px] text-slate-400 font-medium">{product.rating} · 已售 {product.sales}+</span>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-0.5 text-primary-600">
                    <span className="text-xs font-bold">¥</span>
                    <span className="text-lg font-bold font-sans">{product.price}</span>
                  </div>
                  <button className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-90 transition-all">
                    <Heart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      )}
    </div>
  );
};

export default HotProductsScreen;