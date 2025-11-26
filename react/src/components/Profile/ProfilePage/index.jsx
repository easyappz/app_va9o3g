import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getProfile, updateProfile } from '../../../api/profile';
import './styles.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);
      setNewUsername(data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    
    if (newUsername === profile.username) {
      setIsEditing(false);
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 150) {
      setUpdateError('Имя пользователя должно содержать от 3 до 150 символов');
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setSuccessMessage(null);
      const data = await updateProfile({ username: newUsername });
      setProfile(data);
      setIsEditing(false);
      setSuccessMessage('Имя пользователя успешно обновлено');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Ошибка обновления профиля');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(profile.username);
    setIsEditing(false);
    setUpdateError(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile-page" data-easytag="id1-react/src/components/Profile/ProfilePage/index.jsx">
        <div className="profile-container">
          <p className="loading-text">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page" data-easytag="id1-react/src/components/Profile/ProfilePage/index.jsx">
        <div className="profile-container">
          <div className="error-message">{error}</div>
          <button onClick={fetchProfile} className="btn btn-secondary">Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page" data-easytag="id1-react/src/components/Profile/ProfilePage/index.jsx">
      <div className="profile-container">
        <h1 className="profile-title">Профиль</h1>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="profile-info">
          <div className="info-group">
            <label className="info-label">Имя пользователя</label>
            {isEditing ? (
              <form onSubmit={handleUpdateUsername} className="edit-form">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="input-field"
                  placeholder="Введите новое имя пользователя"
                  minLength={3}
                  maxLength={150}
                  required
                  disabled={updateLoading}
                />
                {updateError && <div className="error-message">{updateError}</div>}
                <div className="edit-buttons">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="btn btn-secondary"
                    disabled={updateLoading}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-value-container">
                <span className="info-value">{profile?.username}</span>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn-edit"
                >
                  Изменить
                </button>
              </div>
            )}
          </div>

          <div className="info-group">
            <label className="info-label">Дата регистрации</label>
            <span className="info-value">
              {profile?.created_at ? formatDate(profile.created_at) : 'Не указана'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate('/chat')} className="btn btn-secondary">
            Вернуться в чат
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
