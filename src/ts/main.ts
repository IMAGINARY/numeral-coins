import wallet from "./wallet";
import * as d3 from "d3-selection";
import {
  clearResults,
  createRadixMenu,
  createTextModal,
  makeWallet,
  newChallenge,
} from "./ui-functions";
import { levelIcons } from "./img-assets";

interface mode {
  id: number;
  type: "junior" | "senior";
  level: number;
  icon: string;
  priceInterval: number[];
}

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
    price: number;
    radix: number;
    seniorMode: boolean;
    juniorIndex: number;
    currentMode: mode;
    prizeImg: string;
    radixOptions: number[];
  }
}

/** GLOBAL VARIABLES */

let maxPrice = 400;
window.price = 145;
window.radix = 2;
window.seniorMode = false;
window.juniorIndex = 0;

const modesList = [
  {
    id: 1,
    type: "junior",
    level: 1,
    icon: "1",
    priceInterval: [1, 5],
  },
  {
    id: 2,
    type: "junior",
    level: 2,
    icon: "2",
    priceInterval: [5, 10],
  },
  {
    id: 3,
    type: "junior",
    level: 3,
    icon: "3",
    priceInterval: [10, 20],
  },
  {
    id: 4,
    type: "senior",
    level: 1,
    icon: "4",
    priceInterval: [1, 20],
  },
  {
    id: 5,
    type: "senior",
    level: 2,
    icon: "5",
    priceInterval: [20, 100],
  },
  {
    id: 6,
    type: "senior",
    level: 3,
    icon: "6",
    priceInterval: [100, 400],
  },
] as mode[];

window.currentMode = modesList[0];

/* MAIN SETUP */

// Create mode selector (radio)
const modeSelector = d3
  .select("#config-opts")
  .append("div")
  .attr("id", "mode-selector");

const modeItems = modeSelector
  .selectAll("label")
  .data(modesList)
  .enter()
  .append("label")
  .attr("class", (d) => `icon-level ${d.type}`);

modeItems
  .append("input")
  .attr("type", "radio")
  .attr("name", "modeRadio")
  .property("checked", (d) => d.id === 1)
  .on("change", (ev, d) => {
    clearResults();
    window.currentMode = d;
    console.log("mode changed", window.currentMode);

    if (window.currentMode.type === "junior") {
      createRadixMenu([2, 3, 4, 5, 10]);
      window.seniorMode = false;
    } else {
      createRadixMenu([2, 3, 4, 5, 10, 12, 16]);
      window.seniorMode = true;
    }
    newChallenge();
  });

modeItems
  .append("img")
  .attr("src", (d) => levelIcons[`level${d.icon}` as keyof typeof levelIcons])
  .attr("class", (d) => d.type);

// Create infoMenu

const infoMenu = d3
  .select("#config-opts")
  .append("div")
  .attr("id", "info-menu")
  .classed("dropdown", true)
  .classed("dropdown-left", true);

infoMenu
  .append("img")
  .attr("src", new URL("../img/info.png", import.meta.url).href);

const infoMenuOptions = [
  {
    id: "intro",
    title: "Introduction",
    textUrl: new URL("../txt/intro.html", import.meta.url),
  },
  {
    id: "prints",
    title: "3D prints",
    textUrl: new URL("../txt/prints.html", import.meta.url),
  },
  {
    id: "about",
    title: "About",
    textUrl: new URL("../txt/about.html", import.meta.url),
  },
];

infoMenu
  .append("ul")
  .selectAll("li")
  .data(infoMenuOptions)
  .enter()
  .append("li")
  .append((d) => createTextModal(d.id, d.title, d.textUrl));

// Create radix menu

const menu = d3.select("#menu");
menu.append("div").attr("id", "radix-menu-container");

createRadixMenu([2, 3, 4, 5, 10]);

// Create load prize button
menu
  .append("div")
  .append("img")
  .attr("src", new URL("../img/forward.png", import.meta.url).href)
  .attr("id", "prize-reload-button")
  .on("click", () => {
    clearResults();
    newChallenge();
    // window.seniorMode ? newChallenge() : newJuniorPrize();
    makeWallet();
  });

// Create current total wallet value display
const walletValue = menu.append("div").attr("id", "walletValue");

walletValue
  .append("img")
  .attr("id", "walletValue-img")
  .attr("src", new URL("../svg/3bags.svg#svg1", import.meta.url).href);

walletValue.append("span").attr("id", "total");

const prizeDiv = d3.select("#central").append("div").attr("id", "prize");

prizeDiv.append("img").attr("id", "prize-img");
prizeDiv.append("div").attr("id", "price");

d3.select("#central").append("div").attr("id", "results");

makeWallet();
newChallenge();
window.d3 = d3;
