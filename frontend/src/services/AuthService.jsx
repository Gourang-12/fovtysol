import axiosInstance from './AxiosInstance';
import swal from 'sweetalert';

export function signUp(name, email, password) {
    return axiosInstance.post('/auth/register', { name, email, password });
}

export function login(email, password) {
    return axiosInstance.post('/auth/login', { email, password });
}

export function formatError(error) {
    const msg = error?.response?.data?.message || 'Authentication Failed';
    swal('Oops', msg, 'error');
    return msg;
}

export function saveTokenInLocalStorage(tokenDetails) {
    // Backend uses HTTP-only cookies for tokens.
    // We persist the user info object with an expiry date for auto-login checks.
    tokenDetails.expireDate = new Date(Date.now() + 15 * 60 * 1000);
    localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
}
