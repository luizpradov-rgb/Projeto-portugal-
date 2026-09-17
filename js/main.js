/* ==========================================================================
   Sol Cabeleireiros — comportamento
   Sem dependências. Tudo degrada com elegância se o JavaScript falhar:
   os contactos já estão escritos no HTML e os links continuam a funcionar.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.SOL || {};
  var doc = document;

  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }

  /* ---------- Links de WhatsApp ---------- */

  function linkWhatsApp(mensagem) {
    var numero = String(cfg.whatsapp || "").replace(/\D/g, "");
    if (!numero) return null;
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem || "");
  }

  /* Abrir o WhatsApp numa janela nova é o melhor caso, mas há sítios onde o
     navegador não deixa: o browser dentro do Instagram e do Facebook, os
     bloqueadores de janelas e as pré-visualizações em caixa fechada. Sem
     alternativa, o botão não fazia rigorosamente nada. Quando a janela nova
     é recusada, seguimos na própria janela — é melhor do que não acontecer
     nada. */
  function abrirLigacao(destino) {
    if (!destino) return false;
    var janela = null;
    try {
      janela = window.open(destino, "_blank");
    } catch (e) {
      janela = null;
    }
    if (janela) {
      try { janela.opener = null; } catch (e) {}
      return true;
    }
    window.location.href = destino;
    return false;
  }

  /* Vale para todas as ligações de WhatsApp da página, incluindo as que
     vierem a ser acrescentadas. O href continua lá, por isso abrir num
     separador novo com o botão direito continua a funcionar, e a página
     também funciona sem JavaScript. */
  function ligacoesWhatsApp() {
    doc.addEventListener("click", function (e) {
      var ligacao = e.target.closest('a[href^="https://wa.me/"]');
      if (!ligacao || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      abrirLigacao(ligacao.getAttribute("href"));
    });
  }

  /* ---------- 1. Escrever os dados do salão no HTML ----------
     O HTML já traz valores por omissão para que o site faça sentido sem
     JavaScript e para que os motores de busca os leiam. Aqui só
     substituímos pelos valores de config.js quando existem.            */

  function aplicarConfiguracao() {
    var mapa = {
      telefone: cfg.telefone,
      email: cfg.email,
      morada: cfg.morada
    };

    Object.keys(mapa).forEach(function (chave) {
      if (!mapa[chave]) return;
      $$('[data-config="' + chave + '"]').forEach(function (no) {
        no.textContent = mapa[chave];
      });
    });

    if (cfg.telefoneInternacional) {
      $$('[data-config="telefoneLink"]').forEach(function (no) {
        no.setAttribute("href", "tel:" + cfg.telefoneInternacional.replace(/\s/g, ""));
      });
    }
    if (cfg.email) {
      $$('[data-config="emailLink"]').forEach(function (no) {
        no.setAttribute("href", "mailto:" + cfg.email);
      });
    }
    if (cfg.instagram) {
      $$('[data-config="instagramLink"]').forEach(function (no) {
        no.setAttribute("href", cfg.instagram);
      });
    }
    if (cfg.morada) {
      $$('[data-config="mapaLink"]').forEach(function (no) {
        no.setAttribute("href",
          "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.morada));
      });
    }

    [["[data-whatsapp-generico]", cfg.mensagemGenerica],
     ["[data-whatsapp-tatuagem]", cfg.mensagemTatuagem]].forEach(function (par) {
      var destino = linkWhatsApp(par[1]);
      if (!destino) return;
      $$(par[0]).forEach(function (no) {
        no.setAttribute("href", destino);
        no.setAttribute("target", "_blank");
        no.setAttribute("rel", "noopener");
      });
    });

    var ano = $("#ano");
    if (ano) ano.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Cabeçalho e menu de telemóvel ---------- */

  function cabecalho() {
    var barra = $("#cabecalho");
    var botao = $("#menu-btn");
    var menu = $("#menu");
    if (!barra || !botao || !menu) return;

    function fechar() {
      menu.classList.remove("menu--aberto");
      botao.setAttribute("aria-expanded", "false");
    }

    botao.addEventListener("click", function () {
      var aberto = menu.classList.toggle("menu--aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) fechar();
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("menu--aberto")) {
        fechar();
        botao.focus();
      }
    });
  }

  /* ---------- 3. Galeria: filtros ---------- */

  var visiveis = [];

  function filtros() {
    var grelha = $("#galeria-grelha");
    if (!grelha) return;

    var botoes = $$(".filtro");
    var itens = $$(".galeria__item", grelha);
    var estado = $("#galeria-estado");

    function aplicar(area) {
      var contados = 0;
      itens.forEach(function (item) {
        var mostrar = area === "todos" || item.dataset.area === area;
        item.hidden = !mostrar;
        if (mostrar) contados++;
      });
      visiveis = $$(".galeria__botao", grelha).filter(function (b) {
        return !b.closest(".galeria__item").hidden;
      });
      if (estado) {
        estado.textContent = contados === 1
          ? "1 trabalho em mostra."
          : contados + " trabalhos em mostra.";
      }
    }

    botoes.forEach(function (botao) {
      botao.addEventListener("click", function () {
        botoes.forEach(function (outro) {
          var activo = outro === botao;
          outro.classList.toggle("filtro--activo", activo);
          outro.setAttribute("aria-pressed", String(activo));
        });
        aplicar(botao.dataset.filtro);
      });
    });

    aplicar("todos");
  }

  /* ---------- 4. Galeria: visor de fotografias ---------- */

  function visor() {
    var caixa = $("#visor");
    if (!caixa) return;

    var imagem = $("#visor-imagem");
    var legenda = $("#visor-legenda");
    var anterior = $("#visor-anterior");
    var seguinte = $("#visor-seguinte");
    var fechar = $("#visor-fechar");
    var indice = 0;
    var origem = null;

    function mostrar(i) {
      if (!visiveis.length) return;
      indice = (i + visiveis.length) % visiveis.length;
      var botao = visiveis[indice];
      var foto = botao.querySelector("img");
      imagem.setAttribute("src", botao.dataset.imagem || foto.getAttribute("src"));
      imagem.setAttribute("alt", foto.getAttribute("alt") || "");
      legenda.textContent = botao.dataset.legenda || "";
      var so = visiveis.length < 2;
      anterior.hidden = so;
      seguinte.hidden = so;
    }

    function abrir(botao) {
      origem = botao;
      var i = visiveis.indexOf(botao);
      mostrar(i < 0 ? 0 : i);
      caixa.hidden = false;
      doc.body.style.overflow = "hidden";
      fechar.focus();
    }

    function sair() {
      caixa.hidden = true;
      doc.body.style.overflow = "";
      if (origem) origem.focus();
      origem = null;
    }

    doc.addEventListener("click", function (e) {
      var botao = e.target.closest(".galeria__botao");
      if (botao) { abrir(botao); return; }
      if (e.target.closest("[data-fechar-visor]")) sair();
    });

    fechar.addEventListener("click", sair);
    anterior.addEventListener("click", function () { mostrar(indice - 1); });
    seguinte.addEventListener("click", function () { mostrar(indice + 1); });

    doc.addEventListener("keydown", function (e) {
      if (caixa.hidden) return;
      if (e.key === "Escape") { sair(); return; }
      if (e.key === "ArrowLeft") { mostrar(indice - 1); return; }
      if (e.key === "ArrowRight") { mostrar(indice + 1); return; }
      if (e.key !== "Tab") return;

      /* Prender o foco dentro do visor enquanto estiver aberto. */
      var focaveis = $$("button:not([hidden])", caixa);
      if (!focaveis.length) return;
      var primeiro = focaveis[0];
      var ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && doc.activeElement === primeiro) {
        e.preventDefault(); ultimo.focus();
      } else if (!e.shiftKey && doc.activeElement === ultimo) {
        e.preventDefault(); primeiro.focus();
      }
    });
  }

  /* ---------- 5. Formulário de marcação ---------- */

  function marcacao() {
    var form = $("#form-marcacao");
    if (!form) return;

    var erro = $("#form-erro");
    var dia = $("#dia");

    /* Não deixar escolher um dia que já passou. */
    if (dia) {
      var hoje = new Date();
      hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
      dia.min = hoje.toISOString().slice(0, 10);
    }

    function marcarCampo(campo, invalido) {
      var envolvente = campo.closest(".campo");
      if (envolvente) envolvente.classList.toggle("campo--invalido", invalido);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nome = $("#nome");
      var servico = $("#servico");
      var faltam = [];

      if (!nome.value.trim()) faltam.push(nome);
      if (!servico.value) faltam.push(servico);

      [nome, servico].forEach(function (campo) {
        marcarCampo(campo, faltam.indexOf(campo) > -1);
      });

      if (faltam.length) {
        erro.textContent = faltam.length > 1
          ? "Falta o nome e o serviço."
          : (faltam[0] === nome ? "Falta o nome." : "Falta escolher o serviço.");
        erro.hidden = false;
        faltam[0].focus();
        return;
      }

      erro.hidden = true;

      var linhas = [
        "Olá! Gostava de marcar no Sol Cabeleireiros.",
        "",
        "Nome: " + nome.value.trim(),
        "Serviço: " + servico.value
      ];

      if (dia && dia.value) {
        var partes = dia.value.split("-");
        linhas.push("Dia que prefiro: " + partes[2] + "/" + partes[1] + "/" + partes[0]);
      }

      var periodo = $("#periodo");
      if (periodo && periodo.value) linhas.push("Altura do dia: " + periodo.value);

      var notas = $("#notas");
      if (notas && notas.value.trim()) linhas.push("Notas: " + notas.value.trim());

      var destino = linkWhatsApp(linhas.join("\n"));
      if (!destino) {
        erro.textContent = "O número de WhatsApp ainda não está configurado. Ligue para o salão, por favor.";
        erro.hidden = false;
        return;
      }

      abrirLigacao(destino);
    });

    form.addEventListener("input", function (e) {
      if (e.target.matches("#nome, #servico")) {
        marcarCampo(e.target, false);
        erro.hidden = true;
      }
    });
  }

  /* ---------- 6. Letras que sobem por trás de um corte ----------
     Só em dois títulos: o do topo, quando a página carrega, e o da tatuagem,
     quando chega à vista. Em todos seria ruído. Cada letra fica dentro de uma
     janela que a esconde, e sobe ao seu tempo — do meio da palavra para fora.
     O texto verdadeiro fica ao lado, invisível mas legível por um leitor de
     ecrã, e a versão partida é escondida da árvore de acessibilidade: ninguém
     ouve a frase soletrada letra a letra.                                  */

  function cortar(titulo) {
    var texto = (titulo.textContent || "").trim();
    if (!texto) return null;

    var original = doc.createElement("span");
    original.className = "so-leitor";
    original.textContent = texto;

    var partido = doc.createElement("span");
    partido.className = "corte";
    partido.setAttribute("aria-hidden", "true");

    var letras = [];
    texto.split(/(\s+)/).forEach(function (pedaco) {
      if (!pedaco) return;
      if (/^\s+$/.test(pedaco)) {
        partido.appendChild(doc.createTextNode(" "));
        return;
      }
      var palavra = doc.createElement("span");
      palavra.className = "corte__palavra";
      pedaco.split("").forEach(function (caracter) {
        var janela = doc.createElement("span");
        janela.className = "corte__janela";
        var letra = doc.createElement("span");
        letra.className = "corte__letra";
        letra.textContent = caracter;
        janela.appendChild(letra);
        palavra.appendChild(janela);
        letras.push(letra);
      });
      partido.appendChild(palavra);
    });

    /* A partir do meio para fora: as letras do centro abrem primeiro. */
    var meio = (letras.length - 1) / 2;
    letras.forEach(function (letra, i) {
      letra.style.setProperty("--atraso-letra", Math.round(Math.abs(i - meio) * 34) + "ms");
    });

    titulo.textContent = "";
    titulo.appendChild(original);
    titulo.appendChild(partido);
    return partido;
  }

  function cortes() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var titulos = $$("[data-corte]");
    if (!titulos.length) return;

    var partidos = [];
    titulos.forEach(function (titulo) {
      var partido = cortar(titulo);
      if (partido) partidos.push({ no: partido, quando: titulo.dataset.corte });
    });
    if (!partidos.length) return;

    doc.documentElement.classList.add("js-corte");

    partidos.forEach(function (p) {
      if (p.quando === "entrada") {
        /* Dois quadros para o navegador assentar antes de arrancar. */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { p.no.classList.add("corte--aberto"); });
        });
        return;
      }
      if (!("IntersectionObserver" in window)) { p.no.classList.add("corte--aberto"); return; }
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("corte--aberto");
          obs.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
      obs.observe(p.no);
    });
  }

  /* ---------- 7. Dar vida ao texto à medida que se rola ----------
     Cada secção levanta-se um pouco quando chega à vista, com os seus
     elementos a entrar uns atrás dos outros. Só uma vez, e nunca para quem
     tenha as animações desligadas no sistema. Se alguma coisa correr mal
     aqui, a página fica simplesmente quieta — nunca invisível.

     As FOTOGRAFIAS ficam de fora de propósito. Aparecem no instante em que
     chegam, sem desvanecer: uma fotografia que se faz esperar é uma
     fotografia que parece lenta, por mais curta que seja a animação. O
     movimento é do texto.                                                */

  var A_REVELAR = [
    ".seccao__abertura > *",
    ".compromisso",
    ".sobre__texto > *",
    ".servico__corpo > *",
    ".tatuagem__texto > *",
    ".filtros",
    ".marcacao__intro > *", ".formulario",
    ".contactos__bloco",
    ".rodape__interior > *"
  ].join(",");

  function animar() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var elementos = $$(A_REVELAR).filter(function (no) {
      if (no.closest(".heroi")) return false;        /* o topo tem entrada própria */
      return !no.hasAttribute("data-corte");         /* nem movimento a dobrar */
    });
    if (!elementos.length) return;

    /* O atraso conta-se dentro de cada secção, para que uma secção comprida
       não acabe com meio segundo de espera no último elemento. */
    var contagem = new Map();
    elementos.forEach(function (no) {
      var seccao = no.closest(".seccao, .rodape") || doc.body;
      var i = contagem.get(seccao) || 0;
      contagem.set(seccao, i + 1);
      no.style.setProperty("--atraso", Math.min(i, 4) * 40 + "ms");
      no.classList.add("revelar");
    });

    doc.documentElement.classList.add("js-animar");

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("revelado");
        observador.unobserve(entrada.target);
      });
      /* A margem positiva faz a revelação começar antes de o elemento
         entrar no ecrã. Quando chega à vista já está quase inteiro — é a
         diferença entre um site que responde e um que se faz esperar. */
    }, { rootMargin: "0px 0px 26% 0px", threshold: 0.01 });

    elementos.forEach(function (no) { observador.observe(no); });
  }

  /* ---------- 8. O botão flutuante entra quando o topo sai ---------- */

  function flutuante() {
    var botao = $(".flutuante");
    var topo = $(".heroi");
    if (!botao || !topo || !("IntersectionObserver" in window)) return;

    doc.documentElement.classList.add("js-flutuante");
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        botao.classList.toggle("flutuante--visivel", !e.isIntersecting);
      });
    }, { threshold: 0 }).observe(topo);
  }

  /* ---------- 9. Arranque ---------- */

  doc.documentElement.classList.add("js-entrada");

  /* Quando a entrada acaba, tiramos a marca. Uma animação com fill-mode
     forwards fixa o transform e impediria, por exemplo, o levantar das cartas
     do leque ao passar o rato. O estado final da animação é igual ao estado
     de repouso do CSS, por isso não há salto nenhum. */
  function fimDaEntrada() {
    window.setTimeout(function () {
      doc.documentElement.classList.remove("js-entrada");
    }, 2000);
  }

  function arrancar() {
    aplicarConfiguracao();
    ligacoesWhatsApp();
    cabecalho();
    filtros();
    visor();
    marcacao();
    flutuante();
    try {
      cortes();
      animar();
      fimDaEntrada();
    } catch (e) {
      /* Nenhuma animação vale uma página em branco. */
      doc.documentElement.classList.remove("js-animar");
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
