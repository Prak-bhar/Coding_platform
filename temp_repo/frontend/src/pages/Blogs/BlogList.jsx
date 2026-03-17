import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function BlogList({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.fetchBlogs();
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      if (!user) return alert('Please login to like blogs');
      await api.likeBlog(user.token, blogId);
      // Optimistic update
      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, likes: (b.likes || 0) + 1 } : b))
      );
    } catch (err) {
      alert('Failed to like blog');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading blogs...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Campus Blogs
        </h1>
        {user && (user.role === 'faculty' || user.role === 'admin') && (
          <Link
            to="/blogs/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            + Create Post
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
          No blogs published yet. Add the first one!
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl p-6 shadow-lg hover:border-gray-600 transition-all">
              <Link to={`/blogs/${blog.id}`} className="block">
                <h2 className="text-2xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">
                  {blog.title}
                </h2>
              </Link>
              <div className="flex items-center text-sm text-gray-400 mb-4 space-x-2">
                <span className="bg-gray-700 px-2 py-1 rounded-md text-gray-200">
                  {blog.author_name} ({blog.author_role})
                </span>
                <span>•</span>
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 line-clamp-3 mb-4 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </p>
              <div className="flex items-center space-x-4 border-t border-gray-700/50 pt-4 mt-4">
                <button
                  onClick={() => handleLike(blog.id)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <span>❤️</span>
                  <span className="font-medium">{blog.likes || 0}</span>
                </button>
                <Link to={`/blogs/${blog.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Read more &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
