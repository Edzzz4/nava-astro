/* ─────────────────────────────────────────────────────────────
   Nava i18n — Italian (source of truth).

   The `Dictionary` type below is derived from this object: every
   other language file MUST provide exactly these keys, or
   `astro check` / `astro build` fails. Add new keys here first.
   ───────────────────────────────────────────────────────────── */

export const it = {
  /* meta */
  site_name: 'Nava',
  meta_home_title: 'Nava — Libri che valgono la libreria',
  meta_home_desc: 'Nava, editore indipendente. Catalogo curato, ogni libro un oggetto da regalo, stampato in Italia.',
  meta_catalog_title: 'Catalogo — Nava',
  meta_catalog_desc: 'Il catalogo completo Nava: filtra per categoria, cerca e ordina tutti i titoli.',
  meta_about_title: 'Chi siamo — Nava',
  meta_about_desc: 'La storia di Nava, editore indipendente: missione, persone e valori.',
  meta_contact_title: 'Contatti — Nava',
  meta_contact_desc: 'Contatta Nava: stampa, diritti esteri, manoscritti.',
  meta_book_desc_prefix: 'di', // "Titolo — di Autore. …"

  /* a11y */
  skip_to_content: 'Salta al contenuto',
  aria_main_nav: 'Principale',
  aria_lang_switch: 'Lingua',
  aria_menu: 'Menu',
  aria_footer_nav: 'Footer',
  aria_cover_prefix: 'Copertina di',
  aria_breadcrumb: 'Percorso di navigazione',

  /* nav + footer */
  nav_home: 'Home', nav_catalog: 'Catalogo', nav_about: 'Chi siamo', nav_contact: 'Contatti',
  foot_tag: 'Libri che valgono la libreria. Editore indipendente, stampato in Italia.',
  foot_catalog: 'Catalogo', foot_about: 'Chi siamo', foot_contact: 'Contatti',
  foot_privacy: 'Privacy', foot_cookies: 'Cookie Policy', foot_terms: 'Termini di vendita',
  foot_withdrawal: 'Diritto di recesso', foot_shipping: 'Spedizioni e resi',
  foot_rights: 'Tutti i diritti riservati.',
  foot_vat: 'P.IVA [TODO]',

  /* shared buy buttons */
  buy_now: 'Compra ora', buy_amazon: 'Compra su Amazon',
  fmt_Paperback: 'Brossura', fmt_Hardcover: 'Cartonato',

  /* home */
  hero_kicker: 'Editore indipendente · dal 2019',
  hero_line1: 'Libri che valgono', hero_line2: 'la libreria.',
  hero_sub: 'Un catalogo curato, libro per libro. Ogni titolo stampato in Italia e pensato come un oggetto da tenere — o da regalare.',
  hero_cta1: 'Esplora catalogo', hero_cta2: 'Ultime uscite',
  cat_title: 'Indice categorie', cat_sub: 'Nove modi di entrare nel catalogo.',
  cat_count_word: 'titoli',
  feat_title: 'Ultime uscite', feat_sub: 'Selezione della stagione, stampata in Italia.',
  feat_viewall: 'Vedi tutto il catalogo',
  why_title: 'Perché Nava',
  why1_h: 'Catalogo curato', why1_p: 'Pochi titoli, scelti uno per uno. Nessun riempitivo: se è in catalogo, vale lo scaffale.',
  why2_h: 'Indipendente', why2_p: 'Nessun grande gruppo dietro di noi. Decidiamo cosa pubblicare in base ai libri, non ai trend.',
  why3_h: 'Stampato in Italia', why3_p: 'Carta, rilegatura e stampa di qualità da tipografie italiane. Oggetti fatti per durare.',
  nl_title: 'Resta in catalogo.', nl_sub: 'Una mail al mese: nuove uscite, ristampe, niente rumore.',
  nl_label: 'Indirizzo email', nl_ph: 'La tua email', nl_btn: 'Iscrivimi',

  /* catalog */
  catpg_title: 'Catalogo', catpg_sub: 'Tutti i titoli Nava, in un posto solo.',
  cat_other: 'Altre categorie', cat_all_titles: 'Tutti i titoli della collana',
  filter_title: 'Categorie', filter_all: 'Tutte le categorie',
  search_label: 'Cerca nel catalogo', search_ph: 'Cerca titolo o autore…',
  sort_label: 'Ordina', sort_newest: 'Più recenti', sort_price_asc: 'Prezzo crescente',
  sort_price_desc: 'Prezzo decrescente', sort_az: 'A → Z',
  results_word: 'titoli', empty_msg: 'Nessun titolo trovato, per ora.',

  /* book */
  bk_back: 'Torna al catalogo', bk_genre: 'Genere', bk_author_label: 'Autore',
  bk_pages: 'Pagine', bk_isbn: 'ISBN', bk_format: 'Formato', bk_year: 'Anno',
  bk_dimensions: 'Dimensioni', bk_technique: 'Tecnica', bk_edition: 'Tiratura',
  bk_preview_title: "Sfoglia l'anteprima",
  bk_preview_msg: 'Anteprima delle pagine in arrivo — qui sarà incorporato un campione del libro.',
  bk_about_author: "Sull'autore", bk_related: 'Libri correlati',

  /* about */
  ab_kicker: 'Chi siamo', ab_title: 'Un editore piccolo, di proposito.',
  ab_lead: 'Nava nasce nel 2019 da due lettori testardi convinti che un libro debba valere lo spazio che occupa.',
  ab_story_h: 'La nostra storia',
  ab_story_p1: 'Abbiamo iniziato in una stanza con due scrivanie e una pila di manoscritti che nessuno voleva. Cercavamo libri che ci sembrassero necessari, non solo vendibili — e li volevamo stampati bene, su carta che dura.',
  ab_story_p2: "Oggi pubblichiamo poche decine di titoli l'anno, in nove collane. Continuiamo a leggere ogni manoscritto fino in fondo, e a dire di no quasi sempre. È così che il catalogo resta curato.",
  ab_mission_h: 'La nostra missione',
  ab_mission_p: 'Pubblicare meno, ma meglio. Trattare ogni libro come un oggetto da regalo: bello da tenere in mano, fatto per restare sullo scaffale.',
  ab_team_h: 'Le persone', ab_team_sub: 'Due soci, nessun reparto marketing.',
  ab_team_photo_ph: 'Foto del duo in arrivo',
  ed_name: 'Edoardo', ed_role: 'Co-fondatore · Direzione editoriale',
  ed_bio: "Sceglie i titoli, segue gli autori e legge troppo tardi la sera. Prima di Nava ha lavorato dieci anni nell'editoria di varia.",
  lu_name: 'Luca', lu_role: 'Co-fondatore · Produzione e design',
  lu_bio: 'Cura carta, stampa e copertine. Ex tipografo, è convinto che il bianco di una pagina conti quanto il testo.',
  ab_values_h: 'Cosa teniamo fermo',
  v1_h: 'Curare, non accumulare', v1_p: 'Meglio dieci libri giusti che cento qualsiasi.',
  v2_h: 'Indipendenza', v2_p: 'Nessun azionista a cui rispondere se non i lettori.',
  v3_h: 'Fatto in Italia', v3_p: 'Stampa e rilegatura da tipografie che conosciamo per nome.',

  /* contact */
  ct_kicker: 'Contatti', ct_title: 'Scrivici.',
  ct_lead: 'Per la stampa, i diritti esteri o per proporci un manoscritto: siamo qui.',
  ct_form_h: 'Mandaci un messaggio',
  ct_name: 'Nome', ct_email: 'Email', ct_message: 'Messaggio',
  ct_name_ph: 'Il tuo nome', ct_email_ph: 'La tua email', ct_msg_ph: 'Come possiamo aiutarti?',
  ct_send: 'Invia messaggio', ct_success: 'Grazie — ti risponderemo presto.',
  ct_error: 'Controlla i campi evidenziati e riprova.',
  ct_direct_h: 'In diretta',
  ct_press_h: 'Stampa', ct_press: 'stampa@navaeditore.com',
  ct_rights_h: 'Diritti esteri', ct_rights: 'diritti@navaeditore.com',
  ct_subs_h: 'Manoscritti', ct_subs: 'manoscritti@navaeditore.com',
  ct_social_h: 'Social',

  /* legal */
  legal_updated: 'Ultimo aggiornamento',
  legal_en_note: 'Questa pagina è disponibile solo in italiano per ora.',

  /* 404 */
  nf_title: 'Pagina non trovata.',
  nf_msg: 'La pagina che cercavi non è (più) sullo scaffale.',
  nf_home: 'Torna alla home', nf_catalog: 'Vai al catalogo',
};

/** Every language must provide exactly the keys of `it`, all strings. */
export type Dictionary = { [K in keyof typeof it]: string };
