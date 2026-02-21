import {
    formatError,
    login,
    googleLogin,
    saveTokenInLocalStorage,
    signUp,
} from '../../services/AuthService';

export const SIGNUP_CONFIRMED_ACTION = '[signup action] confirmed signup';
export const SIGNUP_FAILED_ACTION = '[signup action] failed signup';
export const LOGIN_CONFIRMED_ACTION = '[login action] confirmed login';
export const LOGIN_FAILED_ACTION = '[login action] failed login';
export const LOADING_TOGGLE_ACTION = '[Loading action] toggle loading';
export const LOGOUT_ACTION = '[Logout action] logout action';

export function signupAction(name, email, password, navigate) {
    return (dispatch) => {
        signUp(name, email, password)
            .then((response) => {
                saveTokenInLocalStorage(response.data.user);
                runLogoutTimer(dispatch, 15 * 60 * 1000, navigate);
                dispatch(confirmedSignupAction(response.data.user));
                navigate('/dashboard');
            })
            .catch((error) => {
                dispatch(signupFailedAction(formatError(error)));
            });
    };
}

export function loginAction(email, password, navigate) {
    return (dispatch) => {
        login(email, password)
            .then((response) => {
                saveTokenInLocalStorage(response.data.user);
                runLogoutTimer(dispatch, 15 * 60 * 1000, navigate);
                dispatch(loginConfirmedAction(response.data.user));
                navigate('/dashboard');
            })
            .catch((error) => {
                dispatch(loginFailedAction(formatError(error)));
            });
    };
}

export function googleLoginAction(googleData, navigate) {
    return (dispatch) => {
        googleLogin(googleData)
            .then((response) => {
                saveTokenInLocalStorage(response.data.user);
                runLogoutTimer(dispatch, 15 * 60 * 1000, navigate);
                dispatch(loginConfirmedAction(response.data.user));
                navigate('/dashboard');
            })
            .catch((error) => {
                dispatch(loginFailedAction(formatError(error)));
            });
    };
}

export function Logout(navigate) {
    localStorage.removeItem('userDetails');
    if (navigate) navigate('/login');
    return { type: LOGOUT_ACTION };
}

export function loginFailedAction(data) { return { type: LOGIN_FAILED_ACTION, payload: data }; }
export function loginConfirmedAction(data) { return { type: LOGIN_CONFIRMED_ACTION, payload: data }; }
export function confirmedSignupAction(payload) { return { type: SIGNUP_CONFIRMED_ACTION, payload }; }
export function signupFailedAction(message) { return { type: SIGNUP_FAILED_ACTION, payload: message }; }
export function loadingToggleAction(status) { return { type: LOADING_TOGGLE_ACTION, payload: status }; }

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => dispatch(Logout(navigate)), timer);
}

export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('userDetails');
    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
        return;
    }
    const tokenDetails = JSON.parse(tokenDetailsString);
    const expireDate = new Date(tokenDetails.expireDate);
    const todaysDate = new Date();

    if (todaysDate > expireDate) {
        dispatch(Logout(navigate));
        return;
    }
    dispatch(loginConfirmedAction(tokenDetails));
    runLogoutTimer(dispatch, expireDate.getTime() - todaysDate.getTime(), navigate);
}
