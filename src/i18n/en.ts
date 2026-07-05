/* ─────────────────────────────────────────────────────────────
   Nava i18n — English.
   Typed as `Dictionary`: a missing or extra key fails the build.
   ───────────────────────────────────────────────────────────── */

import type { Dictionary } from './it';

export const en: Dictionary = {
  /* meta */
  site_name: 'Nava',
  meta_home_title: 'Nava — Books worth shelf space',
  meta_home_desc: 'Nava, an independent publisher. A curated catalog, every book a gift-quality object, printed in Italy.',
  meta_catalog_title: 'Catalog — Nava',
  meta_catalog_desc: 'The full Nava catalog: filter by category, search and sort every title.',
  meta_about_title: 'About — Nava',
  meta_about_desc: 'The story of Nava, an independent publisher: mission, people and values.',
  meta_contact_title: 'Contact — Nava',
  meta_contact_desc: 'Contact Nava for press, foreign rights and manuscript submissions.',
  meta_book_desc_prefix: 'by',

  /* a11y */
  skip_to_content: 'Skip to content',
  aria_main_nav: 'Main',
  aria_lang_switch: 'Language',
  aria_menu: 'Menu',
  aria_footer_nav: 'Footer',
  aria_cover_prefix: 'Cover of',
  aria_breadcrumb: 'Breadcrumb',

  /* nav + footer */
  nav_home: 'Home', nav_catalog: 'Catalog', nav_about: 'About', nav_contact: 'Contact',
  foot_tag: 'Books worth shelf space. Independent publisher, printed in Italy.',
  foot_catalog: 'Catalog', foot_about: 'About', foot_contact: 'Contact',
  foot_privacy: 'Privacy', foot_cookies: 'Cookie Policy', foot_terms: 'Terms of sale',
  foot_withdrawal: 'Right of withdrawal', foot_shipping: 'Shipping & returns',
  foot_rights: 'All rights reserved.',
  foot_vat: 'VAT no. [TODO]',

  /* shared buy buttons */
  buy_now: 'Buy now', buy_amazon: 'Buy on Amazon',
  fmt_Paperback: 'Paperback', fmt_Hardcover: 'Hardcover',

  /* home */
  hero_kicker: 'Independent publisher · since 2019',
  hero_line1: 'Books worth', hero_line2: 'shelf space.',
  hero_sub: 'A catalog curated book by book. Every title printed in Italy and made as an object to keep — or to give.',
  hero_cta1: 'Explore catalog', hero_cta2: 'New releases',
  cat_title: 'Category index', cat_sub: 'Nine ways into the catalog.',
  cat_count_word: 'titles',
  feat_title: 'New releases', feat_sub: "This season's selection, printed in Italy.",
  feat_viewall: 'See the full catalog',
  shelf_title: 'The shelf', shelf_sub: 'The whole catalog, spine by spine. Pull one out.',
  why_title: 'Why Nava',
  why1_h: 'Curated catalog', why1_p: "Few titles, each chosen one by one. No filler: if it's in the catalog, it earns its shelf.",
  why2_h: 'Independent', why2_p: 'No conglomerate behind us. We decide what to publish based on the books, not the trends.',
  why3_h: 'Printed in Italy', why3_p: 'Quality paper, binding and print from Italian presses. Objects made to last.',
  nl_title: 'Stay on the shelf.', nl_sub: 'One email a month: new releases, reprints, no noise.',
  nl_label: 'Email address', nl_ph: 'Your email', nl_btn: 'Subscribe',

  /* catalog */
  catpg_title: 'Catalog', catpg_sub: 'Every Nava title, in one place.',
  cat_other: 'Other categories', cat_all_titles: 'All titles in this series',
  filter_title: 'Categories', filter_all: 'All categories',
  search_label: 'Search the catalog', search_ph: 'Search title or author…',
  sort_label: 'Sort', sort_newest: 'Newest', sort_price_asc: 'Price: low to high',
  sort_price_desc: 'Price: high to low', sort_az: 'A → Z',
  results_word: 'titles', empty_msg: 'No titles found, for now.',

  /* book */
  bk_back: 'Back to catalog', bk_genre: 'Genre', bk_author_label: 'Author',
  bk_pages: 'Pages', bk_isbn: 'ISBN', bk_format: 'Format', bk_year: 'Year',
  bk_dimensions: 'Dimensions', bk_technique: 'Technique', bk_edition: 'Edition',
  bk_preview_title: 'Read a preview',
  bk_preview_msg: 'Sample pages coming soon — a preview of the book will be embedded here.',
  bk_about_author: 'About the author', bk_related: 'Related books',

  /* about */
  ab_kicker: 'About', ab_title: 'A small publisher, on purpose.',
  ab_lead: 'Nava was founded in 2019 by two stubborn readers convinced that a book should earn the space it takes up.',
  ab_story_h: 'Our story',
  ab_story_p1: 'We started in a room with two desks and a pile of manuscripts no one else wanted. We were looking for books that felt necessary, not just sellable — and we wanted them printed well, on paper that lasts.',
  ab_story_p2: "Today we publish a few dozen titles a year across nine series. We still read every manuscript to the end, and still say no almost every time. That's how the catalog stays curated.",
  ab_mission_h: 'Our mission',
  ab_mission_p: 'Publish less, but better. Treat every book as a gift-quality object: good to hold, made to stay on the shelf.',
  ab_team_h: 'The people', ab_team_sub: 'Two partners, no marketing department.',
  ab_team_photo_ph: 'Duo photo coming soon',
  ed_name: 'Edoardo', ed_role: 'Co-founder · Editorial',
  ed_bio: 'Chooses the titles, works with the authors, and reads too late at night. Before Nava he spent ten years in trade publishing.',
  lu_name: 'Luca', lu_role: 'Co-founder · Production & design',
  lu_bio: "Looks after paper, print and covers. A former typesetter, he's convinced the white of a page matters as much as the text.",
  ab_values_h: 'What we hold to',
  v1_h: "Curate, don't accumulate", v1_p: 'Better ten right books than a hundred random ones.',
  v2_h: 'Independence', v2_p: 'No shareholders to answer to but our readers.',
  v3_h: 'Made in Italy', v3_p: 'Print and binding from presses we know by name.',

  /* contact */
  ct_kicker: 'Contact', ct_title: 'Get in touch.',
  ct_lead: "For press, foreign rights, or to pitch us a manuscript: we're here.",
  ct_form_h: 'Send us a message',
  ct_name: 'Name', ct_email: 'Email', ct_message: 'Message',
  ct_name_ph: 'Your name', ct_email_ph: 'Your email', ct_msg_ph: 'How can we help?',
  ct_send: 'Send message', ct_success: "Thanks — we'll be in touch soon.",
  ct_error: 'Please check the highlighted fields and try again.',
  ct_direct_h: 'Direct',
  ct_press_h: 'Press', ct_press: 'stampa@navaeditore.com',
  ct_rights_h: 'Foreign rights', ct_rights: 'diritti@navaeditore.com',
  ct_subs_h: 'Manuscripts', ct_subs: 'manoscritti@navaeditore.com',
  ct_social_h: 'Social',

  /* legal */
  legal_updated: 'Last updated',
  legal_en_note: 'This page is currently available in Italian only.',

  /* 404 */
  nf_title: 'Page not found.',
  nf_msg: "The page you were after isn't (any longer) on the shelf.",
  nf_home: 'Back home', nf_catalog: 'Go to the catalog',
};
