# Workspace TypeScript in VS Code con WSL Ubuntu

Questa configurazione prepara un progetto TypeScript eseguito interamente dentro WSL Ubuntu.

Non contiene Vite, task per browser, server frontend, preview o dipendenze Rolldown. TypeScript viene usato come compilatore e come linguaggio per un'applicazione Node.js.

## 1. Struttura del template

```text
typescript-wsl-workspace/
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
│   ├── tasks.json
│   └── scripts/
│       ├── common.sh
│       ├── install-node.sh
│       ├── install-typescript.sh
│       ├── run-with-node.sh
│       ├── verify-environment.sh
│       └── wsl-typescript-bashrc
├── src/
│   └── index.ts
├── .gitignore
├── .nvmrc
├── .prettierrc.json
├── eslint.config.mjs
├── package.json
├── tsconfig.json
└── typescript-wsl.code-workspace
```

## 2. Procedura consigliata

1. Copiare i file nella root del progetto.
2. Aprire Ubuntu WSL.
3. Posizionarsi nella cartella del progetto.
4. Avviare il workspace:

```bash
code typescript-wsl.code-workspace
```

5. In VS Code eseguire `Terminale: Esegui attività`.
6. Avviare `Setup: Completo Node + TypeScript`.

Il task aggregato esegue in sequenza:

1. controllo e installazione di Node;
2. controllo e installazione locale di TypeScript e degli strumenti;
3. verifica completa dell'ambiente.

I due installer rimangono separati e possono essere eseguiti indipendentemente.

## 3. Perché Node e TypeScript sono separati

Node.js è il runtime che esegue JavaScript, npm e gli strumenti del progetto.

TypeScript è invece una dipendenza di sviluppo del singolo progetto. Viene installato in:

```text
node_modules/typescript
```

Questa separazione consente di:

- non reinstallare Node quando manca soltanto TypeScript;
- non installare TypeScript globalmente;
- usare versioni TypeScript differenti in progetti differenti;
- fare usare a VS Code la stessa versione TypeScript usata dai task npm;
- rendere riproducibile l'installazione tramite `package.json` e, dopo la prima installazione, `package-lock.json`.

## 4. Server linguistico TypeScript

VS Code include già il supporto linguistico JavaScript/TypeScript. Non è quindi necessario installare un'estensione separata equivalente a un language server.

Quando viene aperto un file `.ts`, VS Code attiva il servizio TypeScript integrato. L'impostazione seguente indica di usare la libreria TypeScript locale del progetto:

```json
"typescript.tsdk": "node_modules/typescript/lib"
```

Questa opzione evita che l'editor analizzi il progetto con una versione TypeScript diversa da quella eseguita da `npm run build`.

## 5. Spiegazione dettagliata degli script Bash

---

# `.vscode/scripts/common.sh`

Questo file contiene funzioni condivise. Non viene normalmente eseguito direttamente: viene caricato dagli altri script con `source`.

## Shebang

```bash
#!/usr/bin/env bash
```

La sequenza `#!` è chiamata _shebang_. Indica al sistema quale interprete deve leggere il file.

L'uso di:

```bash
/usr/bin/env bash
```

cerca `bash` nel `PATH` dell'ambiente Linux invece di presupporre che si trovi in un percorso personalizzato.

## Individuazione dinamica delle directory

```bash
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
```

Elementi della sintassi:

- `BASH_SOURCE[0]` contiene il percorso del file Bash attualmente caricato;
- `dirname` elimina il nome del file e restituisce la cartella che lo contiene;
- `cd -- ...` cambia directory;
- `--` segnala la fine delle opzioni, evitando che un percorso che inizia con `-` venga interpretato come opzione;
- `&&` esegue il comando successivo soltanto se il precedente termina correttamente;
- `pwd` restituisce il percorso assoluto della directory corrente;
- `$(...)` è una _command substitution_: esegue il comando interno e inserisce il suo output nella stringa;
- le virgolette doppie impediscono che spazi presenti nel percorso dividano il valore in più argomenti.

Poiché `common.sh` si trova in `.vscode/scripts`, la sequenza `../..` risale prima a `.vscode` e poi alla root del progetto.

## Valore predefinito con possibilità di override

```bash
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
MIN_NODE_MAJOR="${MIN_NODE_MAJOR:-22}"
```

La forma:

```bash
${VARIABILE:-valore_predefinito}
```

usa il valore della variabile quando è definita e non vuota; altrimenti usa il valore a destra di `:-`.

È quindi possibile cambiare il requisito minimo senza modificare il file:

```bash
MIN_NODE_MAJOR=24 bash .vscode/scripts/install-node.sh
```

## Funzioni

```bash
info() {
  printf '[INFO] %s\n' "$*"
}
```

La sintassi `nome() { ...; }` definisce una funzione Bash.

- `$*` rappresenta tutti gli argomenti ricevuti dalla funzione;
- `printf` è preferibile a `echo` quando serve un formato prevedibile;
- `%s` è il segnaposto per una stringa;
- `\n` inserisce un ritorno a capo.

Le funzioni `warn` e `die` usano:

```bash
>&2
```

per inviare il messaggio allo _standard error_ invece che allo _standard output_.

`die` termina inoltre lo script con:

```bash
exit 1
```

Un codice diverso da zero segnala un errore al task di VS Code.

## Verifica dell'esistenza di un comando

```bash
command_exists() {
  command -v "$1" >/dev/null 2>&1
}
```

- `$1` è il primo argomento della funzione;
- `command -v` verifica se un comando è disponibile nel `PATH`;
- `>/dev/null` scarta lo standard output;
- `2>&1` invia anche lo standard error nello stesso punto;
- la funzione restituisce implicitamente il codice di uscita di `command -v`.

Esempio:

```bash
if command_exists node; then
  echo "Node presente"
fi
```

## Rilevamento di WSL

```bash
[[ -n "${WSL_DISTRO_NAME:-}" || -n "${WSL_INTEROP:-}" ]] && return 0
```

- `[[ ... ]]` è il costrutto condizionale avanzato di Bash;
- `-n` verifica che una stringa non sia vuota;
- `||` significa OR logico;
- `&& return 0` termina la funzione con successo quando la condizione è vera.

Il controllo successivo legge i file del kernel:

```bash
[[ -r /proc/sys/kernel/osrelease ]] && grep -qiE 'microsoft|wsl' /proc/sys/kernel/osrelease
```

- `-r` verifica che il file sia leggibile;
- `grep` cerca testo;
- `-q` non stampa il risultato;
- `-i` ignora maiuscole e minuscole;
- `-E` abilita le espressioni regolari estese;
- `microsoft|wsl` significa “microsoft oppure wsl”.

## Caricamento di NVM

```bash
source "$NVM_DIR/nvm.sh"
```

`source` esegue il contenuto del file nella shell corrente. È necessario perché `nvm` non è un eseguibile autonomo: è una funzione di shell.

Il file gestisce temporaneamente l'opzione `nounset`:

```bash
local nounset_enabled=0
[[ $- == *u* ]] && nounset_enabled=1 && set +u
source "$NVM_DIR/nvm.sh"
(( nounset_enabled == 1 )) && set -u
```

- `local` limita la variabile alla funzione;
- `$-` contiene le opzioni attive della shell;
- `*u*` controlla se è attiva l'opzione `-u`;
- `set +u` disattiva temporaneamente `nounset`;
- `(( ... ))` esegue una valutazione aritmetica;
- `set -u` ripristina l'opzione.

## Verifica che Node sia Linux

```bash
[[ "$(node -p 'process.platform')" == "linux" ]]
```

`node -p` valuta un'espressione JavaScript e stampa il risultato. Il controllo impedisce di usare accidentalmente un runtime Node di Windows dal progetto WSL.

## Attivazione della versione di progetto

```bash
if [[ -f "$PROJECT_DIR/.nvmrc" ]]; then
  nvm use --silent
fi
```

- `-f` verifica l'esistenza di un file normale;
- `.nvmrc` dichiara la famiglia/versione Node del progetto;
- `nvm use` attiva quella versione nella shell corrente;
- `--silent` riduce l'output non necessario nei task.

