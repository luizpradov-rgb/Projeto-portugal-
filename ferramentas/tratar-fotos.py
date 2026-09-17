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
    'polvo':    'polvo.jpg',      # tatuagem: polvo em blackwork
    'bussola':  'bussola.jpg',    # tatuagem: bússola, veleiro e âncora
    'liso':     'liso.jpg',       # cabelo: alisamento
    'madeixas': 'madeixas.jpg',   # cabelo: madeixas caramelo
    'corte':    'corte.jpg',      # cabelo: corte masculino, com o salão ao fundo
}

# (ficheiro, foto, largura, proporção, foco horizontal, foco vertical)
# O foco é a fração do eixo que fica no centro do recorte: 0,5 é o meio.
TRABALHO = [
    ('heroi.jpg',       'madeixas', 1000, 3/4,  0.50, 0.46),
    ('salao.jpg',       'corte',    1000, 3/4,  0.52, 0.44),
    ('serv-cabelo.jpg', 'liso',      900, 4/5,  0.50, 0.42),
    ('tatuagem.jpg',    'polvo',    1000, 3/4,  0.52, 0.50),

    ('trabalho-01.jpg', 'madeixas',  800, 3/4,  0.50, 0.46),
    ('trabalho-02.jpg', 'liso',      800, 3/4,  0.50, 0.44),
    ('trabalho-03.jpg', 'corte',     760, 1/1,  0.46, 0.40),
    ('trabalho-04.jpg', 'polvo',     800, 3/4,  0.52, 0.50),
    ('trabalho-05.jpg', 'bussola',   760, 1/1,  0.52, 0.50),

    ('og.jpg',          'corte',    1200, 1200/630, 0.50, 0.40),
]


def recortar(im, proporcao, fx, fy):
    """Maior recorte possível na proporção pedida, colocado pelo foco."""
    la, al = im.size
    if la / al > proporcao:
        nova_la, nova_al = int(round(al * proporcao)), al
    else:
        nova_la, nova_al = la, int(round(la / proporcao))
    x = int(round((la - nova_la) * fx))
    y = int(round((al - nova_al) * fy))
    return im.crop((x, y, x + nova_la, y + nova_al))


total = 0
for nome, chave, largura, proporcao, fx, fy in TRABALHO:
    origem = os.path.join(ORIGEM, FOTOS[chave])
    im = ImageOps.exif_transpose(Image.open(origem)).convert('RGB')
    im = recortar(im, proporcao, fx, fy)
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
