import React, { useState, useMemo } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { Search, Ticket, Users, BookOpen, X } from 'lucide-react';

export default function GlobalSearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tickets,
    customers,
    articles,
    navigateToTicket,
    navigateToCustomer,
    setReadArticle
  } = useSupportFlow();

  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        tickets: tickets.slice(0, 3),
        customers: customers.slice(0, 2),
        articles: articles.slice(0, 2)
      };
    }
    const q = query.toLowerCase();
    return {
      tickets: tickets.filter(
        t =>
          t.subject.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q)
      ).slice(0, 5),
      customers: customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      ).slice(0, 4),
      articles: articles.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      ).slice(0, 4)
    };
  }, [query, tickets, customers, articles]);

  if (!isSearchOpen) return null;

  return (
    <div className="sf-modal-overlay" onClick={() => setIsSearchOpen(false)}>
      <div className="sf-palette-modal" onClick={e => e.stopPropagation()}>
        {/* Search header */}
        <div className="sf-palette-header">
          <Search size={16} color="var(--sf-text-muted)" />
          <input
            className="sf-palette-input"
            placeholder="Search tickets, customers, knowledge base... (Type to filter)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button
            className="sf-btn-ghost"
            style={{ width: 24, height: 24, padding: 0 }}
            onClick={() => setIsSearchOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Stream */}
        <div className="sf-palette-results">
          {/* Tickets Group */}
          {filteredResults.tickets.length > 0 && (
            <div>
              <div className="sf-palette-group-title">Tickets</div>
              {filteredResults.tickets.map(t => (
                <div
                  key={t.id}
                  className="sf-palette-item"
                  onClick={() => {
                    navigateToTicket(t.id);
                    setIsSearchOpen(false);
                  }}
                >
                  <Ticket size={14} color="var(--sf-primary)" />
                  <span className="sf-ticket-id">#{t.id}</span>
                  <span style={{ fontWeight: 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.subject}
                  </span>
                  <span className={`sf-badge sf-badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Customers Group */}
          {filteredResults.customers.length > 0 && (
            <div>
              <div className="sf-palette-group-title">Customers</div>
              {filteredResults.customers.map(c => (
                <div
                  key={c.id}
                  className="sf-palette-item"
                  onClick={() => {
                    navigateToCustomer(c.id);
                    setIsSearchOpen(false);
                  }}
                >
                  <Users size={14} color="var(--sf-info)" />
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: 'var(--sf-text-secondary)', fontSize: 12 }}>{c.company}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
                    {c.email}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Knowledge Base Articles */}
          {filteredResults.articles.length > 0 && (
            <div>
              <div className="sf-palette-group-title">Knowledge Base Articles</div>
              {filteredResults.articles.map(a => (
                <div
                  key={a.id}
                  className="sf-palette-item"
                  onClick={() => {
                    setReadArticle(a);
                    setIsSearchOpen(false);
                  }}
                >
                  <BookOpen size={14} color="var(--sf-warning)" />
                  <span style={{ flex: 1 }}>{a.title}</span>
                  <span className="sf-badge" style={{ backgroundColor: '#F3F4F6' }}>{a.category}</span>
                </div>
              ))}
            </div>
          )}

          {filteredResults.tickets.length === 0 &&
            filteredResults.customers.length === 0 &&
            filteredResults.articles.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                No results found matching "{query}"
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="sf-palette-footer">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