## Verifica di un pacchetto npm locale

```bash
npm ls "$package_name" --depth=0 >/dev/null 2>&1
```

`npm ls` controlla le dipendenze del progetto. `--depth=0` limita il controllo alle dipendenze dirette e non attraversa l'intero albero.

---

# `.vscode/scripts/install-node.sh`

Questo script installa esclusivamente Node.js e i prerequisiti necessari. Non installa TypeScript.

## Modalità rigorosa

```bash
set -Eeuo pipefail
```

Le opzioni hanno questo significato:

- `-e`: termina quando un comando fallisce;
- `-E`: mantiene eventuali trap `ERR` anche in funzioni e subshell;
- `-u`: genera errore quando viene letta una variabile non definita;
- `-o pipefail`: una pipeline fallisce se fallisce uno qualunque dei suoi comandi, non soltanto l'ultimo.

## Caricamento delle funzioni comuni

```bash
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"
```

Lo script non dipende dalla directory da cui viene lanciato: individua `common.sh` relativamente alla propria posizione.

## Controllo prima dell'installazione

```bash
if command_exists node && command_exists npm && node_meets_minimum; then
  ...
  exit 0
fi
```

L'installazione viene saltata soltanto quando:

1. `node` esiste;
2. `npm` esiste;
3. Node è Linux;
4. la versione principale soddisfa il requisito minimo.

`exit 0` indica completamento corretto senza modificare l'ambiente.

## Array dei pacchetti APT mancanti

```bash
missing_apt_packages=()
```

Crea un array vuoto.

```bash
for package_name in curl ca-certificates git; do
  dpkg -s "$package_name" >/dev/null 2>&1 || missing_apt_packages+=("$package_name")
done
```

- `for ... in ...; do ...; done` esegue un ciclo;
- `dpkg -s` verifica se un pacchetto Debian/Ubuntu è installato;
- `||` esegue il comando a destra soltanto quando quello a sinistra fallisce;
- `array+=("valore")` aggiunge un elemento all'array.

Il numero di elementi si ottiene con:

```bash
${#missing_apt_packages[@]}
```

La condizione:

```bash
(( ${#missing_apt_packages[@]} > 0 ))
```

usa il contesto aritmetico di Bash.

## Installazione APT

```bash
sudo apt-get update
sudo apt-get install -y "${missing_apt_packages[@]}"
```

- `apt-get update` aggiorna l'indice dei pacchetti;
- `apt-get install` installa soltanto i prerequisiti mancanti;
- `-y` conferma automaticamente la richiesta;
- `"${array[@]}"` espande ogni elemento dell'array come argomento separato, conservando gli spazi.

## Installazione NVM

```bash
NVM_VERSION="${NVM_VERSION:-v0.40.6}"
NVM_DIR="$NVM_DIR" PROFILE=/dev/null bash -c "curl -fsSL ... | bash"
```

- la versione NVM è fissata ma può essere sostituita tramite variabile d'ambiente;
- `curl -f` fallisce per risposte HTTP di errore;
- `-s` usa la modalità silenziosa;
- `-S` mostra comunque gli errori;
- `-L` segue i redirect;
- `|` passa il contenuto scaricato all'interprete Bash;
- `PROFILE=/dev/null` impedisce all'installer di modificare automaticamente `.bashrc`, perché il workspace carica NVM in modo esplicito.

## Lettura di `.nvmrc`

```bash
requested_node="$(tr -d '[:space:]' < "$PROJECT_DIR/.nvmrc")"
```

- `< file` redirige il contenuto del file allo standard input di `tr`;
- `tr -d '[:space:]'` elimina spazi e ritorni a capo;
- la command substitution salva il risultato nella variabile.

## Installazione condizionale della versione Node

```bash
if [[ "$(nvm version "$requested_node")" == "N/A" ]]; then
  nvm install "$requested_node"
fi
```

La versione viene installata solo se NVM non la trova già.

```bash
nvm alias default "$requested_node"
```

