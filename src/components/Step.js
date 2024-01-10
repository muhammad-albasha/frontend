// components/Step.js
import { useForm, useFieldArray } from 'react-hook-form';
import React from 'react';


let validateTimer = null;
export const Step = ({ step, closePopup, handleUpdateStepState, handleAddStepState }) => {

  const { control, register, setValue, handleSubmit, watch, getValues, formState: {
    errors,
    isValidating,
    isSubmitting,
    isValid,
  } } = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      ...step,
      showImages: step.images && step.images.length > 0,
      showAttachments: step.attachments && step.attachments.length > 0,
      examples: step.examples ? step.examples.map(example => ({ text: example })) : [],
      response: {
        text: step.text,
        images: step.images || [],
        attachments: step.attachments || [],
      },
    },
  });
  
  const showImages = watch("showImages");
  const showAttachments = watch("showAttachments");

  const { remove, append, fields } = useFieldArray({
    control,
    name: 'examples',
    rules: {
      required: {
        value: true,
        message: 'Bitte Beispiel angeben'
      },
      minLength: {
        value: 4,
        message: 'Beispiel muss mindestens 4 Zeichen lang sein'
      },
    }
  });

  const toggleShowImages = () => {
    const currentShowImages = getValues("showImages");
    setValue("showImages", !currentShowImages);
    if (getValues("showAttachments")) {
      setValue("showAttachments", false);
    }
  };

  const toggleShowAttachments = () => {
    const currentShowAttachments = getValues("showAttachments");
    setValue("showAttachments", !currentShowAttachments);
    if (getValues("showImages")) {
      setValue("showImages", false);
    }
  };
  
  const onSubmit = async (data) => {
    if (!step || !step.story_id) {
      console.error('Story ID is missing');
      return;
    }

    data.examples = data.examples.map(example => example.text);
    const stepData = {
        storyId: step.story_id,
        intent: data.intent,
        examples: data.examples,
        action: 'answer',
        text: data.response.text,
        images: data.response.images,
        attachments: data.response.attachments,
    };

    try {
        const token = localStorage.getItem('token');
        const url = step._id
            ? `https://chatbot.uni-wuppertal.de/api/stories/steps/${step._id}`
            : `https://chatbot.uni-wuppertal.de/api/stories/steps`;

        const response = await fetch(url, {
            method: step._id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(stepData)
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Step saved, response:", responseData);
          closePopup();
          handleUpdateStepState(responseData);
          handleAddStepState(responseData);
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error saving step', error);
      }
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="step-form">
    <div className="step-form-container">
      <div className="rest-section">
        <label htmlFor="intent">Intent:  </label>
        <input type="text"

          {...register("intent", {
            required: {
              value: true,
              message: 'Bitte Intent angeben'
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Bitte nur Buchstaben, Zahlen und Unterstriche verwenden'
            },
            validate: async (value) => {
              if(value === step?.intent) return true;
              clearTimeout(validateTimer);
              await new Promise(
                (resolve) => (validateTimer = setTimeout(resolve, 500))
              );
              const isValid = await fetch(`https://chatbot.uni-wuppertal.de/api/stories/check-intent`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ 
                  intent: value
                })
              }).then(res => res.json()).then(data => data.isValid);
              return isValid || "Intent existiert bereits";
            }
          })} />
        {isValidating && <p>Validating...</p>}
        {errors.intent && <p style={{ color: "red" }}>{errors.intent.message}</p>}
      <div>
        <label htmlFor="response">Response</label>
        <textarea
          rows={6}
          style={{ width: "100%", resize: "none" }}
          {...register("response.text", {
            required: {
              value: true,
              message: 'Bitte Response angeben'
            },
          })} />
        {errors.response && <p style={{ color: "red" }}>{errors.response.message}</p>}
      </div>
      <div>
      <label>
        <input type="checkbox" {...register("showImages")} onChange={toggleShowImages} />
        Image URLs anzeigen
      </label>
    </div>
    <div>
      <label>
      <input type="checkbox" {...register("showAttachments")} onChange={toggleShowAttachments} />
        Attachment URLs anzeigen
      </label>
    </div>

    {showImages && (
      <div>
        <label htmlFor="images">Image URLs</label>
        <input type="text" {...register("response.images.0")} />
      </div>
    )}

    {showAttachments && (
      <div>
        <label htmlFor="attachments">Attachment URLs</label>
        <input type="text" {...register("response.attachments.0")} />
      </div>
    )}
    <br />
    <br />
    <div className="form-footer">
      <button type="submit"  disabled={!isValid} >
        Speichern {isSubmitting && <div>Loading...</div>}
      </button>
        <button type="button" onClick={closePopup}>
        Abbrechen
        </button>
        </div>
      </div>
      <div className="form-content">
        <label htmlFor="examples">Beispiele</label>
        <div className="examples-section">
        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              type="text"
              defaultValue={field.text}
              {...register(`examples.${index}.text`, {
                required: {
                  value: true,
                  message: 'Bitte Beispiel angeben'
                },
              })}
            />
            <button type="button" onClick={() => remove(index)}>
              x
            </button>
          </div>
        ))}
        {errors.examples && <p style={{ color: "red" }}>{errors.examples?.root?.message}</p>}
      </div>
        <button type="button" onClick={() => append({ text: '' })}>
          Hinzufügen
        </button>
      </div>
      </div>
    </form>
  );
}
