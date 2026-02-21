import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/AxiosInstance";
import swal from "sweetalert";
import logo from "../../../assets/images/logo-full.png";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return swal("Error", "Passwords do not match", "error");
        }
        setLoading(true);
        try {
            await axiosInstance.post("/auth/reset-password", { token, newPassword });
            swal("Success", "Password reset successfully", "success")
                .then(() => navigate("/page-login"));
        } catch (error) {
            swal("Oops", error.response?.data?.message || "Reset failed", "error");
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
                                    <h4 className="text-center mb-4 text-black">Reset Password</h4>
                                    <form onSubmit={onSubmit}>
                                        <div className="form-group mb-3">
                                            <label className="mb-1 form-label"><strong>New Password</strong></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="mb-1 form-label"><strong>Confirm New Password</strong></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="text-center">
                                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                                {loading ? "Resetting..." : "Reset Password"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
