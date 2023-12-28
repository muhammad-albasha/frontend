import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';

export const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const { register, handleSubmit, setValue, watch } = useForm();
    const [selectedUser, setSelectedUser] = useState(null);
    const [AddStory, setAddStory] = useState(false);



const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log(`Bearer ${token}`);
        console.log("Response:", response);
        const data = await response.json();
        if (Array.isArray(data)) {
            setUsers(data);
            console.log("Users:", data);
        } else {
            console.error('Unerwartete Antwort vom Server:', data);
        }
    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
};



useEffect(() => {
    if (selectedUser) {
        setValue('name', selectedUser.name);
        setValue('username', selectedUser.username);
        setValue('email', selectedUser.email);
        setValue('secret', selectedUser.secret);
        setValue('password', selectedUser.password);
        setValue('role', selectedUser.role);
        setValue('has2FA', selectedUser.has2FA);
        setValue('active', selectedUser.active);
    }
    fetchUsers();
}, [selectedUser, setValue]);

const handleUserSelection = (e) => {
    const selectedId = e.target.value;
    setSelectedUserId(selectedId);
    const user = users.find(user => user._id === selectedId);
    setSelectedUser(user);
};

const onSubmit = async (data) => {
    console.log("🚀 ~ data:", data);
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/user/${selectedUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            
            // Fetch users again to update the list or handle as needed
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }

};

const has2FA = watch('has2FA'); 
const active = watch('active');


const [addNeuUSer, setAddNeuUser] = useState(false);

const addUser = () => {
    setAddNeuUser(true);
};

const closePopup = () => {
    setAddNeuUser(false);
};

const addStory = () => {
    setAddStory(true);
}

const closeAddStory = () => {
    setAddStory(false);
}

return (
    <div className="user-container">
        <h1>Users</h1>
        <select title='None' onChange={handleUserSelection} value={selectedUserId}>
            <option value=""> None </option>
            {users.map((user, index) => (
                <option key={index} value={user._id}>{user.name}</option>
            ))}
        </select>
        <form onSubmit={handleSubmit(onSubmit)}>
            {selectedUser && (
                <div className="user-form">
                    <label htmlFor="name">Name:</label>
                    <input id="name" {...register('name')} />
                    <label htmlFor="username">Benutzername:</label>
                    <input id="username" {...register('username')} />
                    <label htmlFor="email">Email:</label>
                    <input id="email" {...register('email')} />
                    <label htmlFor="secret">Secret:</label>
                    <input id="secret" {...register('secret')} />
                    <label htmlFor="password">Passwort:</label>
                    <input id="password" {...register('password')} />
                    <label htmlFor="role">Rolle:</label>
                    <select id="role" {...register('role')}>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                    <label htmlFor="has2FA">2FA:</label>
                    <input id="has2FA" type="checkbox" {...register('has2FA')} checked={has2FA} />
                    <label htmlFor="active">Aktiv:</label>
                    <input id="active" type="checkbox" {...register('active')} checked={active} />
                    <button type="submit">Speichern</button>
                </div>
            )}
        </form>
        <button onClick={addUser}>Neuen User anlegen</button>
        {addNeuUSer && (
                <div>
                    <div className="user-form">
                        <label htmlFor="name">Name:</label>
                        <input id="name" {...register('name')} />
                        <label htmlFor="username">Benutzername:</label>
                        <input id="username" {...register('username')} />
                        <label htmlFor="email">Email:</label>
                        <input id="email" {...register('email')} />
                        <label htmlFor="secret">Secret:</label>
                        <input id="secret" {...register('secret')} />
                        <label htmlFor="password">Passwort:</label>
                        <input id="password" {...register('password')} />
                        <label htmlFor="role">Rolle:</label>
                        <select id="role" {...register('role')}>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <label htmlFor="has2FA">2FA:</label>
                        <input id="has2FA" type="checkbox" {...register('has2FA')} checked={has2FA} />
                        <label htmlFor="active">Aktiv:</label>
                        <input id="active" type="checkbox" {...register('active')} checked={active} />
                        <button type="submit">Speichern</button>
                        </div>
                        <button type="reset"  onClick={closePopup}>Abbrechen</button>
                    </div>
                    )}
                    <div>
                    <button onClick={addStory}>Add Story</button>
                    {AddStory && (
                        <div>
                            <div className='story-form'>
                                <h2>Neu Story</h2>
                                <label htmlFor="name">Name:</label>
                                <input id="name" /*{ }*/></input>
                                <button type="submit">Speichern</button>
                            </div>
                            <button onClick={closeAddStory}>Abbrechen</button>
                        </div>
                    )}
                    </div>
                </div>
            );
        };