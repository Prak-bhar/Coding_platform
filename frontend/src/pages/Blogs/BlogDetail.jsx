import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function BlogDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const data = await api.fetchBlogById(id);
      setBlog(data.blog);
    } catch (err) {
      console.error(err);
      alert('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.addBlogComment(user.token, id, commentText);
      setBlog({
        ...blog,
        comments: [...(blog.comments || []), res.comment]
      });
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      if (!user) return alert('Please login to like');
      await api.likeBlog(user.token, id);
      setBlog({ ...blog, likes: (blog.likes || 0) + 1 });
    } catch (err) {
      alert('Failed to like blog');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading blog...</div>;
  if (!blog) return <div className="p-8 text-center text-red-400">Blog not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/blogs" className="text-blue-400 hover:text-blue-300 mb-6 inline-block font-medium">
        &larr; Back to Blogs
      </Link>
      
      <article className="bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700/50 mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">{blog.title}</h1>
        
        <div className="flex items-center space-x-3 mb-8 text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg inline-flex">
          <div className="flex flex-col">
            <span className="text-gray-200 font-semibold">{blog.author_name}</span>
            <span className="text-xs uppercase tracking-wider text-blue-400">{blog.author_role}</span>
          </div>
          <span className="text-gray-600">|</span>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
          {blog.content}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-full text-white"
          >
            <span>❤️</span>
            <span className="font-medium">{blog.likes || 0} Likes</span>
          </button>
        </div>
      </article>

      {/* COMMENTS SECTION */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-6">Discussion ({blog.comments?.length || 0})</h3>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8 relative">
            <textarea
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-4 focus:outline-none focus:border-blue-500 transition-colors"
              rows="3"
              placeholder="Add your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-lg font-medium text-white ${
                  submitting ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 transition-colors'
                }`}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-800/50 text-gray-400 rounded-lg border border-gray-700 text-center">
            Please <Link to="/login" className="text-blue-400 hover:underline">log in</Link> to join the discussion.
          </div>
        )}

        <div className="space-y-4">
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg flex space-x-4 border border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-white shadow-md">
                  {comment.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-gray-200">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to start the discussion!</p>
          )}
        </div>
      </section>
    </div>
  );
}
