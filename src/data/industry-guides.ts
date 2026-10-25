// Guides métier : ce qui distingue vraiment la facturation de chaque métier.
//
// Octobre 2026 : les 37 pages /industries/* faisaient ~420 mots presque
// identiques. On enrichit en priorité les métiers qui ont déjà des
// impressions dans Search Console (export du 28/06 au 27/09/2026) : un
// exemple de devis propre au métier, les règles qui ne s'appliquent qu'à lui
// (chacune avec sa source officielle), une FAQ (→ FAQPage) et les articles à lire.
//
// Règles d'écriture : aucun prix, aucune moyenne, aucun chiffre qui ne vient
// pas d'un texte cité. Les quantités des exemples sont des exemples.
// `intro` seulement pour les métiers absents de industry-content.ts.

type L = { fr: string; en: string; es: string };
type Source = { label: string; url: string };

export type IndustryGuide = {
  intro?: L;
  /** Exemple de devis : la phrase dictée, puis les lignes que Robi prépare (sans prix). */
  quote: { said: L; lines: L[]; note: L };
  /** Règles propres au métier, chacune sourcée. */
  rules: { title: L; text: L; source: Source }[];
  faq: { q: L; a: L }[];
  /** Articles du blog (slug français = route interne) avec leur intitulé. */
  articles: { slug: string; label: L }[];
};

