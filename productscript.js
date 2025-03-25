const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const products = JSON.parse(localStorage.getItem('products')) || [];
const product = products.find(p => p.id === productId);

document.getElementById('product-details').innerHTML = `
    <h2>${product.title}</h2>
    <div class="carousel">
        ${product.imageUrls.map(img => `<img src="${img}" alt="Product Image">`).join('')}
    </div>
    <p>Price: ₹${product.price}</p>
    <p>${product.description}</p>
    <a href="https://wa.me/7900189415?text=I'm%20interested%20in%20${product.title}" class="whatsapp-button">Order on WhatsApp</a>
`;
