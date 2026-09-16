document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. Переключення мобільного меню
  // ==========================================
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });
  }

  // Плавне закриття меню при кліку на посилання
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks?.classList.contains("open")) {
        navLinks.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ==========================================
  // 2. Додавання фону для шапки при скроллі
  // ==========================================
  const header = document.querySelector(".header");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 40) {
        header?.classList.add("scrolled");
      } else {
        header?.classList.remove("scrolled");
      }
    },
    { passive: true }
  );

  // ==========================================
  // 3. Модальне вікно (Modal Functionality)
  // ==========================================
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const leadForm = document.getElementById("leadForm");

  // Відкриття модального вікна
  document
    .querySelectorAll('a[href="#contacts"], .btn-small, .open-modal')
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        if (
          button.textContent.includes("заявку") ||
          button.textContent.includes("проєкт") ||
          button.classList.contains("open-modal")
        ) {
          e.preventDefault();
          modalOverlay?.classList.add("active");
          document.body.style.overflow = "hidden"; // Блокуємо скролл сторінки
        }
      });
    });

  // Закриття по хрестику
  modalClose?.addEventListener("click", closeModal);

  // Закриття по кліку поза вікном
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Закриття по клавіші Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay?.classList.contains("active")) {
      closeModal();
    }
  });

  function closeModal() {
    modalOverlay?.classList.remove("active");
    document.body.style.overflow = ""; // Повертаємо скролл
  }

  // ==========================================
  // 4. Динамічна маска для поля телефону (+38 (0XX) XXX-XX-XX)
  // ==========================================
  const phoneInput = document.getElementById("modal-phone");

  if (phoneInput) {
    const formatPhoneNumber = (value) => {
      // Залишаємо тільки цифри
      const digits = value.replace(/\D/g, "");
      
      // Відсікаємо код країни 38, якщо він уже є на початку
      let raw = digits;
      if (raw.startsWith("38")) {
        raw = raw.slice(2);
      }
      
      // Обмежуємо довжину 10 цифрами (наприклад: 0671234567)
      raw = raw.substring(0, 10);

      // Якщо користувач повністю очистив поле — повертаємо порожній рядок
      if (raw.length === 0) return "";

      // Форматування за шаблоном +38 (0XX) XXX-XX-XX
      let result = "+38 (";
      if (raw.length > 0) result += raw.substring(0, 3);
      if (raw.length >= 3) result += ") ";
      if (raw.length > 3) result += raw.substring(3, 6);
      if (raw.length >= 6) result += "-";
      if (raw.length > 6) result += raw.substring(6, 8);
      if (raw.length >= 8) result += "-";
      if (raw.length > 8) result += raw.substring(8, 10);

      return result;
    };

    // При фокусі підставляємо початковий префікс, якщо поле порожнє
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) {
        phoneInput.value = "+38 (0";
      }
    });

    // Форматування під час введення
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatPhoneNumber(phoneInput.value);
    });

    // Якщо користувач нічого не ввів і зняв фокус — очищаємо для показу placeholder
    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value === "+38 (0" || phoneInput.value === "+38 (") {
        phoneInput.value = "";
      }
    });
  }

  // ==========================================
  // 5. Відправка форми в Telegram
  // ==========================================
  const TELEGRAM_BOT_TOKEN = "8794694043:AAElzCu7ZZKIOORhi1Rums24bL08dBJAGXo";
  const TELEGRAM_CHAT_ID = "-5303355401"; // Новий ID вашої групи

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = leadForm.querySelector(".btn-submit");
      const originalBtnText = submitBtn ? submitBtn.textContent : "Надіслати";

      if (submitBtn) {
        submitBtn.textContent = "Надсилання...";
        submitBtn.disabled = true;
      }

      // Збір даних із полів форми
      const name = document.getElementById("modal-name")?.value || "Не вказано";
      const phone = document.getElementById("modal-phone")?.value || "Не вказано";
      const email = document.getElementById("modal-email")?.value || "Не вказано";
      const message = document.getElementById("modal-message")?.value || "Без опису";

      // Формування структурованого тексту для Telegram
      const text = `
🔥 <b>Нова заявка з сайту LandSoul!</b>

👤 <b>Ім'я:</b> ${name}
📞 <b>Телефон:</b> ${phone}
📧 <b>Email:</b> ${email}
📝 <b>Проєкт:</b> ${message}
      `;

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: text,
              parse_mode: "HTML",
            }),
          }
        );

        if (response.ok) {
          alert("Дякуємо! Ваша заявка прийнята. Ми зв'яжемося з вами найближчим часом.");
          leadForm.reset();
          closeModal();
        } else {
          alert("Помилка відправки. Перевірте, чи додано бота у групу та чи є у нього права адміністратора.");
        }
      } catch (error) {
        console.error("Помилка мережі при відправці заявки:", error);
        alert("Виникла помилка мережі. Спробуйте ще раз.");
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});