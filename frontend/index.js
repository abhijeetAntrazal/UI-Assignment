// Main application entry point
import DOMHelper from './modules/domHelper.js';
import ValidationFramework from './modules/validation.js';
import PatientService from './modules/patientService.js';
import PolicyService from './modules/policyService.js';
import UIManager from './modules/uiManager.js';

class HealthSureApp {
    constructor() {
        this.dom = new DOMHelper();
        this.validator = new ValidationFramework();
        this.patientService = new PatientService();
        this.policyService = new PolicyService();
        this.ui = new UIManager(this.dom, this.validator, this.patientService, this.policyService);

        this.currentStep = 1;
        this.selectedPatient = null;
        this.formData = {};

        // Make app globally accessible for onclick handlers
        window.app = this;

        this.init();
    }

    async init() {
        this.attachEventListeners();
        await this.loadInitialData();
    }

    attachEventListeners() {
        // Search
        this.dom.on('#searchInput', 'input', (e) => this.handleSearch(e.target.value));

        // Onboard button
        this.dom.on('#onboardBtn', 'click', () => this.openOnboardModal());

        // Modal buttons
        this.dom.on('#cancelBtn', 'click', () => this.closeOnboardModal());
        this.dom.on('#nextBtn', 'click', () => this.handleNext());
        this.dom.on('#backBtn', 'click', () => this.handleBack());

        // Policy modal
        this.dom.on('#policyModalCancel', 'click', () => this.closePolicyModal());
        this.dom.on('#policyModalSubmit', 'click', () => this.submitPolicyAction());
    }

    async loadInitialData() {
        try {
            const patients = await this.patientService.getAllPatients();
            this.ui.renderPatientList(patients);

            const stats = await this.policyService.getDashboardStats();
            this.ui.renderStats(stats);

            // Attach click handlers to patient rows
            this.dom.onDelegate('#patientList', '.patient-row', 'click', (e, el) => {
                const patientId = el.dataset.patientId;
                this.selectPatient(patientId);
            });
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data. Please check if backend is running at http://localhost:3000');
        }
    }

    async handleSearch(query) {
        if (query.length < 2) {
            await this.loadInitialData();
            return;
        }

        try {
            let results = [];

            // Check if it's a phone number
            if (/^\d+$/.test(query)) {
                const patient = await this.patientService.getPatientByPhone(query);
                if (patient) results = [patient];
            } 
            // Check if it's an email
            else if (query.includes('@')) {
                const patient = await this.patientService.getPatientByEmail(query);
                if (patient) results = [patient];
            } 
            // Otherwise search by name
            else {
                const patient = await this.patientService.getPatientByName(query);
                if (patient) results = [patient];
            }

            this.ui.renderPatientList(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async selectPatient(patientId) {
        try {
            const patients = await this.patientService.getAllPatients();
            const patient = patients.find(p => p.id == patientId);

            if (!patient) return;

            this.selectedPatient = patient;

            // Update UI
            this.dom.selectAll('.patient-row').forEach(row => {
                this.dom.removeClass(row, 'selected');
            });
            this.dom.addClass(`[data-patient-id="${patientId}"]`, 'selected');

            // Load patient policies
            const policies = await this.policyService.getPoliciesByPatient(patientId);
            this.ui.renderPatientSummary(patient, policies);

            // Show summary panel
            this.dom.removeClass('#patientSummary', 'hidden');
        } catch (error) {
            console.error('Error selecting patient:', error);
        }
    }

    openOnboardModal() {
        this.currentStep = 1;
        this.formData = {};
        this.dom.removeClass('#onboardModal', 'hidden');
        this.updateStepUI();
    }

    closeOnboardModal() {
        this.dom.addClass('#onboardModal', 'hidden');
        this.clearForm();
    }

    clearForm() {
        ['#firstName', '#lastName', '#dob', '#email', '#phone', '#address', '#city', '#medicalConditions']
            .forEach(selector => this.dom.setValue(selector, ''));
        this.dom.selectAll('.error-msg').forEach(el => el.textContent = '');
    }

    handleNext() {
        if (this.currentStep === 1) {
            if (this.validateStep1()) {
                this.saveStep1Data();
                this.currentStep = 2;
                this.updateStepUI();
            }
        } else if (this.currentStep === 2) {
            if (this.validateStep2()) {
                this.saveStep2Data();
                this.currentStep = 3;
                this.updateStepUI();
                this.showConfirmation();
            }
        } else if (this.currentStep === 3) {
            this.submitPatient();
        }
    }

    handleBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    }

    updateStepUI() {
        // Update step indicator
        const steps = this.dom.selectAll('#stepIndicator .step');
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            if (index % 2 === 0) { // Only actual step circles
                const actualStepNum = Math.floor(index / 2) + 1;
                if (actualStepNum < this.currentStep) {
                    this.dom.addClass(step, 'completed');
                    this.dom.removeClass(step, 'active');
                } else if (actualStepNum === this.currentStep) {
                    this.dom.addClass(step, 'active');
                    this.dom.removeClass(step, 'completed');
                } else {
                    this.dom.removeClass(step, 'active');
                    this.dom.removeClass(step, 'completed');
                }
            }
        });

        // Update step label
        this.dom.setText('#stepLabel', `Step ${this.currentStep} of 3`);

        // Show/hide steps
        this.dom.addClass('#step1', 'hidden');
        this.dom.addClass('#step2', 'hidden');
        this.dom.addClass('#step3', 'hidden');
        this.dom.removeClass(`#step${this.currentStep}`, 'hidden');

        // Update buttons
        if (this.currentStep === 1) {
            this.dom.addClass('#backBtn', 'hidden');
            this.dom.setText('#nextBtn', 'Next');
        } else if (this.currentStep === 3) {
            this.dom.removeClass('#backBtn', 'hidden');
            this.dom.setText('#nextBtn', 'Submit');
        } else {
            this.dom.removeClass('#backBtn', 'hidden');
            this.dom.setText('#nextBtn', 'Next');
        }
    }

