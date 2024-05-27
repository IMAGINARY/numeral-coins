import wallet from "./wallet";
import * as d3 from "d3-selection";
import {
  clearResults,
  createInfoMenu,
  createModeMenu,
  createRadixMenu,
  createTextModal,
  makeWallet,
  modesList,
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

window.currentMode = modesList[0];

/* MAIN SETUP */

// Create infoMenu
createInfoMenu();

// Create mode selector (radio)
createModeMenu();

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
