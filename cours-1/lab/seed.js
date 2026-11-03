// ============================================================
//  seed.js — jeu de données "Zwipe" (app de vidéos courtes)
//  Usage : docker exec -i zwipe-mongo mongosh zwipe < seed.js
//      ou, dans mongosh :  use zwipe ; load("/seed.js")
//  Déterministe : même résultat à chaque exécution.
// ============================================================

db = db.getSiblingDB("zwipe");
db.dropDatabase();

// ---- petit générateur pseudo-aléatoire (reproductible) ----
let _seed = 2026;
function rnd() { _seed = (_seed * 1103515245 + 12345) % 2147483648; return _seed / 2147483648; }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function int(min, max) { return min + Math.floor(rnd() * (max - min + 1)); }
function some(arr, n) { const c = [...arr]; const out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); return out; }
function oid(n) { return new ObjectId(n.toString(16).padStart(24, "0")); }
function date(y, m, d, h) { return new Date(Date.UTC(y, m - 1, d, h || 12)); }

// ---------------- USERS (50) ----------------
const pseudos = ["lea.scrolls","theo_fc","inesss","mathis.cook","chloe.vibes","noah_2k8","camille.art","yanis.fit","zoe.ok","lucas.gg",
 "manon.study","enzo.drift","jade.pastel","hugo.beats","lina.v","raphael.mtl","sarah.lol","adam.ldn","louna.cam","tom.tennis",
 "emma.books","nathan.sneak","maelle.dz","ethan.gym","ambre.sun","gabriel.rap","romane.rt","mohamed.ff","alice.bake","jules.vlog",
 "clara.cine","ayoub.drip","lola.paris","sacha.gamer","ninon.bio","ilyes.foot","juliette.ok","kylian.pas.mbappe","anna.ski","aaron.tech",
 "margot.lyon","rayan.bx","eva.sports","leo.skate","nour.med","axel.dj","maya.plant","oscar.chess","salome.danse","bilal.street"];
const pays = ["FR","FR","FR","FR","BE","CH","CA","MA","SN","DZ","TN","FR"];
const badges = ["createur","verifie","early","top-commentateur","live-star","cdm2026","milan-cortina"];
const bios = ["pas là pour être là","je poste quand je veux","contenu 100% authentique (faux)","team pasta","mon chat gère ce compte",
 "ex-étudiant en SQL, en reconversion","on dit pas 'réseaux sociaux', on dit 'le feed'","allergique aux jointures","ici pour les sons, pas pour les gens"];

const users = [];
for (let i = 1; i <= 50; i++) {
  const u = {
    _id: oid(i),
    pseudo: pseudos[i - 1],
    pays: pick(pays),
    abonnements: [],
    badges: some(badges, int(0, 3)),
    inscritLe: date(2026, int(1, 10), int(1, 28), int(0, 23)),
  };
  if (rnd() > 0.15) u.age = int(16, 34);            // 15 % n'ont pas renseigné l'âge
  if (rnd() > 0.4) u.bio = pick(bios);              // 60 % ont une bio
  if (rnd() > 0.7) u.premium = { depuis: date(2026, int(3, 10), int(1, 28)), plan: pick(["mensuel", "annuel"]) };
  users.push(u);
}
// abonnements (graphe "qui suit qui")
for (const u of users) {
  const n = int(2, 9);
  u.abonnements = some(users.filter(v => v._id.toString() !== u._id.toString()), n).map(v => v._id);
}
db.users.insertMany(users);

// ---------------- VIDEOS (200) ----------------
const titres = ["POV : tu révises le NoSQL la veille","Ce son va rester dans ta tête","Recette en 15 sec (promis)","Mon chat découvre la 5G",
 "Tier list des équipes CDM 2026","On a testé la trottinette autonome","Bug SQL à 3h du matin","Transition fit check",
 "Je réponds à vos commentaires","Day in my life (version étudiant fauché)","Le but de la finale, mais en LEGO","Unboxing du rien",
 "Mes 3 apps préférées (sponsorisé 🙃)","Tuto : paraître productif","Ski à Milan-Cortina, vlog 1","Micro-trottoir : c'est quoi NoSQL ?",
 "Storytime : mon prof a dit 'jointure'","Drop de sneakers, j'ai pas eu","GRWM avant le partiel","Ratio + pas de base de données"];
const hashtags = ["#pourtoi","#fyp","#cdm2026","#milancortina2026","#etudiant","#nosql","#recette","#chat","#humour","#fitcheck",
 "#storytime","#tuto","#grwm","#foot","#lego","#tech","#bug","#sneakers","#vlog","#son"];
const sons = [{titre:"Tuile", artiste:"Aya N."},{titre:"Night Shift", artiste:"DJ Mongo"},{titre:"Joint & Jointure", artiste:"MC SQL"},
 {titre:"Pas de panique", artiste:"Les Index"},{titre:"Scroll infini", artiste:"Zoé"},{titre:"Ciao Milano", artiste:"Olympix"},
 {titre:"Goal 2026", artiste:"Stadium Kids"},{titre:"son original", artiste:null}];
