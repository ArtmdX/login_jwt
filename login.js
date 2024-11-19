// Supondo que você tenha um formulário de login que envia uma requisição POST para o backend
const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Evita o envio do formulário de forma padrão

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.status === 200) {
      // Salva o token no localStorage
      localStorage.setItem('token', data.token);
        alert('Logado com sucesso!')
    } else {
      // Exibe o erro caso o login falhe
      console.error(data.msg);
    }
  } catch (error) {
    console.error("Erro no login:", error);
  }
});

