import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import CreateTicket from './components/CreateTicket';

function App() {

  return (
    <Router>

      <div className="App">
        <nav style={{ padding: '1.1rem', background: '#f7fafc', boxShadow: '0 1px 6px rgba(0,0,0,.06)', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '1.22em', marginRight: 24, color: '#3b82f6', textDecoration: 'none', letterSpacing: '0.01em' }}>
            Ticket Support
          </Link>

          <Link to="/" style={{ marginRight: 15, color: '#222', textDecoration: 'none' }}>
            Ticket List
          </Link>
  
          <Link to="/tickets/new" style={{ color: '#222', textDecoration: 'none' }}>
            Create Ticket
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
  
        </Routes>
  
       </div>
  
    </Router>

  );

}

export default App;
