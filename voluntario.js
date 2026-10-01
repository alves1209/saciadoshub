console.log("VOLUNTARIO.JS CARREGADO");



const usuario = JSON.parse(

    localStorage.getItem("usuarioAtual")

);





if (!usuario || (String(usuario.tipo || "").toLowerCase().trim() !== "voluntario" && String(usuario.tipo || "").toLowerCase().trim() !== "voluntária")) {
    alert("Acesso permitido somente para voluntários!");
    window.location.href = "login.html";
}






const lista = document.getElementById("listaEntregas");

const historico = document.getElementById("historicoEntregas");









// mostrar entregas disponíveis

function carregarEntregas(){


    lista.innerHTML = "";



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];





    const entregas = doacoes.filter(

        doacao => doacao.status === "Aceita pela ONG"

    );





    if(entregas.length === 0){


        lista.innerHTML = `

        <tr>

        <td colspan="7">

        Nenhuma entrega disponível.

        </td>

        </tr>

        `;


        return;

    }






    entregas.forEach((doacao,index)=>{


        lista.innerHTML += `


        <tr>


        <td>${doacao.alimento}</td>


        <td>${doacao.quantidade} kg</td>


        <td>${doacao.restaurante}</td>


        <td>${doacao.ong}</td>


        <td>${doacao.local}</td>


        <td>${doacao.status}</td>


        <td>


        <button 

        class="btn-cadastro"

        onclick="pegarEntrega(${index})">

        Aceitar

        </button>


        </td>


        </tr>


        `;


    });



}











// aceitar entrega

window.pegarEntrega = function(index){



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];





    const entregas = doacoes.filter(

        doacao => doacao.status === "Aceita pela ONG"

    );





    const entrega = entregas[index];



    const posicao = doacoes.indexOf(entrega);







    doacoes[posicao].status = "Em transporte";


    doacoes[posicao].voluntario = usuario.nome;


    doacoes[posicao].dataEntrega = 

    new Date().toLocaleDateString();






    localStorage.setItem(

        "doacoes",

        JSON.stringify(doacoes)

    );





    alert("Entrega aceita!");



    carregarEntregas();

    carregarHistorico();

    atualizarDashboard();



};











// finalizar entrega

window.finalizarEntrega = function(index){



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];





    const minhasEntregas = doacoes.filter(

        doacao => doacao.voluntario === usuario.nome

        && doacao.status === "Em transporte"

    );





    const entrega = minhasEntregas[index];



    const posicao = doacoes.indexOf(entrega);







    doacoes[posicao].status = "Entregue";



    doacoes[posicao].dataFinal = 

    new Date().toLocaleDateString();







    localStorage.setItem(

        "doacoes",

        JSON.stringify(doacoes)

    );






    alert("Entrega finalizada com sucesso!");



    carregarHistorico();

    atualizarDashboard();



};











// histórico do voluntário

function carregarHistorico(){


    historico.innerHTML = "";



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];






    const minhas = doacoes.filter(

        doacao => doacao.voluntario === usuario.nome

    );







    if(minhas.length === 0){


        historico.innerHTML = `

        <tr>

        <td colspan="5">

        Nenhuma entrega realizada.

        </td>

        </tr>

        `;


        return;

    }







    minhas.forEach((doacao,index)=>{


        let botao = "";



        if(doacao.status === "Em transporte"){


            botao = `

            <button

            class="btn-cadastro"

            onclick="finalizarEntrega(${index})">

            Finalizar Entrega

            </button>

            `;


        }






        historico.innerHTML += `


        <tr>


        <td>${doacao.alimento}</td>


        <td>${doacao.ong}</td>


        <td>${doacao.dataFinal || doacao.dataEntrega}</td>


        <td>${doacao.status}</td>


        <td>${botao}</td>


        </tr>


        `;


    });



}









// DASHBOARD

function atualizarDashboard(){



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];





    const minhas = doacoes.filter(

        doacao => doacao.voluntario === usuario.nome

    );





    const total = minhas.length;


    const transporte = minhas.filter(

        doacao => doacao.status === "Em transporte"

    ).length;



    const entregues = minhas.filter(

        doacao => doacao.status === "Entregue"

    ).length;






    document.getElementById("totalEntregas").innerHTML = total;


    document.getElementById("emTransporte").innerHTML = transporte;


    document.getElementById("entregues").innerHTML = entregues;



    criarGrafico(transporte, entregues);



}









function criarGrafico(transporte, entregues){



    const canvas = document.getElementById("graficoEntregas");



    if(!canvas) return;





    new Chart(canvas, {


        type:"doughnut",


        data:{


            labels:[

                "Em Transporte",

                "Entregues"

            ],


            datasets:[{


                data:[

                    transporte,

                    entregues

                ]

            }]


        }


    });



}











// botão sair

const sair = document.getElementById("sair");


sair.addEventListener("click", ()=>{


    localStorage.removeItem("usuarioAtual");


    window.location.href = "login.html";


});








carregarEntregas();

carregarHistorico();

atualizarDashboard();