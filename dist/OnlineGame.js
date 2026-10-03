import { ALPHABET } from "./LetterManager.js";
function el(id) { return document.getElementById(id); }
const SESSION_KEY = "letra-rapida:online-session";
class NetworkError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
export class OnlineGame {
    sound;
    onEnter;
    active = false;
    session = null;
    room = null;
    createMode = true;
    busy = false;
    connected = false;
    offset = 0;
    lastSuccess = 0;
    generation = 0;
    pollHandle;
    tickHandle;
    warning = -1;
    confirmation = null;
    constructor(sound, onEnter) {
        this.sound = sound;
        this.onEnter = onEnter;
        el("online-open").addEventListener("click", () => this.open());
        el("online-dialog-close").addEventListener("click", () => el("online-dialog").close());
        el("online-create-tab").addEventListener("click", () => this.setMode(true));
        el("online-join-tab").addEventListener("click", () => this.setMode(false));
        el("online-form").addEventListener("submit", event => { event.preventDefault(); void this.join(); });
        el("online-return").addEventListener("click", () => void this.restore());
        el("online-copy").addEventListener("click", () => void this.copyInvite());
        el("online-leave").addEventListener("click", () => this.requestExit());
        el("online-ready").addEventListener("click", () => {
            const ready = this.room?.players.find(player => player.id === this.session?.playerId)?.ready;
            void this.action("ready", { ready: !ready });
        });
        const actions = { "online-start": "start", "online-pause": "pause", "online-resume": "resume", "online-next": "next", "online-finish": "finish", "online-replay": "replay" };
        for (const [id, type] of Object.entries(actions))
            el(id).addEventListener("click", () => void this.action(type));
        el("online-restart").addEventListener("click", () => this.confirm("Reiniciar a rodada para todos?", "O placar anterior será mantido; as letras e jogadas desta rodada serão apagadas.", () => void this.action("restart")));
        el("online-confirm-cancel").addEventListener("click", () => el("online-confirm").close());
        el("online-confirm-accept").addEventListener("click", () => {
            el("online-confirm").close();
            this.confirmation?.();
            this.confirmation = null;
        });
        for (const letter of ALPHABET) {
            const button = document.createElement("button");
            button.className = "letter-button";
            button.textContent = letter;
            button.dataset.onlineLetter = letter;
            button.addEventListener("click", () => this.letter(letter));
            el("online-board").append(button);
        }
        document.addEventListener("keydown", event => {
            if (!this.active || event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
                event.target?.closest("input,select,textarea,[contenteditable=true]") ||
                document.querySelector("dialog[open]"))
                return;
            if (/^[a-z]$/i.test(event.key)) {
                event.preventDefault();
                this.letter(event.key.toUpperCase());
            }
            if ((event.code === "Space" || event.key === "Escape") && this.isHost) {
                event.preventDefault();
                if (this.room?.phase === "PLAYING")
                    void this.action("pause");
                else if (this.room?.phase === "PAUSED" && event.code === "Space")
                    void this.action("resume");
            }
        });
        window.addEventListener("online", () => { if (this.active) {
            clearTimeout(this.pollHandle);
            void this.poll(this.generation);
        } });
        const invite = new URLSearchParams(location.hash.slice(1)).get("sala");
        if (invite && /^[A-Z2-9]{6}$/i.test(invite)) {
            el("online-join-code").value = invite.toUpperCase();
            this.open(false);
        }
    }
    get isHost() { return this.room?.hostId === this.session?.playerId; }
    saved() {
        try {
            const raw = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
            if (!raw || typeof raw !== "object")
                return null;
            const value = raw;
            return /^[A-Z2-9]{6}$/.test(value.code) && /^[a-f0-9]{64}$/.test(value.token) && typeof value.playerId === "string" ? value : null;
        }
        catch {
            return null;
        }
    }
    open(create = true) {
        if (this.active)
            return;
        this.setMode(create);
        el("online-form-error").textContent = "";
        const saved = this.saved();
        el("online-return").hidden = !saved;
        if (saved) {
            el("online-return").textContent = `RETOMAR SALA ${saved.code}`;
            el("online-name").value = saved.name;
        }
        el("online-dialog").showModal();
    }
    setMode(create) {
        this.createMode = create;
        el("online-create-tab").setAttribute("aria-pressed", String(create));
        el("online-join-tab").setAttribute("aria-pressed", String(!create));
        el("online-code-field").hidden = create;
        el("online-join-code").required = !create;
        el("online-create-settings").hidden = !create;
        el("online-submit").textContent = create ? "CRIAR SALA" : "ENTRAR NA SALA";
        el("online-form-error").textContent = "";
    }
    async request(path, body, session = this.session) {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        try {
            const response = await fetch(path, {
                method: body ? "POST" : "GET", cache: "no-store", signal: controller.signal,
                headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(session ? { Authorization: "Bearer " + session.token } : {}) },
                ...(body ? { body: JSON.stringify(body) } : {})
            });
            const data = await response.json();
            if (data.room && this.active && session?.code === this.session?.code) {
                this.offset = data.room.serverNow - (start + Date.now()) / 2;
                this.receive(data.room);
            }
            if (!response.ok)
                throw new NetworkError(data.error ?? "Não foi possível acessar a sala.", response.status);
            if (!data.room)
                throw new Error("Resposta inválida.");
            this.offset = data.room.serverNow - (start + Date.now()) / 2;
            return data;
        }
        catch (error) {
            if (error instanceof NetworkError)
                throw error;
            throw new NetworkError("Sem resposta do servidor. Confira sua conexão e tente novamente.", 0);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async join() {
        if (this.busy)
            return;
        this.busy = true;
        el("online-submit").disabled = true;
        el("online-form-error").textContent = "";
        try {
            const name = el("online-name").value.trim();
            const code = el("online-join-code").value.trim().toUpperCase();
            const path = this.createMode ? "/api/rooms" : `/api/rooms/${encodeURIComponent(code)}/join`;
            const data = await this.request(path, { name, settings: { turnTime: Number(el("online-time").value), roundCount: Number(el("online-rounds").value) } }, null);
            if (!data.session)
                throw new Error("Não foi possível iniciar a sessão.");
            this.enter(data.session, data.room);
        }
        catch (error) {
            el("online-form-error").textContent = error.message;
        }
        finally {
            this.busy = false;
            el("online-submit").disabled = false;
            this.render();
        }
    }
    async restore() {
        const saved = this.saved();
        if (!saved || this.busy)
            return;
        this.busy = true;
        try {
            const data = await this.request(`/api/rooms/${saved.code}`, undefined, saved);
            this.enter(saved, data.room);
        }
        catch (error) {
            el("online-form-error").textContent = error.message;
            if (error instanceof NetworkError && [403, 404, 410].includes(error.status)) {
                try {
                    sessionStorage.removeItem(SESSION_KEY);
                }
                catch { /* Sessão em memória. */ }
                el("online-return").hidden = true;
            }
        }
        finally {
            this.busy = false;
            this.render();
        }
    }
    enter(session, room) {
        this.onEnter();
        this.session = session;
        this.room = null;
        this.active = true;
        this.connected = true;
        this.lastSuccess = Date.now();
        this.generation++;
        this.sound.unlock();
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        catch {
            el("online-error").textContent = "Este navegador não permite salvar a sessão para reconexão.";
        }
        document.body.classList.add("online-active");
        el("online-screen").hidden = false;
        el("online-dialog").close();
        el("online-error").textContent = "";
        this.receive(room);
        clearInterval(this.tickHandle);
        this.tickHandle = setInterval(() => this.tick(), 80);
        clearTimeout(this.pollHandle);
        this.pollHandle = setTimeout(() => void this.poll(this.generation), 700);
        el("online-code").tabIndex = -1;
        el("online-code").focus();
        window.scrollTo({ top: 0 });
    }
    async poll(generation) {
        if (!this.active || generation !== this.generation || !this.session)
            return;
        try {
            const data = await this.request(`/api/rooms/${this.session.code}`);
            if (generation !== this.generation)
                return;
            this.connected = true;
            this.lastSuccess = Date.now();
            this.receive(data.room);
        }
        catch (error) {
            if (generation !== this.generation)
                return;
            this.connected = false;
            if (error instanceof NetworkError && [401, 403, 404, 410].includes(error.status)) {
                this.exit();
                this.open();
                el("online-form-error").textContent = error.message;
                return;
            }
            this.render();
        }
        if (this.active && generation === this.generation)
            this.pollHandle = setTimeout(() => void this.poll(generation), this.connected ? (document.hidden ? 2500 : 700) : 2500);
    }
    receive(room) {
        if (this.room && (room.revision < this.room.revision || (room.revision === this.room.revision && room.serverNow < this.room.serverNow)))
            return;
        const previous = this.room;
        this.room = room;
        this.lastSuccess = Date.now();
        this.connected = true;
        if (previous && previous.turnId !== room.turnId) {
            this.warning = -1;
            this.sound.play("turn");
        }
        if (previous && previous.phase !== room.phase && room.phase === "ROUND_END")
            this.sound.play("timeout");
        if (previous && previous.phase !== room.phase && room.phase === "GAME_END")
            this.sound.play("victory");
        this.render();
    }
    letter(letter) {
        if (!this.canPlay || this.room?.used.includes(letter))
            return;
        this.sound.unlock();
        void this.action("letter", { letter, turnId: this.room?.turnId });
    }
    get canPlay() {
        return this.active && this.connected && !this.busy && this.room?.phase === "PLAYING" &&
            this.room.currentId === this.session?.playerId && this.room.endsAt > Date.now() + this.offset;
    }
    async action(type, extra = {}) {
        if (!this.session || this.busy)
            return;
        this.busy = true;
        this.render();
        el("online-error").textContent = "";
        try {
            const data = await this.request(`/api/rooms/${this.session.code}/action`, { type, actionId: crypto.randomUUID(), ...extra });
            if (type === "leave") {
                this.exit();
                return;
            }
            this.receive(data.room);
            if (type === "letter")
                this.sound.play("letter");
        }
        catch (error) {
            el("online-error").textContent = error.message;
        }
        finally {
            this.busy = false;
            this.render();
        }
    }
    requestExit() {
        if (!this.active)
            return;
        this.confirm("Sair desta sala?", "Sua saída será informada à turma. Se você for anfitrião, outra pessoa assumirá. Fechar ou atualizar a página permite retomar sua sessão depois.", () => void this.action("leave"));
    }
    exit() {
        this.active = false;
        this.generation++;
        this.room = null;
        this.session = null;
        clearTimeout(this.pollHandle);
        clearInterval(this.tickHandle);
        try {
            sessionStorage.removeItem(SESSION_KEY);
        }
        catch { /* Sem armazenamento. */ }
        document.body.classList.remove("online-active");
        el("online-screen").hidden = true;
        history.replaceState(null, "", location.pathname + location.search);
        this.onEnter();
    }
    confirm(title, description, callback) {
        this.confirmation = callback;
        el("online-confirm-title").textContent = title;
        el("online-confirm-description").textContent = description;
        el("online-confirm").showModal();
    }
    async copyInvite() {
        try {
            await navigator.clipboard.writeText(el("online-invite").value);
            el("online-copy").textContent = "Copiado!";
        }
        catch {
            el("online-invite").select();
            el("online-error").textContent = "Copie o link selecionado e envie aos amigos.";
        }
        setTimeout(() => { el("online-copy").textContent = "Copiar convite"; }, 2000);
    }
    scores(id) {
        const list = el(id);
        list.replaceChildren();
        for (const player of this.room?.players ?? []) {
            const row = document.createElement("li");
            row.classList.toggle("active", player.id === this.room?.currentId && this.room?.phase === "PLAYING");
            const name = document.createElement("span");
            name.className = "score-name";
            name.textContent = player.name;
            const detail = document.createElement("small");
            detail.textContent = player.left ? "Saiu da sala" : !player.online ? "Reconectando…" : player.id === this.room?.hostId ? "Anfitrião" : player.id === this.session?.playerId ? "Você" : "";
            name.append(detail);
            const points = document.createElement("strong");
            points.className = "score-points";
            points.textContent = String(player.score);
            row.append(name, points);
            list.append(row);
        }
    }
    render() {
        const room = this.room;
        if (!this.active || !room)
            return;
        const me = room.players.find(player => player.id === this.session?.playerId);
        const host = room.players.find(player => player.id === room.hostId);
        const active = room.players.filter(player => !player.left);
        const isHost = this.isHost;
        el("online-code").textContent = room.code;
        el("online-connection").textContent = this.connected ? "Sala conectada" : "Reconectando… As jogadas estão bloqueadas.";
        el("online-connection").classList.toggle("reconnecting", !this.connected);
        el("online-lobby").hidden = room.phase !== "LOBBY";
        el("online-match").hidden = !["PLAYING", "PAUSED"].includes(room.phase);
        el("online-results").hidden = !["ROUND_END", "GAME_END"].includes(room.phase);
        const invite = new URL(location.href);
        invite.hash = "sala=" + room.code;
        el("online-invite").value = invite.href;
        el("online-settings-summary").textContent = `${room.settings.turnTime} segundos por turno · ${room.settings.roundCount || "Infinitas"} rodadas · Até 6 jogadores`;
        const roster = el("online-lobby-players");
        roster.replaceChildren();
        for (const [index, player] of active.entries()) {
            const card = document.createElement("div");
            card.className = "online-player";
            const avatar = document.createElement("span");
            avatar.className = `avatar color-${index}`;
            avatar.textContent = Array.from(player.name)[0]?.toUpperCase() ?? "?";
            const info = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = player.name + (player.id === me?.id ? " (você)" : "");
            const detail = document.createElement("small");
            detail.textContent = !player.online ? "Reconectando…" : player.id === room.hostId ? "Anfitrião" : "Na sala";
            const ready = document.createElement("span");
            ready.className = "ready-mark";
            ready.textContent = player.ready ? "Pronto ✓" : "Aguardando";
            info.append(name, detail);
            card.append(avatar, info, ready);
            roster.append(card);
        }
        el("online-ready").textContent = me?.ready ? "PRONTO ✓ · CANCELAR" : "ESTOU PRONTO";
        el("online-ready").setAttribute("aria-pressed", String(me?.ready ?? false));
        el("online-ready").disabled = this.busy || !this.connected;
        el("online-start").hidden = !isHost;
        el("online-start").disabled = this.busy || !this.connected || active.length < 2 || active.some(player => !player.ready || !player.online);
        el("online-lobby-hint").textContent = isHost ? "Todos precisam estar conectados e prontos para começar." : `Quando todos estiverem prontos, ${host?.name ?? "o anfitrião"} inicia.`;
        this.scores("online-score");
        this.scores("online-result-score");
        el("online-round").textContent = `RODADA ${room.round} DE ${room.settings.roundCount || "∞"}`;
        el("online-category").textContent = room.category;
        const current = room.players.find(player => player.id === room.currentId);
        el("online-turn").textContent = current?.id === me?.id ? "É a sua vez!" : `Vez de ${current?.name ?? ""}`;
        el("online-turn-hint").textContent = room.phase === "PAUSED" ? "A pausa vale para todos." : current?.id === me?.id ? "Fale a resposta na chamada e escolha uma letra." : "Acompanhe a rodada. As letras serão liberadas na sua vez.";
        el("online-remaining").textContent = String(26 - room.used.length);
        el("online-pause").hidden = !isHost || room.phase !== "PLAYING";
        el("online-paused").hidden = room.phase !== "PAUSED";
        el("online-pause-hint").textContent = isHost ? "Continue quando a turma estiver pronta." : `Aguardando ${host?.name ?? "o anfitrião"} continuar.`;
        el("online-resume").hidden = !isHost;
        el("online-restart").hidden = !isHost;
        const historyList = el("online-history");
        historyList.replaceChildren();
        for (const move of room.history.slice(0, 5)) {
            const item = document.createElement("li");
            const letter = document.createElement("span");
            letter.className = "history-letter";
            letter.textContent = move.letter;
            const name = document.createElement("span");
            name.className = "history-description";
            name.textContent = move.playerName;
            const round = document.createElement("small");
            round.textContent = `Rodada ${move.round}`;
            name.append(round);
            item.append(letter, name);
            historyList.append(item);
        }
        const final = room.phase === "GAME_END";
        const highest = Math.max(...room.players.map(player => player.score));
        const leaders = room.players.filter(player => player.score === highest).map(player => player.name);
        el("online-result-eyebrow").textContent = final ? "FIM DA PARTIDA" : `FIM DA RODADA ${room.round}`;
        el("online-result-title").textContent = final ? leaders.join(" + ") : room.used.length === 26 ? "Alfabeto completo!" : "O tempo acabou!";
        el("online-result-message").textContent = final ? (room.message.startsWith("A partida terminou") ? room.message : `${leaders.length > 1 ? "Vitória compartilhada" : "Vitória"} com ${highest} pontos!`) : room.message;
        el("online-next").hidden = !isHost || final;
        el("online-next").textContent = room.settings.roundCount > 0 && room.round >= room.settings.roundCount ? "VER RESULTADO FINAL" : "PRÓXIMA RODADA";
        el("online-finish").hidden = !isHost || final || room.settings.roundCount !== 0;
        el("online-replay").hidden = !isHost || !final;
        el("online-result-hint").textContent = isHost ? "A próxima ação será atualizada para toda a sala." : `Aguardando ${host?.name ?? "o anfitrião"} continuar.`;
        for (const id of ["online-pause", "online-resume", "online-restart", "online-next", "online-finish", "online-replay", "online-leave"])
            el(id).disabled = this.busy || !this.connected;
        this.tick();
    }
    tick() {
        const room = this.room;
        if (!this.active || !room)
            return;
        if (this.connected && Date.now() - this.lastSuccess > 5000) {
            this.connected = false;
            this.render();
            return;
        }
        const remaining = room.phase === "PLAYING" ? Math.max(0, room.endsAt - Date.now() - this.offset) : room.remainingMs;
        const seconds = Math.ceil(remaining / 1000);
        el("online-seconds").textContent = String(seconds);
        el("online-timer").setAttribute("aria-label", `${seconds} segundos restantes`);
        el("online-timer").classList.toggle("urgent", room.phase === "PLAYING" && seconds > 0 && seconds <= 3);
        document.getElementById("online-progress")?.setAttribute("stroke-dashoffset", String(100 * (1 - Math.min(1, remaining / (room.settings.turnTime * 1000)))));
        if (room.phase === "PLAYING" && seconds > 0 && seconds <= 3 && this.warning !== seconds) {
            this.warning = seconds;
            this.sound.play("warning");
        }
        document.querySelectorAll("[data-online-letter]").forEach(button => {
            const used = room.used.includes(button.dataset.onlineLetter ?? "");
            button.disabled = !this.canPlay || used;
            button.classList.toggle("used", used);
            button.setAttribute("aria-label", `Letra ${button.dataset.onlineLetter}${used ? ", já utilizada" : ""}`);
        });
    }
}
