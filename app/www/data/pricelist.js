/*
  Podrazumevani cenovnik.
  pdv: stopa PDV-a (%) koja se dodaje na osnovicu u predračunu.
  win / roll / mesh: cena po m² (prozor, roletna platno, komarnik), u valuti "currency".
  systems: procenat dodatka (+) ili popusta (−) za svaki sistem profila iz baze profiles.js.
  Korisnik može da menja cene u aplikaciji; izmene se čuvaju u pregledaču (localStorage).
*/
window.PRICELIST_DEFAULT = {
  currency: "€",
  win: 0,
  roll: 0,
  pdv: 20,
  mesh: 0,
  systems: {
    "dec-elegant-76": 0,
    "dec-elegant-84": 0,
    "dec-elegant-115": 0,
    "sal-blue-82": 0,
    "sal-76": 0,
    "sal-73": 0,
    "sal-92": 0
  }
};
