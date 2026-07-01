let modoEdicao = false;

let dados = JSON.parse(
    localStorage.getItem("dados")
);

async function carregarInicial() {

    if (
        dados &&
        dados.tabs &&
        Object.keys(dados.tabs).length > 0
    ) {

        render();
        return;
    }

    try {

        const resposta =
            await fetch(
                "./produtos.json?v=" + Date.now()
            );

        const json =
            await resposta.json();

        dados = {

            tabAtual:
                json.tabs[0]?.nome || "",

            tabs: {}

        };

        json.tabs.forEach(tab => {

            dados.tabs[
                tab.nome
            ] = {};

            tab.categorias.forEach(cat => {

                dados.tabs[
                    tab.nome
                ][cat.nome] = {};

                cat.produtos.forEach(prod => {

                    dados.tabs[
                        tab.nome
                    ][
                        cat.nome
                    ][prod] = 0;

                });

            });

        });

        guardar();

    }
    catch (e) {

        console.error(e);

        dados = {

            tabAtual: "",
            tabs: {}

        };

        render();

    }

}

function guardar() {

    localStorage.setItem(
        "dados",
        JSON.stringify(dados)
    );

    render();

}

function alternarEdicao() {

    modoEdicao = !modoEdicao;

    document
        .getElementById(
            "botaoEditar"
        )
        .innerText =
        modoEdicao
            ? "Fechar edição"
            : "Editar";

    render();

}

function renderBotoesEdicao() {

    if (!modoEdicao) {

        document
            .getElementById(
                "areaEdicao"
            )
            .innerHTML = "";

        return;
    }

    document
        .getElementById(
            "areaEdicao"
        )
        .innerHTML = `

<button
class="btn btn-primary btn-sm ms-2"
onclick="novaTab()">

+ Nova Aba

</button>

<button
class="btn btn-secondary btn-sm ms-2"
onclick="novaCategoria()">

+ Categoria

</button>

`;

}

function novaTab() {

    let nome =
        prompt(
            "Nome da aba:"
        );

    if (!nome) return;

    dados.tabs[nome] = {};

    dados.tabAtual = nome;

    guardar();

}

function trocarTab(nome) {

    dados.tabAtual = nome;

    guardar();

}

function novaCategoria() {

    if (!dados.tabAtual) {

        alert(
            "Crie uma aba primeiro"
        );

        return;

    }

    let nome =
        prompt(
            "Nome categoria:"
        );

    if (!nome) return;

    dados.tabs[
        dados.tabAtual
    ][nome] = {};

    guardar();

}

function removerCategoria(nome) {

    if (
        !confirm(
            "Remover categoria?"
        )
    ) return;

    delete dados.tabs[
        dados.tabAtual
    ][nome];

    guardar();

}

function novoProduto(categoria) {

    let nome =
        prompt(
            "Nome produto:"
        );

    if (!nome) return;

    dados.tabs[
        dados.tabAtual
    ][categoria][nome] = 0;

    guardar();

}

function removerProduto(
    categoria,
    produto
) {

    delete dados.tabs[
        dados.tabAtual
    ][categoria][produto];

    guardar();

}

function alterar(
    categoria,
    produto,
    valor
) {

    let atual =
        dados.tabs[
            dados.tabAtual
        ][categoria][produto];

    dados.tabs[
        dados.tabAtual
    ][categoria][produto] =
        Math.max(
            0,
            atual + valor
        );

    guardar();

}

function resetTab() {

    if (
        !confirm(
            "Tem a certeza que pretende fazer reset desta aba?"
        )
    ) {
        return;
    }

    Object.entries(

        dados.tabs[
            dados.tabAtual
        ]

    ).forEach(

        ([categoria, produtos]) => {

            Object.keys(
                produtos
            ).forEach(

                produto => {

                    dados.tabs[
                        dados.tabAtual
                    ][categoria][produto] = 0;

                }

            );

        }

    );

    guardar();

}

function mostrarExportacao() {

    let txt =
        dados.tabAtual +
        "\n\n";

    Object.values(

        dados.tabs[
            dados.tabAtual
        ]

    ).forEach(

        produtos => {

            Object.entries(
                produtos
            )

            .filter(
                ([p, q]) =>
                    q > 0
            )

            .forEach(

                ([p, q]) => {

                    txt +=
                        q +
                        " x " +
                        p +
                        "\n";

                }

            );

        }

    );

    alert(txt);

    navigator.clipboard.writeText(
        txt
    );

}

function exportarJSON() {

    let estrutura = {

        tabs: []

    };

    Object.entries(
        dados.tabs
    )

    .forEach(

        ([tab, categorias]) => {

            let t = {

                nome: tab,
                categorias: []

            };

            Object.entries(
                categorias
            )

            .forEach(

                ([cat, produtos]) => {

                    t.categorias.push({

                        nome: cat,

                        produtos:
                            Object.keys(
                                produtos
                            )

                    });

                }

            );

            estrutura.tabs.push(
                t
            );

        }

    );

    let texto =
        JSON.stringify(
            estrutura,
            null,
            2
        );

    let blob =
        new Blob(
            [texto],
            {
                type:
                    "application/json"
            }
        );

    let a =
        document.createElement(
            "a"
        );

    a.href =
        URL.createObjectURL(
            blob
        );

    a.download =
        "produtos.json";

    a.click();

}

function renderTabs() {

    let html = "";

    Object.keys(
        dados.tabs
    )

    .forEach(

        tab => {

            html += `

<button
class="btn ${
tab===dados.tabAtual
?
'btn-primary'
:
'btn-outline-primary'
}
me-2 mb-2"

onclick="
trocarTab(
'${tab}'
)
">

${tab}

</button>

`;

        }

    );

    document
        .getElementById(
            "tabs"
        )
        .innerHTML =
        html;

}

function render() {

    renderBotoesEdicao();

    renderTabs();

    if (!dados.tabAtual) {

        document
            .getElementById(
                "conteudo"
            )
            .innerHTML =
            "Crie uma aba";

        return;

    }

    let html = "";

    Object.entries(

        dados.tabs[
            dados.tabAtual
        ]

    )

    .forEach(

        ([categoria, produtos]) => {

            html += `

<div class="categoria">

<h5>

${categoria}

${
modoEdicao
?
`
<button
class="btn btn-danger btn-sm ms-2"
onclick="
removerCategoria(
'${categoria}'
)
">

X

</button>
`
:
""
}

</h5>

${
modoEdicao
?
`
<button
class="btn btn-secondary btn-sm mb-3"
onclick="
novoProduto(
'${categoria}'
)
">

+ Produto

</button>
`
:
""
}
`;

            Object.entries(
                produtos
            )

            .forEach(

                ([produto, qtd]) => {

                    html += `

<div class="produto">

<div>

${produto}

${
modoEdicao
?
`
<button
class="btn btn-danger btn-sm ms-2"
onclick="
removerProduto(
'${categoria}',
'${produto}'
)
">

X

</button>
`
:
""
}

</div>

<div>

<button
class="btn btn-secondary btn-sm"
onclick="
alterar(
'${categoria}',
'${produto}',
-1
)
">

-

</button>

<span class="qtd">

${qtd}

</span>

<button
class="btn btn-primary btn-sm"
onclick="
alterar(
'${categoria}',
'${produto}',
1
)
">

+

</button>

</div>

</div>

`;

                }

            );

            html += `</div>`;

        }

    );

    document
        .getElementById(
            "conteudo"
        )
        .innerHTML =
        html;

}

if (
    'serviceWorker' in navigator
) {

    navigator.serviceWorker.register(
        'service-worker.js'
    );

}

carregarInicial();
