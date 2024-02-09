import * as d3 from "d3-selection";

// Text modals
function createTextModal(
  id: string,
  titleKey: string,
  textUrl: URL
): HTMLSpanElement {
  // Creates a modal (HTMLDivElement) and a button that activates the modal.
  // Returns an HTMLSpanElement that contains the button.

  // 1. Create modal
  const modal = d3
    .select("body")
    .append("div")
    .classed("modal", true)
    .attr("id", id);

  const content = modal.append("div").classed("modal-content", true);

  const header = content.append("div").classed("modal-header", true);

  const body = content.append("div").classed("modal-body", true);

  const btnClose = header
    .append("span")
    // .attr("type", "button")
    .classed("btn-close", true)
    .html("&times");

  header.append("div").text(titleKey);

  fetch(textUrl)
    .then((x) => x.text())
    .then((text) => {
      // eslint-disable-next-line no-param-reassign
      body.html(text);
    })
    // eslint-disable-next-line no-console
    .catch((error) => console.log(error));

  //   body.html(textId);

  // 2. Create button
  const container = document.createElement("span");

  const button = d3
    .select(container)
    .append("span")
    // .classed("btn btn-secondary", true)
    // .attr("id", `btn-${id}`)
    .text(titleKey);

  // button.append('img').attr('src', iconCalculator);

  //   button
  //     .append("div")
  //     .classed("translate", true)
  //     .attr("data-i18n", `[html]${titleKey}`);

  //   button.attr("data-bs-toggle", "modal").attr("data-bs-target", `#${id}`);

  button.on("click", () => {
    console.log("click");
    // console.log(modal.style("display"));
    modal.style("display", "block");
  });

  btnClose.on("click", () => {
    modal.style("display", "none");
  });

  window.onclick = function (event) {
    if (event.target == modal.node()) {
      modal.style("display", "none");
    }
  };

  return container;
}

export { createTextModal };
