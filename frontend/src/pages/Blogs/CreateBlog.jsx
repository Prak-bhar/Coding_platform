import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CreateBlog({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
    return (
      <div className="p-8 text-center text-red-500 bg-gray-900 min-h-screen">
        Unauthorized access. Only faculty and admins can post blogs.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert('Title and content are required');
    setSubmitting(true);
    try {
      const res = await api.createBlog(user.token, { title, content });
      navigate(`/blogs/${res.blog.id}`);
    } catch (err) {
      alert('Failed to create blog post');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Create New Blog Post</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
        <div>
          <label className="block text-gray-400 mb-2 font-medium">Title</label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Engaging blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2 font-medium">Content</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-64 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              submitting ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 transition-colors'
            }`}
          >
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
