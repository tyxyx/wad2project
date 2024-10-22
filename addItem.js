import { userDetailsCollection, getData, businessDetailsCollection, auth, db } from '../wad2project/database.js';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Initialize variables to store user type and details
let currentUserType = null;
let currentUserDetails = null;

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const businessUEN = user.email.split('@')[0].toUpperCase();
            const businessDoc = await getDoc(doc(db, "businessLogin", businessUEN));
            
            if (businessDoc.exists()) {
                currentUserType = 'business';
                currentUserDetails = businessDoc.data();
                await loadBusinessItems(currentUserDetails.uen);
            } else {
                const userDoc = await getDoc(doc(db, "userLogin", user.email));
                
                if (userDoc.exists()) {
                    currentUserType = 'individual';
                    currentUserDetails = userDoc.data();
                    displayUnauthorizedMessage();
                } else {
                    console.error("User document not found in either collection");
                }
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            displayError("Failed to load user details. Please try again later.");
        }
    } else {
        window.location.href = './form.html?mode=login';
    }
});

async function loadBusinessItems(uen) {
    try {
        const menuItemsRef = collection(db, "businessLogin", uen, "menuItems");
        const q = query(menuItemsRef, where("businessUEN", "==", uen));
        const querySnapshot = await getDocs(q);

        const contentContainer = document.getElementById('content-container') || document.createElement('div');
        contentContainer.id = 'content-container';
        contentContainer.innerHTML = '';

        if (querySnapshot.empty) {
            const message = document.createElement('div');
            message.className = 'alert alert-info';
            message.textContent = 'No menu items found. Start adding items to your menu!';
            contentContainer.appendChild(message);
        } else {
            const table = createMenuItemsTable(querySnapshot);
            contentContainer.appendChild(table);
        }

        const addButton = createAddButton();
        contentContainer.appendChild(addButton);
        
        if (!document.getElementById('content-container')) {
            document.body.appendChild(contentContainer);
        }
    } catch (error) {
        console.error("Error loading business items:", error);
        displayError("Failed to load menu items. Please try again later.");
    }
}

function createMenuItemsTable(querySnapshot) {
    const table = document.createElement('table');
    table.className = 'table table-striped';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = table.querySelector('tbody').insertRow();
        row.innerHTML = `
            <td>${data.itemName}</td>
            <td>${data.description}</td>
            <td>$${data.price.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${doc.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${doc.id}">Delete</button>
            </td>
        `;
    });
    
    return table;
}

function createAddButton() {
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary mt-3';
    addButton.textContent = 'Add New Item';
    addButton.onclick = showAddItemForm;
    return addButton;
}

function displayUnauthorizedMessage() {
    const container = document.getElementById('content-container') || document.createElement('div');
    container.id = 'content-container';
    container.innerHTML = `
        <div class="alert alert-warning">
            <h4>Unauthorized Access</h4>
            <p>This page is only accessible to business accounts. Please sign in with a business account to view and manage menu items.</p>
            <button class="btn btn-primary" onclick="window.location.href='./login.html?type=business&mode=login'">
                Sign in as Business
            </button>
        </div>
    `;
    if (!document.getElementById('content-container')) {
        document.body.appendChild(container);
    }
}

function displayError(message) {
    const container = document.getElementById('content-container') || document.createElement('div');
    container.id = 'content-container';
    container.innerHTML = `
        <div class="alert alert-danger">
            <h4>Error</h4>
            <p>${message}</p>
        </div>
    `;
    if (!document.getElementById('content-container')) {
        document.body.appendChild(container);
    }
}

function showAddItemForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'add-item-form';
    formContainer.innerHTML = `
        <h4>Add New Menu Item</h4>
        <div>
            <label for="itemName">Item Name:</label>
            <input type="text" id="itemName" required>
        </div>
        <div>
            <label for="description">Description:</label>
            <input type="text" id="description" required>
        </div>
        <div>
            <label for="price">Price:</label>
            <input type="number" id="price" step="0.01" required>
        </div>
        <div>
            <label for='discount'>Discount:</label>
            <input type="number" id='discount'>
        </div>
        <label for='menuItemImage' class="form-label">Attach Image</label>
        <input 
            type="file" 
            id="menuItemImage" 
            accept="image/*" 
            multiple 
            class="form-control"
            required
        >
    </div>
        <button class="btn btn-success" id="submit-item">Add Item</button>
        <button class="btn btn-secondary" id="cancel-item">Cancel</button>
    `;
    
    const contentContainer = document.getElementById('content-container');
    contentContainer.appendChild(formContainer);

    document.getElementById('menuItemImage').addEventListener('change', (e) => {
        console.log('Files selected:', e.target.files);
        console.log('Number of files:', e.target.files.length);
    });


    document.getElementById('submit-item').onclick = async () => {
        const itemName = document.getElementById('itemName').value;
        const description = document.getElementById('description').value;
        const price = parseFloat(document.getElementById('price').value);
        const discount = parseFloat(document.getElementById('discount').value);
        const fileInput = document.getElementById('menuItemImage');
        console.log('File input element:', fileInput);
        console.log('Files selected:', fileInput.files);
        console.log('Number of files:', fileInput.files.length);
        
        const files = fileInput.files;
        if (files.length === 0) {
            displayError("Please select at least one image file.");
            return;
        }
    

        // Add menu item in Firestore
        await addMenuItem(currentUserDetails.uen, { itemName, description, price, discount, files });
    };

    document.getElementById('cancel-item').onclick = () => {
        formContainer.remove();
    };
}

async function addMenuItem(uen, menuItemData) {
    try {
        // Validate input data
        const { itemName, description, price, discount, files } = menuItemData;

        console.log(files)
        
        if (!itemName || !description || !price || !files) {
            throw new Error("Missing required fields");
        }

        if (isNaN(price) || price <= 0) {
            throw new Error("Price must be a positive number");
        }

        // Initialize Firebase Storage
        const storage = getStorage();
        const imageUrls = [];

        // Handle file uploads
        if (files && files.length > 0) {
            // Create unique file names using timestamps
            for (const file of files) {
                if (!file || !file.name) continue;
                
                const timestamp = new Date().getTime();
                const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storageRef = ref(storage, `menuItems/${uen}/${fileName}`);
                
                try {
                    // Upload file
                    const snapshot = await uploadBytes(storageRef, file);
                    console.log(`Uploaded ${fileName}`);
                    
                    // Get download URL
                    const url = await getDownloadURL(snapshot.ref);
                    imageUrls.push(url);
                } catch (uploadError) {
                    console.error(`Error uploading ${fileName}:`, uploadError);
                    throw new Error(`Failed to upload image: ${fileName}`);
                }
            }
        }

        // Prepare menu item data
        const menuItemDoc = {
            itemName: itemName.trim(),
            description: description.trim(),
            price: Number(price),
            discount: discount ? Number(discount) : 0,
            images: imageUrls,
            businessUEN: uen,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };

        // Save to Firestore
        const menuItemsRef = collection(db, "businessLogin", uen, "menuItems");
        const newMenuItemRef = doc(menuItemsRef);
        await setDoc(newMenuItemRef, menuItemDoc);

        console.log("Menu item added successfully:", newMenuItemRef.id);
        
        // Return success with the new item's ID and data
        return {
            success: true,
            itemId: newMenuItemRef.id,
            data: menuItemDoc
        };

    } catch (error) {
        console.error("Error in addMenuItem:", error);
        
        // Handle specific error cases
        let errorMessage = "Failed to add menu item. Please try again later.";
        if (error.message.includes("Missing required fields")) {
            errorMessage = "Please fill in all required fields.";
        } else if (error.message.includes("Price must be")) {
            errorMessage = error.message;
        } else if (error.message.includes("Failed to upload image")) {
            errorMessage = "Failed to upload one or more images. Please try again.";
        }

        // Display error to user
        displayError(errorMessage);
        
        // Return error object
        return {
            success: false,
            error: errorMessage,
            details: error.message
        };
    }
}

