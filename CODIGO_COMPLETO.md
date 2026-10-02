# Letra Rápida — código completo

Arquivos integrais de implementação, JavaScript compilado, testes e instruções.

## .gitignore

````text
node_modules/
.sites-runtime/
*.tar.gz
*.zip

````

## README.md

````markdown
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
````

## assets/audio/.gitkeep

````text

````

## assets/icons/favicon.svg

````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#8b70ff"/><path d="M35 7 15 35h16l-3 22 22-31H34z" fill="#fff"/></svg>
````

## css/animations.css

````css
@keyframes screen-in{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}@keyframes float-one{50%{transform:translateY(-10px) rotate(-13deg)}}@keyframes float-two{50%{transform:translateY(12px) rotate(20deg)}}@keyframes letter-pop{0%{transform:scale(1);background:#a18aff}45%{transform:scale(.85);box-shadow:0 0 22px #a18aff77}100%{transform:scale(1)}}@keyframes timer-pulse{50%{transform:scale(1.045);filter:drop-shadow(0 0 12px #ff617533)}}@keyframes turn-in{from{opacity:.2;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.letter-button.just-used{animation:letter-pop .3s ease}.timer.urgent{animation:timer-pulse .6s ease-in-out infinite}.turn-label.changing{animation:turn-in .3s ease}dialog[open]{animation:screen-in .2s ease}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

````

## css/responsive.css

````css
@media(min-width:1500px){.menu-screen{padding-top:7vh}.menu-title-wrap{margin-top:40px;margin-bottom:30px}.menu-actions{margin-top:35px}}
@media(max-width:1100px){.game-layout{grid-template-columns:170px minmax(0,1fr);gap:28px}.history-panel{grid-column:1/-1;border-top:1px solid var(--border);padding-top:22px}.history-list{display:flex;flex-wrap:wrap;gap:12px 24px}.history-list li{margin:0}.history-tip{display:none}.game-screen{max-width:900px}.letter-board{gap:9px}}
@media(max-width:700px){.site-header{padding:18px 20px}.site-header nav{gap:6px}.brand{font-size:1.1rem}.brand-icon{width:30px;height:32px;font-size:1.6rem;margin-right:8px}.icon-button{width:44px;height:44px;border-radius:11px}.screen{padding:24px 20px 35px}.menu-screen{padding-top:34px}.menu-screen>.eyebrow{font-size:.6rem;letter-spacing:.14em}.menu-title-wrap{margin:32px auto 24px;max-width:470px}.menu-title-wrap h1{font-size:7rem}.floating-letter{width:48px;height:54px;font-size:1.7rem;border-radius:14px}.letter-one{left:1%;top:22%}.letter-two{right:0;top:0}.letter-three{right:0;bottom:-7%;width:39px;height:43px;font-size:1.4rem}.game-facts>span{padding:0 12px;font-size:.75rem}.site-footer{padding:22px 20px;font-size:.65rem;letter-spacing:.05em}.game-topbar{margin-bottom:22px;padding-bottom:15px}.live-label{display:none}.game-layout{display:flex;flex-direction:column;gap:24px}.score-panel{order:1;padding-top:0}.play-area{order:2}.history-panel{order:3}.score-panel>.panel-heading,.score-note{display:none}.score-panel .score-list{display:flex;overflow-x:auto;gap:8px;padding:3px 0 6px}.score-panel .score-list li{margin:0;flex:1;min-width:130px;padding:9px 10px;background:#131625}.score-panel .score-list li.active{background:#a18aff13}.score-panel .avatar{width:28px;height:28px;font-size:.75rem}.score-panel .score-name{font-size:.8rem}.score-panel .score-name small{font-size:.65rem}.score-panel .score-points{font-size:.95rem}.category-title{font-size:2.15rem}.timer{width:138px;height:138px;margin:18px auto 24px}.timer strong{font-size:3.1rem}.letter-board{grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;max-width:460px}.letter-button{font-size:1.2rem}.letters-heading{max-width:460px;margin-left:auto;margin-right:auto;font-size:.6rem}.keyboard-hint{display:none}.setup-card,.results-card{padding:22px}.narrow>h1{font-size:2.5rem}.result-screen h1{font-size:2.7rem}.history-panel{margin-top:8px}.history-list{gap:18px}.history-list li{max-width:45%}}
@media(max-width:420px){.site-header{padding:16px}.site-header nav{gap:4px}.brand{font-size:1rem}.brand-icon{margin-right:7px}.menu-title-wrap h1{font-size:6rem}.floating-letter{width:41px;height:47px;font-size:1.5rem}.letter-one{left:0}.menu-subtitle{font-size:1rem}.game-facts>span{padding:0 9px}.site-footer{flex-direction:column;align-items:center;gap:8px}.setup-card{padding:18px}.player-fields,.settings-grid{grid-template-columns:1fr}.letter-board{grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.letters-heading{align-items:flex-start}.letters-heading>span:first-child{max-width:160px}.screen{padding-left:16px;padding-right:16px}.letter-button{font-size:1.2rem}.secondary-actions{gap:8px}.secondary-actions .button{font-size:.85rem}dialog{padding:24px}.game-facts{font-size:.7rem}}
@media(max-width:340px){.brand-icon{display:none}.menu-title-wrap h1{font-size:5.2rem}.letter-one{left:-3%}.letter-two{right:-2%}.letter-board{grid-template-columns:repeat(4,minmax(0,1fr))}.game-facts{flex-wrap:wrap;gap:12px}.game-facts>span{border:0}}

@media(max-width:700px){
  .game-screen{padding-top:8px}
  .game-topbar{margin-bottom:12px;padding-bottom:12px}
  .game-layout{gap:16px}
  .score-panel .score-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .category-title{font-size:2rem;margin:6px 0 8px}
  .timer{width:110px;height:110px;margin:12px auto 18px}
  .timer strong{font-size:2.7rem}
  .timer div>span{font-size:.55rem}
  .letter-board{grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
  .letters-heading{margin-bottom:12px}
}
@media(max-width:360px){.letter-board{grid-template-columns:repeat(5,minmax(0,1fr))}}
````

## css/style.css

````css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
:root{color-scheme:dark;--bg:#080a12;--surface:#111522;--surface-raised:#1a1e30;--primary:#a18aff;--secondary:#65e1ed;--danger:#ff6175;--success:#69dca8;--text:#f5f4ff;--text-muted:#a6a9c0;--border:#272b41;--radius:24px;font-family:"Outfit",system-ui,-apple-system,sans-serif;font-size:16px}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 50% 33%,#281d4c70,transparent 48%),var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(#8175bd22 .7px,transparent .7px);background-size:24px 24px}
button,input,select{font:inherit}button,a,input,select{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{cursor:default}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--secondary);outline-offset:5px}button{color:inherit}a{color:inherit}button,input,select{min-height:44px}button{touch-action:manipulation}h1,h2,p{margin-top:0}h1{font-size:clamp(2.2rem,5vw,3.2rem);letter-spacing:-.045em;line-height:1.08;margin-bottom:16px}h2{font-size:1.7rem;letter-spacing:-.035em;margin-bottom:22px}p{line-height:1.6}main{flex:1;min-width:0}section[hidden],[hidden]{display:none!important}.site-header{width:100%;max-width:1440px;margin:auto;padding:28px 5%;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:inline-flex;align-items:center;font-size:1.3rem;font-weight:800;letter-spacing:-.05em;text-decoration:none}.brand>span:not(.brand-icon){font-weight:500}.brand .brand-dot{color:var(--primary);font-size:1.8rem}.brand-icon{display:grid;place-items:center;background:#9173ef;width:36px;height:36px;margin-right:12px;border-radius:11px;font-size:2rem;color:white;line-height:1}.site-header nav{display:flex;gap:10px}.icon-button{width:44px;height:44px;border:1px solid var(--border);background:#13162288;border-radius:13px;font-size:1.3rem;display:inline-grid;place-items:center;transition:background .2s,transform .2s}.icon-button:hover{background:var(--surface-raised);transform:translateY(-2px)}.site-footer{max-width:1440px;width:100%;padding:25px 5%;display:flex;justify-content:space-between;gap:16px;color:#777e9c;font-size:.75rem;letter-spacing:.1em}.site-footer>span:last-child{letter-spacing:0}.accent{color:var(--primary)}.muted{color:var(--text-muted)}.eyebrow{font-size:.75rem;letter-spacing:.2em;font-weight:600;color:var(--primary);line-height:1.7}.screen{padding:30px 24px 45px;animation:screen-in .3s ease}.menu-screen{text-align:center;padding-top:34px}.menu-screen>.eyebrow{display:inline-flex;gap:12px;align-items:center;padding:8px 16px;border:1px solid #a18aff30;border-radius:99px;background:#a18aff08;color:#c0b3ed}.tiny-spark{font-size:1.1rem}.menu-title-wrap{position:relative;max-width:690px;margin:24px auto 20px}.menu-title-wrap h1{font-size:clamp(5.6rem,11vw,9rem);font-weight:800;line-height:.91;letter-spacing:-.045em;margin:0;padding:10px 0 18px}.menu-title-wrap h1>span:first-of-type{color:var(--primary);background:linear-gradient(110deg,#bc9aff,#8d76ec 65%,#7478ee);background-clip:text;-webkit-text-fill-color:transparent}.title-dot{color:var(--secondary)}.menu-subtitle{font-size:1.12rem;color:#b4b5cc;line-height:1.7;margin-bottom:29px}.floating-letter{position:absolute;display:grid;place-items:center;width:72px;height:78px;border:1px solid #8872d867;border-bottom:5px solid #463473;border-radius:20px;background:linear-gradient(145deg,#322444,#181422);color:#bda8f5;font-size:2.5rem;font-weight:700;box-shadow:0 15px 35px #0005;user-select:none}.letter-one{left:7%;top:20%;transform:rotate(-18deg);animation:float-one 6s ease-in-out infinite}.letter-two{right:7%;top:1%;transform:rotate(15deg);color:var(--secondary);background:linear-gradient(145deg,#163844,#121c28);border-color:#396070;border-bottom-color:#25434e;animation:float-two 7s ease-in-out infinite}.letter-three{right:4%;bottom:-8%;width:53px;height:58px;font-size:1.8rem;transform:rotate(-10deg);opacity:.65}.menu-actions{width:min(100%,350px);margin:auto}.button{display:inline-flex;align-items:center;justify-content:center;gap:12px;border:1px solid transparent;border-radius:14px;padding:15px 22px;font-weight:600;font-size:.95rem;transition:transform .2s,background .2s,box-shadow .2s;line-height:1.4}.button:hover{transform:translateY(-2px)}.button:active{transform:translateY(1px)}.primary{background:linear-gradient(115deg,#a183ff,#8466e7);color:#fff;box-shadow:0 5px 0 #4c3697,0 12px 30px #8466e72b;font-weight:700;letter-spacing:.045em}.primary:hover{background:linear-gradient(115deg,#b397ff,#9476f5);box-shadow:0 5px 0 #4c3697,0 14px 38px #8466e745}.big{width:100%;font-size:1.1rem;min-height:62px}.big>span{font-size:1.7rem}.secondary{background:#141725;border-color:var(--border);color:#d0cde3}.secondary:hover{background:#202439}.secondary-actions{display:flex;gap:12px;margin-top:20px}.secondary-actions>*{flex:1;padding-left:10px;padding-right:10px}.game-facts{display:flex;justify-content:center;gap:0;margin:36px auto 20px;color:var(--text-muted);font-size:.8rem}.game-facts>span{padding:0 24px;border-right:1px solid var(--border)}.game-facts>span:last-child{border-right:0}.game-facts b{font-weight:600;color:#ded7f4;margin-right:5px}.menu-note{font-size:.8rem;color:#777e9c;margin-bottom:0}.narrow{max-width:650px;margin:auto}.narrow>.eyebrow{margin-bottom:13px}.text-button{border:0;background:transparent;color:var(--text-muted);padding:12px;font-weight:500}.text-button:hover{color:var(--text)}.back-button{padding-left:0;margin-bottom:22px}.setup-card,.results-card{border:1px solid var(--border);border-radius:var(--radius);padding:28px;background:linear-gradient(145deg,#151829dd,#101320dd);box-shadow:0 20px 60px #0002}.setup-card{margin-top:28px}fieldset{border:0;padding:0;margin:0 0 24px}legend,label{font-size:.9rem;font-weight:500;color:#cccce1}legend{margin-bottom:12px}.choice-group{display:flex;gap:10px}.choice-group button{flex:1;border:1px solid var(--border);background:var(--surface-raised);border-radius:12px;font-size:1.1rem;padding:8px}.choice-group button[aria-pressed=true]{background:#a18aff23;border-color:var(--primary);color:#d3c4ff;box-shadow:inset 0 0 0 1px var(--primary)}.player-fields{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:26px}.player-fields label{display:flex;flex-direction:column;gap:8px}.player-fields input,select{width:100%;border:1px solid #34394e;border-radius:10px;background:#0d101d;color:var(--text);padding:12px;min-width:0}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.settings-grid label{display:flex;flex-direction:column;gap:10px}.inline-tip{display:flex;gap:12px;background:#a18aff0b;border:1px solid #a18aff1c;border-radius:12px;padding:14px;color:#b7adc9;font-size:.85rem;line-height:1.6;margin:24px 0}.inline-tip p{margin:0}.inline-tip>span{color:var(--primary)}.full{width:100%}.error-message{color:var(--danger);font-size:.9rem}.error-message:empty{display:none}.game-screen{max-width:1320px;margin:auto;padding-top:20px}.game-topbar{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:20px;margin-bottom:36px;gap:12px}.pill{border:1px solid #7c6ba846;background:#a18aff0c;padding:8px 14px;border-radius:99px;font-size:.75rem;color:#c2b4ed;letter-spacing:.08em}.live-label{font-size:.7rem;color:var(--secondary);letter-spacing:.2em}.small{font-size:.85rem;padding:8px 14px;gap:8px}.game-layout{display:grid;grid-template-columns:200px minmax(0,1fr) 200px;gap:40px}.score-panel,.history-panel{padding-top:14px}.panel-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.panel-heading h2{font-size:.9rem;letter-spacing:0;margin:0;font-weight:500}.panel-heading>span{font-size:.7rem;letter-spacing:.1em;color:#7d849f}.score-list,.history-list{list-style:none;padding:0;margin:0}.score-list li{display:flex;align-items:center;gap:10px;border:1px solid transparent;border-radius:12px;padding:12px 10px;margin:7px 0;min-width:0}.score-list li.active{background:#a18aff13;border-color:#a18aff67}.avatar{width:34px;height:34px;flex-shrink:0;display:grid;place-items:center;border-radius:10px;font-weight:600;font-size:.85rem;background:#a18aff24;color:#c5b7f3}.avatar.color-1{background:#65e1ed1c;color:#65e1ed}.avatar.color-2{background:#ffb2701c;color:#ffb270}.avatar.color-3{background:#69dca81c;color:#69dca8}.avatar.color-4{background:#ff7fbd1c;color:#ff7fbd}.avatar.color-5{background:#90b2ff1c;color:#90b2ff}.score-name{font-size:.9rem;flex:1;min-width:0;overflow-wrap:anywhere}.score-name small{display:block;color:var(--primary);font-size:.7rem;margin-top:3px}.score-points{font-size:1.1rem;font-weight:600}.score-note,.history-tip{font-size:.8rem;color:#7e849e;line-height:1.7;margin-top:24px}.play-area{text-align:center;min-width:0}.category-title{font-size:clamp(1.8rem,3.2vw,2.6rem);margin:9px 0 12px;overflow-wrap:anywhere;line-height:1.15}.turn-label{font-size:.95rem;color:#a7aec8;margin:0;min-height:25px;overflow-wrap:anywhere}.turn-label strong{color:var(--secondary);font-weight:600}.timer{width:162px;height:162px;position:relative;margin:22px auto 26px;display:grid;place-items:center}.timer-svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible}.timer-track,.timer-progress{fill:none;stroke-width:5}.timer-track{stroke:#24243d}.timer-progress{stroke:var(--primary);stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:0;filter:drop-shadow(0 0 7px #a18aff75);transition:stroke .2s}.timer strong{display:block;font-size:3.6rem;font-weight:700;line-height:1.05;letter-spacing:-.04em;font-variant-numeric:tabular-nums}.timer div>span{color:#858ca6;font-size:.6rem;letter-spacing:.2em}.timer.urgent .timer-progress{stroke:var(--danger);filter:drop-shadow(0 0 8px #ff617580)}.timer.urgent strong{color:var(--danger)}.letters-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:.65rem;color:#8c91ab;margin-bottom:15px;letter-spacing:.045em}.letters-heading b{color:var(--secondary);font-weight:500}.letter-board{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;max-width:550px;margin:auto}.letter-button{width:100%;aspect-ratio:1;min-height:44px;border-radius:50%;border:1px solid #44415f;background:linear-gradient(145deg,#29253e,#1a1a2c);box-shadow:0 3px 0 #10111d;font-size:1.35rem;font-weight:600;transition:background .18s,border-color .18s,transform .18s,color .18s;position:relative}.letter-button:hover:enabled{background:#a18aff35;border-color:var(--primary);transform:translateY(-3px);color:#fff}.letter-button.used{background:#0d101a;border-color:#202436;color:#525971;box-shadow:none}.letter-button.used::after{content:"";position:absolute;left:25%;right:25%;top:50%;height:1px;background:#596078;transform:rotate(-40deg)}.keyboard-hint{font-size:.75rem;color:#777e9b;margin:25px 0 0}.keyboard-hint>span{margin:0 12px}kbd{font-family:inherit;border:1px solid #30364c;border-bottom-width:2px;border-radius:4px;padding:2px 5px;font-size:.7rem}.history-list li{display:flex;align-items:center;gap:10px;margin-bottom:17px}.history-letter{display:grid;place-items:center;width:35px;height:35px;flex-shrink:0;border:1px solid #33324d;border-radius:10px;background:#1b1b2d;color:#bca8ec;font-size:1rem}.history-description{font-size:.85rem;min-width:0;overflow-wrap:anywhere}.history-description small{display:block;color:#7f859f;font-size:.7rem;margin-top:4px}.history-empty{color:#8c91a9;line-height:1.6;font-size:.85rem}.result-screen{text-align:center;padding-top:35px}.result-symbol{display:grid;place-items:center;width:82px;height:82px;border:1px solid #a18aff35;border-radius:26px;background:#a18aff12;margin:0 auto 24px;font-size:2.5rem}.result-description{color:#b9b6cf;font-size:1.05rem;overflow-wrap:anywhere}.results-card{text-align:left;margin:25px 0}.results-card .score-list li{background:#ffffff03;padding:12px}.next-category{font-size:.9rem;color:#959bb4;display:flex;align-items:center;justify-content:center;gap:20px}.next-category strong{letter-spacing:.2em;font-size:1.4rem;color:#d4c5ff}.result-screen>.text-button{margin-top:15px}.winner-label{letter-spacing:.2em;font-size:.75rem;color:var(--secondary);margin-bottom:12px}.result-screen h1{overflow-wrap:anywhere}.trophy{background:#ffc7660d;border-color:#ffc76630}.result-screen>.secondary-actions{margin-top:24px}dialog{width:calc(100% - 32px);max-width:500px;max-height:calc(100dvh - 32px);overflow:auto;padding:30px;border:1px solid #49425d;border-radius:24px;background:linear-gradient(145deg,#1b1c30,#111422);color:var(--text);box-shadow:0 30px 150px #000a}dialog::backdrop{background:#050610b8;backdrop-filter:blur(10px)}dialog h2{font-size:2rem;margin:12px 0 20px}.dialog-heading{display:flex;align-items:center;justify-content:space-between;gap:15px}.dialog-heading .icon-button{border:0;background:transparent}.rules-list{padding-left:24px;color:#c1bfd4;font-size:.9rem;line-height:1.6}.rules-list li{padding-left:5px;margin-bottom:11px}.rules-list li::marker{color:var(--primary);font-weight:700}dialog>.muted{font-size:.9rem}.dialog-actions{display:flex;flex-direction:column;gap:14px;margin-top:24px}.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:26px 0}.toggle-row small{display:block;font-size:.8rem;color:var(--text-muted);margin-top:6px}.toggle-row input{width:24px;accent-color:#a18aff}.volume-label{display:flex;justify-content:space-between;margin-bottom:8px}input[type=range]{width:100%;accent-color:#a18aff;margin-bottom:24px}.toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,15px);opacity:0;pointer-events:none;z-index:10;max-width:calc(100% - 32px);padding:12px 20px;border:1px solid #56506e;background:#242238;border-radius:12px;font-size:.9rem;transition:opacity .2s,transform .2s;text-align:center}.toast.visible{opacity:1;transform:translate(-50%,0)}.noscript{position:fixed;bottom:0;background:var(--danger);color:#080a12;padding:20px;width:100%;text-align:center;margin:0}

.letters-heading{max-width:550px;margin-left:auto;margin-right:auto}

````

## dist/CategoryManager.js

````javascript
import { CATEGORIES } from "./categories.js";
export class CategoryManager {
    categories;
    random;
    previous = "";
    constructor(categories = CATEGORIES, random = Math.random) {
        this.categories = categories;
        this.random = random;
        if (categories.length < 2 || new Set(categories).size < 2)
            throw new Error("Cadastre ao menos duas categorias distintas.");
    }
    draw() {
        const choices = this.categories.filter(category => category !== this.previous);
        this.previous = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
        return this.previous;
    }
}

````

## dist/Game.js

````javascript
import { Player } from "./Player.js";
import { Timer } from "./Timer.js";
import { LetterManager } from "./LetterManager.js";
import { CategoryManager } from "./CategoryManager.js";
export class Game {
    events;
    state = "MENU";
    players = [];
    settings = null;
    round = 0;
    category = "";
    currentIndex = 0;
    history = [];
    result = null;
    letters = new LetterManager();
    timer;
    categories = new CategoryManager();
    lastWarning = 0;
    inputReadyAt = 0;
    now;
    constructor(events, clock) {
        this.events = events;
        this.now = clock?.now ?? (() => performance.now());
        this.timer = new Timer((seconds, fraction) => {
            events.tick(seconds, fraction);
            if (this.state === "PLAYING" && seconds > 0 && seconds <= 3 && seconds !== this.lastWarning) {
                this.lastWarning = seconds;
                events.sound("warning");
            }
        }, () => this.endRound("timeout"), clock);
    }
    get currentPlayer() { return this.players[this.currentIndex]; }
    get isLastRound() { return this.settings !== null && this.settings.roundCount > 0 && this.round >= this.settings.roundCount; }
    get leaders() {
        const highest = Math.max(...this.players.map(player => player.score));
        return this.players.filter(player => player.score === highest);
    }
    setup() { this.timer.stop(); this.state = "SETUP"; this.events.change(); }
    start(names, settings) {
        if (![2, 3, 4, 5, 6].includes(settings.playerCount) || names.length !== settings.playerCount ||
            ![5, 10, 15, 20, 30].includes(settings.turnTime) || ![0, 3, 5, 10].includes(settings.roundCount)) {
            throw new Error("Configuração de partida inválida.");
        }
        this.settings = { ...settings };
        this.players = names.map((name, index) => new Player(index, name.trim().slice(0, 24) || `Jogador ${index + 1}`));
        this.round = 0;
        this.history = [];
        this.nextRound();
    }
    nextRound() {
        if (!this.settings || (this.round > 0 && this.state !== "ROUND_END"))
            return;
        if (this.round > 0 && this.isLastRound) {
            this.finish();
            return;
        }
        this.round++;
        this.category = this.categories.draw();
        this.beginRound();
    }
    beginRound() {
        if (!this.settings)
            return;
        this.timer.stop();
        this.result = null;
        this.letters.reset();
        this.currentIndex = (this.round - 1) % this.players.length;
        this.state = "PLAYING";
        this.inputReadyAt = this.now() + 250;
        this.activate();
        this.events.change();
        this.startTimer();
    }
    activate() {
        this.players.forEach((player, index) => { player.isActive = index === this.currentIndex; });
    }
    startTimer() {
        if (!this.settings)
            return;
        this.lastWarning = 0;
        this.timer.start(this.settings.turnTime);
    }
    selectLetter(raw) {
        if (this.state !== "PLAYING" || this.now() < this.inputReadyAt)
            return false;
        if (this.timer.isExpired()) {
            this.endRound("timeout");
            return false;
        }
        const letter = raw.toUpperCase();
        if (!this.currentPlayer || !this.letters.use(letter))
            return false;
        this.timer.stop();
        this.history.unshift({ playerId: this.currentPlayer.id, playerName: this.currentPlayer.name, letter, round: this.round });
        this.history = this.history.slice(0, 100);
        this.events.sound("letter");
        if (this.letters.remaining === 0) {
            this.endRound("all-letters");
            return true;
        }
        this.currentIndex = (this.currentIndex + 1) % this.players.length;
        this.inputReadyAt = this.now() + 250;
        this.activate();
        this.events.change();
        this.events.sound("turn");
        this.startTimer();
        return true;
    }
    endRound(reason) {
        if (this.state !== "PLAYING")
            return;
        this.timer.stop();
        const loser = reason === "timeout" ? this.currentPlayer : null;
        this.result = { reason, loserName: loser?.name ?? null };
        this.players.forEach(player => { if (player !== loser)
            player.awardPoint(); player.isActive = false; });
        this.state = "ROUND_END";
        this.events.sound(reason === "timeout" ? "timeout" : "victory");
        this.events.change();
    }
    pause() {
        if (this.state !== "PLAYING")
            return;
        if (this.timer.isExpired()) {
            this.endRound("timeout");
            return;
        }
        this.timer.pause();
        this.state = "PAUSED";
        this.events.change();
    }
    resume() {
        if (this.state !== "PAUSED")
            return;
        this.state = "PLAYING";
        this.inputReadyAt = this.now() + 250;
        this.events.change();
        this.timer.resume();
    }
    restartRound() {
        if (this.state !== "PAUSED")
            return;
        this.history = this.history.filter(move => move.round !== this.round);
        this.beginRound();
    }
    finish() {
        if (this.state !== "ROUND_END")
            return;
        this.timer.stop();
        this.state = "GAME_END";
        this.events.sound("victory");
        this.events.change();
    }
    replay() {
        if (this.settings)
            this.start(this.players.map(player => player.name), this.settings);
    }
    menu() {
        this.timer.stop();
        this.players.forEach(player => { player.isActive = false; });
        this.state = "MENU";
        this.events.change();
    }
}

````

## dist/LetterManager.js

````javascript
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export class LetterManager {
    used = new Set();
    get remaining() { return ALPHABET.length - this.used.size; }
    isUsed(letter) { return this.used.has(letter); }
    use(letter) {
        if (!ALPHABET.includes(letter) || this.used.has(letter))
            return false;
        this.used.add(letter);
        return true;
    }
    reset() { this.used.clear(); }
}

````

## dist/Player.js

````javascript
export class Player {
    id;
    name;
    score = 0;
    wins = 0;
    isActive = false;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    awardPoint() { this.score++; this.wins++; }
}

````

## dist/SoundManager.js

````javascript
export class SoundManager {
    context = null;
    enabled = true;
    volume = 0.35;
    // Substitua valores por caminhos, por exemplo: "./assets/audio/letter.mp3".
    files = {};
    notes = {
        letter: [660], turn: [440, 660], warning: [880],
        timeout: [330, 220, 110], victory: [523, 659, 784, 1047]
    };
    unlock() {
        if (!this.enabled)
            return;
        try {
            this.context ??= new AudioContext();
            void this.context.resume().catch(() => { });
        }
        catch { /* O jogo continua em navegadores sem áudio. */ }
    }
    play(name) {
        if (!this.enabled || this.volume === 0)
            return;
        const file = this.files[name];
        if (file) {
            const audio = new Audio(file);
            audio.volume = this.volume;
            void audio.play().catch(() => { });
            return;
        }
        const context = this.context;
        if (!context || context.state !== "running")
            return;
        this.notes[name].forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const start = context.currentTime + index * 0.11;
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(this.volume * 0.16, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + 0.12);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
    }
}

````

## dist/StorageManager.js

````javascript
export const DEFAULT_SETTINGS = {
    playerCount: 2, turnTime: 10, roundCount: 5, soundEnabled: true, volume: 0.35
};
const KEY = "letra-rapida:preferences:v1";
export class StorageManager {
    static load() {
        const fallback = { names: ["Jogador 1", "Jogador 2"], settings: { ...DEFAULT_SETTINGS } };
        try {
            const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
            if (!parsed || typeof parsed !== "object")
                return fallback;
            const data = parsed;
            const settings = { ...DEFAULT_SETTINGS };
            const stored = data.settings;
            if (stored && typeof stored === "object") {
                if ([2, 3, 4, 5, 6].includes(stored.playerCount))
                    settings.playerCount = stored.playerCount;
                if ([5, 10, 15, 20, 30].includes(stored.turnTime))
                    settings.turnTime = stored.turnTime;
                if ([0, 3, 5, 10].includes(stored.roundCount))
                    settings.roundCount = stored.roundCount;
                if (typeof stored.soundEnabled === "boolean")
                    settings.soundEnabled = stored.soundEnabled;
                if (typeof stored.volume === "number" && Number.isFinite(stored.volume))
                    settings.volume = Math.min(1, Math.max(0, stored.volume));
            }
            const names = Array.from({ length: 6 }, (_, i) => {
                const name = Array.isArray(data.names) ? data.names[i] : null;
                return typeof name === "string" && name.trim() ? name.trim().slice(0, 24) : `Jogador ${i + 1}`;
            });
            return { names, settings };
        }
        catch {
            return fallback;
        }
    }
    static save(preferences) {
        try {
            localStorage.setItem(KEY, JSON.stringify(preferences));
            return true;
        }
        catch {
            return false;
        }
    }
}

````

## dist/Timer.js

````javascript
const defaultClock = {
    now: () => performance.now(),
    every: callback => setInterval(callback, 40),
    cancel: handle => clearInterval(handle)
};
export class Timer {
    onTick;
    onExpire;
    clock;
    handle = null;
    deadline = 0;
    remainingMs = 0;
    running = false;
    constructor(onTick, onExpire, clock = defaultClock) {
        this.onTick = onTick;
        this.onExpire = onExpire;
        this.clock = clock;
    }
    totalMs = 1;
    start(seconds) {
        this.stop();
        this.totalMs = seconds * 1000;
        this.remainingMs = this.totalMs;
        this.resume();
    }
    resume() {
        if (this.running || this.remainingMs <= 0)
            return;
        this.running = true;
        this.deadline = this.clock.now() + this.remainingMs;
        this.handle = this.clock.every(() => this.tick());
        this.tick();
    }
    tick() {
        if (!this.running)
            return;
        this.remainingMs = Math.max(0, this.deadline - this.clock.now());
        this.onTick(Math.ceil(this.remainingMs / 1000), this.remainingMs / this.totalMs);
        if (this.remainingMs <= 0) {
            this.stop();
            this.onExpire();
        }
    }
    // Conferir o prazo também no clique evita aceitar respostas após o fim do tempo.
    isExpired() {
        return this.running && this.clock.now() >= this.deadline;
    }
    pause() {
        if (!this.running)
            return;
        this.remainingMs = Math.max(0, this.deadline - this.clock.now());
        this.clearHandle();
    }
    stop() { this.clearHandle(); this.remainingMs = 0; }
    clearHandle() {
        if (this.handle !== null)
            this.clock.cancel(this.handle);
        this.handle = null;
        this.running = false;
    }
}

````

## dist/categories.js

````javascript
export const CATEGORIES = [
    "Animais", "Comidas", "Países", "Cidades", "Profissões", "Filmes", "Séries",
    "Objetos", "Marcas", "Esportes", "Frutas", "Vegetais", "Nomes", "Coisas da escola",
    "Coisas de casa", "Personagens", "Jogos", "Celebridades", "Meios de transporte",
    "Roupas", "Tecnologia", "Aplicativos", "Empresas", "Instrumentos musicais",
    "Partes do corpo", "Coisas da cozinha", "Coisas do quarto", "Lugares",
    "Matérias escolares", "Palavras da internet", "Coisas da praia", "Bebidas",
    "Coisas que voam", "Coisas que fazem barulho", "Hobbies", "Coisas de uma festa",
    "Objetos que cabem no bolso", "Coisas da natureza", "Doces", "Coisas de viagem"
];

````

## dist/main.js

````javascript
import { Game } from "./Game.js";
import { ALPHABET } from "./LetterManager.js";
import { SoundManager } from "./SoundManager.js";
import { StorageManager } from "./StorageManager.js";
function element(id) {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`Elemento ausente: ${id}`);
    return found;
}
const preferences = StorageManager.load();
const sound = new SoundManager();
let previousState = null;
let pendingConfirmation = null;
let toastHandle;
let lastSeconds = -1;
const dialogs = {
    help: element("help-dialog"),
    settings: element("settings-dialog"),
    pause: element("pause-dialog"),
    confirm: element("confirm-dialog")
};
const screens = {
    MENU: element("menu-screen"), SETUP: element("setup-screen"),
    PLAYING: element("game-screen"), ROUND_END: element("round-screen"), GAME_END: element("end-screen")
};
const game = new Game({
    change: render,
    tick: (seconds, fraction) => {
        element("timer-number").textContent = String(seconds);
        document.getElementById("timer-progress")?.setAttribute("stroke-dashoffset", String((1 - fraction) * 100));
        element("timer").classList.toggle("urgent", seconds > 0 && seconds <= 3);
        if (seconds !== lastSeconds) {
            element("timer").setAttribute("aria-label", `${seconds} segundos restantes`);
            lastSeconds = seconds;
        }
    },
    sound: name => sound.play(name)
});
function announce(message) {
    const toast = element("status-message");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => toast.classList.remove("visible"), 4500);
}
function save() {
    if (!StorageManager.save(preferences))
        announce("Não foi possível salvar preferências neste navegador. Você ainda pode jogar.");
}
function syncSound() {
    sound.enabled = preferences.settings.soundEnabled;
    sound.volume = preferences.settings.volume;
    element("sound-toggle").checked = sound.enabled;
    element("volume").value = String(Math.round(sound.volume * 100));
    element("volume-output").textContent = `${Math.round(sound.volume * 100)}%`;
    element("sound-button").textContent = sound.enabled ? "♪" : "♪̸";
    element("sound-button").setAttribute("aria-pressed", String(sound.enabled));
    element("sound-button").setAttribute("aria-label", sound.enabled ? "Desligar sons" : "Ligar sons");
}
function openDialog(dialog) { if (!dialog.open)
    dialog.showModal(); }
function closeAllDialogs() { Object.values(dialogs).forEach(dialog => { if (dialog.open)
    dialog.close(); }); }
function showHelp() {
    if (game.state === "PLAYING")
        game.pause();
    openDialog(dialogs.help);
}
function confirmAction(title, description, buttonText, action) {
    pendingConfirmation = action;
    element("confirm-title").textContent = title;
    element("confirm-description").textContent = description;
    element("confirm-accept").textContent = buttonText;
    openDialog(dialogs.confirm);
    element("confirm-cancel").focus();
}
function requestMenu() {
    if (game.state === "PLAYING")
        game.pause();
    if (["PAUSED", "ROUND_END"].includes(game.state)) {
        confirmAction("Abandonar a partida?", "O placar desta partida será perdido. Os nomes e as configurações continuarão salvos.", "Sim, voltar ao menu", () => { closeAllDialogs(); game.menu(); });
    }
    else {
        closeAllDialogs();
        game.menu();
    }
}
function collectNames() {
    document.querySelectorAll("#player-fields input").forEach((input, i) => {
        preferences.names[i] = input.value.slice(0, 24);
    });
}
function renderPlayerFields() {
    const container = element("player-fields");
    container.replaceChildren();
    for (let i = 0; i < preferences.settings.playerCount; i++) {
        const label = document.createElement("label");
        label.textContent = `Jogador ${i + 1}`;
        const input = document.createElement("input");
        input.id = `player-name-${i}`;
        input.name = `player-${i}`;
        input.maxLength = 24;
        input.autocomplete = "off";
        input.placeholder = `Jogador ${i + 1}`;
        input.value = preferences.names[i] ?? `Jogador ${i + 1}`;
        input.addEventListener("change", () => { collectNames(); save(); });
        label.append(input);
        container.append(label);
    }
    document.querySelectorAll("[data-count]").forEach(button => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.count) === preferences.settings.playerCount));
    });
}
function populateSetup() {
    renderPlayerFields();
    element("turn-time").value = String(preferences.settings.turnTime);
    element("round-count").value = String(preferences.settings.roundCount);
    element("setup-error").textContent = "";
}
function renderScores(target, players, highlight) {
    const list = element(target);
    list.replaceChildren();
    const ordered = highlight ? players : [...players].sort((a, b) => b.score - a.score || a.id - b.id);
    ordered.forEach(player => {
        const row = document.createElement("li");
        if (highlight && player.isActive)
            row.classList.add("active");
        const avatar = document.createElement("span");
        avatar.className = `avatar color-${player.id}`;
        avatar.textContent = Array.from(player.name)[0]?.toUpperCase() ?? "?";
        avatar.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "score-name";
        name.textContent = player.name;
        if (highlight && player.isActive) {
            const badge = document.createElement("small");
            badge.textContent = "Sua vez";
            name.append(badge);
        }
        const score = document.createElement("span");
        score.className = "score-points";
        score.textContent = String(player.score);
        score.setAttribute("aria-label", `${player.score} pontos`);
        row.append(avatar, name, score);
        list.append(row);
    });
}
function renderHistory() {
    const list = element("move-history");
    list.replaceChildren();
    if (game.history.length === 0) {
        const empty = document.createElement("li");
        empty.className = "history-empty";
        empty.textContent = "A primeira letra está esperando por vocês.";
        list.append(empty);
    }
    game.history.slice(0, 5).forEach(move => {
        const item = document.createElement("li");
        const letter = document.createElement("span");
        letter.className = "history-letter";
        letter.textContent = move.letter;
        const description = document.createElement("span");
        description.className = "history-description";
        description.textContent = move.playerName;
        const round = document.createElement("small");
        round.textContent = `Rodada ${move.round}`;
        description.append(round);
        item.append(letter, description);
        list.append(item);
    });
}
function render() {
    const displayState = game.state === "PAUSED" ? "PLAYING" : game.state;
    Object.entries(screens).forEach(([state, screen]) => { screen.hidden = state !== displayState; });
    if (game.state === "PLAYING" || game.state === "PAUSED") {
        const limit = game.settings?.roundCount || "∞";
        element("round-label").textContent = `RODADA ${game.round} DE ${limit}`;
        element("category-title").textContent = game.category;
        const turn = element("turn-label");
        turn.replaceChildren("Vez de ");
        const name = document.createElement("strong");
        name.textContent = game.currentPlayer?.name ?? "";
        turn.append(name);
        turn.classList.remove("changing");
        void turn.offsetWidth;
        turn.classList.add("changing");
        element("letters-remaining").textContent = String(game.letters.remaining);
        document.querySelectorAll("[data-letter]").forEach(button => {
            const used = game.letters.isUsed(button.dataset.letter ?? "");
            button.disabled = used || game.state !== "PLAYING";
            button.classList.toggle("used", used);
            button.setAttribute("aria-label", `Letra ${button.dataset.letter}${used ? ", já utilizada" : ""}`);
        });
        renderScores("live-score", game.players, true);
        renderHistory();
    }
    if (game.state === "PAUSED")
        openDialog(dialogs.pause);
    else if (dialogs.pause.open)
        dialogs.pause.close();
    if (game.state === "ROUND_END") {
        element("round-end-label").textContent = `FIM DA RODADA ${game.round}`;
        element("round-end-title").textContent = game.result?.reason === "all-letters" ? "Alfabeto completo!" : "O tempo acabou!";
        element("round-result-message").textContent = game.result?.reason === "all-letters"
            ? "Vocês usaram todas as letras! Cada jogador ganha 1 ponto."
            : `${game.result?.loserName} não respondeu a tempo. Os demais ganham 1 ponto!`;
        renderScores("round-score", game.players, false);
        element("next-category").hidden = game.isLastRound;
        element("next-round-button").textContent = game.isLastRound ? "VER RESULTADO FINAL" : "PRÓXIMA RODADA";
        element("finish-unlimited").hidden = game.settings?.roundCount !== 0;
    }
    if (game.state === "GAME_END") {
        element("winner-label").textContent = game.leaders.length > 1 ? "VITÓRIA COMPARTILHADA" : "VENCEDOR";
        element("end-title").textContent = game.leaders.map(player => player.name).join(" + ");
        element("winner-description").textContent = `${game.leaders[0]?.score ?? 0} pontos · ${game.round} rodadas de boas ideias.`;
        renderScores("final-score", game.players, false);
    }
    if (previousState !== game.state) {
        if (game.state === "SETUP")
            populateSetup();
        if (game.state !== "PAUSED" && previousState !== "PAUSED") {
            const heading = screens[displayState].querySelector("h1");
            if (heading && previousState !== null) {
                heading.tabIndex = -1;
                heading.focus({ preventScroll: true });
            }
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    }
    previousState = game.state;
}
function selectLetter(letter) {
    sound.unlock();
    if (game.selectLetter(letter)) {
        const button = document.querySelector(`[data-letter="${letter}"]`);
        button?.classList.add("just-used");
    }
}
for (const letter of ALPHABET) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = letter;
    button.dataset.letter = letter;
    button.className = "letter-button";
    button.setAttribute("aria-label", `Letra ${letter}`);
    button.addEventListener("click", () => selectLetter(letter));
    button.addEventListener("animationend", () => button.classList.remove("just-used"));
    element("letter-board").append(button);
}
element("play-button").addEventListener("click", () => game.setup());
element("setup-back").addEventListener("click", () => { collectNames(); save(); game.menu(); });
element("brand-home").addEventListener("click", event => { event.preventDefault(); requestMenu(); });
element("help-button").addEventListener("click", showHelp);
element("menu-help").addEventListener("click", showHelp);
element("settings-button").addEventListener("click", () => openDialog(dialogs.settings));
document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => element(button.dataset.close ?? "").close());
});
element("player-count").addEventListener("click", event => {
    const button = event.target.closest("[data-count]");
    if (!button)
        return;
    collectNames();
    preferences.settings.playerCount = Number(button.dataset.count);
    renderPlayerFields();
    save();
});
element("turn-time").addEventListener("change", () => {
    preferences.settings.turnTime = Number(element("turn-time").value);
    save();
});
element("round-count").addEventListener("change", () => {
    preferences.settings.roundCount = Number(element("round-count").value);
    save();
});
element("setup-form").addEventListener("submit", event => {
    event.preventDefault();
    collectNames();
    const names = Array.from({ length: preferences.settings.playerCount }, (_, i) => preferences.names[i]?.trim() || `Jogador ${i + 1}`);
    if (new Set(names.map(name => name.toLocaleLowerCase("pt-BR"))).size !== names.length) {
        element("setup-error").textContent = "Escolha nomes diferentes para identificar cada jogador.";
        return;
    }
    names.forEach((name, i) => { preferences.names[i] = name; });
    save();
    sound.unlock();
    game.start(names, preferences.settings);
});
element("sound-button").addEventListener("click", () => {
    preferences.settings.soundEnabled = !preferences.settings.soundEnabled;
    syncSound();
    sound.unlock();
    save();
});
element("sound-toggle").addEventListener("change", () => {
    preferences.settings.soundEnabled = element("sound-toggle").checked;
    syncSound();
    sound.unlock();
    sound.play("letter");
    save();
});
element("volume").addEventListener("input", () => {
    preferences.settings.volume = Number(element("volume").value) / 100;
    syncSound();
    save();
});
element("volume").addEventListener("change", () => { sound.unlock(); sound.play("letter"); });
element("pause-button").addEventListener("click", () => game.pause());
element("resume-button").addEventListener("click", () => game.resume());
element("pause-menu-button").addEventListener("click", requestMenu);
element("restart-round-button").addEventListener("click", () => {
    confirmAction("Reiniciar esta rodada?", "As letras e jogadas desta rodada serão apagadas. O placar das rodadas anteriores será mantido.", "Sim, reiniciar rodada", () => game.restartRound());
});
element("confirm-cancel").addEventListener("click", () => { pendingConfirmation = null; dialogs.confirm.close(); });
element("confirm-accept").addEventListener("click", () => {
    const action = pendingConfirmation;
    pendingConfirmation = null;
    dialogs.confirm.close();
    action?.();
});
dialogs.confirm.addEventListener("cancel", () => { pendingConfirmation = null; });
dialogs.pause.addEventListener("cancel", event => { event.preventDefault(); game.resume(); });
element("next-round-button").addEventListener("click", () => { sound.unlock(); game.nextRound(); });
element("finish-unlimited").addEventListener("click", () => game.finish());
element("replay-button").addEventListener("click", () => {
    if (game.settings) {
        game.settings.soundEnabled = preferences.settings.soundEnabled;
        game.settings.volume = preferences.settings.volume;
    }
    sound.unlock();
    game.replay();
});
element("new-game-button").addEventListener("click", () => game.setup());
element("end-menu-button").addEventListener("click", () => game.menu());
const fullscreen = element("fullscreen-button");
if (!document.fullscreenEnabled) {
    fullscreen.disabled = true;
    fullscreen.title = "Tela cheia indisponível neste navegador";
}
fullscreen.addEventListener("click", async () => {
    try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else
            await document.documentElement.requestFullscreen();
    }
    catch {
        announce("O navegador não permitiu ativar a tela cheia.");
    }
});
document.addEventListener("fullscreenchange", () => {
    fullscreen.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ativar tela cheia");
});
document.addEventListener("keydown", event => {
    const target = event.target;
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input, select, textarea, [contenteditable=true]"))
        return;
    const blockingDialog = dialogs.help.open || dialogs.settings.open || dialogs.confirm.open;
    if (blockingDialog)
        return;
    if (event.code === "Space" && (game.state === "PLAYING" || game.state === "PAUSED")) {
        event.preventDefault();
        if (game.state === "PLAYING")
            game.pause();
        else
            game.resume();
    }
    else if (event.key === "Escape" && game.state === "PLAYING") {
        event.preventDefault();
        game.pause();
    }
    else if (game.state === "PLAYING" && /^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        selectLetter(event.key.toUpperCase());
    }
});
document.addEventListener("visibilitychange", () => { if (document.hidden)
    game.pause(); });
