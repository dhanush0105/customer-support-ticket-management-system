import React, { useState, useMemo } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { Search, Eye, Calendar, ArrowRight, X } from 'lucide-react';

export default function KnowledgeBasePage() {
  const { articles, readArticle, setReadArticle } = useSupportFlow();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'Billing', 'Payments', 'Account', 'Technical', 'Shipping'];

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);

      const matchesCategory =
        activeCategory === 'ALL' || art.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, activeCategory]);

  return (
    <div>
      {/* Knowledge Base Hero */}
      <div style={{ textAlign: 'center', padding: '32px 20px 28px', backgroundColor: '#FFFFFF', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-md)', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--sf-text-primary)', marginBottom: 6 }}>
          How can we help?
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
          Browse standard operating procedures, technical guides, billing manuals, and customer documentation.
        </p>

        {/* Large search input */}
        <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sf-text-muted)' }} />
          <input
            className="sf-input"
            style={{ width: '100%', height: 42, paddingLeft: 40, fontSize: 14 }}
            placeholder="Search articles, setup guides, error codes, and troubleshooting..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Popular category chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--sf-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Popular:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              className={`sf-btn sf-btn-sm ${activeCategory === cat ? 'sf-btn-primary' : 'sf-btn-secondary'}`}
              style={{ borderRadius: 9999, padding: '0 12px' }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'ALL' ? 'All Articles' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filteredArticles.map(art => (
          <div
            key={art.id}
            className="sf-card"
            style={{ padding: 18, cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onClick={() => setReadArticle(art)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="sf-badge" style={{ backgroundColor: '#F0FDFA', color: '#0F766E', border: '1px solid #99F6E4' }}>
                  {art.category}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>{art.readTime}</span>
              </div>

              <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--sf-text-primary)', lineHeight: 1.4, marginBottom: 8 }}>
                {art.title}
              </h3>

              <p style={{ fontSize: 12.5, color: 'var(--sf-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {art.content}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--sf-border-subtle)', fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={12} />
                  {art.views.toLocaleString()} views
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} />
                  {art.updatedAt}
                </span>
              </div>
              <span style={{ color: 'var(--sf-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                Read <ArrowRight size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {readArticle && (
        <div className="sf-modal-overlay" onClick={() => setReadArticle(null)}>
          <div className="sf-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="sf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sf-badge sf-badge-in-progress">{readArticle.category}</span>
                <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>{readArticle.readTime}</span>
              </div>
              <button
                className="sf-btn-ghost"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={() => setReadArticle(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sf-modal-body" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sf-text-primary)', marginBottom: 12 }}>
                {readArticle.title}
              </h2>
              <div style={{ fontSize: 12, color: 'var(--sf-text-muted)', marginBottom: 18, display: 'flex', gap: 14 }}>
                <span>Updated: {readArticle.updatedAt}</span>
                <span>Views: {readArticle.views.toLocaleString()}</span>
              </div>

              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--sf-text-primary)', whiteSpace: 'pre-line' }}>
                {readArticle.content}
                {'\n\n'}
                ### Detailed Verification Steps
                1. Navigate to your corporate profile or administrative account console.
                2. Verify that two-factor confirmation has been verified on your corporate phone device.
                3. If error messages persist, submit an escalated inquiry to Tier-2 Technical Support referencing this article ID #{readArticle.id}.
              </div>
            </div>

            <div className="sf-modal-footer">
              <span style={{ fontSize: 12, color: 'var(--sf-text-muted)', marginRight: 'auto' }}>
                Was this article helpful?
              </span>
              <button className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => setReadArticle(null)}>
                Yes
              </button>
              <button className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => setReadArticle(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