imposta la stessa famiglia Node come predefinita per le shell successive.

---

# `.vscode/scripts/install-typescript.sh`

Questo script presuppone che Node sia disponibile. Installa TypeScript e gli strumenti di sviluppo come dipendenze locali.

## Attivazione Node

```bash
activate_project_node
```

La funzione condivisa:

- carica NVM quando disponibile;
- applica `.nvmrc`;
- accetta anche un Node Linux già installato senza NVM;
- rifiuta Node Windows;
- verifica la versione minima.

## Creazione condizionale di `package.json`

```bash
if [[ ! -f package.json ]]; then
  npm init -y
fi
```

- `!` nega la condizione;
- `npm init -y` crea un file `package.json` senza domande interattive;
- un `package.json` esistente non viene sostituito.

## Elenco dei pacchetti richiesti

```bash
required_dev_packages=(
  typescript
  @types/node
  tsx
  prettier
  eslint
  @eslint/js
  typescript-eslint
  globals
)
```

Scopo dei pacchetti:

- `typescript`: compilatore `tsc` e libreria TypeScript;
- `@types/node`: tipi delle API Node;
- `tsx`: esecuzione e watch dei file TypeScript durante lo sviluppo;
- `prettier`: formattazione;
- `eslint`, `@eslint/js`, `typescript-eslint`, `globals`: analisi statica per JavaScript e TypeScript.

## Installazione dei soli pacchetti mancanti

```bash
for package_name in "${required_dev_packages[@]}"; do
  if npm_package_installed "$package_name"; then
    ...
  else
    missing_dev_packages+=("$package_name")
  fi
done
```

Ogni pacchetto viene controllato singolarmente. L'installazione finale usa:

```bash
npm install --save-dev "${missing_dev_packages[@]}"
```

`--save-dev` registra i pacchetti in `devDependencies` perché sono strumenti necessari allo sviluppo, non dipendenze runtime dell'applicazione compilata.

## Modifica sicura di `package.json`

Lo script esegue un piccolo programma Node tramite heredoc:

```bash
node <<'NODE'
...
NODE
```

La forma `<<'NODE'` apre un _here document_. Tutto ciò che si trova fino alla riga finale `NODE` viene inviato allo standard input del comando `node`.

Le virgolette singole nel delimitatore impediscono a Bash di espandere variabili, backtick o `$(...)` presenti nel codice JavaScript.

Nel codice Node:

```javascript
packageJson.scripts = {
  ...packageJson.scripts,
  build: 'tsc -p tsconfig.json',
};
```

- `...packageJson.scripts` conserva gli script npm esistenti;
- le proprietà successive aggiungono o aggiornano soltanto gli script usati dal workspace;
- `JSON.stringify(..., null, 2)` riscrive JSON valido e indentato;
- è preferibile a `sed`, che non conosce la struttura sintattica JSON.

## Creazione dei file con heredoc

Esempio:

```bash
if [[ ! -f tsconfig.json ]]; then
  cat > tsconfig.json <<'JSON'
  ...
JSON
fi
```

- `cat > file` crea o sovrascrive il file;
- il blocco è eseguito soltanto se il file non esiste;
- le configurazioni esistenti dell'utente non vengono quindi sovrascritte.

Lo stesso schema viene usato per:

- `tsconfig.json`;
- `.prettierrc.json`;
- `eslint.config.mjs`;
- `src/index.ts`.

## Verifica degli eseguibili locali

```bash
npm exec -- tsc --version
```

`npm exec` cerca l'eseguibile in `node_modules/.bin`. Il separatore `--` indica che gli argomenti successivi appartengono al programma eseguito.

Questo evita di usare accidentalmente un `tsc` globale.

---

# `.vscode/scripts/run-with-node.sh`

Questo wrapper viene usato dai task VS Code per eseguire npm e Node nell'ambiente corretto.

## Conteggio degli argomenti

```bash
if (( $# == 0 )); then
```

`$#` contiene il numero di argomenti ricevuti dallo script.

Il wrapper richiede almeno il comando da eseguire, per esempio:

