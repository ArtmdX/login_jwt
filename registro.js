const registroForm = document.getElementById('form-registro')

registroForm.addEventListener('submit', async(e) =>{
    e.preventDefault()

    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmpassword = document.getElementById('confirmpassword').value

    try {
        
        const res = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, email, password, confirmpassword})
        })
        alert('Registrado com sucesso!')
    } catch (error) {
        console.log(error)
    }
})