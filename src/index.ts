/* 
Dato che in questo progetto sono presenti molti campi stringa che possono 
avere grande variabilità e quindi grandi margini d'errore è opprotuno combinare
Type Literals con Interface per limitare il più possibile il margine d'errore
sui matching soprattutto delle aree d'interesse, corsi e delle offerte di lavoro.

Tipo	                      Significato
IPartecipante<F>	          Partecipante dello stesso settore specifico del corso
IPartecipante<Field>	      Partecipante di uno qualsiasi dei settori ammessi
IPartecipante<'Molitura'>	  Partecipante specificamente interessato alla molitura

*/

const artisanMap = {
  Molitura: {
    jobs: ['Mugnaio', 'Addetto alla macinazione', 'Manutentore di mulini'],

    courses: [
      {
        title: 'Introduzione alla molitura tradizionale',
        descr: 'Corso per imparare a macinare vari cereali con il mulino a pietra',
        durationInHours: 40,
      },
      {
        title: 'Tecniche di macinazione dei cereali',
        descr:
          'Percorso pratico dedicato alla selezione dei cereali, alla regolazione ' +
          'delle macine e al controllo della qualità della farina.',
        durationInHours: 60,
      },
      {
        title: 'Manutenzione del mulino',
        descr:
          'Corso sulla pulizia, manutenzione ordinaria e verifica dei principali ' +
          'componenti meccanici di un mulino.',
        durationInHours: 80,
      },
    ],

    participants: [
      {
        name: 'Ahmed',
        surname: 'Ben Salem',
        birthCountry: 'Tunisia',
        instructionLevel: 3,
        languageLevel: 2,
        fieldOfInterest: 'Molitura',
      },
      {
        name: 'Moussa',
        surname: 'Traoré',
        birthCountry: 'Mali',
        instructionLevel: 2,
        languageLevel: 3,
        fieldOfInterest: 'Molitura',
      },
    ],

    companies: [
      {
        name: 'Alla Vecchia',
        companyField: 'Molitura',
        description: "Facciamo le cose alla vecchia maniera, con il tempo e l'impegno",
        jobOpenings: ['Mugnaio', 'Addetto alla macinazione'],
      },
    ],
  },

  IntaglioLegno: {
    jobs: ['Intagliatore del legno', 'Scultore del legno', 'Restauratore ligneo'],

    courses: [
      {
        title: 'Introduzione all’intaglio del legno',
        descr:
          'Corso introduttivo sulla scelta dei materiali e sulle principali ' +
          'tecniche tradizionali di intaglio del legno.',
        durationInHours: 40,
      },
      {
        title: 'Uso degli strumenti da intaglio',
        descr:
          'Laboratorio pratico sull’utilizzo sicuro di scalpelli, sgorbie, ' +
          'mazzuoli e strumenti per la rifinitura del legno.',
        durationInHours: 60,
      },
      {
        title: 'Tecniche di decorazione lignea',
        descr:
          'Percorso dedicato alla realizzazione di motivi ornamentali, ' +
          'bassorilievi e decorazioni tradizionali su legno.',
        durationInHours: 80,
      },
    ],

    participants: [
      {
        name: 'Amir',
        surname: 'Haddad',
        birthCountry: 'Marocco',
        instructionLevel: 3,
        languageLevel: 2,
        fieldOfInterest: 'IntaglioLegno',
      },
      {
        name: 'Samuel',
        surname: 'Mensah',
        birthCountry: 'Ghana',
        instructionLevel: 4,
        languageLevel: 3,
        fieldOfInterest: 'IntaglioLegno',
      },
      {
        name: 'Youssef',
        surname: 'El Amrani',
        birthCountry: 'Marocco',
        instructionLevel: 2,
        languageLevel: 2,
        fieldOfInterest: 'IntaglioLegno',
      },
    ],
    companies: [
      {
        name: 'Bottega Legno Antico',
        companyField: 'IntaglioLegno',
        description:
          'Laboratorio artigianale specializzato nella produzione di elementi ' +
          'decorativi in legno e nel restauro di mobili antichi.',
        jobOpenings: ['Intagliatore del legno', 'Restauratore ligneo'],
      },
    ],
  },

  LavorazioneCreta: {
    jobs: ['Ceramista', 'Vasaio', 'Decoratore di ceramiche'],

    courses: [
      {
        title: 'Introduzione alla lavorazione della creta',
        descr:
          'Corso introduttivo sulle caratteristiche della creta, sulla sua ' +
          'preparazione e sulle tecniche fondamentali di lavorazione.',
        durationInHours: 40,
      },
      {
        title: 'Tecniche di modellazione manuale',
        descr:
          'Laboratorio pratico dedicato alla modellazione a mano, alla tecnica ' +
          'del colombino e alla creazione di manufatti artigianali.',
        durationInHours: 60,
      },
      {
        title: 'Cottura e decorazione della ceramica',
        descr:
          'Corso sulla preparazione dei manufatti per la cottura, sull’utilizzo ' +
          'del forno e sulle tecniche di smaltatura e decorazione.',
        durationInHours: 80,
      },
    ],

    participants: [
      {
        name: 'Fatima',
        surname: 'Ben Salah',
        birthCountry: 'Tunisia',
        instructionLevel: 4,
        languageLevel: 3,
        fieldOfInterest: 'LavorazioneCreta',
      },
      {
        name: 'Amina',
        surname: 'Diallo',
        birthCountry: 'Senegal',
        instructionLevel: 3,
        languageLevel: 2,
        fieldOfInterest: 'LavorazioneCreta',
      },
      {
        name: 'Nadia',
        surname: 'Rahmani',
        birthCountry: 'Algeria',
        instructionLevel: 5,
        languageLevel: 4,
        fieldOfInterest: 'LavorazioneCreta',
      },
    ],

    companies: [
      {
        name: 'Terre del Borgo',
        companyField: 'LavorazioneCreta',
        description:
          'Laboratorio di ceramica specializzato nella produzione di stoviglie, ' +
          'vasi e decorazioni realizzate con tecniche tradizionali.',
        jobOpenings: ['Ceramista', 'Vasaio', 'Decoratore di ceramiche'],
      },
    ],
  },
} as const;