```bash
.vscode/scripts/run-with-node.sh npm run build
```

## Sostituzione del processo

```bash
exec "$@"
```

- `$@` rappresenta tutti gli argomenti ricevuti;
- tra virgolette, ogni argomento conserva i propri confini;
- `exec` sostituisce il processo Bash con il comando finale.

Il task riceve quindi direttamente il codice di uscita di npm, Node, ESLint o Prettier e può stabilire correttamente se l'esecuzione è riuscita.

---

# `.vscode/scripts/verify-environment.sh`

Questo script non installa nulla. Controlla l'ambiente dopo il setup.

## Verifica dei file eseguibili

```bash
[[ -x node_modules/.bin/tsc ]]
```

`-x` verifica che il file esista e sia eseguibile.

La combinazione:

```bash
[[ -x ... ]] || die "messaggio"
```

termina lo script soltanto quando il controllo fallisce.

## Stampa dei valori calcolati

```bash
printf 'Node: %s\n' "$(node --version)"
```

Il comando interno viene eseguito prima; il suo output viene poi inserito nel segnaposto `%s`.

## Ciclo sui file di configurazione

```bash
for config_file in package.json tsconfig.json eslint.config.mjs .prettierrc.json; do
  if [[ -f "$config_file" ]]; then
    ...
  fi
done
```

Lo script verifica in modo leggibile i file minimi richiesti.

## Controllo reale del compilatore

```bash
npm run typecheck
```

Non si limita a verificare che `tsc` esista: avvia il controllo dei tipi con `--noEmit`, quindi intercetta anche errori nel progetto o nel `tsconfig.json`.

---

# `.vscode/scripts/wsl-typescript-bashrc`

Questo file è il profilo del terminale integrato, configurato in `settings.json` con:

```json
"args": [
  "--rcfile",
  "${workspaceFolder}/.vscode/scripts/wsl-typescript-bashrc",
  "-i"
]
```

- `--rcfile` indica a Bash un file di inizializzazione dedicato;
- `-i` apre una shell interattiva.

## Caricamento della configurazione personale

```bash
if [[ -f "$HOME/.bashrc" ]]; then
  source "$HOME/.bashrc"
fi
```

In questo modo alias e configurazioni personali restano disponibili.

## Cambio automatico della root

```bash
cd "$PROJECT_DIR" || return 1
```

Il terminale si apre direttamente nella root del progetto. `return 1` interrompe il caricamento del profilo se la directory non è accessibile.

## Attivazione automatica della versione Node

Quando NVM è disponibile:

```bash
nvm use --silent
```

viene eseguito ogni volta che si apre il terminale integrato. Se NVM non esiste ma è disponibile un Node Linux compatibile, il profilo usa quel runtime senza reinstallarlo.

## 6. Configurazione VS Code

### `extensions.json`

Raccomanda:

- Remote - WSL;
- ESLint;
- Prettier;
- IntelliSense per pacchetti npm;
- IntelliSense per percorsi.

TypeScript non compare come estensione aggiuntiva perché il supporto del linguaggio è già integrato in VS Code.

### `settings.json`

Le impostazioni principali sono:

```json
"typescript.tsdk": "node_modules/typescript/lib"
```

usa TypeScript locale;

```json
"editor.defaultFormatter": "esbenp.prettier-vscode"
```

imposta Prettier come formatter;

```json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": "explicit"
}
```

consente l'applicazione esplicita delle correzioni ESLint durante il salvataggio;

```json
"typescript.format.enable": false
```

disattiva il formatter TypeScript incorporato per evitare conflitti con Prettier;

```json
"eslint.validate": [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact"
]
```

estende la validazione ESLint anche a TypeScript.

### `tasks.json`

I task di setup sono separati:

- `Node Setup: Installa Node in WSL`;
- `TypeScript Setup: Installa TypeScript e strumenti`;
- `Setup: Verifica ambiente WSL TypeScript`.

Il task aggregato usa:

```json
"dependsOrder": "sequence"
```

per impedire l'avvio parallelo: TypeScript non può essere installato prima che Node sia disponibile.

