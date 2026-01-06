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
        
        const container = this.dom.select('#policiesTable');
        container.innerHTML = `
            <div class="empty-state">
                No patient selected
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

        const initials = `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`;
        this.dom.setText('#patientAvatar', initials);

        this.renderPolicies(policies, patient.id);
    }

    renderPolicies(policies, patientId) {
        const container = this.dom.select('#policiesTable');

        if (!policies || policies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    No policies found
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
                <td>$${Number(policy.sum_insured).toLocaleString()}</td>
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
        }

        return actions.join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
}

export default UIManager;
