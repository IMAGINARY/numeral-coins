import { Selection, select, selectAll, local } from "d3-selection";
import { transition } from "d3-transition";
import { svg } from "d3-fetch";
const d3 = { select, selectAll, transition, local, svg };

async function loadCoinArt(parent: HTMLElement, value: number) {
  const newsvg = await d3.svg(
    new URL("../svg/coin-num.svg", import.meta.url).href
  );
  var svgNode = newsvg.getElementById("coin");
  d3.select(svgNode).select("#faceValue").text(value.toString());
  parent.appendChild(svgNode as HTMLElement);
  // return svgNode;
}

interface wallet {
  radix: number;
  pockets: number[];
  value(): number;
}

class wallet implements wallet {
  constructor(radix: number, numPockets: number) {
    this.radix = radix;
    this.pockets = new Array(numPockets).fill(0);
    // this.setPocket(0, 143);
    this.createUI(document.getElementById("wallet-container") as HTMLElement);
    this.fillPocketsUI();
  }

  setPocket(index: number, x: number) {
    this.pockets[index] = x;
    this.fillPocketsUI();
    this.checkStatus();
  }

  addCoin(index: number) {
    this.pockets[index] += 1;
    this.fillPocketsUI();
    this.checkStatus();
  }

  removeCoin(index: number) {
    if (this.pockets[index] > 0) {
      this.pockets[index] -= 1;
      this.fillPocketsUI();
      this.checkStatus();
    }
  }

  // explode: join points on index index into next pocket
  explode(index: number) {
    if (index >= this.pockets.length) {
      return;
    }
    if (this.pockets[index] >= this.radix) {
      this.pockets[index] -= this.radix;
      this.pockets[index + 1] += 1;
    }
    // this.fillPocketsUI();
    this.explodeAnimation();
    this.checkStatus();
  }

  // unexplode: split points on index index into previous pocket
  unexplode(index: number) {
    if (index >= this.pockets.length || index < 1) {
      return;
    }
    if (this.pockets[index] >= 1) {
      this.pockets[index] -= 1;
      this.pockets[index - 1] += this.radix;
    }
    // this.fillPocketsUI();
    this.unexplodeAnimation();
    this.checkStatus();
  }

  value() {
    return this.pockets.reduce(
      (acc, curr, i) => acc + curr * Math.pow(this.radix, i),
      0
    );
  }

  createUI(container: HTMLElement) {
    const div = d3.select(container).append("div").attr("id", "wallet");

    interface walletItemsData {
      type: "pocket" | "expControls";
      pocketIndex: number;
    }

    // make list of pockets with the amount of coins as value.
    const pocketsList = this.pockets.map((d, i) => ({
      type: "pocket",
      value: d,
      pocketIndex: i,
    })) as walletItemsData[];

    // make list of items: pockets and exploding controls, alternated
    const itemsList = [] as walletItemsData[];
    pocketsList.forEach((d, i) => {
      itemsList.push(d);
      if (i < pocketsList.length - 1) {
        itemsList.push({ type: "expControls", pocketIndex: i });
      }
    });

    // create items
    const items = div
      .selectAll("div")
      .data(itemsList)
      .enter()
      .append("div")
      .attr("class", (d) =>
        d.type === "pocket" ? "pocket" : "exploding-controls"
      );

    // Create structure on pockets
    const pockets = d3.selectAll(".pocket");

    const graphicPocketsContainer = pockets
      .append("div")
      .classed("graphic-pocket-container", true);

    graphicPocketsContainer
      .append("img")
      .classed("graphic-pocket-bg", true)
      .attr("src", new URL("../svg/bag.svg#svg1", import.meta.url).href);

    graphicPocketsContainer.append("div").attr("class", "graphic-pocket");

    const numericPockets = pockets
      .append("div")
      .attr("class", "numeric-pocket coefficient-text");
    const creationControls = pockets
      .append("div")
      .attr("class", "creation-controls");
    const explodingControls = d3.selectAll(".exploding-controls");

    // Minus button
    creationControls
      .append("img")
      .attr("src", new URL("../img/minus.png", import.meta.url).href)
      .attr("class", "substract-button")
      .on("click", (ev, d) => {
        this.removeCoin((d as walletItemsData).pocketIndex);
      });

    // Coin image with its face value
    creationControls
      .append("div")
      .attr("class", "coin-value")
      .each((d, i, n) => {
        loadCoinArt(n[i], this.radix ** i);
      });

    // Plus button
    creationControls
      .append("img")
      .attr("src", new URL("../img/plus.png", import.meta.url).href)
      .attr("class", "add-button")
      .on("click", (ev, d) => {
        this.addCoin((d as walletItemsData).pocketIndex);
      });

    // Explode button
    explodingControls
      .append("img")
      .attr("src", new URL("../img/left.png", import.meta.url).href)
      .attr("class", "explode-button")
      .on("click", (ev, d) => {
        this.explode((d as walletItemsData).pocketIndex);
      });

    // Unexplode button
    explodingControls
      .append("img")
      .attr("src", new URL("../img/right.png", import.meta.url).href)
      .attr("class", "unexplode-button")
      .on("click", (ev, d: any) =>
        this.unexplode((d as walletItemsData).pocketIndex + 1)
      );

    // create container of coins being animated
    div.append("div").attr("id", "animation-container");
  }

