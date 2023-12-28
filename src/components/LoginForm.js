import React , { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  
  const onSubmit = async data => {
    setLoginError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorResult = await response.json();
        setLoginError(errorResult.message || 'Email oder Passwort ist falsch');
        return;
      }
      
      const result = await response.json();
      login(result.token, result.role);
      navigate('/rasa-training');

    } catch (error) {
      console.error('Login Fehler:', error);
      setLoginError('Netzwerkfehler oder Server nicht erreichbar');  
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
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