syncSound();
render();

````

## dist/types.js

````javascript
export {};

````

## index.html

````html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#080a12">
  <meta name="description" content="Reúna a turma e pense rápido! Um jogo de palavras para 2 a 6 jogadores, com 40 categorias, letras e uma corrida contra o tempo.">
  <title>Letra Rápida — Pense rápido. Jogue junto.</title>
  <link rel="icon" type="image/svg+xml" href="./assets/icons/favicon.svg">
  <link rel="stylesheet" href="./css/style.css">
  <link rel="stylesheet" href="./css/animations.css">
  <link rel="stylesheet" href="./css/responsive.css">
  <script type="module" src="./dist/main.js"></script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#" id="brand-home" aria-label="Letra Rápida — voltar ao menu"><img class="brand-icon" src="./assets/icons/favicon.svg" alt="" width="36" height="36"> letra<span>rápida</span><span class="brand-dot">.</span></a>
    <nav aria-label="Controles gerais">
      <button class="icon-button" id="help-button" aria-label="Como jogar" title="Como jogar">?</button>
      <button class="icon-button" id="sound-button" aria-label="Desligar sons" title="Sons" aria-pressed="true">♪</button>
      <button class="icon-button" id="fullscreen-button" aria-label="Ativar tela cheia" title="Tela cheia">⛶</button>
    </nav>
  </header>
  <main>
    <section id="menu-screen" class="screen menu-screen" aria-labelledby="menu-title">
      <div class="eyebrow"><span class="tiny-spark">✦</span> O JOGO DE PALAVRAS DA TURMA</div>
      <div class="menu-title-wrap">
        <span class="floating-letter letter-one" aria-hidden="true">A</span>
        <h1 id="menu-title">letra<br><span>rápida</span><span class="title-dot">.</span></h1>
        <span class="floating-letter letter-two" aria-hidden="true">R</span>
        <span class="floating-letter letter-three" aria-hidden="true">Z</span>
      </div>
      <p class="menu-subtitle">Pense rápido. Escolha uma letra.<br>Não deixe o tempo acabar.</p>
      <div class="menu-actions">
        <button id="play-button" class="button primary big"><span aria-hidden="true">✦</span> JOGAR</button>
        <div class="secondary-actions"><button class="button secondary" id="menu-help">Como jogar</button><button class="button secondary" id="settings-button">Configurações</button></div>
      </div>
      <div class="game-facts"><span><b>2–6</b> jogadores</span><span><b>40</b> categorias</span><span><b>∞</b> boas respostas</span></div>
      <p class="menu-note">Uma tela. Toda a turma. Quem pensa mais rápido?</p>
    </section>

    <section id="setup-screen" class="screen narrow" aria-labelledby="setup-title" hidden>
      <button class="text-button back-button" id="setup-back">Voltar ao menu</button>
      <div class="eyebrow">PREPARE A TURMA</div>
      <h1 id="setup-title">Quem vai <span class="accent">jogar?</span></h1>
      <p class="muted">Escolham os nomes, acertem o ritmo e vamos nessa.</p>
      <form id="setup-form" class="setup-card">
        <fieldset><legend>Quantidade de jogadores</legend>
          <div id="player-count" class="choice-group" aria-label="Quantidade de jogadores">
            <button type="button" data-count="2" aria-pressed="true">2</button><button type="button" data-count="3" aria-pressed="false">3</button><button type="button" data-count="4" aria-pressed="false">4</button><button type="button" data-count="5" aria-pressed="false">5</button><button type="button" data-count="6" aria-pressed="false">6</button>
          </div>
        </fieldset>
        <div id="player-fields" class="player-fields"></div>
        <div class="settings-grid">
          <label>Tempo por jogador<select id="turn-time"><option value="5">5 segundos · intenso</option><option value="10">10 segundos · clássico</option><option value="15">15 segundos</option><option value="20">20 segundos</option><option value="30">30 segundos · tranquilo</option></select></label>
          <label>Quantidade de rodadas<select id="round-count"><option value="3">3 rodadas</option><option value="5">5 rodadas</option><option value="10">10 rodadas</option><option value="0">Ilimitado</option></select></label>
        </div>
        <div class="inline-tip"><span aria-hidden="true">✦</span><p>Fale a palavra em voz alta e toque na inicial. A turma decide se a resposta vale!</p></div>
        <p id="setup-error" class="error-message" role="alert"></p>
        <button class="button primary full" type="submit">INICIAR PARTIDA</button>
      </form>
    </section>

    <section id="game-screen" class="screen game-screen" aria-label="Partida" hidden>
      <div class="game-topbar"><span id="round-label" class="pill">RODADA 1 DE 5</span><span class="live-label">VALENDO!</span><button id="pause-button" class="button secondary small" aria-label="Pausar partida">Ⅱ <span>Pausar</span></button></div>
      <div class="game-layout">
        <aside class="score-panel"><div class="panel-heading"><h2>Na disputa</h2><span>PTS</span></div><ol id="live-score" class="score-list"></ol><p class="score-note">Respondeu a tempo?<br>Continue na disputa.</p></aside>
        <div class="play-area">
          <div class="eyebrow">A CATEGORIA É</div>
          <h1 id="category-title" class="category-title"></h1>
          <p id="turn-label" class="turn-label" aria-live="polite"></p>
          <div id="timer" class="timer" role="timer" aria-label="Tempo restante">
            <svg class="timer-svg" viewBox="0 0 160 160" aria-hidden="true"><circle class="timer-track" cx="80" cy="80" r="70"/><circle id="timer-progress" class="timer-progress" cx="80" cy="80" r="70" pathLength="100"/></svg>
            <div><strong id="timer-number">10</strong><span>SEGUNDOS</span></div>
          </div>
          <div class="letters-heading"><span>FALE A PALAVRA. ESCOLHA A INICIAL.</span><span><b id="letters-remaining">26</b> disponíveis</span></div>
          <div id="letter-board" class="letter-board" role="group" aria-label="Letras do alfabeto"></div>
          <p class="keyboard-hint"><kbd>A</kbd> – <kbd>Z</kbd> para escolher <span>·</span> <kbd>espaço</kbd> para pausar</p>
        </div>
        <aside class="history-panel"><div class="panel-heading"><h2>Últimas jogadas</h2><span aria-hidden="true">↺</span></div><ol id="move-history" class="history-list"></ol><p class="history-tip">Cada letra só vale uma vez por rodada. Capriche na próxima!</p></aside>
      </div>
    </section>

    <section id="round-screen" class="screen narrow result-screen" aria-labelledby="round-end-title" hidden>
      <div class="result-symbol" aria-hidden="true">⌛</div><div class="eyebrow" id="round-end-label">FIM DA RODADA</div>
      <h1 id="round-end-title">O tempo acabou!</h1><p id="round-result-message" class="result-description"></p>
      <div class="results-card"><div class="panel-heading"><h2>Placar da turma</h2><span>PONTOS</span></div><ol id="round-score" class="score-list"></ol></div>
      <p id="next-category" class="next-category">Próxima categoria <strong>???</strong></p>
      <button id="next-round-button" class="button primary full">PRÓXIMA RODADA</button>
      <button id="finish-unlimited" class="text-button" hidden>Encerrar partida e ver resultado</button>
    </section>

    <section id="end-screen" class="screen narrow result-screen" aria-labelledby="end-title" hidden>
      <div class="result-symbol trophy" aria-hidden="true">🏆</div><div class="eyebrow">FIM DE JOGO · TURMA, TEMOS UM RESULTADO!</div>
      <p id="winner-label" class="winner-label">VENCEDOR</p><h1 id="end-title" class="accent"></h1><p id="winner-description" class="muted"></p>
      <div class="results-card"><div class="panel-heading"><h2>Placar final</h2><span>PONTOS</span></div><ol id="final-score" class="score-list"></ol></div>
      <button id="replay-button" class="button primary full">JOGAR NOVAMENTE</button>
      <div class="secondary-actions"><button id="new-game-button" class="button secondary">Nova partida</button><button id="end-menu-button" class="button secondary">Voltar ao menu</button></div>
    </section>
  </main>
  <footer class="site-footer"><span>FEITO PARA JOGAR JUNTO.</span><span>Uma letra pode mudar tudo <span class="accent">✦</span></span></footer>
  <div id="status-message" class="toast" role="status"></div>

  <dialog id="help-dialog" aria-labelledby="help-title">
    <div class="dialog-heading"><span class="eyebrow">RÁPIDO DE APRENDER</span><button class="icon-button" data-close="help-dialog" aria-label="Fechar instruções">×</button></div>
    <h2 id="help-title">Como jogar</h2>
    <ol class="rules-list">
      <li>Uma categoria é sorteada no início da rodada.</li><li>O jogador destacado começa.</li><li>Fale uma palavra da categoria em voz alta.</li><li>Toque ou digite a letra inicial da palavra.</li><li>A letra fica bloqueada até a próxima rodada.</li><li>A vez passa para o próximo jogador, que usa outra letra.</li><li>Responda antes que o cronômetro chegue a zero.</li><li>Se o tempo acabar, a rodada termina e os demais ganham 1 ponto. Se usarem as 26 letras, todos ganham 1 ponto.</li><li>Ao final, quem tiver mais pontos vence. Empates são compartilhados!</li>
    </ol>
    <p class="inline-tip">As respostas são validadas pela turma. Não é necessário microfone.</p>
    <p class="muted">Espaço pausa ou continua. Esc abre a pausa. Ao mudar de aba, a partida pausa automaticamente.</p>
    <button class="button primary full" data-close="help-dialog">ENTENDI, VAMOS JOGAR</button>
  </dialog>

  <dialog id="settings-dialog" aria-labelledby="settings-title">
    <div class="dialog-heading"><span class="eyebrow">DO SEU JEITO</span><button class="icon-button" data-close="settings-dialog" aria-label="Fechar configurações">×</button></div>
    <h2 id="settings-title">Configurações</h2>
    <label class="toggle-row" for="sound-toggle"><span>Efeitos sonoros<small>Cliques, alertas e comemorações</small></span><input id="sound-toggle" type="checkbox" role="switch"></label>
    <label class="volume-label" for="volume">Volume <output id="volume-output">35%</output></label><input id="volume" type="range" min="0" max="100" step="5">
    <p class="muted">O tempo e as rodadas são definidos ao preparar a partida. Suas preferências ficam salvas neste navegador.</p>
    <button class="button primary full" data-close="settings-dialog">PRONTO</button>
  </dialog>

  <dialog id="pause-dialog" aria-labelledby="pause-title">
    <div class="eyebrow">PODE RESPIRAR</div><h2 id="pause-title">Jogo pausado.</h2><p class="muted">A próxima palavra pode esperar um pouquinho.</p>
    <div class="dialog-actions"><button id="resume-button" class="button primary">CONTINUAR</button><button id="restart-round-button" class="button secondary">Reiniciar rodada</button><button id="pause-menu-button" class="text-button">Voltar ao menu</button></div>
  </dialog>

  <dialog id="confirm-dialog" aria-labelledby="confirm-title">
    <div class="eyebrow">ANTES DE CONTINUAR</div><h2 id="confirm-title">Abandonar a partida?</h2><p id="confirm-description" class="muted">O placar desta partida será perdido. Os nomes e as configurações continuarão salvos.</p>
    <div class="dialog-actions"><button id="confirm-cancel" class="button primary">Continuar aqui</button><button id="confirm-accept" class="button secondary">Sim, voltar ao menu</button></div>
  </dialog>
  <noscript><p class="noscript">Ative o JavaScript no navegador para jogar Letra Rápida.</p></noscript>
