/*
  Baza PVC sistema profila (Deceuninck, Salamander).
  Dubina = konstruktivna dubina okvira (frame) i krila (sash), u mm.
  Ako dubina krila nije poznata, upisano je null i koristi se dubina okvira.
  Za nove sisteme dodaj objekat u niz. Pre upotrebe proveri u katalogu proizvođača.

  Izvori:
  - Deceuninck Elegant: 76 / 84 / 115 mm dubina, ušće (rebate) 9 mm, staklo do 70 mm
    (elegant.deceuninck.com; frontale.de)
  - Salamander bluEvolution 82: dubina 82 mm (archiexpo.com)
  - Salamander 76 mm sistem: dubina 76 mm, staklo do 48 mm (archiexpo.com)
  - Salamander 73 mm (semi-recessed look): dubina 73 mm (archiexpo.com)
  - Salamander 92: dubina 92 mm, 6 komora (archiexpo.com)
*/
window.PROFILE_DB = [
  { id: "dec-elegant-76",  brand: "Deceuninck", name: "Elegant 76",  frame: 76,  sash: 76,   maxGlazing: 70, note: "Okvir 76 mm, ušće 9 mm" },
  { id: "dec-elegant-84",  brand: "Deceuninck", name: "Elegant 84",  frame: 84,  sash: 84,   maxGlazing: 70, note: "Dubina 84 mm (varijanta okvira)" },
  { id: "dec-elegant-115", brand: "Deceuninck", name: "Elegant 115", frame: 115, sash: null, maxGlazing: 70, note: "Dubina 115 mm (varijanta okvira)" },
  { id: "sal-blue-82",     brand: "Salamander", name: "bluEvolution 82", frame: 82, sash: null, maxGlazing: null, note: "Dubina 82 mm, pasivna kuća" },
  { id: "sal-76",          brand: "Salamander", name: "Sistem 76",  frame: 76,  sash: null, maxGlazing: 48, note: "5 komora, dubina 76 mm" },
  { id: "sal-73",          brand: "Salamander", name: "Sistem 73 (semi-recessed)", frame: 73, sash: null, maxGlazing: null, note: "Dubina 73 mm" },
  { id: "sal-92",          brand: "Salamander", name: "Sistem 92",  frame: 92,  sash: null, maxGlazing: null, note: "6 komora, dubina 92 mm" }
];
