// Patient Service - API calls for patient operations
const API_BASE = 'http://localhost:3000/api';

class PatientService {
    async getAllPatients() {
        try {
            const response = await fetch(`${API_BASE}/patients`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    }

    async getPatientById(id) {
        try {
            const response = await fetch(`${API_BASE}/patients/${id}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    }

    async getPatientByPhone(phone) {
        try {
            const response = await fetch(`${API_BASE}/patients/${phone}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching patient by phone:', error);
            return null;
        }
    }

    async getPatientByEmail(email) {
        try {
            const response = await fetch(`${API_BASE}/patients/email/${email}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching patient by email:', error);
            return null;
        }
    }

    async getPatientByName(name) {
        try {
            const response = await fetch(`${API_BASE}/patients/name/${name}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching patient by name:', error);
            return null;
        }
    }

    async createPatient(patientData) {
        try {
            const response = await fetch(`${API_BASE}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create patient');
            }

            return data;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    async updatePatient(id, patientData) {
        try {
            const response = await fetch(`${API_BASE}/patients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    }

    async deletePatient(id) {
        try {
            const response = await fetch(`${API_BASE}/patients/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }
}

export default PatientService;