// components/Step.js
import { useForm, useFieldArray } from 'react-hook-form';
import React from 'react';
import { useState, useEffect } from 'react';



let validateTimer = null;
export const Step = ({ step , closePopup}) => {
  const [response, setResponse] = useState(null);
  const [showImages, setShowImages] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  

  const { control, register, handleSubmit, formState: {
    errors,
    isValidating,
    isSubmitting,
    isValid,
  } } = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      ...step,
      examples: step?.examples?.map(example => ({ text: example }))
    },
  });
  
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
  
  useEffect(() => {
    const fetchResponse = async () => {
      const response = await fetch(`http://localhost:5000/api/stories/response/${step.intent}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setResponse(data);
      setShowImages(data.images?.length > 0);
      setShowAttachments(data.attachments?.length > 0);
    };
  
    if (step && step.intent) {
      fetchResponse();
    }
  }, [step]);

  const toggleShowImages = () => {
    setShowImages(!showImages);
    if (showAttachments) {
      setShowAttachments(false);
    }
  };
  
  const toggleShowAttachments = () => {
    setShowAttachments(!showAttachments);
    if (showImages) {
      setShowImages(false);
    }
  };
  
  
  const onSubmit = async (data) => {
    data.examples = data.examples.map(example => example.text);

      if(setShowAttachments){
          data.images = data.images.split(',').map(item => item.trim());
          delete data.attachments;
      }else if(setShowImages){
        data.attachments = data.attachments.split(',').map(item => item.trim());
        delete data.images;
      }else{
        delete data.images;
        delete data.attachments;
      }


    console.log("🚀 ~ data:", data);

    if (step) {
      console.log("update");
    } else {
      console.log("create");
    }

    try {
    const response = await fetch(`http://localhost:5000/api/stories/steps/${step._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data)
    });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Steps');
      }
      if (response.ok) {
        console.log("Response:", response);
        console.log('Step erfolgreich aktualisiert');
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="step-form">
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
      <div className="rest-section">
        <label htmlFor="intent">Intent</label>
        <input type="text"

          {...register("intent", {
            required: {
              value: true,
              message: 'Bitte Intent angeben'
            },
            pattern: {
              value: /^[a-zA-Z0-9]+$/,
              message: 'Bitte nur Buchstaben und Zahlen verwenden'
            },
            validate: async (value) => {
              if(value === step?.intent) return true;
              clearTimeout(validateTimer);
              await new Promise(
                (resolve) => (validateTimer = setTimeout(resolve, 500))
              );
              const isValid = await fetch(`http://localhost:5000/api/stories/check-intent`, {
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
          defaultValue={response?.text}
          style={{ width: "100%", resize: "none" }}
          {...register("response", {
            required: {
              value: true,
              message: 'Bitte Response angeben'
            },
          })} />
        {errors.response && <p style={{ color: "red" }}>{errors.response.message}</p>}
      </div>
      <div>
      <label>
        <input type="checkbox" checked={showImages} onChange={toggleShowImages} />
        Image URLs anzeigen
      </label>
    </div>
    <div>
      <label>
        <input type="checkbox" checked={showAttachments} onChange={toggleShowAttachments} />
        Attachment URLs anzeigen
      </label>
    </div>

    {showImages && (
      <div>
        <label htmlFor="images">Image URLs</label>
        <input type="text" {...register("images")} defaultValue={response ? response.images.join(", ") : ''} />
      </div>
    )}

    {showAttachments && (
      <div>
        <label htmlFor="attachments">Attachment URLs</label>
        <input type="text" {...register("attachments")} defaultValue={response ? response.attachments.join(", ") : ''} />
      </div>
    )}
    <br />
    <br />
    <div className="form-footer">
      <button type="submit"  disabled={!isValid}>
        Speichern {isSubmitting && <div>Loading...</div>}
      </button>
        <button type="button" onClick={closePopup}>
        Abbrechen
        </button>
        </div>
      </div>
    </form>
  );
}
