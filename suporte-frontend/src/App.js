import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = "http://localhost:3001";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('session_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [email, setEmail] = useState('');
  const [view, setView] = useState('list');
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', categoria: 'Hardware', prioridade: 'Média' });

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API}/tickets`);
      setTickets(res.data);
    } catch (e) {
      console.error("Erro ao buscar tickets", e);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/login`, { email });
      setUser(res.data);
      localStorage.setItem('session_user', JSON.stringify(res.data));
    } catch (e) {
      alert("Login falhou! Tente admin@teste.com ou user@teste.com");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('session_user');
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/tickets`, {
      title: formData.titulo,
      description: formData.descricao,
      category: formData.categoria,
      priority: formData.prioridade,
      userId: user.id,
      solicitante: user.nome
    });
    setView('list');
    fetchTickets();
    setFormData({ titulo: '', descricao: '', categoria: 'Hardware', prioridade: 'Média' });
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/tickets/${id}`, { status: newStatus });
      fetchTickets();
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  };

  if (!user) return (
    <div className="login-container">
      <div className="login-card">
        <h1>Suporte Central</h1>
        <p>Acesse sua conta para gerenciar chamados</p>
        <input type="email" placeholder="Email institucional" onChange={e => setEmail(e.target.value)} />
        <button onClick={handleLogin}>Entrar no Sistema</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="main-header">
        <div className="user-info">
          <div className="avatar">{user.nome[0]}</div>
          <span><strong>{user.nome}</strong> ({user.role})</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      <main className="content">
        <div className="section-header">
          <h2>{user.role === 'ADMIN' ? 'Fila de Trabalho - Gestão Técnica' : 'Meus Chamados'}</h2>
          {user.role === 'USER' && (
            <button className="btn-primary" onClick={() => setView(view === 'list' ? 'create' : 'list')}>
              {view === 'list' ? '+ Novo Chamado' : 'Voltar para Lista'}
            </button>
          )}
        </div>

        {view === 'create' && user.role === 'USER' ? (
          <form className="ticket-form" onSubmit={handleCreateTicket}>
            <input placeholder="Título curto do problema" onChange={e => setFormData({ ...formData, titulo: e.target.value })} required />
            <select onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
              <option>Hardware</option><option>Software</option><option>Acessos</option>
            </select>
            <select onChange={e => setFormData({ ...formData, prioridade: e.target.value })}>
              <option>Baixa</option><option value="Média">Média</option><option>Alta</option>
            </select>
            <textarea placeholder="Descreva os detalhes..." onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
            <button type="submit" className="btn-submit">Abrir Chamado</button>
          </form>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Data</th>
                  {user.role === 'ADMIN' && <th>Solicitante</th>}
                  <th>Título</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter(t => user.role === 'ADMIN' ? true : t.userId === user.id)
                  .map(t => (
                    <tr key={t.id} style={{ opacity: t.status === 'Concluído' ? 0.6 : 1 }}>
                      <td>{t.created_at?.split(',')[0]}</td>
                      {user.role === 'ADMIN' && <td><strong>{t.solicitante}</strong></td>}
                      <td>
                        <strong>{t.title || t.titulo}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>{t.description || t.descricao}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${t.status.replace(/\s+/g, '-').toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {t.status === 'Concluído' ? (
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>Finalizado</span>
                        ) : user.role === 'ADMIN' ? (
                          <>
                            <button className="btn-atender" onClick={() => updateStatus(t.id, 'Em Atendimento')}>Atender</button>
                            <button className="btn-concluir" onClick={() => updateStatus(t.id, 'Concluído')}>Concluir</button>
                          </>
                        ) : (
                          <span style={{ color: '#666', fontSize: '13px' }}>Aguardando técnico</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;