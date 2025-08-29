const hamburgerToggle = document.getElementById("hamburger-toggle");
const sidebarMenu = document.getElementById("sidebar-menu");
const sidebarOverlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  sidebarMenu.classList.add("open");
  sidebarOverlay.classList.add("active");
  hamburgerToggle.setAttribute("aria-expanded", true);
  sidebarMenu.setAttribute("aria-hidden", false);
  document.body.classList.add("sidebar-open");
}

function closeSidebar() {
  sidebarMenu.classList.remove("open");
  sidebarOverlay.classList.remove("active");
  hamburgerToggle.setAttribute("aria-expanded", false);
  sidebarMenu.setAttribute("aria-hidden", true);
  document.body.classList.remove("sidebar-open");
}

// Hamburger click
hamburgerToggle.addEventListener("click", () => {
  if (sidebarMenu.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarOverlay.addEventListener("click", closeSidebar);