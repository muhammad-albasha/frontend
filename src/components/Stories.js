// src/components/Stories.js
import React, { useState, useEffect } from 'react';
import { Step } from './Step';

export const Stories = () => {
    const [stories, setStories] = useState([]);
    const [selectedStoryId, setSelectedStoryId] = useState('');
    const [selectedStory, setSelectedStory] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/stories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setStories(data);
            } catch (error) {
                console.error('Error fetching stories', error);
            }
        };

        fetchStories();
    }, []);

    const handleStorySelection = (e) => {
        const selectedId = e.target.value;
        setSelectedStoryId(selectedId);
        const story = stories.find(story => story._id === selectedId);
        setSelectedStory(story);
    };

    const handleStepClick = (step) => {
        setSelectedStep(step);
        setShowPopup(true);
    };

    const addStep = () => {
        setSelectedStep(null);
        setShowPopup(true);
    }

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="story-container">
            <h2>Stories</h2>
            <select title='select story' onChange={handleStorySelection} value={selectedStoryId}>
                <option value=""> None </option>
                {stories.map((content, index) => (
                    <option key={index} value={content._id}>{content.story}</option>
                ))}
            </select>   

            {selectedStory && (
                <div>
                    <h2>{selectedStory.story}</h2>
                    <ul>
                        {selectedStory.steps.map((step, index) => (
                            <li key={index} onClick={() => handleStepClick(step)}>
                                <p>Intent: {step.intent}</p>
                                <p>Action: {step.action}</p>
                            </li>
                        ))}
                    </ul>
                    <button onClick={addStep}>Add Step</button>
                    {showPopup && (
                        <div className='backdrop'>
                            <div className='popup'>
                                <Step story={selectedStory} step={selectedStep} closePopup={closePopup} />
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}