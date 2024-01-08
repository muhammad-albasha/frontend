import React, { useState, useEffect, useCallback } from "react";
import { Step } from "./Step";

export const Stories = () => {
  const [stories, setStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedStep, setSelectedStep] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const selectedStory = stories.find((story) => story._id === selectedStoryId);

  const fetchStories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/stories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories", error);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStorySelection = (e) => {
    const selectedId = e.target.value;
    setSelectedStoryId(selectedId);
  };

  const handleStepClick = (step) => {
    setSelectedStep({ ...step, story_id: selectedStory._id });
    setShowPopup(true);
  };

  const addStep = () => {
    const newStep = {
      story_id: selectedStory._id,
      intent: "",
      examples: [],
      action: "",
    };
    setSelectedStep(newStep);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

const handleUpdateStepState = (updatedStep) => {
    setStories((prevStories) => {
        return prevStories.map((story) => {
            const updatedSteps = story.steps.map((step) => {
                if (step._id === updatedStep._id) {
                    return updatedStep;
                }
                return step;
            });
            return { ...story, steps: updatedSteps };
        });
    });
};

const handleAddStepState = (newStep) => {
    setStories((prevStories) => {
        return prevStories.map((story) => {
            if (story._id === newStep.story_id) {
                // Erstelle eine Kopie der aktuellen Schritte und füge den neuen Schritt hinzu
                const updatedSteps = [...story.steps, newStep];
                // Erstelle eine aktualisierte Kopie der Story mit den neuen Schritten
                return { ...story, steps: updatedSteps };
            }
            return story;
        });
    });
};


  return (
    <div className="story-container">
      <h2>Stories</h2>
      <select
        title="select story"
        onChange={handleStorySelection}
        value={selectedStoryId}
      >
        <option value="">None</option>
        {stories.map((content, index) => (
          <option key={index} value={content._id}>
            {content.story}
          </option>
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
            <div className="backdrop">
              <div className="popup">
                <Step
                  handleUpdateStepState={handleUpdateStepState}
                  handleAddStepState={handleAddStepState}
                  story={selectedStory}
                  step={selectedStep}
                  closePopup={closePopup}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
