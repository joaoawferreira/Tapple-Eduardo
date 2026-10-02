# Letra Rápida

Jogo presencial de palavras para 2 a 6 pessoas compartilhando uma tela. HTML5, CSS3 e TypeScript compilado em módulos JavaScript, sem frameworks, backend ou microfone. Identidade visual e sons próprios.

## Instalar, compilar e executar

Instale o Node.js (que inclui npm). Dentro desta pasta, execute:

```powershell
npm install
npm run build
npm start
```

Abra **http://127.0.0.1:4173**. Ctrl+C para encerrar o servidor.

O primeiro comando instala o compilador TypeScript de desenvolvimento. Para adicioná-lo em outro projeto, use `npm install --save-dev typescript`. Não é necessária instalação global. Após existir `package-lock.json`, `npm ci` reproduz as versões exatas.

`npm run build` executa `tsc`, gera JavaScript em `dist/` e reúne o site em `build/`. `npx tsc` compila somente TypeScript. O HTML carrega `./dist/main.js`; todos os imports compilados têm extensão `.js`.

Use HTTP: abrir diretamente por `file://` pode bloquear módulos. O servidor usa APIs nativas do Node.js, escutando apenas no computador local. Para hospedagem estática, publique o conteúdo de `build/`.

## Regras

- Configure 2 a 6 jogadores com nomes diferentes.
- Escolha 5, 10, 15, 20 ou 30 segundos (padrão: 10); 3, 5, 10 ou infinitas rodadas (padrão: 5).
- Fale uma palavra da categoria e toque/digite sua inicial. A turma valida verbalmente as respostas.
- Cada letra é bloqueada até a próxima rodada. A vez passa automaticamente.
- Quando o tempo acabar, todos exceto o jogador da vez ganham 1 ponto. O campo `wins` conta rodadas pontuadas.
- Ao completar as 26 letras, todos ganham 1 ponto.
- O primeiro jogador muda por rodada. Categorias não repetem consecutivamente.
- Quem somar mais pontos vence; empates são compartilhados.
- No modo ilimitado, encerre entre rodadas pelo botão de resultado.
- Jogar novamente preserva participantes/configurações e zera pontos/histórico.
- Reiniciar rodada mantém categoria e placar anterior, limpa jogadas atuais e restaura o primeiro jogador da rodada.

## Controles

A–Z escolhem letras; Espaço pausa/continua; Esc abre a pausa e fecha diálogos. Tela cheia depende do suporte do navegador. Ao ocultar a aba, o jogo pausa automaticamente, com retomada manual.

Atalhos não interferem em campos de texto e diálogos de ajuda/configuração/confirmação. A proteção de 250 ms impede passagem acidental de duas vezes. O cronômetro usa `performance.now()`, preserva milissegundos na pausa e rejeita respostas após o prazo, mesmo antes do callback.

## Arquivos

- `index.html`: telas e diálogos semânticos.
- `css/style.css`, `responsive.css`, `animations.css`: identidade, adaptação e movimento reduzido.
- `src/main.ts`: interface, eventos, teclado e acessibilidade.
- `src/Game.ts`: estados, turnos, rodadas, pontuação e resultados.
- `src/Player.ts`: jogador.
- `src/Timer.ts`: relógio e pausa.
- `src/LetterManager.ts`: letras disponíveis.
- `src/CategoryManager.ts`: sorteio.
- `src/categories.ts`: 40 categorias.
- `src/StorageManager.ts`: preferências com validação e fallback.
- `src/SoundManager.ts`: sons próprios e arquivos opcionais.
- `src/types.ts`: tipos e interfaces.
- `dist/`: módulos compilados.
- `assets/icons/favicon.svg`: símbolo original.
- `assets/audio/`: efeitos opcionais.
- `scripts/build.mjs`: distribuição.
- `scripts/serve.mjs`: servidor local.
- `scripts/source-doc.mjs`: documento com código integral.
- `tests/game.test.mjs`: testes das regras e tempo.
- `tsconfig.json`: compilação estrita.
- `build/`: site pronto.

## Adicionar categorias

Edite o array em `src/categories.ts` e recompile. Mantenha ao menos duas categorias distintas. Atualize também a contagem informativa da tela inicial se adicionar/remover categorias.

## Alterar tempo

Use a seleção antes da partida. Para mudar o padrão, edite `DEFAULT_SETTINGS.turnTime` em `src/StorageManager.ts`. Para novos valores, atualize as opções de `index.html` e as listas de validação em `StorageManager.ts` e `Game.ts`. Recompile. Preferências salvas prevalecem sobre novos padrões.

## Efeitos sonoros

A Web Audio API sintetiza seleção, troca de vez, alerta, fim do tempo e vitória. Os sons iniciam somente após interação, podem ser desligados e têm volume ajustável. Não precisam de arquivos externos.

Para efeitos próprios, coloque arquivos em `assets/audio/` e preencha o mapa `files` de `src/SoundManager.ts`:

```typescript
private readonly files: Partial<Record<SoundName, string>> = {
  letter: "./assets/audio/letter.mp3",
  turn: "./assets/audio/turn.mp3",
  warning: "./assets/audio/warning.mp3",
  timeout: "./assets/audio/timeout.mp3",
  victory: "./assets/audio/victory.mp3"
};
```

Cadastre somente arquivos existentes e recompile. Falhas de reprodução não interrompem a partida.

## Preferências e privacidade

`localStorage` salva nomes, participantes, tempo, rodadas, som e volume em `letra-rapida:preferences:v1`. Partidas e placar não são persistidos: atualizar retorna ao menu. Armazenamento bloqueado/corrompido usa preferências em memória. Nomes entram na interface com `textContent`, sem interpretar HTML.

Outfit é carregada pelo Google Fonts, com fallback para fontes do sistema. Sem internet, o jogo continua com o fallback quando servido localmente. Sem assets do Tapple ou serviços de análise.

## Verificar e obter todo o código

```powershell
npm run check
npm test
npm run docs
```

Os testes usam o runner nativo do Node.js com relógio falso. `CODIGO_COMPLETO.md` apresenta caminhos e código integral de todos os arquivos de implementação e módulos compilados, sem omissões.

## Teste opcional em navegador

Para repetir a verificação real de interface com Google Chrome instalado:

```powershell
npm install --no-save --package-lock=false playwright
npm run build
node tests/browser-smoke.mjs
```

O script inicia e encerra seu próprio servidor e navegador, testa desktop, 320/390/768px, teclado, pausa, pontuação, revanche, preferências e entradas contendo HTML. Capturas locais ficam em `.sites-runtime/qa/`, fora da distribuição. Playwright é apenas uma ferramenta de teste; não faz parte do jogo ou da instalação normal.