import wallet from "./wallet";
import * as d3 from "d3-selection";
import { prizes, juniorPrizes } from "./prizes";
import { createTextModal } from "./ui-functions";

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
    price: number;
    radix: number;
    seniorMode: boolean;
    juniorIndex: number;
  }
}

/** GLOBAL VARIABLES */

let maxPrice = 400;
window.price = 145;
window.radix = 4;
window.seniorMode = false;
window.juniorIndex = 0;

/** AUX FUNCTIONS */

function makeWallet() {
  console.log("making wallet");

  document.getElementById("wallet")?.remove();

  // calculate number of pockets
  let i = 0;
  for (i = 0; window.radix ** i - 1 < maxPrice; i += 1) {}

  window.W = new wallet(window.radix, i);
}

function newPrize() {
  const i = Math.floor(Math.random() * prizes.length);
  d3.select("#prize").select("img").attr("src", prizes[i].img);
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);

  d3.select("#price").text(prizes[i].price.toString());

  window.price = prizes[i].price;
}

function newJuniorPrize() {
  if (
    window.price === juniorPrizes[window.juniorIndex].price &&
    window.radix === juniorPrizes[window.juniorIndex].radix &&
    window.W.checkGoal() &&
    window.W.checkDecomposed()
  ) {
    window.juniorIndex = (window.juniorIndex + 1) % juniorPrizes.length;
  }
  changeRadix(juniorPrizes[window.juniorIndex].radix);

  d3.select("#prize")
    .select("img")
    .attr("src", juniorPrizes[window.juniorIndex].img);
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);

  d3.select("#price").text(juniorPrizes[window.juniorIndex].price.toString());

  window.price = juniorPrizes[window.juniorIndex].price;
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

// Create Senior mode selector
const seniorSelector = d3
  .select("#config-opts")
  .append("div")
  .attr("id", "senior-mode-ckb");

seniorSelector
  .append("img")
  .attr("src", new URL("../img/eye.png", import.meta.url).href);

seniorSelector.append("span").classed("checkbox-wrapper-49", true).html(`
  <div class="block">
    <input data-index="0" id="cheap-49" type="checkbox" />
    <label for="cheap-49"></label>
  </div>
`);

seniorSelector
  .append("img")
  .attr("src", new URL("../img/microscope.png", import.meta.url).href);

d3.select("#cheap-49").on("change", () => {
  window.seniorMode = d3.select("#cheap-49").property("checked");
  if (window.W.checkGoal() && window.W.checkDecomposed()) {
    window.W.decompositionFound();
  }
});

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

const radixOptions = [2, 3, 4, 5, 10];
const radixMenu = menu
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

// Create load prize button
menu
  .append("div")
  .append("img")
  .attr("src", new URL("../img/forward.png", import.meta.url).href)
  .attr("id", "prize-reload-button")
  .on("click", () => {
    clearResults();
    window.seniorMode ? newPrize() : newJuniorPrize();
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
newJuniorPrize();
// window.W = W;
window.d3 = d3;
// console.log(window.W.pockets);
