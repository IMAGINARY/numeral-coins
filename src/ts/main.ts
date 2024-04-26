import wallet from "./wallet";
import * as d3 from "d3-selection";
import { prizesImgs, juniorPrizes } from "./prizes";
import { createTextModal } from "./ui-functions";
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

/** AUX FUNCTIONS */

function makeWallet() {
  document.getElementById("wallet")?.remove();

  // calculate number of pockets
  let i = 0;

  if (window.currentMode.type === "junior") {
    for (i = 0; window.radix ** i - 1 < window.price; i += 1) {}
  } else {
    for (
      i = 0;
      window.radix ** i - 1 < window.currentMode.priceInterval[1];
      i += 1
    ) {}
  }
  console.log(`making wallet with ${i} pockets`);

  window.W = new wallet(window.radix, i);
}

function newChallenge() {
  // Set price
  window.price = Math.floor(
    window.currentMode.priceInterval[0] +
      Math.random() *
        (window.currentMode.priceInterval[1] -
          window.currentMode.priceInterval[0] +
          1)
  );

  // Set prize image

  window.prizeImg = prizesImgs[Math.floor(Math.random() * prizesImgs.length)];

  d3.select("#prize").select("img").attr("src", window.prizeImg);
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);

  d3.select("#price").text(window.price.toString());

  makeWallet();
}

function changeRadix(b: number) {
  window.radix = b;
  d3.select("#radix-display").text(b.toString());
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);
  clearResults();
  makeWallet();
}

function clearResults() {
  d3.select("#results").text("");
}

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

// // Create Senior mode selector
// const seniorSelector = d3
//   .select("#config-opts")
//   .append("div")
//   .attr("id", "senior-mode-ckb");

// seniorSelector
//   .append("img")
//   .attr("src", new URL("../img/eye.png", import.meta.url).href);

// seniorSelector.append("span").classed("checkbox-wrapper-49", true).html(`
//   <div class="block">
//     <input data-index="0" id="cheap-49" type="checkbox" />
//     <label for="cheap-49"></label>
//   </div>
// `);

// seniorSelector
//   .append("img")
//   .attr("src", new URL("../img/microscope.png", import.meta.url).href);

// d3.select("#cheap-49").on("change", () => {
//   window.seniorMode = d3.select("#cheap-49").property("checked");
//   if (window.W.checkGoal() && window.W.checkDecomposed()) {
//     window.W.decompositionFound();
//   }
// });

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

const radixOptions = [2, 3, 4, 5, 10];

function createRadixMenu(radixOptions: number[]) {
  document.getElementById("radix-menu")?.remove();

  const radixMenu = d3
    .select("#radix-menu-container")
    .append("div")
    .attr("id", "radix-menu")
    .classed("dropdown", true)
    .classed("dropdown-right", true);

  radixMenu
    .append("img")
    .attr("src", new URL("../img/star.png", import.meta.url).href);

  radixMenu
    .append("span")
    .attr("id", "radix-display")
    .classed("radix-text", true)
    .text(window.radix);

  radixMenu
    .append("ul")
    .selectAll("li")
    .data(radixOptions)
    .enter()
    .append("li")
    .text((d) => d)
    .on("click", (ev, d) => changeRadix(d));
}

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

//
const prizeDiv = d3.select("#central").append("div").attr("id", "prize");

prizeDiv.append("img").attr("id", "prize-img");
prizeDiv.append("div").attr("id", "price");

d3.select("#central").append("div").attr("id", "results");

makeWallet();
newChallenge();
// newJuniorPrize();
// window.W = W;
window.d3 = d3;
// console.log(window.W.pockets);
