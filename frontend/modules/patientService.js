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
            const response = await fetch(`${API_BASE}/patients/phone/${phone}`);
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
            // UPDATED: Check if patientData is FormData (for image upload) or object (for JSON)
            const isFormData = patientData instanceof FormData;
            
            const options = {
                method: 'POST',
                body: isFormData ? patientData : JSON.stringify(patientData)
            };

            // Only set Content-Type for JSON, not for FormData
            // Browser automatically sets multipart/form-data with boundary for FormData
            if (!isFormData) {
                options.headers = {
                    'Content-Type': 'application/json'
                };
            }

            const response = await fetch(`${API_BASE}/patients`, options);
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
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to update patient');
            }
            
            return data;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    }

    //  Update patient image only
    async updatePatientImage(patientId, imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE}/patients/${patientId}/image`, {
                method: 'PUT',
                body: formData
                // No Content-Type header - browser sets it automatically with boundary
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to update image');
            }

            return data;
        } catch (error) {
            console.error('Error updating patient image:', error);
            throw error;
        }
    }

    async deletePatient(id) {
        try {
            const response = await fetch(`${API_BASE}/patients/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to delete patient');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }
}

export default PatientService;
