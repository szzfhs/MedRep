import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, ChevronRight, Newspaper, Eye, Calendar, X, Tag
} from 'lucide-react';
import { news } from '../data/mockData';

const categories = ['全部', '重要新闻', '教学通知', '平台动态', '培训通知', '合作交流'];

export function NewsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const filtered = news.filter((n) => {
    const matchSearch = n.title.includes(search) || (n.summary || '').includes(search);
    const matchCat = activeCategory === '全部' || n.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1929] to-[#0B2848] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">新闻资讯</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Newspaper size={22} className="text-[#42A5F5]" />
                </div>
                <h1 className="text-white" style={{ fontSize: '1.75rem', fontWeight: 700 }}>新闻资讯</h1>
              </div>
              <p className="text-white/60 text-sm">实验中心最新动态、通知公告及相关资讯</p>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="搜索新闻标题…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Category filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0B5394] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0B5394] hover:text-[#0B5394]'
                  }`}
                >
                  <Tag size={11} />
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured News */}
            {filtered[0] && activeCategory === '全部' && !search && (
              <Link to={`/news/${filtered[0].id}`} className="group block mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:border-[#1E88E5]/30 transition-all"
                >
                  <div className="sm:flex">
                    <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                      <img
                        src={filtered[0].image}
                        alt={filtered[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0B5394] text-white rounded-lg text-xs">
                        置顶 · {filtered[0].category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <h2 className="text-[#1A2332] font-semibold text-lg mb-2 group-hover:text-[#0B5394] transition-colors line-clamp-2">
                          {filtered[0].title}
                        </h2>
                        <p className="text-[#64748B] text-sm leading-relaxed line-clamp-3">
                          {filtered[0].summary}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1"><Calendar size={12} />{filtered[0].date}</span>
                          <span className="flex items-center gap-1"><Eye size={12} />{filtered[0].views}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[#0B5394] text-xs font-medium">
                          阅读全文 <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* News list */}
            <div className="space-y-3">
              {(activeCategory === '全部' && !search ? filtered.slice(1) : filtered).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/news/${item.id}`}
                    className="group block bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#1E88E5]/30 transition-all"
                  >
                    <div className="flex gap-4">
                      {item.image && (
                        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] rounded-md text-xs font-medium">
                            {item.category}
                          </span>
                          <span className="text-[#94A3B8] text-xs">{item.date}</span>
                        </div>
                        <h3 className="text-[#1A2332] font-medium text-sm mb-1 line-clamp-1 group-hover:text-[#0B5394] transition-colors">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-[#64748B] text-xs line-clamp-1 leading-relaxed">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1"><Eye size={11} />{item.views} 阅读</span>
                          <span>{item.author}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="text-[#1A2332] font-semibold text-sm mb-4">新闻分类</h3>
              <div className="space-y-2">
                {categories.slice(1).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeCategory === cat
                        ? 'bg-[#E3F2FD] text-[#0B5394]'
                        : 'text-[#64748B] hover:bg-[#F0F4F8]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="px-1.5 py-0.5 bg-[#F0F4F8] text-[#94A3B8] rounded text-xs">
                      {news.filter(n => n.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="text-[#1A2332] font-semibold text-sm mb-4">最新动态</h3>
              <div className="space-y-3">
                {news.slice(0, 4).map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="group flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-[#0B5394] rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#1A2332] text-xs group-hover:text-[#0B5394] transition-colors line-clamp-2">{item.title}</p>
                      <span className="text-[#94A3B8] text-xs">{item.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
