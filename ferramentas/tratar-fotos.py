# -*- coding: utf-8 -*-
"""Prepara as fotografias do salão para o site.
Aplica a orientação EXIF, recorta ao formato de cada lugar, reduz o tamanho
e grava sem metadados — as fotos de telemóvel trazem GPS e modelo do
aparelho, que não têm nada que ir para um site público."""
import os
from PIL import Image, ImageOps

# Pasta onde estão as fotografias originais, tal como saíram do telemóvel.
ORIGEM = 'fotos-originais'
DESTINO = 'assets/img'

# Nome curto -> ficheiro original. Para trocar uma fotografia, basta mudar
# aqui o nome do ficheiro: tudo o que a usa passa a usar a nova.
FOTOS = {
    'polvo':     'polvo.jpg',      # tatuagem: polvo em blackwork
    'bussola':   'bussola.jpg',    # tatuagem: bússola, veleiro e âncora
    'liso':      'liso.jpg',       # cabelo: alisamento
    'madeixas':  'madeixas.jpg',   # cabelo: madeixas caramelo
    'corte-a':   'corte-a.jpg',    # cabelo: corte masculino, com o salão ao fundo
    'platinado': 'platinado.jpg',  # cabelo: loiro platinado com madeixas
    'ruivo':     'ruivo.jpg',      # cabelo: ruivo acobreado
    'cinza':     'cinza.jpg',      # cabelo: loiro cinza com madeixas
    'dourado':   'dourado.jpg',    # cabelo: loiro dourado com pontas em caracol
    'corte-b':   'corte-b.jpg',    # cabelo: corte masculino clássico
    'corte-c':   'corte-c.jpg',    # cabelo: corte masculino texturizado
    'chrome':    'chrome.jpg',     # unhas: cromado lilás com laço de cristais
    'magenta':   'magenta.jpg',    # unhas: gel magenta em bico redondo
    'vermelho':  'vermelho.jpg',   # unhas: gel vermelho comprido
    'azeitona':  'azeitona.jpg',   # unhas: verniz gel verde-azeitona, curtas
    'montra':    'montra.jpg',     # a montra do salão, na rua
}

# (ficheiro, foto, largura, proporção, foco horizontal, foco vertical, aproximação)
# O foco é a fração do eixo que fica no centro do recorte: 0,5 é o meio.
# A aproximação é opcional: 1 usa o maior recorte possível, 0,6 aproxima-se
# do motivo — útil quando o trabalho ocupa um canto pequeno da fotografia.
TRABALHO = [
    # --- imagens grandes ---
    # O topo da página é um leque de três cartas, uma por área do salão.
    ('heroi-1.jpg',      'chrome',     660, 4/5,      0.56, 0.32),
    ('heroi-2.jpg',      'ruivo',      720, 4/5,      0.50, 0.40),
    ('heroi-3.jpg',      'polvo',      660, 4/5,      0.52, 0.48),
    ('salao.jpg',        'corte-a',   1000, 3/4,      0.52, 0.44),
    ('serv-cabelo.jpg',  'platinado',  900, 4/5,      0.52, 0.40),
    ('serv-unhas.jpg',   'chrome',     900, 4/5,      0.56, 0.34),
    ('tatuagem.jpg',     'polvo',     1000, 3/4,      0.52, 0.50),
    ('og.jpg',           'corte-a',   1200, 1200/630, 0.50, 0.40),
    ('montra.jpg',       'montra',    1210, 16/9,     0.50, 0.46),

    # --- galeria: verticais em 3:4, planos curtos em quadrado ---
    ('trabalho-01.jpg', 'madeixas',   800, 3/4, 0.50, 0.46),
    ('trabalho-02.jpg', 'chrome',     760, 1/1, 0.56, 0.30),
    ('trabalho-03.jpg', 'ruivo',      800, 3/4, 0.50, 0.42),
    ('trabalho-04.jpg', 'polvo',      800, 3/4, 0.52, 0.50),
    ('trabalho-05.jpg', 'magenta',    760, 1/1, 0.46, 0.34),
    ('trabalho-06.jpg', 'cinza',      800, 3/4, 0.50, 0.50),
    ('trabalho-07.jpg', 'corte-c',    760, 1/1, 0.50, 0.40),
    ('trabalho-08.jpg', 'vermelho',   760, 1/1, 0.50, 0.22, 0.82),
    ('trabalho-09.jpg', 'dourado',    800, 3/4, 0.50, 0.48),
    ('trabalho-10.jpg', 'bussola',    760, 1/1, 0.52, 0.50),
    ('trabalho-11.jpg', 'liso',       800, 3/4, 0.50, 0.44),
    ('trabalho-12.jpg', 'azeitona',   760, 1/1, 0.66, 0.20, 0.56),
    ('trabalho-13.jpg', 'corte-b',    760, 1/1, 0.46, 0.34),
]


def recortar(im, proporcao, fx, fy, aproximacao=1.0):
    """Recorte na proporção pedida, colocado pelo foco e opcionalmente
    aproximado do motivo."""
    la, al = im.size
    if la / al > proporcao:
        nova_la, nova_al = al * proporcao, float(al)
    else:
        nova_la, nova_al = float(la), la / proporcao
    nova_la = int(round(nova_la * aproximacao))
    nova_al = int(round(nova_al * aproximacao))
    x = int(round((la - nova_la) * fx))
    y = int(round((al - nova_al) * fy))
    return im.crop((x, y, x + nova_la, y + nova_al))


total = 0
for linha in TRABALHO:
    nome, chave, largura, proporcao, fx, fy = linha[:6]
    aproximacao = linha[6] if len(linha) > 6 else 1.0

    origem = os.path.join(ORIGEM, FOTOS[chave])
    im = ImageOps.exif_transpose(Image.open(origem)).convert('RGB')
    im = recortar(im, proporcao, fx, fy, aproximacao)

    # Nunca ampliar: uma fotografia esticada para além do que tem fica mole.
    largura = min(largura, im.width)
    altura = int(round(largura / proporcao))
    im = im.resize((largura, altura), Image.LANCZOS)

    # Imagem nova, sem nada herdado do original.
    limpa = Image.new('RGB', im.size)
    limpa.paste(im)

    destino = os.path.join(DESTINO, nome)
    limpa.save(destino, 'JPEG', quality=82, optimize=True, progressive=True)
    kb = os.path.getsize(destino) / 1024
    total += kb
    print('%-18s %4d x %-4d  %6.1f KB' % (nome, largura, altura, kb))

print('\ntotal: %.0f KB em %d imagens' % (total, len(TRABALHO)))
