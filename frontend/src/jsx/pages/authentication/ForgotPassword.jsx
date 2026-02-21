import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../services/AxiosInstance";
import swal from "sweetalert";
import logo from "../../../assets/images/logo-full.png";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post("/auth/forgot-password", { email });
            swal("Success", response.data.message, "success");
        } catch (error) {
            swal("Oops", error.response?.data?.message || "Failed to send reset link", "error");
        }
        setLoading(false);
    };

    return (
        <div className="authincation d-flex flex-column flex-lg-row flex-column-fluid">
            <div className="container flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto">
                <div className="d-flex justify-content-center h-100 align-items-center">
                    <div className="authincation-content style-2">
                        <div className="row no-gutters">
                            <div className="col-xl-12">
                                <div className="auth-form">
                                    <div className="text-center mb-3">
                                        <Link to="/"><img src={logo} alt="" /></Link>
                                    </div>
                                    <h4 className="text-center mb-4 text-black">Forgot Password</h4>
                                    <form onSubmit={onSubmit}>
                                        <div className="form-group mb-3">
                                            <label className="mb-1 form-label"><strong>Email</strong></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="hello@example.com"
                                                required
                                            />
                                        </div>
                                        <div className="text-center">
                                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                                {loading ? "Sending..." : "Send Reset Link"}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="new-account mt-3">
                                        <p className="mb-0">Back to <Link className="text-primary" to="/page-login">Login</Link></p>
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

export default ForgotPassword;
