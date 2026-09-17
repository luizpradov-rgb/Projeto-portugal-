# Sol Cabeleireiros

Site do salão: cabelo, unhas, estética e estúdio de tatuagem.
HTML, CSS e JavaScript simples — sem build, sem dependências, sem servidor.
Abre-se o ficheiro e funciona.

> **Nota:** os textos, a morada, o telefone e as fotografias são de exemplo,
> para dar forma ao site. A secção **O que é preciso trocar** diz onde mudar cada
> coisa. Nada disto exige saber programar.

---

## Ver o site no computador

Basta abrir o ficheiro `index.html` com um duplo clique.

Para o ver como ficará publicado (com os endereços certos), dentro da pasta:

```bash
python3 -m http.server 8000
```

E abrir <http://localhost:8000> no navegador.

---

## O que é preciso trocar

### 1. Os contactos do salão — só um ficheiro

Abrir `js/config.js` e mudar os valores. Tudo o resto do site acompanha
sozinho: os botões de WhatsApp, os links de chamada, o mapa e o rodapé.

```js
whatsapp: "351912345678",   // indicativo do país + número, só dígitos
telefone: "21 000 00 00",
email:    "ola@solcabeleireiros.pt",
morada:   "Rua da Graça 120, 1170-165 Lisboa",
instagram: "https://instagram.com/solcabeleireiros",
```

O número de WhatsApp é o mais importante: é por aí que chegam as marcações.
Escreve-se sem `+`, sem espaços e sem o zero inicial — para o 912 345 678
escreve-se `351912345678`.

### 2. As fotografias

As imagens que lá estão são desenhos de marcador, feitos nas cores do site.
Para as trocar por fotografias reais, basta **gravar a foto por cima do
ficheiro com o mesmo nome**, dentro de `assets/img/`.

| Ficheiro | Onde aparece | Formato |
|---|---|---|
| `heroi.svg` | topo da página | vertical, 3:4 |
| `salao.svg` | secção «Doze anos na mesma rua» | vertical, 3:4 |
| `serv-cabelo.svg` | serviço «Cabelo» | vertical, 3:4 |
| `serv-unhas.svg` | serviço «Unhas» | vertical, 4:5 |
| `serv-estetica.svg` | serviço «Estética» | vertical, 4:5 |
| `tatuagem.svg` | secção «Tinta com tempo» | vertical, 3:4 |
| `trabalho-01.svg` … `trabalho-12.svg` | galeria | ver abaixo |
| `og.svg` | imagem que aparece ao partilhar o link | 1200 × 630 |

Na galeria, os números **01, 05 e 08** são altos (3:4) e os restantes
quadrados (1:1). O site corta a foto ao tamanho certo, por isso o que
interessa é que o motivo fique ao centro.

Se as fotos forem `.jpg` (o normal), é preciso mudar também a extensão no
`index.html`: procurar `trabalho-01.svg` e escrever `trabalho-01.jpg`. Cada
fotografia aparece duas vezes na mesma linha — em `src` e em `data-imagem`.

**Antes de as pôr no site:** redimensionar para cerca de 1200 px do lado
maior e gravar em JPEG com qualidade 80. Fotografias vindas do telemóvel
têm 4 ou 5 MB e tornam o site lento no telemóvel de quem o visita.

Ao trocar uma fotografia, mudar também a descrição (`alt="…"`) que está
nessa linha do `index.html`. É o que leem as pessoas invisuais e o Google.

### 3. Os textos

Estão todos no `index.html`, em português, entre as marcas de secção
(`<!-- ══ SERVIÇOS ══ -->` e assim por diante). Podem ser alterados
diretamente.

Há três sítios que convém rever com atenção, porque prometem coisas
concretas ao cliente: o **horário**, os **preços que não estão lá** (o site
não mostra preços de propósito) e as frases da secção de tatuagem sobre a
conversa não se pagar e o retoque até seis meses.

---

## Publicar

Qualquer um destes serviços aloja o site de graça:

- **Netlify** — <https://app.netlify.com/drop>: arrastar a pasta para a página.
  É o caminho mais curto; fica online em segundos.
- **GitHub Pages** — nas definições do repositório, *Pages*, escolher o ramo
  e a pasta `/`.
- **Vercel** — importar o repositório, sem configuração nenhuma.

Depois, no `index.html`, trocar `https://www.solcabeleireiros.pt/` pelo
endereço verdadeiro (aparece nas linhas `canonical`, `og:url` e `og:image`,
e no bloco de dados estruturados no fim do ficheiro).

---

## Como está organizado

```
index.html            a página toda
css/style.css         o aspecto — as cores estão todas no topo, em :root
css/fontes.css        os tipos de letra
js/config.js          os dados do salão  ← é aqui que se muda o essencial
js/main.js            menu, filtros da galeria, visor de fotos, formulário
assets/img/           imagens
assets/fonts/         tipos de letra alojados no próprio site
assets/favicon.svg    o ícone do separador do navegador
```

### Decisões que vale a pena conhecer

**As marcações vão por WhatsApp, não por email.** O formulário não envia nada
sozinho: escreve a mensagem, abre o WhatsApp do salão e deixa a pessoa
carregar em enviar. Isso evita precisar de servidor, de base de dados e de
manutenção — e é como as clientes já estão habituadas a marcar.

**Os tipos de letra estão dentro do site**, em vez de virem do Google Fonts.
Carregam mais depressa e o site não faz pedidos a servidores de terceiros,
o que evita o problema de RGPD que isso levanta na Europa.

**As cores mudam-se num sítio só.** No topo do `css/style.css`, em `:root`,
estão todas com nome (`--areia`, `--ouro`, `--onix`). Mudar aí muda a página
inteira.

**O site foi verificado** com leitor de ecrã em mente: funciona só com
teclado, o contraste do texto cumpre a norma AA em todos os elementos, e
respeita quem tenha animações desligadas no sistema.