//---------------------GLOBAL TYPE MAP
type Field = keyof typeof artisanMap;

/*

Il 'type ArtisanMap' viene scritto in modo dinamico la struttura seguente:
{
  Molitura: {
    job: ...;
    course: ...;
  };

  IntaglioLegno: {
    job: ...;
    course: ...;
  };


  LavorazioneCreta: {
    job: ...;
    course: ...;
  };
};

*/
type ArtisanMap = {
  /*
  [F in Field] : Per ogni valore contenuto nel tipo union Field, crea una proprietà. Genera:
  {
    Molitura: { ... };
    IntaglioLegno: { ... };
    LavorazioneCreta: { ... };
  }*/
  [F in Field]: {
    /*
    Qui le parentesi [] servono ad accedere ad una proprietà
    */
    job: (typeof artisanMap)[F]['jobs'][number];
    /*
    tipo di artisanMap
    → settore F
    → proprietà courses
    → un elemento qualsiasi dell’array
    → proprietà title
    */
    course: (typeof artisanMap)[F]['courses'][number]['title'];
    participants: (typeof artisanMap)[F]['participants'][number];
    companies: (typeof artisanMap)[F]['companies'][number];
  };
};

/*
<F extends Field> 
Serve perchè in questo caso F non è un parametro generico scelto dall’esterno: è una variabile locale 
del mapped type. 
Si usa quando stai dichiarando un tipo generico il cui valore sarà scelto quando il tipo, la classe 
o la funzione viene utilizzata.
*/
type JobFor<F extends Field> = ArtisanMap[F]['job'];

type CourseFor<F extends Field> = ArtisanMap[F]['course'];

