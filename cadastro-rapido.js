// ========================================
// SACIADOSHUB - CADASTRO POR VOZ
// ========================================

const form = document.getElementById("formCadastro");

const tipo = document.getElementById("tipo");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const endereco = document.getElementById("endereco");
const cidade = document.getElementById("cidade");
const estado = document.getElementById("estado");
const senha = document.getElementById("senha");

const mensagem = document.getElementById("mensagemAssistente");

const btnFalar = document.getElementById("btnFalar");
const btnRepetir = document.getElementById("btnRepetir");


// ========================================
// RECONHECIMENTO DE VOZ
// ========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let reconhecimento = null;

if (SpeechRecognition) {

    reconhecimento = new SpeechRecognition();

    reconhecimento.lang = "pt-BR";

    reconhecimento.continuous = false;

    reconhecimento.interimResults = false;

} else {

    mensagem.textContent =
        "Seu navegador não possui reconhecimento de voz. Use Google Chrome.";

}


// ========================================
// PERGUNTAS
// ========================================

const perguntas = [

    {
        campo: "tipo",
        texto:
            "Olá! Vamos começar. Você é restaurante, ONG ou voluntário?"
    },

    {
        campo: "nome",
        texto:
            "Qual é o nome?"
    },

    {
        campo: "email",
        texto:
            "Qual é o seu e-mail?"
    },

    {
        campo: "telefone",
        texto:
            "Qual é o seu telefone?"
    },

    {
        campo: "endereco",
        texto:
            "Qual é o seu endereço?"
    },

    {
        campo: "cidade",
        texto:
            "Qual é a sua cidade?"
    },

    {
        campo: "estado",
        texto:
            "Qual é o seu estado?"
    },

    {
        campo: "senha",
        texto:
            "Agora digite sua senha manualmente por segurança."
    }

];


let perguntaAtual = 0;

let cadastroIniciado = false;


// ========================================
// ASSISTENTE FALA
// ========================================

function falar(texto) {

    if (!window.speechSynthesis) {

        return Promise.resolve();

    }

    return new Promise(function(resolve) {

        speechSynthesis.cancel();

        const voz =
            new SpeechSynthesisUtterance(texto);

        voz.lang = "pt-BR";

        voz.rate = 0.95;

        voz.pitch = 1;

        voz.onend = function() {

            resolve();

        };

        speechSynthesis.speak(voz);

    });

}


// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(texto) {

    mensagem.textContent = texto;

}


// ========================================
// FAZER PERGUNTA
// ========================================

async function fazerPergunta() {

    if (
        perguntaAtual >= perguntas.length
    ) {

        finalizarAssistente();

        return;

    }


    const pergunta =
        perguntas[perguntaAtual];


    mostrarMensagem(
        pergunta.texto
    );


    // ====================================
    // SENHA
    // ====================================

    if (
        pergunta.campo === "senha"
    ) {

        await falar(
            pergunta.texto
        );

        senha.focus();

        return;

    }


    // ====================================
    // FALAR
    // ====================================

    await falar(
        pergunta.texto
    );


    // ====================================
    // AGORA ESCUTA
    // ====================================

    iniciarMicrofone();

}


// ========================================
// INICIAR MICROFONE
// ========================================

function iniciarMicrofone() {

    if (!reconhecimento) {

        return;

    }


    mostrarMensagem(
        "🎤 Estou ouvindo..."
    );


    try {

        reconhecimento.start();

    } catch (erro) {

        console.log(
            "Microfone já está ativo."
        );

    }

}


// ========================================
// RESULTADO DO MICROFONE
// ========================================

