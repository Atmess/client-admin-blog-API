import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stream from '../assets/picture/800px-LiveTwins.png';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/picture/image1.png'

export default function Home() {

  const {user} = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6); // Starts showing 6 posts
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };
  // Fetch published blog posts on component mount
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
        console.error('Error fetching home posts:', err);
        setError('Unable to load blog posts right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  const handlePromote = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/api/admin/promote', {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (response.ok) {
    // 1. Save the new token to localStorage
    localStorage.setItem('token', data.token);
    
    // 2. Update your AuthContext state so the app knows instantly
    updateUser(data.user); 
    
    alert(data.message);
  }
};

  return (
   <div>

      
      {/* HERO SECTION */}
      <header className="relative bg-gradient-to-b from-slate-800/160 to-slate-900/180 border-b border-slate-800 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Insights, Stories & <span className="text-blue-500">Code.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            A modern publishing platform for software developers and creators. Read the latest tutorials or share your own thoughts.
          </p>

          {/* Dynamic CTA Buttons based on Auth State */}
          <div className="flex column">
      <img src={stream} alt="stream" width={800} height={450} />
    </div>
          <div className="flex justify-center gap-4 pt-4">
            
            {user ? (
              <>
                <Link
                  to="/create-post"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition"
                >
                  Write a Post
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-6 py-3 rounded-lg transition"
                >
                  Go to Dashboard
                </Link>
                <button onClick={()=>{handlePromote() }}>Test</button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-6 py-3 rounded-lg transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* RECENT POSTS FEED */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Latest Articles</h2>
          {user?.role === 'ADMIN' && (
            <span className="text-xs bg-purple-900/60 text-purple-300 border border-purple-500/50 px-3 py-1 rounded-full">
              Admin View Mode
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-800/50 border border-slate-800 p-6 rounded-xl animate-pulse h-48">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg mb-4">No published articles found yet.</p>
            {user && (
              <Link to="/create-post" className="text-blue-400 hover:underline font-medium">
                Be the first to publish a post &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {posts.slice(0, visibleCount).map((post) => (
      <article
        key={post.id}
        className="bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-6 transition flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden"
      > 
        <div>
          {/* Optional Image Thumbnail from post.files */}
          
          {post.files && post.files.length > 0 ? (
            <div className="mb-4 -mx-6 -mt-6">
              <img 
                src={post.files[0].url } 
                alt={post.files[0].name || post.title} 
                className="w-full h-48 object-cover border-b border-slate-700/60"
              />
            </div>
          ):( <img 
    src={logo} 
    alt={post.title} 
    className="w-full h-48 object-cover" // Add your preferred styling for the logo placeholder
  />) }
        
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
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-500 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Blog API. Built with Express, Prisma, & React.</p>
      </footer>
    </div>
  );
}