  // fills pockets with coins according to this.pockets[]
  fillPocketsUI() {
    const coinsLists = this.pockets.map((d) =>
      new Array(d).fill(0).map((d, i) => i)
    );

    const pockets = d3.selectAll(".pocket").data(coinsLists);

    pockets.select(".numeric-pocket").text((d) => d.length.toString());

    const coins = pockets
      .select(".graphic-pocket")
      .selectAll("img")
      .data((d, i) => d.map((v) => ({ pocketIndex: i, coinIndex: v })));

    coins
      .enter()
      .append("img")
      .classed("coin", true)
      .attr("src", new URL("../svg/coin.svg#coin", import.meta.url).href);

    coins.exit().remove();

    d3.select("#total").text(this.value());
  }

  explodeAnimation() {
    const coinsLists = this.pockets.map((d) =>
      new Array(d).fill(0).map((d, i) => i)
    );

    const pockets = d3.selectAll(".pocket").data(coinsLists);

    pockets.select(".numeric-pocket").text((d) => d.length.toString());

    const coins = pockets
      .select(".graphic-pocket")
      .selectAll("img")
      .data((d, i) => d.map((v) => ({ pocketIndex: i, coinIndex: v })));

    const newCoin = coins
      .enter()
      .append("img")
      .classed("coin", true)
      .attr("src", new URL("../svg/coin.svg#coin", import.meta.url).href)
      .style("visibility", "hidden");

    const finalPosition = newCoin.node()?.getBoundingClientRect();

    const vanishingCoins = coins.exit();

    const initialPositions = d3.local();

    vanishingCoins.each((d, i, n) =>
      initialPositions.set(
        n[i] as HTMLElement,
        (n[i] as HTMLElement).getBoundingClientRect()
      )
    );

    vanishingCoins
      .remove()
      .each(
        (d, i, n) =>
          document
            .getElementById("animation-container")
            ?.appendChild(n[i] as HTMLElement)
      );

    vanishingCoins
      .style(
        "left",
        (d, i, n) =>
          (initialPositions.get(n[i] as HTMLElement) as DOMRect).left + "px"
      )
      .style(
        "top",
        (d, i, n) =>
          (initialPositions.get(n[i] as HTMLElement) as DOMRect).top + "px"
      )
      .style("position", "fixed")
      .transition()
      .duration(1000)
      .style("left", finalPosition?.left + "px")
      .style("top", finalPosition?.top + "px")
      .remove()
      .end()
      .then(() => {
        // console.log("finished");
        newCoin.style("visibility", "visible");
      })
      .catch(() => {
        console.log("catched");
        newCoin.style("visibility", "visible");
        vanishingCoins.remove();
      });

    d3.select("#total").text(this.value());
  }