if (reconhecimento) {

    reconhecimento.onresult =
        function(event) {


            const texto =
                event
                    .results[0][0]
                    .transcript
                    .trim();


            console.log(
                "Resposta:",
                texto
            );


            const pergunta =
                perguntas[perguntaAtual];


            if (!pergunta) {

                return;

            }


            // =================================
            // TIPO
            // =================================

            if (
                pergunta.campo ===
                "tipo"
            ) {

                const resultado =
                    reconhecerTipo(texto);


                if (!resultado) {

                    mostrarMensagem(
                        "Não entendi. Diga restaurante, ONG ou voluntário."
                    );


                    falar(
                        "Não entendi. Diga restaurante, ONG ou voluntário."
                    ).then(function() {

                        iniciarMicrofone();

                    });


                    return;

                }

            }

            else {

                const campo =
                    document.getElementById(
                        pergunta.campo
                    );


                campo.value =
                    texto;

            }


            // =================================
            // PRÓXIMA PERGUNTA
            // =================================

            perguntaAtual++;


            setTimeout(
                function() {

                    fazerPergunta();

                },
                500
            );

        };


    // =====================================
    // ERRO
    // =====================================

    reconhecimento.onerror =
        function(event) {

            console.log(
                "Erro do microfone:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                mostrarMensagem(
                    "⚠️ Permita o uso do microfone no navegador."
                );

                falar(
                    "Por favor, permita o uso do microfone."
                );

                return;

            }


            mostrarMensagem(
                "Não consegui ouvir. Tente novamente."
            );

        };


    // =====================================
    // MICROFONE TERMINOU
    // =====================================

    reconhecimento.onend =
        function() {

            console.log(
                "Microfone encerrado."
            );

        };

}


// ========================================
// RECONHECER TIPO
// ========================================

function reconhecerTipo(texto) {

    const valor =
        texto
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );


    if (
        valor.includes(
            "restaurante"
        )
    ) {

        tipo.value =
            "restaurante";

        return true;

    }


    if (
        valor.includes(
            "ong"
        ) ||
        valor.includes(
            "organizacao"
        )
    ) {

        tipo.value =
            "ong";

        return true;

    }


    if (
        valor.includes(
            "voluntario"
        ) ||
        valor.includes(
            "voluntaria"
        )
    ) {

        tipo.value =
            "voluntario";

        return true;

    }


    return false;

}


// ========================================
// BOTÃO COMEÇAR
// ========================================

btnFalar.addEventListener(
    "click",
    function() {


        if (!reconhecimento) {

            alert(
                "Use Google Chrome ou Microsoft Edge."
            );

            return;

        }


        if (cadastroIniciado) {

            return;

        }


        cadastroIniciado =
            true;


        btnFalar.disabled =
            true;


        btnFalar.textContent =
            "🎤 Cadastro em andamento";


        perguntaAtual =
            0;


        fazerPergunta();

    }
);


// ========================================
// REPETIR
// ========================================

btnRepetir.addEventListener(
    "click",
    function() {


        if (
            perguntaAtual >=
            perguntas.length
        ) {

            return;

        }


        const pergunta =
            perguntas[perguntaAtual];


        falar(
            pergunta.texto
        );

    }
);


// ========================================
// FINALIZAR ASSISTENTE
// ========================================

function finalizarAssistente() {

    mostrarMensagem(
        "🎉 Pronto! Confira seus dados."
    );


    falar(
        "Pronto! Confira seus dados e clique em Criar cadastro."
    );

}


// ========================================
// CADASTRAR
// ========================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (
            !tipo.value ||
            !nome.value ||
            !email.value ||
            !telefone.value ||
            !endereco.value ||
            !cidade.value ||
            !estado.value ||
            !senha.value
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;

        }


        const usuario = {

            id: Date.now(),

            tipo: tipo.value,

            nome: nome.value,

            email: email.value,

            telefone: telefone.value,

            endereco: endereco.value,

            cidade: cidade.value,

            estado: estado.value,

            senha: senha.value

        };


        let usuarios =
            JSON.parse(
                localStorage.getItem(
                    "usuarios"
                )
            ) || [];


        usuarios.push(usuario);


        localStorage.setItem(
            "usuarios",
            JSON.stringify(usuarios)
        );


        localStorage.setItem(
            "usuarioAtual",
            JSON.stringify(usuario)
        );


        falar(
            "Cadastro realizado com sucesso!"
        );


        alert(
            "Cadastro realizado com sucesso!"
        );


        // =================================
        // IR PARA O PAINEL
        // =================================

        if (
            usuario.tipo ===
            "restaurante"
        ) {

            window.location.href =
                "painel-restaurante.html";

        }

        else if (
            usuario.tipo ===
            "ong"
        ) {

            window.location.href =
                "painel-ong.html";

        }

        else if (
            usuario.tipo ===
            "voluntario"
        ) {

            window.location.href =
                "painel-voluntario.html";

        }

    }
);