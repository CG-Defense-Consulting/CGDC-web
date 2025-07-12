// js/main.js

// --- 1. Mobile Navigation Toggle ---
const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

hamburger.addEventListener("click", () => {
  menu.classList.toggle("open");
});

// --- 2. Strategic Focus Area Carousel ---
const focusButtons = document.querySelectorAll(".focus-btn");
const focusImage = document.getElementById("focus-image");
const focusTitle = document.getElementById("focus-title");
const focusDesc = document.getElementById("focus-desc");

const focuses = [
  {
    title: "Defense Manufacturing",
    desc: "End-to-end support for defense contractors, from sourcing to assembly oversight.",
    img: "images/icon-manufacturing.jpg"
  },
  {
    title: "Supply Chain",
    desc: "Optimized logistics networks and real-time inventory intelligence.",
    img: "images/icon-supply-chain.jpg"
  },
  {
    title: "AI & Data",
    desc: "Leveraging artificial intelligence to enhance procurement strategies and forecasting.",
    img: "images/icon-ai-data.jpg"
  },
  {
    title: "Contract Management",
    desc: "Tools to simplify documentation, pricing, and proposal development.",
    img: "images/icon-contact.jpg"
  },
  {
    title: "Logistics",
    desc: "Advanced logistics automation for rapid-response and delivery assurance.",
    img: "images/icon-logistics.jpg"
  },
  {
    title: "Compliance",
    desc: "Expertise in ITAR, DFARS, FAR, and other federal acquisition guidelines.",
    img: "images/icon-compliance.jpg"
  }
];

let currentFocus = 0;
let focusInterval;
let isManuallySelected = false;

function switchFocus(index) {
  // Slide effect
  focusImage.style.opacity = 0;
  setTimeout(() => {
    const { img, title, desc } = focuses[index];
    focusImage.src = img;
    focusTitle.textContent = title;
    focusDesc.textContent = desc;
    focusImage.style.opacity = 1;
  }, 300);

  // Reset buttons and progress bars
  focusButtons.forEach((btn, i) => {
    btn.classList.remove("active");
    btn.querySelector(".progress").style.width = "0%";
    if (i === index) btn.classList.add("active");
  });

  currentFocus = index;
}

function autoRotate() {
  let duration = 5000; // 5 seconds
  let step = 100; // update every 100ms
  let width = 0;
  const progressBar = focusButtons[currentFocus].querySelector(".progress");

  progressBar.style.width = "0%";
  progressBar.style.transition = "none";

  setTimeout(() => {
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = "100%";
  }, 20);

  focusInterval = setTimeout(() => {
    let next = (currentFocus + 1) % focuses.length;
    switchFocus(next);
    autoRotate();
  }, duration);
}

focusButtons.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    clearTimeout(focusInterval);
    switchFocus(i);
    autoRotate();
  });
});

// Start auto-rotation on page load
switchFocus(0);
autoRotate();