</body>
</html>

````

## package.json

````json
{
  "name": "letra-rapida",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Jogo local de palavras para 2 a 6 pessoas, sem frameworks.",
  "scripts": {
    "build": "tsc && node scripts/build.mjs",
    "check": "tsc --noEmit",
    "start": "node scripts/serve.mjs",
    "test": "npm run build && node --test tests/*.test.mjs",
    "docs": "node scripts/source-doc.mjs"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
````

## scripts/build.mjs

````javascript
import { mkdir, copyFile, cp } from "node:fs/promises";
await mkdir("build", { recursive: true });
await copyFile("index.html", "build/index.html");
for (const folder of ["css", "assets", "dist"]) await cp(folder, `build/${folder}`, { recursive: true });
console.log("Compilado: dist/main.js. Site pronto em build/.");

````

## scripts/serve.mjs

````javascript
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("build");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".wav": "audio/wav" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    let file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    response.end(await readFile(file));
  } catch { response.writeHead(404).end("Arquivo não encontrado. Execute npm run build."); }
});
server.listen(4173, "127.0.0.1", () => console.log("Letra Rápida: http://127.0.0.1:4173"));
server.on("error", error => { console.error(error.message); process.exitCode = 1; });

````

## scripts/source-doc.mjs

````javascript
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
const excluded = new Set(["node_modules", ".git", ".sites-runtime", ".openai", "build", "CODIGO_COMPLETO.md", "package-lock.json"]);
async function list(directory = ".") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.endsWith(".zip") || entry.name.endsWith(".tar.gz")) continue;
    const path = directory === "." ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await list(path)); else result.push(path);
  }
  return result.sort();
}
let output = "# Letra Rápida — código completo\n\nArquivos integrais de implementação, JavaScript compilado, testes e instruções.\n\n";
for (const path of await list()) {
  const language = { ".ts": "typescript", ".js": "javascript", ".mjs": "javascript", ".css": "css", ".html": "html", ".json": "json", ".svg": "xml", ".md": "markdown" }[extname(path)] ?? "text";
  output += `## ${path}\n\n` + "````" + language + "\n" + await readFile(path, "utf8") + "\n````\n\n";
}
await writeFile("CODIGO_COMPLETO.md", output);
console.log("Código completo documentado em CODIGO_COMPLETO.md.");

