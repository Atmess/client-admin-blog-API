import { useState, useEffect } from 'react';


export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('token');
  

    // 1. FETCH POSTS DEPENDING ON ACTIVE TAB

  // 👈 New state to track the active status filter tab ('ALL', 'ACTIVE', 'FLAGGED', 'BANNED')
  const [postFilter, setPostFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'FLAGGED' | 'DRAFTS'

  // Fetch all users on mount
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/admin/posts', {
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
  const handleStatusChange = async (PostId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${PostId}/userstatus`, {
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
      setPosts((prevUsers) =>
        prevUsers.map((u) => (u.id === PostId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };


  // Filter the full list right inside the component
const filteredPosts = posts.filter((p) => {
  if (postFilter === 'PUBLISHED') return p.published === true && p.status !== 'FLAGGED';
  if (postFilter === 'FLAGGED') return p.status === 'FLAGGED';
  if (postFilter === 'DRAFTS') return p.published === false;
  return true; // 'ALL' shows everything
});


  return (
    <div className=" text-slate-100 p-6 sm:p-12 space-y-8">

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
          {['ALL','PUBLISHED', 'DRAFTS', 'FLAGGED'].map((status) => (
            <button
              key={status}
              onClick={() => setPostFilter(status)}
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
        ) : filteredPosts.length === 0 ? (
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
                  {filteredPosts.map((post) => ( <div
                key={post.id}
                className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                {/* Left Section: Text Content & Optional Image Thumbnail */}
                <div className="flex items-start gap-4 max-w-2xl">
                  {post.files && post.files.length > 0 && (
                    <div className="shrink-0 flex gap-2">
                      
                        <img 
                          src={post.files[0].url} 
                          alt={post.files.name} 
                          className="h-20 w-20 rounded-lg object-cover border border-slate-700" 
                        />
                      
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                    <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-slate-500">
                      Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div></div>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}