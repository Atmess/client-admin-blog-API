import { useState, useEffect } from 'react';

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 👈 New state to track the active status filter tab ('ALL', 'ACTIVE', 'FLAGGED', 'BANNED')
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all users on mount
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user list. Are you an admin?');

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle status update (BAN, FLAG, ACTIVE)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/userstatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update user status');
      }

      // Update state locally so the UI updates instantly without refetching
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter users based on search query AND the selected status filter tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || (u.status || 'ACTIVE') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen md:w-[60%] bg-slate-500 text-slate-100 p-6 sm:p-12 space-y-8">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-slate-100">
        
        {/* Header & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">User Management</h1>
            <p className="text-sm text-slate-400 mt-1">View, search, and manage platform user statuses.</p>
          </div>

          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-500 w-full sm:w-80"
          />
        </div>

        {/* 👈 Status Filter Buttons (All, Active, Flagged, Banned) */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['ALL', 'ACTIVE', 'FLAGGED', 'BANNED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error / Loading / Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl animate-pulse h-16"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-lg">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-700/20 transition">
                      
                      {/* User Info */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-300">{u.username[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-medium text-white truncate">{u.name || 'No Name'}</div>
                          <div className="text-xs text-blue-400 font-mono">@{u.username}</div>
                          <div className="text-xs text-slate-400 truncate">{u.email}</div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.role === 'ADMIN' ? 'bg-purple-900/40 border border-purple-500 text-purple-300' : 'bg-slate-700/40 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          (u.status || 'ACTIVE') === 'ACTIVE' 
                            ? 'bg-emerald-900/40 border border-emerald-500/50 text-emerald-300' 
                            : u.status === 'FLAGGED' 
                            ? 'bg-amber-900/40 border border-amber-500/50 text-amber-300' 
                            : 'bg-red-900/40 border border-red-500/50 text-red-300'
                        }`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      {u.role === "ADMIN" ? (
                        <td className="p-4 text-right space-x-2"></td>
                      ) : (
                        <td className="p-4 text-right space-x-2">
                          {u.status !== 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                              Activate
                            </button>
                          ) : null}

                          {u.status !== 'FLAGGED' ? (
                            <button
                              onClick={() => handleStatusChange(u.id, 'FLAGGED')}
                              className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                              Flag
                            </button>
                          ) : null}

                          {u.status !== 'BANNED' ? (
                            <button
                              onClick={() => handleStatusChange(u.id, 'BANNED')}
                              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                              Ban
                            </button>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}