````

## src/CategoryManager.ts

````typescript
import { CATEGORIES } from "./categories.js";
export class CategoryManager {
  private previous = "";
  constructor(private readonly categories: readonly string[] = CATEGORIES,
    private readonly random: () => number = Math.random) {
    if (categories.length < 2 || new Set(categories).size < 2) throw new Error("Cadastre ao menos duas categorias distintas.");
  }
  draw(): string {
    const choices = this.categories.filter(category => category !== this.previous);
    this.previous = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    return this.previous;
  }
}

````

## src/Game.ts

````typescript
import { Player } from "./Player.js";
import { Timer, type TimerClock } from "./Timer.js";
import { LetterManager } from "./LetterManager.js";
import { CategoryManager } from "./CategoryManager.js";
import type { GameSettings, GameState, Move, RoundResult, SoundName } from "./types.js";
interface GameEvents {
  change(): void;
  tick(seconds: number, fraction: number): void;
  sound(name: SoundName): void;
}
export class Game {
  state: GameState = "MENU";
  players: Player[] = [];
  settings: GameSettings | null = null;
  round = 0;
  category = "";
  currentIndex = 0;
  history: Move[] = [];
  result: RoundResult | null = null;
  readonly letters = new LetterManager();
  readonly timer: Timer;
  private readonly categories = new CategoryManager();
  private lastWarning = 0;
  private inputReadyAt = 0;
  private readonly now: () => number;
  constructor(private readonly events: GameEvents, clock?: TimerClock) {
    this.now = clock?.now ?? (() => performance.now());
    this.timer = new Timer((seconds, fraction) => {
      events.tick(seconds, fraction);
      if (this.state === "PLAYING" && seconds > 0 && seconds <= 3 && seconds !== this.lastWarning) {
        this.lastWarning = seconds;
        events.sound("warning");
      }
    }, () => this.endRound("timeout"), clock);
  }
  get currentPlayer(): Player | undefined { return this.players[this.currentIndex]; }
  get isLastRound(): boolean { return this.settings !== null && this.settings.roundCount > 0 && this.round >= this.settings.roundCount; }
  get leaders(): Player[] {
    const highest = Math.max(...this.players.map(player => player.score));
    return this.players.filter(player => player.score === highest);
  }
  setup(): void { this.timer.stop(); this.state = "SETUP"; this.events.change(); }
  start(names: string[], settings: GameSettings): void {
    if (![2,3,4,5,6].includes(settings.playerCount) || names.length !== settings.playerCount ||
      ![5,10,15,20,30].includes(settings.turnTime) || ![0,3,5,10].includes(settings.roundCount)) {
      throw new Error("Configuração de partida inválida.");
    }
    this.settings = { ...settings };
    this.players = names.map((name, index) => new Player(index, name.trim().slice(0,24) || `Jogador ${index+1}`));
    this.round = 0;
    this.history = [];
    this.nextRound();
  }
  nextRound(): void {
    if (!this.settings || (this.round > 0 && this.state !== "ROUND_END")) return;
    if (this.round > 0 && this.isLastRound) { this.finish(); return; }
    this.round++;
    this.category = this.categories.draw();
    this.beginRound();
  }
  private beginRound(): void {
    if (!this.settings) return;
    this.timer.stop();
    this.result = null;
    this.letters.reset();
    this.currentIndex = (this.round - 1) % this.players.length;
    this.state = "PLAYING";
    this.inputReadyAt = this.now() + 250;
    this.activate();
    this.events.change();
    this.startTimer();
  }
  private activate(): void {
    this.players.forEach((player, index) => { player.isActive = index === this.currentIndex; });
  }
  private startTimer(): void {
    if (!this.settings) return;
    this.lastWarning = 0;
    this.timer.start(this.settings.turnTime);
  }
  selectLetter(raw: string): boolean {
    if (this.state !== "PLAYING" || this.now() < this.inputReadyAt) return false;
    if (this.timer.isExpired()) { this.endRound("timeout"); return false; }
    const letter = raw.toUpperCase();
    if (!this.currentPlayer || !this.letters.use(letter)) return false;
    this.timer.stop();
    this.history.unshift({ playerId: this.currentPlayer.id, playerName: this.currentPlayer.name, letter, round: this.round });
    this.history = this.history.slice(0,100);
    this.events.sound("letter");
    if (this.letters.remaining === 0) { this.endRound("all-letters"); return true; }
    this.currentIndex = (this.currentIndex + 1) % this.players.length;
    this.inputReadyAt = this.now() + 250;
    this.activate();
    this.events.change();
    this.events.sound("turn");
    this.startTimer();
    return true;
  }
  private endRound(reason: RoundResult["reason"]): void {
    if (this.state !== "PLAYING") return;
    this.timer.stop();
    const loser = reason === "timeout" ? this.currentPlayer : null;
    this.result = { reason, loserName: loser?.name ?? null };
    this.players.forEach(player => { if (player !== loser) player.awardPoint(); player.isActive = false; });
    this.state = "ROUND_END";
    this.events.sound(reason === "timeout" ? "timeout" : "victory");
    this.events.change();
  }
  pause(): void {
    if (this.state !== "PLAYING") return;
    if (this.timer.isExpired()) { this.endRound("timeout"); return; }
    this.timer.pause();
    this.state = "PAUSED";
    this.events.change();
  }
  resume(): void {
    if (this.state !== "PAUSED") return;
    this.state = "PLAYING";
    this.inputReadyAt = this.now() + 250;
    this.events.change();
    this.timer.resume();
  }
  restartRound(): void {
    if (this.state !== "PAUSED") return;
    this.history = this.history.filter(move => move.round !== this.round);
    this.beginRound();
  }
  finish(): void {
    if (this.state !== "ROUND_END") return;
    this.timer.stop();
    this.state = "GAME_END";
    this.events.sound("victory");
    this.events.change();
  }
  replay(): void {
    if (this.settings) this.start(this.players.map(player => player.name), this.settings);
  }
  menu(): void {
    this.timer.stop();
    this.players.forEach(player => { player.isActive = false; });
    this.state = "MENU";
    this.events.change();
  }
}

````

## src/LetterManager.ts

````typescript
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export class LetterManager {
  private used = new Set<string>();
  get remaining(): number { return ALPHABET.length - this.used.size; }
  isUsed(letter: string): boolean { return this.used.has(letter); }
  use(letter: string): boolean {
    if (!ALPHABET.includes(letter) || this.used.has(letter)) return false;
    this.used.add(letter);
    return true;
  }
  reset(): void { this.used.clear(); }
}

````

## src/Player.ts

````typescript
export class Player {
  score = 0;
  wins = 0;
  isActive = false;
  constructor(public readonly id: number, public readonly name: string) {}
  awardPoint(): void { this.score++; this.wins++; }
}

````

## src/SoundManager.ts

````typescript
import type { SoundName } from "./types.js";
export class SoundManager {
  private context: AudioContext | null = null;
  enabled = true;
  volume = 0.35;
  // Substitua valores por caminhos, por exemplo: "./assets/audio/letter.mp3".
  private readonly files: Partial<Record<SoundName, string>> = {};
  private readonly notes: Record<SoundName, number[]> = {
    letter: [660], turn: [440, 660], warning: [880],
    timeout: [330, 220, 110], victory: [523, 659, 784, 1047]
  };
  unlock(): void {
    if (!this.enabled) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch { /* O jogo continua em navegadores sem áudio. */ }
  }
  play(name: SoundName): void {
    if (!this.enabled || this.volume === 0) return;
    const file = this.files[name];
    if (file) {
      const audio = new Audio(file);
      audio.volume = this.volume;
      void audio.play().catch(() => {});
      return;
    }
    const context = this.context;
    if (!context || context.state !== "running") return;
    this.notes[name].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.11;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.16, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.12);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }
}

````

## src/StorageManager.ts

````typescript
import type { GameSettings, SavedPreferences } from "./types.js";
export const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 2, turnTime: 10, roundCount: 5, soundEnabled: true, volume: 0.35
};
const KEY = "letra-rapida:preferences:v1";
export class StorageManager {
  static load(): SavedPreferences {
    const fallback = { names: ["Jogador 1", "Jogador 2"], settings: { ...DEFAULT_SETTINGS } };
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (!parsed || typeof parsed !== "object") return fallback;
      const data = parsed as Partial<SavedPreferences>;
      const settings = { ...DEFAULT_SETTINGS };
      const stored = data.settings;
      if (stored && typeof stored === "object") {
        if ([2,3,4,5,6].includes(stored.playerCount)) settings.playerCount = stored.playerCount;
        if ([5,10,15,20,30].includes(stored.turnTime)) settings.turnTime = stored.turnTime;
        if ([0,3,5,10].includes(stored.roundCount)) settings.roundCount = stored.roundCount;
        if (typeof stored.soundEnabled === "boolean") settings.soundEnabled = stored.soundEnabled;
        if (typeof stored.volume === "number" && Number.isFinite(stored.volume)) settings.volume = Math.min(1, Math.max(0, stored.volume));
      }
      const names = Array.from({ length: 6 }, (_, i) => {
        const name: unknown = Array.isArray(data.names) ? data.names[i] : null;
        return typeof name === "string" && name.trim() ? name.trim().slice(0,24) : `Jogador ${i+1}`;
      });
      return { names, settings };
    } catch { return fallback; }
  }
  static save(preferences: SavedPreferences): boolean {
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); return true; }
    catch { return false; }
  }
}

````

## src/Timer.ts

````typescript
export interface TimerClock {
  now(): number;
  every(callback: () => void): ReturnType<typeof setInterval>;
  cancel(handle: ReturnType<typeof setInterval>): void;
}
const defaultClock: TimerClock = {
  now: () => performance.now(),
  every: callback => setInterval(callback, 40),
  cancel: handle => clearInterval(handle)
};
export class Timer {
  private handle: ReturnType<typeof setInterval> | null = null;
  private deadline = 0;
  private remainingMs = 0;
  private running = false;
  constructor(private readonly onTick: (seconds: number, fraction: number) => void,
    private readonly onExpire: () => void,
    private readonly clock: TimerClock = defaultClock) {}
  private totalMs = 1;
  start(seconds: number): void {
    this.stop();
    this.totalMs = seconds * 1000;
    this.remainingMs = this.totalMs;
    this.resume();
  }
  resume(): void {
    if (this.running || this.remainingMs <= 0) return;
    this.running = true;
    this.deadline = this.clock.now() + this.remainingMs;
    this.handle = this.clock.every(() => this.tick());
    this.tick();
  }
  private tick(): void {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.deadline - this.clock.now());
    this.onTick(Math.ceil(this.remainingMs / 1000), this.remainingMs / this.totalMs);
    if (this.remainingMs <= 0) {
      this.stop();
      this.onExpire();
    }
  }
  // Conferir o prazo também no clique evita aceitar respostas após o fim do tempo.
  isExpired(): boolean {
    return this.running && this.clock.now() >= this.deadline;
  }
  pause(): void {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.deadline - this.clock.now());
    this.clearHandle();
  }
  stop(): void { this.clearHandle(); this.remainingMs = 0; }
  private clearHandle(): void {
    if (this.handle !== null) this.clock.cancel(this.handle);
    this.handle = null;
    this.running = false;
  }
}

````

## src/categories.ts

````typescript
export const CATEGORIES: readonly string[] = [
  "Animais", "Comidas", "Países", "Cidades", "Profissões", "Filmes", "Séries",
  "Objetos", "Marcas", "Esportes", "Frutas", "Vegetais", "Nomes", "Coisas da escola",
  "Coisas de casa", "Personagens", "Jogos", "Celebridades", "Meios de transporte",
  "Roupas", "Tecnologia", "Aplicativos", "Empresas", "Instrumentos musicais",
  "Partes do corpo", "Coisas da cozinha", "Coisas do quarto", "Lugares",
  "Matérias escolares", "Palavras da internet", "Coisas da praia", "Bebidas",
  "Coisas que voam", "Coisas que fazem barulho", "Hobbies", "Coisas de uma festa",
  "Objetos que cabem no bolso", "Coisas da natureza", "Doces", "Coisas de viagem"
];

````

## src/main.ts

