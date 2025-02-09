import './css/SubjectAdd.css';
export default class SubjectAdd {   
    unitTime;
    color;
    category_id;
    subject;
    constructor(props) {
        this.t = props.t;
        this.subjects = props.subjects;
        this.onSave = props.onSave;
        this.categories = props.categories;
    }

    show() {
        // Create overlay background
        const overlay = document.createElement('div');
        overlay.classList.add('subject-add-overlay');
        
        // Create and show subject add dialog
        const subjectAddDialog = document.createElement('div');
        subjectAddDialog.classList.add('subject-add-dialog');

        // Create title
        const title = document.createElement('h3');
        title.classList.add('subject-add-title');
        title.textContent = this.t('addSubject');

        // Create categories checklist container
        const categoriesContainer = document.createElement('div');
        categoriesContainer.classList.add('subject-add-categories');

        // Create categories label
        const categoriesLabel = document.createElement('div');
        categoriesLabel.textContent = this.t('categories');
        categoriesContainer.appendChild(categoriesLabel);

        // Create checkbox container
        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.flexWrap = 'wrap';
        checkboxContainer.style.gap = '10px';
        checkboxContainer.style.marginTop = '10px';
        checkboxContainer.style.marginBottom = '15px';

        // Create radio buttons for categories
        this.categories.forEach(category => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'category';
            radio.value = category.category_id;
            radio.id = `category-${category.category_id}`;
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.category_id = radio.value;
                }
            });
            
            const label = document.createElement('label');
            label.htmlFor = `category-${category.category_id}`;
            label.textContent = category.category_name;
            label.style.marginLeft = '4px';

            wrapper.appendChild(radio);
            wrapper.appendChild(label);
            checkboxContainer.appendChild(wrapper);
        });

        categoriesContainer.appendChild(checkboxContainer);
        categoriesContainer.style.display = 'flex';
        categoriesContainer.style.flexDirection = 'column';

        // Create containers for unit time and color picker
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '20px';
        container.style.marginBottom = '15px';

        // Create unit time section
        const unitTimeContainer = document.createElement('div');
        unitTimeContainer.style.display = 'flex';
        unitTimeContainer.style.alignItems = 'center';
        unitTimeContainer.style.height = '15px';
        unitTimeContainer.classList.add('subject-add-unit-time');

        const unitTimeLabel = document.createElement('label');
        unitTimeLabel.textContent = this.t('unitTime');
        unitTimeLabel.classList.add('subject-add-label');

        const unitTimeInput = document.createElement('input');
        unitTimeInput.type = 'number';
        unitTimeInput.min = '1';
        unitTimeInput.value = '30';
        unitTimeInput.classList.add('subject-add-input');
        unitTimeInput.style.width = '60px';
        unitTimeInput.style.height = '10px';
       

        const minutesLabel = document.createElement('span');
        minutesLabel.textContent = this.t('minutes');
        minutesLabel.style.marginLeft = '5px';

        unitTimeContainer.appendChild(unitTimeLabel);
        unitTimeContainer.appendChild(unitTimeInput);
        unitTimeContainer.appendChild(minutesLabel);
        

        // Create color picker section
        const colorContainer = document.createElement('div');
        colorContainer.style.display = 'flex';
        colorContainer.style.alignItems = 'center';
        colorContainer.style.height = '15px';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = '#' + Math.floor(Math.random()*16777215).toString(16);
        colorInput.classList.add('subject-add-input');

        const colorLabel = document.createElement('label');
        colorLabel.textContent = this.t('color');
        colorLabel.classList.add('subject-add-label');

        colorContainer.appendChild(colorLabel);
        colorContainer.appendChild(colorInput);

        // Combine sections
        container.appendChild(unitTimeContainer);
        container.appendChild(colorContainer);

        // Create subject input
        const subjectInput = document.createElement('input');
        subjectInput.type = 'text';
        subjectInput.placeholder = this.t('addSubject');
        subjectInput.classList.add('subject-add-input');
        subjectInput.style.marginBottom = '5px';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('subject-add-buttons');

        // Save button
        const saveButton = document.createElement('button');
        saveButton.textContent = this.t('save');
        saveButton.classList.add('subject-add-save');
        saveButton.onclick = () => {
            if (subjectInput.value.trim()) {
                this.unitTime = unitTimeInput.value;
                this.color = colorInput.value;
                this.subject = subjectInput.value.trim();
                this.onSave(this.subject, this.category_id, this.color, this.unitTime);
                overlay.remove();
            }
        };

        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = this.t('cancel');
        cancelButton.classList.add('subject-add-cancel');
        cancelButton.onclick = () => {
            overlay.remove();
        };

        // Append elements
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(saveButton);
        subjectAddDialog.appendChild(title);
        subjectAddDialog.appendChild(categoriesContainer);
        subjectAddDialog.appendChild(container);
        subjectAddDialog.appendChild(subjectInput);
        subjectAddDialog.appendChild(buttonsContainer);
        overlay.appendChild(subjectAddDialog);
        document.body.appendChild(overlay);

        // Focus input
        subjectInput.focus();
    }
}