interface IPartecipante<F extends Field = Field> {
  name: string;
  surname: string;
  birthCountry: string;
  instructionLevel: number;
  languageLevel: number;
  fieldOfInterest: F;

  iscrivitiCorso(corso: ICorso<F>): void;
}

interface ICorso<F extends Field = Field> {
  //Il tipo generico 'F' impone che il titolo del corso sia compatibile con il settore.
  title: CourseFor<F>;
  description: string;
  durationInHours: number;
  field: F;
  participants: IPartecipante<F>[];

  aggiungiPartecipante(partecipante: IPartecipante<F>): void;
}

interface IAzienda<F extends Field = Field> {
  name: string;
  companyField: F;
  description: string;
  jobOpenings: JobFor<F>[];

  offriPosizione(partecipante: IPartecipante<F>, posizione: JobFor<F>): void;
}

//----------------------------------------CLASSES
/*
- class Partecipante<F extends Field>: Qui la classe dichiara un parametro generico chiamato F ma F 
deve appartenere a Field.
Per esempio: Partecipante<"Molitura">
- implements IPartecipante<F> : Implemento l’interfaccia IPartecipante usando lo stesso settore F
*/
class Partecipante<F extends Field> implements IPartecipante<F> {
  // scrivendo 'public' davanti ai parametri, TypeScript crea e assegna già automaticamente le proprietà
  // all'istanza 'this.'
  constructor(
    public name: string,
    public surname: string,
    public birthCountry: string,
    public instructionLevel: number,
    public languageLevel: number,
    public fieldOfInterest: F,
  ) {}

  iscrivitiCorso(corso: ICorso<F>): void {
    // passo l'istanza completa del Partecipante
    corso.aggiungiPartecipante(this);
  }
}

class Corso<F extends Field> implements ICorso<F> {
  public participants: IPartecipante<F>[] = [];
  constructor(
    public title: CourseFor<F>,
    public description: string,
    public durationInHours: number,
    public field: F,
  ) {}

  // Se usassi <Field> anzichè <F> perderei l'associazione tra interessi e corso
  aggiungiPartecipante(partecipante: IPartecipante<F>): void {
    this.participants.push(partecipante);
    console.log(`${partecipante.name} ${partecipante.surname} si è iscritto al corso` + ` "${this.title}".`);
    console.log('Lista partecipanti aggiornata', this.participants);
  }
}

class Azienda<F extends Field> implements IAzienda<F> {
  constructor(
    public name: string,
    public companyField: F,
    public description: string,
    public jobOpenings: JobFor<F>[],
  ) {}

  offriPosizione(partecipante: IPartecipante<F>, posizione: JobFor<F>): void {
    if (!this.jobOpenings.includes(posizione)) {
      console.error(`Il migrante ${partecipante.name} ${partecipante.surname} non può essere assunto per la ${posizione}.
        I lavori disponibili sono ${[...this.jobOpenings]}`);
    }
    console.log(
      `${this.name} offre a ${partecipante.name} ${partecipante.surname} ` + `la posizione di "${posizione}".`,
    );
  }
}

