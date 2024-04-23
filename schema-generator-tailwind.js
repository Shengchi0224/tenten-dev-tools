// Function to generate JSON-LD based on user input
function generateJSONLD() {
    const selectedSchemaType = document.getElementById('schemaType').value;
    const formInputs = document.querySelectorAll('#formSections input, #formSections select, #formSections textarea, #formSections div');
    const jsonLD = {
        '@context': 'https://schema.org/',
        '@type': selectedSchemaType
    };

    if (selectedSchemaType === 'Breadcrumb') {
        const itemListElement = [];

        // Iterate over formInputs in pairs (for name and URL inputs)
        for (let i = 0; i < formInputs.length; i += 1) {
            const nameInput = formInputs[i];
            const urlInput = formInputs[i + 1];

            // Check if both nameInput and urlInput are defined and are input elements
            if (nameInput && nameInput.tagName === 'INPUT' &&
                urlInput && urlInput.tagName === 'INPUT') {

                // Get trimmed values of nameInput and urlInput
                const nameValue = nameInput.value.trim();
                const urlValue = urlInput.value.trim();

                // Check if nameValue and urlValue are not empty
                if (nameValue && urlValue) {
                    const position = (i / 3) + 1 ; // Calculate position based on index

                    const item = {
                        '@type': 'ListItem',
                        'position': position,
                        'name': nameValue,
                        'item': urlValue
                    };

                    itemListElement.push(item);
                }
            }
        }

        // Update JSON-LD with itemListElement
        jsonLD['itemListElement'] = itemListElement;

        // Print or use jsonLD for further processing
        console.log(jsonLD);
    } else if (selectedSchemaType === 'FAQPage') {
        const faqQuestions = [];
    // Process pairs: assume even index is a question, odd index is an answer
    for (let i = 0; i < formInputs.length; i += 1) {
        const questionInput = formInputs[i]; // Even index: question
        const answerInput = formInputs[i + 1]; // Odd index: answer

        // Check if both nameInput and urlInput are defined and are input elements
        if (questionInput && questionInput.tagName === 'INPUT' &&
        answerInput && answerInput.tagName === 'TEXTAREA') {

        // Get trimmed values of nameInput and urlInput
        const questionValue = questionInput.value.trim();
        const answerValue = answerInput.value.trim();

        // Check if nameValue and urlValue are not empty
        if (questionValue && answerValue) {
            const faqItem = {
                '@type': 'Question',
                'name': questionValue,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': answerValue
                }
            };
            faqQuestions.push(faqItem);
        }
    }
        jsonLD['mainEntity'] = faqQuestions;
      } 
    } else if (selectedSchemaType === 'HowTo') {
        // Handle static fields (if any) for 'HowTo' schema
        staticFields[selectedSchemaType].forEach(field => {
            const fieldValue = document.getElementById(field.name)?.value.trim();
            if (fieldValue) {
                jsonLD[field.name] = fieldValue;
            }
        });
        
        
        const stepsContainer = document.getElementById('formSections'); // Assuming a container element for steps
        // Handle dynamic steps for 'HowTo' schema
        function updateSteps() {
            
            // 采集供应信息
            const supplies = Array.from(document.getElementById('formSections').querySelectorAll('.supply')).map(input => input.value.trim()).filter(value => value);
            if (supplies.length > 0) {
                jsonLD['supply'] = supplies;
            } else {
                delete jsonLD['supply']; // 如果没有供应信息，则删除此属性
            }
        
            // 采集工具信息
            const tools = Array.from(document.getElementById('formSections').querySelectorAll('.tool')).map(input => input.value.trim()).filter(value => value);
            if (tools.length > 0) {
                jsonLD['tool'] = tools;
            } else {
                delete jsonLD['tool']; // 如果没有工具信息，则删除此属性
            }

            // 采集步骤信息
            const steps = Array.from(stepsContainer.querySelectorAll('.step')).map(stepEl => {
                const stepName = stepEl.querySelector('.stepName')?.value.trim();
                const stepDescription = stepEl.querySelector('.stepDescription')?.value.trim();
                const stepImageUrl = stepEl.querySelector('.stepImageUrl')?.value.trim();
                const stepUrl = stepEl.querySelector('.stepUrl')?.value.trim();
        
                if (stepName && stepDescription) {
                    return {
                        '@type': 'HowToStep',
                        'name': stepName,
                        'text': stepDescription,
                        'image': stepImageUrl || undefined,
                        'url': stepUrl || undefined
                    };
                }
            }).filter(step => step);
        
            jsonLD['step'] = steps.length > 0 ? steps : undefined;
        
            // 输出和更新预览
            console.log('Updated JSON-LD:', jsonLD);
            const jsonString = JSON.stringify(jsonLD, null, 2);
            displayJSONLDAsText(jsonString);
        }
        // Attach event listeners to inputs within supplies and tools
        document.getElementById('formSections').addEventListener('input', function(event) {
         if (event.target.classList.contains('supply')) {
           updateSteps();
         }
        });

       document.getElementById('formSections').addEventListener('input', function(event) {
         if (event.target.classList.contains('tool')) {
            updateSteps();
         }
        }); 
        document.getElementById('formSections').addEventListener('input', function(event) {
            updateSteps();
           }); 

    } else {
        // Handle other types as before
        formInputs.forEach(input => {
            if (input.tagName === 'DIV') {
                const selectedRadio = input.querySelector('input[type="radio"]:checked');
                if (selectedRadio) {
                    jsonLD[selectedRadio.name] = selectedRadio.value;
                }
            } else if (input.tagName === 'TEXTAREA') {
                const fieldName = input.id;
                const fieldValue = input.value.trim();
                if (fieldValue) {
                    jsonLD[fieldName] = fieldValue;
                }
            } else { // For text, select, and now textarea inputs
                const fieldName = input.id;
                const fieldValue = input.value.trim();
                if (fieldValue) {
                    jsonLD[fieldName] = fieldValue;
                }
            }
        });
    }

    const jsonString = JSON.stringify(jsonLD, null, 2);
    displayJSONLDAsText(jsonString); // Update to call display function with jsonString
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addItemButton').addEventListener('click', addItem);
    document.getElementById('addSupplyButton').addEventListener('click', addSupply);
    document.getElementById('addToolButton').addEventListener('click', addTool);
    document.getElementById('addStepButton').addEventListener('click', addStep);
});

