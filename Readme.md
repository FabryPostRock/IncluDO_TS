# TypeScript WSL Project

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WSL](https://img.shields.io/badge/WSL-Ubuntu-4EAA25?logo=linux&logoColor=white)](https://learn.microsoft.com/windows/wsl/)
[![VS Code](https://img.shields.io/badge/VS%20Code-Tasks%20%2B%20Debug-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![ESLint](https://img.shields.io/badge/ESLint-10.x-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)

Progetto didattico **TypeScript + Node.js in WSL**, configurato per lavorare da **VS Code Remote - WSL** con task automatizzati per installazione Node, installazione tool TypeScript, compilazione, watch, debug, linting, formattazione ed esecuzione del JavaScript compilato.

Il progetto contiene anche un esempio TypeScript avanzato basato su mapping di settori artigianali, corsi, partecipanti e aziende. L'obiettivo principale del codice è mostrare come mantenere l'associazione tra dati dinamici e tipi TypeScript tramite `as const`, mapped types, generic types, interface e classi parametriche.

---

## Indice

- [Panoramica del progetto](#panoramica-del-progetto)
- [Tecnologie utilizzate](#tecnologie-utilizzate)
- [Struttura consigliata del progetto](#struttura-consigliata-del-progetto)
- [Configurazione del workspace VS Code](#configurazione-del-workspace-vs-code)
  - [Workspace multi-root](#workspace-multi-root)
  - [Terminale integrato WSL TypeScript](#terminale-integrato-wsl-typescript)
  - [Task automatici all'apertura](#task-automatici-allapertura)
- [Script Bash di supporto](#script-bash-di-supporto)
  - [`common.sh`](#commonsh)
  - [`install-node.sh`](#install-nodesh)
  - [`install-typescript.sh`](#install-typescriptsh)
  - [`verify-environment.sh`](#verify-environmentsh)
  - [`run-with-node.sh`](#run-with-nodesh)
  - [`wsl-typescript-bashrc`](#wsl-typescript-bashrc)
- [Configurazione dei task VS Code](#configurazione-dei-task-vs-code)
  - [Installazione Node in WSL](#installazione-node-in-wsl)
  - [Installazione TypeScript e strumenti](#installazione-typescript-e-strumenti)
  - [Setup completo Node + TypeScript](#setup-completo-node--typescript)
  - [Build TypeScript](#build-typescript)
  - [Watch TypeScript](#watch-typescript)
  - [Esecuzione diretta con tsx](#esecuzione-diretta-con-tsx)
  - [Esecuzione JavaScript compilato](#esecuzione-javascript-compilato)
  - [Lint, format e qualità](#lint-format-e-qualità)
- [Configurazione debug VS Code](#configurazione-debug-vs-code)
- [Configurazione TypeScript](#configurazione-typescript)
- [Configurazione npm](#configurazione-npm)
- [ESLint e Prettier](#eslint-e-prettier)
- [Flusso di lavoro consigliato](#flusso-di-lavoro-consigliato)
- [Passaggi chiave del progetto a livello di codice](#passaggi-chiave-del-progetto-a-livello-di-codice)
  - [`artisanMap` come fonte dati tipizzata](#artisanmap-come-fonte-dati-tipizzata)
  - [`Field` e mapped type `ArtisanMap`](#field-e-mapped-type-artisanmap)
  - [Tipi derivati `JobFor` e `CourseFor`](#tipi-derivati-jobfor-e-coursefor)
  - [Interfacce generiche](#interfacce-generiche)
  - [Classi generiche](#classi-generiche)
  - [Creazione dinamica di partecipanti, corsi e aziende](#creazione-dinamica-di-partecipanti-corsi-e-aziende)
  - [Iscrizione dei partecipanti ai corsi](#iscrizione-dei-partecipanti-ai-corsi)
  - [Invio candidature alle aziende](#invio-candidature-alle-aziende)
- [Comandi rapidi](#comandi-rapidi)
- [Note operative](#note-operative)

---

## Panoramica del progetto

Questo progetto configura un ambiente TypeScript moderno pensato per essere eseguito **dentro WSL**, evitando l'uso accidentale di Node installato su Windows.

La configurazione copre tre livelli:

| Livello | Funzione |
|---|---|
| VS Code workspace | Apre il progetto in modalità multi-root e abilita task automatici |
| Script Bash | Installano e attivano Node/TypeScript in WSL |
| Configurazione TypeScript/npm | Compila `src/**/*.ts` in `dist/**/*.js` ed esegue il JavaScript compilato |

Il progetto è pensato per questo flusso:

```text
src/index.ts
    ↓ tsc --watch
 dist/index.js
    ↓ node
esecuzione in WSL
```

---

## Tecnologie utilizzate

| Tecnologia | Ruolo |
|---|---|
| WSL / Ubuntu | Ambiente Linux usato da VS Code Remote |
| Node.js >= 22 | Runtime JavaScript lato server |
| NVM | Gestione versione Node in WSL |
| TypeScript | Linguaggio tipizzato compilato in JavaScript |
| tsx | Esecuzione diretta di file TypeScript in sviluppo |
| ESLint | Controllo statico del codice |
| Prettier | Formattazione automatica |
| VS Code Tasks | Automazione setup, build, watch, lint, format e run |
| VS Code Debugger | Attach a processi Node avviati con inspector |

---

## Struttura consigliata del progetto

I task VS Code si aspettano che gli script Bash siano dentro `.vscode/scripts/`.

```text
typescript-wsl-project/
├── .vscode/
│   ├── launch.json
│   ├── tasks.json
│   └── scripts/
│       ├── common.sh
│       ├── install-node.sh
│       ├── install-typescript.sh
│       ├── run-with-node.sh
│       ├── verify-environment.sh
│       └── wsl-typescript-bashrc
│
├── src/
│   └── index.ts
│
├── dist/
│   └── index.js
│
├── .nvmrc
├── .prettierrc.json
├── eslint.config.mjs
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── typescript-wsl.code-workspace
```

> `dist/` viene generata dalla compilazione TypeScript e non dovrebbe essere modificata manualmente.

---

## Configurazione del workspace VS Code

### Workspace multi-root

Il file `typescript-wsl.code-workspace` configura un workspace multi-root con tre cartelle:

| Nome workspace | Percorso | Funzione |
|---|---|---|
| `TypeScriptProject` | `.` | Progetto TypeScript principale |
| `TS` | `../TS_KnowledgeBase` | Knowledge base TypeScript collegata |
| `LINUX` | `../Linux-Knowledgebase` | Knowledge base Linux collegata |

Questa configurazione permette di tenere aperto il progetto principale insieme a documentazione tecnica laterale.

---

### Terminale integrato WSL TypeScript

Nel workspace è impostato:

```json
{
  "terminal.integrated.defaultProfile.linux": "WSL TypeScript"
}
```

Il profilo dedicato carica una configurazione Bash specifica del progetto. Lo script `wsl-typescript-bashrc`:

1. carica la configurazione Bash personale se esiste;
2. imposta `NVM_DIR`;
3. carica `nvm.sh` se disponibile;
4. calcola la root del progetto;
5. entra nella root del progetto;
6. esegue `nvm use` sulla versione richiesta da `.nvmrc`;
7. segnala all'utente se Node non è installato in WSL.

Questo evita di aprire un terminale WSL nella cartella sbagliata o con un Node non corretto.

---

### Task automatici all'apertura

Nel workspace è presente:

```json
{
  "task.allowAutomaticTasks": "on"
}
```

Il task `TypeScript: Watch` ha:

```json
{
  "runOn": "folderOpen",
  "instanceLimit": 1,
  "instancePolicy": "silent"
}
```

Questo significa che, quando il workspace viene aperto e considerato attendibile, VS Code può avviare automaticamente il watch TypeScript.

Il limite a una sola istanza evita di avviare più processi `tsc --watch` contemporaneamente.

---

## Script Bash di supporto

### `common.sh`

`common.sh` contiene funzioni condivise dagli altri script.

Responsabilità principali:

| Funzione | Descrizione |
|---|---|
| `info()` | Stampa messaggi informativi |
| `warn()` | Stampa avvisi |
| `die()` | Stampa errore e termina lo script |
| `command_exists()` | Verifica se un comando esiste nel PATH |
| `is_wsl()` | Rileva se l'ambiente è WSL |
| `require_wsl()` | Blocca lo script se non è eseguito in WSL |
| `load_nvm()` | Carica NVM dalla directory `$HOME/.nvm` |
| `node_is_linux()` | Verifica che `node` sia un runtime Linux |
| `node_meets_minimum()` | Verifica Node >= versione minima richiesta |
| `activate_project_node()` | Attiva Node corretto per il progetto |
| `npm_package_installed()` | Verifica se un pacchetto npm locale è già installato |

La versione minima di Node è definita tramite:

```bash
MIN_NODE_MAJOR="${MIN_NODE_MAJOR:-22}"
```

Quindi, se non viene specificato diversamente, il progetto richiede **Node.js 22 o superiore**.

---

### `install-node.sh`

Lo script `install-node.sh` installa Node.js Linux dentro WSL tramite NVM.

Flusso principale:

1. verifica che lo script venga eseguito in WSL;
2. entra nella root del progetto;
3. controlla se `node` e `npm` sono già disponibili;
4. verifica che Node sia Linux e rispetti la versione minima;
5. installa eventuali prerequisiti APT mancanti:
   - `curl`;
   - `ca-certificates`;
   - `git`;
6. installa NVM se non è presente;
7. legge `.nvmrc`, oppure lo crea con `lts/*`;
8. installa la versione Node richiesta;
9. esegue `nvm use`;
10. imposta l'alias default;
11. verifica che il runtime prodotto sia Linux e compatibile.

Il file `.nvmrc` del progetto contiene:

```text
lts/*
```

Quindi NVM userà l'ultima versione LTS disponibile.

---

### `install-typescript.sh`

Lo script `install-typescript.sh` configura il progetto npm e installa gli strumenti TypeScript locali.

Pacchetti installati come `devDependencies` se mancanti:

```text
typescript
@types/node
tsx
prettier
eslint
@eslint/js
typescript-eslint
globals
```

Lo script inoltre:

- crea `package.json` se assente;
- imposta `private: true`;
- imposta `type: module`;
- imposta `main: ./dist/index.js`;
- aggiunge o aggiorna gli script npm usati dal workspace;
- crea `tsconfig.json` se assente;
- crea `.prettierrc.json` se assente;
- crea `eslint.config.mjs` se assente;
- crea `src/index.ts` dimostrativo se assente.

Gli script npm generati sono:

| Script | Comando | Funzione |
|---|---|---|
| `build` | `tsc -p tsconfig.json` | Compila TypeScript in `dist/` |
| `build:watch` | `tsc -p tsconfig.json --watch --preserveWatchOutput` | Compila in watch mode |
| `typecheck` | `tsc -p tsconfig.json --noEmit` | Controlla i tipi senza generare file |
| `prestart` | `npm run build` | Compila prima dello start |
| `start` | `node ./dist/index.js` | Esegue JS compilato |
| `dev` | `tsx watch --include "src/**/*.ts" src/index.ts` | Esegue TS in watch mode |
| `dev:once` | `npm run typecheck && tsx src/index.ts` | Controlla tipi ed esegue TS una volta |
| `lint` | `eslint .` | Controlla linting |
| `lint:fix` | `eslint . --fix` | Corregge problemi ESLint |
| `format` | `prettier --write .` | Formatta progetto |
| `format:check` | `prettier --check .` | Controlla formattazione |
| `check` | `npm run typecheck && npm run lint && npm run format:check` | Pipeline qualità |

---

### `verify-environment.sh`

`verify-environment.sh` controlla che l'ambiente sia correttamente configurato.

Verifica:

- distribuzione WSL;
- kernel Linux;
- path del workspace;
- versione Node;
- versione npm;
- path di `node` e `npm`;
- `process.platform` e `process.arch`;
- presenza degli eseguibili locali:
  - `tsc`;
  - `tsx`;
  - `eslint`;
  - `prettier`;
- presenza file:
  - `package.json`;
  - `tsconfig.json`;
  - `eslint.config.mjs`;
  - `.prettierrc.json`;
- controllo TypeScript tramite `npm run typecheck`.

È il task più utile per diagnosticare problemi di configurazione.

---

### `run-with-node.sh`

`run-with-node.sh` è un wrapper comune usato da molti task.

Funzione:

1. verifica WSL;
2. attiva Node corretto del progetto;
3. esegue il comando ricevuto come argomento.

Esempio concettuale:

```bash
run-with-node.sh npm run build
```

Vantaggio: ogni task passa da un solo punto di ingresso, quindi si evita che VS Code usi per errore Node Windows o un Node non attivo.

---

### `wsl-typescript-bashrc`

Questo file è un profilo Bash dedicato al terminale integrato del workspace.

Serve a rendere coerente anche il terminale manuale, non solo i task.

Quando si apre il terminale integrato:

1. carica `~/.bashrc`;
2. carica NVM;
3. entra nella root progetto;
4. applica `.nvmrc`;
5. informa l'utente se Node non è disponibile.

---

## Configurazione dei task VS Code

Il file `tasks.json` organizza automazioni per setup, compilazione, watch, debug, linting e formattazione.

Tutti i task principali usano:

```json
"type": "process",
"command": "/bin/bash"
```

Questo è importante perché forza l'esecuzione dei comandi nel contesto Linux/WSL.

---

### Installazione Node in WSL

Task:

```text
Node Setup: Installa Node in WSL
```

Esegue:

```bash
.vscode/scripts/install-node.sh
```

Scopo:

- installare Node Linux tramite NVM;
- usare `.nvmrc`;
- impedire l'uso accidentale di Node Windows;
- assicurare Node >= 22.

---

### Installazione TypeScript e strumenti

Task:

```text
TypeScript Setup: Installa TypeScript e strumenti
```

Esegue:

```bash
.vscode/scripts/install-typescript.sh
```

Scopo:

- creare o aggiornare `package.json`;
- installare TypeScript, tsx, ESLint e Prettier;
- creare configurazioni mancanti;
- verificare gli eseguibili locali.

---

### Setup completo Node + TypeScript

Task:

```text
Setup: Completo Node + TypeScript
```

Esegue in sequenza:

1. `Node Setup: Installa Node in WSL`;
2. `TypeScript Setup: Installa TypeScript e strumenti`;
3. `Setup: Verifica ambiente WSL TypeScript`.

È il task consigliato per la prima configurazione del progetto.

---

### Build TypeScript

Task:

```text
TypeScript: Build
```

Esegue:

```bash
npm run build
```

che corrisponde a:

```bash
tsc -p tsconfig.json
```

Effetto:

```text
src/index.ts  →  dist/index.js
```

È anche il task di build predefinito.

---

### Watch TypeScript

Task:

```text
TypeScript: Watch
```

Esegue:

```bash
npm run build:watch
```

che corrisponde a:

```bash
tsc -p tsconfig.json --watch --preserveWatchOutput
```

Caratteristiche:

- è un task background;
- parte automaticamente all'apertura del workspace;
- ricompila quando cambiano i file `src/**/*.ts`;
- usa il problem matcher `$tsc-watch`;
- ha `instanceLimit: 1` per evitare più watch duplicati.

Questo task è quello che mantiene aggiornati i file JavaScript dentro `dist/`.

---

### Esecuzione diretta con tsx

Task:

```text
TypeScript: Esegui applicazione
```

Esegue:

```bash
npm run dev:once
```

che corrisponde a:

```bash
npm run typecheck && tsx src/index.ts
```

Questo comando:

1. controlla i tipi;
2. esegue direttamente TypeScript senza passare da `dist/`.

Task collegati:

| Task | Funzione |
|---|---|
| `TypeScript: Dev watch` | Esegue `tsx watch` su `src/index.ts` |
| `TypeScript: Esegui file corrente` | Esegue con `tsx` il file attualmente aperto |

---

### Esecuzione JavaScript compilato

Task:

```text
Node: Esegui JavaScript compilato
```

Esegue:

```bash
npm start
```

Nel `package.json`:

```json
"prestart": "npm run build",
"start": "node ./dist/index.js"
```

Quindi il flusso reale è:

```text
npm start
  ↓
npm run prestart
  ↓
npm run build
  ↓
node ./dist/index.js
```

In pratica, prima viene compilato il TypeScript, poi viene eseguito il JavaScript generato.

---

### Lint, format e qualità

Task disponibili:

| Task | Script npm | Funzione |
|---|---|---|
| `ESLint: Controlla progetto` | `npm run lint` | Controlla il codice |
| `ESLint: Correggi automaticamente` | `npm run lint:fix` | Corregge problemi dove possibile |
| `Prettier: Controlla formattazione` | `npm run format:check` | Verifica formattazione |
| `Prettier: Formatta progetto` | `npm run format` | Formatta i file |
| `Qualità: Typecheck + ESLint + Prettier` | `npm run check` | Esegue controllo completo |

---

## Configurazione debug VS Code

Il file `launch.json` contiene tre configurazioni.

| Configurazione | Porta | Funzione |
|---|---:|---|
| `TypeScript: Debug file corrente in WSL` | `9229` | Avvia il file corrente con `tsx` e collega il debugger |
| `TypeScript: Debug applicazione compilata` | `9230` | Compila e avvia `dist/index.js` con inspector |
| `Node: Collega debugger alla porta 9229` | `9229` | Attach generico a un processo Node già in ascolto |

La configurazione per il file corrente usa come `preLaunchTask`:

```text
TypeScript: Avvia file corrente per debugger
```

La configurazione per l'app compilata usa come `preLaunchTask`:

```text
TypeScript: Avvia applicazione compilata per debugger
```

Entrambe le configurazioni hanno:

```json
"sourceMaps": true
```

Questo consente a VS Code di collegare il JavaScript eseguito ai file TypeScript originali.

---

## Configurazione TypeScript

Il file `tsconfig.json` configura un progetto TypeScript moderno orientato a Node.

Opzioni principali:

| Opzione | Valore | Significato |
|---|---|---|
| `target` | `ES2023` | Output JavaScript moderno |
| `module` | `NodeNext` | Moduli compatibili con Node moderno |
| `moduleResolution` | `NodeNext` | Risoluzione moduli coerente con Node |
| `rootDir` | `src` | Cartella sorgente |
| `outDir` | `dist` | Cartella output compilato |
| `sourceMap` | `true` | Genera source map per debug |
| `inlineSources` | `true` | Include sorgenti nelle mappe |
| `strict` | `true` | Abilita controlli TypeScript rigorosi |
| `noUncheckedIndexedAccess` | `true` | Accessi indicizzati più sicuri |
| `exactOptionalPropertyTypes` | `true` | Proprietà opzionali più precise |
| `noImplicitOverride` | `true` | Richiede override espliciti |
| `experimentalDecorators` | `true` | Abilita decorator |
| `emitDecoratorMetadata` | `true` | Emette metadati decorator |
| `noEmitOnError` | `true` | Non genera output se ci sono errori |
| `types` | `['node']` | Include tipi Node |

La configurazione include solo:

```json
"include": ["src/**/*.ts"]
```

ed esclude:

```json
"exclude": ["node_modules", "dist"]
```

### Watch options

Sono presenti opzioni dedicate al watch:

```json
"watchOptions": {
  "watchFile": "fixedPollingInterval",
  "watchDirectory": "dynamicPriorityPolling",
  "fallbackPolling": "dynamicPriority",
  "synchronousWatchDirectory": true,
  "excludeDirectories": ["**/node_modules", "dist"]
}
```

Queste opzioni sono utili in ambiente WSL, dove il file watching può richiedere polling più esplicito, soprattutto se i file sono su filesystem Windows o in workspace misti.

---

## Configurazione npm

Il file `package.json` definisce il progetto come modulo ES:

```json
"type": "module"
```

ed espone come entry point compilato:

```json
"main": "./dist/index.js"
```

Il requisito Node è:

```json
"engines": {
  "node": ">=22"
}
```

Le dipendenze sono solo di sviluppo perché il progetto dimostrativo non usa librerie runtime esterne.

---

## ESLint e Prettier

### Prettier

Il file `.prettierrc.json` imposta:

```json
{
  "printWidth": 120,
  "singleQuote": true,
  "semi": true
}
```

Quindi:

- righe fino a 120 caratteri;
- stringhe con apici singoli;
- punto e virgola obbligatorio.

### ESLint

`eslint.config.mjs` usa la nuova flat config di ESLint.

Importa:

- `@eslint/js`;
- `eslint/config`;
- `globals`;
- `typescript-eslint`.

Esclude:

```js
ignores: ['dist/**', 'node_modules/**']
```

Applica le regole a:

```text
**/*.{js,cjs,mjs,ts,cts,mts}
```

ed estende:

- `js.configs.recommended`;
- `tseslint.configs.recommended`;
- `tseslint.configs.stylistic`.

---

## Flusso di lavoro consigliato

### Prima configurazione

Da VS Code:

```text
Terminal → Run Task → Setup: Completo Node + TypeScript
```

Questo task installa Node, installa TypeScript e verifica l'ambiente.

---

### Sviluppo normale

Aprire il workspace:

```bash
code typescript-wsl.code-workspace
```

Il task `TypeScript: Watch` può partire automaticamente.

Modificare:

```text
src/index.ts
```

Il compilatore aggiorna:

```text
dist/index.js
```

Per eseguire il JavaScript compilato:

```text
Terminal → Run Task → Node: Esegui JavaScript compilato
```

Oppure da terminale:

```bash
npm start
```

---

### Controllo qualità

Da VS Code:

```text
Terminal → Run Task → Qualità: Typecheck + ESLint + Prettier
```

Oppure da terminale:

```bash
npm run check
```

---

## Passaggi chiave del progetto a livello di codice

Il file `src/index.ts` implementa un esempio TypeScript fortemente tipizzato basato su tre settori artigianali:

- `Molitura`;
- `IntaglioLegno`;
- `LavorazioneCreta`.

Per ogni settore sono definiti:

- lavori disponibili;
- corsi;
- partecipanti;
- aziende.

L'obiettivo del codice è mantenere coerenti questi abbinamenti:

```text
partecipante del settore F
    può iscriversi solo a corsi del settore F
    può ricevere offerte solo da aziende del settore F
    può ricevere solo posizioni del settore F
```

---

### `artisanMap` come fonte dati tipizzata

`artisanMap` è la fonte centrale dei dati.

È dichiarata con:

```ts
const artisanMap = { ... } as const;
```

`as const` rende i dati più precisi a livello di tipo:

- le stringhe non diventano semplicemente `string`;
- i settori restano literal type;
- i corsi e lavori diventano valori specifici;
- TypeScript può derivare tipi direttamente dalla struttura dati.

Esempio concettuale:

```ts
const artisanMap = {
  Molitura: {
    jobs: ['Mugnaio', 'Addetto alla macinazione'],
    courses: [
      {
        title: 'Introduzione alla molitura tradizionale',
        descr: 'Corso per imparare a macinare vari cereali',
        durationInHours: 40,
      },
    ],
    participants: [],
    companies: [],
  },
} as const;
```

---

### `Field` e mapped type `ArtisanMap`

Il tipo:

```ts
type Field = keyof typeof artisanMap;
```

deriva automaticamente la union dei settori:

```ts
type Field = 'Molitura' | 'IntaglioLegno' | 'LavorazioneCreta';
```

Il mapped type:

```ts
type ArtisanMap = {
  [F in Field]: {
    job: (typeof artisanMap)[F]['jobs'][number];
    course: (typeof artisanMap)[F]['courses'][number]['title'];
    participants: (typeof artisanMap)[F]['participants'][number];
    companies: (typeof artisanMap)[F]['companies'][number];
  };
};
```

costruisce una mappa di tipi per ogni settore.

In pratica, per ogni `F`, TypeScript sa quali sono:

- job ammessi;
- titoli corso ammessi;
- partecipanti ammessi;
- aziende ammesse.

---

### Tipi derivati `JobFor` e `CourseFor`

Il codice definisce:

```ts
type JobFor<F extends Field> = ArtisanMap[F]['job'];
type CourseFor<F extends Field> = ArtisanMap[F]['course'];
```

Questi tipi permettono di chiedere:

```text
quali lavori esistono per questo settore?
quali corsi esistono per questo settore?
```

Esempio concettuale:

```ts
type MolituraJob = JobFor<'Molitura'>;
```

`MolituraJob` può essere solo uno dei lavori definiti in `artisanMap.Molitura.jobs`.

---

### Interfacce generiche

Il progetto usa tre interfacce principali:

```ts
interface IPartecipante<F extends Field = Field> { ... }
interface ICorso<F extends Field = Field> { ... }
interface IAzienda<F extends Field = Field> { ... }
```

Il parametro generico `F` rappresenta il settore.

Questo consente di scrivere tipi come:

| Tipo | Significato |
|---|---|
| `IPartecipante<'Molitura'>` | Partecipante interessato alla molitura |
| `ICorso<'Molitura'>` | Corso della molitura |
| `IAzienda<'Molitura'>` | Azienda del settore molitura |

Il metodo:

```ts
iscrivitiCorso(corso: ICorso<F>): void;
```

impone che un partecipante del settore `F` possa iscriversi solo a un corso dello stesso settore `F`.

---

### Classi generiche

Il codice implementa:

```ts
class Partecipante<F extends Field> implements IPartecipante<F> { ... }
class Corso<F extends Field> implements ICorso<F> { ... }
class Azienda<F extends Field> implements IAzienda<F> { ... }
```

Ogni classe mantiene il settore come parametro generico.

Esempio:

```ts
const partecipante = new Partecipante(
  'Ahmed',
  'Ben Salem',
  'Tunisia',
  3,
  2,
  'Molitura',
);
```

In questo caso TypeScript può inferire che il partecipante appartiene al settore `Molitura`.

---

### Creazione dinamica di partecipanti, corsi e aziende

Il codice usa:

```ts
const fields = Object.keys(artisanMap) as Field[];
```

`Object.keys()` viene tipizzato normalmente come `string[]`. La type assertion `as Field[]` comunica a TypeScript che quelle chiavi sono proprio i settori validi.

Vengono poi costruite strutture indicizzate per settore:

```ts
type ParticipantsByField = { [F in Field]: Partecipante<F>[] };
type CoursesByField = { [F in Field]: Corso<F>[] };
type CompaniesByField = { [F in Field]: Azienda<F>[] };
type JobsByField = { [F in Field]: JobFor<F>[] };
```

Queste strutture mantengono l'associazione:

```text
p.Molitura                 → Partecipante<'Molitura'>[]
coursesByField.Molitura    → Corso<'Molitura'>[]
companiesByField.Molitura  → Azienda<'Molitura'>[]
jobsByField.Molitura       → JobFor<'Molitura'>[]
```

---

### Iscrizione dei partecipanti ai corsi

La funzione:

```ts
function iscriviPartecipantiDelSettore<F extends Field>(field: F): void {
  const participants = p[field];
  const courses = coursesByField[field];

  participants.forEach((participant) => {
    courses.forEach((course) => {
      participant.iscrivitiCorso(course);
    });
  });
}
```

mantiene il collegamento tra:

- partecipanti di un settore;
- corsi dello stesso settore.

Il parametro generico `F` permette a TypeScript di sapere che `participants` e `courses` appartengono allo stesso settore.

Il ciclo finale:

```ts
for (const field of fields) {
  iscriviPartecipantiDelSettore(field);
}
```

applica l'iscrizione a tutti i settori definiti in `artisanMap`.

---

### Invio candidature alle aziende

La funzione:

```ts
function inviaCandidatureDelSettore<F extends Field>(field: F): void {
  const participants = p[field];
  const companies = companiesByField[field];
  const jobs = jobsByField[field];

  participants.forEach((participant) => {
    companies.forEach((company) => {
      for (const job of jobs) {
        company.offriPosizione(participant, job);
      }
    });
  });
}
```

associa:

- partecipanti;
- aziende;
- posizioni lavorative;

sempre all'interno dello stesso settore.

Il metodo:

```ts
offriPosizione(partecipante: IPartecipante<F>, posizione: JobFor<F>): void
```

impedisce di offrire una posizione di un settore a un partecipante di un altro settore.

---

## Comandi rapidi

### Setup completo

```bash
npm run check
```

oppure da VS Code:

```text
Terminal → Run Task → Setup: Completo Node + TypeScript
```

### Build

```bash
npm run build
```

### Watch TypeScript

```bash
npm run build:watch
```

### Esecuzione TypeScript diretta

```bash
npm run dev:once
```

### Esecuzione TypeScript in watch

```bash
npm run dev
```

### Esecuzione JavaScript compilato

```bash
npm start
```

### Controllo tipi

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Check completo

```bash
npm run check
```

---

## Note operative

- Il progetto deve essere aperto in **WSL**, non come semplice cartella Windows.
- I task sono pensati per usare `/bin/bash`.
- `run-with-node.sh` evita l'uso accidentale di Node Windows.
- `TypeScript: Watch` aggiorna `dist/` automaticamente quando cambiano i file `.ts`.
- `npm start` esegue sempre prima `npm run build`, grazie a `prestart`.
- `tsx` serve per sviluppo rapido senza compilare manualmente.
- `tsc` resta il riferimento per la build ufficiale.
- `dist/` e `node_modules/` sono esclusi da TypeScript ed ESLint.
- La configurazione `NodeNext` è coerente con `type: module` nel `package.json`.

