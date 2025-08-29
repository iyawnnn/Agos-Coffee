document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");
  const cartBody = document.getElementById("cartBody");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountDesktop = document.getElementById("cart-count");
  const cartCountMobile = document.getElementById("cart-count-mobile");
  const searchInput = document.getElementById("search");
  const mobileSearchInput = document.getElementById("mobile-search");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const cancelCheckout = document.getElementById("cancelCheckout");
  const confirmCheckout = document.getElementById("confirmCheckout");
  const noResults = document.getElementById("noResults");
  const cartToggleDesktop = document.getElementById("cart-toggle");
  const cartToggleMobile = document.getElementById("cart-toggle-mobile");
  const sectionTitle = document.getElementById("sectionTitle");
  const sliderTrack = document.querySelector(".slider-track");
  const dotsContainer = document.querySelector(".slider-dots");
  const cards = document.querySelectorAll(".brew-card");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  function formatPeso(n) {
    return `₱${Number(n).toFixed(0)}`;
  }

  function updateCartUI() {
    if (!cartBody || !cartTotalEl) return;
    cartBody.innerHTML = "";

    if (cart.length === 0) {
      cartBody.innerHTML = `
      <div class="empty-illustration">
        <img src="assets/icons/CART-PANEL.svg" alt="Empty Cart" class="empty-cart-img" />
        <h4>Hungry?</h4>
        <p>You haven't added anything to your cart!</p>
      </div>`;
      cartTotalEl.innerText = formatPeso(0);
      updateCartCount(0);
      checkoutBtn?.classList.remove("enabled");
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    cart.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-price">${formatPeso(item.price)}</div>
        <div class="qty-controls">
          <button class="qty-btn decrease" data-name="${
            item.name
          }" style="background: var(--primary);">
            ${
              item.qty === 1
                ? `<img src="assets/icons/TRASH-ICON.svg" width="14" height="14" alt="Remove">`
                : `<span class="minus-sign">-</span>`
            }
          </button>
          <div class="qty-count">${item.qty}</div>
          <button class="qty-btn increase" data-name="${
            item.name
          }" style="background: var(--primary);">
            <span class="plus-sign">+</span>
          </button>
        </div>
      </div>
    `;
      cartBody.appendChild(itemEl);
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotalEl.innerText = formatPeso(total);

    const totalCount = cart.reduce((s, i) => s + i.qty, 0);
    updateCartCount(totalCount);

    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.classList.add("enabled");
    }

    cartBody
      .querySelectorAll(".increase")
      .forEach((btn) =>
        btn.addEventListener("click", () => changeQty(btn.dataset.name, +1))
      );
    cartBody
      .querySelectorAll(".decrease")
      .forEach((btn) =>
        btn.addEventListener("click", () => changeQty(btn.dataset.name, -1))
      );
  }

  if (checkoutBtn && checkoutModal && cancelCheckout && confirmCheckout) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length > 0) checkoutModal.style.display = "flex";
    });

    cancelCheckout.addEventListener("click", () => {
      checkoutModal.style.display = "none";
    });

    confirmCheckout.addEventListener("click", () => {
      checkoutModal.style.display = "none";
      window.location.href = "checkout.html";
    });
  }

  function changeQty(name, delta) {
    const idx = cart.findIndex((i) => i.name === name);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    localStorage.setItem("cart", JSON.stringify(cart)); // save
    updateCartUI();
  }

  function addToCart(name, price, img) {
    const found = cart.find((i) => i.name === name);
    if (found) {
      found.qty++;
    } else {
      cart.push({ name, price: Number(price), img, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart)); // save
    updateCartUI();
  }

  function updateCartCount(count) {
    if (count > 0) {
      if (cartCountDesktop) {
        cartCountDesktop.textContent = count;
        cartCountDesktop.style.display = "inline-flex";
      }
      if (cartCountMobile) {
        cartCountMobile.textContent = count;
        cartCountMobile.style.display = "inline-flex";
      }
    } else {
      if (cartCountDesktop) {
        cartCountDesktop.textContent = "";
        cartCountDesktop.style.display = "none";
      }
      if (cartCountMobile) {
        cartCountMobile.textContent = "";
        cartCountMobile.style.display = "none";
      }
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;

    const card = btn.closest(".product-card");
    if (!card) return;

    const name = card.dataset.name;
    const price = card.dataset.price;
    const img = card.dataset.img;

    addToCart(name, price, img);

    // Button animation
    btn.animate(
      [
        { transform: "scale(1.0)" },
        { transform: "scale(0.92)" },
        { transform: "scale(1)" },
      ],
      { duration: 180, easing: "ease-out" }
    );
  });

  function runSearch(rawValue) {
    const value = String(rawValue || "")
      .toLowerCase()
      .trim();
    const sections = document.querySelectorAll(".product-section");
    const searchContainer = document.getElementById("searchResults");

    let searchHeading = document.getElementById("searchHeading");
    if (!searchHeading) {
      searchHeading = document.createElement("h2");
      searchHeading.id = "searchHeading";
      searchHeading.className = "section-title";
      searchHeading.innerText = "Search Results";
      searchHeading.style.display = "none";
      searchContainer.insertAdjacentElement("beforebegin", searchHeading);
    }

    searchContainer.innerHTML = "";

    if (value) {
      let hasMatch = false;
      const addedNames = new Set();

      sections.forEach((sec) => (sec.style.display = "none"));

      const originalCards = document.querySelectorAll(
        ".product-section .product-card"
      );

      originalCards.forEach((card) => {
        const name = card.dataset.name;
        const title =
          card.querySelector(".product-title")?.innerText.toLowerCase() || "";
        const desc =
          card.querySelector(".product-desc")?.innerText.toLowerCase() || "";

        if (
          (title.includes(value) || desc.includes(value)) &&
          !addedNames.has(name)
        ) {
          hasMatch = true;
          addedNames.add(name); // Mark as added
          searchContainer.appendChild(card.cloneNode(true));
        }
      });

      searchHeading.style.display = "";
      searchContainer.style.display = "";

      if (!hasMatch) {
        noResults.innerHTML = `
    <img src="assets/icons/NO-RESULTS.svg" alt="No results" />
    <p>No products found</p>
  `;
        noResults.style.display = "flex";
        searchContainer.style.display = "none";
      } else {
        noResults.style.display = "none";
        searchContainer.style.display = "";
      }
    } else {
      sections.forEach((sec) => (sec.style.display = ""));
      searchHeading.style.display = "none";
      searchContainer.style.display = "none";
      noResults.style.display = "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      runSearch(e.target.value);
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) =>
      runSearch(e.target.value)
    );
    mobileSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch(mobileSearchInput.value);
        mobileSearchInput.blur();
      }
    });
  }

  const slider = document.querySelector(".testimonial-slider");
  const leftArrow = document.querySelector(".testimonial-arrow.left");
  const rightArrow = document.querySelector(".testimonial-arrow.right");

  const slides = document.querySelectorAll(".testimonial-slide");
  const slideCount = slides.length;

  let showingSlide = 0;
  let autoSlideTimer;

  const firstClone = slides[0].cloneNode(true);
  slider.appendChild(firstClone);

  function goToSlide(index, animate = true) {
    if (!animate) slider.style.transition = "none";
    else slider.style.transition = "transform 0.5s ease-in-out";

    slider.style.transform = `translateX(-${index * 100}%)`;
    showingSlide = index;
  }

  function nextSlide() {
    if (showingSlide >= slideCount) {
      goToSlide(0, false);
      setTimeout(() => goToSlide(1), 20);
    } else {
      goToSlide(showingSlide + 1);
    }
  }

  function prevSlide() {
    if (showingSlide <= 0) {
      goToSlide(slideCount, false);
      setTimeout(() => goToSlide(slideCount - 1), 20);
    } else {
      goToSlide(showingSlide - 1);
    }
  }

  function startAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  rightArrow.addEventListener("click", () => {
    nextSlide();
    startAutoSlide();
  });

  leftArrow.addEventListener("click", () => {
    prevSlide();
    startAutoSlide();
  });

  goToSlide(0);
  startAutoSlide();

  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;

      if (answer.style.maxHeight && answer.style.maxHeight !== "0px") {
        answer.style.maxHeight = "0";
        answer.style.paddingTop = "0";
        answer.style.paddingBottom = "0";
        question.classList.remove("active");
      } else {
        document.querySelectorAll(".faq-answer").forEach((a) => {
          a.style.maxHeight = "0";
          a.style.paddingTop = "0";
          a.style.paddingBottom = "0";
        });
        document
          .querySelectorAll(".faq-question")
          .forEach((q) => q.classList.remove("active"));

        const extraPadding = 32;
        answer.style.maxHeight = answer.scrollHeight + extraPadding + "px";
        answer.style.paddingTop = "1rem";
        answer.style.paddingBottom = "1rem";
        question.classList.add("active");
      }
    });
  });

  (function () {
    const brewCards = document.querySelectorAll(".brew-card");
    const brewSliderTrack = document.querySelector(".slider-track");
    const brewDotsContainer = document.querySelector(".slider-dots");

    let currentIndex = 0;

    function getCardsPerView() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function createBrewDots() {
      const cardsPerView = getCardsPerView();
      const totalSlides = Math.ceil(brewCards.length / cardsPerView);

      brewDotsContainer.innerHTML = "";
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => moveToBrewSlide(i));
        brewDotsContainer.appendChild(dot);
      }
    }

    function moveToBrewSlide(index) {
      const cardsPerView = getCardsPerView();
      currentIndex = index;

      const offset = -(index * (100 / cardsPerView));
      brewSliderTrack.style.transform = `translateX(${offset}%)`;

      document.querySelectorAll(".slider-dots button").forEach((dot, idx) => {
        dot.classList.toggle("active", idx === index);
      });
    }

    window.addEventListener("resize", () => {
      createBrewDots();
      moveToBrewSlide(0);
    });

    createBrewDots();
  })();

  const mobileSearchWrapper = document.querySelector(".mobile-search-wrapper");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");

  mobileSearchBtn.addEventListener("click", () => {
    mobileSearchWrapper.classList.add("active");
    mobileSearchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!mobileSearchWrapper.contains(e.target)) {
      mobileSearchWrapper.classList.remove("active");
      mobileSearchInput.value = "";
    }
  });

  function scrollToCart() {
    const panel = document.getElementById("cartPanel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  cartToggleDesktop?.addEventListener("click", scrollToCart);
  cartToggleMobile?.addEventListener("click", scrollToCart);

  window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (header) header.classList.toggle("scrolled", window.scrollY > 0);
  });

  if (checkoutBtn && checkoutModal && cancelCheckout && confirmCheckout) {
    checkoutBtn.addEventListener(
      "click",
      () => (checkoutModal.style.display = "flex")
    );
    cancelCheckout.addEventListener(
      "click",
      () => (checkoutModal.style.display = "none")
    );
    confirmCheckout.addEventListener(
      "click",
      () => (window.location.href = "checkout.html")
    );
  }

  updateCartUI();
});
