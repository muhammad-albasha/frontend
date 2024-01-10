import React, { useEffect, useCallback, useState } from "react";
import { useForm , useFieldArray} from 'react-hook-form';

export const UserManager = () => {
    const { register, handleSubmit, control, watch, setValue, getValues, reset } = useForm({
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
            stories: [{ story: '' }],
            selectedStoryId: '',
            allStories: []
        }
    });

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://chatbot.uni-wuppertal.de/api/users`, {
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

    const fetchAllStories = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://chatbot.uni-wuppertal.de/api/stories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const stories = await response.json();
            if (Array.isArray(stories)) {
                setValue('allStories', stories);
            } else {
                console.error('Unexpected response from server:', stories);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    }, [setValue]);

    useEffect(() => {
        fetchUsers();
        fetchAllStories();
    }, [fetchUsers, fetchAllStories]);

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
        console.log("🚀 ~ data:", data);
        const { selectedUserId, users, _id, ...userData } = data;
        const token = localStorage.getItem('token');
        const url = selectedUserId ? 
        `https://chatbot.uni-wuppertal.de/api/users/user/${selectedUserId}` : 
        `https://chatbot.uni-wuppertal.de/api/users/user`;
        const method = selectedUserId ? 'PUT' : 'POST';
        console.log("🚀 ~ url:", url);
        console.log("🚀 ~ userData:", userData);
        const updatedUserData = {
            ...userData,
            stories: userData.stories.map(s => s._id)
        };
        console.log("🚀 ~ updatedUserData:", updatedUserData);
        
        try {
            await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUserData),
            });
    
            fetchUsers();
        } catch (error) {
            console.error('Error at user operation:', error);
        }
    };
    const fetchUserStories = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://chatbot.uni-wuppertal.de/api/users/${userId}/stories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const storiesData = await response.json();
            if (Array.isArray(storiesData)) {
                setValue('stories', storiesData);
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
            stories: []
        });
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "stories"
    });

    const handleAddStory = () => {
        const selectedStoryId = getValues("selectedStoryId");
        const allStories = getValues("allStories");
        const storyToAdd = allStories.find(story => story._id === selectedStoryId);
        if (storyToAdd) {
            append({ story: storyToAdd.story, _id: storyToAdd._id });
            setValue("selectedStoryId", ''); // Reset der Auswahl
        }
    };

    const remainingStories = watch("allStories").filter(story => 
        !fields.some(field => field._id === story._id)
    );
    
    
    const [isStoryPopupOpen, setIsStoryPopupOpen] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState("");

    const openStoryPopup = () => setIsStoryPopupOpen(true);
    const closeStoryPopup = () => setIsStoryPopupOpen(false);
    
    const handleNewStoryChange = (e) => setNewStoryTitle(e.target.value);

    const handleCreateStory = async () => {
        if (!newStoryTitle) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://chatbot.uni-wuppertal.de/api/users/story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ story: newStoryTitle }),
            });
            if (response.ok) {
                setNewStoryTitle("");
                closeStoryPopup();
                fetchAllStories();
            } else {
                throw new Error('Failed to create story');
            }
        } catch (error) {
            console.error('Error creating story:', error);
        }
    };

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
                    <div className="stories-list">
                        <label>Stories:</label>
                        <ul>
                            {fields.map((field, index) => (
                                <li key={field.id}>
                                    {field.story}
                                    <button type="button" onClick={() => remove(index)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                        <select {...register("selectedStoryId")}>
                            <option value="">Wähle eine Story</option>
                                {remainingStories.map(story => (
                                    <option key={story._id} value={story._id}>{story.story}</option>
                                ))}
                        </select>
                    <button type="button" onClick={handleAddStory}>Story hinzufügen</button>
                    </div>
                    <button type="submit">Speichern</button>
                </div>
            </form>
            )}
            <br />
            {!watch('addingUser') && !isStoryPopupOpen && (
            <button onClick={addUser}>Create User</button>
            )}
            {!isStoryPopupOpen && (
                <button onClick={openStoryPopup}>Create Story</button>
            )}

            {isStoryPopupOpen && (
                <div className="story-popup">
                    <h2>Create Story</h2>
                    <input 
                        type="text"
                        placeholder="Story title"
                        value={newStoryTitle}
                        onChange={handleNewStoryChange}
                    />
                    <button onClick={handleCreateStory}>Speichern</button>
                    <button onClick={closeStoryPopup}>Abbrechen</button>
                </div>
            )}
            
        </div>
    );
};