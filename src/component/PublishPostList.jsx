import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import PostCard from './PostCard'; // Import your postcard component

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6); // Starts showing 6 posts
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };  


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

 // 5. DELETE POST
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ||'Failed to delete post' );

      console.log(data)
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };




  // Fetch all published posts on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
      const response = await fetch('http://localhost:8080/api/post/getAllPublish', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        console.log(data)
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on the search query (matching title or content)
  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className=" min-h-screen w-full md:w-[60%] bg-slate-500 text-slate-100 p-6 sm:p-12  text-center py-20 text-slate-400">Loading posts...</div>;
  if (error) return <div className=" min-h-screen w-full md:w-[60%] bg-slate-500 text-slate-100 p-6 sm:p-12 text-center py-20 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen w-full md:w-[60%] bg-slate-500 text-slate-100 p-6 sm:p-12">
      <div className="w-full md:w-[70%] mx-auto space-y-8">
        
        {/* ================= HEADER & SEARCH SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Published Articles</h1>
            <p className="text-slate-400 text-sm mt-1">Explore thoughts, tutorials, and updates.</p>
          </div>

          {/* Search Bar Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
        {/* ================= END HEADER ================= */}

        {/* ================= POSTS GRID / LIST ================= */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              {searchQuery ? 'No posts found matching your search.' : 'No posts published yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.slice(0, visibleCount).map((post) => (
      <article
        key={post.id}
        className="bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-6 transition flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden"
      > 
        <div>
          {/* Optional Image Thumbnail from post.files */}
          {post.files && post.files.length > 0 && (
            <div className="mb-4 -mx-6 -mt-6">
              <img 
                src={post.files[0].url} 
                alt={post.files[0].name || post.title} 
                className="w-full h-48 object-cover border-b border-slate-700/60"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>By {post.author?.username || 'Unknown'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-blue-400">
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
          
          <p className="text-slate-400 text-sm line-clamp-3 mb-4">
            {post.content}
          </p>
        </div>

       <div> 
        <Link
          to={`/posts/${post.id}`}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
        >
          Read full article &rarr;
        </Link>                 <div className="flex justify-end items-center pt-3 mt-3 border-t border-slate-700/40">
                  <div className="relative">
                    {/* Clickable 3-Dot Button */}
                    <button 
                      onClick={() => setActiveDropdownId(activeDropdownId === post.id ? null : post.id)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center focus:outline-none"
                      title="More options"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                   {/* 👈 DROPUP MENU CONTAINER */}
                    {activeDropdownId === post.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                        


                        <button
                          onClick={() => {
                            handleStatusChange(post.id,'FLAGGED')
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-lg transition font-medium"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Flag post 
                        </button>

                        <div className="border-t border-slate-700/60 my-1"></div>

                        <button
                          onClick={() => {
                            handleDeletePost(post.id)
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>

                      </div>
                    )}
                  </div>
                </div> 
                 </div>
      </article>
    ))}
            </div>
            
          )}
            {visibleCount < posts.length && (
            <button 
              onClick={handleLoadMore} 
              className="load-more-btn mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Load More ({posts.length - visibleCount} remaining)
            </button>
          )}
        </div>
        {/* ================= END POSTS ================= */}

      </div>
    </div>
  );
}