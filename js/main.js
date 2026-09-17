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

    var aoRolar = function () {
      barra.classList.toggle("cabecalho--pousado", window.scrollY > 12);
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });

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

      window.open(destino, "_blank", "noopener");
    });

    form.addEventListener("input", function (e) {
      if (e.target.matches("#nome, #servico")) {
        marcarCampo(e.target, false);
        erro.hidden = true;
      }
    });
  }

  /* ---------- 6. Arranque ---------- */

  doc.documentElement.classList.add("js-entrada");

  function arrancar() {
    aplicarConfiguracao();
    cabecalho();
    filtros();
    visor();
    marcacao();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
