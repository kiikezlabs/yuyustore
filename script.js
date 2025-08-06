// Referencias a los elementos del DOM
const form = document.getElementById('item-form');
const inventoryList = document.getElementById('inventory-list');

// Referencia a la colección 'prendas' en Firestore
const prendasCol = collection(window.db, 'prendas');

// 1. Guardar una nueva prenda en Firebase
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form['nombre'].value;
    const cantidad = form['cantidad'].value;

    try {
        await addDoc(prendasCol, {
            nombre: nombre,
            cantidad: parseInt(cantidad)
        });
        form.reset(); // Limpia el formulario
        console.log("Prenda agregada con éxito.");
    } catch (error) {
        console.error("Error al agregar la prenda: ", error);
    }
});

// 2. Mostrar la lista de prendas en tiempo real
onSnapshot(prendasCol, (snapshot) => {
    // Limpia la lista antes de volver a renderizar
    inventoryList.innerHTML = '';
    
    snapshot.docs.forEach(doc => {
        const item = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.nombre} - Cantidad: ${item.cantidad}
        `;
        inventoryList.appendChild(li);
    });
});
