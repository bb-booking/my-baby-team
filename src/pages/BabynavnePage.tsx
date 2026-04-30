import { useState, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Heart, X, RotateCcw, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Name database ─────────────────────────────────────────────────────────────
// g: p=pige, d=dreng, u=unisex
// c: pop=Populære, nor=Nordisk, int=Internationalt, k30=1930-1950,
//    r50=1950-1970, s70=1970-1990, mod=Moderne, nat=Naturnavne

interface BabyName { n: string; g: "p"|"d"|"u"; c: string[]; }

const ALL_NAMES: BabyName[] = [
  // ── PIGE ──────────────────────────────────────────────────────────────────
  // Populære
  { n:"Alma",       g:"p", c:["pop","mod"] },
  { n:"Freja",      g:"p", c:["pop","nor"] },
  { n:"Ella",       g:"p", c:["pop","int"] },
  { n:"Clara",      g:"p", c:["pop","int"] },
  { n:"Emma",       g:"p", c:["pop","int"] },
  { n:"Olivia",     g:"p", c:["pop","int"] },
  { n:"Maja",       g:"p", c:["pop","nor"] },
  { n:"Isabella",   g:"p", c:["pop","int"] },
  { n:"Sofia",      g:"p", c:["pop","int"] },
  { n:"Victoria",   g:"p", c:["pop","int"] },
  { n:"Anna",       g:"p", c:["pop","nor","k30"] },
  { n:"Agnes",      g:"p", c:["pop","nor"] },
  { n:"Nora",       g:"p", c:["pop","int"] },
  { n:"Astrid",     g:"p", c:["pop","nor"] },
  { n:"Lærke",      g:"p", c:["pop","nor","nat"] },
  { n:"Ida",        g:"p", c:["pop","nor"] },
  { n:"Sara",       g:"p", c:["pop","int"] },
  { n:"Emilie",     g:"p", c:["pop","s70"] },
  { n:"Laura",      g:"p", c:["pop","s70"] },
  { n:"Mathilde",   g:"p", c:["pop","s70"] },
  { n:"Josefine",   g:"p", c:["pop","s70"] },
  { n:"Karoline",   g:"p", c:["pop","s70"] },
  { n:"Cecilie",    g:"p", c:["pop","s70"] },
  { n:"Julie",      g:"p", c:["pop","s70"] },
  { n:"Camille",    g:"p", c:["pop","int"] },
  { n:"Sofie",      g:"p", c:["pop","s70"] },
  { n:"Amalie",     g:"p", c:["pop","s70"] },
  { n:"Katrine",    g:"p", c:["pop","s70"] },
  { n:"Helena",     g:"p", c:["pop","int"] },
  { n:"Liva",       g:"p", c:["pop","mod"] },
  { n:"Filippa",    g:"p", c:["pop","nor"] },
  { n:"Ronja",      g:"p", c:["pop","nor"] },
  { n:"Ellen",      g:"p", c:["pop","k30"] },
  { n:"Nanna",      g:"p", c:["pop","nor"] },
  { n:"Asta",       g:"p", c:["pop","nor"] },
  { n:"Frida",      g:"p", c:["pop","nor","mod"] },
  { n:"Rosa",       g:"p", c:["pop","mod","nat"] },
  { n:"Vera",       g:"p", c:["pop","k30","mod"] },
  { n:"Lea",        g:"p", c:["pop","mod"] },
  { n:"Line",       g:"p", c:["pop","s70"] },
  // Nordisk
  { n:"Sigrid",     g:"p", c:["nor"] },
  { n:"Ragnhild",   g:"p", c:["nor","k30"] },
  { n:"Ingrid",     g:"p", c:["nor","k30"] },
  { n:"Gunhild",    g:"p", c:["nor","k30"] },
  { n:"Thyra",      g:"p", c:["nor"] },
  { n:"Dagmar",     g:"p", c:["nor","k30"] },
  { n:"Valborg",    g:"p", c:["nor","k30"] },
  { n:"Signe",      g:"p", c:["nor","s70"] },
  { n:"Tuva",       g:"p", c:["nor","mod"] },
  { n:"Saga",       g:"p", c:["nor","mod"] },
  { n:"Solveig",    g:"p", c:["nor","nat"] },
  { n:"Runa",       g:"p", c:["nor","mod"] },
  { n:"Ylva",       g:"p", c:["nor","mod"] },
  { n:"Gudrun",     g:"p", c:["nor","k30"] },
  { n:"Thora",      g:"p", c:["nor","k30"] },
  { n:"Hilde",      g:"p", c:["nor"] },
  { n:"Bjørk",      g:"p", c:["nor","nat"] },
  { n:"Urd",        g:"p", c:["nor"] },
  { n:"Tonje",      g:"p", c:["nor"] },
  { n:"Bodil",      g:"p", c:["nor","k30"] },
  { n:"Brynhild",   g:"p", c:["nor"] },
  { n:"Tora",       g:"p", c:["nor"] },
  { n:"Vigdis",     g:"p", c:["nor"] },
  // International
  { n:"Charlotte",  g:"p", c:["int","s70"] },
  { n:"Amelia",     g:"p", c:["int","mod"] },
  { n:"Ava",        g:"p", c:["int","mod"] },
  { n:"Mia",        g:"p", c:["int","mod"] },
  { n:"Harper",     g:"p", c:["int","mod"] },
  { n:"Evelyn",     g:"p", c:["int"] },
  { n:"Luna",       g:"p", c:["int","mod","nat"] },
  { n:"Camila",     g:"p", c:["int"] },
  { n:"Penelope",   g:"p", c:["int"] },
  { n:"Layla",      g:"p", c:["int","mod"] },
  { n:"Scarlett",   g:"p", c:["int","mod"] },
  { n:"Violet",     g:"p", c:["int","nat","mod"] },
  { n:"Aurora",     g:"p", c:["int","nor","nat","mod"] },
  { n:"Chloe",      g:"p", c:["int","mod"] },
  { n:"Zoey",       g:"p", c:["int","mod"] },
  { n:"Elena",      g:"p", c:["int"] },
  { n:"Leah",       g:"p", c:["int"] },
  { n:"Aria",       g:"p", c:["int","mod"] },
  { n:"Grace",      g:"p", c:["int"] },
  { n:"Hannah",     g:"p", c:["int"] },
  { n:"Lily",       g:"p", c:["int","nat"] },
  { n:"Natalie",    g:"p", c:["int"] },
  { n:"Stella",     g:"p", c:["int","mod"] },
  { n:"Zoe",        g:"p", c:["int","mod"] },
  { n:"Hazel",      g:"p", c:["int","nat","mod"] },
  { n:"Ellie",      g:"p", c:["int","mod"] },
  { n:"Savannah",   g:"p", c:["int"] },
  { n:"Bella",      g:"p", c:["int","mod"] },
  { n:"Audrey",     g:"p", c:["int"] },
  { n:"Claire",     g:"p", c:["int"] },
  { n:"Lucy",       g:"p", c:["int"] },
  { n:"Nova",       g:"p", c:["int","mod","nat"] },
  { n:"Maya",       g:"p", c:["int","mod"] },
  { n:"Sienna",     g:"p", c:["int","mod"] },
  { n:"Isla",       g:"p", c:["int","mod"] },
  { n:"Ivy",        g:"p", c:["int","nat","mod"] },
  { n:"Willow",     g:"p", c:["int","nat","mod"] },
  { n:"Freya",      g:"p", c:["int","nor"] },
  { n:"Elise",      g:"p", c:["int","mod"] },
  { n:"Iris",       g:"p", c:["int","nat"] },
  { n:"Rose",       g:"p", c:["int","nat"] },
  { n:"Lena",       g:"p", c:["int","r50"] },
  { n:"Nina",       g:"p", c:["int","s70"] },
  { n:"Mila",       g:"p", c:["int","mod"] },
  { n:"Nadia",      g:"p", c:["int"] },
  { n:"Alicia",     g:"p", c:["int"] },
  { n:"Sophia",     g:"p", c:["int","mod"] },
  // Klassisk 1930-1950
  { n:"Kirsten",    g:"p", c:["k30"] },
  { n:"Else",       g:"p", c:["k30"] },
  { n:"Birthe",     g:"p", c:["k30"] },
  { n:"Grethe",     g:"p", c:["k30"] },
  { n:"Inge",       g:"p", c:["k30"] },
  { n:"Lis",        g:"p", c:["k30"] },
  { n:"Ruth",       g:"p", c:["k30"] },
  { n:"Gerda",      g:"p", c:["k30"] },
  { n:"Edith",      g:"p", c:["k30"] },
  { n:"Rigmor",     g:"p", c:["k30"] },
  { n:"Johanne",    g:"p", c:["k30","nor"] },
  { n:"Margrethe",  g:"p", c:["k30"] },
  { n:"Helga",      g:"p", c:["k30","nor"] },
  { n:"Agnete",     g:"p", c:["k30","nor"] },
  { n:"Karen",      g:"p", c:["k30"] },
  { n:"Birgit",     g:"p", c:["k30"] },
  { n:"Margit",     g:"p", c:["k30"] },
  { n:"Lilly",      g:"p", c:["k30"] },
  { n:"Ebba",       g:"p", c:["k30","nor"] },
  { n:"Elna",       g:"p", c:["k30"] },
  { n:"Esther",     g:"p", c:["k30"] },
  { n:"Meta",       g:"p", c:["k30"] },
  // Retro 1950-1970
  { n:"Bente",      g:"p", c:["r50"] },
  { n:"Hanne",      g:"p", c:["r50"] },
  { n:"Susanne",    g:"p", c:["r50"] },
  { n:"Lone",       g:"p", c:["r50"] },
  { n:"Vibeke",     g:"p", c:["r50"] },
  { n:"Jette",      g:"p", c:["r50"] },
  { n:"Tove",       g:"p", c:["r50","nor"] },
  { n:"Pernille",   g:"p", c:["r50","s70"] },
  { n:"Lisbeth",    g:"p", c:["r50"] },
  { n:"Annelise",   g:"p", c:["r50"] },
  { n:"Gitte",      g:"p", c:["r50"] },
  { n:"Ulla",       g:"p", c:["r50"] },
  { n:"Marianne",   g:"p", c:["r50"] },
  { n:"Birte",      g:"p", c:["r50"] },
  { n:"Lene",       g:"p", c:["r50","s70"] },
  { n:"Dorte",      g:"p", c:["r50"] },
  { n:"Pia",        g:"p", c:["r50"] },
  { n:"Tina",       g:"p", c:["r50"] },
  { n:"Anni",       g:"p", c:["r50"] },
  { n:"Merete",     g:"p", c:["r50"] },
  { n:"Anette",     g:"p", c:["r50"] },
  { n:"Helle",      g:"p", c:["r50"] },
  { n:"Mette",      g:"p", c:["r50","s70"] },
  { n:"Connie",     g:"p", c:["r50"] },
  // 1970-1990
  { n:"Camilla",    g:"p", c:["s70"] },
  { n:"Stine",      g:"p", c:["s70"] },
  { n:"Trine",      g:"p", c:["s70"] },
  { n:"Louise",     g:"p", c:["s70"] },
  { n:"Maria",      g:"p", c:["s70","int"] },
  { n:"Anne",       g:"p", c:["s70","k30"] },
  { n:"Lotte",      g:"p", c:["s70"] },
  { n:"Heidi",      g:"p", c:["s70","int"] },
  { n:"Karin",      g:"p", c:["s70","k30"] },
  { n:"Christina",  g:"p", c:["s70","int"] },
  { n:"Simone",     g:"p", c:["s70","int"] },
  { n:"Sandra",     g:"p", c:["s70","int"] },
  { n:"Sabrina",    g:"p", c:["s70","int"] },
  { n:"Randi",      g:"p", c:["s70"] },
  // Moderne 2000+
  { n:"Billie",     g:"p", c:["mod","int"] },
  { n:"Indie",      g:"p", c:["mod"] },
  { n:"Naja",       g:"p", c:["mod","nor"] },
  { n:"Molly",      g:"p", c:["mod","int"] },
  { n:"Wren",       g:"u", c:["mod","nat"] },
  { n:"Quinn",      g:"u", c:["mod","int"] },
  { n:"Sloane",     g:"p", c:["mod","int"] },
  { n:"Sage",       g:"u", c:["mod","nat"] },
  { n:"Naia",       g:"p", c:["mod"] },
  { n:"Zoë",        g:"p", c:["mod","int"] },
  // Natur
  { n:"Flora",      g:"p", c:["nat","int"] },
  { n:"Daisy",      g:"p", c:["nat","int"] },
  { n:"Fern",       g:"p", c:["nat","int"] },
  { n:"Skye",       g:"u", c:["nat","int","mod"] },
  { n:"Storm",      g:"u", c:["nat","nor"] },
  { n:"Aster",      g:"p", c:["nat","mod"] },

  // ── DRENG ─────────────────────────────────────────────────────────────────
  // Populære
  { n:"Noah",       g:"d", c:["pop","int","mod"] },
  { n:"Elias",      g:"d", c:["pop","mod"] },
  { n:"Oliver",     g:"d", c:["pop","int"] },
  { n:"William",    g:"d", c:["pop","int"] },
  { n:"Alfred",     g:"d", c:["pop","int"] },
  { n:"Viktor",     g:"d", c:["pop","int"] },
  { n:"Emil",       g:"d", c:["pop","nor"] },
  { n:"Viggo",      g:"d", c:["pop","nor"] },
  { n:"Magnus",     g:"d", c:["pop","nor"] },
  { n:"Liam",       g:"d", c:["pop","int","mod"] },
  { n:"Alexander",  g:"d", c:["pop","int"] },
  { n:"Sebastian",  g:"d", c:["pop","int"] },
  { n:"Mikkel",     g:"d", c:["pop","s70"] },
  { n:"Christian",  g:"d", c:["pop","s70"] },
  { n:"Lucas",      g:"d", c:["pop","int"] },
  { n:"Marcus",     g:"d", c:["pop","int"] },
  { n:"Tobias",     g:"d", c:["pop","int"] },
  { n:"Mathias",    g:"d", c:["pop","s70"] },
  { n:"Jonas",      g:"d", c:["pop","s70"] },
  { n:"Simon",      g:"d", c:["pop","s70"] },
  { n:"Rasmus",     g:"d", c:["pop","s70"] },
  { n:"Frederik",   g:"d", c:["pop","s70"] },
  { n:"Oscar",      g:"d", c:["pop","int"] },
  { n:"Benjamin",   g:"d", c:["pop","int"] },
  { n:"Malthe",     g:"d", c:["pop","nor"] },
  { n:"Elliot",     g:"d", c:["pop","int","mod"] },
  { n:"Theo",       g:"d", c:["pop","int","mod"] },
  { n:"Thor",       g:"d", c:["pop","nor"] },
  { n:"Axel",       g:"d", c:["pop","nor"] },
  { n:"Felix",      g:"d", c:["pop","int","mod"] },
  { n:"Hugo",       g:"d", c:["pop","int","mod"] },
  { n:"Mads",       g:"d", c:["pop","nor"] },
  { n:"Adam",       g:"d", c:["pop","int"] },
  { n:"Kasper",     g:"d", c:["pop","s70"] },
  { n:"Nikolaj",    g:"d", c:["pop","s70"] },
  { n:"Daniel",     g:"d", c:["pop","int"] },
  { n:"Jakob",      g:"d", c:["pop","s70"] },
  { n:"Villads",    g:"d", c:["pop","nor"] },
  { n:"Bertram",    g:"d", c:["pop","nor"] },
  { n:"Valdemar",   g:"d", c:["pop","nor"] },
  { n:"Anton",      g:"d", c:["pop","int","mod"] },
  { n:"Albert",     g:"d", c:["pop","int","mod"] },
  { n:"Arthur",     g:"d", c:["pop","int","mod"] },
  { n:"Louis",      g:"d", c:["pop","int","mod"] },
  // Nordisk
  { n:"Odin",       g:"d", c:["nor"] },
  { n:"Freyr",      g:"d", c:["nor"] },
  { n:"Tyr",        g:"d", c:["nor"] },
  { n:"Baldur",     g:"d", c:["nor"] },
  { n:"Bjørn",      g:"d", c:["nor"] },
  { n:"Sigurd",     g:"d", c:["nor"] },
  { n:"Gunnar",     g:"d", c:["nor","k30"] },
  { n:"Ragnar",     g:"d", c:["nor"] },
  { n:"Leif",       g:"d", c:["nor"] },
  { n:"Erik",       g:"d", c:["nor","k30"] },
  { n:"Ivar",       g:"d", c:["nor"] },
  { n:"Haakon",     g:"d", c:["nor"] },
  { n:"Halvdan",    g:"d", c:["nor"] },
  { n:"Olav",       g:"d", c:["nor","k30"] },
  { n:"Rolf",       g:"d", c:["nor"] },
  { n:"Ulf",        g:"d", c:["nor"] },
  { n:"Vidar",      g:"d", c:["nor"] },
  { n:"Birk",       g:"d", c:["nor","nat","mod"] },
  { n:"Knud",       g:"d", c:["nor","k30"] },
  { n:"Svend",      g:"d", c:["nor","k30"] },
  { n:"Harald",     g:"d", c:["nor","k30"] },
  { n:"Gorm",       g:"d", c:["nor"] },
  { n:"Tyge",       g:"d", c:["nor"] },
  { n:"Troels",     g:"d", c:["nor","s70"] },
  { n:"Einar",      g:"d", c:["nor","k30"] },
  { n:"Asger",      g:"d", c:["nor","mod"] },
  { n:"Dag",        g:"d", c:["nor"] },
  { n:"Orm",        g:"d", c:["nor"] },
  { n:"Skjold",     g:"d", c:["nor"] },
  { n:"Rune",       g:"d", c:["nor","s70","mod"] },
  { n:"Torben",     g:"d", c:["nor","r50"] },
  { n:"Snorre",     g:"d", c:["nor"] },
  // International
  { n:"Elijah",     g:"d", c:["int","mod"] },
  { n:"James",      g:"d", c:["int"] },
  { n:"Henry",      g:"d", c:["int"] },
  { n:"Mason",      g:"d", c:["int","mod"] },
  { n:"Ethan",      g:"d", c:["int","mod"] },
  { n:"Logan",      g:"d", c:["int","mod"] },
  { n:"Jack",       g:"d", c:["int"] },
  { n:"Aiden",      g:"d", c:["int","mod"] },
  { n:"Owen",       g:"d", c:["int"] },
  { n:"Samuel",     g:"d", c:["int"] },
  { n:"Ryan",       g:"d", c:["int"] },
  { n:"Nathan",     g:"d", c:["int"] },
  { n:"Leo",        g:"d", c:["int","mod"] },
  { n:"Gabriel",    g:"d", c:["int"] },
  { n:"Anthony",    g:"d", c:["int"] },
  { n:"Isaac",      g:"d", c:["int"] },
  { n:"Julian",     g:"d", c:["int"] },
  { n:"Levi",       g:"d", c:["int","mod"] },
  { n:"Joshua",     g:"d", c:["int"] },
  { n:"Caleb",      g:"d", c:["int"] },
  { n:"David",      g:"d", c:["int"] },
  { n:"Wyatt",      g:"d", c:["int","mod"] },
  { n:"Luke",       g:"d", c:["int"] },
  { n:"Jasper",     g:"d", c:["int","mod"] },
  { n:"Finn",       g:"d", c:["int","nor","mod"] },
  { n:"Kit",        g:"u", c:["int","mod"] },
  { n:"Arlo",       g:"d", c:["int","mod"] },
  { n:"Milo",       g:"d", c:["int","mod"] },
  { n:"Luca",       g:"d", c:["int","mod"] },
  { n:"Atlas",      g:"d", c:["int","mod"] },
  { n:"Eli",        g:"d", c:["int","mod"] },
  { n:"Ezra",       g:"d", c:["int","mod"] },
  { n:"Kai",        g:"u", c:["int","nor","mod"] },
  { n:"Soren",      g:"d", c:["int","nor"] },
  { n:"Thomas",     g:"d", c:["int","r50","s70"] },
  { n:"Peter",      g:"d", c:["int","r50"] },
  { n:"Michael",    g:"d", c:["int","r50"] },
  // Klassisk 1930-1950
  { n:"Poul",       g:"d", c:["k30"] },
  { n:"Bent",       g:"d", c:["k30"] },
  { n:"Arne",       g:"d", c:["k30","nor"] },
  { n:"Jens",       g:"d", c:["k30","nor"] },
  { n:"Mogens",     g:"d", c:["k30"] },
  { n:"Børge",      g:"d", c:["k30"] },
  { n:"Preben",     g:"d", c:["k30"] },
  { n:"Helge",      g:"d", c:["k30","nor"] },
  { n:"Ejnar",      g:"d", c:["k30"] },
  { n:"Holger",     g:"d", c:["k30","nor"] },
  { n:"Vagn",       g:"d", c:["k30"] },
  { n:"Aage",       g:"d", c:["k30"] },
  { n:"Flemming",   g:"d", c:["k30","r50"] },
  { n:"Aksel",      g:"d", c:["k30","nor"] },
  { n:"Henning",    g:"d", c:["k30"] },
  { n:"Kaj",        g:"d", c:["k30","nor"] },
  { n:"Oluf",       g:"d", c:["k30"] },
  { n:"Laurits",    g:"d", c:["k30"] },
  { n:"Hans",       g:"d", c:["k30"] },
  { n:"Carl",       g:"d", c:["k30","int"] },
  { n:"Niels",      g:"d", c:["k30","nor"] },
  { n:"Finn",       g:"d", c:["k30","r50","nor","mod"] },
  { n:"Ib",         g:"d", c:["k30"] },
  { n:"Orla",       g:"d", c:["k30"] },
  { n:"Tage",       g:"d", c:["k30"] },
  { n:"Willy",      g:"d", c:["k30"] },
  // Retro 1950-1970
  { n:"Søren",      g:"d", c:["r50","nor"] },
  { n:"Henrik",     g:"d", c:["r50","int"] },
  { n:"Jan",        g:"d", c:["r50","int"] },
  { n:"Claus",      g:"d", c:["r50","s70"] },
  { n:"Lars",       g:"d", c:["r50","nor"] },
  { n:"Jesper",     g:"d", c:["r50","s70"] },
  { n:"Kim",        g:"u", c:["r50"] },
  { n:"Brian",      g:"d", c:["r50","int"] },
  { n:"Carsten",    g:"d", c:["r50"] },
  { n:"Morten",     g:"d", c:["r50","s70"] },
  { n:"Ole",        g:"d", c:["r50","nor"] },
  { n:"John",       g:"d", c:["r50","int"] },
  { n:"Kent",       g:"d", c:["r50","int"] },
  { n:"Palle",      g:"d", c:["r50"] },
  { n:"Jørgen",     g:"d", c:["r50"] },
  { n:"Per",        g:"d", c:["r50"] },
  { n:"Frank",      g:"d", c:["r50","int"] },
  { n:"René",       g:"d", c:["r50","int"] },
  { n:"Allan",      g:"d", c:["r50","s70"] },
  // 1970-1990
  { n:"Anders",     g:"d", c:["s70","nor"] },
  { n:"Martin",     g:"d", c:["s70","int"] },
  { n:"Stefan",     g:"d", c:["s70","int"] },
  { n:"Klaus",      g:"d", c:["s70","int"] },
  { n:"Marc",       g:"d", c:["s70","int"] },
  { n:"Bo",         g:"d", c:["s70","nor"] },
  { n:"Lasse",      g:"d", c:["s70","nor"] },
  { n:"Steffen",    g:"d", c:["s70"] },
  { n:"Dennis",     g:"d", c:["s70","int"] },
  { n:"Tommy",      g:"d", c:["s70","int"] },
  { n:"Andreas",    g:"d", c:["s70","int"] },
  { n:"Nicolai",    g:"d", c:["s70"] },
  // Moderne 2000+
  { n:"Victor",     g:"d", c:["mod","int"] },
  { n:"Augustin",   g:"d", c:["mod","int"] },
  { n:"Konrad",     g:"d", c:["mod","nor","int"] },
  { n:"Ludvig",     g:"d", c:["mod","k30"] },
  { n:"Tristan",    g:"d", c:["mod","int"] },
  { n:"Zephyr",     g:"d", c:["mod","int"] },
  { n:"River",      g:"u", c:["mod","nat","int"] },
  { n:"Cai",        g:"d", c:["mod","nor"] },
  // Natur
  { n:"Elm",        g:"d", c:["nat","nor"] },
  { n:"Ask",        g:"d", c:["nat","nor"] },
  { n:"Eg",         g:"d", c:["nat","nor"] },
  { n:"Sten",       g:"d", c:["nat","nor"] },
  { n:"Rowan",      g:"u", c:["nat","int"] },
  { n:"Glen",       g:"d", c:["nat","int"] },
  { n:"Reed",       g:"d", c:["nat","int"] },
  { n:"Flint",      g:"d", c:["nat","int"] },
  { n:"Heath",      g:"d", c:["nat","int"] },
  { n:"Lund",       g:"d", c:["nat","nor"] },
];

// ── Category definitions ───────────────────────────────────────────────────

const CATEGORIES = [
  { key: "pop", label: "🔥 Populære" },
  { key: "nor", label: "⚡ Nordisk" },
  { key: "int", label: "🌍 Internationalt" },
  { key: "k30", label: "🕰️ 1930–1950" },
  { key: "r50", label: "🎵 1950–1970" },
  { key: "s70", label: "📻 1970–1990" },
  { key: "mod", label: "✨ Moderne" },
  { key: "nat", label: "🌿 Natur" },
];

// ── Persistence ────────────────────────────────────────────────────────────

const LIKES_KEY  = (r: string) => `melo-name-likes-${r}`;
const SEEN_KEY   = (r: string) => `melo-name-seen-${r}`;
const CUSTOM_KEY = "melo-names-custom";

function loadArr(k: string): string[] {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function saveArr(k: string, v: string[]) { localStorage.setItem(k, JSON.stringify(v)); }

type Gender = "begge" | "pige" | "dreng";
type View   = "swipe" | "matches" | "custom";

// ── Swipe card ─────────────────────────────────────────────────────────────

function NameCard({ name, onLike, onSkip, isTop, accentBg, accentSolid, accentSolidText }: {
  name: string; onLike: () => void; onSkip: () => void; isTop: boolean;
  accentBg: string; accentSolid: string; accentSolidText: string;
}) {
  const [dir, setDir] = useState<"left"|"right"|null>(null);

  const fire = (d: "left"|"right", cb: () => void) => {
    setDir(d);
    setTimeout(() => { setDir(null); cb(); }, 260);
  };

  return (
    <div
      className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center"
      style={{
        background: isTop ? "white" : "hsl(var(--warm-white))",
        border: `1.5px solid hsl(var(--stone-light))`,
        transform: dir === "right" ? "translateX(120%) rotate(18deg)"
          : dir === "left" ? "translateX(-120%) rotate(-18deg)"
          : isTop ? "scale(1)" : "scale(0.95) translateY(14px)",
        transition: dir ? "transform 0.26s cubic-bezier(.36,.07,.19,.97)" : "transform 0.2s ease",
        opacity: isTop ? 1 : 0.45,
        zIndex: isTop ? 2 : 1,
        pointerEvents: isTop ? "auto" : "none",
        boxShadow: isTop ? "0 8px 32px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <p className="text-[3rem] font-light tracking-tight" style={{ color: "hsl(var(--bark))" }}>
        {name}
      </p>
      <div className="flex gap-8 mt-10">
        <button
          onClick={() => fire("left", onSkip)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
          style={{ background: "hsl(var(--stone-lighter))", border: "1.5px solid hsl(var(--stone-light))" }}
        >
          <X className="w-7 h-7 text-muted-foreground" />
        </button>
        <button
          onClick={() => fire("right", onLike)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
          style={{ background: accentBg, border: `1.5px solid ${accentSolid}` }}
        >
          <Heart className="w-7 h-7" style={{ color: accentSolidText === "white" ? "white" : "hsl(var(--bark))" }} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BabynavnePage() {
  const { profile } = useFamily();
  const role   = profile.role;
  const isMor  = role === "mor";
  const other  = isMor ? "far" : "mor";

  const accentBg        = isMor ? "hsl(var(--clay-light))"  : "hsl(var(--sage-light))";
  const accentText      = isMor ? "hsl(var(--bark))"         : "hsl(var(--moss))";
  const accentSolid     = isMor ? "hsl(var(--clay))"         : "hsl(var(--moss))";
  const accentSolidText = isMor ? "hsl(var(--bark))"         : "white";

  const [gender,     setGender]     = useState<Gender>("begge");
  const [cats,       setCats]       = useState<string[]>([]);
  const [view,       setView]       = useState<View>("swipe");
  const [myLikes,    setMyLikes]    = useState<string[]>(() => loadArr(LIKES_KEY(role)));
  const [seen,       setSeen]       = useState<string[]>(() => loadArr(SEEN_KEY(role)));
  const [partnerLikes,setPartnerLikes] = useState<string[]>(() => loadArr(LIKES_KEY(other)));
  const [customNames,setCustomNames]= useState<string[]>(() => loadArr(CUSTOM_KEY));
  const [newName,    setNewName]    = useState("");
  const [matchAnim,  setMatchAnim]  = useState<string|null>(null);

  // Re-read partner likes when switching to matches
  useEffect(() => {
    if (view === "matches") setPartnerLikes(loadArr(LIKES_KEY(other)));
  }, [view, other]);

  const toggleCat = (k: string) =>
    setCats(prev => prev.includes(k) ? prev.filter(c => c !== k) : [...prev, k]);

  // Build filtered pool
  const pool = ALL_NAMES.filter(item => {
    if (gender === "pige"  && item.g !== "p" && item.g !== "u") return false;
    if (gender === "dreng" && item.g !== "d" && item.g !== "u") return false;
    if (cats.length > 0 && !cats.some(c => item.c.includes(c))) return false;
    if (seen.includes(item.n)) return false;
    return true;
  }).map(i => i.n);

  const poolWithCustom = [...pool, ...customNames.filter(n => !seen.includes(n))];
  const topName  = poolWithCustom[0] ?? null;
  const nextName = poolWithCustom[1] ?? null;

  const matches = myLikes.filter(n => partnerLikes.includes(n));

  const resetSeen = () => {
    setSeen([]); saveArr(SEEN_KEY(role), []);
  };

  const handleLike = () => {
    if (!topName) return;
    const newLikes = myLikes.includes(topName) ? myLikes : [...myLikes, topName];
    const newSeen  = [...seen, topName];
    setMyLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
    setSeen(newSeen);     saveArr(SEEN_KEY(role), newSeen);
    if (partnerLikes.includes(topName)) {
      setMatchAnim(topName);
      setTimeout(() => setMatchAnim(null), 2800);
    }
  };

  const handleSkip = () => {
    if (!topName) return;
    const newSeen = [...seen, topName];
    setSeen(newSeen); saveArr(SEEN_KEY(role), newSeen);
  };

  const addCustom = () => {
    if (!newName.trim()) return;
    const n = newName.trim();
    if (customNames.includes(n)) return;
    const updated = [...customNames, n];
    setCustomNames(updated); saveArr(CUSTOM_KEY, updated);
    const newLikes = [...myLikes, n];
    setMyLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
    setNewName("");
  };

  const removeCustom = (n: string) => {
    const upd = customNames.filter(c => c !== n);
    setCustomNames(upd); saveArr(CUSTOM_KEY, upd);
    const newLikes = myLikes.filter(l => l !== n);
    setMyLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
  };

  const partnerLabel = profile.partnerName || (isMor ? "Far" : "Mor");
  const hasPartner   = profile.hasPartner !== false;

  return (
    <div className="space-y-4">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Babynavne</h1>
        <p className="label-upper mt-1">STEM PÅ JERES FAVORITTER</p>
      </div>

      {/* Match overlay */}
      {matchAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-3xl px-10 py-8 text-center shadow-2xl section-fade-in"
            style={{ background: accentBg, border: `2px solid ${accentSolid}` }}>
            <p className="text-[2.5rem]">💛</p>
            <p className="text-[1.6rem] font-semibold mt-1" style={{ color: accentText }}>MATCH!</p>
            <p className="text-[1.1rem] mt-1" style={{ color: accentText }}>{matchAnim}</p>
            <p className="text-[0.72rem] text-muted-foreground mt-2">I er begge vilde med det navn</p>
          </div>
        </div>
      )}

      {/* Gender filter */}
      <div className="flex gap-2 section-fade-in" style={{ animationDelay: "40ms" }}>
        {(["begge","pige","dreng"] as Gender[]).map(g => (
          <button key={g}
            onClick={() => { setGender(g); resetSeen(); }}
            className="flex-1 py-2 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
            style={{
              background: gender === g ? accentSolid : "hsl(var(--stone-lighter))",
              color: gender === g ? accentSolidText : "hsl(var(--muted-foreground))",
            }}>
            {g === "begge" ? "Alle" : g === "pige" ? "👧 Pige" : "👦 Dreng"}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="section-fade-in overflow-x-auto pb-1" style={{ animationDelay: "60ms" }}>
        <div className="flex gap-2 w-max">
          {CATEGORIES.map(cat => {
            const active = cats.includes(cat.key);
            return (
              <button key={cat.key}
                onClick={() => { toggleCat(cat.key); resetSeen(); }}
                className="px-3 py-1.5 rounded-full text-[0.7rem] font-medium whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                style={{
                  background: active ? accentSolid : "hsl(var(--stone-lighter))",
                  color: active ? accentSolidText : "hsl(var(--muted-foreground))",
                  border: active ? `1px solid ${accentSolid}` : "1px solid hsl(var(--stone-light))",
                }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[hsl(var(--stone-lighter))] section-fade-in" style={{ animationDelay: "80ms" }}>
        {([
          { key: "swipe"   as View, label: "Swipe" },
          { key: "matches" as View, label: matches.length > 0 ? `Matches (${matches.length})` : "Matches" },
          { key: "custom"  as View, label: "Egne" },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            className={cn("flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 -mb-px transition-all",
              view === tab.key ? "text-foreground" : "border-transparent text-muted-foreground")}
            style={{ borderBottomColor: view === tab.key ? accentSolid : "transparent" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SWIPE ── */}
      {view === "swipe" && (
        <div className="section-fade-in" style={{ animationDelay: "100ms" }}>
          {topName ? (
            <>
              <div className="relative mx-auto" style={{ height: 270, maxWidth: 340 }}>
                {nextName && (
                  <NameCard key={`n-${nextName}`} name={nextName}
                    onLike={() => {}} onSkip={() => {}} isTop={false}
                    accentBg={accentBg} accentSolid={accentSolid} accentSolidText={accentSolidText} />
                )}
                <NameCard key={`t-${topName}`} name={topName}
                  onLike={handleLike} onSkip={handleSkip} isTop={true}
                  accentBg={accentBg} accentSolid={accentSolid} accentSolidText={accentSolidText} />
              </div>

              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-[0.62rem] text-muted-foreground">{poolWithCustom.length} navne tilbage</p>
                <button onClick={resetSeen} className="flex items-center gap-1 text-[0.62rem] text-muted-foreground active:opacity-60">
                  <RotateCcw className="w-3 h-3" /> Nulstil
                </button>
              </div>

              {myLikes.length > 0 && (
                <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: accentBg }}>
                  <p className="text-[0.58rem] tracking-[0.14em] uppercase mb-2" style={{ color: accentText }}>
                    Dine favoritter ({myLikes.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {myLikes.map(n => (
                      <span key={n} className="px-3 py-1 rounded-full text-[0.78rem] font-medium"
                        style={{ background: "white", color: partnerLikes.includes(n) ? accentSolid : "hsl(var(--bark))" }}>
                        {partnerLikes.includes(n) ? `${n} 💛` : n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-14 space-y-3">
              <p className="text-4xl">🎉</p>
              <p className="text-[1rem] font-medium">Du har set alle navne!</p>
              <p className="text-[0.75rem] text-muted-foreground">
                {cats.length > 0 ? "Prøv at ændre filtrene for flere navne, eller" : ""}
                Du har liket {myLikes.length} navn{myLikes.length !== 1 ? "e" : ""}
              </p>
              <button onClick={resetSeen}
                className="mt-2 px-6 py-2.5 rounded-full text-[0.82rem] font-medium transition-all active:scale-95"
                style={{ background: accentSolid, color: accentSolidText }}>
                Start forfra
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MATCHES ── */}
      {view === "matches" && (
        <div className="space-y-3 section-fade-in" style={{ animationDelay: "100ms" }}>
          {hasPartner && matches.length > 0 ? (
            <>
              <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground">
                I er begge vilde med
              </p>
              <div className="space-y-2">
                {matches.map(n => (
                  <div key={n} className="rounded-2xl px-5 py-4 flex items-center justify-between"
                    style={{ background: accentBg, border: `1px solid ${accentSolid}30` }}>
                    <p className="text-[1.1rem] font-light" style={{ color: accentText }}>{n}</p>
                    <span className="text-xl">💛</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-14 space-y-2">
              <p className="text-4xl">💬</p>
              <p className="text-[0.95rem] font-medium">Ingen matches endnu</p>
              <p className="text-[0.75rem] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                {hasPartner
                  ? `Når ${partnerLabel} swiper på samme enhed, dukker fælles favoritter op her`
                  : "Swipe på navne og gem dine favoritter"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── EGNE NAVNE ── */}
      {view === "custom" && (
        <div className="space-y-3 section-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="card-soft space-y-3">
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">Tilføj eget navn</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="Skriv et navn..."
                className="flex-1 rounded-xl border px-3 py-2.5 text-[0.88rem] focus:outline-none transition-colors"
                style={{ borderColor: "hsl(var(--stone-light))", fontSize: "16px", background: "hsl(var(--cream))" }}
              />
              <button onClick={addCustom} disabled={!newName.trim()}
                className="px-4 rounded-xl font-medium text-[0.82rem] transition-all active:scale-95 disabled:opacity-40 flex items-center"
                style={{ background: accentSolid, color: accentSolidText }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {customNames.length > 0 ? (
            <div className="space-y-2">
              {customNames.map(n => (
                <div key={n} className="card-soft flex items-center justify-between">
                  <p className="text-[0.9rem]">{n}</p>
                  <button onClick={() => removeCustom(n)} className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[0.75rem] text-muted-foreground py-8">
              Ingen egne navne endnu
            </p>
          )}
        </div>
      )}
    </div>
  );
}
