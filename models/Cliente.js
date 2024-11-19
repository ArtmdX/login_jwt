const mongoose = require('mongoose')

const ClienteSchema = new mongoose.Schema({
    nome: String,
    email: String,
    telefone: String,
    endereco: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });
  const Cliente = mongoose.model('Cliente', ClienteSchema);
  module.exports = Cliente