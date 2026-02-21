import React, { Fragment, useState, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import axiosInstance from "../../../services/AxiosInstance";
import swal from "sweetalert";

function UserProfileSettings() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
        profilePicture: ""
    });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get("/users/profile");
            setProfile(response.data.user);
        } catch (error) {
            swal("Error", "Failed to load profile", "error");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put("/users/profile", profile);
            swal("Success", "Profile updated successfully", "success");
        } catch (error) {
            swal("Error", error.response?.data?.message || "Update failed", "error");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return swal("Error", "New passwords do not match", "error");
        }
        try {
            await axiosInstance.put("/users/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            swal("Success", "Password changed successfully", "success");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            swal("Error", error.response?.data?.message || "Password change failed", "error");
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
            const response = await axiosInstance.put("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setProfile({ ...profile, profilePicture: response.data.user.profilePicture });
            swal("Success", "Profile picture updated", "success");
        } catch (error) {
            swal("Error", "Upload failed", "error");
        }
    };

    if (loading) return <div className="text-center p-5">Loading Profile...</div>;

    return (
        <Fragment>
            <PageTitle activeMenu="Profile Settings" motherMenu="App" />
            <div className="row">
                <div className="col-xl-3 col-lg-4">
                    <div className="card profile-card author-profile m-b30">
                        <div className="card-body">
                            <div className="p-5">
                                <div className="author-profile text-center">
                                    <div className="author-media position-relative d-inline-block">
                                        <img
                                            src={profile.profilePicture || "https://via.placeholder.com/150"}
                                            alt=""
                                            className="rounded-circle"
                                            width="150"
                                            height="150"
                                            style={{ objectFit: "cover" }}
                                        />
                                        <div className="upload-link" style={{ position: "absolute", bottom: "5px", right: "5px" }}>
                                            <input type="file" className="update-flie" onChange={handleFileChange} style={{ display: "none" }} id="avatar-upload" />
                                            <label htmlFor="avatar-upload" className="btn btn-primary btn-sm rounded-circle p-2">
                                                <i className="fa fa-camera" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="author-info mt-3">
                                        <h6 className="title">{profile.name}</h6>
                                        <span>{profile.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-9 col-lg-8">
                    <div className="card profile-card m-b30">
                        <div className="card-header"><h4 className="card-title">Update Info</h4></div>
                        <form className="profile-form" onSubmit={handleProfileUpdate}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-sm-6 mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                    </div>
                                    <div className="col-sm-6 mb-3">
                                        <label className="form-label">Phone</label>
                                        <input type="text" className="form-control" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-control" rows="4" value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>

                    <div className="card profile-card m-b30">
                        <div className="card-header"><h4 className="card-title">Change Password</h4></div>
                        <form className="profile-form" onSubmit={handlePasswordChange}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-sm-4 mb-3">
                                        <label className="form-label">Current Password</label>
                                        <input type="password" password className="form-control" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                                    </div>
                                    <div className="col-sm-4 mb-3">
                                        <label className="form-label">New Password</label>
                                        <input type="password" password className="form-control" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                                    </div>
                                    <div className="col-sm-4 mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <input type="password" password className="form-control" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button type="submit" className="btn btn-danger text-white">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default UserProfileSettings;
