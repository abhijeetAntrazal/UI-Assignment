// UI Manager - Handles all UI rendering
class UIManager {
    constructor(domHelper, validator, patientService, policyService) {
        this.dom = domHelper;
        this.validator = validator;
        this.patientService = patientService;
        this.policyService = policyService;
        
        // Show initial dummy state
        this.renderInitialState();
    }

    renderInitialState() {
        // Show dummy patient info when no patient selected
        this.dom.setText('#patientAvatar', 'N/A');
        this.dom.setText('#detailName', '----');
        this.dom.setText('#detailAge', '----');
        this.dom.setText('#detailCity', '----');
        this.dom.setText('#detailPhone', '----');
        this.dom.setText('#detailEmail', '----');
        
        // Update policy count
        this.dom.setText('#policyCount', '0 Policies');
        
        const container = this.dom.select('#policiesTable');
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity: 0.3; margin-bottom: 12px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <p>No patient selected</p>
            </div>
        `;
        
        // Show the summary panel
        this.dom.removeClass('#patientSummary', 'hidden');
    }

    async renderPatientList(patients) {
        const container = this.dom.select('#patientList');

        if (!patients || patients.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;">No patients found</div>';
            return;
        }

        // Fetch all policies to count per patient
        const allPolicies = await this.policyService.getAllPolicies();

        const html = patients.map(patient => {
            // Count active policies for this patient
            const patientPolicies = allPolicies.filter(p => p.patient_id == patient.id);
            const activePolicies = patientPolicies.filter(p => p.status === 'ACTIVE').length;
            
            return `
                <div class="patient-row" data-patient-id="${patient.id}">
                    <div class="col-name">${patient.first_name} ${patient.last_name}</div>
                    <div class="col-phone">${patient.phone}</div>
                    <div class="col-city">${patient.city || 'N/A'}</div>
                    <div class="col-policies">${activePolicies}</div>
                </div>
            `;
        }).join('');

        this.dom.setHTML('#patientList', html);
    }

    renderStats(stats) {
        if (!stats) return;

        this.dom.setText('#activeCount', stats.active_policies || 0);
        this.dom.setText('#cancelledCount', stats.cancelled_policies || 0);
        this.dom.setText('#expiredCount', stats.expired_policies || 0);
        this.dom.setText('#expiringCount', stats.expiring_soon || 0);
    }

    renderPatientSummary(patient, policies) {
        this.dom.setText('#detailName', `${patient.first_name} ${patient.last_name}`);
        this.dom.setText('#detailAge', patient.age || 'N/A');
        this.dom.setText('#detailCity', patient.city || 'N/A');
        this.dom.setText('#detailPhone', patient.phone);
        this.dom.setText('#detailEmail', patient.email);

        // UPDATED: Display image or initials
        const avatarElement = this.dom.select('#patientAvatar');
        if (patient.image_url) {
            // Show patient image
            avatarElement.innerHTML = `<img src="http://localhost:3000${patient.image_url}" alt="${patient.first_name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            // Show initials
            const initials = `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`;
            avatarElement.textContent = initials;
        }

        // Update policy count
        const policyCount = policies ? policies.length : 0;
        this.dom.setText('#policyCount', `${policyCount} ${policyCount === 1 ? 'Policy' : 'Policies'}`);

        this.renderPolicies(policies, patient.id);
    }

    renderPolicies(policies, patientId) {
        const container = this.dom.select('#policiesTable');

        if (!policies || policies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity: 0.3; margin-bottom: 12px;">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
                    </svg>
                    <p>No policies found for this patient</p>
                </div>
                <button class="primary-btn" onclick="window.app.createPolicyForPatient(${patientId})" style="width: 100%; margin-top: 1rem;">
                    + Create New Policy
                </button>
            `;
            return;
        }

        // Create table with policies
        const tableRows = policies.map(policy => `
            <tr>
                <td class="policy-number">${policy.policy_number}</td>
                <td>${policy.plan_name}</td>
                <td>₹${Number(policy.sum_insured).toLocaleString('en-IN')}</td>
                <td>
                    ${this.formatDate(policy.start_date)}<br/>
                    <small style="color: #999;">to ${this.formatDate(policy.end_date)}</small>
                </td>
                <td>
                    <span class="status-badge ${policy.status.toLowerCase()}">${policy.status}</span>
                </td>
                <td>
                    <div class="policy-actions">
                        ${this.renderPolicyActions(policy, patientId)}
                    </div>
                </td>
            </tr>
        `).join('');

        const html = `
            <div class="policies-table-wrapper">
                <table class="policies-table">
                    <thead>
                        <tr>
                            <th>Policy #</th>
                            <th>Plan</th>
                            <th>Sum Insured</th>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <button class="primary-btn" onclick="window.app.createPolicyForPatient(${patientId})" style="width: 100%; margin-top: 1rem;">
                + Create New Policy
            </button>
        `;

        container.innerHTML = html;
    }

    renderPolicyActions(policy, patientId) {
        const actions = [];

        if (policy.status === 'ACTIVE') {
            actions.push(`<button class="secondary-btn" onclick="window.app.cancelPolicy(${policy.id})">Cancel</button>`);
            actions.push(`<button class="primary-btn" onclick="window.app.renewPolicy(${policy.id})">Renew</button>`);
        } else if (policy.status === 'EXPIRED') {
            actions.push(`<button class="primary-btn" onclick="window.app.renewPolicy(${policy.id})">Renew</button>`);
        } else if (policy.status === 'CANCELLED') {
            // No actions for cancelled policies
            actions.push(`<span style="color: #999; font-size: 0.8rem;">No actions available</span>`);
        }

        return actions.join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        
        // Handle MySQL date format (YYYY-MM-DD)
        if (typeof dateString === 'string' && dateString.includes('-')) {
            const [year, month, day] = dateString.split('T')[0].split('-');
            return `${month}/${day}/${year}`;
        }
        
        return date.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
        });
    }
}

export default UIManager;