/*------------------------------PARTECIPANTI---------------------------------*/
/*
Object.keys() viene tipizzato da TypeScript come 'string[]' che può essere undefined.
Con 'as Field[]' stai dicendo al compilatore che queste stringhe sono esclusivamente chiavi 
valide di 'artisanMap' di tipo 'Molitura' | 'IntaglioLegno' | 'LavorazioneCreta'.
'as Field[]' non modifica realmente l’array e viene eliminata durante la compilazione.
E' una type assertion.

Oltretutto la type assertion non controlla che i valori siano corretti.
Per esempio, questa assertion sarebbe falsa ma TypeScript si fiderebbe:

const fields = ['Molitura', 'SettoreInesistente'] as Field[];

*/
const fields = Object.keys(artisanMap) as Field[];
/*
ParticipantsByField
Rappresenta una union di istanze della classe:

Partecipante<'Molitura'>
| Partecipante<'IntaglioLegno'>
| Partecipante<'LavorazioneCreta'>

Si ottiene costruendo temporaneamente un oggetto con '{[F in Field]: Partecipante<F>}':
{
  Molitura: Partecipante<'Molitura'>;
  IntaglioLegno: Partecipante<'IntaglioLegno'>;
  LavorazioneCreta: Partecipante<'LavorazioneCreta'>;
}

E poi si associa una molteplicità di elementi con il '[]' finale
*/
type ParticipantsByField = { [F in Field]: Partecipante<F>[] };
const p = Object.fromEntries(
  fields.map((field) => [
    field,
    artisanMap[field].participants.map(
      (partecipant) =>
        new Partecipante(
          partecipant.name,
          partecipant.surname,
          partecipant.birthCountry,
          partecipant.instructionLevel,
          partecipant.languageLevel,
          partecipant.fieldOfInterest,
        ),
    ),
  ]),
) as ParticipantsByField;
/*------------------------------CORSI---------------------------------*/
/*
TypeScript non può ancora chiamare 'iscrivitiCorso' distinguendo il settore perchè deve sapere che:

- un partecipante Molitura riceve un Corso<'Molitura'>;
- un partecipante IntaglioLegno riceve un Corso<'IntaglioLegno'>;
- un partecipante LavorazioneCreta riceve un Corso<'LavorazioneCreta'>.

Questa relazione deve essere mantenuta anche nella struttura dei corsi.

'CoursesByField' contiene :

{
  Molitura: Corso<'Molitura'>[];
  IntaglioLegno: Corso<'IntaglioLegno'>[];
  LavorazioneCreta: Corso<'LavorazioneCreta'>[];
}

Non ho scritto così:

type CoursesByField = { [F in Field]: Corso<F> }[Field];

Perchè perderei l'associazione corsi <-> field per poter scrivere 'coursesByField.Molitura' e ottenere un 
array di corsi della molitura.
[Field] estrae i valori e produce una union di valori, quindi perdi l’oggetto indicizzato per chiave.
*/

type CoursesByField = { [F in Field]: Corso<F>[] };

/*
Object.fromEntries: converte da :
[
  'Molitura',
  [corsoMolitura1, corsoMolitura2, corsoMolitura3],
]
a:
{
  Molitura: [...],
  IntaglioLegno: [...],
  LavorazioneCreta: [...],
}

*/
const coursesByField = Object.fromEntries(
  fields.map((field) => [
    field,
    artisanMap[field].courses.map((course) => new Corso(course.title, course.descr, course.durationInHours, field)),
  ]),
) as CoursesByField;

/*
Qui typescript collega partecipants (Partecipante<F>[]) a courses (Corso<F>[])
*/
function iscriviPartecipantiDelSettore<F extends Field>(field: F): void {
  const participants = p[field];
  const courses = coursesByField[field];

  participants.forEach((participant) => {
    courses.forEach((course) => {
      participant.iscrivitiCorso(course);
    });
  });
}

for (const field of fields) {
  iscriviPartecipantiDelSettore(field);
}

/*------------------------------AZIENDE---------------------------------*/

type CompaniesByField = { [F in Field]: Azienda<F>[] };

const companiesByField = Object.fromEntries(
  fields.map((field) => [
    field,
    artisanMap[field].companies.map(
      (company) => new Azienda(company.name, company.companyField, company.description, [...company.jobOpenings]),
    ),
  ]),
) as CompaniesByField;

type JobsByField = { [F in Field]: JobFor<F>[] };
const jobsByField = Object.fromEntries(
  fields.map((field) => [
    field,
    /*
    A causa di 'as const' artisanMap.Molitura.jobs non è tipizzata come un normale array modificabile, 
    ma come una tupla readonly. 'JobsByField'  richiede array modificabili.
    Senza lo spread qui sotto ci sarebbe un errore. [...] quindi crea una copia modificabile. 
    */
    [...artisanMap[field].jobs],
  ]),
) as JobsByField;

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

for (const field of fields) {
  inviaCandidatureDelSettore(field);
}
