// components/Step.js
import { useForm, useFieldArray } from 'react-hook-form';
import React from 'react';
import { useState, useEffect } from 'react';



let validateTimer = null;
export const Step = ({ step, story, closePopup}) => {
  const [showImages, setShowImages] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  

  const { control, register, setValue, handleSubmit, formState: {
    errors,
    isValidating,
    isSubmitting,
    // isValid,
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
      setValue("response", data);
      setShowImages(data.images?.length > 0);
      setShowAttachments(data.attachments?.length > 0);
    };
  
    if (step && step.intent) {
      fetchResponse();
    }
  }, [step]);

  const toggleShowImages = () => {
    setShowImages(!showImages);
    setValue("response.images", []);
    if (showAttachments) {
      setShowAttachments(false);
      setValue("response.attachments", []);
    }
  };
  
  const toggleShowAttachments = () => {
    setShowAttachments(!showAttachments);
    setValue("response.attachments", []);
    if (showImages) {
      setShowImages(false);
      setValue("response.images", []);
    }
  };
  
  
  const onSubmit = async (data) => {
    data.examples = data.examples.map(example => example.text);

    console.log("🚀 ~ data:", data);

    if (step) {
      console.log("update");
    } else {
      console.log("create");
    }

    try {
    const fetchStep = await fetch(`http://localhost:5000/api/stories/${story._id}/${step._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data)
    });

      if (!fetchStep.ok) {
        throw new Error('Fehler beim Aktualisieren des Steps');
      }
      if (fetchStep.ok) {
        console.log("Step:", fetchStep);
        console.log('Step erfolgreich aktualisiert');
      }
    // const fetchResponse = await fetch(`http://localhost:5000/api/stories/response/${step.intent}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //   },
    //   body: JSON.stringify(data)
    // });

    //   if (!fetchResponse.ok) {
    //     throw new Error('Fehler beim Aktualisieren des Steps');
    //   }
    //   if (fetchResponse.ok) {
    //     console.log("Response:", fetchResponse);
    //     console.log('Response erfolgreich aktualisiert');
    //   }

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
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Bitte nur Buchstaben, Zahlen und Unterstriche verwenden'
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
          style={{ width: "100%", resize: "none" }}
          {...register("response.text", {
            required: {
              // value: true,
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
      <button type="submit"  /*disabled={!isValid}*/ >
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