function createModalForm() {
    // Create main modal container
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'exampleModal';
    modalDiv.setAttribute('tabindex', '-1');
    modalDiv.setAttribute('aria-labelledby', 'exampleModalLabel');
    modalDiv.setAttribute('aria-hidden', 'true');

    // Create modal dialog
    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('h1');
    modalTitle.className = 'modal-title fs-5';
    modalTitle.id = 'exampleModalLabel';
    modalTitle.textContent = 'Add Menu Item';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'modal');
    closeButton.setAttribute('aria-label', 'Close');

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const form = document.createElement('form');

    // Create name input group
    const nameGroup = document.createElement('div');
    nameGroup.className = 'mb-3';

    const nameLabel = document.createElement('label');
    nameLabel.className = 'form-label';
    nameLabel.htmlFor = 'menuItemName';
    nameLabel.textContent = 'Menu Item Name';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-control';
    nameInput.id = 'menuItemName';
    nameInput.placeholder = 'Enter item name';
    nameInput.required = true;

    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);

    // Create price input group
    const priceGroup = document.createElement('div');
    priceGroup.className = 'mb-3';

    const priceLabel = document.createElement('label');
    priceLabel.className = 'form-label';
    priceLabel.htmlFor = 'menuItemPrice';
    priceLabel.textContent = 'Price';

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.className = 'form-control';
    priceInput.id = 'menuItemPrice';
    priceInput.placeholder = 'Enter price';
    priceInput.required = true;

    priceGroup.appendChild(priceLabel);
    priceGroup.appendChild(priceInput);

    // Create discount input group
    const discGroup = document.createElement('div');
    discGroup.className = 'mb-3';
    
    const discLabel = document.createElement('label');
    discLabel.className = 'form-label';
    discLabel.htmlFor = 'menuItemDiscount';
    discLabel.textContent = 'Discount';

    const discInput = document.createElement('input');
    discInput.type = 'number';
    discInput.className = 'form-control';
    discInput.id = 'menuItemDiscount';
    discInput.placeholder = 'Enter price';
    discInput.required = true;

    discGroup.appendChild(discLabel);
    discGroup.appendChild(discInput);

    // Create description input group
    const descGroup = document.createElement('div');
    descGroup.className = 'mb-3';

    const descLabel = document.createElement('label');
    descLabel.className = 'form-label';
    descLabel.htmlFor = 'menuItemDescription';
    descLabel.textContent = 'Description';

    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'form-control';
    descTextarea.id = 'menuItemDescription';
    descTextarea.rows = 3;
    descTextarea.placeholder = 'Enter description';
    descTextarea.required = true;

    descGroup.appendChild(descLabel);
    descGroup.appendChild(descTextarea);

    // Create image input group
    const imageGroup = document.createElement('div');
    imageGroup.className = 'mb-3';

    const imageLabel = document.createElement('label');
    imageLabel.className = 'form-label';
    imageLabel.htmlFor = 'menuItemImage';
    imageLabel.textContent = 'Attach Image';

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.className = 'form-control';
    imageInput.id = 'menuItemImage';
    imageInput.accept = 'image/*';
    imageInput.multiple = true;

    imageGroup.appendChild(imageLabel);
    imageGroup.appendChild(imageInput);

    // Add all groups to form
    form.appendChild(nameGroup);
    form.appendChild(priceGroup);
    form.appendChild(discGroup);
    form.appendChild(descGroup);
    form.appendChild(imageGroup);

    modalBody.appendChild(form);

    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const closeModalBtn = document.createElement('button');
    closeModalBtn.type = 'button';
    closeModalBtn.className = 'btn btn-secondary';
    closeModalBtn.setAttribute('data-bs-dismiss', 'modal');
    closeModalBtn.textContent = 'Close';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn btn-primary';
    saveButton.textContent = 'Save changes';

    modalFooter.appendChild(closeModalBtn);
    modalFooter.appendChild(saveButton);

    // Assemble all parts
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);

    modalDialog.appendChild(modalContent);
    modalDiv.appendChild(modalDialog);

    // Add event listener for the save button
    saveButton.addEventListener('click', async (event) => {
        const name = document.getElementById('menuItemName').value;
        const price = document.getElementById('menuItemPrice').value;
        const discount = document.getElementById('menuItemDiscount').value;
        const description = document.getElementById('menuItemDescription').value;
        const imageFile = document.getElementById('menuItemImage').files;
        
        // Here you can add your logic to handle the form data
        console.log('Name:', name);
        console.log('Price:', price);
        console.log('Description:', description);
        console.log('Image:', imageFile);

        await addMenuItem(currentUserDetails.uen, { name, description, price, discount, imageFile })

    });

    // Add modal to document
    document.body.appendChild(modalDiv);
}

// Function to show the modal
function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
}

// When the page loads
document.addEventListener('DOMContentLoaded', () => {
    createModalForm();
});

// Export functions that might be needed elsewhere
export {
    loadBusinessItems,
    showAddItemForm
};
