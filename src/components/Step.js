// components/Step.js
import { useForm, useFieldArray } from 'react-hook-form';
import React from 'react';
import { useEffect, useCallback } from 'react';



let validateTimer = null;
export const Step = ({ step, closePopup}) => {
  

  const { control, register, setValue, handleSubmit, watch, getValues, formState: {
    errors,
    isValidating,
    isSubmitting,
    // isValid,
  } } = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      ...step,
      showImages: false,
      showAttachments: false,
      examples: step?.examples?.map(example => ({ text: example }))
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

  const fetchResponse = useCallback(async (responseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/responses/${responseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setValue('response.text', data.text);
      setValue('response.images', data.images);
      setValue('response.attachments', data.attachments);

      setValue('showImages', data.images && data.images.length > 0);
      setValue('showAttachments', data.attachments && data.attachments.length > 0);
    } catch (error) {
      console.error('Error fetching response details', error);
    }
  }, [setValue]); // Abhängigkeit zu setValue

  useEffect(() => {
    if (step && step.response_id) {
      fetchResponse(step.response_id);
    }
  }, [step, step?.response_id, fetchResponse]);

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
    data.examples = data.examples.map(example => example.text);

    console.log("🚀 ~ data:", data);
    console.log("🚀 ~ response_id", step.response_id);

    if (step) {
      console.log("update");
    } else {
      console.log("create");
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
