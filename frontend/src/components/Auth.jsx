import React, { useState } from 'react';
import '../styles/components/Auth.css';

const Auth = ({ onLogin, onRegister, onClose, isOpen }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при вводе
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
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має бути не менше 6 символів';
    }

    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Підтвердіть пароль';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Паролі не співпадають';
      }

      if (!formData.firstName) {
        newErrors.firstName = 'Ім\'я обов\'язкове';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Прізвище обов\'язкове';
      }

      if (!formData.phone) {
        newErrors.phone = 'Телефон обов\'язковий';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        await onLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        await onRegister({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
      }
      onClose();
    } catch (error) {
      setErrors({
        submit: error.message || 'Виникла помилка'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        {/* Заголовок */}
        <div className="auth-header">
          <h2 className="auth-title">
            {isLoginMode ? '🔐 Вхід до BloomShine' : '🌸 Реєстрація в BloomShine'}
          </h2>
          <button className="auth-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Форма */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Ім'я</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Прізвище</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+38 (0__) ___-__-__"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Підтвердіть пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Завантаження...' : (
              isLoginMode ? '🚀 Увійти' : '✨ Зареєструватися'
            )}
          </button>
        </form>

        {/* Переключение режима */}
        <div className="auth-switch">
          <p>
            {isLoginMode ? 'Ще не маєте акаунт?' : 'Вже маєте акаунт?'}
            <button 
              className="switch-btn"
              onClick={switchMode}
            >
              {isLoginMode ? 'Зареєструватися' : 'Увійти'}
            </button>
          </p>
        </div>

        {/* Социальные сети */}
        <div className="social-auth">
          <div className="divider">
            <span>або</span>
          </div>
          <div className="social-buttons">
            <button className="social-btn google">
              🌐 Google
            </button>
            <button className="social-btn facebook">
              📘 Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;