import { useState, useEffect } from 'react';
import logo from '../assets/picture/image1.png'


export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [postFilter, setPostFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFTS' | 'FLAGGED'
  
  const token = localStorage.getItem('token');

  // Fetch all posts on mount
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch posts list. Are you an admin?');

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post status update (e.g. flagging or unpublishing)
  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/posts/${postId}/poststatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus, 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update post status');
      }

      const result = await response.json();

      // Update state locally
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? { ...p, ...result.post } : p))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to permanently remove this post?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter posts based on search query AND active status filter tab
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author?.username && p.author.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (postFilter === 'PUBLISHED') matchesFilter = p.published === true && p.status !== 'FLAGGED';
    if (postFilter === 'DRAFTS') matchesFilter = p.published === false;
    if (postFilter === 'FLAGGED') matchesFilter = p.status === 'FLAGGED';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="text-slate-100 p-6 sm:p-12 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Post Management</h1>
            <p className="text-sm text-slate-400 mt-1">Review, flag, unpublish, or remove platform posts.</p>
          </div>

          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-500 w-full sm:w-80"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['ALL', 'PUBLISHED', 'DRAFTS', 'FLAGGED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setPostFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                postFilter === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {tab}
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
            <p className="text-slate-400 text-lg">No posts found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Left: Thumbnail & Post Details */}
                <div className="flex items-start gap-4 flex-1">
                  {post.files && post.files.length > 0 ? (
                              
                    <img 
                                  src={post.files[0].url } 
                                  alt={post.files[0].name || post.title} 
                                  className="h-20 w-20 rounded-xl object-cover border border-slate-700 shrink-0" 
                                />
                              
                            ):( <img 
                      src={logo} 
                      alt={post.title} 
                      className="h-20 w-20 rounded-xl object-cover border border-slate-700 shrink-0"  // Add your preferred styling for the logo placeholder
                    />) }
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{post.title}</h2>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                        post.status === 'FLAGGED'
                          ? 'bg-amber-900/40 border border-amber-500/50 text-amber-300'
                          : post.published
                          ? 'bg-emerald-900/40 border border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-700/40 text-slate-300'
                      }`}>
                        {post.status === 'FLAGGED' ? 'FLAGGED' : post.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                      <span>By @{post.author?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Admin Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {post.status !== 'FLAGGED' ? (
                    <button
                      onClick={() => handleStatusChange(post.id, 'FLAGGED')}
                      className="px-3.5 py-2 bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      Flag & Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(post.id, 'GOOD')}
                      className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3.5 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}