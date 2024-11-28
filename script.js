let token = '';

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, preencha ambos os campos.');
        return;
    }

    console.log('Tentando login com', username, password);

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta do servidor:', data);
        if (data.access_token) {
            token = data.access_token;
            console.log('Token recebido:', token);
            mostrarSecao('produtos');
            listarProdutos();
        } else {
            alert('Login falhou: ' + (data.message || 'Verifique suas credenciais.'));
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao tentar o login. Tente novamente.');
    });
}

function mostrarSecao(secao) {
    // Esconde todas as seções e exibe a desejada
    const secoes = ['login', 'produtos', 'adicionar-produto', 'atualizar-produto', 'deletar-produto'];
    secoes.forEach(secaoId => {
        document.getElementById(secaoId).style.display = 'none';
    });
    document.getElementById(secao).style.display = 'block';
}

function listarProdutos() {
    fetch('http://127.0.0.1:5000/produtos', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data)) {
            const listaProdutos = document.getElementById('lista-produtos');
            listaProdutos.innerHTML = '';
            data.forEach(produto => {
                const li = document.createElement('li');
                li.textContent = `${produto.nome} - R$ ${produto.preco} - ${produto.categoria} - Estoque: ${produto.estoque}`;
                const atualizarBtn = document.createElement('button');
                atualizarBtn.textContent = 'Atualizar';
                atualizarBtn.onclick = () => mostrarFormularioAtualizar(produto);
                li.appendChild(atualizarBtn);
                listaProdutos.appendChild(li);
            });
        } else {
            alert('Erro ao carregar produtos');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao listar produtos.');
    });
}

function mostrarFormularioAtualizar(produto) {
    mostrarSecao('atualizar-produto');
    document.getElementById('atualizar-id').value = produto.id;
    document.getElementById('novo-nome').value = produto.nome;
    document.getElementById('novo-preco').value = produto.preco;
    document.getElementById('nova-categoria').value = produto.categoria;
    document.getElementById('novo-estoque').value = produto.estoque;
}

function salvarProduto(endpoint, method, data, callback) {
    fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            callback();
        } else {
            alert('Erro ao processar a solicitação');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao processar a solicitação');
    });
}

function atualizarProduto() {
    const id = document.getElementById('atualizar-id').value;
    const nome = document.getElementById('novo-nome').value;
    const preco = document.getElementById('novo-preco').value;
    const categoria = document.getElementById('nova-categoria').value;
    const estoque = document.getElementById('novo-estoque').value;

    if (!nome || !preco || !categoria || !estoque) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    salvarProduto(`http://127.0.0.1:5000/produtos/${id}`, 'PUT', { nome, preco, categoria, estoque }, () => {
        listarProdutos();
        mostrarSecao('produtos');
    });
}

function criarProduto() {
    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    const categoria = document.getElementById('categoria').value;
    const estoque = document.getElementById('estoque').value;

    if (!nome || !preco || !categoria || !estoque) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    salvarProduto('http://127.0.0.1:5000/produtos', 'POST', { nome, preco, categoria, estoque }, () => {
        listarProdutos();
        mostrarSecao('produtos');
    });
}

function excluirProduto() {
    const id = document.getElementById('deletar-id').value;

    if (!id) {
        alert('Por favor, insira o ID do produto');
        return;
    }

    fetch(`http://127.0.0.1:5000/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (response.ok) {
            listarProdutos();  // Atualiza a lista de produtos após excluir
        } else {
            alert('Erro ao excluir produto');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir produto');
    });
}
function logout() {
    // Limpar o token de autenticação
    token = '';

    // Esconder todas as seções protegidas
    const secoesProtegidas = ['produtos', 'adicionar-produto', 'atualizar-produto', 'deletar-produto'];
    secoesProtegidas.forEach(secaoId => {
        document.getElementById(secaoId).style.display = 'none';
    });

    // Mostrar a seção de login
    mostrarSecao('login');
}