// ─── Sources officielles (vérifiées le 25/10/2026) ───
const S = {
  santeTva: { label: "BOFiP, BOI-TVA-CHAMP-30-10-20-10 (art. 261, 4-1° du CGI)", url: "https://bofip.impots.gouv.fr/bofip/1139-PGP.html" },
  franchise: { label: "Entreprendre.Service-Public.fr, franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746" },
  mentions: { label: "Entreprendre.Service-Public.fr, mentions obligatoires sur une facture", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808" },
  depannage: { label: "INC, arrêté du 24 janvier 2017 (dépannage, réparation, entretien)", url: "https://www.inc-conso.fr/content/prestations-de-depannage-de-reparation-et-dentretien-une-meilleure-information-sur-les-prix" },
  tvaTravaux: { label: "CAPEB, TVA réduite : fin des attestations clients (art. 279-0 bis et 278-0 bis A du CGI)", url: "https://www.capeb.fr/actualites/travaux-dans-les-logements-de-plus-de-2-ans-suppression-des-attestations-des-clients" },
  decennale: { label: "Légifrance, Code des assurances, livre II (art. L. 243-2)", url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006128442" },
  rge: { label: "France Rénov', MaPrimeRénov' par geste", url: "https://france-renov.gouv.fr/aides/mpr" },
  avocat: { label: "Légifrance, loi n° 71-1130 du 31 décembre 1971, art. 10", url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000031008982" },
  expertComptable: { label: "Légifrance, décret n° 2012-432 du 30 mars 2012, art. 151", url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000046882378" },
  traiteurTva: { label: "Entreprendre.Service-Public.fr, taux de TVA des produits alimentaires et boissons", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F22399" },
  traiteurBofip: { label: "BOFiP, BOI-TVA-LIQ-30-10-10 (ventes à emporter de produits alimentaires)", url: "https://bofip.impots.gouv.fr/bofip/2033-PGP.html/identifiant=BOI-TVA-LIQ-30-10-10-20201014" },
} satisfies Record<string, Source>;

// ─── Articles du blog réutilisés ───
const A = {
  mentions: { slug: "mentions-obligatoires-facture", label: { fr: "Les mentions obligatoires d'une facture", en: "Mandatory information on an invoice", es: "Los datos obligatorios de una factura" } },
  tva293b: { slug: "mention-tva-facture-2026-293b-cibs", label: { fr: "La mention TVA non applicable : 293 B puis CIBS", en: "The French VAT exemption mention: 293 B then CIBS", es: "La mención de exención de IVA: 293 B y luego CIBS" } },
  devis: { slug: "comment-faire-un-devis-auto-entrepreneur", label: { fr: "Comment faire un devis en auto-entrepreneur", en: "How to write a quote as a French sole trader", es: "Cómo hacer un presupuesto como autónomo en Francia" } },
  relance: { slug: "relancer-client-impaye", label: { fr: "Relancer un client qui ne paie pas", en: "How to chase an unpaid invoice", es: "Cómo reclamar una factura impagada" } },
  reforme: { slug: "facturation-electronique-2026-auto-entrepreneur", label: { fr: "Facture électronique 2026 : le guide auto-entrepreneur", en: "French e-invoicing 2026: the self-employed guide", es: "Factura electrónica en Francia 2026: guía para autónomos" } },
  vocale: { slug: "facture-vocale-creer-en-parlant", label: { fr: "La facture vocale : créer une facture en parlant", en: "Voice invoicing: create an invoice by speaking", es: "La factura por voz: crear una factura hablando" } },
  ia: { slug: "logiciel-gestion-factures-ia", label: { fr: "Logiciel de gestion des factures avec IA : le guide", en: "AI invoice management software: the guide", es: "Software de gestión de facturas con IA: la guía" } },
  premier: { slug: "comment-facturer-premier-client", label: { fr: "Facturer son premier client", en: "How to invoice your first client", es: "Cómo facturar a tu primer cliente" } },
  facturx: { slug: "factur-x-c-est-quoi-format-facture-electronique", label: { fr: "Factur-X, c'est quoi ?", en: "What is Factur-X?", es: "¿Qué es Factur-X?" } },
} as const;

// ─── Briques communes au bâtiment (le texte de chaque métier reste propre) ───
const ruleDepannage: IndustryGuide["rules"][number] = {
  title: { fr: "Devis obligatoire en dépannage, dès le premier euro", en: "A quote is required for call-outs, whatever the amount", es: "Presupuesto obligatorio en reparaciones, sea cual sea el importe" },
  text: {
    fr: "Pour un dépannage, une réparation ou un entretien chez un particulier, l'arrêté du 24 janvier 2017 (en vigueur depuis le 1er avril 2017) impose un devis détaillé avant l'intervention, quel que soit le montant : taux horaire de main-d'œuvre et temps estimé, désignation et prix des pièces, frais de déplacement, et la précision « devis gratuit » ou « devis payant ».",
    en: "In France, for any repair, call-out or maintenance job at a private customer's home, the order of 24 January 2017 (in force since 1 April 2017) requires a detailed quote before work starts, whatever the amount: hourly labour rate and estimated time, parts and their prices, travel costs, and whether the quote itself is free or paid.",
    es: "En Francia, para cualquier reparación o mantenimiento en casa de un particular, la orden del 24 de enero de 2017 (vigente desde el 1 de abril de 2017) exige un presupuesto detallado antes de intervenir, sea cual sea el importe: tarifa horaria y tiempo estimado, piezas y precios, desplazamiento, y si el presupuesto es gratuito o de pago.",
  },
  source: S.depannage,
};
const ruleTvaTravaux: IndustryGuide["rules"][number] = {
  title: { fr: "TVA à 10 % ou 5,5 % : une mention remplace l'attestation", en: "10% or 5.5% VAT: a statement replaces the old certificate", es: "IVA al 10 % o 5,5 %: una mención sustituye al certificado" },
  text: {
    fr: "Dans un logement achevé depuis plus de deux ans, les travaux peuvent relever du taux de 10 % (art. 279-0 bis du CGI), ou de 5,5 % pour l'amélioration de la performance énergétique (art. 278-0 bis A). Depuis 2025, le client ne remplit plus d'attestation Cerfa : c'est une mention sur le devis ou la facture signés qui la remplace, et tu conserves ces documents avec ta comptabilité.",
    en: "In France, work on a home completed more than two years ago can qualify for 10% VAT (art. 279-0 bis CGI), or 5.5% for energy-efficiency improvements (art. 278-0 bis A). Since 2025 the customer no longer fills in a Cerfa certificate: a statement on the signed quote or invoice replaces it, and you keep those documents with your books.",
    es: "En Francia, las obras en una vivienda terminada hace más de dos años pueden tributar al 10 % (art. 279-0 bis CGI), o al 5,5 % si mejoran la eficiencia energética (art. 278-0 bis A). Desde 2025 el cliente ya no rellena el certificado Cerfa: lo sustituye una mención en el presupuesto o la factura firmados, que conservas con tu contabilidad.",
  },
  source: S.tvaTravaux,
};
const ruleDecennale: IndustryGuide["rules"][number] = {
  title: { fr: "L'attestation décennale jointe au devis et à la facture", en: "Decennial insurance certificate attached to quotes and invoices", es: "Certificado de seguro decenal adjunto a presupuestos y facturas" },
  text: {
    fr: "Pour les travaux de bâtiment soumis à l'assurance de responsabilité décennale, l'article L. 243-2 du Code des assurances impose de joindre ton attestation d'assurance à tes devis et à tes factures. Garde-la à jour : c'est souvent la première chose qu'un client vérifie.",
    en: "In France, for building work subject to decennial liability insurance, article L. 243-2 of the Insurance Code requires you to attach your insurance certificate to your quotes and invoices. Keep it up to date: clients often check it first.",
    es: "En Francia, para obras sujetas al seguro de responsabilidad decenal, el artículo L. 243-2 del Código de Seguros obliga a adjuntar el certificado de seguro a presupuestos y facturas. Mantenlo al día: es lo primero que suele comprobar el cliente.",
  },
  source: S.decennale,
};
const ruleSanteExo = (who: L): IndustryGuide["rules"][number] => ({
  title: { fr: "Soins exonérés de TVA : la mention à porter", en: "VAT-exempt care: the statement to include", es: "Cuidados exentos de IVA: la mención que debe figurar" },
  text: {
    fr: `${who.fr} L'exonération porte sur les soins : la facture ou la note d'honoraires indique alors « Exonération de TVA, article 261-4-1° du CGI », et non la mention de franchise en base. Une prestation qui n'est pas un soin (formation, atelier en entreprise, vente de produits) suit la TVA de droit commun ou ta franchise.`,
    en: `${who.en} The exemption covers care: the invoice then reads « Exonération de TVA, article 261-4-1° du CGI », not the small-business exemption statement. Anything that isn't care (training, corporate workshops, product sales) follows standard VAT or your small-business exemption.`,
    es: `${who.es} La exención cubre los cuidados: la factura lleva entonces « Exonération de TVA, article 261-4-1° du CGI », no la mención de franquicia. Lo que no es un cuidado (formación, talleres en empresa, venta de productos) sigue el IVA general o tu franquicia.`,
  },
  source: S.santeTva,
});

export const industryGuides: Record<string, IndustryGuide> = {
  // ───────────────────────── Bien-être & santé ─────────────────────────
  sophrologue: {
    quote: {
      said: {
        fr: "« Devis pour Atelier Nova : trois ateliers de gestion du stress d'une heure trente pour leurs équipes, douze participants maximum, plus le support remis à chaque participant. »",
        en: "« Quote for Atelier Nova: three 90-minute stress-management workshops for their teams, twelve participants max, plus the handout given to each participant. »",
        es: "« Presupuesto para Atelier Nova: tres talleres de gestión del estrés de hora y media para sus equipos, doce participantes como máximo, más el material entregado a cada participante. »",
      },
      lines: [
        { fr: "Atelier collectif de sophrologie, gestion du stress — 1 h 30 · 3 séances", en: "Group sophrology workshop, stress management — 90 min · 3 sessions", es: "Taller grupal de sofrología, gestión del estrés — 1 h 30 · 3 sesiones" },
        { fr: "Support d'exercices remis aux participants · 12 exemplaires", en: "Exercise handout for participants · 12 copies", es: "Material de ejercicios para los participantes · 12 ejemplares" },
        { fr: "Conditions : dates à fixer avec le service RH, acompte à la signature", en: "Terms: dates to agree with HR, deposit on signature", es: "Condiciones: fechas a fijar con RR. HH., anticipo a la firma" },
      ],
      note: {
        fr: "Les séances individuelles d'un particulier et les ateliers d'une entreprise ne se mélangent pas : deux clients, deux documents. Pour l'entreprise, Robi reprend son SIREN et son adresse de facturation.",
        en: "A private client's sessions and a company's workshops never share a document: two clients, two documents. For the company, Robi carries over its registration number and billing address.",
        es: "Las sesiones de un particular y los talleres de una empresa no comparten documento: dos clientes, dos documentos. Para la empresa, Robi incluye su número de registro y dirección de facturación.",
      },
    },
    rules: [
      {
        title: { fr: "Pas d'exonération « santé » de la TVA", en: "No healthcare VAT exemption", es: "Sin exención sanitaria del IVA" },
        text: {
          fr: "La sophrologie n'est pas une profession de santé réglementée : elle n'entre pas dans l'exonération de l'article 261-4-1° du CGI, réservée aux médecins, aux professions paramédicales réglementées et aux titres protégés (ostéopathe, psychologue, psychothérapeute…). Tu factures donc avec TVA, ou sans TVA si tu relèves de la franchise en base, avec la mention correspondante.",
          en: "In France, sophrology isn't a regulated health profession: it falls outside the article 261-4-1° CGI exemption, which is reserved for doctors, regulated paramedical professions and protected titles (osteopath, psychologist, psychotherapist…). You therefore charge VAT, or no VAT if you're under the small-business exemption, with the matching statement.",
          es: "En Francia, la sofrología no es una profesión sanitaria regulada: queda fuera de la exención del artículo 261-4-1° del CGI, reservada a médicos, profesiones paramédicas reguladas y títulos protegidos (osteópata, psicólogo…). Facturas con IVA, o sin IVA si estás en franquicia, con la mención correspondiente.",
        },
        source: S.santeTva,
      },
      {
        title: { fr: "La mention de franchise, si tu en relèves", en: "The small-business exemption statement", es: "La mención de franquicia, si te aplica" },
        text: {
          fr: "Sous les seuils de la franchise en base, chaque facture porte la mention de non-application de la TVA. Son libellé change avec le passage au Code des impôts sur les biens et services : Robi imprime celle qui est en vigueur à la date de la facture.",
          en: "Below the small-business thresholds, every invoice carries the VAT non-application statement. Its wording changes with the move to the new French goods-and-services tax code: Robi prints the one in force on the invoice date.",
          es: "Por debajo de los umbrales de franquicia, cada factura lleva la mención de no aplicación del IVA. Su redacción cambia con el nuevo código francés de impuestos sobre bienes y servicios: Robi imprime la vigente en la fecha de la factura.",
        },
        source: S.franchise,
      },
    ],
    faq: [
      {
        q: { fr: "Facture ou note d'honoraires : que remettre après une séance de sophrologie ?", en: "Invoice or fee note after a sophrology session?", es: "¿Factura o nota de honorarios tras una sesión de sofrología?" },
        a: { fr: "Les deux désignent le même document : un numéro unique, la date, ton identité, la prestation et le montant. Beaucoup de clients le demandent pour leur mutuelle, qui peut rembourser certaines séances selon son contrat : décris la séance clairement, sans vocabulaire médical.", en: "Both mean the same document: a unique number, the date, your details, the service and the amount. Many clients ask for it for their health insurer, which may refund some sessions depending on their policy: describe the session clearly, without medical wording.", es: "Ambos son el mismo documento: número único, fecha, tus datos, la prestación y el importe. Muchos clientes lo piden para su mutua, que puede reembolsar algunas sesiones según su contrato: describe la sesión con claridad, sin vocabulario médico." },
      },
    ],
    articles: [A.tva293b, A.mentions, A.vocale],
  },

  naturopathe: {
    intro: {
      fr: "Bilan de vitalité, séances de suivi, conseils en hygiène de vie, parfois vente de compléments ou ateliers collectifs : un naturopathe facture des prestations de natures différentes, à des particuliers surtout. Le piège est de croire que tout cela est exonéré de TVA comme une consultation médicale. Robi AI te laisse dicter la séance juste après le rendez-vous et sort une facture claire, avec la bonne mention, que ton client peut transmettre à sa mutuelle.",
      en: "Vitality assessments, follow-up sessions, lifestyle advice, sometimes supplement sales or group workshops: a naturopath invoices services of different kinds, mostly to individuals. The trap is assuming it's all VAT-exempt like a medical consultation. Robi AI lets you dictate the session right after the appointment and produces a clear invoice with the right statement, ready for the client's insurer.",
      es: "Balance de vitalidad, sesiones de seguimiento, consejos de higiene de vida, a veces venta de complementos o talleres: un naturópata factura prestaciones distintas, sobre todo a particulares. La trampa es creer que todo está exento de IVA como una consulta médica. Robi AI te deja dictar la sesión justo después de la cita y genera una factura clara con la mención correcta.",
    },
    quote: {
      said: {
        fr: "« Facture pour Julie Morel : bilan de vitalité d'une heure trente aujourd'hui, et le programme écrit que je lui envoie par mail. »",
        en: "« Invoice for Julie Morel: 90-minute vitality assessment today, plus the written programme I'm emailing her. »",
        es: "« Factura para Julie Morel: balance de vitalidad de hora y media hoy, y el programa escrito que le envío por correo. »",
      },
      lines: [
        { fr: "Bilan de vitalité en naturopathie — 1 h 30", en: "Naturopathy vitality assessment — 90 min", es: "Balance de vitalidad en naturopatía — 1 h 30" },
        { fr: "Programme d'hygiène de vie personnalisé, remis par écrit", en: "Personalised written lifestyle programme", es: "Programa de higiene de vida personalizado, por escrito" },
      ],
      note: {
        fr: "Si tu vends aussi des produits, ajoute-les sur des lignes à part : une vente de marchandise n'est pas une prestation, et Robi applique à chaque ligne son propre taux de TVA.",
        en: "If you also sell products, put them on separate lines: a sale of goods isn't a service, and Robi applies each line's own VAT rate.",
        es: "Si también vendes productos, ponlos en líneas aparte: una venta de mercancía no es una prestación, y Robi aplica a cada línea su propio tipo de IVA.",
      },
    },
    rules: [
      {
        title: { fr: "La naturopathie n'est pas exonérée de TVA", en: "Naturopathy isn't VAT-exempt", es: "La naturopatía no está exenta de IVA" },
        text: {
          fr: "L'exonération des soins (art. 261-4-1° du CGI) vise les médecins, les professions paramédicales réglementées et quelques titres protégés comme ostéopathe ou psychologue. Le naturopathe n'en fait pas partie : il applique la TVA de droit commun, ou la franchise en base s'il est sous les seuils.",
          en: "In France, the care exemption (art. 261-4-1° CGI) covers doctors, regulated paramedical professions and a few protected titles such as osteopath or psychologist. Naturopaths aren't included: standard VAT applies, or the small-business exemption below the thresholds.",
          es: "En Francia, la exención de los cuidados (art. 261-4-1° CGI) cubre a médicos, profesiones paramédicas reguladas y algunos títulos protegidos como osteópata o psicólogo. El naturópata no está incluido: aplica el IVA general o la franquicia por debajo de los umbrales.",
        },
        source: S.santeTva,
      },
      {
        title: { fr: "Des mots justes sur la facture", en: "The right words on the invoice", es: "Las palabras correctas en la factura" },
        text: {
          fr: "La facture décrit précisément la prestation réalisée : « séance de naturopathie », « bilan de vitalité », pas « consultation » ni « traitement ». C'est aussi ce que la mutuelle de ton client lira. Les autres mentions sont celles de toute facture : numéro, date, identité, SIREN, détail et total.",
          en: "The invoice describes exactly what was done: « naturopathy session », « vitality assessment », not « consultation » or « treatment ». That's also what the client's insurer will read. The other details are those of any French invoice: number, date, identity, registration number, breakdown and total.",
          es: "La factura describe con precisión la prestación: « sesión de naturopatía », « balance de vitalidad », no « consulta » ni « tratamiento ». Es lo que leerá la mutua de tu cliente. El resto son los datos de cualquier factura: número, fecha, identidad, registro, detalle y total.",
        },
        source: S.mentions,
      },
    ],
    faq: [
      {
        q: { fr: "Quel logiciel de facturation pour un naturopathe ?", en: "Which invoicing software for a naturopath?", es: "¿Qué software de facturación para un naturópata?" },
        a: { fr: "Un outil qui sépare les séances et les ventes de produits, applique la bonne TVA ligne par ligne et produit une facture lisible pour la mutuelle. Avec Robi, tu dictes la séance en sortant du rendez-vous et la facture part dans la foulée.", en: "One that separates sessions from product sales, applies the right VAT per line and produces an invoice the insurer can read. With Robi you dictate the session as you leave the appointment and send the invoice straight away.", es: "Uno que separe sesiones y ventas de productos, aplique el IVA correcto por línea y genere una factura legible para la mutua. Con Robi dictas la sesión al salir de la cita y envías la factura al momento." },
      },
      {
        q: { fr: "Un naturopathe doit-il facturer la TVA ?", en: "Does a naturopath charge VAT?", es: "¿Un naturópata cobra IVA?" },
        a: { fr: "Oui, sauf s'il relève de la franchise en base : la naturopathie ne fait pas partie des soins exonérés par l'article 261-4-1° du CGI. Sous les seuils de la franchise, la facture porte la mention de TVA non applicable.", en: "Yes, unless under the small-business exemption: naturopathy isn't among the care services exempted by article 261-4-1° CGI. Below the thresholds, the invoice carries the VAT non-application statement.", es: "Sí, salvo en franquicia: la naturopatía no está entre los cuidados exentos por el artículo 261-4-1° del CGI. Por debajo de los umbrales, la factura lleva la mención de IVA no aplicable." },
      },
      {
        q: { fr: "Comment facturer un forfait de plusieurs séances ?", en: "How do I invoice a multi-session package?", es: "¿Cómo facturar un bono de varias sesiones?" },
        a: { fr: "Une facture pour le forfait entier, en précisant le nombre de séances, ou un acompte puis le solde. Robi garde l'historique du client, tu vois d'un coup d'œil ce qui reste à régler.", en: "One invoice for the whole package, stating the number of sessions, or a deposit then the balance. Robi keeps the client's history so you can see what's still due.", es: "Una factura por el bono completo, indicando el número de sesiones, o un anticipo y luego el saldo. Robi guarda el histórico del cliente." },
      },
    ],
    articles: [A.tva293b, A.mentions, A.premier],
  },

  osteopathe: {
    quote: {
      said: {
        fr: "« Devis pour la société Atelier Bois : une demi-journée de prévention des troubles musculo-squelettiques pour l'équipe de l'atelier, avec un atelier collectif et des consultations individuelles l'après-midi. »",
        en: "« Quote for Atelier Bois: a half-day on preventing musculoskeletal disorders for the workshop team, with a group session and individual consultations in the afternoon. »",
        es: "« Presupuesto para Atelier Bois: media jornada de prevención de trastornos musculoesqueléticos para el equipo del taller, con un taller grupal y consultas individuales por la tarde. »",
      },
      lines: [
        { fr: "Atelier collectif de prévention des TMS — postures et gestes au poste", en: "Group session on preventing musculoskeletal disorders — posture at work", es: "Taller grupal de prevención de TME — posturas en el puesto" },
        { fr: "Consultations individuelles d'ostéopathie · nombre selon inscriptions", en: "Individual osteopathy consultations · number as booked", es: "Consultas individuales de osteopatía · número según inscripciones" },
        { fr: "Frais de déplacement sur site", en: "On-site travel costs", es: "Gastos de desplazamiento" },
      ],
      note: {
        fr: "Les consultations relèvent des soins exonérés ; l'atelier de prévention n'est pas forcément un soin. Une ligne par nature de prestation, chacune avec sa TVA : c'est ce qui rend ta facture défendable.",
        en: "Consultations are VAT-exempt care; a prevention workshop isn't necessarily care. One line per type of service, each with its own VAT, keeps your invoice defensible.",
        es: "Las consultas son cuidados exentos; un taller de prevención no es necesariamente un cuidado. Una línea por tipo de prestación, cada una con su IVA.",
      },
    },
    rules: [
      ruleSanteExo({
        fr: "Les praticiens autorisés à faire usage du titre d'ostéopathe sont cités par l'administration fiscale parmi les soins exonérés de TVA.",
        en: "In France, practitioners legally entitled to the osteopath title are listed by the tax authority among VAT-exempt care providers.",
        es: "En Francia, los profesionales autorizados a usar el título de osteópata figuran entre los cuidados exentos de IVA.",
      }),
    ],
    faq: [
      {
        q: { fr: "Quelle mention TVA sur une facture d'ostéopathe ?", en: "Which VAT statement on an osteopath's invoice?", es: "¿Qué mención de IVA en una factura de osteópata?" },
        a: { fr: "Pour les consultations : « Exonération de TVA, article 261-4-1° du CGI ». Ce n'est pas la mention de franchise en base, qui concerne les petites entreprises sous les seuils. Enregistre-la une fois dans le pied de page de Robi, elle figure ensuite sur chaque facture.", en: "For consultations: « Exonération de TVA, article 261-4-1° du CGI ». It isn't the small-business exemption statement. Save it once in Robi's document footer and it appears on every invoice.", es: "Para las consultas: « Exonération de TVA, article 261-4-1° du CGI ». No es la mención de franquicia. Guárdala una vez en el pie de página de Robi y aparecerá en cada factura." },
      },
      {
        q: { fr: "Faut-il émettre une facture électronique pour un patient ?", en: "Do I need to e-invoice a patient?", es: "¿Hay que emitir factura electrónica a un paciente?" },
        a: { fr: "La facturation électronique vise les échanges entre entreprises assujetties à la TVA. Les consultations de particuliers n'y passent pas ; une intervention facturée à une entreprise, elle, suit le calendrier de la réforme.", en: "French e-invoicing covers transactions between VAT-registered businesses. Consultations for individuals aren't included; a service billed to a company follows the reform timeline.", es: "La facturación electrónica francesa cubre las operaciones entre empresas sujetas al IVA. Las consultas de particulares no entran; un servicio facturado a una empresa sigue el calendario de la reforma." },
      },
    ],
    articles: [A.mentions, A.reforme, A.vocale],
  },

  kinesitherapeute: {
    intro: {
      fr: "Un kinésithérapeute facture rarement comme un freelance : une grande partie des séances passe par l'Assurance Maladie. Restent tout ce qui sort du circuit des remboursements : dépassements, séances non prescrites, prévention en entreprise, interventions auprès d'un club sportif, formations. C'est là que les factures se font souvent à la main, le soir. Robi AI les prépare en quelques secondes à partir de ta voix, avec la bonne mention de TVA selon qu'il s'agit d'un soin ou non.",
      en: "A physiotherapist rarely invoices like a freelancer: in France most sessions go through national health insurance. What's left is everything outside reimbursement: extra fees, sessions without prescription, workplace prevention, work with a sports club, training. That's where invoices get done by hand in the evening. Robi AI prepares them in seconds from your voice, with the right VAT statement depending on whether it's care or not.",
      es: "Un fisioterapeuta rara vez factura como un freelance: en Francia gran parte de las sesiones pasan por la Seguridad Social. Queda todo lo que sale del circuito de reembolsos: sesiones sin receta, prevención en empresa, trabajo con un club deportivo, formaciones. Ahí las facturas se hacen a mano por la noche. Robi AI las prepara en segundos a partir de tu voz, con la mención de IVA correcta.",
    },
    quote: {
      said: {
        fr: "« Devis pour le club de handball de Montreuil : suivi kiné de l'équipe senior le mardi soir sur la saison, plus deux séances de prévention des blessures pour les éducateurs. »",
        en: "« Quote for the Montreuil handball club: physio follow-up of the senior team on Tuesday evenings for the season, plus two injury-prevention sessions for the coaches. »",
        es: "« Presupuesto para el club de balonmano de Montreuil: seguimiento de fisioterapia del equipo sénior los martes por la noche durante la temporada, más dos sesiones de prevención de lesiones para los entrenadores. »",
      },
      lines: [
        { fr: "Séances de kinésithérapie, équipe senior — mardi soir, saison en cours", en: "Physiotherapy sessions, senior team — Tuesday evenings, current season", es: "Sesiones de fisioterapia, equipo sénior — martes por la noche, temporada en curso" },
        { fr: "Formation des éducateurs à la prévention des blessures · 2 séances", en: "Injury-prevention training for coaches · 2 sessions", es: "Formación en prevención de lesiones para entrenadores · 2 sesiones" },
      ],
      note: {
        fr: "Les soins et la formation n'ont pas le même régime de TVA : Robi les garde sur des lignes séparées, chacune avec son taux.",
        en: "Care and training don't share the same VAT treatment: Robi keeps them on separate lines, each with its rate.",
        es: "Los cuidados y la formación no tienen el mismo régimen de IVA: Robi los mantiene en líneas separadas, cada una con su tipo.",
      },
    },
    rules: [
      ruleSanteExo({
        fr: "Les masseurs-kinésithérapeutes sont une profession paramédicale réglementée : leurs soins entrent dans l'exonération de TVA de l'article 261-4-1° du CGI.",
        en: "In France, physiotherapists are a regulated paramedical profession: their care falls under the article 261-4-1° CGI VAT exemption.",
        es: "En Francia, los fisioterapeutas son una profesión paramédica regulada: sus cuidados entran en la exención de IVA del artículo 261-4-1° del CGI.",
      }),
    ],
    faq: [
      {
        q: { fr: "Un kiné peut-il utiliser un logiciel de facturation classique ?", en: "Can a physio use ordinary invoicing software?", es: "¿Un fisioterapeuta puede usar un software de facturación normal?" },
        a: { fr: "Pour les séances remboursées, non : elles passent par la télétransmission de l'Assurance Maladie et ton logiciel métier. Pour tout le reste (clubs, entreprises, séances hors nomenclature, formations), un outil comme Robi suffit et va plus vite.", en: "Not for reimbursed sessions: in France they go through health-insurance teletransmission and your practice software. For everything else (clubs, companies, non-reimbursed sessions, training), a tool like Robi is enough and faster.", es: "No para las sesiones reembolsadas: en Francia pasan por la teletransmisión de la Seguridad Social. Para todo lo demás (clubes, empresas, sesiones no reembolsadas, formaciones), una herramienta como Robi basta y es más rápida." },
      },
      {
        q: { fr: "Quelle TVA sur une formation donnée par un kiné ?", en: "What VAT on training given by a physio?", es: "¿Qué IVA en una formación impartida por un fisioterapeuta?" },
        a: { fr: "Une formation n'est pas un soin : elle ne profite pas de l'exonération de l'article 261-4-1°. Elle suit la TVA de droit commun ou ta franchise en base, sauf régime propre à la formation professionnelle dont tu relèverais : vérifie-le avec ton comptable.", en: "Training isn't care, so it doesn't benefit from the article 261-4-1° exemption. It follows standard VAT or your small-business exemption, unless a specific vocational-training regime applies to you: check with your accountant.", es: "Una formación no es un cuidado: no se beneficia de la exención del 261-4-1°. Sigue el IVA general o tu franquicia, salvo régimen propio de formación profesional: compruébalo con tu gestor." },
      },
      {
        q: { fr: "Comment facturer un club ou une entreprise ?", en: "How do I invoice a club or a company?", es: "¿Cómo facturar a un club o una empresa?" },
        a: { fr: "Une facture avec le nom et l'adresse du club ou de l'entreprise, son SIREN s'il en a un, la période couverte et le détail des séances. Robi l'envoie avec un lien de paiement et relance si elle n'est pas réglée.", en: "An invoice with the club's or company's name, address and registration number if any, the period covered and the session breakdown. Robi sends it with a payment link and follows up if it's unpaid.", es: "Una factura con el nombre, dirección y número de registro del club o empresa, el periodo y el detalle de sesiones. Robi la envía con enlace de pago y reclama si no se paga." },
      },
    ],
    articles: [A.mentions, A.relance, A.reforme],
  },

  psychologue: {
    intro: {
      fr: "Séances individuelles, thérapies de couple, bilans, supervision de collègues, interventions en entreprise ou en établissement : un psychologue libéral facture des formats variés, à des patients comme à des structures. La confidentialité compte jusque dans la facture, qui doit rester sobre. Robi AI te laisse dicter la séance en une phrase, garde un intitulé neutre et applique la mention d'exonération de TVA propre à ton titre.",
      en: "Individual sessions, couples therapy, assessments, peer supervision, interventions in companies or institutions: a private-practice psychologist invoices many formats, to patients and organisations alike. Confidentiality matters right down to the invoice, which should stay discreet. Robi AI lets you dictate the session in one sentence, keeps a neutral description and applies the VAT exemption statement tied to your title.",
      es: "Sesiones individuales, terapia de pareja, evaluaciones, supervisión, intervenciones en empresas o centros: un psicólogo en consulta privada factura formatos variados, a pacientes y a organizaciones. La confidencialidad cuenta hasta en la factura, que debe ser sobria. Robi AI te deja dictar la sesión en una frase, mantiene una descripción neutra y aplica la mención de exención de IVA.",
    },
    quote: {
      said: {
        fr: "« Devis pour la clinique Saint-Roch : supervision mensuelle de l'équipe soignante, une séance de deux heures par mois de janvier à juin. »",
        en: "« Quote for the Saint-Roch clinic: monthly supervision of the care team, one two-hour session a month from January to June. »",
        es: "« Presupuesto para la clínica Saint-Roch: supervisión mensual del equipo sanitario, una sesión de dos horas al mes de enero a junio. »",
      },
      lines: [
        { fr: "Supervision d'équipe — séance de 2 h · 1 par mois, de janvier à juin", en: "Team supervision — 2-hour session · monthly, January to June", es: "Supervisión de equipo — sesión de 2 h · mensual, de enero a junio" },
        { fr: "Facturation mensuelle à l'issue de chaque séance", en: "Invoiced monthly after each session", es: "Facturación mensual tras cada sesión" },
      ],
      note: {
        fr: "Pour un patient, l'intitulé reste « Séance de psychologie » avec la date : jamais de motif de consultation sur une facture.",
        en: "For a patient, the description stays « Psychology session » with the date: never the reason for consultation on an invoice.",
        es: "Para un paciente, la descripción es « Sesión de psicología » con la fecha: nunca el motivo de consulta en una factura.",
      },
    },
    rules: [
      ruleSanteExo({
        fr: "Les praticiens autorisés à faire usage du titre de psychologue ou de psychothérapeute figurent parmi les soins exonérés de TVA cités par l'administration fiscale.",
        en: "In France, practitioners legally entitled to the psychologist or psychotherapist title are listed among VAT-exempt care providers.",
        es: "En Francia, los profesionales autorizados a usar el título de psicólogo o psicoterapeuta figuran entre los cuidados exentos de IVA.",
      }),
    ],
    faq: [
      {
        q: { fr: "Que mettre sur une facture de psychologue ?", en: "What goes on a psychologist's invoice?", es: "¿Qué poner en una factura de psicólogo?" },
        a: { fr: "Ton identité et ton SIREN, le nom du patient ou de la structure, la date, « Séance de psychologie » et le montant, avec la mention « Exonération de TVA, article 261-4-1° du CGI » pour les soins. Rien sur le contenu de la séance.", en: "Your identity and registration number, the patient's or organisation's name, the date, « Psychology session » and the amount, with « Exonération de TVA, article 261-4-1° du CGI » for care. Nothing about the session's content.", es: "Tu identidad y registro, el nombre del paciente o de la entidad, la fecha, « Sesión de psicología » y el importe, con « Exonération de TVA, article 261-4-1° du CGI » para los cuidados. Nada sobre el contenido." },
      },
      {
        q: { fr: "La supervision ou la formation sont-elles exonérées de TVA ?", en: "Are supervision and training VAT-exempt?", es: "¿La supervisión o la formación están exentas de IVA?" },
        a: { fr: "L'exonération vise les soins à la personne. Une supervision d'équipe ou une formation n'en est pas forcément un : son régime de TVA se vérifie au cas par cas avec ton comptable. Dans Robi, chaque ligne peut porter son propre taux.", en: "The exemption covers personal care. Team supervision or training isn't necessarily care: check its VAT treatment case by case with your accountant. In Robi, each line can carry its own rate.", es: "La exención cubre los cuidados a la persona. Una supervisión o formación no lo es necesariamente: compruébalo con tu gestor. En Robi, cada línea puede llevar su propio tipo." },
      },
    ],
    articles: [A.mentions, A.premier, A.relance],
  },

  // ───────────────────────── Professions du droit et du chiffre ─────────────────────────
  avocat: {
    intro: {
      fr: "Un avocat ne facture pas « une prestation » mais des diligences : consultations, rédaction d'actes, audiences, déplacements, frais avancés pour le client. Au forfait, au temps passé, avec parfois un honoraire de résultat. Le tout encadré par une convention d'honoraires signée en amont. Robi AI ne remplace pas ton logiciel de cabinet pour la gestion des dossiers ; il te fait gagner le temps de la facture : tu dictes les diligences de la semaine, il les met en forme, numérote et envoie.",
      en: "A lawyer doesn't invoice « a service » but work done: consultations, drafting, hearings, travel, costs advanced for the client. Flat fee, time spent, sometimes a success fee, all framed in France by a fee agreement signed upfront. Robi AI doesn't replace your practice-management software; it saves the time spent on the invoice itself: dictate the week's work, it formats, numbers and sends it.",
      es: "Un abogado no factura « una prestación » sino diligencias: consultas, redacción, audiencias, desplazamientos, gastos adelantados. A tanto alzado, por tiempo, a veces con honorario de resultado, todo enmarcado en Francia por un convenio de honorarios previo. Robi AI no sustituye tu software de despacho; te ahorra el tiempo de la factura: dictas las diligencias y la formatea, numera y envía.",
    },
    quote: {
      said: {
        fr: "« Facture pour la société Kerlan, dossier bail commercial : consultation initiale, rédaction de la mise en demeure, trois heures de recherches et le déplacement au tribunal de commerce, selon la convention du 2 septembre. »",
        en: "« Invoice for Kerlan, commercial lease file: initial consultation, drafting the formal notice, three hours of research and the trip to the commercial court, under the 2 September fee agreement. »",
        es: "« Factura para la sociedad Kerlan, expediente de arrendamiento comercial: consulta inicial, redacción del requerimiento, tres horas de investigación y el desplazamiento al tribunal mercantil, según el convenio del 2 de septiembre. »",
      },
      lines: [
        { fr: "Consultation initiale — dossier bail commercial", en: "Initial consultation — commercial lease file", es: "Consulta inicial — expediente de arrendamiento comercial" },
        { fr: "Rédaction d'une mise en demeure", en: "Drafting a formal notice", es: "Redacción de un requerimiento" },
        { fr: "Recherches et analyse · 3 h au taux horaire de la convention", en: "Research and analysis · 3 h at the agreed hourly rate", es: "Investigación y análisis · 3 h a la tarifa horaria del convenio" },
        { fr: "Frais de déplacement — tribunal de commerce", en: "Travel costs — commercial court", es: "Gastos de desplazamiento — tribunal mercantil" },
      ],
      note: {
        fr: "Les références du dossier et de la convention figurent en tête de facture : le client relie chaque ligne à ce qu'il a signé.",
        en: "The file and fee-agreement references go at the top: the client can match each line to what they signed.",
        es: "Las referencias del expediente y del convenio van en la cabecera: el cliente relaciona cada línea con lo firmado.",
      },
    },
    rules: [
      {
        title: { fr: "La convention d'honoraires écrite", en: "The written fee agreement", es: "El convenio de honorarios por escrito" },
        text: {
          fr: "Sauf urgence, force majeure ou aide juridictionnelle totale, l'avocat conclut par écrit une convention d'honoraires avec son client (art. 10 de la loi du 31 décembre 1971). Elle précise le montant ou le mode de calcul des honoraires et les frais prévisibles. Un honoraire fixé uniquement en fonction du résultat est interdit ; un honoraire de résultat complémentaire est permis.",
          en: "In France, except in emergencies, force majeure or full legal aid, a lawyer signs a written fee agreement with the client (art. 10 of the law of 31 December 1971). It sets the amount or calculation method of fees and foreseeable costs. A fee based solely on the outcome is prohibited; an additional success fee is allowed.",
          es: "En Francia, salvo urgencia, fuerza mayor o asistencia jurídica total, el abogado firma un convenio de honorarios por escrito (art. 10 de la ley del 31 de diciembre de 1971). Fija el importe o el modo de cálculo y los gastos previsibles. Un honorario basado solo en el resultado está prohibido; uno complementario de resultado está permitido.",
        },
        source: S.avocat,
      },
      {
        title: { fr: "Une facture détaillée, avec TVA", en: "A detailed invoice, with VAT", es: "Una factura detallada, con IVA" },
        text: {
          fr: "Les honoraires d'avocat sont soumis à la TVA, sauf si tu relèves de la franchise en base, qui prévoit des seuils propres aux avocats. La facture reprend les mentions de toute facture : numéro, date, identités, SIREN des deux parties pour un client professionnel, détail des diligences, total hors taxes et TVA.",
          en: "In France, lawyers' fees are subject to VAT unless you're under the small-business exemption, which has specific thresholds for lawyers. The invoice carries the usual details: number, date, both parties' identities and registration numbers for a business client, breakdown of work, net total and VAT.",
          es: "En Francia, los honorarios de abogado están sujetos a IVA salvo franquicia, que prevé umbrales propios para abogados. La factura lleva los datos habituales: número, fecha, identidades, registro de ambas partes para un cliente profesional, detalle de diligencias, total sin impuestos e IVA.",
        },
        source: S.franchise,
      },
    ],
    faq: [
      {
        q: { fr: "Quel logiciel de facturation pour un avocat indépendant ?", en: "Which invoicing software for an independent lawyer?", es: "¿Qué software de facturación para un abogado independiente?" },
        a: { fr: "Si tu as déjà un logiciel de cabinet pour les dossiers, garde-le. Si tu factures surtout au forfait ou au temps sur peu de dossiers, Robi va plus vite : tu dictes les diligences, il produit la facture conforme, le lien de paiement et les relances.", en: "If you already use practice software for files, keep it. If you mostly bill flat fees or time on a few files, Robi is faster: dictate the work, it produces the compliant invoice, payment link and reminders.", es: "Si ya tienes software de despacho para los expedientes, consérvalo. Si facturas sobre todo a tanto alzado o por tiempo en pocos expedientes, Robi es más rápido: dictas las diligencias y genera la factura, el enlace de pago y los recordatorios." },
      },
      {
        q: { fr: "Une convention d'honoraires est-elle toujours obligatoire ?", en: "Is a fee agreement always required?", es: "¿El convenio de honorarios siempre es obligatorio?" },
        a: { fr: "Oui, sauf en cas d'urgence, de force majeure ou d'aide juridictionnelle totale (art. 10 de la loi du 31 décembre 1971). Elle peut résulter d'un échange de courriers ; elle fixe la base sur laquelle tu factureras.", en: "In France, yes, except in emergencies, force majeure or full legal aid (art. 10, law of 31 December 1971). It can take the form of an exchange of letters; it sets the basis for your invoices.", es: "En Francia sí, salvo urgencia, fuerza mayor o asistencia jurídica total (art. 10, ley del 31 de diciembre de 1971). Puede resultar de un intercambio de cartas." },
      },
      {
        q: { fr: "Comment facturer des frais avancés pour un client ?", en: "How do I invoice costs advanced for a client?", es: "¿Cómo facturar gastos adelantados por un cliente?" },
        a: { fr: "Sur des lignes distinctes des honoraires, avec leur nature (frais de greffe, d'huissier, de déplacement). Leur traitement en TVA dépend de leur nature : demande à ton comptable lesquels sont des débours.", en: "On lines separate from fees, stating their nature (court, bailiff, travel). Their VAT treatment depends on that nature: ask your accountant which ones count as disbursements.", es: "En líneas distintas de los honorarios, indicando su naturaleza (tasas, notificaciones, desplazamientos). Su tratamiento de IVA depende de ella: consulta a tu gestor cuáles son suplidos." },
      },
    ],
    articles: [A.mentions, A.relance, A.reforme],
  },

  "expert-comptable": {
    intro: {
      fr: "Un expert-comptable facture des missions encadrées par une lettre de mission : tenue, révision, bilan, liasse, social, conseil ponctuel, souvent en forfait mensuel avec des prestations exceptionnelles en plus. Et depuis la réforme, tes clients te demandent tous quel outil prendre pour émettre leurs factures électroniques. Robi AI répond aux deux : il prépare tes propres factures d'honoraires en une phrase, et c'est un outil simple à recommander aux TPE et indépendants que tu accompagnes.",
      en: "An accountant invoices assignments framed by an engagement letter: bookkeeping, review, year-end accounts, payroll, ad-hoc advice, often as a monthly flat fee plus extras. And since the French e-invoicing reform, every client asks which tool to use. Robi AI covers both: it prepares your own fee invoices from one sentence, and it's a simple tool to recommend to the small businesses you support.",
      es: "Un contable factura misiones enmarcadas por una carta de encargo: contabilidad, revisión, cierre, nóminas, asesoría puntual, a menudo con cuota mensual y extras. Y desde la reforma francesa, todos tus clientes preguntan qué herramienta usar. Robi AI cubre ambas cosas: prepara tus facturas de honorarios en una frase y es una herramienta sencilla de recomendar a las pymes que acompañas.",
    },
    quote: {
      said: {
        fr: "« Facture d'octobre pour la SARL Delmas : forfait mensuel tenue et TVA selon la lettre de mission, plus l'établissement exceptionnel de l'attestation pour leur banque. »",
        en: "« October invoice for Delmas SARL: monthly bookkeeping and VAT flat fee under the engagement letter, plus the one-off certificate for their bank. »",
        es: "« Factura de octubre para la SARL Delmas: cuota mensual de contabilidad e IVA según la carta de encargo, más el certificado puntual para su banco. »",
      },
      lines: [
        { fr: "Forfait mensuel — tenue comptable et déclarations de TVA · octobre", en: "Monthly flat fee — bookkeeping and VAT returns · October", es: "Cuota mensual — contabilidad y declaraciones de IVA · octubre" },
        { fr: "Prestation exceptionnelle — attestation destinée à la banque", en: "One-off service — certificate for the bank", es: "Prestación puntual — certificado para el banco" },
        { fr: "Référence : lettre de mission en vigueur", en: "Reference: current engagement letter", es: "Referencia: carta de encargo vigente" },
      ],
      note: {
        fr: "Le forfait revient chaque mois : Robi le garde dans ton catalogue, tu n'ajoutes que l'exceptionnel.",
        en: "The flat fee recurs every month: Robi keeps it in your catalogue, you only add the extras.",
        es: "La cuota se repite cada mes: Robi la guarda en tu catálogo, solo añades lo puntual.",
      },
    },
    rules: [
      {
        title: { fr: "La lettre de mission, base de la facture", en: "The engagement letter as the basis of the invoice", es: "La carta de encargo, base de la factura" },
        text: {
          fr: "L'article 151 du décret du 30 mars 2012 impose un contrat écrit avec chaque client, qui définit la mission et les droits et obligations de chacun ; il peut prendre la forme d'une lettre de mission. Tes factures en reprennent les termes : intitulés des missions, forfait, prestations hors forfait.",
          en: "In France, article 151 of the decree of 30 March 2012 requires a written contract with each client defining the assignment and each party's rights and obligations; it can take the form of an engagement letter. Your invoices follow its terms: assignment names, flat fee, extras.",
          es: "En Francia, el artículo 151 del decreto del 30 de marzo de 2012 exige un contrato escrito con cada cliente que defina la misión y los derechos y obligaciones; puede ser una carta de encargo. Tus facturas siguen sus términos.",
        },
        source: S.expertComptable,
      },
      {
        title: { fr: "Tes factures passent aussi à l'électronique", en: "Your own invoices go electronic too", es: "Tus propias facturas también pasan a electrónicas" },
        text: {
          fr: "Tes clients sont des entreprises : tes factures d'honoraires entrent dans la facturation électronique entre assujettis, avec les nouvelles mentions comme le SIREN du client. Robi les produit au format Factur-X (norme EN 16931).",
          en: "Your clients are businesses: your fee invoices fall under French B2B e-invoicing, with new details such as the client's registration number. Robi produces them as Factur-X (EN 16931).",
          es: "Tus clientes son empresas: tus facturas de honorarios entran en la facturación electrónica B2B francesa, con nuevos datos como el número de registro del cliente. Robi las genera en Factur-X (EN 16931).",
        },
        source: S.mentions,
      },
    ],
    faq: [
      {
        q: { fr: "Quel outil de facturation conseiller à mes clients TPE ?", en: "Which invoicing tool should I recommend to small-business clients?", es: "¿Qué herramienta de facturación recomendar a mis clientes pyme?" },
        a: { fr: "Un outil qui produit du Factur-X, garde la numérotation sous contrôle et que ton client utilisera vraiment. Robi se prend en main en dictant sa première facture ; il ne remplace pas ta production comptable. Le programme partenaires est fait pour les cabinets qui le recommandent.", en: "One that produces Factur-X, keeps numbering under control and that your client will actually use. Robi is learned by dictating the first invoice; it doesn't replace your accounting work. The partner programme is built for firms that recommend it.", es: "Una que genere Factur-X, controle la numeración y que tu cliente use de verdad. Robi se aprende dictando la primera factura; no sustituye tu trabajo contable. El programa de socios está pensado para despachos que lo recomiendan." },
      },
      {
        q: { fr: "Robi est-il un logiciel de comptabilité ?", en: "Is Robi accounting software?", es: "¿Robi es un software de contabilidad?" },
        a: { fr: "Non. Robi crée les devis et factures, suit les paiements et relance. La tenue, la révision et les déclarations restent dans ton logiciel de production.", en: "No. Robi creates quotes and invoices, tracks payments and sends reminders. Bookkeeping, review and returns stay in your production software.", es: "No. Robi crea presupuestos y facturas, sigue los cobros y reclama. La contabilidad y las declaraciones siguen en tu software de producción." },
      },
      {
        q: { fr: "Comment facturer un forfait mensuel et des prestations exceptionnelles ?", en: "How do I invoice a monthly fee plus extras?", es: "¿Cómo facturar una cuota mensual y extras?" },
        a: { fr: "Une ligne pour le forfait du mois, une ligne par prestation hors forfait prévue à la lettre de mission. Avec Robi, tu dictes « forfait d'octobre plus l'attestation banque » et les deux lignes arrivent.", en: "One line for the month's fee, one per extra provided for in the engagement letter. With Robi you say « October fee plus the bank certificate » and both lines appear.", es: "Una línea para la cuota del mes y una por cada extra previsto en la carta de encargo. Con Robi dices « cuota de octubre más el certificado del banco » y aparecen ambas." },
      },
    ],
    articles: [A.reforme, A.facturx, A.ia],
  },

  // ───────────────────────── Bâtiment ─────────────────────────
  plombier: {
    quote: {
      said: {
        fr: "« Devis pour Mme Garnier, appartement de 1998 : remplacement du ballon d'eau chaude de 200 litres, dépose et évacuation de l'ancien, groupe de sécurité neuf, déplacement et deux heures de main-d'œuvre. »",
        en: "« Quote for Mrs Garnier, flat built in 1998: replace the 200-litre water heater, remove and dispose of the old one, new safety valve, call-out and two hours' labour. »",
        es: "« Presupuesto para la Sra. Garnier, piso de 1998: sustitución del termo de 200 litros, retirada del antiguo, grupo de seguridad nuevo, desplazamiento y dos horas de mano de obra. »",
      },
      lines: [
        { fr: "Chauffe-eau électrique 200 L — fourniture et pose", en: "200 L electric water heater — supply and fitting", es: "Termo eléctrico 200 L — suministro e instalación" },
        { fr: "Groupe de sécurité — fourniture", en: "Safety valve unit — supply", es: "Grupo de seguridad — suministro" },
        { fr: "Dépose et évacuation de l'ancien appareil", en: "Removal and disposal of the old unit", es: "Retirada y evacuación del aparato antiguo" },
        { fr: "Main-d'œuvre · 2 h au taux horaire · déplacement", en: "Labour · 2 h at hourly rate · call-out", es: "Mano de obra · 2 h a tarifa horaria · desplazamiento" },
      ],
      note: {
        fr: "Logement de plus de deux ans : Robi propose le taux réduit et la mention qui remplace l'attestation. Ton attestation décennale part avec le devis.",
        en: "Home over two years old: Robi suggests the reduced rate and the statement that replaces the old certificate. Your decennial certificate goes with the quote.",
        es: "Vivienda de más de dos años: Robi propone el tipo reducido y la mención que sustituye al certificado. Tu seguro decenal va con el presupuesto.",
      },
    },
    rules: [ruleDepannage, ruleTvaTravaux, ruleDecennale],
    faq: [
      {
        q: { fr: "Un devis est-il obligatoire pour une petite fuite ?", en: "Is a quote required for a small leak?", es: "¿Es obligatorio un presupuesto para una pequeña fuga?" },
        a: { fr: "Chez un particulier, oui : depuis le 1er avril 2017, le devis détaillé est dû pour tout dépannage, quel que soit le montant. Avec Robi, tu le dictes sur place et le client le signe sur ton téléphone avant que tu ouvres la boîte à outils.", en: "At a private home in France, yes: since 1 April 2017 a detailed quote is required for any call-out, whatever the amount. With Robi you dictate it on site and the customer signs it on your phone before you start.", es: "En casa de un particular en Francia, sí: desde el 1 de abril de 2017 el presupuesto detallado es obligatorio en cualquier reparación. Con Robi lo dictas allí y el cliente lo firma en tu móvil." },
      },
    ],
    articles: [A.devis, A.mentions, A.relance],
  },

  chauffagiste: {
    intro: {
      fr: "Entretien annuel de chaudière, dépannage en plein hiver, remplacement par une pompe à chaleur avec dossier d'aides : un chauffagiste enchaîne des documents qui n'ont rien à voir. Le devis de rénovation énergétique est le plus exigeant : taux de TVA réduit, mentions RGE, détail que le client devra fournir pour sa prime. Robi AI te laisse dicter le chantier depuis la chaufferie et sort un devis propre, ligne par ligne, au bon taux.",
      en: "Annual boiler servicing, mid-winter breakdowns, replacing a boiler with a heat pump including the grant paperwork: a heating engineer juggles very different documents. The energy-renovation quote is the most demanding: reduced VAT, certification details, the breakdown the customer needs for their grant. Robi AI lets you dictate the job from the boiler room and produces a clean, line-by-line quote at the right rate.",
      es: "Mantenimiento anual de caldera, averías en pleno invierno, sustitución por una bomba de calor con expediente de ayudas: un instalador de calefacción encadena documentos muy distintos. El presupuesto de renovación energética es el más exigente: IVA reducido, certificación, el detalle que el cliente necesita para su ayuda. Robi AI te deja dictar la obra desde la sala de calderas.",
    },
    quote: {
      said: {
        fr: "« Devis pour M. et Mme Roux, maison de 1985 : dépose de la chaudière fioul, installation d'une pompe à chaleur air-eau, mise en service, et à part le contrat d'entretien annuel. »",
        en: "« Quote for Mr and Mrs Roux, house built in 1985: remove the oil boiler, install an air-to-water heat pump, commissioning, and separately the annual maintenance contract. »",
        es: "« Presupuesto para el Sr. y la Sra. Roux, casa de 1985: retirada de la caldera de gasóleo, instalación de una bomba de calor aire-agua, puesta en marcha, y aparte el contrato de mantenimiento anual. »",
      },
      lines: [
        { fr: "Pompe à chaleur air-eau — fourniture et pose (marque, modèle, performances)", en: "Air-to-water heat pump — supply and fitting (brand, model, performance)", es: "Bomba de calor aire-agua — suministro e instalación (marca, modelo, rendimiento)" },
        { fr: "Dépose et évacuation de la chaudière fioul", en: "Removal and disposal of the oil boiler", es: "Retirada y evacuación de la caldera de gasóleo" },
        { fr: "Mise en service et réglages", en: "Commissioning and settings", es: "Puesta en marcha y ajustes" },
        { fr: "Contrat d'entretien annuel — document séparé", en: "Annual maintenance contract — separate document", es: "Contrato de mantenimiento anual — documento aparte" },
      ],
      note: {
        fr: "Marque, modèle et performances de l'équipement sur le devis : ce sont les informations que le dossier d'aide va chercher.",
        en: "Brand, model and equipment performance on the quote: that's what the grant application looks for.",
        es: "Marca, modelo y rendimiento del equipo en el presupuesto: es lo que pide el expediente de ayuda.",
      },
    },
    rules: [
      ruleTvaTravaux,
      {
        title: { fr: "RGE : la condition des aides de tes clients", en: "RGE certification: the condition for your customers' grants", es: "RGE: la condición de las ayudas de tus clientes" },
        text: {
          fr: "Pour bénéficier de MaPrimeRénov', le particulier doit confier les travaux à une entreprise reconnue garante de l'environnement (RGE) pour les travaux qu'elle réalise. Fais figurer ta qualification RGE et sa référence sur tes devis de rénovation énergétique : sans elle, ton client ne touchera pas l'aide.",
          en: "In France, to get MaPrimeRénov' the homeowner must hire a company certified RGE for the work it carries out. Put your RGE qualification and its reference on your energy-renovation quotes: without it, your customer won't get the grant.",
          es: "En Francia, para cobrar MaPrimeRénov' el particular debe contratar una empresa certificada RGE para las obras que realiza. Indica tu certificación RGE y su referencia en tus presupuestos: sin ella, tu cliente no cobrará la ayuda.",
        },
        source: S.rge,
      },
      ruleDepannage,
    ],
    faq: [
      {
        q: { fr: "Quelle TVA sur l'installation d'une pompe à chaleur ?", en: "What VAT on installing a heat pump?", es: "¿Qué IVA para instalar una bomba de calor?" },
        a: { fr: "Dans un logement achevé depuis plus de deux ans, les travaux d'amélioration de la performance énergétique peuvent relever du taux de 5,5 % (art. 278-0 bis A du CGI), sous conditions techniques. Le devis porte alors la mention qui remplace l'ancienne attestation.", en: "In a French home completed more than two years ago, energy-efficiency work can qualify for 5.5% VAT (art. 278-0 bis A CGI), subject to technical conditions. The quote then carries the statement that replaced the old certificate.", es: "En una vivienda francesa terminada hace más de dos años, las obras de eficiencia energética pueden tributar al 5,5 % (art. 278-0 bis A CGI), con condiciones técnicas. El presupuesto lleva la mención que sustituye al antiguo certificado." },
      },
      {
        q: { fr: "Comment facturer un contrat d'entretien de chaudière ?", en: "How do I invoice a boiler maintenance contract?", es: "¿Cómo facturar un contrato de mantenimiento de caldera?" },
        a: { fr: "Sur un document à part du chantier, avec la période couverte et ce que comprend la visite. Enregistré dans ton catalogue Robi, il se refacture chaque année en une phrase.", en: "On a document separate from the installation, with the period covered and what the visit includes. Saved in your Robi catalogue, it's re-invoiced each year in one sentence.", es: "En un documento aparte de la obra, con el periodo y lo que incluye la visita. Guardado en tu catálogo de Robi, se refactura cada año en una frase." },
      },
      {
        q: { fr: "Faut-il un devis pour un dépannage de chaudière en urgence ?", en: "Is a quote needed for an emergency boiler repair?", es: "¿Hace falta presupuesto para una avería urgente de caldera?" },
        a: { fr: "Chez un particulier, le devis détaillé est la règle pour tout dépannage depuis l'arrêté du 24 janvier 2017. Dicte-le sur place : le client signe sur ton téléphone, tu interviens.", en: "At a private home in France, a detailed quote is the rule for any repair since the order of 24 January 2017. Dictate it on site: the customer signs on your phone, you start.", es: "En casa de un particular en Francia, el presupuesto detallado es la norma para cualquier reparación desde la orden del 24 de enero de 2017. Díctalo allí: el cliente firma en tu móvil." },
      },
    ],
    articles: [A.devis, A.mentions, A.facturx],
  },

  couvreur: {
    intro: {
      fr: "Réfection de toiture, remplacement de tuiles après un coup de vent, zinguerie, isolation par l'extérieur, démoussage : un couvreur chiffre des chantiers où l'échafaudage, la dépose et l'évacuation pèsent autant que la pose. Et c'est souvent après la visite, en haut de l'échelle, qu'il faut sortir le devis. Robi AI te laisse dicter le chantier depuis le toit et range chaque poste à sa place, avec le bon taux de TVA quand l'isolation entre en jeu.",
      en: "Re-roofing, replacing tiles after a storm, guttering, external insulation, moss removal: a roofer prices jobs where scaffolding, stripping and disposal weigh as much as the fitting. And the quote is often needed right after the inspection, at the top of the ladder. Robi AI lets you dictate the job from the roof and files each item in its place, with the right VAT when insulation is involved.",
      es: "Rehabilitación de tejado, cambio de tejas tras un temporal, canalones, aislamiento exterior, limpieza de musgo: un techador presupuesta obras donde el andamio, la retirada y la evacuación pesan tanto como la colocación. Robi AI te deja dictar la obra desde el tejado y coloca cada partida en su sitio, con el IVA correcto cuando hay aislamiento.",
    },
    quote: {
      said: {
        fr: "« Devis pour M. Lefèvre, maison de 1972 : dépose de la couverture en tuiles mécaniques, pose d'un isolant sous toiture, nouvelles tuiles, échafaudage pendant le chantier et évacuation des gravats. »",
        en: "« Quote for Mr Lefèvre, house built in 1972: strip the interlocking-tile roof, fit under-roof insulation, new tiles, scaffolding for the job and debris removal. »",
        es: "« Presupuesto para el Sr. Lefèvre, casa de 1972: retirada de la cubierta de tejas mecánicas, aislamiento bajo cubierta, tejas nuevas, andamio durante la obra y evacuación de escombros. »",
      },
      lines: [
        { fr: "Échafaudage — montage, location sur la durée du chantier, démontage", en: "Scaffolding — erection, hire for the job, dismantling", es: "Andamio — montaje, alquiler durante la obra, desmontaje" },
        { fr: "Dépose de la couverture existante et évacuation des gravats", en: "Stripping the existing roof and debris removal", es: "Retirada de la cubierta y evacuación de escombros" },
        { fr: "Isolation sous toiture — fourniture et pose (résistance thermique de l'isolant)", en: "Under-roof insulation — supply and fitting (thermal resistance)", es: "Aislamiento bajo cubierta — suministro e instalación (resistencia térmica)" },
        { fr: "Tuiles neuves — fourniture et pose · surface en m²", en: "New tiles — supply and fitting · area in m²", es: "Tejas nuevas — suministro e instalación · superficie en m²" },
      ],
      note: {
        fr: "L'isolation et la couverture n'ont pas forcément le même taux : une ligne chacune, et Robi calcule la TVA ligne par ligne.",
        en: "Insulation and roofing may not share the same VAT rate: one line each, and Robi calculates VAT line by line.",
        es: "El aislamiento y la cubierta pueden no tener el mismo IVA: una línea cada uno, y Robi calcula el IVA por línea.",
      },
    },
    rules: [ruleTvaTravaux, ruleDecennale],
    faq: [
      {
        q: { fr: "Comment faire un devis de couverture rapidement ?", en: "How to write a roofing quote quickly?", es: "¿Cómo hacer rápido un presupuesto de tejado?" },
        a: { fr: "Dicte les postes dans l'ordre du chantier (échafaudage, dépose, isolation, pose, évacuation) en donnant les surfaces. Robi range les lignes, applique tes tarifs enregistrés et ajoute les mentions ; tu relis et tu envoies avant de quitter le client.", en: "Dictate the items in job order (scaffolding, stripping, insulation, fitting, disposal) with the areas. Robi arranges the lines, applies your saved rates and adds the legal details; you review and send before leaving.", es: "Dicta las partidas en el orden de la obra (andamio, retirada, aislamiento, colocación, evacuación) con las superficies. Robi ordena las líneas, aplica tus tarifas y añade las menciones." },
      },
      {
        q: { fr: "L'isolation de toiture est-elle à 5,5 % de TVA ?", en: "Is roof insulation at 5.5% VAT?", es: "¿El aislamiento de tejado va al 5,5 % de IVA?" },
        a: { fr: "Elle peut l'être dans un logement achevé depuis plus de deux ans, au titre de l'amélioration de la performance énergétique (art. 278-0 bis A du CGI), si l'isolant respecte les critères techniques prévus. Le reste de la couverture relève en général du taux de 10 %.", en: "It can be, in a French home completed more than two years ago, as an energy-efficiency improvement (art. 278-0 bis A CGI), if the insulation meets the technical criteria. The rest of the roofing generally falls under 10%.", es: "Puede serlo en una vivienda francesa terminada hace más de dos años, como mejora energética (art. 278-0 bis A CGI), si el aislante cumple los criterios técnicos. El resto de la cubierta suele ir al 10 %." },
      },
      {
        q: { fr: "Comment demander un acompte avant un chantier de toiture ?", en: "How do I ask for a deposit before a roofing job?", es: "¿Cómo pedir un anticipo antes de una obra de tejado?" },
        a: { fr: "Indique-le dans les conditions du devis, puis émets une facture d'acompte à la signature et la facture de solde à la fin, avec une numérotation continue. Robi peut pré-remplir un acompte par défaut sur chaque devis.", en: "State it in the quote's terms, then issue a deposit invoice on signature and the balance invoice at the end, with continuous numbering. Robi can pre-fill a default deposit on every quote.", es: "Indícalo en las condiciones del presupuesto y emite una factura de anticipo a la firma y la del saldo al final, con numeración continua. Robi puede rellenar un anticipo por defecto." },
      },
    ],
    articles: [A.devis, A.mentions, A.relance],
  },

  carreleur: {
    intro: {
      fr: "Chape, ragréage, pose droite ou en diagonale, plinthes, faïence de salle de bains, joints : un carreleur chiffre au mètre carré mais chaque chantier a ses préparations, ses découpes et ses pertes. Fournir le carrelage ou poser celui du client change aussi tout le devis. Robi AI te laisse dicter les surfaces pièce par pièce et sépare d'office fourniture et pose.",
      en: "Screed, levelling, straight or diagonal laying, skirting, bathroom wall tiles, grouting: a tiler prices by the square metre, but every job has its prep, cuts and wastage. Supplying the tiles or laying the customer's own also changes the whole quote. Robi AI lets you dictate areas room by room and keeps supply and labour apart.",
      es: "Recrecido, autonivelante, colocación recta o en diagonal, rodapiés, azulejo de baño, juntas: un alicatador presupuesta por metro cuadrado, pero cada obra tiene su preparación, cortes y mermas. Suministrar la baldosa o colocar la del cliente cambia todo el presupuesto. Robi AI te deja dictar las superficies por estancia y separa suministro y colocación.",
    },
    quote: {
      said: {
        fr: "« Devis pour Mme Benali, appartement de 2005 : ragréage et pose de carrelage 60 par 60 dans le séjour de 32 mètres carrés, carrelage fourni par la cliente, plinthes assorties, et dépose de l'ancien sol. »",
        en: "« Quote for Mrs Benali, flat built in 2005: levelling and laying 60×60 tiles in the 32 m² living room, tiles supplied by the customer, matching skirting, and removal of the old floor. »",
        es: "« Presupuesto para la Sra. Benali, piso de 2005: autonivelante y colocación de baldosa 60×60 en el salón de 32 m², baldosa aportada por la clienta, rodapiés a juego y retirada del suelo antiguo. »",
      },
      lines: [
        { fr: "Dépose de l'ancien revêtement et évacuation · 32 m²", en: "Removal of old flooring and disposal · 32 m²", es: "Retirada del revestimiento antiguo y evacuación · 32 m²" },
        { fr: "Ragréage du support · 32 m²", en: "Floor levelling · 32 m²", es: "Autonivelante · 32 m²" },
        { fr: "Pose de carrelage 60×60 — fourni par la cliente · 32 m²", en: "Laying 60×60 tiles — supplied by customer · 32 m²", es: "Colocación de baldosa 60×60 — aportada por la clienta · 32 m²" },
        { fr: "Plinthes assorties — pose · mètres linéaires", en: "Matching skirting — fitting · linear metres", es: "Rodapiés a juego — colocación · metros lineales" },
      ],
      note: {
        fr: "« Fourni par la cliente » est écrit noir sur blanc : la pose seule ne se facture pas comme fourniture et pose, et le devis le dit.",
        en: "« Supplied by the customer » is written in black and white: labour only isn't priced like supply-and-fit, and the quote says so.",
        es: "« Aportada por la clienta » queda escrito: la colocación sola no se factura como suministro y colocación.",
      },
    },
    rules: [ruleTvaTravaux, ruleDecennale],
    faq: [
      {
        q: { fr: "Comment chiffrer un devis de carrelage au mètre carré ?", en: "How to price a tiling quote per square metre?", es: "¿Cómo presupuestar un alicatado por metro cuadrado?" },
        a: { fr: "Une ligne par opération et par surface : dépose, préparation, pose, plinthes au mètre linéaire, joints s'ils sont à part. Enregistre tes prix au m² dans le catalogue Robi : tu dictes les surfaces, les totaux se calculent.", en: "One line per operation and area: removal, prep, laying, skirting per linear metre, grouting if separate. Save your per-m² prices in Robi's catalogue: dictate the areas and totals calculate themselves.", es: "Una línea por operación y superficie: retirada, preparación, colocación, rodapiés por metro lineal, juntas si van aparte. Guarda tus precios por m² en el catálogo de Robi: dictas las superficies y los totales se calculan." },
      },
      {
        q: { fr: "Quelle TVA pour la pose de carrelage chez un particulier ?", en: "What VAT for laying tiles at a private home?", es: "¿Qué IVA para colocar baldosa en casa de un particular?" },
        a: { fr: "Dans un logement achevé depuis plus de deux ans, les travaux de rénovation relèvent en général du taux de 10 % (art. 279-0 bis du CGI). Depuis 2025, une mention sur le devis ou la facture remplace l'attestation que le client signait.", en: "In a French home completed more than two years ago, renovation work generally falls under 10% VAT (art. 279-0 bis CGI). Since 2025, a statement on the quote or invoice replaces the certificate the customer used to sign.", es: "En una vivienda francesa terminada hace más de dos años, las obras de renovación suelen ir al 10 % (art. 279-0 bis CGI). Desde 2025, una mención en el presupuesto o la factura sustituye al certificado." },
      },
    ],
    articles: [A.devis, A.mentions, A.vocale],
  },

  menuisier: {
    intro: {
      fr: "Fabrication sur mesure à l'atelier, pose de fenêtres, portes, escaliers, agencement de cuisine ou de dressing : un menuisier mélange fabrication, fourniture et pose, et les délais entre le devis et la livraison sont longs. Il faut donc un devis précis dès le départ, des acomptes bien suivis et une facture de solde qui reprend tout. Robi AI te laisse dicter le projet avec ses cotes et ses essences, et garde le fil jusqu'au solde.",
      en: "Bespoke workshop fabrication, fitting windows, doors, staircases, kitchens or wardrobes: a carpenter mixes fabrication, supply and fitting, with long lead times between quote and delivery. That calls for a precise quote from the start, well-tracked deposits and a final invoice that brings it all together. Robi AI lets you dictate the project with its dimensions and wood species, and follows it through to the balance.",
      es: "Fabricación a medida en el taller, colocación de ventanas, puertas, escaleras, cocinas o vestidores: un carpintero mezcla fabricación, suministro y colocación, con plazos largos entre presupuesto y entrega. Hace falta un presupuesto preciso, anticipos bien seguidos y una factura de saldo que lo recoja todo. Robi AI te deja dictar el proyecto con medidas y maderas.",
    },
    quote: {
      said: {
        fr: "« Devis pour M. Petit, maison de 1960 : remplacement de quatre fenêtres en bois par des fenêtres double vitrage en chêne, dépose des anciennes, et un placard sur mesure sous l'escalier, acompte de 30 % à la commande. »",
        en: "« Quote for Mr Petit, house built in 1960: replace four wooden windows with double-glazed oak windows, remove the old ones, and a bespoke cupboard under the stairs, 30% deposit on order. »",
        es: "« Presupuesto para el Sr. Petit, casa de 1960: sustitución de cuatro ventanas de madera por ventanas de roble con doble acristalamiento, retirada de las antiguas y un armario a medida bajo la escalera, anticipo del 30 % al pedido. »",
      },
      lines: [
        { fr: "Fenêtres chêne double vitrage — fabrication et pose · 4 (cotes, performances thermiques)", en: "Double-glazed oak windows — fabrication and fitting · 4 (dimensions, thermal performance)", es: "Ventanas de roble doble acristalamiento — fabricación y colocación · 4 (medidas, rendimiento térmico)" },
        { fr: "Dépose et évacuation des menuiseries existantes · 4", en: "Removal and disposal of existing frames · 4", es: "Retirada y evacuación de las carpinterías existentes · 4" },
        { fr: "Placard sur mesure sous escalier — fabrication et pose", en: "Bespoke under-stairs cupboard — fabrication and fitting", es: "Armario a medida bajo escalera — fabricación y colocación" },
        { fr: "Acompte de 30 % à la commande, solde à la pose", en: "30% deposit on order, balance on fitting", es: "Anticipo del 30 % al pedido, saldo a la colocación" },
      ],
      note: {
        fr: "Les fenêtres et le placard n'ont pas forcément le même taux de TVA : le placard n'améliore pas la performance énergétique. Une ligne chacun.",
        en: "The windows and the cupboard may not share a VAT rate: the cupboard doesn't improve energy performance. One line each.",
        es: "Las ventanas y el armario pueden no tener el mismo IVA: el armario no mejora la eficiencia energética. Una línea cada uno.",
      },
    },
    rules: [ruleTvaTravaux, ruleDecennale],
    faq: [
      {
        q: { fr: "Comment gérer l'acompte et le solde d'une commande de menuiserie ?", en: "How do I handle the deposit and balance on a joinery order?", es: "¿Cómo gestionar anticipo y saldo en un pedido de carpintería?" },
        a: { fr: "Le devis signé fixe l'acompte. Tu émets une facture d'acompte à la commande, puis une facture de solde qui déduit l'acompte déjà versé, avec une numérotation continue. Robi relie les deux et te montre ce qui reste dû.", en: "The signed quote sets the deposit. Issue a deposit invoice on order, then a final invoice deducting what's been paid, with continuous numbering. Robi links the two and shows what's still due.", es: "El presupuesto firmado fija el anticipo. Emites una factura de anticipo al pedido y luego una de saldo que descuenta lo pagado, con numeración continua. Robi las vincula." },
      },
      {
        q: { fr: "Quelle TVA pour le remplacement de fenêtres ?", en: "What VAT for replacing windows?", es: "¿Qué IVA para sustituir ventanas?" },
        a: { fr: "Dans un logement achevé depuis plus de deux ans, des fenêtres qui améliorent la performance énergétique peuvent relever du taux de 5,5 % (art. 278-0 bis A du CGI), sous conditions techniques ; les autres travaux de menuiserie relèvent en général de 10 %.", en: "In a French home completed more than two years ago, windows that improve energy performance can qualify for 5.5% (art. 278-0 bis A CGI), subject to technical conditions; other joinery work generally falls under 10%.", es: "En una vivienda francesa terminada hace más de dos años, ventanas que mejoran la eficiencia energética pueden ir al 5,5 % (art. 278-0 bis A CGI), con condiciones técnicas; el resto suele ir al 10 %." },
      },
      {
        q: { fr: "Un menuisier qui vend un meuble sans le poser applique-t-il le taux réduit ?", en: "Does a carpenter selling furniture without fitting it use the reduced rate?", es: "¿Un carpintero que vende un mueble sin colocarlo aplica el tipo reducido?" },
        a: { fr: "Les taux réduits visent des travaux dans un logement. Une vente sans pose est une vente de bien, en principe au taux normal. Mets la fabrication livrée et la pose sur des lignes distinctes.", en: "The reduced rates cover work in a home. A sale without fitting is a sale of goods, normally at the standard rate. Keep delivered fabrication and fitting on separate lines.", es: "Los tipos reducidos cubren obras en una vivienda. Una venta sin colocación es una venta de bienes, en principio al tipo general. Separa fabricación y colocación." },
      },
    ],
    articles: [A.devis, A.relance, A.mentions],
  },

  serrurier: {
    intro: {
      fr: "Ouverture de porte claquée, changement de cylindre après une perte de clés, pose de serrure multipoints, réparation après effraction : un serrurier travaille souvent dans l'urgence, chez des clients stressés, et c'est le métier où le prix annoncé fait le plus l'objet de contrôles. Un devis détaillé, signé avant d'intervenir, te protège autant que ton client. Robi AI te permet de le dicter sur le palier et de le faire signer sur ton téléphone.",
      en: "Opening a slammed door, changing a cylinder after lost keys, fitting a multi-point lock, repairing after a break-in: a locksmith often works in emergencies with stressed customers, and in France it's the trade where quoted prices are most scrutinised. A detailed quote signed before you start protects you as much as the customer. Robi AI lets you dictate it on the doorstep and get it signed on your phone.",
      es: "Abrir una puerta cerrada, cambiar un bombín tras perder las llaves, instalar una cerradura multipunto, reparar tras un robo: un cerrajero trabaja a menudo con urgencia y clientes nerviosos, y en Francia es el oficio donde más se controlan los precios. Un presupuesto detallado firmado antes de intervenir te protege tanto como al cliente. Robi AI te permite dictarlo en el rellano.",
    },
    quote: {
      said: {
        fr: "« Devis pour M. Durand, porte claquée au troisième : ouverture fine sans destruction si possible, sinon remplacement du cylindre par un cylindre de sécurité, déplacement en soirée. »",
        en: "« Quote for Mr Durand, door slammed shut on the third floor: non-destructive opening if possible, otherwise replace the cylinder with a security cylinder, evening call-out. »",
        es: "« Presupuesto para el Sr. Durand, puerta cerrada en el tercero: apertura sin daños si es posible, si no sustitución del bombín por uno de seguridad, desplazamiento por la noche. »",
      },
      lines: [
        { fr: "Déplacement — intervention en soirée", en: "Call-out — evening intervention", es: "Desplazamiento — intervención nocturna" },
        { fr: "Ouverture de porte sans destruction — main-d'œuvre, temps estimé", en: "Non-destructive door opening — labour, estimated time", es: "Apertura de puerta sin daños — mano de obra, tiempo estimado" },
        { fr: "Option si l'ouverture fine échoue : cylindre de sécurité — fourniture et pose", en: "Option if non-destructive opening fails: security cylinder — supply and fitting", es: "Opción si falla la apertura: bombín de seguridad — suministro e instalación" },
      ],
      note: {
        fr: "L'option est chiffrée à part, avant l'intervention : le client sait ce qu'il paiera dans chaque cas, et toi aussi.",
        en: "The option is priced separately before you start: the customer knows what they'll pay either way, and so do you.",
        es: "La opción se presupuesta aparte antes de intervenir: el cliente sabe lo que pagará en cada caso.",
      },
    },
    rules: [ruleDepannage, ruleTvaTravaux],
    faq: [
      {
        q: { fr: "Un serrurier doit-il faire un devis avant une ouverture de porte ?", en: "Must a locksmith give a quote before opening a door?", es: "¿Un cerrajero debe dar presupuesto antes de abrir una puerta?" },
        a: { fr: "Chez un particulier, oui : l'arrêté du 24 janvier 2017 impose un devis détaillé avant tout dépannage, quel que soit le montant, avec le taux horaire, le temps estimé, les pièces et le déplacement. Fais-le signer avant de commencer.", en: "At a private home in France, yes: the order of 24 January 2017 requires a detailed quote before any call-out, whatever the amount, with hourly rate, estimated time, parts and travel. Get it signed before you start.", es: "En casa de un particular en Francia, sí: la orden del 24 de enero de 2017 exige un presupuesto detallado antes de cualquier reparación, con tarifa horaria, tiempo, piezas y desplazamiento. Que lo firme antes de empezar." },
      },
      {
        q: { fr: "Comment facturer une intervention de nuit ou le week-end ?", en: "How do I invoice a night or weekend call-out?", es: "¿Cómo facturar una intervención nocturna o en fin de semana?" },
        a: { fr: "Si tu appliques une majoration, elle figure sur le devis, sur une ligne visible, avant l'intervention. Robi la reprend telle quelle sur la facture.", en: "If you charge a surcharge, it appears on the quote, on its own visible line, before you start. Robi carries it over to the invoice as is.", es: "Si aplicas un recargo, figura en el presupuesto, en una línea visible, antes de intervenir. Robi lo traslada tal cual a la factura." },
      },
      {
        q: { fr: "Comment être payé sur place après un dépannage ?", en: "How do I get paid on the spot after a call-out?", es: "¿Cómo cobrar en el momento tras una reparación?" },
        a: { fr: "Transforme le devis signé en facture en un geste et envoie-la avec un lien de paiement : le client règle par carte depuis son téléphone pendant que tu ranges tes outils.", en: "Turn the signed quote into an invoice in one tap and send it with a payment link: the customer pays by card from their phone while you pack up.", es: "Convierte el presupuesto firmado en factura con un gesto y envíala con un enlace de pago: el cliente paga con tarjeta desde su móvil." },
      },
    ],
    articles: [A.devis, A.mentions, A.vocale],
  },

  // ───────────────────────── Événementiel ─────────────────────────
  traiteur: {
    intro: {
      fr: "Cocktail d'entreprise, mariage, plateaux-repas livrés, buffet avec service, location de vaisselle : un traiteur facture des prestations où la TVA change selon ce qu'on vend et comment on le sert. Un même devis peut mêler plusieurs taux, et un devis mal ventilé coûte cher. Robi AI te laisse dicter la prestation ligne par ligne et applique à chacune son taux.",
      en: "Corporate cocktails, weddings, delivered meal trays, buffets with service, tableware hire: a caterer invoices services where French VAT changes with what's sold and how it's served. One quote can mix several rates, and a poorly broken-down quote is costly. Robi AI lets you dictate the event line by line and applies each line's rate.",
      es: "Cócteles de empresa, bodas, bandejas a domicilio, bufé con servicio, alquiler de vajilla: un catering factura prestaciones donde el IVA francés cambia según lo que se vende y cómo se sirve. Un mismo presupuesto puede mezclar varios tipos. Robi AI te deja dictar la prestación línea por línea y aplica a cada una su tipo.",
    },
    quote: {
      said: {
        fr: "« Devis pour l'agence Lumen, cocktail du 12 décembre pour 80 personnes : pièces salées et sucrées, softs, champagne, deux serveurs pendant quatre heures et la location des verres. »",
        en: "« Quote for the Lumen agency, cocktail on 12 December for 80 guests: savoury and sweet canapés, soft drinks, champagne, two waiters for four hours and glass hire. »",
        es: "« Presupuesto para la agencia Lumen, cóctel del 12 de diciembre para 80 personas: piezas saladas y dulces, refrescos, champán, dos camareros durante cuatro horas y alquiler de copas. »",
      },
      lines: [
        { fr: "Pièces cocktail salées et sucrées · 80 convives", en: "Savoury and sweet canapés · 80 guests", es: "Piezas de cóctel saladas y dulces · 80 invitados" },
        { fr: "Boissons sans alcool · 80 convives", en: "Soft drinks · 80 guests", es: "Bebidas sin alcohol · 80 invitados" },
        { fr: "Champagne — ligne séparée", en: "Champagne — separate line", es: "Champán — línea aparte" },
        { fr: "Service · 2 maîtres d'hôtel × 4 h", en: "Service · 2 waiters × 4 h", es: "Servicio · 2 camareros × 4 h" },
        { fr: "Location de verrerie", en: "Glassware hire", es: "Alquiler de cristalería" },
      ],
      note: {
        fr: "L'alcool sur sa propre ligne : non ventilé, c'est tout le lot qui prendrait le taux le plus élevé.",
        en: "Alcohol on its own line: if it isn't broken down, the whole batch would take the highest rate.",
        es: "El alcohol en su propia línea: sin desglosar, todo el lote tomaría el tipo más alto.",
      },
    },
    rules: [
      {
        title: { fr: "Plusieurs taux de TVA dans un même devis", en: "Several VAT rates in one quote", es: "Varios tipos de IVA en un mismo presupuesto" },
        text: {
          fr: "Avec service sur place, la prestation du traiteur relève du taux de 10 %, sauf les boissons alcooliques, toujours au taux normal de 20 %. En vente à emporter ou livrée, les plats relèvent en général de 5,5 %, sauf ceux préparés pour une consommation immédiate, à 10 %. Si tu ne ventiles pas, le taux le plus élevé s'applique à l'ensemble.",
          en: "In France, with on-site service, catering falls under 10% VAT, except alcoholic drinks, always at the standard 20%. For takeaway or delivery, dishes are generally at 5.5%, except those prepared for immediate consumption, at 10%. If you don't break it down, the highest rate applies to everything.",
          es: "En Francia, con servicio en el lugar, el catering tributa al 10 %, salvo las bebidas alcohólicas, siempre al 20 %. Para llevar o a domicilio, los platos suelen ir al 5,5 %, salvo los preparados para consumo inmediato, al 10 %. Sin desglose, se aplica el tipo más alto a todo.",
        },
        source: S.traiteurTva,
      },
      {
        title: { fr: "Livraison et emporter : la règle détaillée", en: "Delivery and takeaway: the detailed rule", es: "Domicilio y para llevar: la regla detallada" },
        text: {
          fr: "L'administration fiscale détaille au BOFiP les produits concernés par chaque taux en vente à emporter ou à livrer, avec des exemples (plats cuisinés, sandwichs, boissons selon leur contenant). Garde ce tableau sous la main pour tes plateaux-repas.",
          en: "The French tax authority's BOFiP details which products take which rate for takeaway or delivery, with examples (ready meals, sandwiches, drinks depending on their container). Keep it handy for your meal trays.",
          es: "El BOFiP de la administración fiscal francesa detalla qué productos llevan qué tipo para llevar o a domicilio, con ejemplos (platos cocinados, bocadillos, bebidas según el envase).",
        },
        source: S.traiteurBofip,
      },
    ],
    faq: [
      {
        q: { fr: "Quelle TVA pour un traiteur avec service ?", en: "What VAT for a caterer with service?", es: "¿Qué IVA para un catering con servicio?" },
        a: { fr: "Le taux de 10 % pour la prestation de restauration avec service, et le taux normal de 20 % pour les boissons alcooliques, à facturer sur une ligne distincte.", en: "In France, 10% for catering with service, and the standard 20% for alcoholic drinks, invoiced on a separate line.", es: "En Francia, el 10 % para el catering con servicio y el 20 % para las bebidas alcohólicas, en una línea aparte." },
      },
      {
        q: { fr: "Acompte ou arrhes pour réserver une date ?", en: "Deposit or « arrhes » to book a date?", es: "¿Anticipo o arras para reservar una fecha?" },
        a: { fr: "Ce n'est pas la même chose : avec un acompte, la commande est ferme ; avec des arrhes, chacun peut se dédire (le client les perd, le professionnel les rend au double). Écris le mot choisi sur le devis. Dans Robi, l'acompte se règle par défaut et se déduit du solde.", en: "Under French law they differ: with an « acompte » the order is firm; with « arrhes » either party can withdraw (the customer loses them, the business repays double). Write the chosen word on the quote. In Robi, the deposit is set by default and deducted from the balance.", es: "En Derecho francés no son lo mismo: con un « acompte » el pedido es firme; con « arrhes » cada parte puede desistir. Escribe la palabra elegida en el presupuesto." },
      },
      {
        q: { fr: "Comment faire un devis traiteur rapidement ?", en: "How to write a catering quote quickly?", es: "¿Cómo hacer rápido un presupuesto de catering?" },
        a: { fr: "Enregistre tes formules et tes prix par convive dans le catalogue Robi, puis dicte l'événement : date, nombre de convives, formule, boissons, personnel. Robi construit les lignes avec leurs taux, tu relis et tu envoies avec un lien de paiement pour l'acompte.", en: "Save your packages and per-guest prices in Robi's catalogue, then dictate the event: date, guests, package, drinks, staff. Robi builds the lines with their rates; you review and send with a deposit payment link.", es: "Guarda tus fórmulas y precios por invitado en el catálogo de Robi y dicta el evento: fecha, invitados, fórmula, bebidas, personal. Robi crea las líneas con sus tipos y envías con enlace de pago del anticipo." },
      },
    ],
    articles: [A.devis, A.mentions, A.relance],
  },
};
