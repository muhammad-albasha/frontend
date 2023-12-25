import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async data => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Authentifizierung fehlgeschlagen');
      if (response.ok) {
        const result = await response.json();
        login(result.token);
        navigate('/rasa-training');
      }
    } catch (error) {
      console.error('Login Fehler:', error.message);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username">Benutzername:</label>
          <input id="username" {...register('username', { required: true })} />
          {errors.username && <p>Benutzername ist erforderlich</p>}
        </div>
        <div>
          <label htmlFor="password">Passwort:</label>
          <input id="password" type="password" {...register('password', { required: true })} />
          {errors.password && <p>Passwort ist erforderlich</p>}
        </div>
        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
};

export default LoginForm;
