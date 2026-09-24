import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { ACADEMY_ARTICLES } from '../data/mockData';
import { AcademyArticle } from '../types';

export function HealthAcademy() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<AcademyArticle | null>(null);

  const categories = ['All', 'Basics', 'Teen', 'Science', 'Hygiene'];

  const filtered = ACADEMY_ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2D2328]/08 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#C54B6C] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-wider text-[#64555D] font-medium">
                NIVA Menstrual Health Academy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2328] mt-1">
              Knowledge Without Stigma
            </h1>
            <p className="text-xs text-[#64555D] mt-1 max-w-xl">
              Medically verified, teen-friendly, and scientifically grounded guides to understand your hormonal cycle, pad safety, and pain signals.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#64555D] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (cramps, teen, TSS)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#2D2328]/15 bg-[#FAF7F5] focus:outline-none focus:ring-1 focus:ring-[#C54B6C]"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 pt-6 border-t border-[#2D2328]/08 mt-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#C54B6C] text-white shadow-xs'
                  : 'bg-[#FAF7F5] text-[#64555D] hover:text-[#2D2328]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-2xl p-6 border border-[#2D2328]/08 hover:border-[#C54B6C]/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64555D]">
                <span className="font-semibold text-[#7D2840]">{art.category}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{art.readTime}</span>
                </span>
              </div>

              <h2 className="text-lg font-serif font-bold text-[#2D2328] group-hover:text-[#C54B6C] transition-colors leading-snug">
                {art.title}
              </h2>

              <p className="text-xs text-[#64555D] leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-[#2D2328]/06 flex items-center justify-between mt-4">
              <span className="text-[11px] text-[#64555D]">
                Medically Reviewed
              </span>
              <button
                onClick={() => setActiveArticle(art)}
                className="text-xs font-semibold text-[#C54B6C] hover:text-[#7D2840] transition-colors flex items-center gap-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl border border-[#2D2328]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#2D2328]/08 flex items-center justify-between bg-[#FAF7F5]">
              <div>
                <span className="text-xs font-semibold text-[#7D2840]">
                  {activeArticle.category} · {activeArticle.readTime}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2D2328] mt-0.5">
                  {activeArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-lg text-[#64555D] hover:text-[#2D2328] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-[#2D2328] leading-relaxed flex-1">
              {activeArticle.content.map((para, i) => (
                <p key={i} className="text-[#3D3237] leading-relaxed">
                  {para}
                </p>
              ))}

              <div className="mt-6 p-4 bg-[#FDF2F4] rounded-xl border border-[#C54B6C]/20 space-y-2">
                <span className="font-bold text-[#7D2840] block">
                  Key Takeaways for Your Health:
                </span>
                <ul className="space-y-1.5">
                  {activeArticle.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C54B6C] shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-[#2D2328]/08 bg-[#FAF7F5] flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
