// Policy Service - API calls for policy operations
const API_BASE = 'http://localhost:3000/api';

class PolicyService {
    async getAllPolicies() {
        try {
            const response = await fetch(`${API_BASE}/policies`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching policies:', error);
            throw error;
        }
    }

    async getPoliciesByPatient(patientId) {
        try {
            const allPolicies = await this.getAllPolicies();
            return allPolicies.filter(p => p.patient_id == patientId);
        } catch (error) {
            console.error('Error fetching patient policies:', error);
            return [];
        }
    }

    async createPolicy(policyData) {
        try {
            const response = await fetch(`${API_BASE}/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(policyData)
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create policy');
            }

            return data;
        } catch (error) {
            console.error('Error creating policy:', error);
            throw error;
        }
    }

    async cancelPolicy(policyId, reason) {
        try {
            const response = await fetch(`${API_BASE}/policies/${policyId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to cancel policy');
            }

            return data;
        } catch (error) {
            console.error('Error cancelling policy:', error);
            throw error;
        }
    }

    async renewPolicy(policyId, endDate) {
        try {
            const response = await fetch(`${API_BASE}/policies/${policyId}/renew`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ end_date: endDate })
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to renew policy');
            }

            return data;
        } catch (error) {
            console.error('Error renewing policy:', error);
            throw error;
        }
    }

    async getDashboardStats() {
        try {
            const response = await fetch(`${API_BASE}/policies/dashboard`);
            const data = await response.json();
            console.log("the stats data is : ",data)
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    }
}

export default PolicyService;