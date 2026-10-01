// =========================================================
// SACIADOSHUB — SISTEMA DE AUTENTICAÇÃO & ACESSO DEMO
// =========================================================

console.log("✦ Login Engine SaciadosHub Inicializado.");

// 1. Alternar visualização de senha
const btnToggleSenha = document.getElementById("btnToggleSenha");
const campoSenha = document.getElementById("senha");

if (btnToggleSenha && campoSenha) {
    btnToggleSenha.addEventListener("click", () => {
        if (campoSenha.type === "password") {
            campoSenha.type = "text";
            btnToggleSenha.textContent = "🙈";
        } else {
            campoSenha.type = "password";
            btnToggleSenha.textContent = "👁️";
        }
    });
}

// 2. Contas de Demonstração Rápidas para Teste
const CONTAS_DEMO = {
    restaurante: {
        id: 101,
        nome: "Restaurante Sabor Solidário",
        email: "contato@saborsolidario.com",
        senha: "123",
        tipo: "restaurante",
        telefone: "(11) 98888-1234",
        cidade: "São Paulo",
        estado: "SP",
        endereco: "Av. Paulista, 1500"
    },
    ong: {
        id: 202,
        nome: "ONG Vida e Luz",
        email: "contato@vidaealuz.org",
        senha: "123",
        tipo: "ong",
        telefone: "(11) 97777-5678",
        cidade: "São Paulo",
        estado: "SP",
        endereco: "Rua Vergueiro, 800"
    },
    voluntario: {
        id: 303,
        nome: "Lucas Voluntário (Bike)",
        email: "lucas.entrega@email.com",
        senha: "123",
        tipo: "voluntario",
        telefone: "(11) 96666-9012",
        cidade: "São Paulo",
        estado: "SP",
        veiculo: "Bicicleta"
    }
};

// 3. Garantir que as contas demo existam no banco local
function semearContasDemoSeNecessario() {
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    } catch (e) {
        usuarios = [];
    }

    Object.values(CONTAS_DEMO).forEach(demo => {
        if (!usuarios.some(u => u.email && u.email.toLowerCase() === demo.email.toLowerCase())) {
            usuarios.push(demo);
        }
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

semearContasDemoSeNecessario();

// 4. Função Global para Login Rápido com 1 Clique
window.loginDemoPerfil = function(tipo) {
    const demo = CONTAS_DEMO[tipo];
    if (!demo) return;

    exibirMensagemStatus(`Entrando como ${demo.nome}...`, "success");

    localStorage.setItem("usuarioAtual", JSON.stringify(demo));

    setTimeout(() => {
        // Redireciona de volta para a página inicial para ver o novo estado no topo
        window.location.href = "index.html";
    }, 600);
};

// 5. Exibir Mensagem de Alerta Estilizada
function exibirMensagemStatus(mensagem, tipo = "error") {
    const box = document.getElementById("loginAlertBox");
    if (!box) {
        alert(mensagem);
        return;
    }

    box.className = `login-alert-box ${tipo}`;
    box.innerHTML = `
        <span>${tipo === "error" ? "⚠️" : "✅"}</span>
        <span>${mensagem}</span>
    `;
    box.style.display = "flex";
}

// 6. Submissão Padrão do Formulário
const formulario = document.getElementById("formLogin");

if (formulario) {
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        let usuarios = [];
        try {
            usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        } catch (err) {
            usuarios = [];
        }

        // Buscar usuário cadastrado
        let usuarioEncontrado = usuarios.find(
            u => u.email && u.email.toLowerCase() === email && u.senha === senha
        );

        // Fallback: verificar nas contas demo
        if (!usuarioEncontrado) {
            const demoMatch = Object.values(CONTAS_DEMO).find(
                d => d.email.toLowerCase() === email && (d.senha === senha || senha === "123")
            );
            if (demoMatch) {
                usuarioEncontrado = demoMatch;
            }
        }

        if (!usuarioEncontrado) {
            exibirMensagemStatus("E-mail ou senha incorretos. Verifique suas credenciais ou use o acesso de teste.", "error");
            return;
        }

        // Normalizar tipo
        const tipo = String(usuarioEncontrado.tipo || "").trim().toLowerCase();
        usuarioEncontrado.tipo = tipo;

        // Salvar sessão ativa
        localStorage.setItem("usuarioAtual", JSON.stringify(usuarioEncontrado));

        exibirMensagemStatus(`Login realizado com sucesso! Bem-vindo(a), ${usuarioEncontrado.nome || "Usuário"}.`, "success");

        // Redirecionamento inteligente
        setTimeout(() => {
            // Se veio da home querendo ver a home atualizada, redireciona para index.html
            // Ou se preferir painel específico:
            if (tipo === "restaurante") {
                window.location.href = "index.html";
            } else if (tipo === "ong") {
                window.location.href = "index.html";
            } else if (tipo === "voluntario" || tipo === "voluntária") {
                window.location.href = "index.html";
            } else {
                window.location.href = "index.html";
            }
        }, 700);
    });
}