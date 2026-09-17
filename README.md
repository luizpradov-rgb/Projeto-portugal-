# Sol Cabeleireiros

Site do salão: cabelo, unhas e estúdio de tatuagem.
HTML, CSS e JavaScript simples — sem build, sem dependências, sem servidor.
Abre-se o ficheiro e funciona.

> **Nota:** a morada, o telefone, o WhatsApp e as fotografias já são os
> verdadeiros. Continuam por confirmar o **email**, o **Instagram** e os
> **textos sobre o salão** — a história, o número de profissionais, o horário
> e as promessas da secção de tatuagem são de exemplo. A secção **O que é
> preciso trocar** diz onde mudar cada coisa. Nada disto exige saber programar.

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
whatsapp: "351967980517",   // indicativo do país + número, só dígitos
telefone: "21 354 02 19",   // o fixo, escrito no toldo
email:    "ola@solcabeleireiros.pt",     // ← por confirmar
morada:   "Rua de Arroios 83A, 1150-053 Lisboa",
instagram: "https://instagram.com/solcabeleireiros",   // ← por confirmar
```

O WhatsApp, o telefone e a morada já são os do salão. O telefone tem o mesmo
número do WhatsApp; se houver uma linha fixa separada, troca-se aqui. O email
e o Instagram continuam a ser exemplos.

O número de WhatsApp é o mais importante: é por aí que chegam as marcações.
Escreve-se sem `+`, sem espaços e sem o zero inicial — para o 967 980 517
escreve-se `351967980517`.

### 2. As fotografias

As fotografias do salão já estão no site, tratadas e otimizadas. A galeria
tem treze trabalhos: sete de cabelo, quatro de unhas e dois de tatuagem.

| Ficheiro | Onde aparece | Formato |
|---|---|---|
| `salao.jpg` | secção «Doze anos na mesma rua» | vertical, 3:4 |
| `serv-cabelo.jpg` | serviço «Cabelo» | vertical, 4:5 |
| `serv-unhas.jpg` | serviço «Unhas» | vertical, 4:5 |
| `tatuagem.jpg` | secção «Tinta com tempo» | vertical, 3:4 |
| `trabalho-01.jpg` … `trabalho-13.jpg` | galeria | ver abaixo |
| `palco.jpg` | fundo do primeiro ecrã | horizontal, 3:2 |
| `montra.jpg` | faixa da rua, a fechar «Onde estamos» | horizontal, 16:9 |
| `logotipo.png` | cabeçalho e rodapé | quadrado, com transparência |
| `og.jpg` | imagem que aparece ao partilhar o link | 1200 × 630 |

#### Fora do site por agora

Duas coisas foram tiradas da página mas não apagadas: a **estética** e o
bloco **«Falar connosco»** dos contactos. Ficaram guardadas em comentário no
`index.html`, marcadas com `ESTÉTICA` e `FALAR CONNOSCO`. Para as repor,
basta tirar esses comentários — as secções voltam sozinhas ao aspecto
antigo, sem mexer no CSS.

#### A estética está fora do site

Não havia fotografias nem informação, por isso a estética saiu da página —
não vale a pena prometer um serviço sem nada para mostrar. Não foi apagada:
ficou guardada em comentário no `index.html`, em três sítios marcados com
`ESTÉTICA`. O serviço, o botão de filtro da galeria e o grupo da lista de
serviços do formulário.

Para a repor, basta tirar esses três comentários e pôr uma fotografia por
cima de `assets/img/serv-estetica.svg`. A secção dos serviços volta sozinha
ao aspecto de dois serviços lado a lado — não é preciso mexer no CSS.

#### Acrescentar um trabalho à galeria

1. Tratar a fotografia (ver abaixo) e gravá-la em `assets/img/` como
   `trabalho-14.jpg`, `trabalho-15.jpg`, e por aí fora.
2. No `index.html`, na secção da galeria, copiar um bloco `<li>` inteiro e
   mudar quatro coisas: `data-area`, o nome do ficheiro (aparece duas
   vezes), o `alt` e a legenda.
3. A classe `galeria__item--alto` é para fotografias verticais. Sem ela, a
   fotografia aparece quadrada.

Se a área for **estética**, ver a secção sobre isso mais acima.

#### Tratar as fotografias antes de as pôr no site

Fotografias vindas do telemóvel têm 4 ou 5 MB e tornam o site lento para
quem o visita — e trazem nos metadados o GPS de onde foram tiradas e o
modelo do telemóvel. As que já estão no site foram reduzidas para cerca de
1000 px do lado maior, gravadas em JPEG com qualidade 82 e limpas de
metadados. As que estão no site ocupam, juntas, cerca de 2 MB — mas só a do topo
da página é carregada de início; as restantes esperam que se chegue a elas.

O ficheiro `ferramentas/tratar-fotos.py` faz isto. Para o usar:

```bash
pip install Pillow
python3 ferramentas/tratar-fotos.py
```

Dentro do ficheiro há uma lista que diz, para cada imagem do site, qual a
fotografia de origem, onde fica o centro do recorte e — quando o trabalho
ocupa só um canto da fotografia — quanto se aproxima dele. É aí que se
mexe para trocar ou reenquadrar uma fotografia.

#### Uma nota sobre autorização

As fotografias mostram clientes reais e algumas mostram rostos. Em
Portugal, publicar a imagem de alguém precisa do consentimento dessa
pessoa, mesmo quando a fotografia é do trabalho do salão. Vale a pena
garantir que está dado antes de o site ir para o ar.

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
assets/img/           imagens, incluindo logotipo.png
assets/fonts/         tipos de letra alojados no próprio site
assets/favicon.png    o ícone do separador, com o S do logótipo
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
