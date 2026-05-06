const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let tickets = [];
const users = [
  { id: 1, nome: 'Admin', email: 'admin@teste.com', role: 'ADMIN' },
  { id: 2, nome: 'User', email: 'user@teste.com', role: 'USER' }
];

app.post('/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });
  res.json(user);
});


app.get('/tickets', (req, res) => {
  const { userId, role } = req.query; 

  if (role === 'ADMIN') {
    return res.json(tickets); 
  }
  
  const userTickets = tickets.filter(t => t.userId == userId);
  res.json(userTickets);
});

app.post('/tickets', (req, res) => {
  const { title, description, category, priority, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
  }

  const newTicket = { 
    id: Date.now(), 
    userId,
    title, 
    description, 
    category, 
    priority: priority || 'Normal', 
    status: 'Aberto', 
    created_at: new Date().toLocaleString('pt-BR') 
  };

  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

pp.put('/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatus = ['Aberto', 'Em Atendimento', 'Concluído'];
  
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }

  const index = tickets.findIndex(t => t.id === Number(id));
  
  if (index !== -1) {
    tickets[index].status = status;
    console.log(`Chamado ${id} atualizado para: ${status}`);
    return res.json(tickets[index]);
  } else {
    console.log(`Chamado ${id} não encontrado. IDs disponíveis:`, tickets.map(t => t.id));
    res.status(404).json({ message: 'Chamado não encontrado' });
  }
});

app.listen(3001, () => console.log("Backend rodando na porta 3001"));