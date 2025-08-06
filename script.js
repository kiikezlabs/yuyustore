import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Referencias a los elementos del DOM
const form = document.getElementById('item-form');
const inventoryList = document.getElementById('inventory-list');
const storage = getStorage(); // Inicializa Firebase Storage


// Referencia a la colección 'prendas' en Firestore
const prendasCol = collection(window.db, 'prendas');


// 1. Guardar una nueva prenda en Firebase (incluyendo la imagen)
form.addEventListener('submit', async (e) => {
    e.preventDefault();


    const nombre = form['nombre'].value;
    const cantidad = form['cantidad'].value;
    const imagenFile = form['imagen'].files?.[0];


    try {
        let imageUrl = null;
        if (imagenFile) {
            // Crear una referencia única para el archivo en Firebase Storage
            const storageRef = ref(storage, `images/${Date.now()}_${imagenFile.name}`);
            
            // Subir el archivo
            const snapshot = await uploadBytes(storageRef, imagenFile);


            // Obtener la URL de descarga
            imageUrl = await getDownloadURL(snapshot.ref);
            console.log("Imagen subida con éxito:", imageUrl);
        }


        // Agregar la información de la prenda a Firestore, incluyendo la URL de la imagen
        await addDoc(prendasCol, {
            nombre: nombre,
            cantidad: parseInt(cantidad),
            imagenUrl: imageUrl // Guarda la URL de la imagen (puede ser null si no se seleccionó ninguna)
        });


        form.reset(); // Limpia el formulario
        console.log("Prenda agregada con éxito a Firestore.");
    } catch (error) {
        console.error("Error al agregar la prenda o subir la imagen: ", error);
    }
});


// 2. Mostrar la lista de prendas en tiempo real (incluyendo la imagen)
onSnapshot(prendasCol, (snapshot) => {
    inventoryList.innerHTML = '';


    snapshot.docs.forEach(docPrenda => {
        const item = docPrenda.data();
        const li = document.createElement('li');


        let imageHtml = '';
        if (item.imagenUrl) {
            imageHtml = `<img src="${item.imagenUrl}" alt="${item.nombre}" style="max-width: 50px; max-height: 50px; margin-right: 10px;">`;
        }


        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.setAttribute('data-id', docPrenda.id);


        li.innerHTML = `
            ${imageHtml} ${item.nombre} - Cantidad: ${item.cantidad}
        `;
        li.appendChild(deleteButton);
        inventoryList.appendChild(li);


        deleteButton.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            try {
                await deleteDoc(doc(window.db, "prendas", id));
                console.log("Prenda eliminada con éxito.");
            } catch (error) {
                console.error("Error al eliminar la prenda: ", error);
            }
        });
    });
});
