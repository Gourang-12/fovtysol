import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import {
  loadingToggleAction,
  signupAction,
  googleLoginAction,
} from '../../../store/actions/AuthActions';

import logo from '../../../assets/images/logo-full.png';
import logo2 from '../../../assets/images/logo-full-white.png';
import pic1 from '../../../assets/images/pic1.svg';

function Register(props) {
  const [openEyes, setOpenEyes] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Email/Password sign-up ───────────────────────────────────
  function onSignUp(e) {
    e.preventDefault();
    const errorObj = { name: '', email: '', password: '' };
    let hasError = false;
    if (!name) { errorObj.name = 'Name is required'; hasError = true; }
    if (!email) { errorObj.email = 'Email is required'; hasError = true; }
    if (!password) { errorObj.password = 'Password is required'; hasError = true; }
    setErrors(errorObj);
    if (hasError) return;
    dispatch(loadingToggleAction(true));
    dispatch(signupAction(name, email, password, navigate));
  }

  // ── Google sign-up ───────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: (tokenResponse) => {
      dispatch(loadingToggleAction(true));
      dispatch(googleLoginAction({ access_token: tokenResponse.access_token }, navigate));
    },
    onError: () => {
      dispatch(loadingToggleAction(false));
    },
  });

  return (
    <>
      <div className="authincation d-flex flex-column flex-lg-row flex-column-fluid">
        {/* ── Left panel ── */}
        <div className="login-aside text-center d-flex flex-column flex-row-auto">
          <div className="d-flex flex-column-auto flex-column pt-lg-40 pt-15">
            <div className="text-center mb-4 pt-5">
              <Link to="/"><img src={logo} className="dark-login" alt="Fovty" /></Link>
              <Link to="/"><img src={logo2} className="light-login" alt="Fovty" /></Link>
            </div>
            <h3 className="mb-2">Welcome back!</h3>
            <p>User Experience &amp; Interface Design <br />Strategy SaaS Solutions</p>
          </div>
          <div className="aside-image" style={{ backgroundImage: `url(${pic1})` }} />
        </div>

        {/* ── Right panel ── */}
        <div className="container flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto">
          <div className="d-flex justify-content-center h-100 align-items-center">
            <div className="authincation-content style-2">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <h4 className="text-center mb-4">Create your account</h4>

                    {props.errorMessage && <div className="bg-red-300 text-red-900 border border-red-900 p-1 my-2">{props.errorMessage}</div>}
                    {props.successMessage && <div className="bg-green-300 text-green-900 border border-green-900 p-1 my-2">{props.successMessage}</div>}

                    <form onSubmit={onSignUp}>
                      {/* Name */}
                      <div className="mb-3">
                        <label className="mb-1 form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <div className="text-danger fs-12">{errors.name}</div>}
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label className="mb-1 form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="hello@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                      </div>

                      {/* Password */}
                      <div className="mb-3">
                        <label className="mb-1 form-label">Password</label>
                        <div className="position-relative">
                          <input
                            type={openEyes ? 'password' : 'text'}
                            className="form-control"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          {errors.password && <div className="text-danger fs-12">{errors.password}</div>}
                          <span className={`show-pass eye ${openEyes ? '' : 'active'}`} onClick={() => setOpenEyes(!openEyes)}>
                            <i className="fa fa-eye-slash" />
                            <i className="fa fa-eye" />
                          </span>
                        </div>
                      </div>

                      {/* Sign Up button */}
                      <div className="text-center mt-4">
                        <button type="submit" className="btn btn-primary btn-block">
                          Sign me up
                        </button>
                      </div>

                      {/* OR divider */}
                      <div className="d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted" style={{ fontSize: '0.85rem' }}>OR</span>
                        <hr className="flex-grow-1" />
                      </div>

                      {/* Google Sign-Up button */}
                      <div className="text-center form-group mb-3">
                        <button
                          type="button"
                          onClick={() => handleGoogleLogin()}
                          className="btn btn-outline-secondary btn-block d-flex align-items-center justify-content-center"
                          style={{ gap: '10px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                          </svg>
                          Continue with Google
                        </button>
                      </div>
                    </form>

                    <div className="new-account mt-3 text-center">
                      <p>Already have an account? <Link className="text-primary" to="/page-login">Sign in</Link></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  errorMessage: state.auth.errorMessage,
  successMessage: state.auth.successMessage,
  showLoading: state.auth.showLoading,
});

export default connect(mapStateToProps)(Register);