  unexplodeAnimation() {
    const coinsLists = this.pockets.map((d) =>
      new Array(d).fill(0).map((d, i) => i)
    );

    const pockets = d3.selectAll(".pocket").data(coinsLists);

    pockets.select(".numeric-pocket").text((d) => d.length.toString());

    const coins = pockets
      .select(".graphic-pocket")
      .selectAll("img")
      .data((d, i) => d.map((v) => ({ pocketIndex: i, coinIndex: v })));

    const newCoins = coins
      .enter()
      .append("img")
      .classed("coin", true)
      .attr("src", new URL("../svg/coin.svg#coin", import.meta.url).href);

    const vanishingCoin = coins.exit();

    const initialPosition = (
      vanishingCoin.node() as HTMLElement
    )?.getBoundingClientRect();

    vanishingCoin.remove();

    const finalPositions = d3.local();

    newCoins.each((d, i, n) => {
      const clone = n[i].cloneNode(true);
      (clone as HTMLElement).classList.add("choose");
      document.getElementById("animation-container")?.appendChild(clone);
      finalPositions.set(
        clone as HTMLElement,
        (n[i] as HTMLElement).getBoundingClientRect()
      );
    });

    newCoins.style("visibility", "hidden");

    const animatedCoins = d3
      .select("#animation-container")
      .selectAll(".choose")
      .classed("choose", false);

    // newCoins
    //   .remove()
    //   .each(
    //     (d, i, n) =>
    //       document
    //         .getElementById("animation-container")
    //         ?.appendChild(n[i] as HTMLElement)
    //   );

    animatedCoins
      .style("left", (d, i, n) => initialPosition.left + "px")
      .style("top", (d, i, n) => initialPosition.top + "px")
      .style("width", (d, i, n) => initialPosition.width + "px")
      .style("height", (d, i, n) => initialPosition.height + "px")
      .style("position", "fixed")
      .transition()
      .duration(1000)
      .style(
        "left",
        (d, i, n) =>
          (finalPositions.get(n[i] as HTMLElement) as DOMRect).left + "px"
      )
      .style(
        "top",
        (d, i, n) =>
          (finalPositions.get(n[i] as HTMLElement) as DOMRect).top + "px"
      )
      .remove()
      .end()
      .then(() => {
        // console.log("finished");
        newCoins.attr("style", null);
      })
      .catch(() => {
        console.log("catched");
        newCoins.attr("style", null);
      });

    d3.select("#total").text(this.value());
  }

  // Check all
  checkStatus() {
    if (this.checkGoal()) {
      this.goalReached();

      if (this.checkDecomposed()) {
        this.decompositionFound();
      }
    }
  }

  // Check if the value in the wallet is the goal price
  checkGoal() {
    return this.value() === window.price;
  }
  goalReached() {
    console.log("Goal reached");
    d3.selectAll(".add-button").classed("disabled", true);
    d3.selectAll(".substract-button").classed("disabled", true);
    d3.select("#walletValue-img").classed("goal-reached", true);
  }

  // Check if the pockets represent the base-r decomposition
  checkDecomposed() {
    const goalValues = this.value()
      .toString(this.radix)
      .split("")
      .map((d) => parseInt(d, this.radix))
      .reverse();
    const padding = this.pockets.length - goalValues.length;
    for (let k = 0; k < padding; k += 1) {
      goalValues.push(0);
    }

    return this.pockets.toString() === goalValues.toString();
  }

  decompositionFound() {
    console.log("Decomposition found");

    let message = `<table>
      <tr><td>${this.resultMessageValues()}</td></tr>`;

    if (window.seniorMode) {
      message += `
        <tr><td>${this.resultMessagePowers()}</td></tr>
        <tr><td>${this.resultMessageBase()}</td></tr>`;
    }
    message += `</table>`;

    if (this.value()) {
      d3.select("#results").html(message);
    }
    d3.selectAll(".explode-button").classed("disabled", true);
    d3.selectAll(".unexplode-button").classed("disabled", true);

    d3.select("#prize-img").classed("decomposition-found", true);
  }

  resultMessagePowers() {
    //Message: decomposition as sums of powers
    const arr = [...this.pockets];
    while (arr[arr.length - 1] === 0) {
      // While the last element is a 0,
      arr.pop(); // Remove that last element
    }

    const monomials = arr.map(
      (v, i) =>
        `<span class="coefficient-text">${v.toString()}</span>
           × <span class="radix-text">${this.radix}</span><sup>${i}</sup>`
    );

    return `${this.value()} = ${monomials.reverse().join(" + ")}`;
  }

  resultMessageValues() {
    // Message: decomposition as sums of coin values
    const monomials = this.pockets
      .map((v, i) =>
        v
          ? `<span class="coefficient-text">${v.toString()}</span>
         × <span>${this.radix ** i}</span>`
          : ``
      )
      .filter((n) => n);

    return `${this.value()} = ${monomials.reverse().join(" + ")}`;
  }

  resultMessageBase() {
    // Message: representation in base (radix)
    const arr = [...this.pockets];
    while (arr[arr.length - 1] === 0) {
      // While the last element is a 0,
      arr.pop(); // Remove that last element
    }

    const monomials = arr.map(
      (v, i) => `<span class="coefficient-text">${v.toString()}</span>`
    );

    return `${this.value()}<sub>(10)</sub> = 
     ${monomials.reverse().join(" ")}<sub>(${this.radix})</sub>`;
  }
}

export default wallet;