````typescript
import { Game } from "./Game.js";
import { ALPHABET } from "./LetterManager.js";
import { SoundManager } from "./SoundManager.js";
import { StorageManager } from "./StorageManager.js";
import type { Player } from "./Player.js";
import type { GameState } from "./types.js";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Elemento ausente: ${id}`);
  return found as T;
}
const preferences = StorageManager.load();
const sound = new SoundManager();
let previousState: GameState | null = null;
let pendingConfirmation: (() => void) | null = null;
let toastHandle: ReturnType<typeof setTimeout> | undefined;
let lastSeconds = -1;
const dialogs = {
  help: element<HTMLDialogElement>("help-dialog"),
  settings: element<HTMLDialogElement>("settings-dialog"),
  pause: element<HTMLDialogElement>("pause-dialog"),
  confirm: element<HTMLDialogElement>("confirm-dialog")
};
const screens: Record<Exclude<GameState, "PAUSED">, HTMLElement> = {
  MENU: element("menu-screen"), SETUP: element("setup-screen"),
  PLAYING: element("game-screen"), ROUND_END: element("round-screen"), GAME_END: element("end-screen")
};
const game = new Game({
  change: render,
  tick: (seconds, fraction) => {
    element("timer-number").textContent = String(seconds);
    document.getElementById("timer-progress")?.setAttribute("stroke-dashoffset", String((1 - fraction) * 100));
    element("timer").classList.toggle("urgent", seconds > 0 && seconds <= 3);
    if (seconds !== lastSeconds) {
      element("timer").setAttribute("aria-label", `${seconds} segundos restantes`);
      lastSeconds = seconds;
    }
  },
  sound: name => sound.play(name)
});
function announce(message: string): void {
  const toast = element("status-message");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => toast.classList.remove("visible"), 4500);
}
function save(): void {
  if (!StorageManager.save(preferences)) announce("Não foi possível salvar preferências neste navegador. Você ainda pode jogar.");
}
function syncSound(): void {
  sound.enabled = preferences.settings.soundEnabled;
  sound.volume = preferences.settings.volume;
  element<HTMLInputElement>("sound-toggle").checked = sound.enabled;
  element<HTMLInputElement>("volume").value = String(Math.round(sound.volume * 100));
  element("volume-output").textContent = `${Math.round(sound.volume * 100)}%`;
  element("sound-button").textContent = sound.enabled ? "♪" : "♪̸";
  element("sound-button").setAttribute("aria-pressed", String(sound.enabled));
  element("sound-button").setAttribute("aria-label", sound.enabled ? "Desligar sons" : "Ligar sons");
}
function openDialog(dialog: HTMLDialogElement): void { if (!dialog.open) dialog.showModal(); }
function closeAllDialogs(): void { Object.values(dialogs).forEach(dialog => { if (dialog.open) dialog.close(); }); }
function showHelp(): void {
  if (game.state === "PLAYING") game.pause();
  openDialog(dialogs.help);
}
function confirmAction(title: string, description: string, buttonText: string, action: () => void): void {
  pendingConfirmation = action;
  element("confirm-title").textContent = title;
  element("confirm-description").textContent = description;
  element("confirm-accept").textContent = buttonText;
  openDialog(dialogs.confirm);
  element("confirm-cancel").focus();
}
function requestMenu(): void {
  if (game.state === "PLAYING") game.pause();
  if (["PAUSED", "ROUND_END"].includes(game.state)) {
    confirmAction("Abandonar a partida?", "O placar desta partida será perdido. Os nomes e as configurações continuarão salvos.",
      "Sim, voltar ao menu", () => { closeAllDialogs(); game.menu(); });
  } else { closeAllDialogs(); game.menu(); }
}
function collectNames(): void {
  document.querySelectorAll<HTMLInputElement>("#player-fields input").forEach((input, i) => {
    preferences.names[i] = input.value.slice(0,24);
  });
}
function renderPlayerFields(): void {
  const container = element("player-fields");
  container.replaceChildren();
  for (let i = 0; i < preferences.settings.playerCount; i++) {
    const label = document.createElement("label");
    label.textContent = `Jogador ${i+1}`;
    const input = document.createElement("input");
    input.id = `player-name-${i}`;
    input.name = `player-${i}`;
    input.maxLength = 24;
    input.autocomplete = "off";
    input.placeholder = `Jogador ${i+1}`;
    input.value = preferences.names[i] ?? `Jogador ${i+1}`;
    input.addEventListener("change", () => { collectNames(); save(); });
    label.append(input);
    container.append(label);
  }
  document.querySelectorAll<HTMLButtonElement>("[data-count]").forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.count) === preferences.settings.playerCount));
  });
}
function populateSetup(): void {
  renderPlayerFields();
  element<HTMLSelectElement>("turn-time").value = String(preferences.settings.turnTime);
  element<HTMLSelectElement>("round-count").value = String(preferences.settings.roundCount);
  element("setup-error").textContent = "";
}
function renderScores(target: string, players: Player[], highlight: boolean): void {
  const list = element(target);
  list.replaceChildren();
  const ordered = highlight ? players : [...players].sort((a,b) => b.score - a.score || a.id - b.id);
  ordered.forEach(player => {
    const row = document.createElement("li");
    if (highlight && player.isActive) row.classList.add("active");
    const avatar = document.createElement("span");
    avatar.className = `avatar color-${player.id}`;
    avatar.textContent = Array.from(player.name)[0]?.toUpperCase() ?? "?";
    avatar.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = player.name;
    if (highlight && player.isActive) {
      const badge = document.createElement("small"); badge.textContent = "Sua vez"; name.append(badge);
    }
    const score = document.createElement("span");
    score.className = "score-points";
    score.textContent = String(player.score);
    score.setAttribute("aria-label", `${player.score} pontos`);
    row.append(avatar, name, score);
    list.append(row);
  });
}
function renderHistory(): void {
  const list = element("move-history");
  list.replaceChildren();
  if (game.history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "A primeira letra está esperando por vocês.";
    list.append(empty);
  }
  game.history.slice(0,5).forEach(move => {
    const item = document.createElement("li");
    const letter = document.createElement("span");
    letter.className = "history-letter";
    letter.textContent = move.letter;
    const description = document.createElement("span");
    description.className = "history-description";
    description.textContent = move.playerName;
    const round = document.createElement("small");
    round.textContent = `Rodada ${move.round}`;
    description.append(round);
    item.append(letter, description);
    list.append(item);
  });
}
function render(): void {
  const displayState = game.state === "PAUSED" ? "PLAYING" : game.state;
  Object.entries(screens).forEach(([state, screen]) => { screen.hidden = state !== displayState; });
  if (game.state === "PLAYING" || game.state === "PAUSED") {
    const limit = game.settings?.roundCount || "∞";
    element("round-label").textContent = `RODADA ${game.round} DE ${limit}`;
    element("category-title").textContent = game.category;
    const turn = element("turn-label");
    turn.replaceChildren("Vez de ");
    const name = document.createElement("strong");
    name.textContent = game.currentPlayer?.name ?? "";
    turn.append(name);
    turn.classList.remove("changing");
    void turn.offsetWidth;
    turn.classList.add("changing");
    element("letters-remaining").textContent = String(game.letters.remaining);
    document.querySelectorAll<HTMLButtonElement>("[data-letter]").forEach(button => {
      const used = game.letters.isUsed(button.dataset.letter ?? "");
      button.disabled = used || game.state !== "PLAYING";
      button.classList.toggle("used", used);
      button.setAttribute("aria-label", `Letra ${button.dataset.letter}${used ? ", já utilizada" : ""}`);
    });
    renderScores("live-score", game.players, true);
    renderHistory();
  }
  if (game.state === "PAUSED") openDialog(dialogs.pause);
  else if (dialogs.pause.open) dialogs.pause.close();
  if (game.state === "ROUND_END") {
    element("round-end-label").textContent = `FIM DA RODADA ${game.round}`;
    element("round-end-title").textContent = game.result?.reason === "all-letters" ? "Alfabeto completo!" : "O tempo acabou!";
    element("round-result-message").textContent = game.result?.reason === "all-letters"
      ? "Vocês usaram todas as letras! Cada jogador ganha 1 ponto."
      : `${game.result?.loserName} não respondeu a tempo. Os demais ganham 1 ponto!`;
    renderScores("round-score", game.players, false);
    element("next-category").hidden = game.isLastRound;
    element("next-round-button").textContent = game.isLastRound ? "VER RESULTADO FINAL" : "PRÓXIMA RODADA";
    element("finish-unlimited").hidden = game.settings?.roundCount !== 0;
  }
  if (game.state === "GAME_END") {
    element("winner-label").textContent = game.leaders.length > 1 ? "VITÓRIA COMPARTILHADA" : "VENCEDOR";
    element("end-title").textContent = game.leaders.map(player => player.name).join(" + ");
    element("winner-description").textContent = `${game.leaders[0]?.score ?? 0} pontos · ${game.round} rodadas de boas ideias.`;
    renderScores("final-score", game.players, false);
  }
  if (previousState !== game.state) {
    if (game.state === "SETUP") populateSetup();
    if (game.state !== "PAUSED" && previousState !== "PAUSED") {
      const heading = screens[displayState].querySelector<HTMLElement>("h1");
      if (heading && previousState !== null) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  previousState = game.state;
}
function selectLetter(letter: string): void {
  sound.unlock();
  if (game.selectLetter(letter)) {
    const button = document.querySelector<HTMLButtonElement>(`[data-letter="${letter}"]`);
    button?.classList.add("just-used");
  }
}
for (const letter of ALPHABET) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = letter;
  button.dataset.letter = letter;
  button.className = "letter-button";
  button.setAttribute("aria-label", `Letra ${letter}`);
  button.addEventListener("click", () => selectLetter(letter));
  button.addEventListener("animationend", () => button.classList.remove("just-used"));
  element("letter-board").append(button);
}
element("play-button").addEventListener("click", () => game.setup());
element("setup-back").addEventListener("click", () => { collectNames(); save(); game.menu(); });
element("brand-home").addEventListener("click", event => { event.preventDefault(); requestMenu(); });
element("help-button").addEventListener("click", showHelp);
element("menu-help").addEventListener("click", showHelp);
element("settings-button").addEventListener("click", () => openDialog(dialogs.settings));
document.querySelectorAll<HTMLButtonElement>("[data-close]").forEach(button => {
  button.addEventListener("click", () => element<HTMLDialogElement>(button.dataset.close ?? "").close());
});
element("player-count").addEventListener("click", event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-count]");
  if (!button) return;
  collectNames();
  preferences.settings.playerCount = Number(button.dataset.count);
  renderPlayerFields();
  save();
});
element("turn-time").addEventListener("change", () => {
  preferences.settings.turnTime = Number(element<HTMLSelectElement>("turn-time").value); save();
});
element("round-count").addEventListener("change", () => {
  preferences.settings.roundCount = Number(element<HTMLSelectElement>("round-count").value); save();
});
element("setup-form").addEventListener("submit", event => {
  event.preventDefault();
  collectNames();
  const names = Array.from({ length: preferences.settings.playerCount }, (_, i) => preferences.names[i]?.trim() || `Jogador ${i+1}`);
  if (new Set(names.map(name => name.toLocaleLowerCase("pt-BR"))).size !== names.length) {
    element("setup-error").textContent = "Escolha nomes diferentes para identificar cada jogador."; return;
  }
  names.forEach((name, i) => { preferences.names[i] = name; });
  save();
  sound.unlock();
  game.start(names, preferences.settings);
});
element("sound-button").addEventListener("click", () => {
  preferences.settings.soundEnabled = !preferences.settings.soundEnabled;
  syncSound(); sound.unlock(); save();
});
element("sound-toggle").addEventListener("change", () => {
  preferences.settings.soundEnabled = element<HTMLInputElement>("sound-toggle").checked;
  syncSound(); sound.unlock(); sound.play("letter"); save();
});
element("volume").addEventListener("input", () => {
  preferences.settings.volume = Number(element<HTMLInputElement>("volume").value) / 100;
  syncSound(); save();
});
element("volume").addEventListener("change", () => { sound.unlock(); sound.play("letter"); });
element("pause-button").addEventListener("click", () => game.pause());
element("resume-button").addEventListener("click", () => game.resume());
element("pause-menu-button").addEventListener("click", requestMenu);
element("restart-round-button").addEventListener("click", () => {
  confirmAction("Reiniciar esta rodada?", "As letras e jogadas desta rodada serão apagadas. O placar das rodadas anteriores será mantido.",
    "Sim, reiniciar rodada", () => game.restartRound());
});
element("confirm-cancel").addEventListener("click", () => { pendingConfirmation = null; dialogs.confirm.close(); });
element("confirm-accept").addEventListener("click", () => {
  const action = pendingConfirmation; pendingConfirmation = null; dialogs.confirm.close(); action?.();
});
dialogs.confirm.addEventListener("cancel", () => { pendingConfirmation = null; });
dialogs.pause.addEventListener("cancel", event => { event.preventDefault(); game.resume(); });
element("next-round-button").addEventListener("click", () => { sound.unlock(); game.nextRound(); });
element("finish-unlimited").addEventListener("click", () => game.finish());
element("replay-button").addEventListener("click", () => {
  if (game.settings) {
    game.settings.soundEnabled = preferences.settings.soundEnabled;
    game.settings.volume = preferences.settings.volume;
  }
  sound.unlock(); game.replay();
});
element("new-game-button").addEventListener("click", () => game.setup());
element("end-menu-button").addEventListener("click", () => game.menu());
const fullscreen = element<HTMLButtonElement>("fullscreen-button");
if (!document.fullscreenEnabled) { fullscreen.disabled = true; fullscreen.title = "Tela cheia indisponível neste navegador"; }
fullscreen.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { announce("O navegador não permitiu ativar a tela cheia."); }
});
document.addEventListener("fullscreenchange", () => {
  fullscreen.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ativar tela cheia");
});
document.addEventListener("keydown", event => {
  const target = event.target as HTMLElement | null;
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input, select, textarea, [contenteditable=true]")) return;
  const blockingDialog = dialogs.help.open || dialogs.settings.open || dialogs.confirm.open;
  if (blockingDialog) return;
  if (event.code === "Space" && (game.state === "PLAYING" || game.state === "PAUSED")) {
    event.preventDefault();
    if (game.state === "PLAYING") game.pause(); else game.resume();
  } else if (event.key === "Escape" && game.state === "PLAYING") {
    event.preventDefault(); game.pause();
  } else if (game.state === "PLAYING" && /^[a-z]$/i.test(event.key)) {
    event.preventDefault(); selectLetter(event.key.toUpperCase());
  }
});
document.addEventListener("visibilitychange", () => { if (document.hidden) game.pause(); });
syncSound();
render();

````

## src/types.ts

````typescript
export type GameState = "MENU" | "SETUP" | "PLAYING" | "ROUND_END" | "GAME_END" | "PAUSED";
export interface GameSettings {
  playerCount: number;
  turnTime: number;
  roundCount: number; // 0 representa uma partida ilimitada.
  soundEnabled: boolean;
  volume: number;
}
export interface SavedPreferences { names: string[]; settings: GameSettings; }
export interface Move { playerId: number; playerName: string; letter: string; round: number; }
export type RoundReason = "timeout" | "all-letters";
export interface RoundResult { reason: RoundReason; loserName: string | null; }
export type SoundName = "letter" | "turn" | "warning" | "timeout" | "victory";

````

## tests/browser-smoke.mjs

````javascript
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const server = spawn(process.execPath, ["scripts/serve.mjs"], { stdio: ["ignore","pipe","pipe"], windowsHide: true });
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", code => { if (code) reject(new Error("Servidor não iniciou: " + code)); });
});
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.clock.install();
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await mkdir(".sites-runtime/qa", { recursive: true });
  await page.screenshot({ path: ".sites-runtime/qa/menu-desktop.png", fullPage: true });
  assert.equal(await page.locator("#menu-screen").isVisible(), true);
  await page.click("#menu-help");
  assert.equal(await page.locator("#help-dialog").isVisible(), true);
  await page.click('[data-close="help-dialog"]');
  await page.click("#settings-button");
  await page.locator("#sound-toggle").uncheck();
  await page.locator("#volume").fill("60");
  await page.click('[data-close="settings-dialog"]');
  await page.click("#play-button");
  await page.click('[data-count="3"]');
  await page.fill("#player-name-0", "Ana");
  await page.fill("#player-name-1", "Bia");
  await page.fill("#player-name-2", "Caio");
  await page.selectOption("#round-count", "3");
  await page.selectOption("#turn-time", "5");
  await page.click('button[type="submit"]');
  await page.clock.fastForward(300);
  assert.match(await page.locator("#turn-label").textContent(), /Ana/);
  await page.click('[data-letter="A"]');
  assert.equal(await page.locator('[data-letter="A"]').isDisabled(), true);
  assert.match(await page.locator("#turn-label").textContent(), /Bia/);
  assert.equal(await page.locator("#letters-remaining").textContent(), "25");
  await page.clock.fastForward(300);
  await page.keyboard.press("b");
  assert.match(await page.locator("#turn-label").textContent(), /Caio/);
  await page.screenshot({ path: ".sites-runtime/qa/game-desktop.png", fullPage: true });
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#pause-dialog").isVisible(), true);
  const frozenTime = await page.locator("#timer-number").textContent();
  await page.clock.fastForward(20000);
  assert.equal(await page.locator("#timer-number").textContent(), frozenTime);
  await page.click("#restart-round-button");
  assert.equal(await page.locator("#confirm-dialog").isVisible(), true);
  await page.click("#confirm-cancel");
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#pause-dialog").isVisible(), false);
  await page.clock.fastForward(6000);
  assert.equal(await page.locator("#round-screen").isVisible(), true);
  assert.match(await page.locator("#round-result-message").textContent(), /Caio/);
  await page.click("#next-round-button");
  await page.clock.fastForward(6000);
  await page.click("#next-round-button");
  await page.clock.fastForward(6000);
  await page.click("#next-round-button");
  assert.equal(await page.locator("#end-screen").isVisible(), true);
  assert.match(await page.locator("#end-title").textContent(), /Ana/);
  await page.click("#replay-button");
  assert.equal(await page.locator("#game-screen").isVisible(), true);
  assert.equal(await page.locator("#letters-remaining").textContent(), "26");
  await page.click("#pause-button");
  await page.click("#pause-menu-button");
  await page.click("#confirm-cancel");
  assert.equal(await page.locator("#pause-dialog").isVisible(), true);
  await page.click("#pause-menu-button");
  await page.click("#confirm-accept");
  assert.equal(await page.locator("#menu-screen").isVisible(), true);
  await page.reload();
  await page.click("#play-button");
  assert.equal(await page.locator("#player-name-0").inputValue(), "Ana");
  assert.equal(await page.locator("#turn-time").inputValue(), "5");
  assert.equal(await page.locator("#round-count").inputValue(), "3");
  assert.equal(await page.locator("#sound-button").getAttribute("aria-pressed"), "false");
  await page.fill("#player-name-1", "Ana");
  await page.click('button[type="submit"]');
  assert.match(await page.locator("#setup-error").textContent(), /nomes diferentes/);
  await page.fill("#player-name-1", "<img src=x onerror=alert(1)>");
  await page.click('button[type="submit"]');
  assert.equal(await page.locator("#live-score img").count(), 0);
  await page.reload();
  assert.equal(await page.locator("#menu-screen").isVisible(), true);

  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Menu sem overflow em " + width);
    if (width === 390) await page.screenshot({ path: ".sites-runtime/qa/menu-mobile.png", fullPage: true });
    await page.click("#play-button");
    await page.click('[data-count="6"]');
    await page.fill('#player-name-1', 'Bia');
    await page.selectOption("#turn-time", "30");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Setup sem overflow em " + width);
    await page.click('button[type="submit"]');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Partida sem overflow em " + width);
    const sizes = await page.locator(".letter-button").evaluateAll(buttons => buttons.map(button => {
      const rect = button.getBoundingClientRect(); return { width: rect.width, height: rect.height };
    }));
    assert.equal(sizes.every(size => size.width >= 44 && size.height >= 44), true, "Alvos de toque de 44px em " + width);
    if (width === 390) await page.screenshot({ path: ".sites-runtime/qa/game-mobile.png", fullPage: true });
    await page.reload();
  }
  assert.deepEqual(errors, []);
  console.log("Navegador: fluxo completo, teclado, pausa, resultados, revanche, armazenamento, nomes seguros e 320/390/768px OK.");
} finally {
  await browser?.close();
  server.kill();
}

````

## tests/game.test.mjs

````javascript
import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../dist/Game.js";
import { Timer } from "../dist/Timer.js";
import { CategoryManager } from "../dist/CategoryManager.js";
import { StorageManager, DEFAULT_SETTINGS } from "../dist/StorageManager.js";
function fakeClock() {
  let time = 0, serial = 0;
  const callbacks = new Map();
  return {
    now: () => time,
    every: callback => { callbacks.set(++serial, callback); return serial; },
    cancel: handle => callbacks.delete(handle),
    advance(ms, flush = true) {
      time += ms;
      if (flush) [...callbacks.values()].forEach(callback => callback());
    },
    get active() { return callbacks.size; }
  };
}
function match(overrides = {}, names = ["Ana", "Bia", "Caio"]) {
  const clock = fakeClock();
  const game = new Game({ change() {}, tick() {}, sound() {} }, clock);
  game.start(names, { ...DEFAULT_SETTINGS, playerCount: names.length, ...overrides });
  return { game, clock };
}
test("alterna jogadores, bloqueia letras e rejeita duplo acionamento", () => {
  const { game, clock } = match();
  clock.advance(300);
  assert.equal(game.selectLetter("a"), true);
  assert.equal(game.currentPlayer.name, "Bia");
  assert.equal(game.letters.remaining, 25);
  assert.equal(game.selectLetter("B"), false);
  clock.advance(300);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(game.selectLetter("B"), true);
  assert.equal(game.currentPlayer.name, "Caio");
  clock.advance(300);
  assert.equal(game.selectLetter("C"), true);
  assert.equal(game.currentPlayer.name, "Ana");
  assert.equal(clock.active, 1);
});
test("expiração pontua apenas os demais e nunca duplica pontos", () => {
  const { game, clock } = match();
  clock.advance(10000);
  assert.equal(game.state, "ROUND_END");
  assert.deepEqual(game.players.map(player => player.score), [0,1,1]);
  clock.advance(10000);
  assert.deepEqual(game.players.map(player => player.wins), [0,1,1]);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(clock.active, 0);
});
test("clique posterior ao prazo é recusado mesmo antes do callback", () => {
  const { game, clock } = match();
  clock.advance(11000, false);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(game.state, "ROUND_END");
});
test("pausa preserva tempo e impede letras; retomar só expira no prazo restante", () => {
  const { game, clock } = match();
  clock.advance(3250);
  game.pause();
  clock.advance(30000);
  assert.equal(game.state, "PAUSED");
  assert.equal(game.selectLetter("A"), false);
  game.resume();
  clock.advance(6749);
  assert.equal(game.state, "PLAYING");
  clock.advance(1);
  assert.equal(game.state, "ROUND_END");
});
test("nova rodada libera letras, alterna início e troca categoria", () => {
  const { game, clock } = match();
  const category = game.category;
  clock.advance(300); game.selectLetter("A"); clock.advance(10000);
  game.nextRound();
  assert.equal(game.round, 2);
  assert.equal(game.currentPlayer.name, "Bia");
  assert.equal(game.letters.remaining, 26);
  assert.notEqual(game.category, category);
});
test("última rodada, empate e revanche com configurações iguais", () => {
  const { game, clock } = match({ roundCount: 3 });
  for (let i = 0; i < 3; i++) { clock.advance(10000); game.nextRound(); }
  assert.equal(game.state, "GAME_END");
  assert.equal(game.leaders.length, 3);
  assert.deepEqual(game.players.map(player => player.score), [2,2,2]);
  game.replay();
  assert.equal(game.state, "PLAYING");
  assert.equal(game.round, 1);
  assert.deepEqual(game.players.map(player => player.score), [0,0,0]);
  assert.equal(game.settings.roundCount, 3);
});
test("26 letras pontuam todos e modo ilimitado encerra manualmente", () => {
  const { game, clock } = match({ roundCount: 0, turnTime: 5 });
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") { clock.advance(300); assert.equal(game.selectLetter(letter), true); }
  assert.equal(game.result.reason, "all-letters");
  assert.deepEqual(game.players.map(player => player.score), [1,1,1]);
  game.nextRound();
  clock.advance(5000);
  assert.equal(game.isLastRound, false);
  game.finish();
  assert.equal(game.state, "GAME_END");
});
test("reiniciar rodada preserva placar e remove apenas jogadas atuais", () => {
  const { game, clock } = match();
  clock.advance(300); game.selectLetter("A"); clock.advance(10000);
  game.nextRound();
  const scores = game.players.map(player => player.score);
  clock.advance(300); game.selectLetter("B"); game.pause(); game.restartRound();
  assert.deepEqual(game.players.map(player => player.score), scores);
  assert.equal(game.history.length, 1);
  assert.equal(game.history[0].letter, "A");
  assert.equal(game.letters.remaining, 26);
  assert.equal(game.round, 2);
  assert.equal(game.currentPlayer.name, "Bia");
});
test("categorias não se repetem consecutivamente", () => {
  const categories = new CategoryManager(["A", "B", "C"], () => 0);
  let previous = "";
  for (let i = 0; i < 50; i++) { const current = categories.draw(); assert.notEqual(current, previous); previous = current; }
});
test("Timer usa tempo real, pausa e expira uma única vez", () => {
  const clock = fakeClock(); let expired = 0; let seconds = 0;
  const timer = new Timer(value => { seconds = value; }, () => expired++, clock);
  timer.start(10); clock.advance(4000); assert.equal(seconds, 6);
  timer.pause(); clock.advance(20000); timer.resume();
  clock.advance(6000); clock.advance(5000);
  assert.equal(expired, 1); assert.equal(clock.active, 0);
});
test("armazenamento inválido ou indisponível usa padrões seguros", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: () => '{"settings":{"turnTime":-4,"playerCount":99,"volume":9},"names":["<script>"]}',
    setItem: () => { throw new Error("Sem acesso"); }
  } });
  const loaded = StorageManager.load();
  assert.equal(loaded.settings.turnTime, 10);
  assert.equal(loaded.settings.playerCount, 2);
  assert.equal(loaded.settings.volume, 1);
  assert.equal(StorageManager.save(loaded), false);
  delete globalThis.localStorage;
  assert.equal(StorageManager.load().settings.turnTime, 10);
});
test("menu para cronômetro e configuração inválida é rejeitada", () => {
  const { game, clock } = match();
  game.menu(); clock.advance(15000);
  assert.equal(game.state, "MENU");
  assert.equal(clock.active, 0);
  assert.throws(() => game.start(["A"], { ...DEFAULT_SETTINGS, playerCount: 1 }));
});

````

## tsconfig.json

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": [
      "ES2022",
      "DOM"
    ],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
````

