import { Selection, select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
const d3 = { select, selectAll, transition };

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
  }

  addCoin(index: number) {
    this.pockets[index] += 1;
    this.fillPocketsUI();
  }

  removeCoin(index: number) {
    this.pockets[index] -= 1;
    this.fillPocketsUI();
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
    this.fillPocketsUI();
    // this.explodeAnimation(index);
  }

  explodeAnimation(index: number) {
    const nextPocket = d3.selectAll(".pocket").filter((d) => d == index + 1);
    const currentCoinsNextPocket = nextPocket.select(".coin");
    const numCurrentCoinsNextPocket = currentCoinsNextPocket.size();
    const newCoin = currentCoinsNextPocket.append("div"); //.attr("class", "coin");
    // .datum(numCurrentCoinsNextPocket);
    // .style("visibility", "hidden");
    console.log(numCurrentCoinsNextPocket, newCoin);
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
    this.fillPocketsUI();
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

    // create structure on pockets
    const pockets = d3.selectAll(".pocket");
    const graphicPockets = pockets
      .append("div")
      .attr("class", "graphic-pocket");
    const numericPockets = pockets
      .append("div")
      .attr("class", "numeric-pocket");
    const creationControls = pockets
      .append("div")
      .attr("class", "creation-controls");
    const explodingControls = d3.selectAll(".exploding-controls");

    creationControls
      .append("button")
      .attr("class", "substract-button")
      .text("-")
      .on("click", (ev, d) => {
        const i = (d as walletItemsData).pocketIndex;
        this.removeCoin(i);
      });

    creationControls
      .append("div")
      .attr("class", "coin-value")
      .text((d) => {
        const i = (d as walletItemsData).pocketIndex;
        return (this.radix ** i).toString();
      });

    creationControls
      .append("button")
      .attr("class", "add-button")
      .text("+")
      .on("click", (ev, d) => {
        const i = (d as walletItemsData).pocketIndex;
        this.addCoin(i);
      });

    explodingControls
      .append("div")
      .attr("class", "explode-button")
      .text("⇦")
      .on("click", (ev, d) => {
        this.explode((d as walletItemsData).pocketIndex);
      });

    explodingControls
      .append("div")
      .attr("class", "unexplode-button")
      .text("⇨")
      .on("click", (ev, d: any) =>
        this.unexplode((d as walletItemsData).pocketIndex + 1)
      );
  }

  // fills pockets with coins according to this.pockets[]
  fillPocketsUI() {
    const pocketsList = this.pockets.map((d, i) => ({
      type: "pocket",
      value: d,
      coinList: new Array(d).map((d, i) => i),
      pocketIndex: i,
    }));

    const pockets = d3.selectAll(".pocket").data(pocketsList);

    const numericPockets = pockets.select(".numeric-pocket");
    numericPockets.text((d) => d.value.toString());

    const graphicPockets = pockets.each((p, i, n) => {
      const coins = d3
        .select(n[i])
        .select(".graphic-pocket")
        .selectAll("div")
        .data(p.coinList);

      coins
        .enter()
        .append("div")
        .append("svg")
        .attr("width", 15)
        .attr("viewBox", "0 0 253 214")
        .append("image")
        .attr("href", new URL("../svg/coin.svg#coin", import.meta.url).href);

      coins.exit().remove();
    });

    // if (enterSel.size() === 1 && exitSel.size() === this.radix) {
    //   // exploding
    //   exitSel.style("visibility", "hidden");
    //   const finalPosition = enterSel.node().getBoundingClientRect();

    //   console.log("Exploding to ", finalPosition);
    //   const endExitSel = exitSel
    //     .style("left", (d, i, n) => n[i].getBoundingClientRect().left + "px")
    //     .style("top", (d, i, n) => n[i].getBoundingClientRect().top + "px")
    //     .style("width", (d, i, n) => n[i].getBoundingClientRect().width + "px")
    //     .style(
    //       "height",
    //       (d, i, n) => n[i].getBoundingClientRect().height + "px"
    //     )
    //     .style("position", "fixed")
    //     .transition()
    //     .duration(1000)
    //     .style("left", finalPosition.left + "px")
    //     .style("top", finalPosition.top + "px")
    //     .remove();

    // endExitSel.then(() => {
    //   exitSel.style("visibility", "visible");
    //   exitSel.remove();
    // });
    d3.select("#total").text(this.value());
    this.checkGoal();
    this.checkDecomposed();
  }

  // Check if the value in the wallet is the goal price
  checkGoal() {
    if (this.value() === window.price) {
      this.goalReached();
    }
  }
  goalReached() {
    console.log("Goal reached");
    d3.selectAll(".add-button").property("disabled", true);
    d3.selectAll(".substract-button").property("disabled", true);
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

    if (this.pockets.toString() === goalValues.toString()) {
      this.decompositionFound();
    }
  }

  decompositionFound() {
    console.log("Decomposition found");

    const monomials = this.pockets
      .map((v, i) =>
        v ? `${v.toString()} × ${this.radix} <sup>${i}</sup>` : ``
      )
      .filter((n) => n);

    const message = `${this.value()} = ` + monomials.reverse().join(" + ");

    if (this.value()) {
      d3.select("#results").html(message);
    }
  }
}

export default wallet;
