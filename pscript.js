// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Fetch Product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (productId) {
  loadProductDetails(productId);
} else {
  alert("Product not found!");
}

// ✅ Load Product Details
async function loadProductDetails(id) {
  const doc = await db.collection("products").doc(id).get();

  if (!doc.exists) {
    alert("Product does not exist!");
    return;
  }

  const product = doc.data();

  // ✅ Update Page Content
  document.getElementById("productTitle").innerText = product.title;
  document.getElementById("brandName").innerText = `Brand: ${
    product.brand || "N/A"
  }`;
  document.getElementById("productRatings").innerText = `⭐ ${
    product.rating || "N/A"
  }/5 (${product.totalReviews || 0} Reviews)`;
  document.getElementById(
    "discountedPrice"
  ).innerText = `₹${product.discountedPrice}`;
  document.getElementById(
    "originalPrice"
  ).innerText = `₹${product.originalPrice}`;
  document.getElementById(
    "discountPercentage"
  ).innerText = `${product.discount}% Off`;
  document.getElementById("stockStatus").innerText =
    product.stock > 0 ? "✅ In Stock" : "❌ Out of Stock";
  document
    .getElementById("stockStatus")
    .classList.add(product.stock > 0 ? "in-stock" : "out-of-stock");

  // ✅ Load Images
  let mainImage = document.getElementById("mainImage");
  let thumbnails = document.getElementById("thumbnails");
  mainImage.src = product.imageUrls[0] || "placeholder.jpg";

  thumbnails.innerHTML = "";
  product.imageUrls.forEach((url) => {
    let img = document.createElement("img");
    img.src = url;
    img.onclick = () => (mainImage.src = url);
    thumbnails.appendChild(img);
  });

  // ✅ WhatsApp Button
  document.getElementById("whatsappBtn").onclick = function () {
    let message = `Hello, I want to order "${product.title}". Price: ₹${product.discountedPrice}`;
    window.open(
      `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };
}
