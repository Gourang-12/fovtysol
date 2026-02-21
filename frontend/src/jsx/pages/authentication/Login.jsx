import React, { useState } from 'react'
import { connect, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google';
import {
	loadingToggleAction,
	loginAction,
	googleLoginAction,
} from '../../../store/actions/AuthActions';

import logo from '../../../assets/images/logo-full.png';
import logo2 from '../../../assets/images/logo-full-white.png';
import pic1 from '../../../assets/images/pic1.svg';

function Login(props) {
	const [openEyes, setOpenEyes] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState({ email: '', password: '' });

	const dispatch = useDispatch();
	const navigate = useNavigate();

	// ── Email/Password login ─────────────────────────────────────
	function onLogin(e) {
		e.preventDefault();
		const errorObj = { email: '', password: '' };
		let hasError = false;
		if (!email) { errorObj.email = 'Email is required'; hasError = true; }
		if (!password) { errorObj.password = 'Password is required'; hasError = true; }
		setErrors(errorObj);
		if (hasError) return;
		dispatch(loadingToggleAction(true));
		dispatch(loginAction(email, password, navigate));
	}

	// ── Google login ─────────────────────────────────────────────
	const handleGoogleLogin = useGoogleLogin({
		scope: 'openid email profile',
		onSuccess: (tokenResponse) => {
			// Exchange the authorization code for user info via backend
			dispatch(loadingToggleAction(true));
			dispatch(googleLoginAction({ access_token: tokenResponse.access_token }, navigate));
		},
		onError: () => {
			dispatch(loadingToggleAction(false));
		},
	});

	return (
		<div className="authincation d-flex flex-column flex-lg-row flex-column-fluid">
			{/* ── Left panel ── */}
			<div className="login-aside text-center d-none d-sm-flex flex-column flex-row-auto">
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
							<div className="col-xl-12 tab-content">
								<div id="sign-in" className="auth-form form-validation">

									{/* Error / success banners */}
									{props.errorMessage && <div className="bg-red-300 text-red-900 border border-red-900 p-1 my-2">{props.errorMessage}</div>}
									{props.successMessage && <div className="bg-green-300 text-green-900 border border-green-900 p-1 my-2">{props.successMessage}</div>}

									<form onSubmit={onLogin} className="form-validate">
										<h3 className="text-center mb-4 text-black">Sign in your account</h3>

										{/* Email */}
										<div className="form-group mb-3">
											<label className="mb-1 form-label required">Email</label>
											<input
												type="email"
												className="form-control"
												placeholder="Type your email address"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
											{errors.email && <div className="text-danger fs-12">{errors.email}</div>}
										</div>

										{/* Password */}
										<div className="form-group mb-3">
											<label className="mb-1 form-label required">Password</label>
											<div className="position-relative">
												<input
													type={openEyes ? 'password' : 'text'}
													className="form-control"
													placeholder="Type your password"
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

										{/* Remember + Forgot */}
										<div className="form-row d-flex justify-content-between mt-4 mb-2">
											<div className="form-group mb-3">
												<div className="custom-control custom-checkbox ml-1">
													<input type="checkbox" className="form-check-input" id="remember_me" />
													<label className="form-check-label" htmlFor="remember_me">Remember my preference</label>
												</div>
											</div>
											<div className="form-group mb-3">
												<Link to="/page-forgot-password" className="text-primary">Forgot Password?</Link>
											</div>
										</div>

										{/* Sign In button */}
										<div className="text-center form-group mb-3">
											<button type="submit" className="btn btn-primary btn-block">
												Sign In
											</button>
										</div>

										{/* OR divider */}
										<div className="d-flex align-items-center my-3">
											<hr className="flex-grow-1" />
											<span className="mx-3 text-muted" style={{ fontSize: '0.85rem' }}>OR</span>
											<hr className="flex-grow-1" />
										</div>

										{/* Google Sign-In button */}
										<div className="text-center form-group mb-3">
											<button
												type="button"
												onClick={() => handleGoogleLogin()}
												className="btn btn-outline-secondary btn-block d-flex align-items-center justify-content-center gap-2"
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
										<p>Don't have an account? <Link className="text-primary" to="/page-register">Sign up</Link></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => ({
	errorMessage: state.auth.errorMessage,
	successMessage: state.auth.successMessage,
	showLoading: state.auth.showLoading,
});

export default connect(mapStateToProps)(Login);
