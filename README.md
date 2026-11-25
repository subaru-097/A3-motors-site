# A3 Motors · site

Site da A3 Motors (Piracicaba), feito em Next.js 15. O estoque vem direto do site atual da loja (a3motorsweb.com.br): carros, fotos, preços, marcas e itens são lidos de lá e atualizados sozinhos a cada 10 minutos. Ninguém precisa cadastrar nada duas vezes.

## O que tem

- Capa com o M3 e as letras A3 MOTORS; ao rolar, o vídeo da câmera entrando na loja.
- Em destaque e Estoque, com filtro por tipo e marca e ordenação por preço ou data.
- Página própria para cada veículo (`/veiculo/nome-do-carro`): fotos em cartas, ficha, itens, simulador de parcela e WhatsApp.
- A loja (fotos reais), contato, rota no Waze.
- Está marcado como `noindex`: o Google não indexa enquanto for prévia. Para publicar de verdade, tire o `robots` em `src/app/layout.tsx`.

## Rodar no computador

Precisa do Node.js 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Publicar (Vercel, grátis)

1. Suba esta pasta para um repositório no GitHub (veja abaixo).
2. Em vercel.com, entre com o GitHub, clique em "Add New → Project" e escolha o repositório.
3. Não precisa mudar nada: clique em Deploy. Em um minuto sai um link `https://…vercel.app`.

## Subir para o GitHub

Crie um repositório vazio em github.com/new (sem README) e, dentro desta pasta:

```bash
git remote add origin https://github.com/SEU-USUARIO/a3-motors.git
git push -u origin main
```

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Telefone, WhatsApp, endereço, Instagram | `src/lib/store.ts` |
| Cores, fontes, vidro | `src/app/globals.css` |
| Capa e animação | `src/components/Hero.tsx` |
| Estoque e filtros | `src/components/Inventory.tsx` |
| Página do carro | `src/components/VehicleView.tsx` |
| Leitura do estoque da A3 | `src/lib/inventory.ts` |
| Textos e fotos da loja | `src/components/Store.tsx` |
