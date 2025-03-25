document.addEventListener("DOMContentLoaded", async function () {
    console.log("Initializing Firebase...");

    const response = await fetch("env.json");
    const env = await response.json();

    const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(user => {
        if (!user) {
            alert("You must be logged in to access the admin panel.");
            window.location.href = "index.html";
        }
    });

    // ✅ Logout function
    window.logout = function () {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    };

    // ✅ Cloudinary Image Upload Function
    async function uploadToCloudinary(image) {
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkux9iebb/image/upload";
        const CLOUDINARY_UPLOAD_PRESET = "yt_preset";

        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Cloudinary image upload failed!");
        }

        const data = await response.json();
        return data.secure_url; // ✅ Cloudinary returns a secure image URL
    }

    // ✅ Add Product with Cloudinary Image Upload
    document.getElementById('productForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById('productTitle').value;
        const description = document.getElementById('productDescription').value;
        const price = document.getElementById('productPrice').value;
        const discount = document.getElementById('productDiscount').value;
        const stock = document.getElementById('productStock').value;
        const category = document.getElementById('productCategory').value;
        const images = document.getElementById('productImages').files;

        if (images.length === 0) {
            alert("Please upload at least one product image.");
            return;
        }

        const imageUrls = [];
        for (const image of images) {
            try {
                const imageUrl = await uploadToCloudinary(image);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("❌ Failed to upload image. Please try again.");
                return;
            }
        }

        await db.collection("products").add({
            title,
            description,
            category,
            price,
            discount,
            stock,
            imageUrls, // ✅ Store Cloudinary image URLs in Firestore
            date: new Date().toISOString()
        });

        alert("✅ Product added successfully!");
        document.getElementById('productForm').reset();
        loadProducts();
    });

    // ✅ Load Products (Including Images)
    async function loadProducts() {
        const productsTable = document.getElementById('productsTable');
        productsTable.innerHTML = "";

        const snapshot = await db.collection("products").get();
        if (!snapshot || snapshot.empty) {
            console.warn("No products found.");
            return;
        }

        snapshot.forEach(doc => {
            const product = doc.data();
            const docId = doc.id;
            const stockBadge = product.stock === "Available" ? "✅ In Stock" : "❌ Out of Stock";

            const imagesHTML = product.imageUrls
                ? product.imageUrls.map(url => `<img src="${url}" width="50" height="50">`).join(" ")
                : "No Image";

            productsTable.innerHTML += `
                <tr>
                    <td>${product.title}</td>
                    <td>${product.description}</td>
                    <td>${product.category}</td>
                    <td>${product.price}</td>
                    <td>${product.discount ? product.discount + "%" : "N/A"}</td>
                    <td>${stockBadge}</td>
                    <td>${imagesHTML}</td>
                    <td>
                        <button onclick="editProduct('${docId}')">✏️ Edit</button>
                        <button onclick="deleteProduct('${docId}')">🗑 Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    // ✅ Delete Product
    window.deleteProduct = async function (id) {
        if (confirm("Are you sure you want to delete this product?")) {
            await db.collection("products").doc(id).delete();
            alert("✅ Product deleted!");
            loadProducts();
        }
    };

    // ✅ Edit Product
    window.editProduct = async function (id) {
        const newTitle = prompt("Enter new product title:");
        if (newTitle) {
            await db.collection("products").doc(id).update({ title: newTitle });
            alert("✅ Product updated!");
            loadProducts();
        }
    };

    loadProducts();
});

// ✅ Show Section Function (Fix for "showSection is not defined" error)
function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden'); // Hide all sections
    });
    document.getElementById(sectionId).classList.remove('hidden'); // Show selected section
}
