# Contribuindo para o API Gerador Boleto

Primeiramente, obrigado por se interessar em contribuir! O `api-gerador-boleto` é um projeto de código aberto e adoraríamos receber sua ajuda.

## Como posso contribuir?

### Reportando Bugs
Se você encontrar um erro na validação ou no comportamento da biblioteca, por favor abra uma **Issue**. Inclua detalhes como:
- O valor que causou o erro.
- O comportamento esperado vs. o comportamento atual.
- Versão da biblioteca e do Node.js.

### Sugerindo Melhorias
Ideias para novos bancos ou melhorias de performance são sempre bem-vindas! Abra uma Issue para discutirmos a proposta.

### Pull Requests
1. Faça um **Fork** do repositório.
2. Crie uma branch para sua alteração: `git checkout -b feature/novo-banco`.
3. Instale as dependências: `pnpm install`.
4. Faça suas alterações.
5. **Garanta que os testes passem**: `pnpm test`.
6. Se adicionou algo novo, adicione um teste correspondente em `src/test/[nome].test.ts`.
7. Rode o lint para garantir o estilo de código: `biome lint`.
8. Envie o Pull Request!

## Padrão de Commits

Para manter o histórico do projeto organizado, utilizamos o padrão de [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). Suas mensagens de commit devem seguir este formato:

`tipo(escopo): descrição curta`

### Tipos Comuns:
- **feat**: Uma nova funcionalidade.
- **fix**: Correção de um bug.
- **docs**: Alterações apenas na documentação.
- **style**: Alterações que não afetam o sentido do código (espaços em branco, formatação, ponto e vírgula, etc).
- **refactor**: Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade.
- **test**: Adição de testes ausentes ou correção de testes existentes.
- **chore**: Alterações no processo de build ou ferramentas auxiliares.

**Exemplo:** `feat(banco): adiciona nova rota`

## Padrões de Desenvolvimento

- Usamos **TypeScript** para garantir segurança de tipos.
- Seguimos o estilo de código definido pelo **Biome lint**.

## Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/box4dev/api-gerador-boleto.git

# Entre no diretório
cd api-gerador-boleto

# Instale as dependências
pnpm install

# Inicie os testes em modo watch
pnpm test
```

Recomenda-se [pnpm](https://pnpm.io/) (`corepack enable` + versão em `packageManager` no `package.json`). Também funciona com npm.

```bash
pnpm install
pnpm run build
pnpm run test
```

Scripts de smoke (após `pnpm build` ou `npm run build`):

Agradecemos sua colaboração!
