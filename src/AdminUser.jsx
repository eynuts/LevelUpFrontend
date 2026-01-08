import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, update, onValue } from 'firebase/database';
import { 
  UserCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Mail, 
  UserCog,
  ChevronRight
} from 'lucide-react';
import './AdminUser.css';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Load users from Firebase
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userList = Object.keys(data).map((key) => ({ uid: key, ...data[key] }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Toggle user admin role
  const toggleAdmin = async (uid, currentRole) => {
    try {
      await update(ref(db, `users/${uid}`), { role: currentRole === 'admin' ? 'user' : 'admin' });
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="user-section">
      {/* Header with Search */}
      <div className="user-header">
        <div className="header-info">
          <h2>User Management</h2>
          <p>You have {users.length} total users registered.</p>
        </div>
        
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User Table Card */}
      <div className="user-card">
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Contact Info</th>
                <th>Access Level</th>
                <th className="text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.uid} className={u.role === 'admin' ? 'admin-row' : ''}>
                  <td>
                    <div className="profile-cell">
                      <div className="avatar-wrapper">
                        <UserCircle size={32} strokeWidth={1.5} />
                      </div>
                      <div className="name-info">
                        <span className="user-name">{u.name || 'No Name'}</span>
                        <span className="user-uid">UID: {u.uid.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`role-pill ${u.role}`}>
                      {u.role === 'admin' ? <ShieldCheck size={14} /> : <UserCog size={14} />}
                      {u.role}
                    </div>
                  </td>
                  <td className="text-right">
                    <button 
                      className={`btn-role-toggle ${u.role === 'admin' ? 'is-admin' : ''}`}
                      onClick={() => toggleAdmin(u.uid, u.role)}
                    >
                      {u.role === 'admin' ? (
                        <>
                          <ShieldAlert size={16} />
                          <span>Revoke Admin</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Make Admin</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminUser;