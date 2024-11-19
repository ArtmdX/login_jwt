const jwt = require("jsonwebtoken");
const path = require("path");
const auth = require("./middlewares/auth");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Cliente = require("./models/Cliente")
const { checkPrime } = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.static("./"));
app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2qpyc.mongodb.net/authTest?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("Server rodando: http://localhost:3000");
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  const page = path.join(path.resolve(), "login.html");
  res.sendFile(page);
});
app.get("/registro", (req, res) => {
  const page = path.join(path.resolve(), "registro.html");
  res.sendFile(page);
});

//Registrar usuário
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // Checagem de campo vazio
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não coincidem!" });
  }

  //Checagem de usuário existente
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "Email Já cadastrado!" });
  }

  //Criar senha
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //Criar Usuario
  const user = new User({
    name,
    email,
    password: passwordHash,
  });
  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Deu pau no BD" });
  }
});

//Login do Usuário
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Checagem de campo vazio
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  //Checar se o usuário existe
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  //Checar se a senha está correta
  const checkpassword = await bcrypt.compare(password, user.password);
  if (!checkpassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.SECRET
    );
    res.status(200).json({ msg: "Autenticação realizada", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Deu pau no BD" });
  }
});

// Rota Privada buscar um usuário
app.get("/user/:id", auth.checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não existe" });
  }

  res.status(200).json({ user });
});

// Rota Privada criar um cliente

app.post("/cliente/create",auth.checkToken ,async (req, res) => {
    try{
  const { nome, email, telefone, endereco } = req.body;

  if (!req.userId) {
    return res.status(401).json({ msg: "Usuário não autenticado!" });
  }

  const novoCliente = new Cliente({
    nome,
    email,
    telefone,
    endereco,
    usuario: req.userId,
  });
  await novoCliente.save();
  res.status(201).json({msg: 'Cliente Criado!', cliente: novoCliente})}
  catch(error){
    console.log(error)
    res.status(500).json({msg: 'Erro ao criar o cliente!'})
  }
});

//Rota privada para buscar todos os clientes do usuario

app.get("/cliente/getall", auth.checkToken, async(req, res) =>{
  try {
    const clientes = await Cliente.find({ usuario: req.userId }).exec();
    res.status(201).json(clientes); 
  } catch (error) {
    console.error('Erro ao buscar clientes', error)
  }
  
})
