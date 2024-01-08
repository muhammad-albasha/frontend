import React, { useEffect, useCallback } from "react";
import { useForm , useFieldArray} from 'react-hook-form';

export const UserManager = () => {
    const { register, handleSubmit, control, setValue, watch, getValues, reset } = useForm({
        defaultValues: {
            users: [],
            selectedUserId: '',
            addingUser: false,
            name: '',
            username: '',
            email: '',
            secret: '',
            password: '',
            role: 'user',
            has2FA: false,
            active: false,
            stories: [{ story: '' }]
        }
    });

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setValue('users', data);
            } else {
                console.error('Unexpected response from server:', data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [setValue]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUserSelection = (e) => {
        const userId = e.target.value;
        fetchUserStories(userId);
        const users = getValues('users');
        const selectedUser = users.find(user => user._id === userId);
        reset({ ...getValues(), selectedUserId: userId, ...selectedUser, addingUser: false });
    };


    const has2FA = watch('has2FA');
    const active = watch('active');

    const onSubmit = async (data) => {
        const { selectedUserId, users, _id, ...userData } = data;
        const token = localStorage.getItem('token');
        const url = selectedUserId ? 
        `http://localhost:5000/api/users/user/${selectedUserId}` : 
        `http://localhost:5000/api/users/user`;
        const method = selectedUserId ? 'PUT' : 'POST';
        console.log("🚀 ~ url:", url);
        console.log("🚀 ~ userData:", userData);
        try {
            await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });
    
            fetchUsers();
        } catch (error) {
            console.error('Error at user operation:', error);
        }
    };
    const fetchUserStories = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/stories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const storiesData = await response.json();
            if (Array.isArray(storiesData)) {
                // Assuming each story object has a 'title' property
                setValue('stories', storiesData.map(story => ({ story: story.story })));
            } else {
                console.error('Unexpected response from server:', storiesData);
            }
        } catch (error) {
            console.error('Error fetching user stories:', error);
        }
    }, [setValue]);

    const addUser = () => {
        reset({
            ...getValues(),
            selectedUserId: '',
            addingUser: true,
            name: '',
            username: '',
            email: '',
            secret: '',
            password: '',
            role: 'user',
            has2FA: false,
            active: true,
            stories: [{ story: '' }]
        });
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "stories"
    });


    return (
        <div className="user-container">
            <h1>Users</h1>
            <select onChange={handleUserSelection} value={watch('selectedUserId')}>
                <option value="">None</option>
                {watch('users')?.map((user, index) => (
                    <option key={index} value={user._id}>{user.name}</option>
                ))}
            </select>
            {(watch('selectedUserId') || watch('addingUser')) && (
                <form onSubmit={handleSubmit(onSubmit)}>
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
                    <div>
                        <label>Stories:</label>
                        {fields.map((field, index) => (
                            <div key={field.id}>
                                <input
                                    {...register(`stories.${index}.story`)}
                                    defaultValue={field.story} // Set the default value to the title of the story
                                />
                                <button className="remove" type="button" onClick={() => remove(index)}>Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => append({ story: '' })}>
                            Add Story
                        </button>
                    </div>
                    <button type="submit">Speichern</button>
                </div>
            </form>
            )}
            <br />
            <button onClick={addUser}>Add User</button>
            
        </div>
    );
};