export const isAuthenticated = (state) => {
    if (state.auth.auth._id) return true;
    return false;
};
