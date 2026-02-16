import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../utils/auth';
import './login.css';
import RecuperarPasswordModal from './RecuperarPasswordModal';
import Alert from './Alert';
import { login as apiLogin } from '../services/api';

const Login = ({ onLogin = () => {} }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password:''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRecuperarModal, setShowRecuperarModal] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es valido';
        }

        if (!formData.password) {
            newErrors.password = 'La contrasena es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contrasena debe tener al menos 6 caracteres';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setIsLoading(true);

        try {
            console.log('Iniciando proceso de login...');
            console.log('Email:', formData.email);
            
            // Llamada al API de login
            const response = await apiLogin(formData.email, formData.password);
            
            console.log('Login exitoso!');
            console.log('Usuario:', response.persona);
            
            // Disparar evento para que HomePage actualice el nombre
            window.dispatchEvent(new Event('userDataUpdated'));
            
            // Login exitoso - llamar al callback con el nombre del usuario
            const userName = response.persona.nombre || response.persona.name || formData.email.split('@')[0];
            onLogin(userName);
            
        } catch (error) {
            console.error('Error en login:', error);
            setAlert({
                type: 'error',
                message: error.message || 'Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>SGMI</h2>

                <form onSubmit={handleSubmit} className='login-form'>
                {alert && (
                    <Alert 
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <div className="login-form-group">
                    <label htmlFor='email'>Email</label>
                    <input 
                        type='email' 
                        id='email' 
                        name='email' 
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''} 
                        placeholder='Ingresa tu email'
                    />
                    {errors.email && (
                    <span className='error-message'>{errors.email}</span>
                    )}
                </div>
                <div className="login-form-group">
                    <label htmlFor="password">Contraseña</label>
                    <div className="password-input-container">
                        <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        placeholder="Ingrese su contraseña"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                    <span className="error-message">{errors.password}</span>
                    )}
                </div>
                <button 
                    type="submit" 
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                </form>
                <div className="login-footer">
                    <p>
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                setShowRecuperarModal(true);
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </p>
                </div>

                <div className="register-section">
                    <p>
                        ¿No tienes cuenta?{' '}
                        <a 
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/register');
                            }}
                        >
                            Regístrate
                        </a>
                    </p>
                </div>
            </div>

            <RecuperarPasswordModal 
                isOpen={showRecuperarModal}
                onClose={() => setShowRecuperarModal(false)}
            />
        </div>
    )
};

export default Login