import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/user.css';
import StudentNavbar from '../components/StudentNavbar';
import 'animate.css';

function StudentProfile() {
    const [profile, setProfile] = useState({ username: '', email: '', rollNo: '', image: '' });
    const [message, setMessage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get('http://localhost:5000/api/student/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setProfile(res.data);
            setImagePreview(res.data.image || '');
        })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile({ ...profile, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', profile.username);
            formData.append('email', profile.email);
            formData.append('rollNo', profile.rollNo);
            if (profile.image instanceof File) {
                formData.append('image', profile.image);
            }
            await axios.put('http://localhost:5000/api/student/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Error updating profile');
        }
    };

    return (
        <>
            <StudentNavbar />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-7">
                        <div className="card shadow animate__animated animate__fadeInDown" style={{ borderRadius: 18 }}>
                            <div className="card-body">
                                <h3 className="card-title mb-4 text-center animate__animated animate__fadeInDown">Edit Profile</h3>
                                {message && (
                                    <div className="alert alert-info animate__animated animate__fadeInDown text-center">
                                        {message}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="mb-3 text-center">
                                        <img
                                            src={imagePreview || '/default-profile.png'}
                                            alt="Profile"
                                            className="rounded-circle mb-2 shadow"
                                            style={{
                                                width: 110,
                                                height: 110,
                                                objectFit: 'cover',
                                                border: '3px solid #ffc107',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                            }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control mt-2"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Username:</label>
                                        <input
                                            name="username"
                                            value={profile.username}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email:</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Roll No:</label>
                                        <input
                                            name="rollNo"
                                            value={profile.rollNo}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Enter your roll number"
                                        />
                                    </div>
                                    <button className="btn btn-primary w-100 animate__animated animate__pulse animate__delay-1s" type="submit">
                                        Update
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentProfile;