document.addEventListener('DOMContentLoaded', function() {
    const sidebarButtons = document.querySelectorAll('#sg-subfolder button');
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const selectedType = event.target.textContent.toLowerCase(); // Extract schema type from button text
            selectSchemaType(selectedType); // Call selectSchemaType function with the selected type
        });
    });
});


function addItem() {
    const selectedSchemaType = document.getElementById('schemaType').value;

    if (selectedSchemaType === 'Breadcrumb') {
        addBreadcrumbItem();
    } else if (selectedSchemaType === 'FAQPage') {
        addFAQItem();
    }
}

function addBreadcrumbItem() {
    const formSectionsContainer = document.getElementById('formSections');
    const itemCount = formSectionsContainer.querySelectorAll('input').length / 2 + 1; // Calculate new item number

    // Create new container for the item
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('breadcrumb-item', 'my-4', 'rounded-md','flex', 'flex-col', 'items-start','gap-1','w-full');

    
    // Create new input for the item name
    const nameLabel = document.createElement('label');
    nameLabel.textContent = `Item ${itemCount} Name:`;
    nameLabel.classList.add('mr-2','font-semibold','focus:text-lime-300');

    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('id', `item${itemCount}Name`);
    nameInput.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');
    nameInput.addEventListener('input', generateJSONLD); // Update JSON-LD on input change
    

    // Create new input for the item URL
    const urlLabel = document.createElement('label');
    urlLabel.textContent = `Item ${itemCount} URL:`;
    urlLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const urlInput = document.createElement('input');
    urlInput.setAttribute('type', 'text');
    urlInput.setAttribute('id', `item${itemCount}URL`);
    urlInput.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');
    urlInput.addEventListener('input', generateJSONLD); // Update JSON-LD on input change

    // Create remove button for the item
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('px-2', 'py-1', 'mt-4', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','hover:border-lime-300');
    removeButton.addEventListener('click', () => {
        formSectionsContainer.removeChild(itemContainer); // Remove the item container when button is clicked
        generateJSONLD(); // Update JSON-LD after removal
    });

    // Append inputs and remove button to the item container
    itemContainer.appendChild(nameLabel);
    itemContainer.appendChild(nameInput); 

    itemContainer.appendChild(urlLabel);
    itemContainer.appendChild(urlInput);

    itemContainer.appendChild(removeButton);

    // Append the new item container to the form
    formSectionsContainer.appendChild(itemContainer);
}


function addFAQItem() {
    const formSectionsContainer = document.getElementById('formSections');
    const itemCount = formSectionsContainer.querySelectorAll('input').length  + 1; // Calculate new item number

    const itemContainer = document.createElement('div');
    itemContainer.classList.add('faq-item', 'mt-4', 'rounded-md', 'flex-col', 'items-center');

    // Create FAQ question input
    const questionLabel = document.createElement('label');
    questionLabel.textContent = `Question ${itemCount}:`;
    questionLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const questionInput = document.createElement('input');
    questionInput.setAttribute('type', 'text');
    questionInput.setAttribute('id', `faqQuestion${itemCount}`);
    questionInput.addEventListener('input', generateJSONLD);
    questionInput.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    // Create FAQ answer textarea
    const answerLabel = document.createElement('label');
    answerLabel.textContent = `Answer ${itemCount}:`;
    answerLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const answerInput = document.createElement('textarea');
    answerInput.setAttribute('id', `faqAnswer${itemCount}`);
    answerInput.addEventListener('input', generateJSONLD);
    answerInput.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    // Create remove button for the item
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('px-2', 'py-1', 'mt-4', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','hover:border-lime-300');
    removeButton.addEventListener('click', () => {
        formSectionsContainer.removeChild(itemContainer); // Remove the item container when button is clicked
        generateJSONLD(); // Update JSON-LD after removal
    });

    // Append the new inputs to the form
    itemContainer.appendChild(questionLabel);
    itemContainer.appendChild(questionInput);
    itemContainer.appendChild(answerLabel);
    itemContainer.appendChild(answerInput);
    itemContainer.appendChild(removeButton);

    formSectionsContainer.appendChild(itemContainer);
}

function addSupply() {
    const container = document.getElementById('formSections');
    const itemContainer1 = document.createElement('div');
    itemContainer1.classList.add('supply-item', 'mt-4', 'rounded-md', 'flex-col', 'items-center');

    const label = document.createElement('label');
    label.textContent = "Supply:";
    label.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('class', 'supply'); // Notice the class for easier collection
    input.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    // Create remove button for the item
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('px-2', 'py-1', 'mt-4', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','hover:border-lime-300');
    removeButton.addEventListener('click', () => {
        container.removeChild(itemContainer1); // Remove the item container when button is clicked
        generateJSONLD(); // Update JSON-LD after removal
    });

    itemContainer1.appendChild(label);
    itemContainer1.appendChild(input);
    itemContainer1.appendChild(removeButton);

    container.appendChild(itemContainer1);
}

function addTool() {
    const container = document.getElementById('formSections');
    const itemContainer2 = document.createElement('div');
    itemContainer2.classList.add('tool-item', 'mt-4', 'rounded-md', 'flex-col', 'items-center');
    
    const label = document.createElement('label'); // Corrected line
    label.textContent = "Tool:";
    label.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('class', 'tool'); // Notice the class for easier collection, similar to supplies
    input.classList.add('w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');
    
     // Create remove button for the item
     const removeButton = document.createElement('button');
     removeButton.textContent = 'Remove';
     removeButton.classList.add('px-2', 'py-1', 'mt-4', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','hover:border-lime-300');
     removeButton.addEventListener('click', () => {
         container.removeChild(itemContainer2); // Remove the item container when button is clicked
         generateJSONLD(); // Update JSON-LD after removal
     });

    itemContainer2.appendChild(label);
    itemContainer2.appendChild(input);
    itemContainer2.appendChild(removeButton);

    container.appendChild(itemContainer2);
}

function addStep() {
    const container = document.getElementById('formSections');
    
    // Create a new div element for the step
    const stepDiv = document.createElement('div');
    stepDiv.classList.add('step' , 'mt-4', 'rounded-md', 'flex-col', 'items-center');

    // Create input elements for the step
    const nameLabel = document.createElement('label');
    nameLabel.textContent = "Step Name";
    nameLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const stepNameInput = document.createElement('input');
    stepNameInput.type = 'text';
    stepNameInput.classList.add('stepName','w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    const desLabel = document.createElement('label');
    desLabel.textContent = "Description";
    desLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');
    
    const stepDescriptionTextarea = document.createElement('textarea');
    stepDescriptionTextarea.classList.add('stepDescription','w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    
    const imageLabel = document.createElement('label');
    imageLabel.textContent = "Image URL";
    imageLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const stepImageUrlInput = document.createElement('input');
    stepImageUrlInput.type = 'url';
    stepImageUrlInput.classList.add('stepImageUrl','w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

    const urlLabel = document.createElement('label');
    urlLabel.textContent = "Step URL";
    urlLabel.classList.add('mr-2', 'font-semibold','focus:text-lime-300');

    const stepUrlInput = document.createElement('input');
    stepUrlInput.type = 'url';
    stepUrlInput.classList.add('stepUrl','w-full', 'px-2', 'py-1', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300','mt-0.5');

     // Create remove button for the item
     const removeButton = document.createElement('button');
     removeButton.textContent = 'Remove';
     removeButton.classList.add('px-2', 'py-1', 'mt-4', 'border', 'rounded-md','bg-transparent','focus:outline-none','focus:border-lime-300');
     removeButton.addEventListener('click', () => {
         container.removeChild(stepDiv); // Remove the item container when button is clicked
         generateJSONLD(); // Update JSON-LD after removal
     });

    // Append input elements to the stepDiv
    stepDiv.appendChild(nameLabel);
    stepDiv.appendChild(stepNameInput);
    stepDiv.appendChild(desLabel);
    stepDiv.appendChild(stepDescriptionTextarea);
    stepDiv.appendChild(imageLabel);
    stepDiv.appendChild(stepImageUrlInput);
    stepDiv.appendChild(urlLabel);
    stepDiv.appendChild(stepUrlInput);
    stepDiv.appendChild(removeButton);

    // Append the new stepDiv to the container
    container.appendChild(stepDiv);
}

// Similarly for addFAQItem()


// Function to display JSON-LD content as text in the preview section
function displayJSONLDAsText(jsonString) {
    const jsonLDContent = `<script type="application/ld+json">${jsonString}</script>`;

    const previewDiv = document.getElementById('preview');
    previewDiv.textContent = jsonLDContent; // Dynamically set JSON-LD content
}


// Function to copy JSON-LD content as text to clipboard
function copyJSONLDText() {
    const previewDiv = document.getElementById('preview');
    const jsonLDText = previewDiv.textContent.trim(); // Get raw text content

    // Create a temporary textarea element to copy text to clipboard
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = jsonLDText;
    document.body.appendChild(tempTextArea);

    // Select and copy text to clipboard
    tempTextArea.select();
    document.execCommand('copy');

    // Remove temporary textarea element
    document.body.removeChild(tempTextArea);

    // Show alert message to indicate successful copy
    alert('JSON-LD content copied to clipboard!');
}

// Call the function to display JSON-LD content on page load or as needed
displayJSONLDAsText();

// Global definition of staticFields to ensure accessibility
const staticFields = {
    Article: [
        { name: 'headline', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'author', type: 'text' },
        { name: 'datePublished', type: 'date' },
        { name: 'image', type: 'url' }
    ],
    Breadcrumb: [
        { name: 'Item 1 Name', type: 'text' },
        { name: 'Item 1 URL', type: 'text' }
    ],
    Product: [
        { name: 'name', type: 'text' },
        { name: 'image', type: 'url' },
        { name: 'description', type: 'textarea' },
        { name: 'sku', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'offerPrice', type: 'number' },
        { name: 'offerCurrency', type: 'text' },
        { name: 'availability', type: 'select', options: ['InStock', 'OutOfStock', 'PreOrder'] }
    ],
    FAQPage: [
        { name: 'question 1', type: 'text' },
        { name: 'answer 1', type: 'textarea' }
    ],
    Event: [
        { name: 'name', type: 'text' },
        { name: 'startDate', type: 'datetime-local' },
        { name: 'endDate', type: 'datetime-local' },
        { name: 'location', type: 'text' },
        { name: 'image', type: 'url' },
        { name: 'description', type: 'textarea' }
    ],
    Organization: [
        { name: 'name', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'logo', type: 'url' },
        { name: 'contactPoint', type: 'text' },
        { name: 'telephone', type: 'tel' }
    ],
    Person: [
        { name: 'name', type: 'text' },
        { name: 'jobTitle', type: 'text' },
        { name: 'worksFor', type: 'text' },
        { name: 'image', type: 'url' },
        { name: 'alumniOf', type: 'text' }
    ],
    LocalBusiness: [
        { name: 'name', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'telephone', type: 'tel' },
        { name: 'openingHours', type: 'text' },
        { name: 'image', type: 'url' },
        { name: 'geoLatitude', type: 'number' },
        { name: 'geoLongitude', type: 'number' }
    ],
    WebSite: [
        { name: 'name of website', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'internal site search url', type: 'url' }
    ],
    VideoObject: [
        { name: 'name', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'upload date', type: 'date' },
        { name: 'thumbnail url #1', type: 'url' },
        { name: 'content url', type: 'url' },
        { name: 'embed url', type: 'url' }
    ],
    Recipe: [
        { name: 'name', type: 'text'},
        { name: 'image', type: 'url'},
        { name: 'author', type: 'text'},
        { name: 'datePublished', type: 'date'},
        { name: 'prepTime', type: 'text'},
        { name: 'cookTime', type: 'text'},
        { name: 'totalTime', type: 'text'},
        { name: 'recipeYield', type: 'text'},
        { name: 'recipeCategory', type: 'text'},
        { name: 'recipeCuisine', type: 'text'},
        { name: 'nutritionCalories', type: 'text'},
        { name: 'ingredients', type: 'textarea'},
        { name: 'recipeInstructions', type: 'textarea'}
    ],
    HowTo: [
        { name: 'name', type: 'text', placeholder: 'How-To Name' },
        { name: 'description', type: 'textarea', placeholder: 'Description' },
        { name: 'estimatedCost', type: 'text', placeholder: 'Estimated Cost' }
    ]
    // Add more schema types as needed
};

function selectSchemaType() {
    const selectedSchemaType = document.getElementById('schemaType').value;
    const formSectionsContainer = document.getElementById('formSections');
    const addItemButton = document.getElementById('addItemButton');
    const addSupplyButton = document.getElementById('addSupplyButton');
    const addToolButton = document.getElementById('addToolButton');
    const addStepButton = document.getElementById('addStepButton');
    const schemaTypeTitle = document.getElementById('schemaTypeTitle');

    // Clear existing form sections
    formSectionsContainer.innerHTML = '';

    schemaTypeTitle.textContent = capitalizeFirstLetter(selectedSchemaType);

    // Show the "Add Item" button only for specific schema types
    if (selectedSchemaType === 'Breadcrumb' || selectedSchemaType === 'FAQPage') {
        addItemButton.style.display = 'inline-block';
        addSupplyButton.style.display = 'none';
        addToolButton.style.display = 'none';
        addStepButton.style.display = 'none';
    }else if (selectedSchemaType === 'HowTo') {
        addSupplyButton.style.display = 'inline-block';
        addToolButton.style.display = 'inline-block';
        addStepButton.style.display = 'inline-block';
        addItemButton.style.display = 'none'
    } else {
        addItemButton.style.display = 'none';
        addSupplyButton.style.display = 'none';
        addToolButton.style.display = 'none';
        addStepButton.style.display = 'none';
    }

    // Check and add form fields dynamically based on selected schema type
    if (staticFields[selectedSchemaType]) {
        staticFields[selectedSchemaType].forEach(field => {
            const label = document.createElement('label');
            label.textContent = `${capitalizeFirstLetter(field.name)}:`;
            label.classList.add('mr-2', 'font-semibold' ,'mt-1');

            let input;
             if (field.type === 'text') {
               input = document.createElement('input');
               input.setAttribute('type', 'text');
               input.setAttribute('id', field.name);
               input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'select') {
               input = document.createElement('select');
               input.setAttribute('id', field.name);
               field.options.forEach(optionValue => {
               const option = document.createElement('option');
               option.value = optionValue;
               option.textContent = optionValue;
               input.appendChild(option);
               });
               input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'radio') {
               input = document.createElement('div');
               field.options.forEach(optionValue => {
               const radioInput = document.createElement('input');
               radioInput.setAttribute('type', 'radio');
               radioInput.setAttribute('name', field.name);
               radioInput.setAttribute('value', optionValue);
               const radioLabel = document.createElement('label');
               radioLabel.appendChild(radioInput);
               radioLabel.appendChild(document.createTextNode(optionValue));
               input.appendChild(radioLabel);
               });
               input.classList.add('w-full', 'px-2', 'py-2', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.setAttribute('id', field.name);
                input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
                // Debugging line to ensure this part is executed
                console.log('Creating textarea with ID:', field.name);
            } else if (field.type === 'number') {
               input = document.createElement('input');
               input.setAttribute('type', 'number');
               input.setAttribute('id', field.name);
               input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'url') {
              input = document.createElement('input');
              input.setAttribute('type', 'url');
              input.setAttribute('id', field.name);
              input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'tel') {
              input = document.createElement('input');
              input.setAttribute('type', 'tel');
              input.setAttribute('id', field.name);
              input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'date') {
              input = document.createElement('input');
              input.setAttribute('type', 'date');
              input.setAttribute('id', field.name);
              input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            } else if (field.type === 'datetime-local') {
                input = document.createElement('input');
                input.setAttribute('type', 'datetime-local');
                input.setAttribute('id', field.name);
                input.classList.add('w-full', 'px-2', 'py-1', 'border' ,'border-blue-100', 'rounded','focus:border-lime-300','focus:outline-none','bg-transparent','mt-1');
            }

            // Update JSON-LD on input change
            input.addEventListener('input', generateJSONLD);
            formSectionsContainer.appendChild(label);
            if (field.type !== 'radio') { // Radio inputs are wrapped in a div
                formSectionsContainer.appendChild(input);
            }
        });
    }

    // Generate JSON-LD for initial form fields
    generateJSONLD(); // Call generateJSONLD after creating form fields
}


// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// Initialize schema type selection and form generation
selectSchemaType();