    validateStep1() {
        const rules = {
            firstName: [
                this.validator.required('First name'),
                this.validator.minLength(2, 'First name')
            ],
            lastName: [
                this.validator.required('Last name'),
                this.validator.minLength(2, 'Last name')
            ],
            dob: [
                this.validator.required('Date of birth')
            ],
            email: [
                this.validator.required('Email'),
                this.validator.validEmail()
            ],
            phone: [
                this.validator.required('Phone'),
                this.validator.validPhone()
            ],
            address: [
                this.validator.required('Address')
            ]
        };

        const values = {
            firstName: this.dom.getValue('#firstName'),
            lastName: this.dom.getValue('#lastName'),
            dob: this.dom.getValue('#dob'),
            email: this.dom.getValue('#email'),
            phone: this.dom.getValue('#phone'),
            address: this.dom.getValue('#address')
        };

        const errors = this.validator.validateForm(values, rules);
        this.displayErrors(errors);

        return Object.keys(errors).length === 0;
    }

    validateStep2() {
        const rules = {
            city: [
                this.validator.required('City'),
                this.validator.minLength(2, 'City')
            ]
        };

        const values = {
            city: this.dom.getValue('#city')
        };

        const errors = this.validator.validateForm(values, rules);
        this.displayErrors(errors);

        return Object.keys(errors).length === 0;
    }

    displayErrors(errors) {
        // Clear all errors first
        this.dom.selectAll('.error-msg').forEach(el => el.textContent = '');

        // Display new errors
        Object.keys(errors).forEach(field => {
            const input = this.dom.select(`#${field}`);
            if (input) {
                const errorMsg = input.parentElement.querySelector('.error-msg');
                if (errorMsg) {
                    errorMsg.textContent = errors[field][0];
                }
            }
        });
    }

    saveStep1Data() {
        this.formData.firstName = this.dom.getValue('#firstName');
        this.formData.lastName = this.dom.getValue('#lastName');
        this.formData.dob = this.dom.getValue('#dob');
        this.formData.email = this.dom.getValue('#email');
        this.formData.phone = this.dom.getValue('#phone');
        this.formData.address = this.dom.getValue('#address');
    }

    saveStep2Data() {
        this.formData.city = this.dom.getValue('#city');
        this.formData.medicalConditions = this.dom.getValue('#medicalConditions');
    }

    showConfirmation() {
        const age = this.calculateAge(this.formData.dob);
        const html = `
            <p><strong>Name:</strong> ${this.formData.firstName} ${this.formData.lastName}</p>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Email:</strong> ${this.formData.email}</p>
            <p><strong>Phone:</strong> ${this.formData.phone}</p>
            <p><strong>Address:</strong> ${this.formData.address}</p>
            <p><strong>City:</strong> ${this.formData.city}</p>
            ${this.formData.medicalConditions ? `<p><strong>Medical Conditions:</strong> ${this.formData.medicalConditions}</p>` : ''}
        `;
        this.dom.setHTML('#confirmDetails', html);
    }

    calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    async submitPatient() {
        try {
            const age = this.calculateAge(this.formData.dob);

            const patientData = {
                first_name: this.formData.firstName,
                last_name: this.formData.lastName,
                age: age,
                city: this.formData.city,
                phone: this.formData.phone,
                email: this.formData.email
            };

            const result = await this.patientService.createPatient(patientData);

            if (result.success) {
                alert('Patient onboarded successfully!');
                this.closeOnboardModal();
                await this.loadInitialData();
            }
        } catch (error) {
            console.error('Error creating patient:', error);
            alert(error.message || 'Failed to create patient. Phone number may already exist.');
        }
    }

    // Policy actions
    createPolicyForPatient(patientId) {
        this.policyAction = 'create';
        this.policyPatientId = patientId;

        this.dom.setText('#policyModalTitle', 'Create New Policy');
        this.dom.setHTML('#policyModalContent', `
            <div class="form-group">
                <label>Policy Number</label>
                <input type="text" id="policyNumber" placeholder="e.g., HS-12345">
                <span class="error-msg"></span>
            </div>
            <div class="form-group">
                <label>Plan Name</label>
                <select id="planName">
                    <option value="">Select Plan</option>
                    <option value="Gold Health">Gold Health</option>
                    <option value="Silver Health">Silver Health</option>
                    <option value="Active">Active</option>
                    <option value="Premium">Premium</option>
                </select>
                <span class="error-msg"></span>
            </div>
            <div class="form-group">
                <label>Sum Insured</label>
                <input type="number" id="sumInsured" placeholder="50000">
                <span class="error-msg"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="startDate">
                    <span class="error-msg"></span>
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" id="endDate">
                    <span class="error-msg"></span>
                </div>
            </div>
        `);

        this.dom.removeClass('#policyModal', 'hidden');
    }

    cancelPolicy(policyId) {
        this.policyAction = 'cancel';
        this.policyId = policyId;

        this.dom.setText('#policyModalTitle', 'Cancel Policy');
        this.dom.setHTML('#policyModalContent', `
            <div class="form-group">
                <label>Cancellation Reason</label>
                <textarea id="cancelReason" placeholder="Provide reason for cancellation" style="min-height: 100px;"></textarea>
                <span class="error-msg"></span>
            </div>
        `);

        this.dom.removeClass('#policyModal', 'hidden');
    }

    renewPolicy(policyId) {
        this.policyAction = 'renew';
        this.policyId = policyId;

        this.dom.setText('#policyModalTitle', 'Renew Policy');
        this.dom.setHTML('#policyModalContent', `
            <div class="form-group">
                <label>New End Date</label>
                <input type="date" id="renewEndDate">
                <span class="error-msg"></span>
            </div>
        `);

        this.dom.removeClass('#policyModal', 'hidden');
    }

    async submitPolicyAction() {
        try {
            if (this.policyAction === 'create') {
                await this.submitCreatePolicy();
            } else if (this.policyAction === 'cancel') {
                await this.submitCancelPolicy();
            } else if (this.policyAction === 'renew') {
                await this.submitRenewPolicy();
            }
        } catch (error) {
            console.error('Policy action error:', error);
            alert(error.message || 'Failed to perform action');
        }
    }

    async submitCreatePolicy() {
        const policyData = {
            patient_id: this.policyPatientId,
            policy_number: this.dom.getValue('#policyNumber'),
            plan_name: this.dom.getValue('#planName'),
            sum_insured: this.dom.getValue('#sumInsured'),
            start_date: this.dom.getValue('#startDate'),
            end_date: this.dom.getValue('#endDate')
        };

        await this.policyService.createPolicy(policyData);
        alert('Policy created successfully!');
        this.closePolicyModal();
        await this.selectPatient(this.policyPatientId);
        await this.loadInitialData();
    }

    async submitCancelPolicy() {
        const reason = this.dom.getValue('#cancelReason');

        if (!reason || reason.trim() === '') {
            alert('Please provide a cancellation reason');
            return;
        }

        await this.policyService.cancelPolicy(this.policyId, reason);
        alert('Policy cancelled successfully!');
        this.closePolicyModal();
        await this.selectPatient(this.selectedPatient.id);
        await this.loadInitialData();
    }

    async submitRenewPolicy() {
        const endDate = this.dom.getValue('#renewEndDate');

        if (!endDate) {
            alert('Please provide new end date');
            return;
        }

        await this.policyService.renewPolicy(this.policyId, endDate);
        alert('Policy renewed successfully!');
        this.closePolicyModal();
        await this.selectPatient(this.selectedPatient.id);
        await this.loadInitialData();
    }

    closePolicyModal() {
        this.dom.addClass('#policyModal', 'hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HealthSureApp();
});