# ScoreForge — Guida Setup Completo

## Prerequisiti
- Node.js 18+ installato sul tuo computer
- Un account GitHub (gratuito)
- Un account Vercel (gratuito)
- Un account Supabase (gratuito)

---

## PASSO 1 — Supabase: crea il progetto database

1. Vai su **https://supabase.com** e clicca "Start your project"
2. Crea un account gratuito (con GitHub è più veloce)
3. Clicca **"New Project"**
4. Scegli un nome: `scoreforge`
5. Scegli una password sicura per il database (salvala!)
6. Seleziona la region: **West EU (Ireland)** — la più vicina all'Italia
7. Clicca **"Create new project"** e aspetta ~2 minuti

### Esegui lo schema SQL
1. Nel pannello Supabase, vai su **SQL Editor** (icona terminale a sinistra)
2. Clicca **"New Query"**
3. Apri il file `supabase/schema.sql` di questo progetto
4. Copia tutto il contenuto e incollalo nell'editor
5. Clicca **"Run"** — dovresti vedere "Success"

### Copia le chiavi API
1. Vai su **Project Settings → API** (icona ingranaggio in basso)
2. Copia questi valori — ti serviranno nel passo 3:
   - `Project URL` → sarà `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → sarà `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → sarà `SUPABASE_SERVICE_ROLE_KEY`

### Crea il primo utente (Andrea)
1. Vai su **Authentication → Users**
2. Clicca **"Add user" → "Create new user"**
3. Inserisci email e password di Andrea
4. Clicca **"Create User"**

---

## PASSO 2 — GitHub: carica il codice

1. Vai su **https://github.com/new**
2. Nome repository: `scoreforge`
3. Visibilità: **Private**
4. Clicca **"Create repository"**
5. Sul tuo computer, apri il terminale nella cartella del progetto:

```bash
cd scoreforge
git init
git add .
git commit -m "Initial commit — ScoreForge v1.0"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/scoreforge.git
git push -u origin main
```

---

## PASSO 3 — Vercel: deploy del progetto

1. Vai su **https://vercel.com** e accedi con GitHub
2. Clicca **"Add New Project"**
3. Seleziona il repository `scoreforge`
4. Clicca **"Import"**
5. Nella sezione **"Environment Variables"**, aggiungi queste variabili
   (una alla volta, con il tasto "Add"):

| Nome | Valore |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del tuo progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anon di Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave service_role di Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://NOME-PROGETTO.vercel.app` (dopo il deploy potrai aggiornarlo) |

6. Clicca **"Deploy"** — il primo deploy dura ~2 minuti

### Aggiorna NEXT_PUBLIC_APP_URL
Dopo il deploy, Vercel ti mostra l'URL finale (es. `scoreforge-andrea.vercel.app`):
1. Vai su **Vercel → Project → Settings → Environment Variables**
2. Modifica `NEXT_PUBLIC_APP_URL` con l'URL esatto
3. Vai su **Deployments** e clicca **"Redeploy"**

---

## PASSO 4 — Test finale

1. Apri `https://tuo-progetto.vercel.app`
2. Dovresti vedere la schermata di login ScoreForge
3. Accedi con le credenziali create in Supabase (Passo 1)
4. Crea il tuo primo portfolio!

---

## Sviluppo locale

```bash
# Installa le dipendenze
npm install

# Copia il file env e compila le variabili
cp .env.local.example .env.local
# → Apri .env.local e inserisci le chiavi Supabase

# Avvia il server di sviluppo
npm run dev

# Apri http://localhost:3000
```

---

## Struttura progetto

```
scoreforge/
├── app/
│   ├── page.tsx              # Redirect root → dashboard o login
│   ├── login/page.tsx        # Pagina di accesso
│   ├── dashboard/            # Dashboard admin
│   ├── portfolios/           # Lista + editor portfolio
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── edit/page.tsx
│   │       └── preview/page.tsx
│   ├── bio/page.tsx          # Biografia artista
│   ├── media/page.tsx        # Media library
│   ├── settings/page.tsx     # Impostazioni account
│   └── [slug]/page.tsx       # Landing page pubblica
├── components/
│   ├── admin/                # Componenti area admin
│   │   ├── Sidebar.tsx
│   │   ├── AdminShell.tsx
│   │   ├── PortfolioEditor.tsx
│   │   ├── AudioUploader.tsx
│   │   ├── BioForm.tsx
│   │   ├── MediaLibraryClient.tsx
│   │   ├── SettingsClient.tsx
│   │   └── DeletePortfolioButton.tsx
│   ├── landing/
│   │   └── LandingPage.tsx   # Landing page con 3 temi
│   └── player/
│       └── AudioPlayer.tsx   # Player audio WaveSurfer
├── lib/
│   └── supabase/
│       ├── client.ts         # Client browser
│       ├── server.ts         # Client server (SSR)
│       └── types.ts          # TypeScript types DB
├── supabase/
│   └── schema.sql            # Schema database completo
├── middleware.ts             # Protezione route admin
└── .env.local.example        # Template variabili d'ambiente
```

---

## Quando sei pronto per aprire al pubblico

1. **Passa a Vercel Pro** → https://vercel.com/account/billing (~$20/mese)
2. **Passa a Supabase Pro** → Supabase Dashboard → Settings → Billing (~$25/mese)
3. **Attiva Cloudflare R2** per lo storage file audio su larga scala
4. **Aggiungi Stripe** per gli abbonamenti degli artisti
5. Aggiorna le variabili d'ambiente di conseguenza

---

## Supporto e problemi comuni

**Login non funziona**: verifica che l'utente sia stato creato in Supabase → Authentication → Users

**Errore "relation does not exist"**: lo schema SQL non è stato eseguito correttamente. Riprova dal SQL Editor di Supabase.

**Upload file non funziona**: verifica che il bucket `scoreforge-media` sia stato creato in Supabase → Storage

**Deploy fallisce su Vercel**: controlla che tutte le variabili d'ambiente siano state inserite correttamente
