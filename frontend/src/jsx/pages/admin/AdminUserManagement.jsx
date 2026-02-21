import React, { Fragment, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import axiosInstance from "../../../services/AxiosInstance";
import swal from "sweetalert";

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/admin/users?page=${page}&search=${search}`);
            setUsers(response.data.users);
            setTotalPages(response.data.pages);
        } catch (error) {
            swal("Error", "Failed to fetch users", "error");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleBlock = async (userId, isBlocked) => {
        try {
            await axiosInstance.put(`/admin/users/${userId}`, { isBlocked: !isBlocked });
            swal("Success", `User ${isBlocked ? 'unblocked' : 'blocked'} successfully`, "success");
            fetchUsers();
        } catch (error) {
            swal("Error", "Action failed", "error");
        }
    };

    const handleDelete = (userId) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this user!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    await axiosInstance.delete(`/admin/users/${userId}`);
                    swal("Deleted", "User has been deleted", "success");
                    fetchUsers();
                } catch (error) {
                    swal("Error", "Deletion failed", "error");
                }
            }
        });
    };

    const handleImpersonate = async (userId) => {
        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/impersonate`);
            localStorage.setItem('impersonationToken', response.data.token);
            swal("Impersonation Started", "You are now viewing the app as this user", "success")
                .then(() => window.location.href = "/dashboard");
        } catch (error) {
            swal("Error", "Impersonation failed", "error");
        }
    };

    return (
        <Fragment>
            <PageTitle activeMenu="User Management" motherMenu="Admin" />
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">All Users</h4>
                            <form onSubmit={handleSearch} className="d-flex">
                                <input
                                    type="text"
                                    className="form-control form-control-sm me-2"
                                    placeholder="Search by name/email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                            </form>
                        </div>
                        <div className="card-body py-3">
                            <div className="table-responsive">
                                <table className="table table-sm mb-0 table-striped">
                                    <thead>
                                        <tr>
                                            <th>Avatar</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                        ) : users.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center">No users found</td></tr>
                                        ) : users.map((user) => (
                                            <tr key={user._id}>
                                                <td className="py-2">
                                                    <img
                                                        src={user.profilePicture || "https://via.placeholder.com/30"}
                                                        className="rounded-circle"
                                                        width="30"
                                                        alt="avatar"
                                                    />
                                                </td>
                                                <td className="py-3">{user.name}</td>
                                                <td className="py-2">{user.email}</td>
                                                <td className="py-2"><span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>{user.role}</span></td>
                                                <td className="py-2">
                                                    <span className={`badge ${user.isBlocked ? 'bg-warning' : 'bg-success'}`}>
                                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="py-2">
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="" className="btn btn-primary tp-btn-light sharp i-false">
                                                            <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><rect x="0" y="0" width="24" height="24"></rect><circle fill="#000000" cx="5" cy="12" r="2"></circle><circle fill="#000000" cx="12" cy="12" r="2"></circle><circle fill="#000000" cx="19" cy="12" r="2"></circle></g></svg>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleBlock(user._id, user.isBlocked)}>
                                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleImpersonate(user._id)}>Impersonate</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleDelete(user._id)} className="text-danger">Delete</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                                <span>Page {page} of {totalPages}</span>
                                <div>
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-outline-primary btn-xs me-1">Prev</button>
                                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-outline-primary btn-xs">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default AdminUserManagement;