const produits = [{nom:"Gourde isotherme", prix:24.9},{nom:"Lampe LED gamer", prix:39},{nom:"Hoodie oversize", prix:59.99},{nom:"Carnet pointillé", prix:9.5}];
const villes = [["Paris",2.3522,48.8566],["Lyon",4.8357,45.764],["Marseille",5.3698,43.2965],["Montréal",-73.5673,45.5017],["Milan",9.19,45.4642],["Dakar",-17.4677,14.7167]];

const videos = [];
for (let i = 1; i <= 200; i++) {
  const auteur = pick(users);
  const v = {
    _id: oid(1000 + i),
    auteur: auteur._id,
    titre: pick(titres),
    duree: int(6, 180),                               // secondes
    vues: int(120, 2500000),
    likes: 0,
    hashtags: some(hashtags, int(1, 5)),
    son: pick(sons),
    publieLe: date(2026, int(1, 10), int(1, 28), int(0, 23)),
  };
  v.likes = Math.floor(v.vues * (int(2, 18) / 100));
  // --- métadonnées hétérogènes : c'est le point du cours ---
  const r = rnd();
  if (r < 0.2) v.duo = { avec: pick(users)._id, type: pick(["reaction", "split", "stitch"]) };
  if (rnd() < 0.25) { const c = pick(villes); v.lieu = { nom: c[0], type: "Point", coordinates: [c[1], c[2]] }; }
  if (rnd() < 0.15) v.sondage = { question: pick(["SQL ou NoSQL ?", "Bleu ou rouge ?", "Pizza ananas ?"]),
                                   options: [{ texte: "Oui", votes: int(10, 5000) }, { texte: "Non", votes: int(10, 5000) }] };
  if (rnd() < 0.2) v.produit = pick(produits);
  if (rnd() < 0.3) v.sousTitres = some(["fr", "en", "es", "ar", "it"], int(1, 3));
  if (rnd() < 0.1) v.filtre = pick(["vintage", "glow", "noir&blanc", "ia-anime"]);
  if (rnd() < 0.05) v.epingle = true;
  videos.push(v);
}
db.videos.insertMany(videos);

// ---------------- COMMENTS (500) ----------------
const textes = ["premier 🥇","c'est quoi le son ?","le prof qui voit ça 💀","tuto pour la transition ?","je suis la 1 000e vue",
 "pas vrai, la base plante à 100 req/s","POV : t'as compris la jointure","ça c'est du contenu","likez pour que je passe le partiel",
 "pourquoi le chat a plus d'abonnés que moi","le NoSQL c'est juste du JSON non ?","réponds 🙏","🔥🔥🔥","quel modèle de trottinette ?","faux"];
const comments = [];
for (let i = 1; i <= 500; i++) {
  const c = {
    _id: oid(5000 + i),
    video: pick(videos)._id,
    auteur: pick(users)._id,
    texte: pick(textes),
    likes: int(0, 900),
    posteLe: date(2026, int(1, 10), int(1, 28), int(0, 23)),
  };
  if (rnd() < 0.3) c.reponses = Array.from({ length: int(1, 3) }, () => ({ auteur: pick(users)._id, texte: pick(textes), likes: int(0, 50) }));
  if (rnd() < 0.05) c.signale = { motif: pick(["spam", "haine", "hors-sujet"]), le: date(2026, 10, int(1, 28)) };
  comments.push(c);
}
db.comments.insertMany(comments);

// ---------------- EVENTS (2000) : vue / like / skip / replay ----------------
const events = [];
for (let i = 1; i <= 2000; i++) {
  const type = pick(["vue", "vue", "vue", "vue", "like", "skip", "skip", "replay"]);
  const e = {
    type,
    video: pick(videos)._id,
    user: pick(users)._id,
    ts: date(2026, 10, int(25, 31), int(0, 23)),
    appareil: pick(["ios", "android", "android", "web"]),
  };
  if (type === "vue" || type === "skip") e.dureeVue = int(1, 60);
  events.push(e);
}
db.events.insertMany(events);

// ---------------- INDEX ----------------
db.users.createIndex({ pseudo: 1 }, { unique: true });
db.videos.createIndex({ hashtags: 1 });
db.videos.createIndex({ auteur: 1, publieLe: -1 });
db.videos.createIndex({ titre: "text" });
db.videos.createIndex({ lieu: "2dsphere" }, { sparse: true });
db.events.createIndex({ ts: 1 });

print("✅ Base 'zwipe' prête :");
print("   users    : " + db.users.countDocuments());
print("   videos   : " + db.videos.countDocuments());
print("   comments : " + db.comments.countDocuments());
print("   events   : " + db.events.countDocuments());