Il build usa:

```json
"problemMatcher": "$tsc"
```

VS Code interpreta l'output di `tsc` e inserisce gli errori nel pannello Problemi.

Il watch usa:

```json
"problemMatcher": "$tsc-watch"
```

per gestire un compilatore che rimane attivo in background.

### `launch.json`

Non esiste più la configurazione Chrome/Vite.

Sono presenti tre modalità:

1. debug del file TypeScript corrente tramite `tsx` e porta `9229`;
2. debug del JavaScript compilato in `dist` tramite porta `9230`;
3. collegamento manuale a un processo Node già avviato sulla porta `9229`.

Il debug compilato usa:

```json
"outFiles": [
  "${workspaceFolder}/dist/**/*.js"
]
```

per indicare dove si trova il JavaScript generato.

`sourceMaps: true`, insieme a `sourceMap: true` in `tsconfig.json`, permette di posizionare breakpoint nei file `.ts` mentre Node esegue i file `.js` presenti in `dist`.

## 7. `tsconfig.json`

Impostazioni principali:

```json
"rootDir": "src",
"outDir": "dist"
```

La sorgente TypeScript resta in `src`; l'output JavaScript viene scritto in `dist` mantenendo la struttura relativa delle cartelle.

```json
"module": "NodeNext",
"moduleResolution": "NodeNext"
```

allinea la compilazione e la risoluzione dei moduli alle regole moderne di Node.

```json
"strict": true
```

attiva il gruppo di controlli rigorosi TypeScript.

```json
"noEmitOnError": true
```

impedisce la generazione di JavaScript quando sono presenti errori di compilazione.

```json
"sourceMap": true,
"inlineSources": true
```

genera le mappe usate dal debugger.

## 8. Comandi principali

Installazione separata di Node:

```bash
bash .vscode/scripts/install-node.sh
```

Installazione separata di TypeScript:

```bash
bash .vscode/scripts/install-typescript.sh
```

Verifica:

```bash
bash .vscode/scripts/verify-environment.sh
```

Build:

```bash
npm run build
```

Controllo tipi senza generare output:

```bash
npm run typecheck
```

Esecuzione diretta durante lo sviluppo, preceduta dal type-check dell'intero progetto:

```bash
npm run dev:once
```

Watch dell'applicazione con riavvio automatico. L'opzione `--include "src/**/*.ts"` fa ripartire il processo per qualsiasi file TypeScript sotto `src`, anche se non è ancora importato dall'entry point:

```bash
npm run dev
```

Build ed esecuzione dell'applicazione compilata:

```bash
npm start
```

Lo script `prestart` esegue automaticamente `npm run build` prima dell’avvio. Lo script `start` usa esplicitamente `node ./dist/index.js`, evitando che Node debba risolvere la directory del progetto come modulo. Il campo `main: "./dist/index.js"` documenta inoltre l’entry point compilato del package.

Controllo completo qualità:

```bash
npm run check
```

## 9. Accesso package.json

Quando viene lanciato il comando npm dagli argomenti passati dal `task.json`, per esempio
`npm run build:watch`, questo corrisponde alla sintassi `npm run <script name>`.

npm a quel punto apre il `package.json` della project root corrente e cerca :

```json
"scripts": {
  "build:watch": "tsc -p tsconfig.json --watch --preserveWatchOutput"
}
```

npm a quel punto esegue il valore associato alla chiave matchata.

## 10. Note operative

- Eseguire `npm install`, `npm ci` e i task esclusivamente dentro WSL.
- Non condividere `node_modules` generato da Node Windows con il progetto WSL.
- Conservare `.nvmrc` nel repository per rendere esplicita la famiglia Node richiesta.
- Conservare `package-lock.json` dopo la prima installazione per rendere riproducibili le dipendenze.
- Terminare i task watch o debug con `Terminale: Termina attività` quando non servono più.
- TypeScript da solo non avvia un server HTTP. Il task `dev` osserva i file e riavvia lo script Node; un eventuale server Express, NestJS o altro framework dovrà essere avviato dallo script applicativo del progetto.
