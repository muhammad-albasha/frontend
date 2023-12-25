// components/Step.js
import { useForm, useFieldArray } from 'react-hook-form';
import React from 'react';

let validateTimer = null;
export const Step = ({ step , closePopup}) => {
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

  const onSubmit = async (data) => {
    data.examples = data.examples.map(example => example.text);
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
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

      </div>
      <div>
        <label htmlFor="examples">Beispiele</label>
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
              Löschen
            </button>
          </div>
        ))}
        {errors.examples && <p style={{ color: "red" }}>{errors.examples?.root?.message}</p>}
        <button type="button" onClick={() => append({ text: '' })}>
          Hinzufügen
        </button>
      </div>
      <div>
        <label htmlFor="response">Response</label>
        <textarea
          rows={5}
          style={{ width: "100%", resize: "vertical" }}
          {...register("response", {
            required: {
              value: true,
              message: 'Bitte Response angeben'
            },
          })} />
        {errors.response && <p style={{ color: "red" }}>{errors.response.message}</p>}
      </div>
      <br />
      <button type="submit"  disabled={!isValid}>
        Speichern {isSubmitting && <div>Loading...</div>}
      </button>
        <button type="button" onClick={closePopup}>
            Abbrechen
        </button>

    </form>
  );
}
