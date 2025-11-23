// https://stackoverflow.com/questions/36543946/i-am-trying-to-make-a-fraction-calculator-in-html-javascript-i-need-to-simplify
document.addEventListener('DOMContentLoaded', () => {
  const servingsInput = document.getElementById('servings-input');
  const decreaseBtn = document.getElementById('decrease-servings');
  const increaseBtn = document.getElementById('increase-servings');
  const servingsHelp = document.getElementById('servings-help');

  const ingredientsList = document.querySelector(
    '.recipe-ingredients ul[data-base-servings]'
  );

  if (!servingsInput || !decreaseBtn || !increaseBtn || !ingredientsList) {
    return;
  }

  const baseServings =
    parseFloat(ingredientsList.getAttribute('data-base-servings')) || 6;

  const ingredientSpans = ingredientsList.querySelectorAll('span[data-qty]');

  ingredientSpans.forEach((span) => {
    const baseQty = parseFloat(span.getAttribute('data-qty'));

    if (!isNaN(baseQty)) {
      span.dataset.baseQty = baseQty;

      const originalText = span.textContent.trim();
      const firstSpaceIndex = originalText.indexOf(' ');

      if (firstSpaceIndex !== -1) {
        span.dataset.unitText = originalText.slice(firstSpaceIndex);
      } else {
        span.dataset.unitText = '';
      }
    }
  });

  // https://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  function formatQuantity(value) {
    const rounded = Math.round(value * 8) / 8;

    if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
      return String(Math.round(rounded));
    }

    const integerPart = Math.floor(rounded);
    const fracPart = rounded - integerPart;

    let num = Math.round(fracPart * 8);
    let den = 8;

    const divisor = gcd(num, den);
    num /= divisor;
    den /= divisor;

    let fractionLabel = `${num}/${den}`;

    if (integerPart === 0) {
      return fractionLabel;
    }

    return `${integerPart} ${fractionLabel}`;
  }

  function clampServings(value) {
    const min = servingsInput.min ? parseInt(servingsInput.min, 10) : 1;
    const max = servingsInput.max ? parseInt(servingsInput.max, 10) : 48;
    return Math.min(Math.max(value, min), max);
  }

  function updateIngredients() {
    let currentServings = parseInt(servingsInput.value, 10);

    if (isNaN(currentServings)) {
      currentServings = baseServings;
    }

    currentServings = clampServings(currentServings);
    servingsInput.value = currentServings;

    const factor = currentServings / baseServings;

    ingredientSpans.forEach((span) => {
      const baseQty = parseFloat(span.dataset.baseQty);
      if (isNaN(baseQty)) return;

      const newQty = baseQty * factor;
      const formattedQty = formatQuantity(newQty);
      const unitText = span.dataset.unitText || '';

      span.textContent = formattedQty + unitText;
    });

    if (servingsHelp) {
      servingsHelp.textContent = `Recipe scaled for ${currentServings} servings (base: ${baseServings} servings).`;
    }
  }

  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(servingsInput.value, 10) || baseServings;
    servingsInput.value = clampServings(current - 1);
    updateIngredients();
  });

  increaseBtn.addEventListener('click', () => {
    const current = parseInt(servingsInput.value, 10) || baseServings;
    servingsInput.value = clampServings(current + 1);
    updateIngredients();
  });

  servingsInput.addEventListener('input', () => {
    updateIngredients();
  });

  updateIngredients();
});
